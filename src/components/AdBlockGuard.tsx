import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw } from "lucide-react";

/**
 * Detects ad-blockers using multiple techniques:
 * 1. Bait div with ad-classes (CSS hidden by uBlock/AdBlock)
 * 2. Network probe to a known ad-server (DNS-level blockers)
 * 3. Window property check (some blockers expose flags)
 *
 * If detected → renders a hard-block overlay. Otherwise → renders children.
 */
export function AdBlockGuard({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState<boolean | null>(null);

  const runChecks = async () => {
    let detected = false;

    // 1) Bait DOM element (uBlock/AdBlock hide these by class name)
    try {
      const bait = document.createElement("div");
      bait.className = "adsbox ad-banner ad-placement adsbygoogle ads ad-unit pub_300x250 banner-ad google-ads";
      bait.style.cssText =
        "position:absolute;left:-9999px;width:1px;height:1px;background:transparent;";
      bait.innerHTML = "&nbsp;";
      document.body.appendChild(bait);
      await new Promise((r) => setTimeout(r, 120));
      const hidden =
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.clientHeight === 0 ||
        getComputedStyle(bait).display === "none" ||
        getComputedStyle(bait).visibility === "hidden";
      if (hidden) detected = true;
      bait.remove();
    } catch {
      detected = true;
    }

    // 2) Network probe — DNS / pi-hole / NextDNS commonly block these hosts
    if (!detected) {
      const probes = [
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
        "https://www.googletagservices.com/tag/js/gpt.js",
      ];
      for (const url of probes) {
        try {
          await fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store" });
        } catch {
          detected = true;
          break;
        }
      }
    }

    // 3) Window flag check
    // @ts-ignore
    if (window.canRunAds === false) detected = true;

    setBlocked(detected);
  };

  useEffect(() => {
    runChecks();
  }, []);

  if (blocked === null) return null; // wait for first check
  if (!blocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border-2 border-destructive rounded-2xl shadow-elevated p-6 md:p-8 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-extrabold">AdBlocker Detected!</h1>
        <p className="text-sm text-muted-foreground">
          আমাদের সাইট ফ্রি রাখতে আমরা ad থেকে আয় করি। লিংক access করতে দয়া করে:
        </p>
        <ul className="text-left text-sm space-y-2 bg-muted/50 rounded-lg p-4">
          <li>✅ AdBlock / uBlock Origin <b>disable</b> করুন</li>
          <li>✅ Brave shield off করুন</li>
          <li>✅ DNS ad-blocker (NextDNS / Pi-hole / AdGuard) <b>off</b> করুন</li>
          <li>✅ তারপর page <b>reload</b> করুন</li>
        </ul>
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          className="w-full gap-2 bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground"
        >
          <RefreshCw className="h-4 w-4" /> I have disabled it — Reload
        </Button>
        <p className="text-xs text-muted-foreground">
          আপনার সহযোগিতার জন্য ধন্যবাদ ❤️
        </p>
      </div>
    </div>
  );
}
