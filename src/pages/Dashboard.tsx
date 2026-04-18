import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Eye, DollarSign, Users, Percent, Copy, Share2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [shorted, setShorted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0, totalEarnings: 0, refEarnings: 0, avgCpm: 0,
    todayViews: 0, todayEarnings: 0, todayRef: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (profile) {
        // TODAY ONLY (resets every midnight)
        const today = new Date(); today.setHours(0,0,0,0);
        const { data: todayClicks } = await supabase.from("clicks")
          .select("earned").eq("user_id", user.id).gte("created_at", today.toISOString());
        const tEarn = (todayClicks ?? []).reduce((s, c: any) => s + Number(c.earned), 0);

        // Today's referral earnings — 20% of clicks made today by referred users
        const { data: refs } = await supabase.from("referrals").select("referred_id").eq("referrer_id", user.id);
        let tRef = 0;
        if (refs && refs.length) {
          const ids = refs.map((r: any) => r.referred_id);
          const { data: refClicks } = await supabase.from("clicks")
            .select("earned").in("user_id", ids).gte("created_at", today.toISOString());
          tRef = (refClicks ?? []).reduce((s, c: any) => s + Number(c.earned) * 0.20, 0);
        }

        setStats({
          totalViews: Number(profile.total_views), totalEarnings: Number(profile.total_earnings),
          refEarnings: Number(profile.referral_earnings), avgCpm: Number(profile.cpm_rate),
          todayViews: (todayClicks ?? []).length, todayEarnings: tEarn, todayRef: tRef,
        });
      }
    })();
  }, [user]);

  const shorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const code = Array.from({length:6}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*62)]).join("");
      const { data, error } = await supabase.from("links").insert({
        user_id: user.id, original_url: url, short_code: code,
      }).select().single();
      if (error) throw error;
      setShorted(`${window.location.origin}/s/${data.short_code}`);
      setUrl("");
      toast.success("Link shortened!");
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-sm text-muted-foreground">Dashboard / Dashboard</div>

      {/* Shortener */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2 font-medium"><Plus className="h-5 w-5 text-primary" /> New Short Link / URL</div>
        <form onSubmit={shorten} className="p-4 space-y-3">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Your URL Here" type="url" required />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? "..." : "Shorten"}</Button>
            <Button type="button" variant="outline">Advanced Options</Button>
          </div>
          {shorted && (
            <div className="space-y-2">
              <Input value={shorted} readOnly className="text-success font-medium" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(shorted); toast.success("Copied!"); }}><Copy className="h-3 w-3 mr-1" /> COPY</Button>
                <Button variant="outline" size="sm" onClick={() => { navigator.share?.({ url: shorted }).catch(() => {}); }}><Share2 className="h-3 w-3 mr-1" /> SHARE</Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Plan banner */}
      <div className="rounded-xl bg-gradient-purple text-white p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">$</div>
          <div className="font-bold">You are on Default - $10 CPM</div>
        </div>
        <a href="/plans" className="bg-brand-red px-3 py-1.5 rounded text-sm font-bold">Change Plan</a>
      </div>

      {/* This month report */}
      <div className="rounded-xl overflow-hidden border bg-secondary text-secondary-foreground">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-medium">This Months report  /  {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long" })}</div>
        <div className="divide-y divide-sidebar-border">
          <Row label="Total Views" value={stats.totalViews.toString()} icon={<Eye />} color="bg-primary" />
          <Row label="Total Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} icon={<DollarSign />} color="bg-success" />
          <Row label="Referral Earnings" value={`$${stats.refEarnings.toFixed(2)}`} icon={<Users />} color="bg-accent" />
          <Row label="Average CPM" value={stats.avgCpm.toFixed(0)} icon={<Percent />} color="bg-warning" />
        </div>
      </div>

      {/* Today */}
      <div className="rounded-xl overflow-hidden border bg-card shadow-card">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-medium">Today's report  /  {new Date().toLocaleString()}</div>
        <div className="p-4 space-y-3">
          <StatRow label="VIEWS" value={stats.todayViews.toString()} color="border-success bg-success/10 text-success" icon={<Eye className="text-success" />} />
          <StatRow label="EARNINGS" value={`$${stats.todayEarnings.toFixed(2)}`} color="border-primary bg-primary/10 text-primary" icon={<DollarSign className="text-primary" />} />
          <StatRow label="REFERRAL EARNINGS" value={`$${stats.todayRef.toFixed(2)}`} color="border-brand-red bg-brand-red/10 text-brand-red" icon={<Users className="text-brand-red" />} />
          <StatRow label="AVERAGE CPM" value={stats.avgCpm.toFixed(0)} color="border-accent bg-accent/10 text-accent" icon={<Percent className="text-accent" />} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <div className="text-sm opacity-75">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className={`h-10 w-10 rounded-lg ${color} text-white flex items-center justify-center`}>{icon}</div>
    </div>
  );
}

function StatRow({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className={`rounded-lg border-l-4 p-3 flex items-center justify-between ${color}`}>
      <div>
        <div className="text-xs font-bold tracking-wide">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
      <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center">{icon}</div>
    </div>
  );
}
