import React from "react"
import { Award, Sparkles } from "lucide-react"

export default function BadgeUnlockModal({ badge, onClose }) {
  if (!badge) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">

      {/*Confetti con CSS para decorar la insignia */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const delay = (i * 0.2).toFixed(1)
          const left = (i * 5).toFixed(0)
          const colors = ["bg-amber-400", "bg-orange-400", "bg-emerald-400", "bg-sky-400", "bg-rose-400"]
          const randomColor = colors[i % colors.length]
          return (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full opacity-75 ${randomColor} animate-confetti-fall`}
              style={{
                left: `${left}%`,
                top: `-10px`,
                animationDelay: `${delay}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          )
        })}
      </div>

      {/*Tarjeta de la insignia*/}
      <div className="w-full max-w-[340px] bg-linear-to-br from-amber-50 via-white to-orange-100/90 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl relative text-center flex flex-col items-center animate-scale-up">
        
        {/*Destellos de fondo*/}
        <div className="absolute -top-12 w-48 h-48 bg-amber-400/25 rounded-full blur-3xl animate-pulse -z-10" />

        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-sm mb-3 animate-wiggle">
          <Award className="text-amber-600 w-8 h-8" strokeWidth={2.5} />
        </div>

        <span className="text-[10px] font-extrabold tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 uppercase mb-4 flex items-center gap-1.5 shadow-xs">
          {/*<Sparkles size={11} className="animate-spin" />*/}
          ¡Logro Desbloqueado!
        </span>

        {/*Insignia en grande*/}
        <div className="relative w-36 h-36 flex items-center justify-center mb-5">
          <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse scale-90" />
          
          <div className="relative z-10 w-32 h-32 rounded-2xl flex items-center justify-center border-3 border-amber-300 bg-linear-to-br from-amber-100/70 to-orange-50/30 shadow-xl overflow-hidden animate-spin-once">
            <img
              src={badge.icono_url}
              alt={badge.nombre}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/*Título de la Insignia*/}
        <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2 tracking-tight">
          {badge.nombre}
        </h2>

        {/*Descripción*/}
        <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6 px-3">
          {badge.descripcion}
        </p>

        {/*Botón Reclamar */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all text-white font-black rounded-2xl text-md tracking-wider shadow-lg border-b-4 border-amber-700"
        >
          ¡RECLAMAR LOGRO!
        </button>
      </div>

      {/*Estilos de animación del confetti*/}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(850px) rotate(360deg); opacity: 0; }
        }
        @keyframes spinOnce {
          0% { transform: rotate(-45deg) scale(0.5); }
          50% { transform: rotate(10deg) scale(1.1); }
          100% { transform: rotate(0) scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-confetti-fall {
          animation: confettiFall linear infinite;
        }
        .animate-spin-once {
          animation: spinOnce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  )
}
