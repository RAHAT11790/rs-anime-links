import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

/* ---------- REAL ad slot (with our own close button) ---------- */
export function AdSlot({
  slotKey,
  fallback,
  className = "",
  minHeight = 250,
  closable = true,
  hideWhenDisabled = false,
}: {
  slotKey: string;
  fallback?: React.ReactNode;
  className?: string;
  minHeight?: number;
  closable?: boolean;
  /** When true: if the admin disabled this slot OR it has no script, render NOTHING (no fallback). Useful for AdSense slots that should be invisible until verified. */
  hideWhenDisabled?: boolean;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [closed, setClosed] = useState(false);
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
          setDisabled(false);
        } else {
          setCode("");
          setDisabled(true);
        }
      });
  }, [slotKey]);

  // Hidden mode: render absolutely nothing when disabled / empty.
  if (hideWhenDisabled && (code === "" || disabled)) return null;

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

  if (closed) return null;
  if (code === null)
    return (
      <div className={`ad-skeleton ${className}`} style={{ minHeight }}>
        Loading sponsored content…
      </div>
    );

  const inner = code ? (
    <div
      ref={ref}
      className="overflow-hidden rounded-lg"
      style={{ minHeight }}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  ) : (
    <>{fallback ?? <FakeBanner className={className} />}</>
  );

  if (!closable) return <div className={className}>{inner}</div>;

  return (
    <div className={`relative ${className}`}>
      <CloseButton onClose={() => setClosed(true)} />
      {inner}
    </div>
  );
}

/* ---------- Smart close button: shows fake "Click ad to close" then closes ---------- */
function CloseButton({ onClose }: { onClose: () => void }) {
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const handle = () => {
    if (tries < 1) {
      setMsg("Please click the ad to close this banner");
      setTries(tries + 1);
      setTimeout(() => setMsg(null), 2500);
      return;
    }
    onClose();
  };

  return (
    <>
      <button
        onClick={handle}
        aria-label="Close ad"
        className="absolute -top-2 -right-2 z-20 h-7 w-7 rounded-full bg-foreground text-background shadow-elevated flex items-center justify-center hover:scale-110 transition border-2 border-background"
      >
        <X className="h-4 w-4" />
      </button>
      {msg && (
        <div className="absolute -top-9 right-0 z-20 text-[10px] bg-foreground text-background px-2 py-1 rounded shadow whitespace-nowrap">
          {msg}
        </div>
      )}
    </>
  );
}

/* ---------- TOP banner ---------- */
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

/* ---------- Site-wide ad scripts (Multitag + Vignette ONLY — no popunder here, popunder is triggered manually via direct links) ---------- */
const HARDCODED_AD_SCRIPTS = [
  // Monetag Multitag
  `<script src="https://quge5.com/88/tag.min.js" data-zone="230930" async data-cfasync="false"></script>`,
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
    if (document.querySelector("[data-ad-injected]")) return;
    HARDCODED_AD_SCRIPTS.forEach(injectAdHtml);
  }, []);
  return null;
}

