const formatDateForDisplay = (value) => {
  if (!value) return ''

  const rawValue = `${value}`.trim()
  if (!rawValue) return ''

  const isoMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${year.slice(-2)}`
  }

  const compactMatch = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (compactMatch) {
    const [, day, month, year] = compactMatch
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${String(year).slice(-2)}`
  }

  return rawValue
}

function UsuariosList({ usuarios, onEdit, onRefresh = () => { } }) {
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center fw-bold w-100">
        <span>Todos los Usuarios</span>
        <button type="button" className="btn btn-sm btn-outline-primary ms-auto" onClick={onRefresh}>
          Refrescar
        </button>
      </div>
      <div className="card-body p-0">
        {usuarios.length === 0 ? (
          <p className="text-muted p-3">No hay usuarios registrados.</p>
        ) : (
          <table className="table table-striped mb-0">
            <thead className="table-dark">
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
                  <td>{formatDateForDisplay(u.fecha_nacimiento) || '-'}</td>
                  <td>{u.equipo_tratante || '-'}</td>
                  <td>{u.estado_motivacional || '-'}</td>
                  <td>{u.programa || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-warning" onClick={() => onEdit(u)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default UsuariosList