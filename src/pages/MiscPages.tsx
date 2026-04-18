import { Send, Mail, MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Support</h1>
      <p className="text-muted-foreground">Need help? Contact us through any of these channels.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <a href="https://t.me/RS_WONER" target="_blank" rel="noreferrer" className="bg-card border rounded-xl p-4 flex items-center gap-3 hover:shadow-elevated transition shadow-card">
          <Send className="text-primary" /><div><div className="font-bold">Contact Admin</div><div className="text-xs text-muted-foreground">@RS_WONER</div></div>
        </a>
        <a href="https://t.me/cartoonfunny03" target="_blank" rel="noreferrer" className="bg-card border rounded-xl p-4 flex items-center gap-3 hover:shadow-elevated transition shadow-card">
          <Send className="text-primary" /><div><div className="font-bold">Telegram Channel</div><div className="text-xs text-muted-foreground">@cartoonfunny03</div></div>
        </a>
        <a href="mailto:rahatsarker224@gmail.com" className="bg-card border rounded-xl p-4 flex items-center gap-3 hover:shadow-elevated transition shadow-card">
          <Mail className="text-primary" /><div><div className="font-bold">Email</div><div className="text-xs text-muted-foreground">rahatsarker224@gmail.com</div></div>
        </a>
      </div>
    </div>
  );
}

export function EarnNow() {
  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Earn Now <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded ml-2">NEW</span></h1>
      <div className="bg-gradient-red text-white rounded-xl p-6">
        <div className="text-2xl font-bold mb-2">⚡ Instant Tasks</div>
        <p className="opacity-90">Complete simple tasks like watching ads, joining channels, or solving captchas to earn instantly. New tasks added every day.</p>
      </div>
      <div className="bg-card border rounded-xl p-6 shadow-card text-center text-muted-foreground">
        🚧 Tasks marketplace coming soon. Stay tuned!
      </div>
    </div>
  );
}

export function QuickLink() {
  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Quick Link</h1>
      <p className="text-muted-foreground">Use the dashboard's main shortener for quick links. More tools coming soon.</p>
    </div>
  );
}
