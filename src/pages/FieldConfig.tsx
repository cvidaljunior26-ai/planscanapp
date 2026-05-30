import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FieldStatus } from "@/integrations/supabase/types";

const FIELDS = [
  { name: "nome_promotor", label: "Nome do promotor" },
  { name: "matricula", label: "Matricula" },
  { name: "produto", label: "Produto abastecido" },
  { name: "caixas", label: "Caixas fisicas" },
  { name: "validade", label: "Data de validade" },
  { name: "foto_gondola", label: "Foto da gondola" },
  { name: "pesquisa_preco", label: "Pesquisa de preco" },
  { name: "foto_etiqueta", label: "Foto da etiqueta" },
  { name: "multi_produto", label: "Multi-produto" },
  { name: "conformidade", label: "Conformidade" },
  { name: "observacoes", label: "Observacoes" },
];

const STATUS_CONFIG: Record<FieldStatus, { label: string; bg: string }> = {
  required: { label: "Obrigatorio", bg: "bg-primary text-white" },
  optional: { label: "Opcional", bg: "bg-warn text-white" },
  hidden: { label: "Oculto", bg: "bg-border text-sub" },
};

const CYCLE: FieldStatus[] = ["required", "optional", "hidden"];

export default function FieldConfig() {
  const { companyId } = useAuth();
  const [configs, setConfigs] = useState<Record<string, FieldStatus>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (companyId) loadConfig(); }, [companyId]);

  async function loadConfig() {
    const { data } = await supabase.from("field_configs").select("*").eq("company_id", companyId!);
    const map: Record<string, FieldStatus> = {};
    FIELDS.forEach(f => { map[f.name] = "required"; });
    data?.forEach(c => { map[c.field_name] = c.status as FieldStatus; });
    setConfigs(map);
  }

  function toggle(fieldName: string) {
    const current = configs[fieldName] ?? "required";
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    setConfigs({ ...configs, [fieldName]: next });
  }

  async function handleSave() {
    setSaving(true);
    for (const [fieldName, status] of Object.entries(configs)) {
      const { data: existing } = await supabase.from("field_configs").select("id").eq("company_id", companyId!).eq("field_name", fieldName).single();
      if (existing) { await supabase.from("field_configs").update({ status }).eq("id", existing.id); }
      else { await supabase.from("field_configs").insert({ company_id: companyId!, field_name: fieldName, status }); }
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminLayout title="Configuracao de Campos" subtitle="Defina quais campos aparecem para o promotor">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
        <div className="divide-y divide-border">
          {FIELDS.map(field => {
            const status = configs[field.name] ?? "required";
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={field.name} className="px-4 py-3.5 flex items-center justify-between">
                <p className="text-sm font-bold text-textMain">{field.label}</p>
                <button onClick={() => toggle(field.name)} className={"text-xs font-extrabold px-3 py-1.5 rounded-full transition-all " + cfg.bg}>{cfg.label}</button>
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl shadow-card text-sm">
        {saved ? "Configuracoes Salvas!" : saving ? "Salvando..." : "Salvar Configuracoes"}
      </button>
    </AdminLayout>
  );
              }
