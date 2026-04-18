// @ts-nocheck
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { link_id } = await req.json();
    if (!link_id)
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: link } = await supa.from("links").select("*").eq("id", link_id).maybeSingle();
    if (!link)
      return new Response(JSON.stringify({ ok: false }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "0.0.0.0";
    const ua = req.headers.get("user-agent") ?? "";
    // Hash ip+ua so one device = one fingerprint
    const enc = new TextEncoder().encode(`${ip}|${ua}`);
    const hashBuf = await crypto.subtle.digest("SHA-256", enc);
    const ipHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 24-HOUR DEDUP — same fingerprint + same link in last 24h = no count
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supa
      .from("clicks")
      .select("id")
      .eq("link_id", link_id)
      .eq("ip_hash", ipHash)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return new Response(JSON.stringify({ ok: true, deduped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supa
      .from("profiles")
      .select("cpm_rate,referred_by")
      .eq("user_id", link.user_id)
      .maybeSingle();
    const cpm = Number(profile?.cpm_rate ?? 10);
    const earned = Number((cpm / 1000).toFixed(5));

    await supa.from("clicks").insert({
      link_id,
      user_id: link.user_id,
      ip_hash: ipHash,
      user_agent: ua,
      earned,
      completed: true,
    });
    await supa
      .from("links")
      .update({ views: link.views + 1, earnings: Number(link.earnings) + earned })
      .eq("id", link_id);

    const { data: p2 } = await supa
      .from("profiles")
      .select("total_views,total_earnings,balance,referral_earnings")
      .eq("user_id", link.user_id)
      .maybeSingle();
    if (p2) {
      await supa
        .from("profiles")
        .update({
          total_views: Number(p2.total_views) + 1,
          total_earnings: Number(p2.total_earnings) + earned,
          balance: Number(p2.balance) + earned,
        })
        .eq("user_id", link.user_id);
    }

    if (profile?.referred_by) {
      const refEarn = Number((earned * 0.2).toFixed(5));
      const { data: rp } = await supa
        .from("profiles")
        .select("referral_earnings,balance")
        .eq("user_id", profile.referred_by)
        .maybeSingle();
      if (rp) {
        await supa
          .from("profiles")
          .update({
            referral_earnings: Number(rp.referral_earnings) + refEarn,
            balance: Number(rp.balance) + refEarn,
          })
          .eq("user_id", profile.referred_by);
        await supa
          .from("referrals")
          .update({ earned: refEarn })
          .eq("referrer_id", profile.referred_by)
          .eq("referred_id", link.user_id);
      }
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
