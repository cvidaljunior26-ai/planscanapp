import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Store { id: string; name: string; address: string | null; city: string | null; manager_name: string | null; }

export default function Stores() {
  const { companyId } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", manager_name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (companyId) loadStores(); }, [companyId]);

  async function loadStores() {
    const { data } = await supabase.from("stores").select("*").eq("company_id", companyId!).order("name");
    if (data) setStores(data);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from("stores").insert({ ...form, company_id: companyId! });
    setForm({ name: "", address: "", city: "", manager_name: "" }); setShowForm(false);
    await loadStores(); setSaving(false);
  }

  return (
    <AdminLayout title="Lojas / PDVs" subtitle={stores.length + " lojas cadastradas"}
      action={<button onClick={() => setShowForm(true)} className="bg-accent text-white rounded-xl px-3 py-2 flex items-center gap-1 text-xs font-extrabold shadow-card"><Plus className="w-4 h-4" /> Nova Loja</button>}>
      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 className="text-sm font-extrabold text-primary mb-4">Nova Loja</h3>
          <form onSubmit={handleSave} className="space-y-3">
            {(["name","address","city","manager_name"] as const).map(field => (
              <div key={field}>
                <label className="block text-xs font-bold text-sub mb-1">{field === "manager_name" ? "Responsavel" : field === "address" ? "Endereco" : field === "city" ? "Cidade" : "Nome"}</label>
                <input value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} required={field==="name"} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 bg-primary text-white font-extrabold py-2.5 rounded-xl text-sm">{saving ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-background text-sub font-bold py-2.5 rounded-xl text-sm border border-border">Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="space-y-3">
        {stores.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center"><MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-bold text-sub">Nenhuma loja cadastrada</p></div>
        ) : stores.map(store => (
          <Link key={store.id} to={"/stores/" + store.id + "/equipment"} className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between hover:shadow-card-lg transition-shadow">
            <div><p className="font-extrabold text-textMain">{store.name}</p>{store.city && <p className="text-xs text-sub mt-0.5">{store.city}</p>}</div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
                }
