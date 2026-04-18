import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Link2, Wallet, Eye, DollarSign, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
        users: u.count ?? 0,
        links: l.count ?? 0,
        clicks: c.count ?? 0,
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
    <div className="space-y-4 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card border rounded-xl p-4 shadow-card flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
            <div className={`h-12 w-12 rounded-lg text-white flex items-center justify-center ${color}`}>
              <Icon />
            </div>
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
  useEffect(() => {
    load();
  }, []);
  const updateBalance = async (id: string, current: number) => {
    const v = prompt("New balance:", String(current));
    if (v == null) return;
    await supabase.from("profiles").update({ balance: parseFloat(v) }).eq("user_id", id);
    load();
  };
  const setPlan = async (id: string, current: string) => {
    const v = prompt("Plan (Default / Premium / Pro / Top):", current);
    if (!v) return;
    const cpm = { Default: 4, Premium: 6, Pro: 8, Top: 10 }[v as string] ?? 4;
    await supabase.from("profiles").update({ plan: v, cpm_rate: cpm }).eq("user_id", id);
    load();
  };
  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold">Users ({users.length})</h1>
      <div className="bg-card border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-right">Balance</th>
              <th className="p-3 text-right">Earnings</th>
              <th className="p-3 text-right">CPM</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">{u.plan}</td>
                <td className="p-3 text-right">${Number(u.balance).toFixed(2)}</td>
                <td className="p-3 text-right">${Number(u.total_earnings).toFixed(2)}</td>
                <td className="p-3 text-right">${Number(u.cpm_rate).toFixed(2)}</td>
                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => updateBalance(u.user_id, Number(u.balance))}
                    className="text-primary text-xs underline"
                  >
                    Balance
                  </button>
                  <button onClick={() => setPlan(u.user_id, u.plan)} className="text-accent text-xs underline">
                    Plan
                  </button>
                </td>
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
  const load = async () => {
    const { data } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLinks(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);
  const toggle = async (id: string, status: string) => {
    await supabase
      .from("links")
      .update({ status: status === "active" ? "disabled" : "active" })
      .eq("id", id);
    load();
  };
  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold">All Links ({links.length})</h1>
      <div className="bg-card border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Original</th>
              <th className="p-3 text-right">Views</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3 font-mono">{l.short_code}</td>
                <td className="p-3 max-w-xs truncate text-muted-foreground">{l.original_url}</td>
                <td className="p-3 text-right">{l.views}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggle(l.id, l.status)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      l.status === "active"
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {l.status}
                  </button>
                </td>
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
  const load = async () => {
    const { data } = await supabase
      .from("withdrawals")
      .select("*, profiles(username,email)")
      .order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);
  const setStatus = async (id: string, status: "approved" | "paid" | "pending" | "rejected") => {
    await supabase.from("withdrawals").update({ status }).eq("id", id);
    load();
  };
  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold">Withdrawals</h1>
      <div className="bg-card border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-right">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
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
                  <button
                    onClick={() => setStatus(w.id, "approved")}
                    className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setStatus(w.id, "paid")}
                    className="text-xs bg-success text-success-foreground px-2 py-1 rounded"
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setStatus(w.id, "rejected")}
                    className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============== Ad Slots — fully dynamic add/edit/delete ============== */

