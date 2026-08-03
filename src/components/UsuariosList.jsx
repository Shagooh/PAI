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
                  <td>{u.fecha_nacimiento || '-'}</td>
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