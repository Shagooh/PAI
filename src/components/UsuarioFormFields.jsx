function UsuarioFormFields({ form, onChange, actions, rutValido = true, programColumnClass = 'col-md-3' }) {
	return (
		<div className="row g-3">
			<div className="col-md-3">
				<label className="form-label">RUT</label>
				<input
					name="rut"
					className={`form-control ${!rutValido ? 'is-invalid' : ''}`}
					value={form.rut}
					onChange={onChange}
					placeholder="12.345.678-9"
					pattern="^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$"
					title="Formato: xx.xxx.xxx-x"
					maxLength={12}
					required
				/>
				{!rutValido && <div className="invalid-feedback">Formato invalido. Use xx.xxx.xxx-x</div>}
			</div>
			<div className="col-md-3">
				<label className="form-label">Nombre</label>
				<input name="nombre" className="form-control" value={form.nombre} onChange={onChange} pattern="^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$" title="Solo letras" required />
			</div>
			<div className="col-md-3">
				<label className="form-label">Apellido</label>
				<input name="apellido" className="form-control" value={form.apellido} onChange={onChange} pattern="^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$" title="Solo letras" required />
			</div>
			<div className="col-md-2">
				<label className="form-label">Edad</label>
				<input name="edad" type="number" min="1" className="form-control" value={form.edad} onChange={onChange} required />
			</div>
			<div className="col-md-3">
				<label className="form-label">Fecha de nacimiento</label>
				<input
					name="fecha_nacimiento"
					type="text"
					className="form-control"
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
			<div className="col-md-3">
				<label className="form-label">Equipo tratante</label>
				<input name="equipo_tratante" className="form-control" value={form.equipo_tratante} onChange={onChange} />
			</div>
			<div className="col-md-3">
				<label className="form-label">Estado motivacional</label>
				<input name="estado_motivacional" className="form-control" value={form.estado_motivacional} onChange={onChange} />
			</div>
			<div className={programColumnClass}>
				<label className="form-label">Programa</label>
				<input name="programa" className="form-control" value={form.programa} onChange={onChange} />
			</div>
			{actions}
		</div>
	)
}

export default UsuarioFormFields