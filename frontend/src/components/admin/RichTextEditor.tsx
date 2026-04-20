"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

import styles from "./RichTextEditor.module.scss";

type RichTextValue = JSONContent | null;

interface RichTextEditorProps {
  value: RichTextValue;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: JSONContent) => void;
  onUploadImage: (file: File) => Promise<string>;
}

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const toEditorDoc = (value: RichTextValue) => {
  if (!value || typeof value !== "object") {
    return EMPTY_DOC;
  }
  if (value.type === "doc") {
    return value;
  }
  return EMPTY_DOC;
};

export function RichTextEditor({
  value,
  disabled = false,
  placeholder,
  onChange,
  onUploadImage,
}: RichTextEditorProps) {
  const initialDoc = useMemo(() => toEditorDoc(value), [value]);
  const isSyncingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        allowBase64: false,
      }),
    ],
    content: initialDoc,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.editorInner,
        "data-placeholder": placeholder || "",
      },
    },
    onUpdate({ editor: activeEditor }) {
      if (isSyncingRef.current) {
        return;
      }
      onChange(activeEditor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextDoc = toEditorDoc(value);
    const currentDoc = editor.getJSON();

    if (JSON.stringify(currentDoc) === JSON.stringify(nextDoc)) {
      return;
    }

    isSyncingRef.current = true;
    editor.commands.setContent(nextDoc, { emitUpdate: false });
    isSyncingRef.current = false;
  }, [editor, value]);

  const handleAddImage = useCallback(async () => {
    if (!editor || disabled) {
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      try {
        const imageUrl = await onUploadImage(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        // Errors are surfaced through the surrounding form.
      }
    };

    input.click();
  }, [disabled, editor, onUploadImage]);

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.editorRoot}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} disabled={disabled}>
          P
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={disabled}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled}>
          B
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}>
          I
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={disabled}>
          U
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>
          • List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>
          1. List
        </button>
        <button type="button" onClick={handleAddImage} disabled={disabled}>
          Image
        </button>
      </div>

      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
