const FIELDS = [
  { name: 'rut', label: 'RUT', className: 'md:col-span-3', required: true },
  { name: 'nombre_apellidos', label: 'Nombre y Apellidos', className: 'md:col-span-6', required: true },
  { name: 'situacion', label: 'Situación', className: 'md:col-span-3' },
  { name: 'fecha_ingreso', label: 'Fecha de ingreso', className: 'md:col-span-3', date: true },
  { name: 'convenio_senda', label: 'Convenio Senda', className: 'md:col-span-3' },
  { name: 'gestor', label: 'Gestor', className: 'md:col-span-3' },
  { name: 'fecha_tentativa_ev_in', label: 'Fecha tentativa EV IN', className: 'md:col-span-3', date: true },
  { name: 'fecha_ev_integral', label: 'Fecha EV integral', className: 'md:col-span-3', date: true },
  { name: 'fecha_ultimo_pci', label: 'Fecha último PCI', className: 'md:col-span-3', date: true },
  { name: 'tiempo_pci', label: 'Tiempo PCI', className: 'md:col-span-3' },
  { name: 'fecha_proximo_pci', label: 'Fecha próximo PCI', className: 'md:col-span-3', date: true },
  { name: 'tiempo_pci_1', label: 'Tiempo PCI_1', className: 'md:col-span-3' },
  { name: 'fecha_proximo_pci_1', label: 'Fecha próximo PCI_1', className: 'md:col-span-3', date: true },
  { name: 'tiempo_pci_2', label: 'Tiempo PCI_2', className: 'md:col-span-3' },
  { name: 'fecha_proximo_pci_2', label: 'Fecha próximo PCI_2', className: 'md:col-span-3', date: true },
]

const DATE_INPUT_PROPS = {
  type: 'text',
  placeholder: 'dd/mm/yyyy',
  maxLength: 10,
  inputMode: 'numeric',
  autoComplete: 'off',
}

function UsuarioFormFields({ form, onChange, actions }) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
			{FIELDS.map((field) => (
				<div className={field.className} key={field.name}>
					<label className="ui-label">{field.label}</label>
					<input
						name={field.name}
						className="ui-input"
						value={form[field.name] ?? ''}
						onChange={onChange}
						required={field.required}
						{...(field.date ? DATE_INPUT_PROPS : {})}
					/>
				</div>
			))}
			{actions}
		</div>
	)
}

export default UsuarioFormFields
