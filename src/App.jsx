import { useState, useEffect } from 'react'
import UsuarioForm from './components/UsuarioForm'
import UsuariosList from './components/UsuariosList'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://pai-be.vercel.app').replace(/\/$/, '')
const buildApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
const API_USUARIOS = buildApiUrl('/api/usuarios')
const API_HABILITACIONES = buildApiUrl('/api/habilitaciones')

function App() {
  const [usuarios, setUsuarios] = useState([])
  const [habilitaciones, setHabilitaciones] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedSearchIds, setSelectedSearchIds] = useState([])
  const [searchMetaText, setSearchMetaText] = useState('')

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(API_USUARIOS)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setUsuarios(data)
    } catch (error) {
      console.error('No se pudieron cargar los usuarios:', error)
      setUsuarios([])
    }
  }

  const fetchHabilitaciones = async () => {
    try {
      const res = await fetch(API_HABILITACIONES)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setHabilitaciones(data)
    } catch (error) {
      console.error('No se pudieron cargar las habilitaciones:', error)
      setHabilitaciones([])
    }
  }

  useEffect(() => { fetchUsuarios(); fetchHabilitaciones() }, [])

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

  const toggleAllSearch = () => {
    if (!searchResults) return
    if (selectedSearchIds.length === searchResults.length) setSelectedSearchIds([])
    else setSelectedSearchIds(searchResults.map((u) => u.rut))
  }

  const descargarBusqueda = async (formato) => {
    const ids = selectedSearchIds.join(',')
    const params = new URLSearchParams()
    if (ids) params.set('ids', ids)
    if (searchMetaText) params.set('meta', searchMetaText)
    const qs = params.toString()
    const url = `${buildApiUrl(`/api/usuarios/${formato}`)}${qs ? '?' + qs : ''}`
    const res = await fetch(url)
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const ext = formato === 'excel' ? 'xlsx' : formato === 'pdf' ? 'pdf' : 'docx'
    link.download = `usuarios.${ext}`
    link.click()
    URL.revokeObjectURL(link.href)
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

  const deleteUsuario = async (id) => {
    try {
      const res = await fetch(`${API_USUARIOS}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Error ${res.status}`)
    } catch (error) {
      console.error('No se pudo eliminar el usuario:', error)
    }
    fetchUsuarios()
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Usuarios</h1>
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
                  <div className="mb-3">
                    <label className="form-label fw-bold">META</label>
                    <textarea className="form-control" rows="2" value={searchMetaText} onChange={(e) => setSearchMetaText(e.target.value)} placeholder="Ingrese la meta del usuario..."></textarea>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-success" onClick={() => descargarBusqueda('excel')} disabled={selectedSearchIds.length === 0}>
                      Excel ({selectedSearchIds.length})
                    </button>
                    <button className="btn btn-danger" onClick={() => descargarBusqueda('pdf')} disabled={selectedSearchIds.length === 0}>
                      PDF ({selectedSearchIds.length})
                    </button>
                    <button className="btn btn-primary" onClick={() => descargarBusqueda('word')} disabled={selectedSearchIds.length === 0}>
                      Word ({selectedSearchIds.length})
                    </button>
                    <button className="btn btn-info text-white" onClick={abrirPreviewBusqueda} disabled={selectedSearchIds.length === 0}>
                      Vista previa ({selectedSearchIds.length})
                    </button>
                  </div>
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
                </>
              )}
            </>
          )}
        </div>
      </div>

      <UsuariosList usuarios={usuarios} onDelete={deleteUsuario} />

      <div className="card mt-4">
        <div className="card-header fw-bold">Tabla de Decisiones — Habilitaciones</div>
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
    </div>
  )
}

export default App
