"use client";

import { Button, useField, useListDrawer } from "@payloadcms/ui";
import type { TextareaFieldClientComponent } from "payload";
import { useRef, useState } from "react";
import { markdownImage } from "../../features/blog/editorial";

const mediaCollections: ["media"] = ["media"];
const mediaFilter = { media: { mimeType: { contains: "image/" } } };

export const MarkdownField: TextareaFieldClientComponent = ({ path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path });
  const textarea = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: 0, end: 0 });
  const [message, setMessage] = useState("");
  const [MediaDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: mediaCollections, selectedCollection: "media", uploads: true,
    filterOptions: mediaFilter,
  });

  return (
    <div className="field-type textarea markdown-field">
      <label htmlFor={`field-${path}`} className="field-label">Contenido Markdown *</label>
      <Button type="button" buttonStyle="secondary" size="small" disabled={Boolean(readOnly)} onClick={() => {
        selection.current = { start: textarea.current?.selectionStart ?? (value ?? "").length, end: textarea.current?.selectionEnd ?? (value ?? "").length };
        openDrawer();
      }}>Insertar Media</Button>
      <textarea
        id={`field-${path}`} name={path} ref={textarea} value={value ?? ""} rows={20}
        readOnly={Boolean(readOnly)} aria-invalid={showError} aria-describedby={`${path}-help`}
        onChange={(event) => setValue(event.target.value)}
      />
      <p id={`${path}-help`}>Markdown real: encabezados, listas, enlaces y código. Inserta una imagen existente o crea una desde el selector.</p>
      {showError && <p role="alert">{errorMessage}</p>}
      <p role="status">{message}</p>
      <MediaDrawer allowCreate onSelect={({ doc }) => {
        if (typeof doc.url !== "string" || typeof doc.alt !== "string" || !doc.mimeType?.startsWith("image/")) {
          setMessage("Selecciona una imagen con URL pública y texto alternativo.");
          return;
        }
        const insertion = `\n\n${markdownImage(doc.alt, doc.url)}\n\n`;
        setValue((value ?? "").slice(0, selection.current.start) + insertion + (value ?? "").slice(selection.current.end));
        closeDrawer();
        setMessage("Imagen insertada. Su URL pública está en el Markdown.");
        requestAnimationFrame(() => textarea.current?.focus());
      }} />
    </div>
  );
};
