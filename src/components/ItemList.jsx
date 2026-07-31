function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) return <p className="text-muted">No hay productos registrados.</p>

  return (
    <table className="table table-striped">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.nombre}</td>
            <td>{item.descripcion || '-'}</td>
            <td>${parseFloat(item.precio).toFixed(2)}</td>
            <td>
              <button className="btn btn-sm btn-warning me-2" onClick={() => onEdit(item)}>Editar</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ItemList
