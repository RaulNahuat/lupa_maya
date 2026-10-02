import { useState } from "react"
import { Mail, X, Copy, Check } from "lucide-react"

const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL_1,
  import.meta.env.VITE_ADMIN_EMAIL_2,
].filter(Boolean)

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [copiado, setCopiado] = useState(null)

  const copiarCorreo = async (email) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiado(email)
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      // Si el navegador bloquea el portapapeles, no se hace nada
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div
        className="relative bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl flex flex-col items-center text-center gap-3.5 transform transition-all zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="size-6" />
        </button>

        {/* Ícono */}
        <div className="bg-maya-cream rounded-full p-4">
          <Mail className="size-10 text-dark-gold" />
        </div>

        {/* Título */}
        <p id="forgot-password-title" className="text-2xl font-extrabold text-dark-brown">
          ¿Olvidaste tu contraseña?
        </p>

        {/* Mensaje */}
        <p className="text-gray-500 text-md px-2">
          Para recuperar tu acceso o solicitar una nueva contraseña, contacta a un administrador:
        </p>

        {/* Correos */}
        <div className="flex flex-col gap-2 w-full">
          {ADMIN_EMAILS.map((email) => (
            <div key={email} className="flex items-center justify-center gap-3">
              <a
                href={`mailto:${email}?subject=Solicitud de nueva contraseña`}
                className="text-md font-bold text-maya-gold underline break-all"
              >
                {email}
              </a>
              <button
                type="button"
                onClick={() => copiarCorreo(email)}
                aria-label={`Copiar ${email}`}
                className="shrink-0 text-gray-400 hover:text-maya-gold transition-colors cursor-pointer"
              >
                {copiado === email ? (
                  <Check className="size-5 text-green-600" />
                ) : (
                  <Copy className="size-5" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Botón */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 bg-dark-gold text-white font-bold text-md rounded-2xl py-3 shadow-[0_4px_0_#7A5000] active:shadow-[0_2px_0_#7A5000] active:translate-y-1 transition-all cursor-pointer"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  )
}

export default ForgotPasswordModal