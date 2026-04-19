// @ts-nocheck
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const api = url.searchParams.get("api");
    const target = url.searchParams.get("url");
    const alias = url.searchParams.get("alias");
    const format = (url.searchParams.get("format") || "json").toLowerCase();
    if (!api || !target) {
      const err = { status: "error", message: "Missing 'api' or 'url' parameter" };
      return format === "text"
        ? new Response("error: missing api or url", { status: 400, headers: { ...corsHeaders, "Content-Type": "text/plain" } })
        : new Response(JSON.stringify(err), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: tok } = await supa.from("api_tokens").select("user_id").eq("token", api).maybeSingle();
    if (!tok) {
      const err = { status: "error", message: "Invalid API token" };
      return format === "text"
        ? new Response("error: invalid token", { status: 401, headers: { ...corsHeaders, "Content-Type": "text/plain" } })
        : new Response(JSON.stringify(err), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const code = alias && /^[a-zA-Z0-9_-]{3,20}$/.test(alias)
      ? alias
      : Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * 62)]).join("");
    const { data: link, error } = await supa.from("links").insert({
      user_id: tok.user_id, original_url: target, short_code: code, alias: alias || null,
    }).select().single();
    if (error) {
      const msg = error.message.includes("duplicate") ? "Alias already taken" : error.message;
      return format === "text"
        ? new Response(`error: ${msg}`, { status: 400, headers: { ...corsHeaders, "Content-Type": "text/plain" } })
        : new Response(JSON.stringify({ status: "error", message: msg }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // ALWAYS use our own site domain — never the caller's origin (would 404 on their site).
    // Admin can override via settings.site_url; otherwise fall back to fixed published domain.
    let siteUrl = "https://rs-anime-links.lovable.app";
    try {
      const { data: s } = await supa.from("settings").select("value").eq("key", "site_url").maybeSingle();
      const v = (s?.value as string) || "";
      if (v && typeof v === "string" && v.trim().length > 0) siteUrl = v.trim().replace(/\/$/, "");
    } catch {}
    const shortened = `${siteUrl}/s/${link.short_code}`;
    if (format === "text") return new Response(shortened, { headers: { ...corsHeaders, "Content-Type": "text/plain" } });
    return new Response(JSON.stringify({ status: "success", shortenedUrl: shortened }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", message: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
