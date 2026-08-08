import UsuarioFormFields from './UsuarioFormFields'

function EditarUsuarioCard({ editingUser, form, onChange, onSubmit, onCancel }) {
	if (!editingUser) return null

	return (
		<div className="panel mt-6">
			<div className="panel-head">
				<div className="panel-title">Editar Usuario</div>
			</div>
			<div className="panel-body">
				<form onSubmit={onSubmit}>
					<UsuarioFormFields
						form={form}
						onChange={onChange}
						actions={(
							<div className="md:col-span-2 flex items-end gap-2">
								<button type="submit" className="ui-btn-success w-full">Guardar</button>
								<button type="button" className="ui-btn-outline w-full" onClick={onCancel}>Cancelar</button>
							</div>
						)}
					/>
				</form>
			</div>
		</div>
	)
}

export default EditarUsuarioCard