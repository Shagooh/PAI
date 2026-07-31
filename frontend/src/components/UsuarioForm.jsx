import { useState } from 'react'

function UsuarioForm({ onSubmit }) {
  const [form, setForm] = useState({ rut: '', nombre: '', apellido: '', edad: '' })

  const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$/

  const formatRut = (value) => {
    let cleaned = value.replace(/[^0-9Kk]/g, '')
    if (!cleaned) return ''
    if (/[Kk]$/.test(cleaned)) {
      const dv = cleaned.slice(-1).toUpperCase()
      const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      return body + '-' + dv
    }
    if (value.includes('-') && cleaned.length > 1) {
      const dv = cleaned.slice(-1)
      const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      return body + '-' + dv
    }
    if (value.endsWith('-')) {
      return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-'
    }
    if (cleaned.length > 7) {
      const dv = cleaned.slice(-1)
      const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      return body + '-' + dv
    }
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'rut') return setForm({ ...form, rut: formatRut(value) })
    if (name === 'nombre' || name === 'apellido') return setForm({ ...form, [name]: value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '') })
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.rut || !form.nombre || !form.apellido || !form.edad) return
    if (!rutRegex.test(form.rut)) return
    onSubmit({ ...form, edad: parseInt(form.edad) })
    setForm({ rut: '', nombre: '', apellido: '', edad: '' })
  }

  const rutValido = form.rut === '' || rutRegex.test(form.rut)

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Agregar Usuario</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">RUT</label>
              <input name="rut" className={`form-control ${!rutValido ? 'is-invalid' : ''}`} value={form.rut} onChange={handleChange} placeholder="12.345.678-9" pattern="^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$" title="Formato: xx.xxx.xxx-x" maxLength={12} required />
              {!rutValido && <div className="invalid-feedback">Formato inválido. Use xx.xxx.xxx-x</div>}
            </div>
            <div className="col-md-3">
              <label className="form-label">Nombre</label>
              <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} pattern="^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$" title="Solo letras" required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Apellido</label>
              <input name="apellido" className="form-control" value={form.apellido} onChange={handleChange} pattern="^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$" title="Solo letras" required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Edad</label>
              <input name="edad" type="number" min="1" className="form-control" value={form.edad} onChange={handleChange} required />
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm
