import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ---------- REAL ad slot ---------- */
export function AdSlot({
  slotKey,
  fallback,
  className = "",
  minHeight = 250,
}: {
  slotKey: string;
  fallback?: React.ReactNode;
  className?: string;
  minHeight?: number;
}) {
  const [code, setCode] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("ad_slots")
      .select("script_code,enabled")
      .eq("slot_key", slotKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.enabled && data.script_code && data.script_code.trim().length > 0) {
          setCode(data.script_code);
        } else setCode("");
      });
  }, [slotKey]);

  // Re-execute injected <script> tags (innerHTML doesn't run them)
  useEffect(() => {
    if (!code || !ref.current) return;
    const scripts = ref.current.querySelectorAll("script");
    scripts.forEach((old) => {
      const s = document.createElement("script");
      for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
      s.text = old.text;
      old.parentNode?.replaceChild(s, old);
    });
  }, [code]);

  if (code === null)
    return (
      <div className={`ad-skeleton ${className}`} style={{ minHeight }}>
        Loading sponsored content…
      </div>
    );
  if (code)
    return (
      <div
        ref={ref}
        className={`overflow-hidden rounded-lg ${className}`}
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: code }}
      />
    );
  return <>{fallback ?? <FakeBanner className={className} />}</>;
}

/* ---------- TOP banner — appears on every redirect step ---------- */
export function TopBanner() {
  return (
    <div className="container max-w-3xl py-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 text-center">
        — Advertisement —
      </div>
      <AdSlot slotKey="top_banner" minHeight={90} fallback={<FakeBanner compact />} />
    </div>
  );
}

/* ---------- Site-wide ad scripts — ONLY mounted on redirect flow ---------- */
/* Loads: Monetag Multitag, Onclick/Popunder, Vignette banner + any DB extras */
const HARDCODED_AD_SCRIPTS = [
  // Monetag Multitag
  `<script src="https://quge5.com/88/tag.min.js" data-zone="230930" async data-cfasync="false"></script>`,
  // Monetag Onclick (Popunder)
  `<script>(function(s){s.dataset.zone='10891589',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>`,
  // Monetag Vignette
  `<script>(function(s){s.dataset.zone='10891590',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>`,
];

function injectAdHtml(html: string) {
  const wrap = document.createElement("div");
  wrap.style.display = "none";
  wrap.setAttribute("data-ad-injected", "1");
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  wrap.querySelectorAll("script").forEach((old) => {
    const s = document.createElement("script");
    for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
    s.text = old.text;
    document.body.appendChild(s);
  });
}

export function GlobalAdScripts() {
  useEffect(() => {
    // 1) Always inject hardcoded Monetag ad codes
    HARDCODED_AD_SCRIPTS.forEach(injectAdHtml);

    // 2) Plus any optional DB-driven extras (popunder/monetag_sw slot)
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("ad_slots")
        .select("slot_key,script_code,enabled")
        .in("slot_key", ["popunder", "monetag_sw"]);
      if (cancelled || !data) return;
      data.forEach((slot) => {
        if (!slot.enabled || !slot.script_code) return;
        injectAdHtml(slot.script_code);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

/* ---------- FAKE banner pool — inspired by AroLinks/UrlBot fake ads ---------- */
const fakeAds = [
  { title: "🏏 ICC World Cup 2026 — Live HD Streaming Free!", brand: "CricLive", color: "from-emerald-600 to-green-700", cta: "Watch Now" },
  { title: "💰 Earn $500/day from Cricket Predictions", brand: "BetWin", color: "from-yellow-500 to-orange-600", cta: "Try Free" },
  { title: "📲 Download MX Player Pro — All Codecs Unlocked", brand: "MXPro", color: "from-red-500 to-rose-700", cta: "Install" },
  { title: "🎬 Stream 10,000+ Anime in 4K — Free Forever", brand: "AnimeFlix", color: "from-violet-600 to-purple-700", cta: "Start Watching" },
  { title: "📈 Trade Crypto with $100 Welcome Bonus", brand: "BinX Pro", color: "from-amber-500 to-yellow-600", cta: "Claim $100" },
  { title: "🔒 NordVPN — 80% OFF + 3 Months Free", brand: "NordVPN", color: "from-blue-700 to-indigo-800", cta: "Get Deal" },
  { title: "💎 Free Fire Diamonds Generator — 100% Working", brand: "FF Tools", color: "from-orange-600 to-red-600", cta: "Generate" },
  { title: "📚 Learn English in 30 Days — Free Course", brand: "SpeakUp", color: "from-cyan-600 to-blue-700", cta: "Enroll Free" },
  { title: "🛍️ Daraz Mega Sale — Up to 90% Off Everything", brand: "Daraz", color: "from-pink-600 to-rose-700", cta: "Shop Now" },
  { title: "💼 Earn ₹50,000/month from Home — Genuine Job", brand: "WorkHub", color: "from-teal-600 to-emerald-700", cta: "Apply Now" },
  { title: "🎮 PUBG Mobile UC at 70% Discount", brand: "GameTopup", color: "from-yellow-600 to-amber-700", cta: "Top-up" },
  { title: "📱 iPhone 16 Pro — Win for Just $1 Lottery", brand: "iWin", color: "from-slate-700 to-zinc-900", cta: "Enter Now" },
  { title: "❤️ Find Your Match Tonight — Free Sign Up", brand: "DateMe", color: "from-pink-500 to-fuchsia-600", cta: "Join Free" },
  { title: "🚗 Bike Insurance from ₹499 — Compare & Save", brand: "InsureGo", color: "from-blue-600 to-sky-700", cta: "Get Quote" },
  { title: "🎁 Spin & Win Real Cash — Every 10 minutes", brand: "SpinCash", color: "from-fuchsia-600 to-pink-700", cta: "Spin Now" },
  { title: "📺 Watch IPL Free in HD — No Buffering", brand: "IPL Live", color: "from-indigo-600 to-blue-700", cta: "Watch Live" },
  { title: "🪙 Bitcoin Mining App — Earn 0.001 BTC/day", brand: "CryptoMine", color: "from-orange-500 to-yellow-600", cta: "Start Mining" },
  { title: "✈️ Cheap Flight Tickets — Save up to 70%", brand: "FlyCheap", color: "from-sky-500 to-blue-600", cta: "Search" },
];

export function FakeBanner({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const ad = fakeAds[Math.floor(Math.random() * fakeAds.length)];
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`block rounded-lg overflow-hidden border bg-gradient-to-br ${ad.color} text-white shadow-elevated relative group ${
        compact ? "p-3 min-h-[80px]" : "p-6 min-h-[280px]"
      } flex flex-col justify-between ${className}`}
    >
      <div className={`absolute top-2 right-2 bg-black/30 backdrop-blur text-[9px] px-2 py-0.5 rounded uppercase tracking-wider`}>
        Ad
      </div>
      <div className={`font-extrabold leading-tight drop-shadow ${compact ? "text-base" : "text-2xl md:text-3xl"}`}>
        {ad.title}
      </div>
      {!compact && (
        <div className="flex items-end justify-between gap-3 mt-4">
          <div className="text-xs opacity-90">
            from <b className="font-bold">{ad.brand}</b>
          </div>
          <div className="bg-white text-black font-bold px-4 py-2 rounded-full text-sm shadow group-hover:scale-105 transition">
            {ad.cta} →
          </div>
        </div>
      )}
    </a>
  );
}

/* ---------- Grid of multiple fake banners ---------- */
export function FakeBannerGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <FakeBanner key={i} />
      ))}
    </div>
  );
}
