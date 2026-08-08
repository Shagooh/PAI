import { useState } from 'react'
import UsuarioFormFields from './UsuarioFormFields'
import {
  EMPTY_USER_FORM,
  RUT_REGEX,
  formatDateForInput,
  formatRut,
  sanitizePersonName,
} from '../utils/userUtils'

function UsuarioForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY_USER_FORM)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'rut') return setForm({ ...form, rut: formatRut(value) })
    if (name === 'nombre' || name === 'apellido') return setForm({ ...form, [name]: sanitizePersonName(value) })
    if (name === 'fecha_nacimiento') return setForm({ ...form, fecha_nacimiento: formatDateForInput(value) })
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.rut || !form.nombre || !form.apellido || !form.edad) return
    if (!RUT_REGEX.test(form.rut)) return
    onSubmit({ ...form, edad: parseInt(form.edad) })
    setForm(EMPTY_USER_FORM)
  }

  const rutValido = form.rut === '' || RUT_REGEX.test(form.rut)

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Agregar Usuario</h5>
        <form onSubmit={handleSubmit}>
          <UsuarioFormFields
            form={form}
            onChange={handleChange}
            rutValido={rutValido}
            programColumnClass="col-md-2"
            actions={(
              <div className="col-md-1 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">Guardar</button>
              </div>
            )}
          />
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm
