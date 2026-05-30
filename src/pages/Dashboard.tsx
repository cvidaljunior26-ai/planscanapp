import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, CheckSquare, Clock, Search, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";

interface KPI { equipment: number; executed: number; pending: number; researches: number; }

export default function Dashboard() {
  const { companyId } = useAuth();
  const [kpi, setKpi] = useState<KPI>({ equipment: 0, executed: 0, pending: 0, researches: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!companyId) return;
    async function load() {
      const today = new Date(); today.setHours(0,0,0,0);
      const { data: execs } = await supabase.from("executions")
        .select("id, promoter_name, confirmed_at, equipment(name)")
        .gte("confirmed_at", today.toISOString())
        .order("confirmed_at", { ascending: false }).limit(10);
      const { count: researchCount } = await supabase.from("execution_items")
        .select("*", { count: "exact", head: true }).not("price", "is", null);
      setKpi({ equipment: 0, executed: execs?.length ?? 0, pending: 0, researches: researchCount ?? 0 });
      setRecent(execs ?? []);
    }
    load();
  }, [companyId]);

  const kpis = [
    { label: "Equipamentos", value: kpi.equipment, icon: Store, color: "bg-primary/10 text-primary" },
    { label: "Executados Hoje", value: kpi.executed, icon: CheckSquare, color: "bg-accent/20 text-accent-foreground" },
    { label: "Pendentes", value: kpi.pending, icon: AlertTriangle, color: "bg-warn/20 text-warn" },
    { label: "Pesquisas", value: kpi.researches, icon: Search, color: "bg-primary/10 text-primary" },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Visao geral da operacao">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-4">
            <div className={"w-9 h-9 rounded-xl flex items-center justify-center mb-2 " + color}><Icon className="w-5 h-5" /></div>
            <div className="text-2xl font-black text-textMain">{value}</div>
            <div className="text-xs font-bold text-sub mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[{ to: "/stores", label: "Lojas", emoji: "🏪" },{ to: "/config", label: "Config", emoji: "⚙️" },{ to: "/gallery", label: "Galeria", emoji: "🖼️" }].map(({ to, label, emoji }) => (
          <Link key={to} to={to} className="bg-white rounded-2xl shadow-card p-3 text-center hover:shadow-card-lg transition-shadow">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-xs font-extrabold text-primary">{label}</div>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">Execucoes Recentes</h3>
        </div>
        {recent.length === 0 ? (
          <div className="p-6 text-center"><Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-sub">Nenhuma execucao hoje ainda</p></div>
        ) : (
          <div className="divide-y divide-border">{recent.map((ex) => (
            <div key={ex.id} className="px-4 py-3 flex items-center justify-between">
              <div><p className="text-sm font-bold text-textMain">{ex.promoter_name}</p><p className="text-xs text-sub">{ex.equipment?.name}</p></div>
              <span className="text-xs text-muted-foreground">{formatDate(ex.confirmed_at)}</span>
            </div>
          ))}</div>
        )}
      </div>
    </AdminLayout>
  );
        }
