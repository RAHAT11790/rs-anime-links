import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Check, Crown, Zap, Star, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Default",
    cpm: 4,
    steps: 2,
    price: "Free",
    color: "from-slate-600 to-slate-800",
    icon: Zap,
    features: ["2 ad pages per link", "Basic analytics", "Standard support"],
  },
  {
    name: "Premium",
    cpm: 6,
    steps: 2,
    price: "$9/mo",
    color: "from-blue-600 to-indigo-700",
    icon: Star,
    features: ["2 ad pages per link", "Real-time analytics", "Priority support"],
  },
  {
    name: "Pro",
    cpm: 8,
    steps: 3,
    price: "$19/mo",
    color: "from-violet-600 to-fuchsia-700",
    icon: Sparkles,
    features: ["3 ad pages per link", "Advanced analytics", "Priority support", "API access"],
  },
  {
    name: "Top",
    cpm: 10,
    steps: 4,
    price: "$29/mo",
    color: "from-amber-500 via-orange-500 to-red-600",
    icon: Crown,
    features: ["4 ad pages per link", "Highest CPM rate", "VIP support", "Custom domains"],
    popular: true,
  },
];

export default function Plans() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<string>("Default");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setCurrent(data?.plan || "Default"));
  }, [user]);

  const choose = async (plan: typeof plans[number]) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ plan: plan.name, cpm_rate: plan.cpm })
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Switched to ${plan.name} plan — $${plan.cpm} CPM, ${plan.steps} ad pages`);
      setCurrent(plan.name);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-2">Change Your Plan</h1>
      <p className="text-muted-foreground mb-6">
        Higher plans = higher CPM &amp; more ad pages per link = more earnings.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const Icon = p.icon;
          const isCurrent = current === p.name;
          return (
            <div
              key={p.name}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${p.color} text-white shadow-elevated flex flex-col ${
                p.popular ? "ring-4 ring-yellow-400 scale-[1.02]" : ""
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <Icon className="h-8 w-8 mb-3 opacity-90" />
              <div className="text-sm font-bold uppercase tracking-wider opacity-80">{p.name}</div>
              <div className="text-4xl font-extrabold my-2">
                ${p.cpm}
                <span className="text-sm font-normal opacity-80"> CPM</span>
              </div>
              <div className="text-2xl font-bold mb-1">{p.price}</div>
              <div className="text-xs opacity-80 mb-4">{p.steps} ad pages per link</div>
              <ul className="text-sm space-y-1.5 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(p)}
                disabled={isCurrent}
                className="w-full py-2.5 rounded-lg font-bold bg-white text-foreground hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCurrent ? "✓ Current Plan" : "Choose Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
