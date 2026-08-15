const NEW_USER_COLUMNS = [
  { key: 'rut', label: 'RUT' },
  { key: 'nombre_apellidos', label: 'NOMBRE Y APELLIDOS' },
  { key: 'situacion', label: 'Situación' },
  { key: 'fecha_ingreso', label: 'FECHA DE INGRESO' },
  { key: 'convenio_senda', label: 'CONVENIO SENDA' },
  { key: 'fecha_tentativa_ev_in', label: 'FECHA TENTATIVA EV IN' },
  { key: 'gestor', label: 'GESTOR' },
  { key: 'fecha_ev_integral', label: 'FECHA EV INTEGRAL' },
  { key: 'fecha_ultimo_pci', label: 'FECHA ÚLTIMO PCI' },
  { key: 'tiempo_pci', label: 'TIEMPO PCI' },
  { key: 'fecha_proximo_pci', label: 'FECHA PRÓXIMO PCI' },
  { key: 'tiempo_pci_1', label: 'TIEMPO PCI_1' },
  { key: 'fecha_proximo_pci_1', label: 'FECHA PRÓXIMO PCI_1' },
  { key: 'tiempo_pci_2', label: 'TIEMPO PCI_2' },
  { key: 'fecha_proximo_pci_2', label: 'FECHA PRÓXIMO PCI_2' },
]

const renderNewUserCell = (value) => (value === null || value === undefined || value === '' ? '-' : value)

function NewUsersList({ usuarios, onRefresh = () => { } }) {
  return (
    <div className="panel mt-6">
      <div className="panel-head">
        <span className="panel-title">Usuarios (NewUsers)</span>
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
              <table className="ui-table" style={{ minWidth: 'max-content' }}>
                <thead>
                  <tr>
                    {NEW_USER_COLUMNS.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.rut || u.nombre_apellidos}>
                      {NEW_USER_COLUMNS.map((col) => (
                        <td key={col.key}>{renderNewUserCell(u[col.key])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 p-3 md:hidden">
              {usuarios.map((u) => (
                <div key={u.rut || u.nombre_apellidos} className="rounded-xl border border-[#d0e1d7] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="break-words text-sm font-bold text-[#1d4436]">{u.nombre_apellidos || '-'}</div>
                      <div className="text-xs text-[#6d8a7c]">{u.rut || '-'}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    {NEW_USER_COLUMNS.filter((col) => col.key !== 'rut' && col.key !== 'nombre_apellidos').map((col) => (
                      <div key={col.key}>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">{col.label}</div>
                        <div className="break-words text-[#1d4436]">{renderNewUserCell(u[col.key])}</div>
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

export default NewUsersList
