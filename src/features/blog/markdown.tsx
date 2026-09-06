import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { allowedMediaURL, safeLinkURL } from "./urls";

export function Markdown({ content, publicMediaBase }: { content: string; publicMediaBase: string }) {
  return (
    <div className="blog-markdown">
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]}
        urlTransform={(url, key) => key === "src" ? allowedMediaURL(url, publicMediaBase) : safeLinkURL(url)}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => href ? <a href={href} rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
          img: ({ src, alt }) => {
            const safeSrc = typeof src === "string" ? allowedMediaURL(src, publicMediaBase) : undefined;
            return safeSrc && alt ? <Image src={safeSrc} alt={alt} width={1200} height={800} sizes="(max-width: 800px) 100vw, 760px" className="blog-inline-image" /> : null;
          },
          table: ({ children }) => <div className="blog-table" tabIndex={0} role="region" aria-label="Tabla desplazable"><table>{children}</table></div>,
        }}
      >{content}</ReactMarkdown>
    </div>
  );
}
