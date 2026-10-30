"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Editor, EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

import styles from "./RichTextEditor.module.scss";

type RichTextValue = JSONContent | null;

interface RichTextEditorProps {
  value: RichTextValue;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: JSONContent) => void;
  onUploadImage: (file: File) => Promise<string>;
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
const PROXY_SAFE_IMAGE_SIZE = 800 * 1024;
const MAX_IMAGE_DIMENSION = 2400;

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("The image could not be prepared for upload.")),
      "image/webp",
      quality,
    );
  });

const prepareImageForUpload = async (file: File): Promise<File> => {
  if (file.size <= PROXY_SAFE_IMAGE_SIZE) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = document.createElement("img");
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("The selected image could not be opened."));
      element.src = objectUrl;
    });

    let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    let quality = 0.88;
    let result: Blob | null = null;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("The browser could not prepare the image for upload.");

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      result = await canvasToBlob(canvas, quality);
      if (result.size <= PROXY_SAFE_IMAGE_SIZE) break;

      if (quality > 0.5) quality -= 0.1;
      else scale *= 0.8;
    }

    if (!result || result.size > PROXY_SAFE_IMAGE_SIZE) {
      throw new Error("The image is too large to upload. Please choose a smaller image.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([result], `${baseName}.webp`, { type: "image/webp", lastModified: file.lastModified });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const toEditorDoc = (value: RichTextValue) => {
  if (!value || typeof value !== "object" || value.type !== "doc") return EMPTY_DOC;
  return value;
};

export function RichTextEditor({ value, disabled = false, placeholder, onChange, onUploadImage }: RichTextEditorProps) {
  const initialDoc = useMemo(() => toEditorDoc(value), [value]);
  const isSyncingRef = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadHandlerRef = useRef(onUploadImage);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    uploadHandlerRef.current = onUploadImage;
  }, [onUploadImage]);

  const insertImages = useCallback(async (files: File[], position?: number) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0 || !editorRef.current) return;

    setUploadError("");
    setUploadingCount((count) => count + images.length);
    let insertAt = position;

    for (const file of images) {
      try {
        const preparedFile = await prepareImageForUpload(file);
        const imageUrl = await uploadHandlerRef.current(preparedFile);
        const activeEditor = editorRef.current;
        if (!activeEditor) return;
        const chain = activeEditor.chain().focus();
        if (typeof insertAt === "number") chain.setTextSelection(insertAt);
        chain.setImage({ src: imageUrl, alt: file.name }).createParagraphNear().run();
        insertAt = undefined;
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Image upload failed. Please try again.");
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        underline: {},
      }),
      Image.configure({ allowBase64: false, HTMLAttributes: { loading: "lazy" } }),
    ],
    content: initialDoc,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: styles.editorInner, "data-placeholder": placeholder || "" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (!files.some((file) => file.type.startsWith("image/"))) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (!files.some((file) => file.type.startsWith("image/"))) return false;
        event.preventDefault();
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void insertImages(files, coordinates?.pos);
        return true;
      },
    },
    onUpdate({ editor: activeEditor }) {
      if (!isSyncingRef.current) onChange(activeEditor.getJSON());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      if (editorRef.current === editor) editorRef.current = null;
    };
  }, [editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const nextDoc = toEditorDoc(value);
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(nextDoc)) return;
    isSyncingRef.current = true;
    editor.commands.setContent(nextDoc, { emitUpdate: false });
    isSyncingRef.current = false;
  }, [editor, value]);

  const handleLink = useCallback(() => {
    if (!editor || disabled) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [disabled, editor]);

  if (!editor) return null;
  const uploadDisabled = disabled || uploadingCount > 0;

  return (
    <div className={styles.editorRoot}>
      <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
        <button type="button" title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} disabled={disabled}>P</button>
        <button type="button" title="Heading 2" className={editor.isActive("heading", { level: 2 }) ? styles.active : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled}>H2</button>
        <button type="button" title="Heading 3" className={editor.isActive("heading", { level: 3 }) ? styles.active : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={disabled}>H3</button>
        <button type="button" title="Bold" className={editor.isActive("bold") ? styles.active : ""} onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled}><strong>B</strong></button>
        <button type="button" title="Italic" className={editor.isActive("italic") ? styles.active : ""} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}><em>I</em></button>
        <button type="button" title="Underline" className={editor.isActive("underline") ? styles.active : ""} onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={disabled}><u>U</u></button>
        <button type="button" title="Bulleted list" className={editor.isActive("bulletList") ? styles.active : ""} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>• List</button>
        <button type="button" title="Numbered list" className={editor.isActive("orderedList") ? styles.active : ""} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>1. List</button>
        <button type="button" title="Quote" className={editor.isActive("blockquote") ? styles.active : ""} onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={disabled}>“ Quote</button>
        <button type="button" title="Link" className={editor.isActive("link") ? styles.active : ""} onClick={handleLink} disabled={disabled}>Link</button>
        <button type="button" title="Horizontal line" onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled}>—</button>
        <button type="button" title="Insert image" onClick={() => fileInputRef.current?.click()} disabled={uploadDisabled}>{uploadingCount > 0 ? "Uploading…" : "Image"}</button>
        <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()}>↶</button>
        <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()}>↷</button>
        <input ref={fileInputRef} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => {
          void insertImages(Array.from(event.target.files || []));
          event.target.value = "";
        }} />
      </div>

      {uploadError ? <div className={styles.uploadError} role="alert">{uploadError}</div> : null}
      <EditorContent editor={editor} className={styles.editorContent} />
      <div className={styles.hint}>Images can also be pasted from the clipboard or dragged into the editor.</div>
    </div>
  );
}
