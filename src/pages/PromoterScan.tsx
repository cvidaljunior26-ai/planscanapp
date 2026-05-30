import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function PromoterScan() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: eq, error: err } = await supabase
        .from("equipment")
        .select("*, stores(name, company_id, companies(name, logo_url)), planograms(image_url, instructions, capacity_boxes), negotiations(*)")
        .eq("qr_token", qrToken!)
        .eq("active", true)
        .single();
      if (err || !eq) { setError("QR Code invalido ou equipamento inativo."); setLoading(false); return; }
      setData(eq); setLoading(false);
    }
    load();
  }, [qrToken]);

  if (loading) return <div className="min-h-screen bg-[#F2F0FF] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3B1F6E] border-t-transparent rounded-full animate-spin" /></div>;

  if (error) return (
    <div className="min-h-screen bg-[#F2F0FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
        <div className="text-4xl mb-4">x</div>
        <h2 className="font-extrabold text-[#1A1040] text-lg mb-2">QR Code invalido</h2>
        <p className="text-sm text-[#7968A0]">{error}</p>
      </div>
    </div>
  );

  const planogram = data.planograms?.[0];
  const company = data.stores?.companies;

  return (
    <div className="min-h-screen bg-[#F2F0FF]">
      <div className="bg-[#3B1F6E] px-5 pt-10 pb-6 text-white">
        <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{company?.name}</p>
        <h1 className="text-2xl font-black">{data.name}</h1>
        <p className="text-sm text-white/60 mt-1">{data.stores?.name}</p>
      </div>
      <div className="px-4 py-5 space-y-4">
        {planogram?.image_url && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#EDE9FF] px-4 py-3 border-b border-[#E4E0F8]">
              <h3 className="text-xs font-extrabold text-[#3B1F6E] uppercase tracking-wider">Planograma</h3>
            </div>
            <div className="p-3">
              <img src={planogram.image_url} alt="Planograma" className="w-full rounded-xl" />
              {planogram.instructions && <p className="text-sm text-[#7968A0] mt-3 p-3 bg-[#F2F0FF] rounded-xl">{planogram.instructions}</p>}
            </div>
          </div>
        )}
        {data.negotiations?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#EDE9FF] px-4 py-3 border-b border-[#E4E0F8]">
              <h3 className="text-xs font-extrabold text-[#3B1F6E] uppercase tracking-wider">Espacos Negociados</h3>
            </div>
            <div className="divide-y divide-[#E4E0F8]">
              {data.negotiations.map((n: any) => (
                <div key={n.id} className="px-4 py-3">
                  <p className="font-bold text-sm text-[#1A1040]">{n.product_name}</p>
                  <p className="text-xs text-[#7968A0]">{n.faces} face{n.faces > 1 ? "s" : ""}{n.position ? " - " + n.position : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/scan/" + qrToken + "/form", { state: { equipmentId: data.id, storeName: data.stores?.name, equName: data.name, companyId: data.stores?.company_id } })}
          className="w-full bg-[#3B1F6E] text-white font-extrabold py-4 rounded-2xl text-base shadow-lg">
          Iniciar Execucao
        </button>
      </div>
    </div>
  );
}
