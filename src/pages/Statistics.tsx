import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { format, subDays, startOfWeek, addDays } from "date-fns";

type Tab = "daily" | "weekly" | "monthly";

export default function Statistics() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("daily");
  const [daily, setDaily] = useState<{ date: string; views: number; earnings: number }[]>([]);
  const [weekly, setWeekly] = useState<{ week: string; views: number; earnings: number }[]>([]);
  const [monthly, setMonthly] = useState<{ date: string; views: number; earnings: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Pull last 90 days for full computation
      const since = subDays(new Date(), 90);
      const { data: clicks } = await supabase
        .from("clicks")
        .select("created_at,earned")
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString());

      // ---- DAILY (last 7 days) ----
      const dailyMap: Record<string, { views: number; earnings: number }> = {};
      for (let i = 6; i >= 0; i--) {
        dailyMap[format(subDays(new Date(), i), "MMM d")] = { views: 0, earnings: 0 };
      }
      // ---- MONTHLY (last 30) ----
      const monthMap: Record<string, { views: number; earnings: number }> = {};
      for (let i = 29; i >= 0; i--) {
        monthMap[format(subDays(new Date(), i), "MMM d")] = { views: 0, earnings: 0 };
      }
      // ---- WEEKLY (last 8 weeks) ----
      const weekMap: Record<string, { views: number; earnings: number }> = {};
      for (let i = 7; i >= 0; i--) {
        const wStart = startOfWeek(subDays(new Date(), i * 7));
        weekMap[format(wStart, "MMM d")] = { views: 0, earnings: 0 };
      }

      (clicks ?? []).forEach((c: any) => {
        const dt = new Date(c.created_at);
        const dKey = format(dt, "MMM d");
        if (dailyMap[dKey]) {
          dailyMap[dKey].views++;
          dailyMap[dKey].earnings += Number(c.earned);
        }
        if (monthMap[dKey]) {
          monthMap[dKey].views++;
          monthMap[dKey].earnings += Number(c.earned);
        }
        const wKey = format(startOfWeek(dt), "MMM d");
        if (weekMap[wKey]) {
          weekMap[wKey].views++;
          weekMap[wKey].earnings += Number(c.earned);
        }
      });

      setDaily(Object.entries(dailyMap).map(([date, v]) => ({ date, ...v })));
      setMonthly(Object.entries(monthMap).map(([date, v]) => ({ date, ...v })));
      setWeekly(Object.entries(weekMap).map(([week, v]) => ({ week, ...v })));
    })();
  }, [user]);

  const totals = (() => {
    const src = tab === "daily" ? daily : tab === "monthly" ? monthly : weekly.map((w) => ({ date: w.week, views: w.views, earnings: w.earnings }));
    return src.reduce(
      (acc, r) => ({ views: acc.views + r.views, earnings: acc.earnings + r.earnings }),
      { views: 0, earnings: 0 }
    );
  })();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="bg-card rounded-xl border p-4 shadow-card space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["daily", "weekly", "monthly"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded text-sm font-medium capitalize ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Views</div>
            <div className="text-2xl font-bold text-primary">{totals.views}</div>
          </div>
          <div className="bg-success/10 border border-success/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Earnings</div>
            <div className="text-2xl font-bold text-success">${totals.earnings.toFixed(4)}</div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {tab === "daily" && "Last 7 days"}
          {tab === "weekly" && "Last 8 weeks"}
          {tab === "monthly" && "Last 30 days"}
        </div>

        <div className="h-72">
          <ResponsiveContainer>
            {tab === "weekly" ? (
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
                <Bar dataKey="earnings" fill="hsl(var(--brand-red))" />
              </BarChart>
            ) : (
              <LineChart data={tab === "daily" ? daily : monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="earnings" stroke="hsl(var(--brand-red))" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
