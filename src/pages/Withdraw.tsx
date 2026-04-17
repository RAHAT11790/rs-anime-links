import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Withdraw() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("PayPal");
  const [address, setAddress] = useState("");
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: w }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p); setList(w ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const a = parseFloat(amount);
    if (a < 5) return toast.error("Minimum withdraw is $5");
    if (a > Number(profile?.balance ?? 0)) return toast.error("Insufficient balance");
    const { error } = await supabase.from("withdrawals").insert({ user_id: user.id, amount: a, method, address });
    if (error) toast.error(error.message); else { toast.success("Withdraw requested"); setAmount(""); setAddress(""); load(); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Withdraw</h1>
      <div className="bg-gradient-primary text-primary-foreground rounded-xl p-6">
        <div className="text-sm opacity-90">Available Balance</div>
        <div className="text-4xl font-bold">${Number(profile?.balance ?? 0).toFixed(2)}</div>
        <div className="text-xs opacity-75 mt-1">Minimum withdraw: $5.00</div>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border p-4 space-y-3 shadow-card">
        <h2 className="font-bold">Request Withdraw</h2>
        <div><Label>Amount ($)</Label><Input type="number" step="0.01" min="5" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
        <div><Label>Method</Label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded h-10 px-3 bg-background">
            <option>PayPal</option><option>USDT (TRC20)</option><option>bKash</option><option>Nagad</option><option>Bitcoin</option>
          </select>
        </div>
        <div><Label>Address / Email / Number</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
        <Button type="submit">Submit Request</Button>
      </form>
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 font-bold border-b">Withdraw History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Method</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Status</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={4} className="text-center p-6 text-muted-foreground">No withdrawals yet.</td></tr>}
              {list.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="p-3">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="p-3">{w.method}</td>
                  <td className="p-3 text-right">${Number(w.amount).toFixed(2)}</td>
                  <td className="p-3 text-right"><span className={`px-2 py-0.5 rounded text-xs ${w.status === "paid" ? "bg-success text-success-foreground" : w.status === "rejected" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
