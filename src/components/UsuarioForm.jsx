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
    <div className="panel mb-6">
      <div className="panel-body">
        <h5 className="mb-4 text-xl font-bold text-[#1e4033]">Agregar Usuario</h5>
        <form onSubmit={handleSubmit}>
          <UsuarioFormFields
            form={form}
            onChange={handleChange}
            rutValido={rutValido}
            programColumnClass="md:col-span-2"
            actions={(
              <div className="md:col-span-1 flex items-end">
                <button type="submit" className="ui-btn-primary w-full">Guardar</button>
              </div>
            )}
          />
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm
