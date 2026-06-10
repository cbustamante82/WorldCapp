// ConfirmDialog — Modal de confirmación reutilizable.
// Props:
//   message  : texto de la pregunta (string)
//   onConfirm: callback al confirmar
//   onCancel : callback al cancelar

import TrashIcon from './TrashIcon'

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-paper-deep bg-paper p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícono de advertencia */}
        <div className="mb-4 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-red/10 text-accent-red">
            <TrashIcon size={24} />
          </span>
        </div>

        {/* Mensaje */}
        <p className="mb-6 text-center text-sm font-semibold leading-snug text-ink">
          {message}
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-paper-deep bg-paper py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper-deep"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-accent-red py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
