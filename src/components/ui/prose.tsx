import { cn } from "@/lib/utils";

/**
 * Admin panelinden girilen Markdown benzeri metni güvenli biçimde render eder.
 * Bilerek HTML çalıştırmıyoruz: panele yazılan içerik hiçbir koşulda
 * script'e dönüşmesin. Desteklenen: paragraf, ## başlık, - liste, **kalın**.
 */
export function Prose({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = parseBlocks(content);

  return (
    <div className={cn("grid gap-5 text-[1.0625rem] leading-relaxed text-navy", className)}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2
              key={i}
              className="mt-3 font-head text-xl font-bold text-navy md:text-2xl"
            >
              {inline(block.text)}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={i} className="grid gap-2.5 pl-1">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand"
                    aria-hidden
                  />
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return <p key={i}>{inline(block.text)}</p>;
      })}
    </div>
  );
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push({ type: "heading", text: line.slice(3) });
      continue;
    }

    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

/** **kalın** vurgularını React düğümüne çevirir. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-navy">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}
