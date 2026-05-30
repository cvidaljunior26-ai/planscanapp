import { useLocation, useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PromoterSuccess() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const { state } = useLocation() as { state: any };
  const xp = state?.xp ?? { total: 13, breakdown: { "Gondola executada": 10, "Foto de evidencia": 3 } };

  return (
    <div className="min-h-screen bg-[#F2F0FF]">
      <div className="bg-[#3B1F6E] px-5 pt-12 pb-8 text-white text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[#2ECC9A]" />
        <h1 className="text-2xl font-black">Execucao Confirmada!</h1>
        <p className="text-white/60 text-sm mt-2">{new Date().toLocaleDateString("pt-BR")}</p>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-[#92400E] uppercase tracking-wider mb-3">XP Ganhos</p>
          <div className="space-y-2">
            {Object.entries(xp.breakdown ?? {}).map(([action, pts]) => (
              <div key={action} className="flex justify-between text-sm">
                <span className="text-[#92400E] font-semibold">{action}</span>
                <span className="font-extrabold text-[#92400E]">+{pts as number} XP</span>
              </div>
            ))}
            <div className="border-t border-[#F59E0B]/30 pt-2 flex justify-between">
              <span className="font-extrabold text-[#92400E]">Total</span>
              <span className="text-xl font-black text-[#92400E]">+{xp.total} XP</span>
            </div>
          </div>
        </div>
        {state?.promoter_name && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-xs font-extrabold text-[#3B1F6E] uppercase tracking-wider mb-3">Comprovante</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#7968A0]">Promotor</span><span className="font-bold">{state.promoter_name}</span></div>
              {state.equName && <div className="flex justify-between"><span className="text-[#7968A0]">Equipamento</span><span className="font-bold">{state.equName}</span></div>}
              {state.storeName && <div className="flex justify-between"><span className="text-[#7968A0]">Loja</span><span className="font-bold">{state.storeName}</span></div>}
            </div>
          </div>
        )}
        <div className="bg-[#E0FBF3] border border-[#2ECC9A]/30 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-[#0F9970]">Voce pode fechar esta pagina com seguranca</p>
        </div>
        <Link to={"/scan/" + qrToken} className="block text-center text-sm text-[#7968A0] font-bold py-3">Voltar ao planograma</Link>
      </div>
    </div>
  );
}
