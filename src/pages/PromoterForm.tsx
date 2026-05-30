import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { FieldStatus } from "@/integrations/supabase/types";

interface ProductEntry { product_name: string; quantity: number; expiry_date: string; price: string; }
interface FieldConfig { [key: string]: FieldStatus; }

export default function PromoterForm() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const { state } = useLocation() as { state: { equipmentId: string; storeName: string; equName: string; companyId: string } };
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<FieldConfig>({});
  const [form, setForm] = useState({ promoter_name: "", badge: "" });
  const [products, setProducts] = useState<ProductEntry[]>([{ product_name: "", quantity: 1, expiry_date: "", price: "" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      const { data } = await supabase.from("field_configs").select("*").eq("company_id", state?.companyId ?? "");
      const map: FieldConfig = { nome_promotor: "required", matricula: "required", produto: "required", caixas: "required", validade: "required", foto_gondola: "required", pesquisa_preco: "optional", foto_etiqueta: "hidden", multi_produto: "optional", conformidade: "required", observacoes: "hidden" };
      data?.forEach(c => { map[c.field_name] = c.status as FieldStatus; });
      setConfigs(map); setLoading(false);
    }
    if (state?.companyId) loadConfig(); else setLoading(false);
  }, [state]);

  const show = (f: string) => configs[f] !== "hidden";
  const req = (f: string) => configs[f] === "required";
  const addProduct = () => setProducts([...products, { product_name: "", quantity: 1, expiry_date: "", price: "" }]);
  const removeProduct = (i: number) => setProducts(products.filter((_, idx) => idx !== i));
  function updateProduct(i: number, key: keyof ProductEntry, value: string | number) {
    const updated = [...products]; (updated[i] as any)[key] = value; setProducts(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/scan/" + qrToken + "/success", { state: { ...state, form, products, xp: { total: 10, breakdown: { "Gondola executada": 10 } } } });
  }

  if (loading) return <div className="min-h-screen bg-[#F2F0FF] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3B1F6E] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F2F0FF] pb-8">
      <div className="bg-[#3B1F6E] px-5 pt-10 pb-5 text-white">
        <h1 className="text-xl font-black">{state?.equName}</h1>
        <p className="text-sm text-white/60">{state?.storeName}</p>
      </div>
      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
        {(show("nome_promotor") || show("matricula")) && (
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-[#3B1F6E] uppercase tracking-wider">Identificacao</h3>
            {show("nome_promotor") && <div><label className="block text-xs font-bold text-[#7968A0] mb-1">Nome{req("nome_promotor") ? " *" : ""}</label><input value={form.promoter_name} onChange={e => setForm({...form,promoter_name:e.target.value})} required={req("nome_promotor")} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0F8] bg-[#F2F0FF] text-sm focus:outline-none" /></div>}
            {show("matricula") && <div><label className="block text-xs font-bold text-[#7968A0] mb-1">Matricula{req("matricula") ? " *" : ""}</label><input value={form.badge} onChange={e => setForm({...form,badge:e.target.value})} required={req("matricula")} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0F8] bg-[#F2F0FF] text-sm focus:outline-none" /></div>}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
          <h3 className="text-xs font-extrabold text-[#3B1F6E] uppercase tracking-wider">Abastecimento</h3>
          {products.map((p, i) => (
            <div key={i} className="space-y-3 pb-4 border-b border-[#E4E0F8] last:border-0 last:pb-0">
              {products.length > 1 && <div className="flex items-center justify-between"><span className="text-xs font-bold text-[#3B1F6E]">Produto {i+1}</span><button type="button" onClick={() => removeProduct(i)} className="text-red-400"><Trash2 className="w-4 h-4" /></button></div>}
              {show("produto") && <input value={p.product_name} onChange={e => updateProduct(i,"product_name",e.target.value)} required={req("produto")} placeholder="Nome do produto" className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0F8] bg-[#F2F0FF] text-sm" />}
              {show("caixas") && <input type="number" min={0} value={p.quantity} onChange={e => updateProduct(i,"quantity",Number(e.target.value))} required={req("caixas")} placeholder="Caixas" className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0F8] bg-[#F2F0FF] text-sm" />}
              {show("validade") && <input type="date" value={p.expiry_date} onChange={e => updateProduct(i,"expiry_date",e.target.value)} required={req("validade")} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0F8] bg-[#F2F0FF] text-sm" />}
              {show("pesquisa_preco") && <input type="number" step="0.01" min={0} value={p.price} onChange={e => updateProduct(i,"price",e.target.value)} required={req("pesquisa_preco")} placeholder="Preco R$" className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0F8] bg-[#F2F0FF] text-sm" />}
            </div>
          ))}
          {show("multi_produto") && <button type="button" onClick={addProduct} className="w-full border-2 border-dashed border-[#E4E0F8] rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-[#7968A0]"><Plus className="w-4 h-4" /> Adicionar produto</button>}
        </div>
        <button type="submit" className="w-full bg-[#3B1F6E] text-white font-extrabold py-4 rounded-2xl text-base shadow-lg">Confirmar Execucao</button>
      </form>
    </div>
  );
                                                                                                                                                                                                                  }
