import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

export default function Statistics() {
  const { user } = useAuth();
  const [data, setData] = useState<{ date: string; views: number; earnings: number }[]>([]);
  const [tab, setTab] = useState<"all" | "country">("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = subDays(new Date(), 30);
      const { data: clicks } = await supabase.from("clicks").select("created_at,earned").eq("user_id", user.id).gte("created_at", since.toISOString());
      const map: Record<string, { views: number; earnings: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "MMM d");
        map[d] = { views: 0, earnings: 0 };
      }
      (clicks ?? []).forEach((c: any) => {
        const d = format(new Date(c.created_at), "MMM d");
        if (map[d]) { map[d].views++; map[d].earnings += Number(c.earned); }
      });
      setData(Object.entries(map).map(([date, v]) => ({ date, ...v })));
    })();
  }, [user]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Statistics</h1>
      <div className="bg-card rounded-xl border p-4 shadow-card">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("all")} className={`px-4 py-1.5 rounded text-sm font-medium ${tab === "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>All Stats</button>
          <button onClick={() => setTab("country")} className={`px-4 py-1.5 rounded text-sm font-medium ${tab === "country" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>Country Stats</button>
        </div>
        <div className="text-sm text-muted-foreground mb-3">Last 30 days</div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="earnings" stroke="hsl(var(--brand-red))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
