import { useState } from 'react'

const listToArray = (text = '') =>
  String(text)
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean)

const arrayToList = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => `- ${item}`).join('\n')

function DimensionesAdmin({
  dimensiones = [],
  onCreateDimension,
  onUpdateDimension,
  onDeleteDimension,
  onCreateObjetivo,
  onUpdateObjetivo,
  onDeleteObjetivo,
  onCreateOpcion,
  onUpdateOpcion,
  onDeleteOpcion,
}) {
  const [newDimension, setNewDimension] = useState('')
  const [editDimensionId, setEditDimensionId] = useState(null)
  const [dimensionDraft, setDimensionDraft] = useState('')
  const [expandedDimensionId, setExpandedDimensionId] = useState(null)

  const [newObjetivoByDim, setNewObjetivoByDim] = useState({})
  const [editObjetivoId, setEditObjetivoId] = useState(null)
  const [objetivoDraft, setObjetivoDraft] = useState('')
  const [expandedObjetivoId, setExpandedObjetivoId] = useState(null)

  const [editOpcionId, setEditOpcionId] = useState(null)
  const [opcionDraft, setOpcionDraft] = useState({ estrategias: '', indicadores: '' })
  const [newOpcionFor, setNewOpcionFor] = useState(null)
  const [newOpcionDraft, setNewOpcionDraft] = useState({ estrategias: '', indicadores: '' })

  const run = async (action) => {
    try {
      await action()
    } catch (error) {
      window.alert(error.message || 'No se pudo completar la operación.')
    }
  }

  const toggleObjetivos = (id) => setExpandedDimensionId((prev) => (prev === id ? null : id))
  const toggleOpciones = (id) => setExpandedObjetivoId((prev) => (prev === id ? null : id))

  const submitDimension = (e) => {
    e.preventDefault()
    const nombre = newDimension.trim()
    if (!nombre) return
    run(async () => {
      await onCreateDimension(nombre)
      setNewDimension('')
    })
  }

  const saveDimension = (dimension) => {
    const nombre = dimensionDraft.trim()
    if (!nombre || nombre === dimension.nombre) {
      setEditDimensionId(null)
      return
    }
    run(async () => {
      await onUpdateDimension(dimension.id, nombre)
      setEditDimensionId(null)
      setDimensionDraft('')
    })
  }

  const removeDimension = (dimension) => {
    if (!window.confirm(`¿Eliminar la dimensión "${dimension.nombre}" y todos sus objetivos?`)) return
    run(async () => {
      await onDeleteDimension(dimension.id)
      if (expandedDimensionId === dimension.id) setExpandedDimensionId(null)
    })
  }

  const submitObjetivo = (e, dimensionId) => {
    e.preventDefault()
    const texto = (newObjetivoByDim[dimensionId] || '').trim()
    if (!texto) return
    run(async () => {
      await onCreateObjetivo(dimensionId, texto)
      setNewObjetivoByDim((prev) => ({ ...prev, [dimensionId]: '' }))
    })
  }

  const saveObjetivo = (objetivo) => {
    const texto = objetivoDraft.trim()
    if (!texto || texto === objetivo.texto) {
      setEditObjetivoId(null)
      return
    }
    run(async () => {
      await onUpdateObjetivo(objetivo.id, texto)
      setEditObjetivoId(null)
      setObjetivoDraft('')
    })
  }

  const removeObjetivo = (objetivo) => {
    if (!window.confirm('¿Eliminar este objetivo y sus opciones?')) return
    run(async () => {
      await onDeleteObjetivo(objetivo.id)
      if (expandedObjetivoId === objetivo.id) setExpandedObjetivoId(null)
    })
  }

  const saveOpcion = (opcion) => {
    run(async () => {
      await onUpdateOpcion(opcion.id, listToArray(opcionDraft.estrategias), listToArray(opcionDraft.indicadores))
      setEditOpcionId(null)
      setOpcionDraft({ estrategias: '', indicadores: '' })
    })
  }

  const removeOpcion = (opcion) => {
    if (!window.confirm('¿Eliminar esta opción?')) return
    run(async () => {
      await onDeleteOpcion(opcion.id)
      if (editOpcionId === opcion.id) setEditOpcionId(null)
    })
  }

  const submitOpcion = (e, objetivoId) => {
    e.preventDefault()
    run(async () => {
      await onCreateOpcion(objetivoId, listToArray(newOpcionDraft.estrategias), listToArray(newOpcionDraft.indicadores))
      setNewOpcionFor(null)
      setNewOpcionDraft({ estrategias: '', indicadores: '' })
    })
  }

  const opcionEditor = (draft, setDraft, submit) => (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div>
        <label className="ui-label">Estrategias (una por línea)</label>
        <textarea
          className="ui-input min-h-28 w-full"
          rows={4}
          value={draft.estrategias}
          onChange={(e) => setDraft((prev) => ({ ...prev, estrategias: e.target.value }))}
        />
      </div>
      <div>
        <label className="ui-label">Indicadores (uno por línea)</label>
        <textarea
          className="ui-input min-h-28 w-full"
          rows={4}
          value={draft.indicadores}
          onChange={(e) => setDraft((prev) => ({ ...prev, indicadores: e.target.value }))}
        />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className="ui-btn-primary px-4 py-2 text-xs">{submit.label}</button>
        <button type="button" className="ui-btn-outline px-4 py-2 text-xs" onClick={submit.cancel}>Cancelar</button>
      </div>
    </div>
  )

  return (
    <div className="reveal-up mt-4">
      <div className="panel mb-6">
        <div className="panel-head">
          <div className="panel-title">Dimensiones y Objetivos</div>
        </div>
        <div className="panel-body">
          <form className="mb-6 flex flex-col gap-2 md:flex-row" onSubmit={submitDimension}>
            <input
              type="text"
              className="ui-input flex-1"
              placeholder="Nueva dimensión..."
              value={newDimension}
              onChange={(e) => setNewDimension(e.target.value)}
            />
            <button type="submit" className="ui-btn-primary">Agregar dimensión</button>
          </form>

          {dimensiones.length === 0 ? (
            <p className="text-sm text-[#617f71]">No hay dimensiones registradas.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {dimensiones.map((dimension) => (
                <div key={dimension.id} className="rounded-2xl border border-[#d0e1d7] bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {editDimensionId === dimension.id ? (
                      <>
                        <input
                          type="text"
                          className="ui-input flex-1 min-w-40"
                          value={dimensionDraft}
                          autoFocus
                          onChange={(e) => setDimensionDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveDimension(dimension) }}
                        />
                        <button className="ui-btn-success px-3 py-2 text-xs" onClick={() => saveDimension(dimension)}>Guardar</button>
                        <button className="ui-btn-outline px-3 py-2 text-xs" onClick={() => setEditDimensionId(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 break-words text-sm font-bold text-[#1d4436]">{dimension.nombre}</span>
                        <button
                          className="ui-btn-info px-3 py-2 text-xs"
                          onClick={() => {
                            setEditDimensionId(dimension.id)
                            setDimensionDraft(dimension.nombre)
                          }}
                        >
                          Editar
                        </button>
                        <button className="ui-btn-danger px-3 py-2 text-xs" onClick={() => removeDimension(dimension)}>Eliminar</button>
                        <button className="ui-btn-outline px-3 py-2 text-xs" onClick={() => toggleObjetivos(dimension.id)}>
                          {expandedDimensionId === dimension.id ? 'Ocultar objetivos' : `Objetivos (${(dimension.objetivos || []).length})`}
                        </button>
                      </>
                    )}
                  </div>

                  {expandedDimensionId === dimension.id && (
                    <div className="mt-4 border-t border-[#e2ece6] pt-4">
                      <form className="mb-4 flex flex-col gap-2 md:flex-row" onSubmit={(e) => submitObjetivo(e, dimension.id)}>
                        <input
                          type="text"
                          className="ui-input flex-1"
                          placeholder="Nuevo objetivo..."
                          value={newObjetivoByDim[dimension.id] || ''}
                          onChange={(e) => setNewObjetivoByDim((prev) => ({ ...prev, [dimension.id]: e.target.value }))}
                        />
                        <button type="submit" className="ui-btn-primary px-4 py-2 text-xs">Agregar objetivo</button>
                      </form>

                      {(dimension.objetivos || []).length === 0 ? (
                        <p className="text-sm text-[#617f71]">Sin objetivos.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {dimension.objetivos.map((objetivo) => (
                            <div key={objetivo.id} className="rounded-xl border border-[#e2ece6] bg-[#f8fbf9] p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {editObjetivoId === objetivo.id ? (
                                  <>
                                    <input
                                      type="text"
                                      className="ui-input flex-1 min-w-40"
                                      value={objetivoDraft}
                                      autoFocus
                                      onChange={(e) => setObjetivoDraft(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') saveObjetivo(objetivo) }}
                                    />
                                    <button className="ui-btn-success px-3 py-1.5 text-xs" onClick={() => saveObjetivo(objetivo)}>Guardar</button>
                                    <button className="ui-btn-outline px-3 py-1.5 text-xs" onClick={() => setEditObjetivoId(null)}>Cancelar</button>
                                  </>
                                ) : (
                                  <>
                                    <span className="min-w-0 flex-1 break-words text-sm text-[#1d4436]">{objetivo.texto}</span>
                                    <button
                                      className="ui-btn-info px-3 py-1.5 text-xs"
                                      onClick={() => {
                                        setEditObjetivoId(objetivo.id)
                                        setObjetivoDraft(objetivo.texto)
                                      }}
                                    >
                                      Editar
                                    </button>
                                    <button className="ui-btn-danger px-3 py-1.5 text-xs" onClick={() => removeObjetivo(objetivo)}>Eliminar</button>
                                    <button className="ui-btn-outline px-3 py-1.5 text-xs" onClick={() => toggleOpciones(objetivo.id)}>
                                      {expandedObjetivoId === objetivo.id ? 'Ocultar opciones' : `Opciones (${(objetivo.opciones || []).length})`}
                                    </button>
                                  </>
                                )}
                              </div>

                              {expandedObjetivoId === objetivo.id && (
                                <div className="mt-3 border-t border-[#e2ece6] pt-3">
                                  <button
                                    className="ui-btn-outline mb-3 px-3 py-1.5 text-xs"
                                    onClick={() => {
                                      setNewOpcionFor(newOpcionFor === objetivo.id ? null : objetivo.id)
                                      setNewOpcionDraft({ estrategias: '', indicadores: '' })
                                    }}
                                  >
                                    {newOpcionFor === objetivo.id ? 'Cancelar agregar' : '+ Agregar opción'}
                                  </button>

                                  {newOpcionFor === objetivo.id && (
                                    <form onSubmit={(e) => submitOpcion(e, objetivo.id)}>
                                      {opcionEditor(newOpcionDraft, setNewOpcionDraft, {
                                        label: 'Guardar opción',
                                        cancel: () => setNewOpcionFor(null),
                                      })}
                                    </form>
                                  )}

                                  {(objetivo.opciones || []).length === 0 ? (
                                    <p className="text-sm text-[#617f71]">Sin opciones de estrategias/indicadores.</p>
                                  ) : (
                                    <div className="flex flex-col gap-3">
                                      {objetivo.opciones.map((opcion) => (
                                        <div key={opcion.id} className="rounded-xl border border-[#d0e1d7] bg-white p-3">
                                          {editOpcionId === opcion.id ? (
                                            <form onSubmit={(e) => { e.preventDefault(); saveOpcion(opcion) }}>
                                              {opcionEditor(opcionDraft, setOpcionDraft, {
                                                label: 'Guardar opción',
                                                cancel: () => setEditOpcionId(null),
                                              })}
                                            </form>
                                          ) : (
                                            <>
                                              <div className="grid gap-3 md:grid-cols-2">
                                                <div>
                                                  <span className="block text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Estrategias</span>
                                                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#1d4436]">{arrayToList(opcion.estrategias) || '-'}</p>
                                                </div>
                                                <div>
                                                  <span className="block text-[10px] font-bold uppercase tracking-wide text-[#6d8a7c]">Indicadores</span>
                                                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#1d4436]">{arrayToList(opcion.indicadores) || '-'}</p>
                                                </div>
                                              </div>
                                              <div className="mt-3 flex gap-2">
                                                <button
                                                  className="ui-btn-info px-3 py-1.5 text-xs"
                                                  onClick={() => {
                                                    setEditOpcionId(opcion.id)
                                                    setOpcionDraft({
                                                      estrategias: arrayToList(opcion.estrategias),
                                                      indicadores: arrayToList(opcion.indicadores),
                                                    })
                                                  }}
                                                >
                                                  Editar
                                                </button>
                                                <button className="ui-btn-danger px-3 py-1.5 text-xs" onClick={() => removeOpcion(opcion)}>Eliminar</button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DimensionesAdmin
