import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, TrendingUp, DollarSign } from "lucide-react";

interface PromoterRank { name: string; xp: number; count: number; }

export default function Reports() {
  const { companyId } = useAuth();
  const [conformity, setConformity] = useState(0);
  const [total, setTotal] = useState(0);
  const [ranking, setRanking] = useState<PromoterRank[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);

  useEffect(() => { if (companyId) load(); }, [companyId]);

  async function load() {
    const { data } = await supabase.from("executions")
      .select("conformity, xp_earned, promoter_name, equipment(stores(company_id)), execution_items(price, product_name)")
      .order("confirmed_at", { ascending: false });
    const filtered = data?.filter(e => e.equipment?.stores?.company_id === companyId) ?? [];
    setTotal(filtered.length);
    const conf = filtered.filter(e => e.conformity).length;
    setConformity(filtered.length > 0 ? Math.round((conf / filtered.length) * 100) : 0);
    const rankMap: Record<string, PromoterRank> = {};
    filtered.forEach(e => {
      if (!rankMap[e.promoter_name]) rankMap[e.promoter_name] = { name: e.promoter_name, xp: 0, count: 0 };
      rankMap[e.promoter_name].xp += e.xp_earned; rankMap[e.promoter_name].count++;
    });
    setRanking(Object.values(rankMap).sort((a, b) => b.xp - a.xp).slice(0, 10));
    const priceMap: Record<string, number[]> = {};
    filtered.forEach(e => e.execution_items?.forEach((item: any) => {
      if (item.price && item.product_name) { if (!priceMap[item.product_name]) priceMap[item.product_name] = []; priceMap[item.product_name].push(item.price); }
    }));
    setPriceData(Object.entries(priceMap).map(([name, vals]) => ({ name, avg: vals.reduce((a, b) => a + b, 0) / vals.length, count: vals.length })).sort((a, b) => b.count - a.count).slice(0, 10));
  }

  return (
    <AdminLayout title="Relatorios" subtitle="Visao analitica da operacao">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-accent" /><span className="text-xs font-extrabold text-sub uppercase tracking-wider">Conformidade</span></div><div className="text-3xl font-black text-primary">{conformity}%</div><div className="text-xs text-sub mt-0.5">{total} execucoes</div></div>
        <div className="bg-white rounded-2xl shadow-card p-4"><div className="flex items-center gap-2 mb-2"><Trophy className="w-5 h-5 text-warn" /><span className="text-xs font-extrabold text-sub uppercase tracking-wider">Ranking</span></div><div className="text-3xl font-black text-primary">{ranking.length}</div><div className="text-xs text-sub mt-0.5">promotores ativos</div></div>
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
        <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /><h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">Ranking de Promotores</h3></div>
        <div className="divide-y divide-border">
          {ranking.length === 0 ? <p className="p-4 text-sm text-sub text-center">Sem dados ainda</p> : ranking.map((p, i) => (
            <div key={p.name} className="px-4 py-3 flex items-center gap-3">
              <span className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-black " + (i === 0 ? "bg-warn/20 text-warn" : "bg-background text-muted-foreground")}>{i+1}</span>
              <div className="flex-1"><p className="text-sm font-bold text-textMain">{p.name}</p><p className="text-xs text-sub">{p.count} execucoes</p></div>
              <span className="text-sm font-extrabold text-primary">{p.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /><h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">Pesquisa de Precos</h3></div>
        <div className="divide-y divide-border">
          {priceData.length === 0 ? <p className="p-4 text-sm text-sub text-center">Sem pesquisas ainda</p> : priceData.map(p => (
            <div key={p.name} className="px-4 py-3 flex items-center justify-between">
              <div><p className="text-sm font-bold text-textMain">{p.name}</p><p className="text-xs text-sub">{p.count} pesquisas</p></div>
              <span className="text-sm font-extrabold text-accent-foreground">R$ {p.avg.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
            }
