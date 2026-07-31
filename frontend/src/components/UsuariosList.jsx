function UsuariosList({ usuarios, onDelete }) {
  return (
    <div className="card mt-4">
      <div className="card-header fw-bold">Todos los Usuarios</div>
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
                <th>Descripción</th>
                <th>Habilitado</th>
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
                  <td>
                    <span className={`badge ${u.edad >= 18 ? 'bg-success' : 'bg-warning'}`}>
                      {u.descripcion}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.edad >= 18 ? 'bg-primary' : 'bg-secondary'}`}>
                      {u.habilitado}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(u.rut)}>Eliminar</button>
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