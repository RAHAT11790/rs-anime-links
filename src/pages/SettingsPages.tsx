import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ProfileSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { if (user) supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({data}) => setProfile(data)); }, [user]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({
      username: profile.username, payment_method: profile.payment_method, payment_address: profile.payment_address,
    }).eq("user_id", user!.id);
    if (error) toast.error(error.message); else toast.success("Saved");
  };
  if (!profile) return null;
  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={save} className="bg-card border rounded-xl p-4 space-y-3 shadow-card">
        <div><Label>Username</Label><Input value={profile.username || ""} onChange={(e) => setProfile({...profile, username: e.target.value})} /></div>
        <div><Label>Email</Label><Input value={profile.email} disabled /></div>
        <div><Label>Default Payment Method</Label>
          <select value={profile.payment_method || ""} onChange={(e) => setProfile({...profile, payment_method: e.target.value})} className="w-full h-10 border rounded px-3 bg-background">
            <option value="">Select…</option><option>PayPal</option><option>USDT (TRC20)</option><option>bKash</option><option>Nagad</option><option>Bitcoin</option>
          </select>
        </div>
        <div><Label>Payment Address</Label><Input value={profile.payment_address || ""} onChange={(e) => setProfile({...profile, payment_address: e.target.value})} /></div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}

export function ChangePassword() {
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return toast.error("Passwords don't match");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message); else { toast.success("Password updated"); setPw(""); setPw2(""); }
  };
  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      <form onSubmit={submit} className="bg-card border rounded-xl p-4 space-y-3 shadow-card">
        <div><Label>New Password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} /></div>
        <div><Label>Confirm Password</Label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={6} /></div>
        <Button type="submit">Update Password</Button>
      </form>
    </div>
  );
}
