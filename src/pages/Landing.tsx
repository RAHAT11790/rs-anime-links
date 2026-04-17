import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Send, Link2, DollarSign, Users, BarChart3, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <img src={logo} alt="RS ANIME LINK" width={1024} height={512} className="h-10 w-auto bg-white rounded px-2 py-1" />
          <nav className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm hover:bg-sidebar-accent rounded">Login</Link>
            <Link to="/register" className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold rounded hover:bg-primary/90">Register</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-accent to-primary-glow text-primary-foreground py-20">
        <div className="container text-center">
          <img src={logo} alt="RS ANIME LINK" width={1024} height={512} className="h-24 md:h-32 w-auto mx-auto bg-white rounded-xl p-3 shadow-elevated mb-8" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Shorten Links. Earn Money.</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            RS ANIME LINK pays you up to <b>$10 CPM</b> for every visitor on your shortened links.
            Fast, reliable, anime-themed link shortener.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/register"><Button size="lg" variant="secondary" className="font-bold">Get Started Free</Button></Link>
            <a href="https://t.me" target="_blank" rel="noreferrer"><Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20"><Send className="h-4 w-4 mr-2" /> Telegram</Button></a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container">
        <h2 className="text-3xl font-bold text-center mb-12">Why RS ANIME LINK?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: DollarSign, title: "High CPM Rates", desc: "Earn up to $10 per 1000 views with one of the best CPM rates in the industry." },
            { icon: Zap, title: "Fast Payouts", desc: "Withdraw your earnings instantly via PayPal, USDT, bKash, or Nagad." },
            { icon: Users, title: "20% Referrals", desc: "Refer friends and earn 20% of their lifetime earnings." },
            { icon: Shield, title: "Safe & Reliable", desc: "Anti-bot protection, fraud detection, and 99.9% uptime guarantee." },
            { icon: BarChart3, title: "Real-time Stats", desc: "Track views, earnings, country breakdown, and performance live." },
            { icon: Link2, title: "Developer API", desc: "Full REST API access. Integrate shortening into your bot or app." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary text-white flex items-center justify-center mb-4"><Icon /></div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-sidebar text-sidebar-foreground py-8 mt-12">
        <div className="container text-center text-sm opacity-70">
          © {new Date().getFullYear()} RS ANIME LINK · Short Links and Earn Money
        </div>
      </footer>
    </div>
  );
}
