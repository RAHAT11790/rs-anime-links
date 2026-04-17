import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";

  useEffect(() => {
    if (window.location.pathname === "/register") setMode("register");
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav("/dashboard"); });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: username || email.split("@")[0], referred_by: ref || null },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now log in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        nav("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-brand-red/10 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elevated border p-8">
        <Link to="/" className="block mb-6">
          <img src={logo} alt="RS ANIME LINK" width={1024} height={512} className="h-14 w-auto mx-auto" />
        </Link>
        <h1 className="text-2xl font-bold text-center mb-1">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">{mode === "login" ? "Login to your dashboard" : "Start earning today"}</p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="anime_lover" required minLength={3} />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {mode === "register" && ref && <p className="text-xs text-success">✓ Referred by a friend</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}</Button>
        </form>
        <div className="text-center text-sm mt-4">
          {mode === "login" ? (
            <>No account? <button onClick={() => setMode("register")} className="text-primary font-medium">Register</button></>
          ) : (
            <>Have an account? <button onClick={() => setMode("login")} className="text-primary font-medium">Login</button></>
          )}
        </div>
      </div>
    </div>
  );
}
