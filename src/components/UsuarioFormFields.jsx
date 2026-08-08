function UsuarioFormFields({ form, onChange, actions, rutValido = true, programColumnClass = 'md:col-span-3' }) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
			<div className="md:col-span-3">
				<label className="ui-label">RUT</label>
				<input
					name="rut"
					className={`ui-input ${!rutValido ? 'border-red-500 ring-2 ring-red-200 focus:border-red-500' : ''}`}
					value={form.rut}
					onChange={onChange}
					placeholder="12.345.678-9"
					pattern="^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$"
					title="Formato: xx.xxx.xxx-x"
					maxLength={12}
					required
				/>
				{!rutValido && <div className="mt-1 text-xs font-medium text-red-700">Formato invalido. Use xx.xxx.xxx-x</div>}
			</div>

			<div className="md:col-span-3">
				<label className="ui-label">Nombre</label>
				<input name="nombre" className="ui-input" value={form.nombre} onChange={onChange} pattern="^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$" title="Solo letras" required />
			</div>

			<div className="md:col-span-3">
				<label className="ui-label">Apellido</label>
				<input name="apellido" className="ui-input" value={form.apellido} onChange={onChange} pattern="^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$" title="Solo letras" required />
			</div>

			<div className="md:col-span-2">
				<label className="ui-label">Edad</label>
				<input name="edad" type="number" min="1" className="ui-input" value={form.edad} onChange={onChange} required />
			</div>

			<div className="md:col-span-3">
				<label className="ui-label">Fecha de nacimiento</label>
				<input
					name="fecha_nacimiento"
					type="text"
					className="ui-input"
					value={form.fecha_nacimiento}
					onChange={onChange}
					placeholder="dd/mm/yyyy"
					pattern="^\d{2}/\d{2}/\d{4}$"
					title="Formato: dd/mm/yyyy"
					maxLength={10}
					inputMode="numeric"
					autoComplete="off"
				/>
			</div>

			<div className="md:col-span-3">
				<label className="ui-label">Equipo tratante</label>
				<input name="equipo_tratante" className="ui-input" value={form.equipo_tratante} onChange={onChange} />
			</div>

			<div className="md:col-span-3">
				<label className="ui-label">Estado motivacional</label>
				<input name="estado_motivacional" className="ui-input" value={form.estado_motivacional} onChange={onChange} />
			</div>

			<div className={programColumnClass}>
				<label className="ui-label">Programa</label>
				<input name="programa" className="ui-input" value={form.programa} onChange={onChange} />
			</div>

			{actions}
		</div>
	)
}

export default UsuarioFormFields