import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Upload, Download, Copy, Printer, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = window.location.origin;

export default function Planogram() {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const [equipment, setEquipment] = useState<any>(null);
  const [planogram, setPlanogram] = useState<any>(null);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showNegForm, setShowNegForm] = useState(false);
  const [neg, setNeg] = useState({ sku: "", product_name: "", faces: 1, position: "", valid_until: "" });
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, [equipmentId]);

  async function loadData() {
    const { data: eq } = await supabase.from("equipment").select("*, stores(name)").eq("id", equipmentId!).single();
    if (eq) setEquipment(eq);
    const { data: pl } = await supabase.from("planograms").select("*").eq("equipment_id", equipmentId!).order("updated_at", { ascending: false }).limit(1).single();
    if (pl) setPlanogram(pl);
    const { data: negs } = await supabase.from("negotiations").select("*").eq("equipment_id", equipmentId!);
    if (negs) setNegotiations(negs);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `planograms/${equipmentId}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("planogram-files").upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from("planogram-files").getPublicUrl(path);
      if (planogram) {
        await supabase.from("planograms").update({ image_url: publicUrl }).eq("id", planogram.id);
      } else {
        await supabase.from("planograms").insert({ equipment_id: equipmentId!, image_url: publicUrl });
      }
      await loadData();
    }
    setUploading(false);
  }

  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${equipment?.name ?? "planscan"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function copyLink() {
    const url = `${BASE_URL}/scan/${equipment?.qr_token}`;
    navigator.clipboard.writeText(url);
  }

  function printQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const img = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><body style="display:flex;flex-direction:column;align-items:center;padding:40px;font-family:sans-serif">
      <h2 style="margin-bottom:8px">${equipment?.name}</h2>
      <p style="color:#666;margin-bottom:20px">${equipment?.stores?.name ?? ""}</p>
      <img src="${img}" style="width:300px;height:300px"/>
      <p style="margin-top:16px;font-size:12px;color:#888">Escaneie para ver o planograma</p>
    </body></html>`);
    w.print();
  }

  async function addNegotiation(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("negotiations").insert({ ...neg, equipment_id: equipmentId!, faces: Number(neg.faces) });
    setNeg({ sku: "", product_name: "", faces: 1, position: "", valid_until: "" });
    setShowNegForm(false);
    await loadData();
  }

  async function removeNeg(id: string) {
    await supabase.from("negotiations").delete().eq("id", id);
    await loadData();
  }

  const qrUrl = equipment ? `${BASE_URL}/scan/${equipment.qr_token}` : "";

  return (
    <AdminLayout title={equipment?.name ?? "Planograma"} subtitle={equipment?.stores?.name}>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">📋 Planograma</h3>
        </div>
        <div className="p-4">
          {planogram?.image_url ? (
            <img src={planogram.image_url} alt="Planograma" className="w-full rounded-xl mb-3 border border-border" />
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-3">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-sub font-bold">Nenhum planograma</p>
            </div>
          )}
          <label className="block">
            <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
            <span className="w-full bg-primary/10 text-primary font-extrabold py-2.5 rounded-xl text-sm text-center cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> {uploading ? "Enviando..." : "Upload Planograma"}
            </span>
          </label>
        </div>
      </div>

      {equipment && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">📷 QR Code</h3>
          </div>
          <div className="p-4">
            <div ref={qrRef} className="flex justify-center mb-4">
              <QRCodeCanvas value={qrUrl} size={200} level="H" includeMargin />
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4 font-mono break-all">{qrUrl}</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={downloadQR}
                className="bg-primary/10 text-primary font-bold py-2 rounded-xl text-xs flex flex-col items-center gap-1">
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={copyLink}
                className="bg-primary/10 text-primary font-bold py-2 rounded-xl text-xs flex flex-col items-center gap-1">
                <Copy className="w-4 h-4" /> Copiar
              </button>
              <button onClick={printQR}
                className="bg-primary/10 text-primary font-bold py-2 rounded-xl text-xs flex flex-col items-center gap-1">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
            <p className="text-xs text-sub text-center mt-3">
              ✓ QR vinculado ao equipamento — não muda ao atualizar o planograma
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
        <div className="bg-primary/10 px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">🤝 Negociações</h3>
          <button onClick={() => setShowNegForm(true)}
            className="text-primary text-xs font-bold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
        {showNegForm && (
          <div className="p-4 border-b border-border">
            <form onSubmit={addNegotiation} className="space-y-2">
              {[
                { key: "sku", label: "SKU", required: true },
                { key: "product_name", label: "Produto", required: true },
                { key: "position", label: "Posição" },
                { key: "valid_until", label: "Validade", type: "date" },
              ].map(({ key, label, required, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-sub mb-0.5">{label}{required && " *"}</label>
                  <input type={type || "text"} value={(neg as any)[key]}
                    onChange={(e) => setNeg({ ...neg, [key]: e.target.value })}
                    required={required}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-sub mb-0.5">Faces *</label>
                <input type="number" min={1} value={neg.faces}
                  onChange={(e) => setNeg({ ...neg, faces: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-primary text-white font-extrabold py-2 rounded-xl text-sm">Salvar</button>
                <button type="button" onClick={() => setShowNegForm(false)}
                  className="flex-1 bg-background text-sub font-bold py-2 rounded-xl text-sm border border-border">Cancelar</button>
              </div>
            </form>
          </div>
        )}
        <div className="divide-y divide-border">
          {negotiations.length === 0 ? (
            <p className="p-4 text-sm text-sub text-center">Nenhuma negociação cadastrada</p>
          ) : (
            negotiations.map((n) => (
              <div key={n.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-textMain">{n.product_name}</p>
                  <p className="text-xs text-sub">SKU: {n.sku} · {n.faces} face{n.faces > 1 ? "s" : ""}{n.position ? ` · ${n.position}` : ""}</p>
                </div>
                <button onClick={() => removeNeg(n.id)} className="p-1.5 text-destructive hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
