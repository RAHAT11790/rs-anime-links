// 30 evergreen anime / tech / entertainment articles.
// One is rotated per day deterministically — so users see fresh content daily.

export type Article = {
  id: number;
  title: string;
  category: string;
  emoji: string;
  excerpt: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  { id: 1, category: "Anime", emoji: "🎬", title: "Top 10 Anime Series Releasing This Season",
    excerpt: "From dark fantasy to slice-of-life — the must-watch anime list every fan is talking about.",
    body: [
      "The new anime season is packed with adaptations of best-selling manga and original studio creations. From Mappa's much anticipated dark fantasy series to Kyoto Animation's heart-warming slice-of-life entry, there is something for every type of fan.",
      "Industry insiders predict that streaming numbers will break records this quarter, with Crunchyroll, Netflix and Prime Video all bidding aggressively for exclusive distribution rights. Studios are responding with bigger budgets and noticeably higher animation quality.",
      "Highlights include: a long-awaited sequel for one of the most popular shonen titles of the decade, a shocking villain arc in the most-watched isekai of the year, and an experimental seinen show that critics are already calling 'one of the most beautiful pieces of animation in years'.",
      "If you are new to anime, this is the perfect season to jump in — most of these new titles are designed to be welcoming to first-time viewers while still rewarding long-term fans.",
    ]},
  { id: 2, category: "Tech", emoji: "📱", title: "Smartphone Trends That Will Dominate Next Year",
    excerpt: "Foldables, AI cameras, and silicon-carbon batteries are reshaping the phone you'll buy next.",
    body: [
      "Smartphone makers are entering a new era. After years of incremental upgrades, we are finally seeing meaningful breakthroughs across hardware and software.",
      "Silicon-carbon batteries promise 30% more capacity in the same physical space, which means thinner phones with longer battery life. Several flagship Android phones already ship with this technology.",
      "On-device AI is the biggest shift since the multi-touch screen. Real-time translation, generative photo editing, and smart summaries all happen on the phone itself — no internet needed.",
      "Foldable phones are also finally becoming durable enough for everyday use, with new hinge designs that survive 500,000 folds in lab tests.",
    ]},
  { id: 3, category: "Entertainment", emoji: "🎮", title: "Why Free-to-Play Games Are Beating AAA Titles in 2026",
    excerpt: "Live-service free games now generate more revenue than $70 console blockbusters.",
    body: [
      "The gaming industry is in the middle of a tectonic shift. For the first time in history, the top three highest-grossing games of the year are all free-to-play.",
      "Players have grown tired of $70 launch prices, day-one patches, and always-online DRM. Free-to-play games offer instant access, regular content drops, and an active community.",
      "Critics argue that some monetization tactics — such as gacha mechanics and limited-time skins — are predatory, especially for younger players. Regulators in several countries are now considering legislation.",
      "Still, when done well, the free-to-play model lets developers ship a game once and improve it for years, which is great news for players who value long-term updates.",
    ]},
  { id: 4, category: "Anime", emoji: "⚔️", title: "How One Piece Became the Most-Watched Anime of All Time",
    excerpt: "After 25 years, Eiichiro Oda's pirate epic just crossed a milestone no anime has ever reached.",
    body: [
      "One Piece has been on the air since 1999. That alone is impressive, but recent global streaming data shows it is now the most-watched anime in history — across all platforms combined.",
      "The 2023 Netflix live-action adaptation re-introduced the show to a whole new generation of viewers, many of whom have since started watching the original anime from episode one.",
      "The current Egghead arc is widely considered the strongest writing of the entire series, with the Wano arc setting up payoffs that are landing every single week.",
      "If you have been waiting to start, the official 'recap' versions on Netflix and Crunchyroll let you catch up on 1000+ episodes in roughly 100 hours of total runtime.",
    ]},
  { id: 5, category: "Tech", emoji: "🤖", title: "AI Tools Every Student Should Know in 2026",
    excerpt: "From research to writing to revision — these AI tools genuinely help students study smarter.",
    body: [
      "AI in education is no longer a novelty. Used correctly, these tools can dramatically reduce the time spent on busy work and free students up to focus on actual learning.",
      "For research, tools like Perplexity and Elicit search across academic papers and give you direct citations — much better than a regular Google search.",
      "For writing, Grammarly and ChatGPT can act like a personal editor, catching unclear sentences and suggesting better phrasing without writing the essay for you.",
      "The most important rule: use AI as a tutor, not as a ghostwriter. Schools that catch students submitting AI-written work are increasingly handing out serious penalties.",
    ]},
  { id: 6, category: "Entertainment", emoji: "🎵", title: "K-Pop's Global Takeover: The Numbers Behind the Boom",
    excerpt: "K-Pop concerts are now the highest-grossing live music events in the world.",
    body: [
      "K-pop has gone from a niche export to a global force. The latest BLACKPINK and BTS world tours each grossed over $300 million — bigger than most Western pop acts.",
      "Streaming numbers tell the same story. Korean artists now occupy a permanent place in the global Spotify Top 50, and YouTube view records are routinely broken by K-pop music videos within 24 hours of release.",
      "What is driving the boom? Industry analysts point to three things: world-class music production, fan-driven streaming campaigns, and TikTok's algorithm rewarding catchy choreography.",
      "Even traditionally Western markets like the United States and the United Kingdom now have K-pop dedicated radio shows, dance studios, and merchandise stores.",
    ]},
  { id: 7, category: "Anime", emoji: "🌸", title: "Studio Ghibli's Next Film: Everything We Know So Far",
    excerpt: "Hayao Miyazaki may not be done after all — and the new project is unlike anything he has made before.",
    body: [
      "Despite multiple announced retirements, Hayao Miyazaki is reportedly working on a new feature film at Studio Ghibli. Sources close to the studio describe it as 'a quiet, personal story unlike his previous works'.",
      "Goro Miyazaki, his son, will reportedly co-direct — a first in Ghibli's history. This suggests the studio is preparing for a future where the iconic Ghibli style continues without its founder.",
      "Animation work is being done largely by hand, in keeping with Ghibli tradition, though the studio has confirmed that AI tools are being used for in-betweens and background cleanup.",
      "An official trailer is expected at the next Annecy Animation Festival, with a worldwide theatrical release planned for late next year.",
    ]},
  { id: 8, category: "Tech", emoji: "💻", title: "Best Budget Laptops Under $500 in 2026",
    excerpt: "You no longer need to spend a fortune to get a fast, reliable laptop.",
    body: [
      "Budget laptops have come a long way. Models that cost under $500 today outperform $1,200 laptops from just five years ago.",
      "Top picks include the Lenovo IdeaPad Slim, the HP Pavilion Aero, and the surprisingly excellent Acer Aspire Go. All three offer at least 8GB RAM, 256GB SSD, and full-day battery life.",
      "For students and casual users, ChromeOS laptops are also worth considering. They boot in seconds, get years of automatic updates, and run Android apps natively.",
      "The biggest upgrade you can make at this price range is the screen. Look for at least a 1080p IPS display — TN panels still ship on the cheapest models and they look terrible from any angle.",
    ]},
  { id: 9, category: "Entertainment", emoji: "🎬", title: "Why Marvel is Pivoting Away From the Multiverse",
    excerpt: "After mixed reactions to recent films, Marvel Studios is reportedly resetting its long-term plan.",
    body: [
      "Marvel Studios president Kevin Feige has confirmed in a recent interview that the next phase of the MCU will move 'away from multiverse complexity and back to character-driven storytelling'.",
      "The shift comes after a string of films and Disney+ series received mixed reviews from both critics and long-time fans. Studio insiders say the multiverse concept became 'too confusing for casual viewers'.",
      "Expect smaller, more grounded stories in the next two years, with the next big team-up film delayed by at least 12 months to allow for additional script rewrites.",
      "Fan favorite characters like Spider-Man, Daredevil and the X-Men are reportedly the centerpiece of the new plan.",
    ]},
  { id: 10, category: "Anime", emoji: "📺", title: "Underrated Anime You Should Watch This Weekend",
    excerpt: "Five hidden gems that flew under the radar but deserve a spot on every fan's watchlist.",
    body: [
      "Not every great anime gets the marketing budget it deserves. Here are five recent shows that you may have missed but absolutely should not skip.",
      "1. **Frieren: Beyond Journey's End** — A quiet, melancholic fantasy about an immortal elf reflecting on the friends she has outlived. Critically acclaimed but still not widely watched outside Japan.",
      "2. **Apothecary Diaries** — A clever historical mystery set in the imperial palace, with a brilliant heroine who solves crimes through pharmacology.",
      "3. **Pluto** — A sci-fi mystery based on Naoki Urasawa's manga, available exclusively on Netflix. Eight episodes, all incredible.",
      "4. **Dungeon Meshi** — A surprisingly heartfelt comedy about adventurers who cook the monsters they fight. Studio Trigger is at the top of its game.",
      "5. **Vinland Saga Season 2** — A radical departure from the violent first season, focused on character growth and farming. Slower, but rewarding.",
    ]},
];

// Pick today's article — same article all day for everyone, rotates daily.
export function todaysArticle(): Article {
  const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  return ARTICLES[day % ARTICLES.length];
}

// Pick N rotating articles for a page
export function rotatingArticles(count: number, seed = 0): Article[] {
  const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const out: Article[] = [];
  for (let i = 0; i < count; i++) {
    out.push(ARTICLES[(day + seed + i) % ARTICLES.length]);
  }
  return out;
}
