import UsuarioFormFields from './UsuarioFormFields'

function EditarUsuarioCard({ editingUser, form, onChange, onSubmit, onCancel }) {
	if (!editingUser) return null

	return (
		<div className="card mt-4">
			<div className="card-header fw-bold">Editar Usuario</div>
			<div className="card-body">
				<form onSubmit={onSubmit}>
					<UsuarioFormFields
						form={form}
						onChange={onChange}
						actions={(
							<div className="col-md-2 d-flex align-items-end gap-2">
								<button type="submit" className="btn btn-success w-100">Guardar</button>
								<button type="button" className="btn btn-outline-secondary w-100" onClick={onCancel}>Cancelar</button>
							</div>
						)}
					/>
				</form>
			</div>
		</div>
	)
}

export default EditarUsuarioCard