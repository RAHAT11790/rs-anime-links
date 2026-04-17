import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Code2 } from "lucide-react";
import { toast } from "sonner";

export default function DevelopersAPI() {
  const { user } = useAuth();
  const [token, setToken] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("api_tokens").select("token").eq("user_id", user.id).maybeSingle();
    setToken(data?.token ?? "");
  };
  useEffect(() => { load(); }, [user]);

  const regen = async () => {
    if (!user) return;
    const newTok = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,"0")).join("");
    await supabase.from("api_tokens").upsert({ user_id: user.id, token: newTok });
    setToken(newTok); toast.success("Token regenerated");
  };

  const base = `${window.location.origin.replace("http", "http")}`;
  const supaUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const apiBase = `${supaUrl}/functions/v1/shorten-api`;

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Code2 /> Developers API</h1>
      <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
        <div className="font-bold">Your API token:</div>
        <div className="flex gap-2">
          <Input value={token} readOnly className="font-mono text-xs" />
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(token); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={regen}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
        <p>For developers RS ANIME LINK prepared <b>API</b> which returns responses in <b>JSON</b> or <b>TEXT</b> formats.</p>
        <p>All you have to do is to send a <b>GET</b> request with your API token and URL like the following:</p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto"><code>{`${apiBase}?api=${token || "YOUR_API_TOKEN"}&url=https://example.com&alias=CustomAlias`}</code></pre>
        <p>You will get a JSON response like the following:</p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto"><code>{`{"status":"success","shortenedUrl":"${base}/s/AbC123"}`}</code></pre>
        <p>If you want a TEXT response, append <b>&format=text</b>:</p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto"><code>{`${apiBase}?api=${token || "YOUR_API_TOKEN"}&url=https://example.com&format=text`}</code></pre>
        <p className="text-xs text-muted-foreground">CORS is enabled. Works perfectly with bots, browsers, and server-side scripts.</p>
      </div>
    </div>
  );
}