export function AdminAds() {
  const [slots, setSlots] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const load = async () => {
    const { data } = await supabase.from("ad_slots").select("*").order("slot_key");
    setSlots(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (id: string, code: string, enabled: boolean, name: string) => {
    const { error } = await supabase
      .from("ad_slots")
      .update({ script_code: code, enabled, name })
      .eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Ad slot saved ✓");
  };

  const remove = async (id: string, slot_key: string) => {
    if (!confirm(`Delete slot "${slot_key}"?`)) return;
    const { error } = await supabase.from("ad_slots").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Ad Slots</h1>
          <p className="text-sm text-muted-foreground">
            Paste Adsterra / Monetag / AdSense / any custom HTML &amp; JS. Empty = fake demo banner.
          </p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add Slot
        </Button>
      </div>

      {showNew && <NewSlot onClose={() => setShowNew(false)} onCreated={load} />}

      <div className="space-y-3">
        {slots.map((s) => (
          <SlotEditor key={s.id} slot={s} onSave={save} onRemove={remove} />
        ))}
      </div>
    </div>
  );
}

function NewSlot({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [code, setCode] = useState("");
  const create = async () => {
    if (!name || !key) return toast.error("Name and slot_key required");
    const { error } = await supabase.from("ad_slots").insert({
      name,
      slot_key: key.replace(/\s+/g, "_").toLowerCase(),
      script_code: code,
      enabled: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Created");
      onCreated();
      onClose();
    }
  };
  return (
    <div className="bg-card border-2 border-primary rounded-xl p-4 shadow-elevated space-y-3">
      <div className="font-bold">+ New Ad Slot</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Display Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sidebar Banner" />
        </div>
        <div>
          <Label>Slot Key (use in code)</Label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. sidebar_banner" />
        </div>
      </div>
      <div>
        <Label>Script / HTML</Label>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={5}
          className="font-mono text-xs"
          placeholder="<script>...</script>"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={create} className="flex-1 sm:flex-initial">
          Create
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function SlotEditor({
  slot,
  onSave,
  onRemove,
}: {
  slot: any;
  onSave: (id: string, code: string, enabled: boolean, name: string) => void;
  onRemove: (id: string, slot_key: string) => void;
}) {
  const [code, setCode] = useState(slot.script_code || "");
  const [enabled, setEnabled] = useState(slot.enabled);
  const [name, setName] = useState(slot.name);
  return (
    <div className="bg-card border rounded-xl p-4 shadow-card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-[200px]">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-bold border-0 px-0 h-auto py-1 text-base focus-visible:ring-0"
          />
          <div className="text-xs text-muted-foreground font-mono">{slot.slot_key}</div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4"
          />{" "}
          Enabled
        </label>
      </div>
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={4}
        className="font-mono text-xs"
        placeholder="<script>...</script> or <iframe>...</iframe>"
      />
      <div className="flex flex-wrap gap-2 sticky bottom-0">
        <Button onClick={() => onSave(slot.id, code, enabled, name)} className="flex-1 sm:flex-initial gap-1">
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button
          variant="destructive"
          onClick={() => onRemove(slot.id, slot.slot_key)}
          className="flex-1 sm:flex-initial gap-1"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [site, setSite] = useState<any>(null);
  const [planSteps, setPlanSteps] = useState<any>({ Default: 2, Premium: 2, Pro: 3, Top: 4 });
  const [funcBase, setFuncBase] = useState<string>("");
  const defaultBase = (import.meta as any).env?.VITE_SUPABASE_URL || "";

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: ps }, { data: fb }] = await Promise.all([
        supabase.from("settings").select("value").eq("key", "site").maybeSingle(),
        supabase.from("settings").select("value").eq("key", "plan_steps").maybeSingle(),
        supabase.from("settings").select("value").eq("key", "function_base_url").maybeSingle(),
      ]);
      setSite(s?.value ?? {});
      if (ps?.value) setPlanSteps(ps.value);
      setFuncBase((fb?.value as string) || "");
    })();
  }, []);

  if (!site) return null;

  const save = async () => {
    const [r1, r2, r3] = await Promise.all([
      supabase.from("settings").upsert({ key: "site", value: site }),
      supabase.from("settings").upsert({ key: "plan_steps", value: planSteps }),
      supabase.from("settings").upsert({ key: "function_base_url", value: funcBase as any }),
    ]);
    if (r1.error || r2.error || r3.error) toast.error("Save failed");
    else toast.success("Settings saved ✓");
  };

  return (
    <div className="space-y-4 max-w-2xl pb-24 md:pb-6">
      <h1 className="text-2xl font-bold">Site Settings</h1>

      {/* Editable Function Base URL */}
      <div className="bg-card border-2 border-primary/40 rounded-xl p-4 shadow-card space-y-3">
        <div>
          <div className="font-bold text-base">⚡ Edge Function Base URL</div>
          <p className="text-xs text-muted-foreground mt-1">
            ভবিষ্যতে যদি Supabase project change করেন, এখানে নতুন project URL paste করুন।
            Empty থাকলে current project default URL use হবে।
          </p>
        </div>
        <div>
          <Label>Function Base URL (Supabase project URL)</Label>
          <Input
            value={funcBase}
            onChange={(e) => setFuncBase(e.target.value)}
            placeholder={defaultBase || "https://your-project.supabase.co"}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Default (current): <code className="bg-muted px-1 rounded">{defaultBase}</code>
          </p>
        </div>
      </div>

      {/* Monetag verification helper */}
      <div className="bg-card border rounded-xl p-4 shadow-card space-y-2">
        <div className="font-bold text-base">📡 Monetag Verification</div>
        <p className="text-xs text-muted-foreground">
          Monetag panel এ "Verify" করার সময় <b>Service-worker URL</b> চাইলে দিন:
        </p>
        <code className="block bg-muted px-2 py-1.5 rounded text-xs break-all">
          {window.location.origin}/sw.js
        </code>
        <p className="text-xs text-muted-foreground">
          আর <b>Tag-method</b> চাইলে: head tag verification meta automatic add করা আছে।
          Verify হওয়ার পর Monetag dashboard থেকে নতুন ad zone codes copy করে এই panel এ "Ad Slots" section এ paste করুন।
        </p>
      </div>

      <div className="bg-card border rounded-xl p-4 shadow-card space-y-3">
        {[
          ["name", "Site name"],
          ["cpm_default", "Default CPM ($)"],
          ["min_withdraw", "Min Withdraw ($)"],
          ["referral_percent", "Referral %"],
          ["step_wait", "Step wait (sec)"],
          ["final_wait", "Final gate wait (sec)"],
        ].map(([k, label]) => (
          <div key={k}>
            <Label>{label}</Label>
            <Input
              value={site[k] ?? ""}
              onChange={(e) =>
                setSite({
                  ...site,
                  [k]: isNaN(Number(e.target.value)) || k === "name" ? e.target.value : Number(e.target.value),
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-4 shadow-card space-y-3">
        <div className="font-bold">Ad pages per plan</div>
        <p className="text-xs text-muted-foreground">
          Number of step pages each plan's links use (final Get-Link gate is added on top).
        </p>
        {Object.keys(planSteps).map((p) => (
          <div key={p}>
            <Label>{p} plan steps</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={planSteps[p]}
              onChange={(e) => setPlanSteps({ ...planSteps, [p]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>

      <Button onClick={save} className="w-full sm:w-auto gap-1">
        <Save className="h-4 w-4" /> Save All Settings
      </Button>
    </div>
  );
}
