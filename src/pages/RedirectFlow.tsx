import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot, FakeBanner, FakeBannerGrid, TopBanner, GlobalAdScripts } from "@/components/AdSlot";
import { AdBlockGuard } from "@/components/AdBlockGuard";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Lock, CheckCircle2, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

// Direct-link / popunder URLs that open in a NEW TAB on first click of every step.
// Replace the placeholder with your real Adsterra/Monetag direct-link URLs in DB later.
const DIRECT_LINKS = [
  "https://www.profitablecpmratenetwork.com/m1qkz3rrt?key=auto",
  "https://5gvci.com/4/10891433",
];
function pickDirectLink() {
  return DIRECT_LINKS[Math.floor(Math.random() * DIRECT_LINKS.length)];
}

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
  const [step, setStep] = useState(0); // 0 loading, 1..N ad steps, N+1 final gate, N+2 redirect
  const [link, setLink] = useState<any>(null);
  const [ownerPlan, setOwnerPlan] = useState<string>("Default");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(STEP_WAIT);
  const [verified, setVerified] = useState(false);

  // load link + owner's plan
  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data, error } = await supabase.from("links").select("*").eq("short_code", code).maybeSingle();
      if (error || !data) {
        setError("Link not found");
        return;
      }
      if (data.status !== "active") {
        setError("This link has been disabled");
        return;
      }
      setLink(data);

      const { data: prof } = await supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", data.user_id)
        .maybeSingle();
      setOwnerPlan(prof?.plan || "Default");

      // settings override
      const { data: settings } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "plan_steps")
        .maybeSingle();
      if (settings?.value) {
        Object.assign(PLAN_STEPS, settings.value as Record<string, number>);
      }

      setStep(1);

      // Track click — use admin-configurable base URL if set, fallback to default
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
  const finalStepNum = totalSteps + 1; // gate
  const redirectStepNum = totalSteps + 2;

  // countdown
  useEffect(() => {
    if (step === 0 || step >= redirectStepNum) return;
    setCountdown(step === finalStepNum ? FINAL_WAIT : STEP_WAIT);
    setVerified(false);
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

  return (
    <AdBlockGuard>
    <div className="min-h-screen bg-background">
      {/* Mount real ad scripts (popunder / monetag SW) ONLY on the redirect flow */}
      <GlobalAdScripts />

      {/* Sticky header */}
      <header className="bg-secondary text-secondary-foreground sticky top-0 z-30 shadow-elevated">
        <div className="container flex items-center justify-between py-2">
          <img
            src={logo}
            alt="RS ANIME LINK"
            width={200}
            height={48}
            className="h-9 w-auto bg-white px-2 py-1 rounded"
          />
          <div className="flex items-center gap-1 text-xs font-bold">
            <Shield className="h-3.5 w-3.5 text-success" /> Secure Gateway
          </div>
        </div>
      </header>

      {/* Top banner — appears on EVERY step */}
      <TopBanner />

      {/* Step indicator */}
      <div className="container max-w-3xl py-3">
        <div className="bg-card border rounded-lg px-4 py-3 text-center font-bold shadow-card">
          You are on step{" "}
          <span className="text-brand-red text-lg">{stepLabel}</span>
          <span className="text-muted-foreground font-normal text-xs ml-2">
            (Plan: {ownerPlan})
          </span>
        </div>
      </div>

      <main className="container max-w-3xl pb-10 space-y-5">
        {!isFinalGate && (
          <StepAd
            step={step}
            totalSteps={totalSteps}
            verified={verified}
            setVerified={setVerified}
            countdown={countdown}
            onContinue={() => setStep(step + 1)}
          />
        )}
        {isFinalGate && (
          <FinalGate countdown={countdown} onContinue={() => setStep(redirectStepNum)} />
        )}

        {/* Adsterra 300x250 banner */}
        <div className="flex justify-center">
          <AdSlot slotKey="adsterra_300x250" minHeight={250} className="w-[300px] mx-auto" fallback={<FakeBanner />} />
        </div>

        {/* Mid fake banner */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 text-center">
            — Sponsored —
          </div>
          <FakeBanner />
        </div>

        {/* Real native banner */}
        <AdSlot slotKey="adsterra_native" minHeight={200} fallback={<FakeBanner />} />

        {/* Bottom fake banner grid */}
        <div className="pt-2">
          <div className="text-xs font-bold mb-2 text-muted-foreground">You may also like</div>
          <FakeBannerGrid count={4} />
        </div>
      </main>
    </div>
    </AdBlockGuard>
  );
}

function StepAd({
  step,
  totalSteps,
  verified,
  setVerified,
  countdown,
  onContinue,
}: {
  step: number;
  totalSteps: number;
  verified: boolean;
  setVerified: (v: boolean) => void;
  countdown: number;
  onContinue: () => void;
}) {
  const slotKey = `step${Math.min(step, 4)}_banner`;
  const [adClicked, setAdClicked] = useState(false);
  const cta = step === 1 ? "Verify" : "Click Here Continue";

  // 2-click system: 1st click → opens direct-link in new tab, 2nd click → marks verified
  const handleVerifyClick = () => {
    if (!adClicked) {
      try {
        window.open(pickDirectLink(), "_blank", "noopener,noreferrer");
      } catch {}
      setAdClicked(true);
      return;
    }
    setVerified(true);
  };

  return (
    <div className="bg-card rounded-2xl border-2 shadow-elevated p-4 md:p-6 space-y-5">
      <div className="space-y-2">
        <div className="font-bold flex items-start gap-2 text-base md:text-lg">
          <span>👇</span>
          <span>
            Click the image &amp; wait, then come back to{" "}
            <span className="text-brand-red">Get Download Link</span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          ▼ <span className="text-brand-red font-bold">LINK পেতে এবং DOWNLOAD করতে</span> 👇 ছবিতে ক্লিক করুন,
          <span className="text-primary font-bold"> {countdown} সেকেন্ড অপেক্ষা করুন</span> এবং ফিরে আসুন।
        </div>
      </div>

      {/* Real ad slot — BIG */}
      <AdSlot
        slotKey={slotKey}
        minHeight={320}
        fallback={<FakeBanner />}
        className="w-full"
      />

      {/* Verify / Continue */}
      <div className="text-center pt-2">
        {!verified && countdown > 0 && (
          <>
            <div className="text-xs text-muted-foreground mb-2">
              Please wait {countdown}s before continuing…
            </div>
            <Button
              disabled
              size="lg"
              className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto"
            >
              <Lock className="h-4 w-4 mr-2" /> {countdown}s
            </Button>
          </>
        )}
        {!verified && countdown === 0 && (
          <>
            {adClicked && (
              <div className="text-xs text-success mb-2 font-semibold">
                ✓ Ad opened — click the button again to continue
              </div>
            )}
            <Button
              onClick={handleVerifyClick}
              size="lg"
              className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground rounded-full px-12 py-6 text-base font-bold w-full sm:w-auto animate-pulse"
            >
              {adClicked ? "Click Again to Continue" : cta}
            </Button>
          </>
        )}
        {verified && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-success font-bold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Verified!
            </div>
            <p className="text-sm text-muted-foreground">
              Great! Scroll down and click Continue to go to step {step + 1}.
            </p>
            <Button
              onClick={onContinue}
              size="lg"
              className="bg-success hover:bg-success/90 text-success-foreground rounded-full px-12 py-6 text-base font-bold w-full sm:w-auto"
            >
              Continue <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FinalGate({ countdown, onContinue }: { countdown: number; onContinue: () => void }) {
  const [adClicked, setAdClicked] = useState(false);
  const handleClick = () => {
    if (!adClicked) {
      try {
        window.open(pickDirectLink(), "_blank", "noopener,noreferrer");
      } catch {}
      setAdClicked(true);
      return;
    }
    onContinue();
  };
  return (
    <div className="bg-card rounded-2xl border-2 shadow-elevated p-4 md:p-6 space-y-5">
      <div className="text-center">
        <div className="text-3xl font-extrabold mb-1">🎉 Final Step</div>
        <p className="text-sm text-muted-foreground">
          Your link will unlock in <b className="text-brand-red">{countdown}s</b>
        </p>
      </div>
      <AdSlot slotKey="step4_banner" minHeight={280} fallback={<FakeBanner />} />
      <div className="text-center pt-2">
        {countdown > 0 ? (
          <Button
            disabled
            size="lg"
            className="rounded-full px-12 py-6 text-base font-bold bg-muted w-full sm:w-auto"
          >
            <Lock className="h-4 w-4 mr-2" /> Get Link in {countdown}s
          </Button>
        ) : (
          <>
            {adClicked && (
              <div className="text-xs text-success mb-2 font-semibold">
                ✓ Ad opened — click again to get your link
              </div>
            )}
            <Button
              onClick={handleClick}
              size="lg"
              className="rounded-full px-12 py-6 text-base font-bold bg-success hover:bg-success/90 text-success-foreground w-full sm:w-auto animate-pulse"
            >
              {adClicked ? "Click Again to Get Link" : "Get Link"} <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
