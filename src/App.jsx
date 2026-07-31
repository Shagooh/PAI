import { useState, useEffect } from 'react'
import UsuarioForm from './components/UsuarioForm'
import UsuariosList from './components/UsuariosList'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://pai-be.vercel.app').replace(/\/$/, '')
const buildApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
const API_USUARIOS = buildApiUrl('/api/usuarios')
const API_HABILITACIONES = buildApiUrl('/api/habilitaciones')
const CACHE_KEY = 'crud-app-cache-v1'
const CACHE_TTL_MS = 5 * 60 * 1000

const getCacheStore = () => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

const getCacheEntry = (key) => {
  const store = getCacheStore()
  return store[key] || null
}

const hasValidCache = (key) => {
  const entry = getCacheEntry(key)
  if (!entry?.timestamp) return false
  return Date.now() - entry.timestamp <= CACHE_TTL_MS
}

const readCache = (key, fallback = []) => {
  const entry = getCacheEntry(key)
  if (!entry?.timestamp) return fallback
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return fallback
  return entry.data
}

const writeCache = (key, data) => {
  if (typeof window === 'undefined') return
  const store = getCacheStore()
  store[key] = { timestamp: Date.now(), data }
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(store))
}

function App() {
  const [usuarios, setUsuarios] = useState(() => readCache('usuarios', []))
  const [habilitaciones, setHabilitaciones] = useState(() => readCache('habilitaciones', []))
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedSearchIds, setSelectedSearchIds] = useState([])
  const [searchMetaText, setSearchMetaText] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ rut: '', nombre: '', apellido: '', edad: '' })
  const [view, setView] = useState('buscar')

  const fetchUsuarios = async (forceRefresh = false) => {
    const cachedUsuarios = readCache('usuarios', [])
    if (!forceRefresh && hasValidCache('usuarios')) {
      setUsuarios(cachedUsuarios)
      return
    }

    try {
      const res = await fetch(API_USUARIOS)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setUsuarios(data)
      writeCache('usuarios', data)
    } catch (error) {
      console.error('No se pudieron cargar los usuarios:', error)
      setUsuarios(cachedUsuarios)
    }
  }

  const fetchHabilitaciones = async (forceRefresh = false) => {
    const cachedHabilitaciones = readCache('habilitaciones', [])
    if (!forceRefresh && hasValidCache('habilitaciones')) {
      setHabilitaciones(cachedHabilitaciones)
      return
    }

    try {
      const res = await fetch(API_HABILITACIONES)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setHabilitaciones(data)
      writeCache('habilitaciones', data)
    } catch (error) {
      console.error('No se pudieron cargar las habilitaciones:', error)
      setHabilitaciones(cachedHabilitaciones)
    }
  }

  const refreshUsuarios = () => fetchUsuarios(true)
  const refreshHabilitaciones = () => fetchHabilitaciones(true)

  useEffect(() => {
    const cachedUsuarios = readCache('usuarios', [])
    const cachedHabilitaciones = readCache('habilitaciones', [])

    if (cachedUsuarios.length > 0 || cachedHabilitaciones.length > 0) {
      setUsuarios(cachedUsuarios)
      setHabilitaciones(cachedHabilitaciones)
    }

    if (!hasValidCache('usuarios') || !hasValidCache('habilitaciones')) {
      fetchUsuarios()
      fetchHabilitaciones()
    }
  }, [])

  const buscarUsuario = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(`${API_USUARIOS}?search=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setSearchResults(data)
      setSelectedSearchIds([])
    } catch (error) {
      console.error('No se pudo buscar el usuario:', error)
      setSearchResults([])
      setSelectedSearchIds([])
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') buscarUsuario()
  }

  const toggleSearch = (id) => {
    setSelectedSearchIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditForm({
      rut: user.rut || '',
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      edad: user.edad?.toString() || ''
    })
    setSelectedSearchIds([user.rut])
    setSearchMetaText(user.meta || '')
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const cancelEditUser = () => {
    setEditingUser(null)
    setEditForm({ rut: '', nombre: '', apellido: '', edad: '' })
    setSelectedSearchIds([])
    setSearchMetaText('')
  }

  const toggleAllSearch = () => {
    if (!searchResults) return
    if (selectedSearchIds.length === searchResults.length) setSelectedSearchIds([])
    else setSelectedSearchIds(searchResults.map((u) => u.rut))
  }

  const abrirPreviewBusqueda = () => {
    const ids = selectedSearchIds.join(',')
    const params = new URLSearchParams()
    if (ids) params.set('ids', ids)
    if (searchMetaText) params.set('meta', searchMetaText)
    const qs = params.toString()
    const url = `${buildApiUrl('/api/usuarios/preview')}${qs ? '?' + qs : ''}`
    window.open(url, '_blank')
  }

  const createUsuario = async (usuario) => {
    try {
      const res = await fetch(API_USUARIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
    } catch (error) {
      console.error('No se pudo crear el usuario:', error)
    }
    fetchUsuarios()
  }

  const updateUsuario = async (e) => {
    e.preventDefault()
    if (!editingUser) return

    const payload = {
      ...editForm,
      edad: Number(editForm.edad),
      meta: searchMetaText,
    }

    try {
      const res = await fetch(`${API_USUARIOS}/${editingUser.rut}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)

      const updatedUser = await res.json().catch(() => payload)
      const normalizedUser = {
        ...editingUser,
        ...updatedUser,
        rut: updatedUser.rut || editForm.rut,
        nombre: updatedUser.nombre || editForm.nombre,
        apellido: updatedUser.apellido || editForm.apellido,
        edad: Number(updatedUser.edad ?? editForm.edad),
        meta: searchMetaText,
      }

      setUsuarios((prev) => prev.map((u) => (u.rut === normalizedUser.rut ? normalizedUser : u)))
      setSearchResults((prev) => prev ? prev.map((u) => (u.rut === normalizedUser.rut ? normalizedUser : u)) : prev)
      setEditingUser(null)
      setEditForm({ rut: '', nombre: '', apellido: '', edad: '' })
      setSelectedSearchIds([normalizedUser.rut])
      setSearchMetaText(normalizedUser.meta || '')
    } catch (error) {
      console.error('No se pudo actualizar el usuario:', error)
    }

    fetchUsuarios(true)
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Usuarios</h1>

      <div className="d-flex gap-2 mb-4">
        <button className={`btn ${view === 'buscar' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('buscar')}>
          Buscar / Crear
        </button>
        <button className={`btn ${view === 'tablas' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('tablas')}>
          Usuarios y Decisiones
        </button>
      </div>

      {view === 'buscar' && (
        <>
          <UsuarioForm onSubmit={createUsuario} />

          <div className="card mt-4">
            <div className="card-header fw-bold">Buscar Usuario</div>
            <div className="card-body">
              <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Nombre o apellido..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} />
                <button className="btn btn-primary" onClick={buscarUsuario}>Buscar</button>
              </div>

              {searchResults !== null && (
                <>
                  {searchResults.length === 0 ? (
                    <p className="text-muted">No se encontraron usuarios.</p>
                  ) : (
                    <>
                      <table className="table table-striped">
                        <thead className="table-dark">
                          <tr>
                            <th>
                              <input type="checkbox" className="form-check-input" onChange={toggleAllSearch} checked={selectedSearchIds.length === searchResults.length && searchResults.length > 0} />
                            </th>
                            <th>RUT</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Edad</th>
                            <th>Descripción</th>
                            <th>Habilitado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((u) => (
                            <tr key={u.rut}>
                              <td>
                                <input type="checkbox" className="form-check-input" checked={selectedSearchIds.includes(u.rut)} onChange={() => toggleSearch(u.rut)} />
                              </td>
                              <td>{u.rut}</td>
                              <td>{u.nombre}</td>
                              <td>{u.apellido}</td>
                              <td>{u.edad}</td>
                              <td>
                                <span className={`badge ${u.edad >= 18 ? 'bg-success' : 'bg-warning'}`}>{u.descripcion}</span>
                              </td>
                              <td>
                                <span className={`badge ${u.edad >= 18 ? 'bg-primary' : 'bg-secondary'}`}>{u.habilitado}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedSearchIds.length > 0 && (
                        <div className="mt-3 border-top pt-3">
                          <label className="form-label fw-bold">META</label>
                          <textarea className="form-control" rows="2" value={searchMetaText} onChange={(e) => setSearchMetaText(e.target.value)} placeholder="Ingrese la meta del usuario..."></textarea>
                          <div className="mt-3">
                            <button className="btn btn-info text-white" onClick={abrirPreviewBusqueda} disabled={selectedSearchIds.length === 0}>
                              Vista previa ({selectedSearchIds.length})
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {editingUser && (
            <div className="card mt-4">
              <div className="card-header fw-bold">Editar Usuario</div>
              <div className="card-body">
                <form onSubmit={updateUsuario}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">RUT</label>
                      <input name="rut" className="form-control" value={editForm.rut} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Nombre</label>
                      <input name="nombre" className="form-control" value={editForm.nombre} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Apellido</label>
                      <input name="apellido" className="form-control" value={editForm.apellido} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Edad</label>
                      <input name="edad" type="number" min="1" className="form-control" value={editForm.edad} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-2 d-flex align-items-end gap-2">
                      <button type="submit" className="btn btn-success w-100">Guardar</button>
                      <button type="button" className="btn btn-outline-secondary w-100" onClick={cancelEditUser}>Cancelar</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

        </>
      )}

      {view === 'tablas' && (
        <>
          <UsuariosList usuarios={usuarios} onEdit={handleEditUser} onRefresh={refreshUsuarios} />

          {editingUser && (
            <div className="card mt-4">
              <div className="card-header fw-bold">Editar Usuario</div>
              <div className="card-body">
                <form onSubmit={updateUsuario}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">RUT</label>
                      <input name="rut" className="form-control" value={editForm.rut} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Nombre</label>
                      <input name="nombre" className="form-control" value={editForm.nombre} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Apellido</label>
                      <input name="apellido" className="form-control" value={editForm.apellido} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Edad</label>
                      <input name="edad" type="number" min="1" className="form-control" value={editForm.edad} onChange={handleEditFormChange} required />
                    </div>
                    <div className="col-md-2 d-flex align-items-end gap-2">
                      <button type="submit" className="btn btn-success w-100">Guardar</button>
                      <button type="button" className="btn btn-outline-secondary w-100" onClick={cancelEditUser}>Cancelar</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center fw-bold w-100">
              <span>Tabla de Decisiones — Habilitaciones</span>
              <button type="button" className="btn btn-sm btn-outline-primary ms-auto" onClick={refreshHabilitaciones}>
                Refrescar
              </button>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Edad Mín</th>
                    <th>Edad Máx</th>
                    <th>Resultado</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {habilitaciones.map((h) => (
                    <tr key={h.id}>
                      <td>{h.id}</td>
                      <td>{h.nombre}</td>
                      <td>{h.edad_min}</td>
                      <td>{h.edad_max}</td>
                      <td><span className={`badge ${h.edad_min >= 18 ? 'bg-primary' : 'bg-secondary'}`}>{h.resultado}</span></td>
                      <td>{h.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
