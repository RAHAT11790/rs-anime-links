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

/* Direct-link URLs — opened ONCE per button click (first click only). */
const DIRECT_LINKS = ["https://omg10.com/4/10891592", "https://5gvci.com/4/10891433"];
function pickDirectLink() {
  return DIRECT_LINKS[Math.floor(Math.random() * DIRECT_LINKS.length)];
}

/* Telegram links (used everywhere) */
const TELEGRAM_PROFILE = "https://t.me/RS_WONER";
const TELEGRAM_CHANNEL = "https://t.me/cartoonfunny03";

const STEP_WAIT = 10;
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
  const redirectStepNum = totalSteps + 2;

  useEffect(() => {
    if (step === 0 || step >= redirectStepNum) return;
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
  }, [step, finalStepNum, redirectStepNum]);

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

  if (step === redirectStepNum) {
    window.location.href = link.original_url;
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-2" />
          <div>Redirecting…</div>
        </div>
      </div>
    );
  }

  const stepLabel = step <= totalSteps ? `${step}/${totalSteps}` : `${totalSteps}/${totalSteps}`;
  const isFinalGate = step === finalStepNum;
  // Pop-up banner only on first 2 steps
  const showPopup = step === 1 || step === 2;

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
          {!isFinalGate ? (
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
          ) : (
            <FinalFlow
              countdown={countdown}
              onContinue={() => setStep(redirectStepNum)}
            />
          )}
        </main>
      </div>
    </AdBlockGuard>
  );
}

/* ============================================================
   STEP FLOW
   - Steps 1 & 2: heavier, with pop-up banner overlay on mount
   - Steps 3+: lighter
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
  const [adClicked, setAdClicked] = useState(false);
  const [popupOpen, setPopupOpen] = useState(showPopup);
  const continueRef = useRef<HTMLDivElement>(null);
  const slotKey = `step${Math.min(step, 4)}_banner`;
  const isLightStep = step >= 3; // steps 3 & 4 → simpler

  // Verify: 1st click → opens direct link ONCE, 2nd click → verified + auto-scroll
  const handleVerify = () => {
    if (!adClicked) {
      try {
        window.open(pickDirectLink(), "_blank", "noopener,noreferrer");
      } catch {}
      setAdClicked(true);
      return;
    }
    setVerified(true);
    setTimeout(() => {
      continueRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  };

  // Continue: ONE click = open ad + go next (no double click anymore)
  const [continuing, setContinuing] = useState(false);
  const handleContinue = () => {
    if (continuing) return;
    setContinuing(true);
    try {
      window.open(pickDirectLink(), "_blank", "noopener,noreferrer");
    } catch {}
    // small delay so popup gets focus, then advance
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
              Click image, wait 10 seconds & come back to{" "}
              <span className="text-brand-red">Get Download Link</span>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            ▼ <span className="text-brand-red font-bold">CLICK ANY IMAGE</span> &amp; WAIT{" "}
            <span className="text-primary font-bold">{countdown} SECONDS</span> TO GET LINK ▼
          </div>
        </div>

        <AdSlot slotKey={slotKey} minHeight={280} fallback={<FakeBanner />} className="w-full" />

        <div className="text-center pt-2">
          {!verified && countdown > 0 && (
            <>
              <div className="text-xs text-muted-foreground mb-2">
                Please wait {countdown}s before verifying…
              </div>
              <Button disabled size="lg" className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" /> {countdown}s
              </Button>
            </>
          )}
          {!verified && countdown === 0 && (
            <>
              {adClicked && (
                <div className="text-xs text-success mb-2 font-semibold">
                  ✓ Ad opened — click again to verify
                </div>
              )}
              <Button
                onClick={handleVerify}
                size="lg"
                className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground rounded-full px-12 py-6 text-base font-bold w-full sm:w-auto animate-pulse shadow-elevated"
              >
                {adClicked ? "Click Again to Verify" : "Verify"}
              </Button>
            </>
          )}
          {verified && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-success font-bold text-lg">
                <CheckCircle2 className="h-6 w-6" /> Verified!
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 animate-bounce">
                <ChevronDown className="h-4 w-4" /> Scroll down & click Continue
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MIDDLE ADS — fewer for light steps */}
      {!isLightStep ? (
        <>
          <BannerSection title="Sponsored">
            <AdSlot slotKey="adsterra_300x250" minHeight={250} className="w-[300px] mx-auto" fallback={<FakeBanner />} />
          </BannerSection>
          <BannerSection title="Recommended">
            <AdSlot slotKey="adsterra_native" minHeight={200} fallback={<FakeBanner />} />
          </BannerSection>
        </>
      ) : (
        <BannerSection title="Sponsored">
          <FakeBanner />
        </BannerSection>
      )}

      {/* BOTTOM CARD: Continue */}
      <section
        ref={continueRef}
        className={`bg-card rounded-2xl border-2 shadow-elevated p-4 md:p-6 space-y-4 ${
          verified ? "ring-4 ring-success/30" : "opacity-90"
        }`}
      >
        <div className="text-center space-y-2">
          <div className="text-xl font-extrabold">
            Click <span className="text-primary">Continue</span> to get your link
          </div>
          <p className="text-sm text-muted-foreground">
            Step {step} of {totalSteps} — almost there!
          </p>
        </div>

        <AdSlot slotKey={`step${Math.min(step, 4)}_continue`} minHeight={200} fallback={<FakeBanner />} />

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
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Opening…
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
          🔴 <b className="text-primary">Steps to get link</b>
          <div className="flex justify-around mt-2 font-semibold text-foreground">
            <span>1. Click ad</span>
            <span>2. Wait 10s</span>
            <span>3. Come back</span>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   FINAL FLOW — Telegram-style design, no ad on Get Link button
   ============================================================ */
function FinalFlow({ countdown, onContinue }: { countdown: number; onContinue: () => void }) {
  return (
    <>
      {/* Telegram-style hero card */}
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

        {/* Telegram CTA buttons */}
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
        <div className="px-6 pb-6 text-center">
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

        {/* Get Link button — NO ads next to it */}
        <div className="px-6 pb-6 text-center">
          {countdown > 0 ? (
            <Button
              disabled
              size="lg"
              className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto"
            >
              <Lock className="h-4 w-4 mr-2" /> Please wait {countdown}s
            </Button>
          ) : (
            <Button
              onClick={onContinue}
              size="lg"
              className="rounded-full px-12 py-6 text-base font-bold bg-success hover:bg-success/90 text-success-foreground w-full sm:w-auto animate-pulse shadow-elevated"
            >
              Get Link <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Single small bottom banner — NOT next to Get Link */}
      <section className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 border-b">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Sponsored
          </span>
          <span className="text-[9px] uppercase tracking-wider bg-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded">
            Ad
          </span>
        </div>
        <div className="p-3">
          <FakeBanner compact />
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 space-y-2">
        <div className="flex justify-center gap-3">
          <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Users className="h-3 w-3" /> Channel
          </a>
          <a href={TELEGRAM_PROFILE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <MessageCircle className="h-3 w-3" /> Contact
          </a>
        </div>
        <div>© RS Anime Link {new Date().getFullYear()}</div>
      </div>
    </>
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
