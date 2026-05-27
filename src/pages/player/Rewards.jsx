import React, { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useGameStore } from "../../store/game/useGameStore"
import { useNavigate } from "react-router-dom"
import { db } from "../../data/db"
import BadgeFrame from "../../components/game/BadgeFrame"
import BottomNav from "../../components/game/BottomNav"
import { ArrowLeft, Award, Flame, Trophy, X, Lock, CheckCircle2 } from "lucide-react"

export default function Rewards() {
  const levels = useGameStore((s) => s.levels)
  const initLevels = useGameStore((s) => s.initLevels)
  const racha = useGameStore((s) => s.racha)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [dbBadges, setDbBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState(null)

  useEffect(() => {
    if (currentUser) {
      //Inicializa niveles y carga las insignias directamente de IndexedDB (Dexie)
      Promise.all([
        initLevels(currentUser),
        db.insignias.toArray()
      ]).then(([_, insigniasFromDb]) => {
        setDbBadges(insigniasFromDb)
        setLoading(false)
      }).catch((err) => {
        console.error("Error cargando insignias desde base de datos:", err)
        setLoading(false)
      })
    }
  }, [currentUser])

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-amber-50">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cargando insignias...</p>
      </div>
    )
  }

  //Criterios dinámicos de desbloqueo basados en el progreso real de la BD
  const hasCompletedAnySearch = levels.some((l) => l.completado && l.tipo === "BUSQUEDA")
  const hasCompletedAnyLevel = levels.some((l) => l.completado)

  //Mapeamos las insignias de la BD para calcular dinámicamente si están desbloqueadas y su requisito
  const badgesList = dbBadges.map((badge) => {
    let unlocked = false
    let requirement = ""

    if (badge.tipo_condicion === "ESCANEOS") {
      unlocked = hasCompletedAnySearch || hasCompletedAnyLevel
      requirement = `Completa tu primer nivel para comenzar.`
    } else if (badge.tipo_condicion === "RACHA") {
      unlocked = racha >= badge.valor_condicion
      requirement = `Consigue una racha de ${badge.valor_condicion} días seguidos de juego.`
    }

    return {
      id: badge.id,
      imageSrc: badge.icono_url,
      title: badge.nombre,
      description: badge.descripcion,
      unlocked,
      requirement
    }
  })

  const unlockedCount = badgesList.filter((b) => b.unlocked).length

  return (
    <div className="md:min-h-screen md:bg-gray-600 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] h-screen flex flex-col bg-amber-50 md:relative md:overflow-hidden md:rounded-3xl md:shadow-2xl">
        
        {/*header */}
        <header className="relative z-20 shrink-0 bg-white border-b-2 border-gray-200 px-5 py-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/map")}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-amber-100 active:scale-95 text-dark-gold"
              title="Volver al mapa"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-extrabold text-black leading-tight text-xl flex items-center gap-1.5">
                <Trophy className="text-maya-gold animate-bounce" size={20} />
                Insignias
              </h1>
              <p className="text-maya-gray text-xs font-semibold">
                {unlockedCount} de {badgesList.length} obtenidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-50 border border-orange rounded-full px-3 py-1.5">
              <Flame size={16} className="text-orange" />
              <span className="text-sm font-bold text-orange">{racha}</span>
            </div>
          </div>
        </header>

        {/*contenedor de las insignias */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/*Tarjeta de estadísticas */}
          <div className="bg-linear-to-r from-dark-gold to-maya-gold text-white rounded-2xl p-5 mb-6 shadow-md flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-widest uppercase font-bold text-amber-100">
                Logros Completados
              </span>
              <span className="text-3xl font-extrabold flex items-baseline gap-1">
                {unlockedCount} <span className="text-sm font-normal text-amber-100">insignias</span>
              </span>
            </div>
            <Award size={48} className="text-amber-100/30 rotate-12" />
          </div>

          {/*Cuadrícula de 2 columnas para las insignias*/}
          {badgesList.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-10">
              No hay insignias registradas en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-24">
              {badgesList.map((badge) => (
                <BadgeFrame
                  key={badge.id}
                  imageSrc={badge.imageSrc}
                  title={badge.title}
                  description={badge.description}
                  unlocked={badge.unlocked}
                  requirement={badge.requirement}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          )}
        </div>

        <BottomNav className="shrink-0" />

        {/*vista detallada en modal emergente de las insignias */}
        {selectedBadge && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
            <div className="w-full max-w-[320px] bg-linear-to-br from-amber-50 to-orange-100/80 border-2 border-maya-gold rounded-2xl p-6 shadow-2xl relative text-center flex flex-col items-center">
              
              {/*Botón Cerrar*/}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 text-maya-gray hover:text-maya-dark transition-colors"
              >
                <X size={20} />
              </button>

              {/*Insignia en grande*/}
              <div className="relative w-36 h-36 flex items-center justify-center mb-4 mt-2">
                {selectedBadge.unlocked && (
                  <div className="absolute inset-0 bg-maya-gold/20 rounded-full blur-xl animate-pulse scale-90" />
                )}
                
                {/*Marco de la imagen*/}
                <div
                  className={`relative z-10 w-32 h-32 rounded-xl flex items-center justify-center border-2 shadow-inner overflow-hidden transition-all duration-300
                    ${selectedBadge.unlocked
                      ? "border-amber-200/70 bg-linear-to-br from-amber-100/50 to-orange-50/20"
                      : "border-slate-200 bg-slate-100/50"
                    }`}
                >
                  <img
                    src={selectedBadge.imageSrc}
                    alt={selectedBadge.title}
                    className={`w-full h-full object-cover transition-all duration-300
                      ${selectedBadge.unlocked ? "animate-wiggle" : "opacity-25 grayscale"}`}
                  />
                </div>

                {!selectedBadge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-slate-800/85 p-3 rounded-full text-white shadow-lg border border-white/20">
                      <Lock size={26} />
                    </div>
                  </div>
                )}
              </div>

              {/*Información detallada */}
              <h2 className="text-xl font-extrabold text-maya-dark mb-2">
                {selectedBadge.title}
              </h2>
              <p className="text-xs text-maya-gray leading-relaxed mb-6 px-2">
                {selectedBadge.description}
              </p>

              {/*Estado y requisito de la insignia*/}
              <div className="w-full pt-4 border-t border-dashed border-maya-dark/10">
                {selectedBadge.unlocked ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-full border border-emerald-100 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    ¡LOGRO COMPLETADO!
                  </div>
                ) : (
                  <div className="bg-amber-100/50 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-1">
                      REQUISITO DE OBTENCIÓN
                    </span>
                    <span className="text-xs text-amber-900 font-medium italic block">
                      {selectedBadge.requirement}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
