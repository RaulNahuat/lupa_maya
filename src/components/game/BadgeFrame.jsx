import React from "react";
import { Lock } from "lucide-react";

export default function BadgeFrame({
  imageSrc,
  title,
  description,
  unlocked = true,
  requirement,
  onClick,
  className = "",
}) {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 text-center w-full select-none cursor-pointer group active:scale-[0.98] shadow-xs
        ${
          unlocked
            ? "from-amber-50/60 to-orange-100/30 border-amber-200/60 hover:border-amber-400 hover:-translate-y-1 hover:shadow-md bg-linear-to-br"
            : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300"
        } ${className}`}
    >
      {/*Contenedor central de la insignia y efectos */}
      <div className="relative w-22 h-22 flex items-center justify-center mb-3">

        {unlocked && (
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-110" />
        )}

        {/*Marco de la imagen*/}
        <div
          className={`relative z-10 w-20 h-20 rounded-lg flex items-center justify-center border-2 shadow-inner overflow-hidden transition-all duration-300
            ${unlocked
              ? "border-amber-200/70 bg-linear-to-br from-amber-100/50 to-orange-50/20 group-hover:border-amber-300"
              : "border-slate-200 bg-slate-100/50"
            }`}
        >
          {/*Imagen de la insignia*/}
          <img
            src={imageSrc}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300
              ${unlocked ? "group-hover:scale-105 filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.15)]" : "opacity-25 grayscale"}`}
          />
        </div>

        {/* Overlay de bloqueo*/}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-slate-900/80 p-2.5 rounded-full text-slate-100 shadow-lg border border-white/10 backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
              <Lock size={14} className="stroke-[2.5]" />
            </div>
          </div>
        )}
      </div>

      {/*Información de la insignia */}
      <div className="flex flex-col grow w-full">
        <h3
          className={`text-xs font-extrabold tracking-wide uppercase mb-1 transition-colors duration-300 line-clamp-1
            ${unlocked ? "text-slate-800 group-hover:text-amber-600" : "text-slate-400"}`}
        >
          {title}
        </h3>

        {/*Descripción o Requisito */}
        <p className={`text-xs leading-normal mb-3 line-clamp-2 px-1 ${unlocked ? "text-slate-600" : "text-slate-400/80 font-medium"}`}>
          {!unlocked && requirement ? requirement : description}
        </p>

        {/*Pie de tarjeta*/}
        <div className="mt-auto pt-2.5 border-t border-dashed border-slate-200/60 flex justify-center">
          {unlocked ? (
            <span className="text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/50 inline-flex items-center gap-1 shadow-xs">
              {/* Ping animation para el estado OBTENIDA */}
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              OBTENIDA
            </span>
          ) : (
            <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60 inline-flex items-center gap-1">
              BLOQUEADA
            </span>
          )}
        </div>
      </div>
    </div>
  );
}