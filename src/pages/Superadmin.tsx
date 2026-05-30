import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";

export default function Superadmin() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
    setCompanies(data ?? []); setLoading(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("companies").update({ active: !active }).eq("id", id); await load();
  }

  async function changePlan(id: string, plan: string) {
    await supabase.from("companies").update({ plan }).eq("id", id); await load();
  }

  const active = companies.filter(c => c.active).length;
  const mrr = companies.filter(c => c.active).reduce((sum, c) => sum + (c.plan === "starter" ? 197 : c.plan === "growth" ? 497 : 997), 0);

  return (
    <AdminLayout title="Superadmin" subtitle="Painel global da plataforma">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label: "Empresas", value: companies.length }, { label: "Ativas", value: active }, { label: "MRR", value: "R$" + mrr.toLocaleString("pt-BR") }].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-3 text-center">
            <div className="text-xl font-black text-primary">{value}</div>
            <div className="text-xs font-bold text-sub">{label}</div>
          </div>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-3">
          {companies.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div><p className="font-extrabold text-textMain">{c.name}</p><p className="text-xs text-sub mt-0.5">{formatDate(c.created_at)}</p></div>
                <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + (c.active ? "bg-accent/20 text-accent-foreground" : "bg-destructive/10 text-destructive")}>{c.active ? "Ativa" : "Suspensa"}</span>
              </div>
              <div className="flex gap-2">
                <select value={c.plan} onChange={e => changePlan(c.id, e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none">
                  <option value="starter">Starter R$197</option>
                  <option value="growth">Growth R$497</option>
                  <option value="pro">Pro R$997</option>
                </select>
                <button onClick={() => toggleActive(c.id, c.active)} className={"px-3 py-2 rounded-xl text-xs font-bold " + (c.active ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground")}>
                  {c.active ? "Suspender" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
