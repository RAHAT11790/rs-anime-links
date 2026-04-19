-- Insert two AdSense banner slots (disabled by default — user enables after Google verification)
insert into public.ad_slots (slot_key, name, script_code, enabled) values
('adsense_relaxed',
 'AdSense — Auto-Relaxed (large)',
 '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3615112291907355" crossorigin="anonymous"></script>
<ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="ca-pub-3615112291907355" data-ad-slot="6897548046"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
 false),
('adsense_responsive',
 'AdSense — Responsive Banner (RS ANIME SITE)',
 '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3615112291907355" crossorigin="anonymous"></script>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3615112291907355" data-ad-slot="6198696587" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
 false)
on conflict (slot_key) do nothing;