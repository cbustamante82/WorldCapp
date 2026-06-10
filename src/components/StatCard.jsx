// StatCard — Tarjeta de métrica simple (etiqueta + valor + acento opcional).

export default function StatCard({ label, value, accent = 'var(--color-ink)', sub }) {
  return (
    <div className="rounded-lg border border-paper-deep bg-paper p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft">{label}</p>
      <p className="brand-title text-4xl tabular" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="text-xs font-medium text-ink-soft">{sub}</p>}
    </div>
  )
}
