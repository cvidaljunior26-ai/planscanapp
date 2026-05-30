import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { X } from "lucide-react";

export default function Gallery() {
  const { companyId } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { if (companyId) load(); }, [companyId]);

  async function load() {
    const { data } = await supabase.from("executions")
      .select("id, photo_url, confirmed_at, promoter_name, equipment(name, stores(company_id))")
      .not("photo_url", "is", null)
      .order("confirmed_at", { ascending: false }).limit(200);
    setPhotos(data?.filter(e => e.equipment?.stores?.company_id === companyId && e.photo_url) ?? []);
  }

  return (
    <AdminLayout title="Galeria de Fotos" subtitle={photos.length + " fotos"}>
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-lg w-full bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative"><img src={selected.photo_url} alt="Evidencia" className="w-full" />
              <button onClick={() => setSelected(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4"><p className="font-extrabold text-textMain">{selected.equipment?.name}</p><p className="text-xs text-sub mt-1">{selected.promoter_name} - {formatDate(selected.confirmed_at)}</p></div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {photos.map(p => (
          <button key={p.id} onClick={() => setSelected(p)} className="relative aspect-square rounded-xl overflow-hidden bg-border">
            <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
              <p className="text-[9px] text-white font-bold truncate">{p.promoter_name}</p>
            </div>
          </button>
        ))}
      </div>
      {photos.length === 0 && <div className="bg-white rounded-2xl shadow-card p-8 text-center mt-4"><p className="text-sub font-bold">Nenhuma foto registrada ainda</p></div>}
    </AdminLayout>
  );
}
