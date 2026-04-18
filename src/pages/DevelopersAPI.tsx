import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Code2, Server } from "lucide-react";
import { toast } from "sonner";

export default function DevelopersAPI() {
  const { user } = useAuth();
  const [token, setToken] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("api_tokens").select("token").eq("user_id", user.id).maybeSingle();
    setToken(data?.token ?? "");
  };
  useEffect(() => {
    load();
  }, [user]);

  const regen = async () => {
    if (!user) return;
    const newTok = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await supabase.from("api_tokens").upsert({ user_id: user.id, token: newTok });
    setToken(newTok);
    toast.success("Token regenerated");
  };

  const base = window.location.origin;
  const supaUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const apiBase = `${supaUrl}/functions/v1/shorten-api`;
  const supaAnon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "YOUR_SUPABASE_ANON_KEY";

  // Proxy edge-function template the user can copy into ANOTHER Supabase project
  // It calls THIS site's shorten-api with their RS ANIME LINK API token.
  const proxyCode = `// supabase/functions/shorten/index.ts
// Drop this into any other Supabase project. It will call RS ANIME LINK
// using your API token and return a shortened URL.
//
// 1. In that project, add a secret:   RSANIME_API_TOKEN = ${token || "YOUR_RS_ANIME_LINK_TOKEN"}
// 2. Deploy this function (e.g. name it "shorten").
// 3. POST { "url": "https://example.com" }  ->  { "shortenedUrl": "${base}/s/abc123" }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RSANIME_API_TOKEN");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RSANIME_API_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { url, alias } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({ api: apiKey, url });
    if (alias) params.set("alias", alias);

    const apiUrl = "${apiBase}?" + params.toString();
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status === "success" && data.shortenedUrl) {
      return new Response(JSON.stringify({ success: true, shortenedUrl: data.shortenedUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Shortening failed", details: data }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});`;

  const copy = (txt: string, label = "Copied") => {
    navigator.clipboard.writeText(txt);
    toast.success(label);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Code2 /> Developers API
      </h1>

      <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
        <div className="font-bold">Your API token:</div>
        <div className="flex flex-wrap gap-2">
          <Input value={token} readOnly className="font-mono text-xs flex-1 min-w-[200px]" />
          <Button variant="outline" onClick={() => copy(token, "Token copied")}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={regen}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
        <p>
          RS ANIME LINK provides an <b>API</b> that returns responses in <b>JSON</b> or <b>TEXT</b> format. Send a{" "}
          <b>GET</b> request with your API token and URL:
        </p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto">
          <code>{`${apiBase}?api=${token || "YOUR_API_TOKEN"}&url=https://example.com&alias=CustomAlias`}</code>
        </pre>
        <p>JSON response:</p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto">
          <code>{`{"status":"success","shortenedUrl":"${base}/s/AbC123"}`}</code>
        </pre>
        <p>For TEXT response append <b>&amp;format=text</b>:</p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto">
          <code>{`${apiBase}?api=${token || "YOUR_API_TOKEN"}&url=https://example.com&format=text`}</code>
        </pre>
        <p className="text-xs text-muted-foreground">
          CORS enabled. Works with bots, browsers, server-side scripts. Authorization header is NOT required.
        </p>
      </div>

      {/* Proxy edge function template */}
      <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="font-bold flex items-center gap-2">
            <Server className="h-5 w-5" /> Supabase Edge Function template
          </div>
          <Button size="sm" variant="outline" onClick={() => copy(proxyCode, "Code copied")}>
            <Copy className="h-3 w-3 mr-1" /> Copy code
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Drop this <code>index.ts</code> into any <i>other</i> Supabase project to call RS ANIME LINK from your own
          backend. Add a secret <code className="bg-muted px-1 rounded">RSANIME_API_TOKEN</code> with your token
          above, deploy, then POST <code>{`{"url":"…"}`}</code> to the function.
        </p>
        <pre className="bg-secondary text-secondary-foreground p-3 rounded text-xs overflow-x-auto max-h-[500px]">
          <code>{proxyCode}</code>
        </pre>
        <details className="text-xs">
          <summary className="cursor-pointer font-bold">Direct fetch (no proxy needed)</summary>
          <pre className="bg-secondary text-secondary-foreground p-3 rounded mt-2 overflow-x-auto">
            <code>{`fetch("${apiBase}?api=${token || "YOUR_API_TOKEN"}&url=" + encodeURIComponent(targetUrl))
  .then(r => r.json())
  .then(data => console.log(data.shortenedUrl));`}</code>
          </pre>
        </details>
      </div>
    </div>
  );
}
