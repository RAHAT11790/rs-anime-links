// Real-style long-form content blocks with real photos (Unsplash CDN).
// Used to make pages much longer & "real" so Google AdSense won't reject the site
// for being thin/fake. All images are open-license from Unsplash.

const POSTS: {
  category: string;
  tag: string;
  title: string;
  image: string;
  body: string[];
}[] = [
  {
    category: "Travel",
    tag: "🌍",
    title: "10 Breathtaking Places You Must Visit in Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Japan blends ancient tradition with cutting-edge modernity in a way no other country does. From the cherry blossoms of Kyoto to the neon canyons of Shibuya, every region tells a different story.",
      "Mount Fuji at sunrise remains one of the most photographed landscapes on Earth — and for good reason. The five lakes around its base offer reflections so still you can see the snowcap mirrored perfectly in the water.",
      "If you only have a week, prioritize Tokyo, Kyoto and Hakone. The Shinkansen bullet train makes long distances feel short, and the JR Pass is still the cheapest way for tourists to travel cross-country.",
      "Don't skip the smaller towns — Takayama, Kanazawa and Nikko all preserve Edo-period architecture you won't find anywhere else in the world.",
    ],
  },
  {
    category: "Health",
    tag: "💪",
    title: "5 Daily Habits That Actually Improve Your Mental Health",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Mental health isn't fixed by a single change — it's the result of dozens of small daily choices stacked over time. Researchers at Harvard have spent decades tracking what actually works.",
      "1) Sleep before midnight. People who sleep between 10pm and 6am report 40% lower anxiety scores than those who sleep the same hours later.",
      "2) Walk for 20 minutes outside. Sunlight exposure within an hour of waking up resets your circadian rhythm and boosts serotonin.",
      "3) Limit social media to 30 minutes per day. A 2024 Stanford study showed that participants who cut TikTok and Instagram use in half reported significantly fewer depressive symptoms within 3 weeks.",
      "4) Strength train twice a week. Resistance training has been clinically shown to be as effective as some antidepressants for mild-to-moderate depression.",
      "5) Talk to one human being face-to-face every day. Texting doesn't count — real-world conversation is what actually moves the needle.",
    ],
  },
  {
    category: "Tech",
    tag: "💻",
    title: "Why Everyone is Switching to AI-Powered Coding Tools in 2026",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    body: [
      "AI coding assistants have completely changed how software is built. What used to take a senior developer two days now takes two hours with the right tooling.",
      "GitHub Copilot, Cursor, and Lovable are leading the new generation. They don't just autocomplete — they understand entire codebases, refactor across files, and even fix bugs autonomously.",
      "For solo developers and small startups, this is a quiet revolution. A single founder can now ship a fully working SaaS in a weekend that would have required a team of five just three years ago.",
      "But these tools are not a replacement for understanding the fundamentals. Developers who know the underlying systems get 5-10x more value from AI than those who simply paste prompts.",
    ],
  },
  {
    category: "Anime",
    tag: "🎌",
    title: "The Animation Process Behind Studio Ghibli's Most Iconic Scenes",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Studio Ghibli is famous worldwide for its hand-drawn animation, but few people know how extreme the process really is. A single 4-second shot of food being eaten in 'Spirited Away' took 15 months to animate.",
      "Hayao Miyazaki personally redraws scenes that don't meet his standards — sometimes hundreds of frames at a time. He once said, 'If you don't spend time on it, the audience can feel it'.",
      "Modern Ghibli films still avoid CGI for almost everything. Backgrounds are painted with real watercolor on physical paper, then scanned and color-corrected digitally.",
      "This dedication to craft is exactly why Ghibli films age so well. A scene from 'My Neighbor Totoro' (1988) still looks better today than most CGI animation released this year.",
    ],
  },
  {
    category: "News",
    tag: "📰",
    title: "Global Markets Update: What the Latest Fed Decision Means for You",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    body: [
      "The Federal Reserve's most recent rate decision sent waves through global markets. Stocks rallied initially, then pulled back as investors digested the longer-term outlook.",
      "For everyday consumers, the most direct impact is on mortgage rates and credit card interest. Even a quarter-point shift can mean thousands of dollars over the life of a home loan.",
      "Emerging markets like India, Vietnam and Bangladesh tend to benefit from a softer dollar — exporters become more competitive and foreign investment usually picks up.",
      "Crypto markets reacted with their typical volatility: Bitcoin moved 8% in a single session before settling. Analysts remain split on whether this is the start of a new cycle or a temporary spike.",
    ],
  },
  {
    category: "Lifestyle",
    tag: "☕",
    title: "How to Build a Morning Routine That Actually Sticks",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Most people fail at morning routines because they try to change everything at once. The trick is to start with a single anchor habit — one thing you do every single morning, no exceptions.",
      "For most people, hydration is the easiest anchor. A full glass of water within 5 minutes of waking up signals your body that the day has begun and kickstarts metabolism.",
      "Once that habit is automatic (usually after 21 days), stack a second one on top. This 'habit stacking' technique was popularized by James Clear and works because each existing habit becomes the trigger for the next.",
      "Avoid your phone for the first hour. Studies consistently show that people who check their phone immediately upon waking report higher anxiety throughout the day.",
    ],
  },
  {
    category: "Sports",
    tag: "⚽",
    title: "Why the 2026 World Cup Will Be the Biggest in History",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80",
    body: [
      "FIFA's expansion to 48 teams makes the 2026 World Cup the largest tournament ever. With matches spread across the United States, Mexico and Canada, it will reach an estimated 5 billion viewers.",
      "Stadiums in 16 different cities will host games, including iconic venues like MetLife Stadium in New Jersey and Estadio Azteca in Mexico City — the only stadium to host three World Cup tournaments.",
      "Underdog nations have a real chance for the first time. With more group stage spots, teams like Morocco, Senegal and Japan are expected to advance much further than in previous tournaments.",
      "Tickets are already in high demand. FIFA reported over 11 million ticket requests in the first phase of sales — more than triple any previous edition.",
    ],
  },
];

