import { useState } from 'react'
import UsuarioFormFields from './UsuarioFormFields'
import { EMPTY_NEW_USER_FORM, formatDateForInput, formatRut, addMonthsToDate } from '../utils/userUtils'

function UsuarioForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY_NEW_USER_FORM)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'rut') return setForm({ ...form, rut: formatRut(value) })
    if (name === 'fecha_ultimo_pci' || name === 'tiempo_pci') {
      const nextValue = name === 'fecha_ultimo_pci' ? formatDateForInput(value) : value
      const base = name === 'fecha_ultimo_pci' ? nextValue : form.fecha_ultimo_pci
      const months = name === 'tiempo_pci' ? nextValue : form.tiempo_pci
      return setForm({ ...form, [name]: nextValue, fecha_proximo_pci: addMonthsToDate(base, months) })
    }
    if (name.startsWith('fecha_')) return setForm({ ...form, [name]: formatDateForInput(value) })
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.rut || !form.nombre_apellidos) return
    onSubmit({ ...form })
    setForm(EMPTY_NEW_USER_FORM)
  }

  return (
    <div className="panel mb-6">
      <div className="panel-body">
        <h5 className="mb-4 text-xl font-bold text-[#1e4033]">Agregar Usuario</h5>
        <form onSubmit={handleSubmit}>
          <UsuarioFormFields
            form={form}
            onChange={handleChange}
            actions={(
              <div className="md:col-span-2 flex items-end">
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
