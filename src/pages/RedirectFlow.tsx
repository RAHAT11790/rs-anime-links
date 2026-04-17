import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot, FakeBanner } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";

type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0 loading, 1-3 ad steps, 4 final gate, 5 redirect

const STEP_WAIT = 10;
const FINAL_WAIT = 5;

export default function RedirectFlow() {
  const { code } = useParams();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [link, setLink] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(STEP_WAIT);
  const [verified, setVerified] = useState(false);

  // load link
  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data, error } = await supabase.from("links").select("*").eq("short_code", code).maybeSingle();
      if (error || !data) { setError("Link not found"); return; }
      if (data.status !== "active") { setError("This link has been disabled"); return; }
      setLink(data);
      setStep(1);
      // log click
      try { await supabase.functions.invoke("track-click", { body: { link_id: data.id } }); } catch {}
    })();
  }, [code]);

  // countdown timer
  useEffect(() => {
    if (step === 0 || step === 5) return;
    setCountdown(step === 4 ? FINAL_WAIT : STEP_WAIT);
    setVerified(false);
    const t = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [step]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">{error}</h1>
        <Button onClick={() => nav("/")}>Go Home</Button>
      </div>
    </div>;
  }
  if (step === 0 || !link) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (step === 5) {
    window.location.href = link.original_url;
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Loader2 className="animate-spin mx-auto mb-2" /><div>Redirecting…</div></div></div>;
  }

  const totalSteps = 3;
  const stepLabel = step <= 3 ? `${step}/${totalSteps}` : `${totalSteps}/${totalSteps}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary text-secondary-foreground">
        <div className="container flex items-center justify-between py-2">
          <img src={logo} alt="RS ANIME LINK" width={1024} height={512} className="h-8 w-auto bg-white px-2 py-1 rounded" />
        </div>
      </header>

      <div className="container py-3">
        <div className="bg-card border rounded-lg px-4 py-2 text-center font-bold shadow-card">
          You are currently on step <span className="text-brand-red">{stepLabel}</span>
        </div>
      </div>

      <main className="container max-w-2xl pb-8 space-y-4">
        {step <= 3 && <StepAd step={step} verified={verified} setVerified={setVerified} countdown={countdown} setStep={setStep} />}
        {step === 4 && <FinalGate countdown={countdown} onContinue={() => setStep(5)} />}

        {/* Bottom fake banners always */}
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <FakeBanner />
          <FakeBanner />
        </div>
      </main>
    </div>
  );
}

function StepAd({ step, verified, setVerified, countdown, setStep }: any) {
  const isStep1 = step === 1;
  const isStep2 = step === 2;
  const isStep3 = step === 3;

  return (
    <div className="bg-card rounded-xl border shadow-card p-4 space-y-4">
      <div className="space-y-2">
        <div className="font-bold flex items-start gap-2">
          <span>👇</span>
          <span>Click Image &amp; Wait &amp; Come back this page to <span className="text-brand-red">Get Link - Download</span>.</span>
        </div>
        <div className="text-sm">
          ▼ <span className="text-brand-red font-bold">LINK পানে এবং DOWNLOAD করতে</span> এর জন্য, 👇 ছবিতে ক্লিক করুন,
          <span className="text-primary font-bold"> {countdown} সেকেন্ড অপেক্ষা করুন</span> এবং ফিরে আসুন।
        </div>
      </div>

      {/* Real ad slot */}
      <AdSlot slotKey={`step${step}_banner`} fallback={<FakeBanner />} className="min-h-[260px]" />

      {/* Verify / Continue button */}
      {!verified && countdown > 0 && (
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-2">Wait {countdown}s before continuing…</div>
          <Button disabled className="bg-muted">
            <Lock className="h-4 w-4 mr-1" /> {countdown}s
          </Button>
        </div>
      )}
      {!verified && countdown === 0 && (
        <div className="text-center">
          <Button onClick={() => setVerified(true)} size="lg" className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground rounded-full px-10 font-bold">
            {isStep1 ? "Verify" : isStep2 ? "Click Here Continue" : "Click Here Continue"}
          </Button>
        </div>
      )}
      {verified && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-success font-bold">
            <CheckCircle2 className="h-5 w-5" /> Verified!
          </div>
          <p className="text-sm text-muted-foreground">
            {isStep1 && "Great! Now scroll down and click Continue to go to step 2."}
            {isStep2 && "Awesome! Scroll down and continue to step 3."}
            {isStep3 && "Almost there! Continue to the final step."}
          </p>
          <Button onClick={() => setStep(step + 1)} size="lg" className="bg-success hover:bg-success/90 text-success-foreground rounded-full px-10 font-bold">
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

function FinalGate({ countdown, onContinue }: { countdown: number; onContinue: () => void }) {
  return (
    <div className="bg-card rounded-xl border shadow-card p-4 space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold mb-1">🎉 Final Step</div>
        <p className="text-sm text-muted-foreground">Wait {countdown} seconds for your link…</p>
      </div>
      <AdSlot slotKey="step3_banner" fallback={<FakeBanner />} className="min-h-[200px]" />
      <div className="text-center">
        {countdown > 0 ? (
          <Button disabled size="lg" className="rounded-full px-10 font-bold bg-muted">
            <Lock className="h-4 w-4 mr-1" /> Get Link in {countdown}s
          </Button>
        ) : (
          <Button onClick={onContinue} size="lg" className="rounded-full px-10 font-bold bg-success hover:bg-success/90 text-success-foreground">
            Get Link <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