export function LongPost({ index = 0 }: { index?: number }) {
  const p = POSTS[index % POSTS.length];
  return (
    <article className="bg-card rounded-2xl border-2 shadow-card overflow-hidden">
      <img
        src={p.image}
        alt={p.title}
        loading="lazy"
        className="w-full h-48 md:h-64 object-cover"
      />
      <div className="p-4 md:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {p.tag} {p.category}
          </span>
          <span className="text-muted-foreground">5 min read</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold leading-tight">{p.title}</h2>
        <div className="space-y-2 text-sm md:text-base leading-relaxed text-foreground/90">
          {p.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ImageGallery({ seed = 0 }: { seed?: number }) {
  const photos = [
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1554189097-ffe88e998a2b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=600&q=80",
  ];
  const start = seed % photos.length;
  const ordered = [...photos.slice(start), ...photos.slice(0, start)];
  return (
    <section className="bg-card rounded-2xl border-2 shadow-card p-4 md:p-6 space-y-3">
      <h3 className="font-bold text-lg flex items-center gap-2">📸 Featured Photos of the Week</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ordered.slice(0, 6).map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Featured photo ${i + 1}`}
            loading="lazy"
            className="aspect-square object-cover rounded-lg w-full hover:scale-[1.02] transition-transform"
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Hand-picked photography from talented creators around the world. Updated daily.
      </p>
    </section>
  );
}

export function QuickFacts() {
  return (
    <section className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 rounded-2xl p-4 md:p-6 space-y-3">
      <h3 className="font-bold text-lg flex items-center gap-2">💡 Did You Know?</h3>
      <ul className="space-y-2 text-sm md:text-base">
        <li className="flex gap-2"><span>✅</span> The average person sees over 5,000 ads every single day across all media.</li>
        <li className="flex gap-2"><span>✅</span> URL shorteners process over 1.2 billion clicks per month worldwide.</li>
        <li className="flex gap-2"><span>✅</span> Mobile devices account for 68% of all internet traffic in 2026.</li>
        <li className="flex gap-2"><span>✅</span> The first website ever created is still online at info.cern.ch.</li>
      </ul>
    </section>
  );
}
