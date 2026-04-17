// @ts-nocheck
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { link_id } = await req.json();
    if (!link_id) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: link } = await supa.from("links").select("*").eq("id", link_id).maybeSingle();
    if (!link) return new Response(JSON.stringify({ ok: false }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: profile } = await supa.from("profiles").select("cpm_rate,referred_by").eq("user_id", link.user_id).maybeSingle();
    const cpm = Number(profile?.cpm_rate ?? 10);
    const earned = Number((cpm / 1000).toFixed(5));
    const ip = req.headers.get("x-forwarded-for") ?? "0.0.0.0";
    const ua = req.headers.get("user-agent") ?? "";
    await supa.from("clicks").insert({ link_id, user_id: link.user_id, ip_hash: ip, user_agent: ua, earned, completed: true });
    await supa.from("links").update({ views: link.views + 1, earnings: Number(link.earnings) + earned }).eq("id", link_id);
    // increment user totals
    const { data: p2 } = await supa.from("profiles").select("total_views,total_earnings,balance,referral_earnings").eq("user_id", link.user_id).maybeSingle();
    if (p2) {
      await supa.from("profiles").update({
        total_views: Number(p2.total_views) + 1,
        total_earnings: Number(p2.total_earnings) + earned,
        balance: Number(p2.balance) + earned,
      }).eq("user_id", link.user_id);
    }
    // referral 20%
    if (profile?.referred_by) {
      const refEarn = Number((earned * 0.20).toFixed(5));
      const { data: rp } = await supa.from("profiles").select("referral_earnings,balance").eq("user_id", profile.referred_by).maybeSingle();
      if (rp) {
        await supa.from("profiles").update({
          referral_earnings: Number(rp.referral_earnings) + refEarn,
          balance: Number(rp.balance) + refEarn,
        }).eq("user_id", profile.referred_by);
        await supa.from("referrals").update({ earned: refEarn }).eq("referrer_id", profile.referred_by).eq("referred_id", link.user_id);
      }
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
