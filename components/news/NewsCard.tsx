import type { NewsArticle, NewsSource } from "@/lib/news";
import { FadeImage } from "./FadeImage";

const SOURCE_STYLES: Record<NewsSource, { label: string; tone: string }> = {
  "dev.to": { label: "DEV", tone: "bg-information-lighter text-information-dark" },
  medium: { label: "Medium", tone: "bg-feature-lighter text-feature-dark" },
};

export function NewsCard({ article }: { article: NewsArticle }) {
  const style = SOURCE_STYLES[article.source];
  const date = new Date(article.publishedAt);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-sky/40 hover:shadow-custom-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream-2">
        <FadeImage
          src={article.coverImage}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-pill px-2.5 py-1 text-label-2xs font-semibold ${style.tone}`}>
          {style.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 text-label-md leading-snug text-ink">{article.title}</h3>
        <p className="line-clamp-2 flex-1 text-paragraph-sm text-ink-2">{article.description}</p>
        <div className="mt-1 flex items-center justify-between gap-2 font-mono text-label-2xs text-muted">
          <span className="truncate">{article.author}</span>
          <span className="shrink-0">
            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {article.readingTimeMinutes ? ` · ${article.readingTimeMinutes} min` : ""}
          </span>
        </div>
      </div>
    </a>
  );
}