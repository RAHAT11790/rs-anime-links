import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BarChart3, Link2, Wallet, Users, FileText, Settings as SettingsIcon,
  HelpCircle, RefreshCw, Menu, X, ChevronDown, Send, ShieldCheck, LogOut, Code2, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: React.ComponentType<any>; badge?: string; children?: { to: string; label: string }[] };

const items: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/earn", label: "Earn Now", icon: DollarSign, badge: "NEW" },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/links", label: "Manage Links", icon: Link2, children: [
    { to: "/links", label: "All Links" },
    { to: "/links/hidden", label: "Hidden Links" },
  ]},
  { to: "/withdraw", label: "Withdraw", icon: Wallet },
  { to: "/tools", label: "Tools", icon: Code2, children: [
    { to: "/tools/api", label: "Developers API" },
    { to: "/tools/quick", label: "Quick Link" },
  ]},
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon, children: [
    { to: "/settings/profile", label: "Profile" },
    { to: "/settings/password", label: "Change Password" },
  ]},
  { to: "/support", label: "Support", icon: HelpCircle },
  { to: "/plans", label: "Change Your Plan", icon: RefreshCw },
];

export default function DashboardLayout() {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ username: string; balance: number; plan: string } | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("username,balance,plan").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => data && setProfile(data as any));
  }, [user]);

  const logout = async () => { await supabase.auth.signOut(); nav("/login"); };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-secondary text-secondary-foreground sticky top-0 z-30 shadow-card">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} className="p-2 -ml-2 lg:hidden">
              {open ? <X /> : <Menu />}
            </button>
            <a href="https://t.me/cartoonfunny03" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 bg-sidebar-accent px-3 py-1.5 rounded text-xs font-bold">
              <Send className="h-3.5 w-3.5" /> TELEGRAM
            </a>
            <Link to="/links/new" className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-bold hover:bg-primary/90 transition">
              SHORT NOW
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="hidden sm:flex items-center gap-1 bg-brand-red text-brand-red-foreground px-3 py-1.5 rounded text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
              </Link>
            )}
            <span className="text-sm hidden md:inline">{profile?.username || "User"}</span>
            <button onClick={logout} className="p-2 hover:bg-sidebar-accent rounded" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-14 left-0 z-20 w-72 bg-sidebar text-sidebar-foreground h-[calc(100vh-3.5rem)] overflow-y-auto transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-4 bg-white border-b border-sidebar-border">
            <img src={logo} alt="RS ANIME LINK" width={1024} height={512} className="h-12 w-auto mx-auto" />
          </div>
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-primary font-bold text-lg">${(profile?.balance ?? 0).toFixed(2)}</div>
                <div className="text-xs text-sidebar-foreground/70">Available Balance</div>
              </div>
            </div>
          </div>
          <nav className="py-2">
            {items.map((it) => {
              const Icon = it.icon;
              if (it.children) {
                const isOpen = openGroups[it.to] ?? false;
                return (
                  <div key={it.to}>
                    <button onClick={() => setOpenGroups({ ...openGroups, [it.to]: !isOpen })}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-sidebar-accent text-sm">
                      <span className="flex items-center gap-3"><Icon className="h-5 w-5 text-primary" />{it.label}</span>
                      <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && it.children.map((c) => (
                      <NavLink key={c.to} to={c.to} onClick={() => setOpen(false)}
                        className={({ isActive }) => cn("block pl-14 pr-5 py-2 text-sm hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}>
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                );
              }
              return (
                <NavLink key={it.to} to={it.to} end onClick={() => setOpen(false)}
                  className={({ isActive }) => cn("flex items-center gap-3 px-5 py-3 text-sm hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent border-l-4 border-primary")}>
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && <span className="text-[10px] bg-primary px-1.5 py-0.5 rounded font-bold">{it.badge}</span>}
                </NavLink>
              );
            })}
            <div className="px-5 py-4 mt-2 border-t border-sidebar-border">
              <div className="text-xs text-sidebar-foreground/70">Current Plan</div>
              <div className="text-primary font-bold">{profile?.plan ?? "Default"} - $10 CPM</div>
              <div className="text-xs text-sidebar-foreground/70 mt-3">Expiration Date</div>
              <div className="font-bold">Never</div>
            </div>
          </nav>
        </aside>

        {open && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
