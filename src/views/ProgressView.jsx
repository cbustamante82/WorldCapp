// ProgressView — Vista (2) Progreso.
// Resumen de pegadas/repetidas/faltantes, gráficos (donut de avance, barras por
// sección y por selección) y un listado filtrable y exportable (CSV / JSON).

import { useMemo, useState, useCallback } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import TrashIcon from '../components/TrashIcon'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import { useCollection } from '../hooks/useCollection'
import { LAMINAS } from '../data/laminas'
import { SELECCIONES } from '../data/selecciones'
import {
  getResumen, getPorSeccion, getPorSeleccion, getListado,
} from '../lib/stats'
import { exportCSV, exportJSON, exportProgresoCSV, exportFaltantesCSV, parseProgresoCSV } from '../lib/exporters'
import { useAuth } from '../auth/AuthContext'
import { useLoading } from '../context/LoadingContext'

const SELECCION_BY_ID = Object.fromEntries(SELECCIONES.map((s) => [s.id, s]))

const PITCH = 'var(--color-pitch)'
const SLOT = 'var(--color-slot)'
const GOLD = 'var(--color-accent-gold)'

export default function ProgressView() {
  const { map: estadoMap, resetProgreso, clearRepetidas, importProgreso } = useCollection()
  const { user }        = useAuth()
  const { withLoading } = useLoading()

  const resumen = useMemo(() => getResumen(LAMINAS, estadoMap), [estadoMap])
  const porSeccion = useMemo(() => getPorSeccion(LAMINAS, estadoMap), [estadoMap])
  const porSeleccion = useMemo(() => getPorSeleccion(LAMINAS, estadoMap), [estadoMap])
  const listado = useMemo(() => getListado(LAMINAS, estadoMap), [estadoMap])

  // Diálogos de confirmación
  const [confirmReset,   setConfirmReset]   = useState(false)
  const [confirmClearRep, setConfirmClearRep] = useState(false)

  // Importación de CSV
  const [importPending, setImportPending] = useState(null)  // registros parseados listos
  const [importError,   setImportError]   = useState(null)
  const [importSuccess, setImportSuccess] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError(null)
    setImportSuccess(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const records = parseProgresoCSV(ev.target.result)
        setImportPending(records)
      } catch (err) {
        setImportError(err.message)
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleImportConfirm() {
    await withLoading(async () => {
      try {
        await importProgreso(importPending)
        setImportSuccess(`${importPending.length} láminas importadas correctamente.`)
      } catch (err) {
        setImportError('Error al importar: ' + err.message)
      } finally {
        setImportPending(null)
      }
    })
  }

  // Filtros del listado
  const [estadoFilter, setEstadoFilter] = useState('all') // all | Pegada | Faltante
  const [seleccionFilter, setSeleccionFilter] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return listado.filter((row) => {
      if (estadoFilter !== 'all' && row.estado !== estadoFilter) return false
      if (seleccionFilter !== 'all' && row.seleccion !== seleccionFilter) return false
      if (query && !row.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [listado, estadoFilter, seleccionFilter, query])

  const donutData = [
    { name: 'Pegadas', value: resumen.pegadas },
    { name: 'Faltantes', value: resumen.faltantes },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="brand-title text-4xl text-ink">Progreso</h1>
      <p className="mb-6 text-sm text-ink-soft">Avance del álbum completo — {resumen.total} láminas.</p>

      {/* Métricas */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pegadas" value={resumen.pegadas} accent={PITCH} sub={`${resumen.pct}% del álbum`} />
        <StatCard label="Faltantes" value={resumen.faltantes} accent="var(--color-accent-red)" />
        <StatCard label="Repetidas" value={resumen.repetidas} accent={GOLD} sub="total acumulado" />
        <StatCard label="Total" value={resumen.total} sub="láminas del álbum" />
      </div>

      {/* Gráficos */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {/* Donut de avance */}
        <div className="rounded-lg border border-paper-deep bg-paper p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink-soft">Avance</h2>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={PITCH} />
                  <Cell fill={SLOT} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Porcentaje al centro */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="brand-title text-5xl text-pitch tabular">{resumen.pct}%</span>
              <span className="text-xs font-medium text-ink-soft">completado</span>
            </div>
          </div>
        </div>

        {/* Barras por selección */}
        <div className="rounded-lg border border-paper-deep bg-paper p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink-soft">
            Por selección
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSeleccion} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pegadas" name="Pegadas" stackId="a" fill={PITCH} radius={[3, 3, 0, 0]} />
                <Bar dataKey="faltantes" name="Faltantes" stackId="a" fill={SLOT} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras por sección */}
        <div className="rounded-lg border border-paper-deep bg-paper p-4 lg:col-span-2">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink-soft">
            Por sección
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSeccion} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pegadas" name="Pegadas" stackId="a" fill={PITCH} radius={[0, 3, 3, 0]} />
                <Bar dataKey="faltantes" name="Faltantes" stackId="a" fill={SLOT} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Listado filtrable + exportable */}
      <div className="rounded-lg border border-paper-deep bg-paper p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft">Listado</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportCSV(filtered)}
              className="rounded-md bg-pitch px-3 py-1.5 text-sm font-semibold text-white hover:bg-pitch-dark"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => exportJSON(filtered)}
              className="rounded-md border border-paper-deep px-3 py-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Exportar JSON
            </button>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="mb-3 flex flex-wrap gap-2">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="rounded-md border border-paper-deep bg-paper px-2 py-1.5 text-sm"
          >
            <option value="all">Estado: todas</option>
            <option value="Pegada">Pegadas</option>
            <option value="Faltante">Faltantes</option>
          </select>
          <select
            value={seleccionFilter}
            onChange={(e) => setSeleccionFilter(e.target.value)}
            className="rounded-md border border-paper-deep bg-paper px-2 py-1.5 text-sm"
          >
            <option value="all">Selección: todas</option>
            {SELECCIONES.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="flex-1 rounded-md border border-paper-deep bg-paper px-3 py-1.5 text-sm"
          />
        </div>

        {/* Tabla */}
        <div className="max-h-96 overflow-auto rounded-md border border-paper-deep">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-paper-deep text-[11px] uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Selección</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Rep.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.number} className="border-t border-paper-deep/60">
                  <td className="px-3 py-1.5 tabular text-ink-soft">{row.number}</td>
                  <td className="px-3 py-1.5 font-medium">{row.name}</td>
                  <td className="px-3 py-1.5">{row.seleccion}</td>
                  <td className="px-3 py-1.5">{row.tipo}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        row.estado === 'Pegada'
                          ? 'bg-pitch/15 text-pitch'
                          : 'bg-accent-red/10 text-accent-red',
                      ].join(' ')}
                    >
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right tabular">{row.repetidas}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-soft">
                    Sin resultados para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exportar / importar progreso */}
      <div className="mt-6 rounded-lg border border-paper-deep bg-paper p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-ink-soft">
          Backup del progreso
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => exportProgresoCSV(LAMINAS, estadoMap)}
            className="rounded-md bg-pitch px-4 py-2 text-sm font-semibold text-white hover:bg-pitch-dark"
          >
            ↓ Backup progreso (CSV)
          </button>

          <button
            type="button"
            onClick={() => exportFaltantesCSV(LAMINAS, estadoMap, SELECCION_BY_ID)}
            className="rounded-md border border-accent-gold bg-accent-gold/10 px-4 py-2 text-sm font-semibold text-ink hover:bg-accent-gold/20"
          >
            ↓ Faltantes (CSV)
          </button>

          <label className="cursor-pointer rounded-md border border-paper-deep px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-paper-deep hover:text-ink">
            ↑ Cargar CSV
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {importError   && <p className="mt-2 text-sm text-accent-red">{importError}</p>}
        {importSuccess && <p className="mt-2 text-sm text-pitch">{importSuccess}</p>}

        {importPending && (
          <div className="mt-3 rounded-lg border border-paper-deep bg-paper-deep p-3 text-sm">
            <p className="font-semibold text-ink">
              Se importarán <span className="text-pitch">{importPending.length}</span> láminas.
              Esto reemplazará el progreso actual.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleImportConfirm}
                className="rounded-md bg-pitch px-3 py-1.5 text-sm font-semibold text-white hover:bg-pitch-dark"
              >
                Confirmar importación
              </button>
              <button
                type="button"
                onClick={() => setImportPending(null)}
                className="rounded-md border border-paper-deep px-3 py-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Acciones destructivas */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
        {/* Limpiar repetidas */}
        <button
          type="button"
          onClick={() => setConfirmClearRep(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-gold/80 transition hover:text-accent-gold"
          title="Pone a 0 las repetidas de todo el álbum (conserva las pegadas)"
        >
          <TrashIcon size={15} /> Eliminar todas las repetidas
        </button>

        {/* Reset completo */}
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-red/70 transition hover:text-accent-red"
        >
          <TrashIcon size={15} /> Eliminar todo el progreso del álbum
        </button>
      </div>

      {/* Diálogo: limpiar repetidas */}
      {confirmClearRep && (
        <ConfirmDialog
          message={`¿Desea poner a 0 las repetidas de todo el álbum? (${resumen.repetidas} repetida${resumen.repetidas !== 1 ? 's' : ''}) Las láminas pegadas no se modifican.`}
          onConfirm={() =>
            withLoading(async () => {
              await clearRepetidas()
              setConfirmClearRep(false)
            })
          }
          onCancel={() => setConfirmClearRep(false)}
        />
      )}

      {/* Diálogo: reset completo */}
      {confirmReset && (
        <ConfirmDialog
          message="¿Desea eliminar todo el progreso del álbum? Esta acción no se puede deshacer."
          onConfirm={() =>
            withLoading(async () => {
              await resetProgreso()
              setConfirmReset(false)
            })
          }
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}
