import { useState, useEffect } from 'react'

function ItemForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' })

  useEffect(() => {
    if (initial) setForm({ nombre: initial.nombre, descripcion: initial.descripcion, precio: initial.precio })
    else setForm({ nombre: '', descripcion: '', precio: '' })
  }, [initial])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre || !form.precio) return
    onSubmit({ ...form, precio: parseFloat(form.precio) })
    setForm({ nombre: '', descripcion: '', precio: '' })
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{initial ? 'Editar Producto' : 'Nuevo Producto'}</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea name="descripcion" className="form-control" value={form.descripcion} onChange={handleChange} rows="2" />
          </div>
          <div className="mb-3">
            <label className="form-label">Precio</label>
            <input name="precio" type="number" step="0.01" className="form-control" value={form.precio} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary me-2">
            {initial ? 'Actualizar' : 'Guardar'}
          </button>
          {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>}
        </form>
      </div>
    </div>
  )
}

export default ItemForm
