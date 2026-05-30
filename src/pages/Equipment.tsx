import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentType } from "@/integrations/supabase/types";

const EQ_TYPES: { value: EquipmentType; label: string }[] = [
  { value: "gondola", label: "Gondola" },
  { value: "geladeira", label: "Geladeira" },
  { value: "expositor", label: "Expositor" },
  { value: "checkout", label: "Checkout" },
  { value: "rack", label: "Rack" },
];

export default function Equipment() {
  const { storeId } = useParams<{ storeId: string }>();
  const [storeName, setStoreName] = useState("");
  const [equipment, setEquipment] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "gondola" as EquipmentType });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [storeId]);

  async function loadData() {
    const { data: store } = await supabase.from("stores").select("name").eq("id", storeId!).single();
    if (store) setStoreName(store.name);
    const { data: eq } = await supabase.from("equipment").select("*, executions(confirmed_at)").eq("store_id", storeId!).eq("active", true).order("name");
    if (eq) setEquipment(eq);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from("equipment").insert({ ...form, store_id: storeId! });
    setForm({ name: "", type: "gondola" }); setShowForm(false);
    await loadData(); setSaving(false);
  }

  function isExecutedToday(executions: any[]) {
    const today = new Date(); today.setHours(0,0,0,0);
    return executions?.some(e => new Date(e.confirmed_at) >= today) ?? false;
  }

  return (
    <AdminLayout title={storeName || "Equipamentos"} subtitle={equipment.length + " equipamentos"}
      action={<button onClick={() => setShowForm(true)} className="bg-accent text-white rounded-xl px-3 py-2 flex items-center gap-1 text-xs font-extrabold shadow-card"><Plus className="w-4 h-4" /> Novo</button>}>
      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 className="text-sm font-extrabold text-primary mb-4">Novo Equipamento</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div><label className="block text-xs font-bold text-sub mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-sub mb-1">Tipo *</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value as EquipmentType})} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm">{EQ_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 bg-primary text-white font-extrabold py-2.5 rounded-xl text-sm">{saving ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-background text-sub font-bold py-2.5 rounded-xl text-sm border border-border">Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="space-y-3">
        {equipment.map(eq => {
          const executed = isExecutedToday(eq.executions ?? []);
          return (
            <Link key={eq.id} to={"/equipment/" + eq.id + "/planogram"} className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between hover:shadow-card-lg transition-shadow">
              <div className="flex items-center gap-3">
                {executed ? <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-warn flex-shrink-0" />}
                <div><p className="font-extrabold text-textMain">{eq.name}</p><p className="text-xs text-sub capitalize mt-0.5">{EQ_TYPES.find(t => t.value === eq.type)?.label}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + (executed ? "bg-accent/20 text-accent-foreground" : "bg-warn/20 text-warn")}>{executed ? "Executado" : "Pendente"}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
                                                                                     }
