import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Link2, Wallet, Eye, DollarSign } from "lucide-react";

export function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, links: 0, clicks: 0, pending: 0, paid: 0 });
  useEffect(() => {
    (async () => {
      const [u, l, c, w, p] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("links").select("*", { count: "exact", head: true }),
        supabase.from("clicks").select("*", { count: "exact", head: true }),
        supabase.from("withdrawals").select("amount").eq("status", "pending"),
        supabase.from("withdrawals").select("amount").eq("status", "paid"),
      ]);
      setStats({
        users: u.count ?? 0, links: l.count ?? 0, clicks: c.count ?? 0,
        pending: (w.data ?? []).reduce((s: number, x: any) => s + Number(x.amount), 0),
        paid: (p.data ?? []).reduce((s: number, x: any) => s + Number(x.amount), 0),
      });
    })();
  }, []);
  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-primary" },
    { label: "Total Links", value: stats.links, icon: Link2, color: "bg-accent" },
    { label: "Total Clicks", value: stats.clicks, icon: Eye, color: "bg-success" },
    { label: "Pending Payouts", value: `$${stats.pending.toFixed(2)}`, icon: Wallet, color: "bg-warning" },
    { label: "Total Paid Out", value: `$${stats.paid.toFixed(2)}`, icon: DollarSign, color: "bg-brand-red" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 shadow-card flex items-center justify-between">
            <div><div className="text-sm text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></div>
            <div className={`h-12 w-12 rounded-lg text-white flex items-center justify-center ${color}`}><Icon /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const updateBalance = async (id: string, current: number) => {
    const v = prompt("New balance:", String(current)); if (v == null) return;
    await supabase.from("profiles").update({ balance: parseFloat(v) }).eq("user_id", id); load();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users ({users.length})</h1>
      <div className="bg-card border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Email</th><th className="p-3 text-right">Balance</th><th className="p-3 text-right">Earnings</th><th className="p-3 text-right">CPM</th><th className="p-3"></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-right">${Number(u.balance).toFixed(2)}</td>
                <td className="p-3 text-right">${Number(u.total_earnings).toFixed(2)}</td>
                <td className="p-3 text-right">${Number(u.cpm_rate).toFixed(2)}</td>
                <td className="p-3 text-right"><button onClick={() => updateBalance(u.user_id, Number(u.balance))} className="text-primary text-xs underline">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminLinks() {
  const [links, setLinks] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("links").select("*").order("created_at", { ascending: false }).limit(200); setLinks(data ?? []); };
  useEffect(() => { load(); }, []);
  const toggle = async (id: string, status: string) => {
    await supabase.from("links").update({ status: status === "active" ? "disabled" : "active" }).eq("id", id); load();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All Links ({links.length})</h1>
      <div className="bg-card border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Original</th><th className="p-3 text-right">Views</th><th className="p-3 text-right">Status</th></tr></thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3 font-mono">{l.short_code}</td>
                <td className="p-3 max-w-xs truncate text-muted-foreground">{l.original_url}</td>
                <td className="p-3 text-right">{l.views}</td>
                <td className="p-3 text-right"><button onClick={() => toggle(l.id, l.status)} className={`text-xs px-2 py-0.5 rounded ${l.status === "active" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>{l.status}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminWithdrawals() {
  const [list, setList] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("withdrawals").select("*, profiles(username,email)").order("created_at", { ascending: false }); setList(data ?? []); };
  useEffect(() => { load(); }, []);
  const setStatus = async (id: string, status: string) => {
    await supabase.from("withdrawals").update({ status }).eq("id", id); load();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Withdrawals</h1>
      <div className="bg-card border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">User</th><th className="p-3 text-left">Method</th><th className="p-3 text-left">Address</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-3">{new Date(w.created_at).toLocaleDateString()}</td>
                <td className="p-3">{w.profiles?.username}</td>
                <td className="p-3">{w.method}</td>
                <td className="p-3 font-mono text-xs">{w.address}</td>
                <td className="p-3 text-right">${Number(w.amount).toFixed(2)}</td>
                <td className="p-3 text-right">{w.status}</td>
                <td className="p-3 text-right space-x-1 whitespace-nowrap">
                  <button onClick={() => setStatus(w.id, "approved")} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Approve</button>
                  <button onClick={() => setStatus(w.id, "paid")} className="text-xs bg-success text-success-foreground px-2 py-1 rounded">Paid</button>
                  <button onClick={() => setStatus(w.id, "rejected")} className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminAds() {
  const [slots, setSlots] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("ad_slots").select("*").order("slot_key"); setSlots(data ?? []); };
  useEffect(() => { load(); }, []);
  const save = async (id: string, code: string, enabled: boolean) => {
    await supabase.from("ad_slots").update({ script_code: code, enabled }).eq("id", id);
    alert("Saved");
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ad Slots</h1>
      <p className="text-sm text-muted-foreground">Paste your Adsterra / PopAds / AdSense / custom HTML &amp; JS for each slot. Leave empty to use fake demo banners.</p>
      <div className="space-y-3">
        {slots.map((s) => (
          <SlotEditor key={s.id} slot={s} onSave={save} />
        ))}
      </div>
    </div>
  );
}

function SlotEditor({ slot, onSave }: any) {
  const [code, setCode] = useState(slot.script_code || "");
  const [enabled, setEnabled] = useState(slot.enabled);
  return (
    <div className="bg-card border rounded-xl p-4 shadow-card space-y-2">
      <div className="flex items-center justify-between">
        <div><div className="font-bold">{slot.name}</div><div className="text-xs text-muted-foreground font-mono">{slot.slot_key}</div></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Enabled</label>
      </div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={4} className="w-full font-mono text-xs border rounded p-2 bg-background" placeholder="<script>...</script> or <iframe>...</iframe>" />
      <button onClick={() => onSave(slot.id, code, enabled)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-bold">Save</button>
    </div>
  );
}

export function AdminSettings() {
  const [site, setSite] = useState<any>(null);
  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "site").maybeSingle()
      .then(({ data }) => setSite(data?.value ?? {}));
  }, []);
  if (!site) return null;
  const save = async () => { await supabase.from("settings").update({ value: site }).eq("key", "site"); alert("Saved"); };
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <div className="bg-card border rounded-xl p-4 shadow-card space-y-3">
        {[
          ["name", "Site name"], ["cpm_default", "Default CPM ($)"], ["min_withdraw", "Min Withdraw ($)"],
          ["referral_percent", "Referral %"], ["step_wait", "Step wait (sec)"], ["final_wait", "Final gate wait (sec)"],
        ].map(([k, label]) => (
          <div key={k}>
            <label className="text-sm font-medium">{label}</label>
            <input value={site[k] ?? ""} onChange={(e) => setSite({ ...site, [k]: isNaN(Number(e.target.value)) || k === "name" ? e.target.value : Number(e.target.value) })}
              className="w-full h-10 border rounded px-3 bg-background" />
          </div>
        ))}
        <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold">Save Settings</button>
      </div>
    </div>
  );
}
