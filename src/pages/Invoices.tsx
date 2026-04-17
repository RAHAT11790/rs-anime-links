import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Invoices() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("withdrawals").select("*").eq("user_id", user.id).in("status", ["paid","approved"]).order("updated_at", { ascending: false })
      .then(({ data }) => setList(data ?? []));
  }, [user]);
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-left">Invoice ID</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Method</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Status</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={5} className="text-center p-6 text-muted-foreground">No paid invoices yet.</td></tr>}
            {list.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-3 font-mono text-xs">{w.id.slice(0,8).toUpperCase()}</td>
                <td className="p-3">{new Date(w.updated_at).toLocaleDateString()}</td>
                <td className="p-3">{w.method}</td>
                <td className="p-3 text-right">${Number(w.amount).toFixed(2)}</td>
                <td className="p-3 text-right"><span className="px-2 py-0.5 rounded text-xs bg-success text-success-foreground">{w.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
