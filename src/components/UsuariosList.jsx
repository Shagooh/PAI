import { formatDateForDisplay } from '../utils/userUtils'

function UsuariosList({ usuarios, onEdit, onRefresh = () => { } }) {
  return (
    <div className="panel mt-6">
      <div className="panel-head">
        <span className="panel-title">Todos los Usuarios</span>
        <button type="button" className="ui-btn-outline px-3 py-1.5 text-xs" onClick={onRefresh}>
          Refrescar
        </button>
      </div>
      <div className="panel-body p-0">
        {usuarios.length === 0 ? (
          <p className="p-4 text-sm text-[#59796a]">No hay usuarios registrados.</p>
        ) : (
          <div className="ui-table-wrap rounded-none border-x-0 border-b-0">
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
                      <button className="ui-btn-warning px-3 py-1.5 text-xs" onClick={() => onEdit(u)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsuariosList