import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AdSlot,
  FakeBanner,
  TopBanner,
  GlobalAdScripts,
  PopupBanner,
} from "@/components/AdSlot";
import { AdBlockGuard } from "@/components/AdBlockGuard";
import { Button } from "@/components/ui/button";
import { FeaturedArticle, ArticleGrid } from "@/components/ArticleBlock";
import { LongPost, ImageGallery, QuickFacts } from "@/components/LongFormContent";
import {
  Loader2,
  ArrowRight,
  Lock,
  CheckCircle2,
  Shield,
  ChevronDown,
  Send,
  Users,
  MessageCircle,
} from "lucide-react";
import logo from "@/assets/logo.png";

/* Direct-link URLs — opened ONCE per button click. Errors silently swallowed.
   Removed broken zone 5gvci.com/4/10891433 (returns "resource not found"). */
const DIRECT_LINKS = ["https://omg10.com/4/10891592"];
function pickDirectLink() {
  return DIRECT_LINKS[Math.floor(Math.random() * DIRECT_LINKS.length)];
}
function openDirectAdSafely() {
  try {
    const w = window.open(pickDirectLink(), "_blank", "noopener,noreferrer");
    // If popup blocked or returns null, just ignore — don't show user anything
    return !!w;
  } catch {
    return false;
  }
}

const TELEGRAM_PROFILE = "https://t.me/RS_WONER";
const TELEGRAM_CHANNEL = "https://t.me/cartoonfunny03";

const STEP_WAIT = 8;   // smaller wait = lighter loader
const FINAL_WAIT = 5;

const PLAN_STEPS: Record<string, number> = {
  Default: 2,
  Premium: 2,
  Pro: 3,
  Top: 4,
};

export default function RedirectFlow() {
  const { code } = useParams();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [link, setLink] = useState<any>(null);
  const [ownerPlan, setOwnerPlan] = useState<string>("Default");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(STEP_WAIT);
  const [verified, setVerified] = useState(false);
  // Final-link "ready to redirect" state (manual click — never auto-redirects).
  const [finalReady, setFinalReady] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data, error } = await supabase.from("links").select("*").eq("short_code", code).maybeSingle();
      if (error || !data) return setError("Link not found");
      if (data.status !== "active") return setError("This link has been disabled");
      setLink(data);

      const { data: prof } = await supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", data.user_id)
        .maybeSingle();
      setOwnerPlan(prof?.plan || "Default");

      const { data: settings } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "plan_steps")
        .maybeSingle();
      if (settings?.value) {
        Object.assign(PLAN_STEPS, settings.value as Record<string, number>);
      }

      setStep(1);

      // Track click — server side dedupes within 24h per device fingerprint.
      try {
        const { data: fb } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "function_base_url")
          .maybeSingle();
        const base = ((fb?.value as string) || import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
        const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        await fetch(`${base}/functions/v1/track-click`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: anon, Authorization: `Bearer ${anon}` },
          body: JSON.stringify({ link_id: data.id }),
        });
      } catch {}
    })();
  }, [code]);

  const totalSteps = PLAN_STEPS[ownerPlan] ?? 2;
  const finalStepNum = totalSteps + 1;

  // Reset countdown when step changes
  useEffect(() => {
    if (step === 0) return;
    setCountdown(step === finalStepNum ? FINAL_WAIT : STEP_WAIT);
    setVerified(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const t = setInterval(
      () =>
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        }),
      1000
    );
    return () => clearInterval(t);
  }, [step, finalStepNum]);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">{error}</h1>
          <Button onClick={() => nav("/")}>Go Home</Button>
        </div>
      </div>
    );
  if (step === 0 || !link)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  const stepLabel = step <= totalSteps ? `${step}/${totalSteps}` : `${totalSteps}/${totalSteps}`;
  const isFinalGate = step === finalStepNum;
  // Pop-up banner only on first 2 steps
  const showPopup = step === 1 || step === 2;

  // FINAL GATE — completely clean UI, NO ads, NO redirect on tap-out.
  if (isFinalGate) {
    return (
      <AdBlockGuard>
        <div className="min-h-screen bg-background">
          <GlobalAdScripts />
          <header className="bg-secondary text-secondary-foreground sticky top-0 z-30 shadow-elevated">
            <div className="container flex items-center justify-between py-2">
              <img
                src={logo}
                alt="RS Anime Link"
                width={200}
                height={48}
                className="h-9 w-auto bg-white px-2 py-1 rounded"
              />
              <div className="flex items-center gap-1 text-xs font-bold">
                <Shield className="h-3.5 w-3.5 text-success" /> Secure Gateway
              </div>
            </div>
          </header>
          <main className="container max-w-md py-8">
            <FinalCleanGate
              countdown={countdown}
              originalUrl={link.original_url}
              finalReady={finalReady}
              setFinalReady={setFinalReady}
            />
          </main>
        </div>
      </AdBlockGuard>
    );
  }

  return (
    <AdBlockGuard>
      <div className="min-h-screen bg-background">
        <GlobalAdScripts />

        <header className="bg-secondary text-secondary-foreground sticky top-0 z-30 shadow-elevated">
          <div className="container flex items-center justify-between py-2">
            <img
              src={logo}
              alt="RS Anime Link"
              width={200}
              height={48}
              className="h-9 w-auto bg-white px-2 py-1 rounded"
            />
            <div className="flex items-center gap-1 text-xs font-bold">
              <Shield className="h-3.5 w-3.5 text-success" /> Secure Gateway
            </div>
          </div>
        </header>

        <TopBanner />

        <div className="container max-w-3xl py-3">
          <div className="bg-card border-2 rounded-lg px-4 py-3 text-center font-bold shadow-card">
            You are currently on step{" "}
            <span className="text-brand-red text-lg">{stepLabel}</span>
            <span className="text-muted-foreground font-normal text-xs ml-2">
              (Plan: {ownerPlan})
            </span>
          </div>
        </div>

        <main className="container max-w-3xl pb-10 space-y-4">
          <StepFlow
            key={step}
            step={step}
            totalSteps={totalSteps}
            verified={verified}
            setVerified={setVerified}
            countdown={countdown}
            onContinue={() => setStep(step + 1)}
            showPopup={showPopup}
          />
        </main>
      </div>
    </AdBlockGuard>
  );
}

