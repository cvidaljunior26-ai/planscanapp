import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { Plus, Copy, Check, Building2, X } from "lucide-react";

type Company = {
  id: string;
  name: string;
  plan: string;
  active: boolean;
  created_at: string;
};

type Credentials = {
  email: string;
  password: string;
};

export default function Superadmin() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyName: "",
    plan: "starter",
    adminName: "",
    adminEmail: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    setCompanies(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("companies").update({ active: !active }).eq("id", id);
    await load();
  }

  async function changePlan(id: string, plan: string) {
    await supabase.from("companies").update({ plan }).eq("id", id);
    await load();
  }

  async function createCompanyAndAdmin() {
    if (!form.companyName || !form.adminName || !form.adminEmail) return;
    setCreating(true);
    try {
      const { data: company, error: compErr } = await supabase
        .from("companies")
        .insert({ name: form.companyName, plan: form.plan, active: true })
        .select()
        .single();

      if (compErr || !company) {
        alert("Erro ao criar empresa: " + compErr?.message);
        setCreating(false);
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-company-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_id: company.id,
            admin_name: form.adminName,
            admin_email: form.adminEmail,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        alert("Empresa criada. Erro ao criar admin: " + (result.error || "Tente novamente."));
        await load();
        setShowForm(false);
        setCreating(false);
        return;
      }

      setCredentials({ email: result.email, password: result.password });
      setShowForm(false);
      setForm({ companyName: "", plan: "starter", adminName: "", adminEmail: "" });
      await load();
    } catch (e) {
      alert("Erro inesperado: " + String(e));
    }
    setCreating(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const active = companies.filter(c => c.active).length;
  const mrr = companies.filter(c => c.active).reduce(
    (sum, c) => sum + (c.plan === "starter" ? 197 : c.plan === "growth" ? 497 : 997), 0
  );

  return (
    <AdminLayout title="Superadmin" subtitle="Painel global da plataforma">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Empresas", value: companies.length },
          { label: "Ativas", value: active },
          { label: "MRR", value: "R$" + mrr.toLocaleString("pt-BR") },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-3 text-center">
            <div className="text-xl font-black text-primary">{value}</div>
            <div className="text-xs font-bold text-sub">{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm mb-5 shadow-md active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4" /> Nova Empresa
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-background rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Nova Empresa
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-sub" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-sub mb-1 block">Nome da Empresa</label>
                <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  placeholder="Ex: Supermercado Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-sub mb-1 block">Plano</label>
                <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none">
                  <option value="starter">Starter - R$197/mes</option>
                  <option value="growth">Growth - R$497/mes</option>
                  <option value="pro">Pro - R$997/mes</option>
                </select>
              </div>
              <hr className="border-border" />
              <p className="text-xs font-bold text-sub">Dados do Admin da Empresa</p>
              <div>
                <label className="text-xs font-bold text-sub mb-1 block">Nome do Admin</label>
                <input value={form.adminName} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-sub mb-1 block">E-mail do Admin</label>
                <input type="email" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
                  placeholder="admin@empresa.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <button onClick={createCompanyAndAdmin}
              disabled={creating || !form.companyName || !form.adminName || !form.adminEmail}
              className="mt-5 w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {creating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Criando...</> : <><Plus className="w-4 h-4" /> Criar Empresa e Gerar Acesso</>}
            </button>
          </div>
        </div>
      )}

      {credentials && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-base font-extrabold text-textMain">Empresa criada!</h2>
              <p className="text-xs text-sub mt-1">Copie as credenciais e envie ao administrador da empresa.</p>
            </div>
            <div className="space-y-3">
              <div className="bg-muted rounded-xl p-3">
                <div className="text-xs font-bold text-sub mb-1">E-mail de acesso</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-bold text-textMain break-all">{credentials.email}</span>
                  <button onClick={() => copyText(credentials.email, "email")}
                    className="shrink-0 p-1.5 rounded-lg bg-white shadow-sm">
                    {copied === "email" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-sub" />}
                  </button>
                </div>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <div className="text-xs font-bold text-sub mb-1">Senha gerada</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-bold text-textMain">{credentials.password}</span>
                  <button onClick={() => copyText(credentials.password, "pass")}
                    className="shrink-0 p-1.5 rounded-lg bg-white shadow-sm">
                    {copied === "pass" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-sub" />}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">
                  O admin deve entrar em <strong>planscan.app/login</strong> com essas credenciais.
                </p>
              </div>
            </div>
            <button onClick={() => setCredentials(null)}
              className="mt-5 w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm">
              Fechar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {companies.length === 0 && (
            <div className="text-center py-12 text-sub text-sm">Nenhuma empresa cadastrada ainda.</div>
          )}
          {companies.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-textMain">{c.name}</p>
                  <p className="text-xs text-sub mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + (c.active ? "bg-accent/20 text-accent-foreground" : "bg-destructive/10 text-destructive")}>
                  {c.active ? "Ativa" : "Suspensa"}
                </span>
              </div>
              <div className="flex gap-2">
                <select value={c.plan} onChange={e => changePlan(c.id, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none">
                  <option value="starter">Starter R$197</option>
                  <option value="growth">Growth R$497</option>
                  <option value="pro">Pro R$997</option>
                </select>
                <button onClick={() => toggleActive(c.id, c.active)}
                  className={"px-3 py-2 rounded-xl text-xs font-bold " + (c.active ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground")}>
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
