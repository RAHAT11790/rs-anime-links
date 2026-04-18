import { Article, rotatingArticles, todaysArticle } from "@/data/articles";
import { Clock, Eye } from "lucide-react";

export function FeaturedArticle() {
  const a = todaysArticle();
  const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  return (
    <article className="bg-card rounded-2xl border-2 shadow-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-brand-red text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
        <span>📰 Article of the Day</span>
        <span className="opacity-80">{today}</span>
      </div>
      <div className="p-4 md:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">{a.category}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 4 min read</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Trending</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold leading-tight">
          {a.emoji} {a.title}
        </h2>
        <p className="text-sm text-muted-foreground italic">{a.excerpt}</p>
        <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
          {a.body.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function MiniArticle({ article }: { article: Article }) {
  return (
    <article className="bg-card rounded-xl border shadow-card p-4 space-y-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
        <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-bold">{article.category}</span>
        <span className="text-muted-foreground">3 min read</span>
      </div>
      <h3 className="font-bold text-base leading-snug">
        {article.emoji} {article.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
      <p className="text-sm leading-relaxed text-foreground/85 line-clamp-3">{article.body[0]}</p>
    </article>
  );
}

export function ArticleGrid({ count = 3, seed = 0 }: { count?: number; seed?: number }) {
  const items = rotatingArticles(count, seed);
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((a) => (
        <MiniArticle key={a.id + "-" + seed} article={a} />
      ))}
    </div>
  );
}
