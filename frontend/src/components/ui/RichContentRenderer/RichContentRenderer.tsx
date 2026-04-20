"use client";

import Image from "next/image";
import React from "react";

import styles from "./RichContentRenderer.module.scss";

type JsonNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
};

interface RichContentRendererProps {
  content?: unknown;
}

const asNodes = (value: unknown): JsonNode[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const doc = value as JsonNode;
  if (doc.type !== "doc" || !Array.isArray(doc.content)) {
    return [];
  }

  return doc.content;
};

const renderTextNode = (node: JsonNode, key: string) => {
  const baseText = node.text || "";
  let element: React.ReactNode = baseText;

  for (const mark of node.marks || []) {
    if (mark.type === "bold") {
      element = <strong key={`${key}-bold`}>{element}</strong>;
      continue;
    }

    if (mark.type === "italic") {
      element = <em key={`${key}-italic`}>{element}</em>;
      continue;
    }

    if (mark.type === "underline") {
      element = <u key={`${key}-underline`}>{element}</u>;
      continue;
    }

    if (mark.type === "strike") {
      element = <s key={`${key}-strike`}>{element}</s>;
      continue;
    }

    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
      element = (
        <a key={`${key}-link`} href={href} target="_blank" rel="noreferrer">
          {element}
        </a>
      );
    }
  }

  return <React.Fragment key={key}>{element}</React.Fragment>;
};

const renderInline = (nodes: JsonNode[] | undefined, keyPrefix: string): React.ReactNode[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "text") {
      return renderTextNode(node, key);
    }

    if (node.type === "hardBreak") {
      return <br key={key} />;
    }

    return null;
  });
};

const renderNode = (node: JsonNode, key: string): React.ReactNode => {
  if (node.type === "paragraph") {
    return <p key={key}>{renderInline(node.content, key)}</p>;
  }

  if (node.type === "heading") {
    const level = Number(node.attrs?.level || 2);
    if (level <= 1) {
      return <h1 key={key}>{renderInline(node.content, key)}</h1>;
    }
    if (level === 2) {
      return <h2 key={key}>{renderInline(node.content, key)}</h2>;
    }
    if (level === 3) {
      return <h3 key={key}>{renderInline(node.content, key)}</h3>;
    }
    return <h4 key={key}>{renderInline(node.content, key)}</h4>;
  }

  if (node.type === "bulletList") {
    return (
      <ul key={key}>
        {(node.content || []).map((child, index) => renderNode(child, `${key}-li-${index}`))}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol key={key}>
        {(node.content || []).map((child, index) => renderNode(child, `${key}-li-${index}`))}
      </ol>
    );
  }

  if (node.type === "listItem") {
    return <li key={key}>{(node.content || []).map((child, index) => renderNode(child, `${key}-${index}`))}</li>;
  }

  if (node.type === "blockquote") {
    return (
      <blockquote key={key}>
        {(node.content || []).map((child, index) => renderNode(child, `${key}-${index}`))}
      </blockquote>
    );
  }

  if (node.type === "horizontalRule") {
    return <hr key={key} />;
  }

  if (node.type === "image") {
    const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "Project image";

    if (!src) {
      return null;
    }

    return (
      <div key={key} className={styles.imageWrap}>
        <Image src={src} alt={alt} width={1200} height={700} className={styles.image} />
      </div>
    );
  }

  return null;
};

export function RichContentRenderer({ content }: RichContentRendererProps) {
  const nodes = asNodes(content);

  if (nodes.length === 0) {
    return null;
  }

  return <div className={styles.richContent}>{nodes.map((node, index) => renderNode(node, `node-${index}`))}</div>;
}
