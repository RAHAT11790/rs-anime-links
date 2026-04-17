import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdSlot({ slotKey, fallback, className = "" }: { slotKey: string; fallback?: React.ReactNode; className?: string }) {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("ad_slots").select("script_code,enabled").eq("slot_key", slotKey).maybeSingle()
      .then(({ data }) => {
        if (data?.enabled && data.script_code && data.script_code.trim().length > 0) setCode(data.script_code);
        else setCode("");
      });
  }, [slotKey]);

  if (code === null) return <div className={`ad-skeleton h-32 ${className}`}>Loading ad…</div>;
  if (code) return <div className={className} dangerouslySetInnerHTML={{ __html: code }} />;
  return <>{fallback ?? <FakeBanner className={className} />}</>;
}

const fakeAds = [
  { title: "Join a Group. Finish the race.", brand: "Meta", color: "from-blue-500 to-blue-700" },
  { title: "Best Luxury Resorts in Mexico", brand: "Travel", color: "from-emerald-500 to-teal-600" },
  { title: "Trade Crypto. Get $100 Bonus.", brand: "BinX", color: "from-yellow-500 to-orange-600" },
  { title: "Learn Coding in 30 Days", brand: "EduPro", color: "from-indigo-500 to-purple-600" },
  { title: "Premium VPN — 80% Off", brand: "FastVPN", color: "from-red-500 to-pink-600" },
];

export function FakeBanner({ className = "" }: { className?: string }) {
  const ad = fakeAds[Math.floor(Math.random() * fakeAds.length)];
  return (
    <a href="#" onClick={(e) => e.preventDefault()}
      className={`block rounded-lg overflow-hidden border bg-gradient-to-br ${ad.color} text-white p-6 min-h-[180px] flex flex-col justify-between shadow-card ${className}`}>
      <div className="text-2xl font-bold leading-tight">{ad.title}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="bg-white/20 px-2 py-1 rounded">Sponsored</span>
        <span>from <b>{ad.brand}</b></span>
      </div>
    </a>
  );
}
