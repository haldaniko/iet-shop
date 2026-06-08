"use client";

import {
    FormEvent,
    startTransition,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import {
    buildChatWebSocketUrl,
    ChatMessage,
    ChatSocketEvent,
    getChatMessages,
    initChatSession,
    sendChatMessage,
} from "@/lib/chat";

import { useTranslate } from "@/lib/useTranslate";
import { translations, ChatTranslations } from "../ChatWindow/translations";
import Image from "next/image";
import georgeAvatar from "@/assets/emojii/GeorgeAvatar.png";
import { useLanguage } from "@/lib/LanguageContext";

import styles from "./ChatWidget.module.scss";

type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "error";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;

const sortMessages = (messages: ChatMessage[]) =>
    [...messages].sort(
        (left, right) =>
            new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
    );

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]) => {
    const messageMap = new Map<number, ChatMessage>();

    for (const message of current) {
        messageMap.set(message.id, message);
    }

    for (const message of incoming) {
        messageMap.set(message.id, message);
    }

    return sortMessages(Array.from(messageMap.values()));
};

const formatTime = (value: string, lang: string) =>
    new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-GB', {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(value));


export function ChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { t } = useTranslate<ChatTranslations>(translations);
    const { lang } = useLanguage();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [status, setStatus] = useState<ConnectionState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const hasConnectedRef = useRef(false);
    const disposedRef = useRef(false);
    const sessionRecoverAttemptedRef = useRef(false);

    const syncMessages = useEffectEvent((incoming: ChatMessage[]) => {
        startTransition(() => {
            setMessages((current) => mergeMessages(current, incoming));
        });
    });

    const applySocketEvent = useEffectEvent((event: ChatSocketEvent) => {
        if (event.type === "chat.ready") {
            setSessionId(event.chat_session_id);
            return;
        }

        if (event.type === "chat.message") {
            syncMessages([event.message]);
            setError(null);
            return;
        }

        if (event.type === "chat.error") {
            if (event.code === "session_missing" && !sessionRecoverAttemptedRef.current) {
                sessionRecoverAttemptedRef.current = true;
                void bootstrapChat().catch(() => {
                    setStatus("error");
                    setError(t.errorInit);
                });
                return;
            }

            const detail =
                typeof event.detail === "string" ? event.detail : JSON.stringify(event.detail);
            setError(detail);
            setStatus("error");
        }
    });

    const resyncHistory = useEffectEvent(async () => {
        const freshMessages = await getChatMessages();
        syncMessages(freshMessages);
    });

    const scheduleReconnect = useEffectEvent(() => {
        if (disposedRef.current || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setStatus("error");
            return;
        }

        if (reconnectTimeoutRef.current !== null) {
            window.clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectAttemptsRef.current += 1;
        // Keep UI stable after first successful connect; reconnects happen in background.
        if (!hasConnectedRef.current) {
            setStatus("reconnecting");
        }
        reconnectTimeoutRef.current = window.setTimeout(() => {
            void openSocket();
        }, RECONNECT_DELAY_MS);
    });

    const openSocket = useEffectEvent(async () => {
        if (disposedRef.current) {
            return;
        }

        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.onmessage = null;
            socketRef.current.onerror = null;
            socketRef.current.close();
        }

        if (!hasConnectedRef.current) {
            setStatus(reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting");
        }

        const socket = new WebSocket(buildChatWebSocketUrl());
        socketRef.current = socket;

        socket.onopen = () => {
            reconnectAttemptsRef.current = 0;
            hasConnectedRef.current = true;
            sessionRecoverAttemptedRef.current = false;
            setStatus("connected");
            setError(null);
            void resyncHistory().catch(() => {
                setError(t.errorSync);
            });
        };

        socket.onmessage = (rawEvent) => {
            try {
                const event = JSON.parse(rawEvent.data) as ChatSocketEvent;
                applySocketEvent(event);
            } catch {
                setError(t.errorParse);
            }
        };

        socket.onclose = () => {
            if (!disposedRef.current) {
                scheduleReconnect();
            }
        };

        socket.onerror = () => {
            setError(t.errorConnection);
            setStatus("error");
        };
    });

    const bootstrapChat = useEffectEvent(async () => {
        setStatus("connecting");
        const initialState = await initChatSession();
        setSessionId(initialState.id);
        syncMessages(initialState.messages);
        await openSocket();
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        disposedRef.current = false;
        void bootstrapChat().catch((bootstrapError) => {
            setStatus("error");
            setError(
                bootstrapError instanceof Error
                    ? bootstrapError.message
                    : t.errorInit,
            );
        });

        return () => {
            disposedRef.current = true;
            if (reconnectTimeoutRef.current !== null) {
                window.clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onmessage = null;
                socketRef.current.onerror = null;
                socketRef.current.close();
            }
        };
    }, []);

    const handleWrapperClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSend = async () => {
        const text = draft.trim();
        if (!text) {
            return;
        }

        setIsSending(true);
        setError(null);
        setDraft("");

        try {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "message", text }));
            } else {
                const createdMessage = await sendChatMessage(text);
                syncMessages([createdMessage]);
                const freshMessages = await getChatMessages();
                syncMessages(freshMessages);
            }
        } catch (sendError) {
            setDraft(text);
            setError(sendError instanceof Error ? sendError.message : t.errorSend);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen || !isMounted) return null;

    const widget = (
        <div className={styles.chatWindow}>
            <div className={styles.header}>
                <div className={styles.agentInfo}>
                    <div className={styles.avatarWrapper}>
                        <Image src={georgeAvatar} alt="George" fill className={styles.avatar} />
                    </div>
                    <div className={styles.textInfo}>
                        <span className={styles.name}>{t.title}</span>
                        <span className={styles.subtext}>{t.subTitle}</span>
                        {status === 'error' && (
                            <span
                                className={styles.statusError}
                            >
                                {t.networkError}
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
                    X
                </button>
            </div>

            <div className={styles.content}>
                {messages.length === 0 ? (
                    <div className={styles.welcomeScreen}>
                        <h2 className={styles.welcomeTitle}>{t.welcomeTitle}</h2>
                        <p className={styles.welcomeText}>{t.welcomeText}</p>
                    </div>
                ) : (
                    <div className={styles.messagesList}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.messageItem} ${msg.sender_type === "user" ? styles.userMessage : styles.agentMessage
                                    }`}
                            >
                                <div className={styles.messageBubble}>{msg.text}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.inputContainer}>
                {error && <div className={styles.errorText} style={{ padding: '0 8px 8px', color: '#ff4d4f', fontSize: '12px' }}>{error}</div>}
                <div className={styles.inputWrapper} onClick={handleWrapperClick}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.input}
                        placeholder={t.inputPlaceholder}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                        id="chat-message-input"
                        name="message"
                    />
                    <button
                        className={`${styles.sendBtn} ${draft.trim() ? styles.active : ""}`}
                        onClick={handleSend}
                        disabled={!draft.trim() || isSending}
                    >
                        {isSending ? (
                            <span style={{ fontSize: '10px' }}>...</span>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 19V5M12 5L5 12M12 5L19 12"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(widget, document.body);
}