/* ============================================================
   STEP FLOW — Verify (top, single click) → Ads in middle → Continue (bottom)
   ============================================================ */
function StepFlow({
  step,
  totalSteps,
  verified,
  setVerified,
  countdown,
  onContinue,
  showPopup,
}: {
  step: number;
  totalSteps: number;
  verified: boolean;
  setVerified: (v: boolean) => void;
  countdown: number;
  onContinue: () => void;
  showPopup: boolean;
}) {
  const [popupOpen, setPopupOpen] = useState(showPopup);
  const continueRef = useRef<HTMLDivElement>(null);
  const slotKey = `step${Math.min(step, 4)}_banner`;
  const isLightStep = step >= 3;

  // VERIFY: single click → mark verified, show "Click Continue below" + auto scroll.
  const handleVerify = () => {
    setVerified(true);
    // Trigger ad ONCE in background (silent)
    openDirectAdSafely();
    setTimeout(() => {
      continueRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 500);
  };

  // CONTINUE: single click — open ad once, advance to next step.
  const [continuing, setContinuing] = useState(false);
  const handleContinue = () => {
    if (continuing) return;
    setContinuing(true);
    openDirectAdSafely();
    setTimeout(onContinue, 600);
  };

  return (
    <>
      {popupOpen && (
        <PopupBanner directLink={pickDirectLink()} onClose={() => setPopupOpen(false)} />
      )}

      {/* TOP CARD: Verify */}
      <section className="bg-card rounded-2xl border-2 shadow-elevated p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <div className="font-bold flex items-start gap-2 text-base md:text-lg">
            <span>👇</span>
            <span>
              Click <span className="text-brand-red">Verify</span>, then scroll down and tap{" "}
              <span className="text-primary">Continue</span>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            ⏱ Please wait <span className="text-primary font-bold">{countdown}s</span> before verifying
          </div>
        </div>

        <div className="text-center pt-2">
          {!verified && countdown > 0 && (
            <Button disabled size="lg" className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto">
              <Lock className="h-4 w-4 mr-2" /> Wait {countdown}s
            </Button>
          )}
          {!verified && countdown === 0 && (
            <Button
              onClick={handleVerify}
              size="lg"
              className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground rounded-full px-12 py-6 text-base font-bold w-full sm:w-auto animate-pulse shadow-elevated"
            >
              ✓ Verify
            </Button>
          )}
          {verified && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-success font-bold text-lg">
                <CheckCircle2 className="h-6 w-6" /> Verified — Click Continue below
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 animate-bounce">
                <ChevronDown className="h-4 w-4" /> Scroll down for Continue button
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MIDDLE: real-looking article content + ads — makes pages long & rich for AdSense */}
      <FeaturedArticle />

      {/* AdSense responsive (hidden until admin enables after Google verification) */}
      <AdSlot slotKey="adsense_responsive" minHeight={0} hideWhenDisabled closable={false} className="w-full" />

      <LongPost index={step} />

      <BannerSection title="Sponsored">
        <AdSlot slotKey={slotKey} minHeight={250} fallback={<FakeBanner />} />
      </BannerSection>

      <ImageGallery seed={step} />

      {!isLightStep && (
        <>
          <BannerSection title="Recommended">
            <AdSlot slotKey="adsterra_300x250" minHeight={250} className="w-full max-w-[300px] mx-auto" fallback={<FakeBanner />} />
          </BannerSection>

          <LongPost index={step + 2} />

          <ArticleGrid count={2} seed={step} />

          {/* AdSense Auto-Relaxed (hidden until admin enables) */}
          <AdSlot slotKey="adsense_relaxed" minHeight={0} hideWhenDisabled closable={false} className="w-full" />

          <BannerSection title="Featured">
            <AdSlot slotKey="adsterra_native" minHeight={200} fallback={<FakeBanner />} />
          </BannerSection>
        </>
      )}

      <QuickFacts />

      <LongPost index={step + 4} />

      {isLightStep && <ArticleGrid count={2} seed={step + 5} />}

      {/* BOTTOM CARD: Continue */}
      <section
        ref={continueRef}
        className={`bg-card rounded-2xl border-2 shadow-elevated p-4 md:p-6 space-y-4 ${
          verified ? "ring-4 ring-success/30" : "opacity-90"
        }`}
      >
        <div className="text-center space-y-2">
          <div className="text-xl font-extrabold">
            Tap <span className="text-primary">Continue</span> to proceed
          </div>
          <p className="text-sm text-muted-foreground">
            Step {step} of {totalSteps} — almost there!
          </p>
        </div>

        <div className="text-center pt-2">
          {!verified ? (
            <>
              <div className="text-xs text-muted-foreground mb-2">
                ⚠️ Please verify on top first to unlock Continue
              </div>
              <Button disabled size="lg" className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" /> Continue
              </Button>
            </>
          ) : (
            <Button
              onClick={handleContinue}
              disabled={continuing}
              size="lg"
              className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground rounded-full px-12 py-6 text-base font-bold w-full sm:w-auto animate-pulse shadow-elevated"
            >
              {continuing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading…
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        <div className="border-t pt-3 text-center text-xs text-muted-foreground">
          🔴 <b className="text-primary">How it works</b>
          <div className="flex justify-around mt-2 font-semibold text-foreground">
            <span>1. Verify</span>
            <span>2. Scroll</span>
            <span>3. Continue</span>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   FINAL CLEAN GATE — Telegram-style, NO ads, NO auto-redirect
   - User can press back from destination and return here
   - "Get Link" button is a real anchor with target=_blank — never replaces history
   ============================================================ */
function FinalCleanGate({
  countdown,
  originalUrl,
  finalReady,
  setFinalReady,
}: {
  countdown: number;
  originalUrl: string;
  finalReady: boolean;
  setFinalReady: (v: boolean) => void;
}) {
  useEffect(() => {
    if (countdown === 0) setFinalReady(true);
  }, [countdown, setFinalReady]);

  return (
    <section className="bg-card rounded-2xl border-2 shadow-elevated overflow-hidden">
      <div className="bg-gradient-to-br from-[hsl(200,100%,50%)] to-[hsl(220,90%,55%)] text-white p-6 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full mb-3">
          ⚡ JOIN OUR TELEGRAM CHANNEL TO GET LINK
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-4">
          <div className="text-left">
            <div className="text-3xl font-black leading-tight">JOIN OUR</div>
            <div className="text-4xl font-black text-yellow-300 leading-tight">TELEGRAM</div>
            <div className="text-3xl font-black leading-tight">CHANNEL</div>
          </div>
          <div className="text-7xl">📱</div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <a
          href={TELEGRAM_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[hsl(200,100%,50%)] hover:bg-[hsl(200,100%,45%)] text-white font-bold py-3 rounded-xl transition shadow-card"
        >
          <Send className="h-5 w-5" /> Join Our Telegram Channel
        </a>
        <a
          href={TELEGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-card border-2 hover:bg-muted/50 text-foreground font-bold py-3 rounded-xl transition"
        >
          <MessageCircle className="h-5 w-5" /> Contact Admin on Telegram
        </a>
      </div>

      {/* Countdown ring */}
      <div className="px-6 pb-4 text-center">
        <p className="font-bold text-lg mb-3">Your link is almost ready</p>
        <div className="relative inline-flex items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (countdown / FINAL_WAIT)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-primary">{countdown}</span>
            <span className="text-[10px] uppercase text-muted-foreground">seconds</span>
          </div>
        </div>
      </div>

      {/* Get Link button — opens in new tab, NO redirect of current page,
          so user can come back via "back" if they accidentally navigate away */}
      <div className="px-6 pb-6 text-center">
        {!finalReady ? (
          <Button
            disabled
            size="lg"
            className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto"
          >
            <Lock className="h-4 w-4 mr-2" /> Please wait {countdown}s
          </Button>
        ) : (
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full px-12 py-4 text-base font-bold bg-success hover:bg-success/90 text-success-foreground w-full sm:w-auto animate-pulse shadow-elevated"
          >
            Get Link <ArrowRight className="h-5 w-5 ml-2" />
          </a>
        )}
      </div>

      {/* Footer — minimal, NO ads */}
      <div className="text-center text-xs text-muted-foreground py-3 border-t">
        <div className="flex justify-center gap-3">
          <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Users className="h-3 w-3" /> Channel
          </a>
          <a href={TELEGRAM_PROFILE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <MessageCircle className="h-3 w-3" /> Contact
          </a>
        </div>
        <div className="mt-1">© RS Anime Link {new Date().getFullYear()}</div>
      </div>
    </section>
  );
}

/* ============================================================
   BANNER SECTION
   ============================================================ */
function BannerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 border-b">
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          {title}
        </span>
        <span className="text-[9px] uppercase tracking-wider bg-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded">
          Ad
        </span>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
