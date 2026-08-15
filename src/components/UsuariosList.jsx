import { formatDateForDisplay } from '../utils/userUtils'

const NEW_USER_FIELDS = [
  { key: 'nombre_apellidos', label: 'Nombre y Apellidos' },
  { key: 'situacion', label: 'Situación' },
  { key: 'fecha_ingreso', label: 'Fecha de ingreso' },
  { key: 'convenio_senda', label: 'Convenio Senda' },
  { key: 'fecha_tentativa_ev_in', label: 'Fecha tentativa EV IN' },
  { key: 'gestor', label: 'Gestor' },
  { key: 'fecha_ev_integral', label: 'Fecha EV integral' },
  { key: 'fecha_ultimo_pci', label: 'Fecha último PCI' },
  { key: 'tiempo_pci', label: 'Tiempo PCI' },
  { key: 'fecha_proximo_pci', label: 'Fecha próximo PCI' },
  { key: 'tiempo_pci_1', label: 'Tiempo PCI_1' },
  { key: 'fecha_proximo_pci_1', label: 'Fecha próximo PCI_1' },
  { key: 'tiempo_pci_2', label: 'Tiempo PCI_2' },
  { key: 'fecha_proximo_pci_2', label: 'Fecha próximo PCI_2' },
]

const renderCell = (u, field) => {
  const value = u[field.key]
  if (value === null || value === undefined || value === '') return '-'
  if (field.key.startsWith('fecha_')) return formatDateForDisplay(value) || value
  return value
}

function UsuariosList({ usuarios, onEdit, onDelete, onRefresh = () => { } }) {
  return (
    <div className="panel mt-6">
      <div className="panel-head">
        <span className="panel-title">Todos los Usuarios</span>
        <button type="button" className="ui-btn-outline px-3 py-2 text-xs" onClick={onRefresh}>
          Refrescar
        </button>
      </div>
      <div className="panel-body p-0">
        {usuarios.length === 0 ? (
          <p className="p-4 text-sm text-[#59796a]">No hay usuarios registrados.</p>
        ) : (
          <>
            <div className="ui-table-wrap hidden rounded-none border-x-0 border-b-0 md:block">
              <table className="ui-table min-w-[2000px]">
                <thead>
                  <tr>
                    <th>RUT</th>
                    {NEW_USER_FIELDS.map((field) => (
                      <th key={field.key}>{field.label}</th>
                    ))}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.rut}>
                      <td style={{ whiteSpace: 'nowrap' }}>{u.rut || '-'}</td>
                      {NEW_USER_FIELDS.map((field) => (
                        <td key={field.key} style={{ whiteSpace: 'nowrap' }}>{renderCell(u, field)}</td>
                      ))}
                      <td>
                        <div className="flex gap-2">
                          <button className="ui-btn-warning px-3 py-2 text-xs" onClick={() => onEdit(u)}>Editar</button>
                          <button className="ui-btn-danger px-3 py-2 text-xs" onClick={() => onDelete?.(u)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 p-3 md:hidden">
              {usuarios.map((u) => (
                <div key={u.rut} className="rounded-xl border border-[#d0e1d7] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="break-words text-sm font-bold text-[#1d4436]">{u.nombre_apellidos || '-'}</div>
                      <div className="text-xs text-[#6d8a7c]">{u.rut || '-'}</div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" className="ui-btn-warning px-3 py-2 text-xs" onClick={() => onEdit(u)}>
                        Editar
                      </button>
                      <button type="button" className="ui-btn-danger px-3 py-2 text-xs" onClick={() => onDelete?.(u)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    {NEW_USER_FIELDS.filter((field) => field.key !== 'nombre_apellidos').map((field) => (
                      <div key={field.key}>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">{field.label}</div>
                        <div className="break-words text-[#1d4436]">{renderCell(u, field)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UsuariosList
