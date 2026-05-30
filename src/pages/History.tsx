import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { Download, ExternalLink } from "lucide-react";

export default function History() {
  const { companyId } = useAuth();
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (companyId) load(); }, [companyId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("executions")
      .select("*, equipment(name, type, stores(name, company_id))")
      .order("confirmed_at", { ascending: false }).limit(100);
    setExecutions(data?.filter(e => e.equipment?.stores?.company_id === companyId) ?? []);
    setLoading(false);
  }

  function exportCSV() {
    const rows = executions.map(e => [e.promoter_name, e.equipment?.name, e.equipment?.stores?.name, formatDate(e.confirmed_at), e.conformity ? "Sim" : "Nao", e.xp_earned].join(";"));
    const csv = ["Promotor;Equipamento;Loja;Data;Conformidade;XP", ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "historico-planscan.csv"; a.click();
  }

  return (
    <AdminLayout title="Historico" subtitle="Todas as execucoes registradas"
      action={<button onClick={exportCSV} className="bg-accent text-white rounded-xl px-3 py-2 flex items-center gap-1 text-xs font-extrabold shadow-card"><Download className="w-4 h-4" /> CSV</button>}>
      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-3">
          {executions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center"><p className="text-sub font-bold">Nenhuma execucao encontrada</p></div>
          ) : executions.map(ex => (
            <div key={ex.id} className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-extrabold text-textMain">{ex.promoter_name}</p>
                  <p className="text-xs text-sub">{ex.equipment?.name} - {ex.equipment?.stores?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(ex.confirmed_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={"text-xs font-bold px-2 py-0.5 rounded-full " + (ex.conformity ? "bg-accent/20 text-accent-foreground" : "bg-warn/20 text-warn")}>{ex.conformity ? "Conforme" : "Nao conforme"}</span>
                  <span className="text-xs font-bold text-primary">{ex.xp_earned} XP</span>
                </div>
              </div>
              {ex.photo_url && <a href={ex.photo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary font-bold"><ExternalLink className="w-3 h-3" /> Ver foto</a>}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
