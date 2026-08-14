import { formatDateForDisplay } from '../utils/userUtils'

function UsuariosList({ usuarios, onEdit, onRefresh = () => { } }) {
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
              <table className="ui-table min-w-[1120px]">
                <thead>
                  <tr>
                    <th>RUT</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Edad</th>
                    <th>Fecha nacimiento</th>
                    <th>Equipo tratante</th>
                    <th>Estado motivacional</th>
                    <th>Programa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.rut}>
                      <td>{u.rut}</td>
                      <td>{u.nombre}</td>
                      <td>{u.apellido}</td>
                      <td>{u.edad}</td>
                      <td>{formatDateForDisplay(u.fecha_nacimiento, { shortYear: true }) || '-'}</td>
                      <td>{u.equipo_tratante || '-'}</td>
                      <td>{u.estado_motivacional || '-'}</td>
                      <td>{u.programa || '-'}</td>
                      <td>
                        <button className="ui-btn-warning px-3 py-2 text-xs" onClick={() => onEdit(u)}>Editar</button>
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
                      <div className="truncate text-sm font-bold text-[#1d4436]">{`${u.nombre} ${u.apellido}`.trim() || '-'}</div>
                      <div className="text-xs text-[#6d8a7c]">{u.rut}</div>
                    </div>
                    <button type="button" className="ui-btn-warning shrink-0 px-3 py-2 text-xs" onClick={() => onEdit(u)}>
                      Editar
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Edad</div>
                      <div className="break-words text-[#1d4436]">{u.edad || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Fecha nacimiento</div>
                      <div className="break-words text-[#1d4436]">{formatDateForDisplay(u.fecha_nacimiento, { shortYear: true }) || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Equipo tratante</div>
                      <div className="break-words text-[#1d4436]">{u.equipo_tratante || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Estado motivacional</div>
                      <div className="break-words text-[#1d4436]">{u.estado_motivacional || '-'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Programa</div>
                      <div className="break-words text-[#1d4436]">{u.programa || '-'}</div>
                    </div>
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