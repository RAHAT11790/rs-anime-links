import { Link } from "react-router-dom";

const plans = [
  { name: "Default", cpm: 10, color: "bg-muted", price: "Free" },
  { name: "Premium", cpm: 14, color: "bg-gradient-primary text-white", price: "$9/mo" },
  { name: "Pro", cpm: 20, color: "bg-gradient-purple text-white", price: "$29/mo" },
];

export default function Plans() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-2">Change Your Plan</h1>
      <p className="text-muted-foreground mb-6">Upgrade to earn more per 1000 views.</p>
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-xl p-6 ${p.color} shadow-elevated`}>
            <div className="text-sm font-bold uppercase tracking-wider opacity-80">{p.name}</div>
            <div className="text-4xl font-bold my-3">${p.cpm} <span className="text-base font-normal">CPM</span></div>
            <div className="text-2xl font-bold mb-4">{p.price}</div>
            <ul className="text-sm space-y-1 mb-6 opacity-90">
              <li>✓ Unlimited links</li>
              <li>✓ Real-time analytics</li>
              <li>✓ {p.cpm > 10 ? "Priority" : "Standard"} support</li>
              <li>✓ {p.cpm}$ per 1000 views</li>
            </ul>
            <button className="w-full py-2 rounded font-bold bg-white text-foreground">Choose Plan</button>
          </div>
        ))}
      </div>
    </div>
  );
}