/* ---------- POP-UP BANNER — overlay ad shown on steps 1 & 2 ----------
   - Visible countdown: 10s. Real auto-close: 15s (if user doesn't click).
   - Click banner → opens ad (popunder/direct), then closes after ~5s.
   - User can manually click X but it shows "click ad first" up to 1 retry.
*/
export function PopupBanner({
  onClose,
  directLink,
}: {
  onClose: () => void;
  directLink: string;
}) {
  const [shown, setShown] = useState(10); // visible countdown
  const [clicked, setClicked] = useState(false);
  const [closeTries, setCloseTries] = useState(0);
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    // visible countdown 10 → 0
    const t1 = setInterval(() => setShown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    // real auto-close at 15s
    const t2 = setTimeout(onClose, 15000);
    return () => {
      clearInterval(t1);
      clearTimeout(t2);
    };
  }, [onClose]);

  const handleBannerClick = () => {
    if (clicked) return;
    setClicked(true);
    // Open ad in new tab — silently swallow any error (e.g. "resource not found")
    try {
      const w = window.open(directLink, "_blank", "noopener,noreferrer");
      // If popup blocked, just close after a moment
      if (!w) setTimeout(onClose, 2000);
    } catch {}
    setTimeout(onClose, 5000);
  };

  const handleX = () => {
    if (closeTries < 1 && !clicked) {
      setTip("Click the ad to close this banner");
      setCloseTries(closeTries + 1);
      setTimeout(() => setTip(null), 2500);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-elevated border-2 overflow-hidden">
        {/* Header */}
        <div className="bg-secondary text-secondary-foreground px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
            Sponsored
          </span>
          <button
            onClick={handleX}
            className="h-7 w-7 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Banner */}
        <button
          onClick={handleBannerClick}
          className="block w-full p-5 bg-gradient-to-br from-primary via-brand-red to-secondary text-white text-left hover:brightness-110 transition"
        >
          <div className="text-xs uppercase tracking-wider opacity-80 mb-2">
            🔥 Featured Offer
          </div>
          <div className="text-2xl font-extrabold leading-tight mb-3">
            Click here & wait 10s on ad page to continue
          </div>
          <div className="text-sm opacity-90 mb-4">
            Demo: After 10s click this link to open the offer. Banner will auto-close in <b>{shown}s</b>.
          </div>
          <div className="inline-flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-full text-sm shadow">
            Click Ad to Continue →
          </div>
        </button>

        {/* Status footer */}
        <div className="px-4 py-2 text-center text-xs text-muted-foreground bg-muted/30 border-t">
          {clicked
            ? "✓ Ad opened — closing shortly…"
            : shown > 0
            ? `Auto-closing in ${shown}s`
            : "You can close this now"}
        </div>

        {tip && (
          <div className="absolute top-12 right-3 text-[11px] bg-foreground text-background px-2 py-1 rounded shadow">
            {tip}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- FAKE banner pool ---------- */
const fakeAds = [
  { title: "🏏 ICC World Cup 2026 — Live HD Streaming Free!", brand: "CricLive", color: "from-emerald-600 to-green-700", cta: "Watch Now" },
  { title: "💰 Earn $500/day from Crypto Trading", brand: "BinX Pro", color: "from-yellow-500 to-orange-600", cta: "Try Free" },
  { title: "📲 Download MX Player Pro — All Codecs Unlocked", brand: "MXPro", color: "from-red-500 to-rose-700", cta: "Install" },
  { title: "🎬 Stream 10,000+ Anime in 4K — Free Forever", brand: "AnimeFlix", color: "from-violet-600 to-purple-700", cta: "Start Watching" },
  { title: "🔒 NordVPN — 80% OFF + 3 Months Free", brand: "NordVPN", color: "from-blue-700 to-indigo-800", cta: "Get Deal" },
  { title: "📚 Learn English in 30 Days — Free Course", brand: "SpeakUp", color: "from-cyan-600 to-blue-700", cta: "Enroll Free" },
  { title: "🛍️ Mega Sale — Up to 90% Off Everything", brand: "ShopMax", color: "from-pink-600 to-rose-700", cta: "Shop Now" },
  { title: "🎮 Free Game UC & Diamonds Top-up", brand: "GameTopup", color: "from-yellow-600 to-amber-700", cta: "Top-up" },
  { title: "📱 Win iPhone 16 Pro for Just $1", brand: "iWin", color: "from-slate-700 to-zinc-900", cta: "Enter Now" },
  { title: "✈️ Cheap Flight Tickets — Save up to 70%", brand: "FlyCheap", color: "from-sky-500 to-blue-600", cta: "Search" },
];

export function FakeBanner({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const ad = fakeAds[Math.floor(Math.random() * fakeAds.length)];
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`block rounded-lg overflow-hidden border bg-gradient-to-br ${ad.color} text-white shadow-elevated relative group ${
        compact ? "p-3 min-h-[80px]" : "p-6 min-h-[240px]"
      } flex flex-col justify-between ${className}`}
    >
      <div className="absolute top-2 right-2 bg-black/30 backdrop-blur text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
        Ad
      </div>
      <div className={`font-extrabold leading-tight drop-shadow ${compact ? "text-base" : "text-xl md:text-2xl"}`}>
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

export function FakeBannerGrid({ count = 2 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <FakeBanner key={i} />
      ))}
    </div>
  );
}
