import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building2, Inbox, Users, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const tiles = [
    { label: "Total Properties", value: stats?.properties_total ?? "—", icon: Building2 },
    { label: "Published", value: stats?.properties_published ?? "—", icon: CheckCircle2 },
    { label: "Total Leads", value: stats?.leads_total ?? "—", icon: Inbox },
    { label: "New Leads", value: stats?.leads_new ?? "—", icon: Inbox },
    { label: "Users", value: stats?.users_total ?? "—", icon: Users },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="overline mb-3">Admin</div>
      <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory mb-2">Dashboard</h1>
      <p className="text-ivory/55 font-light mb-12">Overview of your properties, leads and team.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-copper/15">
        {tiles.map((t) => (
          <div key={t.label} className="bg-charcoal p-6">
            <t.icon className="w-5 h-5 text-copper mb-4" strokeWidth={1.4} />
            <div className="text-3xl font-display font-light text-ivory">{t.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
