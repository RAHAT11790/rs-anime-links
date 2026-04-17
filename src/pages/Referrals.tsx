import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function Referrals() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("referrals").select("*").eq("referrer_id", user.id),
      supabase.from("profiles").select("referral_earnings,username").eq("user_id", user.id).maybeSingle(),
    ]).then(([{ data: r }, { data: p }]) => { setList(r ?? []); setProfile(p); });
  }, [user]);

  const refLink = user ? `${window.location.origin}/register?ref=${user.id}` : "";

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Referrals</h1>
      <div className="bg-gradient-purple text-white rounded-xl p-6 space-y-2">
        <div className="text-sm opacity-90">Earn 20% of your referrals' lifetime earnings</div>
        <div className="text-3xl font-bold">${Number(profile?.referral_earnings ?? 0).toFixed(2)}</div>
        <div className="text-xs opacity-75">Total Referral Earnings</div>
      </div>
      <div className="bg-card border rounded-xl p-4 shadow-card">
        <div className="font-bold mb-2">Your Referral Link</div>
        <div className="flex gap-2">
          <Input value={refLink} readOnly />
          <Button onClick={() => { navigator.clipboard.writeText(refLink); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="p-4 font-bold border-b">Referred Users ({list.length})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="p-3 text-left">Joined</th><th className="p-3 text-right">Earned</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={2} className="text-center p-6 text-muted-foreground">No referrals yet.</td></tr>}
              {list.map((r) => (
                <tr key={r.id} className="border-t"><td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td><td className="p-3 text-right">${Number(r.earned).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
