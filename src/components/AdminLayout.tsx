import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Users, Link2, Wallet, Megaphone, Settings, ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", label: "Overview", icon: ShieldCheck, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/links", label: "Links", icon: Link2 },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/admin/ads", label: "Ad Slots", icon: Megaphone },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  if (loading) return null;
  if (!isAdmin) { nav("/dashboard"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand-red text-brand-red-foreground sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" /> Back</Link>
            <span className="font-bold tracking-wide">RS ANIME LINK · ADMIN</span>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); nav("/login"); }} className="p-2"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="flex">
        <aside className="w-60 bg-sidebar text-sidebar-foreground min-h-[calc(100vh-3.5rem)] hidden md:block">
          <nav className="py-4">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end as any}
                className={({ isActive }) => cn("flex items-center gap-3 px-5 py-3 text-sm hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent border-l-4 border-brand-red")}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      {/* mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sidebar text-sidebar-foreground flex border-t border-sidebar-border z-30">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end as any}
            className={({ isActive }) => cn("flex-1 flex flex-col items-center py-2 text-[10px]", isActive && "text-primary")}>
            <Icon className="h-4 w-4 mb-0.5" />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
