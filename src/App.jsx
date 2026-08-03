import { useState, useEffect, useRef } from 'react'
import UsuarioForm from './components/UsuarioForm'
import UsuariosList from './components/UsuariosList'
import dimensionesObjetivosData from './assets/lista-dimensiones-objetivos.json'
import decisionesDimensionData from './assets/decisiones-dimension.json'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://pai-be.vercel.app').replace(/\/$/, '')
const buildApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
const API_USUARIOS = buildApiUrl('/api/usuarios')
const API_HABILITACIONES = buildApiUrl('/api/habilitaciones')
const WORD_EXPORT_PATH = import.meta.env.VITE_WORD_EXPORT_PATH || '/api/usuarios/word'
const API_WORD_EXPORT = buildApiUrl(WORD_EXPORT_PATH)
const CACHE_KEY = 'crud-app-cache-v1'
const CACHE_TTL_MS = 5 * 60 * 1000
const dimensionGroups = dimensionesObjetivosData?.Grupos || []
const dimensionOptions = dimensionGroups.map((group) => group.Dimension)
const objectivesByDimension = dimensionGroups.reduce((acc, group) => {
  acc[group.Dimension] = group.Objetivos || []
  return acc
}, {})
const decisionRules = decisionesDimensionData?.reglas || []

const normalizeText = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const decisionsByDimensionAndObjective = decisionRules.reduce((acc, rule) => {
  const dimension = rule?.Dimension
  if (!dimension) return acc

  const objectiveMap = acc[dimension] || {}
  const options = rule?.ObjetivosDisponibles || []

  options.forEach((option) => {
    const objective = option?.Objetivo
    if (!objective) return
    const key = normalizeText(objective)
    if (!objectiveMap[key]) objectiveMap[key] = []
    objectiveMap[key].push(option)
  })

  acc[dimension] = objectiveMap
  return acc
}, {})

const buildListText = (items = []) => items.map((item) => `- ${item}`).join('\n')
const buildEditableText = (value) => {
  if (Array.isArray(value)) return buildListText(value)
  if (value === null || value === undefined) return ''
  return `${value}`
}

const parseContentDispositionFilename = (contentDisposition) => {
  if (!contentDisposition) return ''

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/"/g, ''))
    } catch {
      return utf8Match[1].replace(/"/g, '')
    }
  }

  const plainMatch = contentDisposition.match(/filename=([^;]+)/i)
  if (!plainMatch?.[1]) return ''
  return plainMatch[1].trim().replace(/^"|"$/g, '')
}

const downloadBlob = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(objectUrl)
}

const base64ToBlob = (rawBase64, mimeType) => {
  const cleanBase64 = (rawBase64 || '').replace(/^data:.*;base64,/, '')
  const binary = window.atob(cleanBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

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

function Dropdown({ label, value, options, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="position-relative" style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
      <label className="form-label fw-bold">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        className="form-select text-start"
        style={{ minHeight: '38px', height: '38px', width: '100%', maxWidth: '100%', whiteSpace: 'nowrap', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0, marginTop: '2px', paddingTop: '0.35rem', paddingBottom: '0.35rem', boxSizing: 'border-box' }}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        {value || placeholder}
      </button>
      {open && !disabled && (
        <div
          ref={menuRef}
          className="border rounded bg-white shadow-sm p-2"
          style={{
            position: 'fixed',
            zIndex: 2000,
            maxHeight: '320px',
            overflowY: 'auto',
            minWidth: buttonRef.current ? buttonRef.current.offsetWidth : 360,
            maxWidth: buttonRef.current ? buttonRef.current.offsetWidth : 360,
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 0,
            top: buttonRef.current
              ? buttonRef.current.getBoundingClientRect().bottom + 6
              : 0,
            width: buttonRef.current ? buttonRef.current.offsetWidth : 360
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              className={`p-2 rounded ${value === option ? 'bg-primary text-white' : 'bg-white'}`}
              style={{ cursor: 'pointer', whiteSpace: 'normal', wordBreak: 'break-word', width: '100%', display: 'block', boxSizing: 'border-box', overflowWrap: 'anywhere' }}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [usuarios, setUsuarios] = useState(() => readCache('usuarios', []))
  const [habilitaciones, setHabilitaciones] = useState(() => readCache('habilitaciones', []))
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedSearchIds, setSelectedSearchIds] = useState([])
  const [searchMetaText, setSearchMetaText] = useState('')
  const [selectedObjectivesByDimension, setSelectedObjectivesByDimension] = useState({})
  const [strategyTextByDimension, setStrategyTextByDimension] = useState({})
  const [indicatorTextByDimension, setIndicatorTextByDimension] = useState({})
  const [deadlineTextByDimension, setDeadlineTextByDimension] = useState({})
  const [ownerTextByDimension, setOwnerTextByDimension] = useState({})
  const [evaluationTextByDimension, setEvaluationTextByDimension] = useState({})
  const [isGeneratingWord, setIsGeneratingWord] = useState(false)
  const [wordDownloadError, setWordDownloadError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    edad: '',
    fecha_nacimiento: '',
    equipo_tratante: '',
    estado_motivacional: '',
    programa: ''
  })
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

  const applySearchFilter = (query) => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      setSearchResults(usuarios)
      setSelectedSearchIds([])
      return
    }

    const normalizedRut = normalizedQuery.replace(/[.-]/g, '')

    const filtered = usuarios.filter((user) => {
      const rut = `${user.rut || ''}`.toLowerCase().replace(/[.-]/g, '')
      const haystack = `${rut} ${user.nombre || ''} ${user.apellido || ''} ${user.equipo_tratante || ''} ${user.estado_motivacional || ''} ${user.programa || ''}`.toLowerCase()
      return haystack.includes(normalizedRut)
    })

    setSearchResults(filtered)
    setSelectedSearchIds([])
  }

  const buscarUsuario = () => {
    applySearchFilter(searchQuery)
  }

  useEffect(() => {
    applySearchFilter(searchQuery)
  }, [usuarios, searchQuery])

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
      edad: user.edad?.toString() || '',
      fecha_nacimiento: user.fecha_nacimiento || '',
      equipo_tratante: user.equipo_tratante || '',
      estado_motivacional: user.estado_motivacional || '',
      programa: user.programa || ''
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
    setEditForm({
      rut: '',
      nombre: '',
      apellido: '',
      edad: '',
      fecha_nacimiento: '',
      equipo_tratante: '',
      estado_motivacional: '',
      programa: ''
    })
    setSelectedSearchIds([])
    setSearchMetaText('')
  }

  const toggleAllSearch = () => {
    if (!searchResults) return
    if (selectedSearchIds.length === searchResults.length) setSelectedSearchIds([])
    else setSelectedSearchIds(searchResults.map((u) => u.rut))
  }

  const dimensiones = dimensionOptions
  const objetivosPorDimension = objectivesByDimension

  const handleObjectiveSelection = (dimension, objective) => {
    setSelectedObjectivesByDimension((prev) => ({ ...prev, [dimension]: objective }))

    const objectiveKey = normalizeText(objective)
    const decisionOptions = decisionsByDimensionAndObjective[dimension]?.[objectiveKey] || []
    const suggestedOption = decisionOptions[0] || null

    setStrategyTextByDimension((prev) => ({
      ...prev,
      [dimension]: buildListText(suggestedOption?.Estrategia || []),
    }))

    setIndicatorTextByDimension((prev) => ({
      ...prev,
      [dimension]: buildListText(suggestedOption?.Indicador || []),
    }))

    setDeadlineTextByDimension((prev) => ({
      ...prev,
      [dimension]: buildEditableText(
        suggestedOption?.Plazo ?? suggestedOption?.plazo ?? ''
      ),
    }))

    setOwnerTextByDimension((prev) => ({
      ...prev,
      [dimension]: buildEditableText(
        suggestedOption?.Responsable ?? suggestedOption?.responsable ?? ''
      ),
    }))

    setEvaluationTextByDimension((prev) => ({
      ...prev,
      [dimension]: buildEditableText(
        suggestedOption?.Evaluacion ??
        suggestedOption?.['Evaluación'] ??
        suggestedOption?.evaluacion ??
        ''
      ),
    }))
  }

  const handleObjectiveTextChange = (dimension, value) => {
    setSelectedObjectivesByDimension((prev) => ({ ...prev, [dimension]: value }))
  }

  const resetObjective = (dimension) => {
    setSelectedObjectivesByDimension((prev) => ({ ...prev, [dimension]: '' }))
    setStrategyTextByDimension((prev) => ({ ...prev, [dimension]: '' }))
    setIndicatorTextByDimension((prev) => ({ ...prev, [dimension]: '' }))
    setDeadlineTextByDimension((prev) => ({ ...prev, [dimension]: '' }))
    setOwnerTextByDimension((prev) => ({ ...prev, [dimension]: '' }))
    setEvaluationTextByDimension((prev) => ({ ...prev, [dimension]: '' }))
  }

  const handleStrategyTextChange = (dimension, value) => {
    setStrategyTextByDimension((prev) => ({ ...prev, [dimension]: value }))
  }

  const handleIndicatorTextChange = (dimension, value) => {
    setIndicatorTextByDimension((prev) => ({ ...prev, [dimension]: value }))
  }

  const handleDeadlineTextChange = (dimension, value) => {
    setDeadlineTextByDimension((prev) => ({ ...prev, [dimension]: value }))
  }

  const handleOwnerTextChange = (dimension, value) => {
    setOwnerTextByDimension((prev) => ({ ...prev, [dimension]: value }))
  }

  const handleEvaluationTextChange = (dimension, value) => {
    setEvaluationTextByDimension((prev) => ({ ...prev, [dimension]: value }))
  }

  const abrirPreviewBusqueda = () => {
    const ids = selectedSearchIds.join(',')
    const params = new URLSearchParams()
    if (ids) params.set('ids', ids)
    if (searchMetaText) params.set('meta', searchMetaText)

    const selections = Object.entries(selectedObjectivesByDimension).filter(([, objective]) => Boolean(objective))
    selections.forEach(([dimension, objective]) => {
      params.append('dimension', dimension)
      params.append('objetivo', objective)
    })

    const qs = params.toString()
    const url = `${buildApiUrl('/api/usuarios/preview')}${qs ? '?' + qs : ''}`
    window.open(url, '_blank')
  }

  const generarWordBusqueda = async () => {
    if (selectedSearchIds.length === 0) return

    setWordDownloadError('')
    setIsGeneratingWord(true)

    const selections = Object.entries(selectedObjectivesByDimension).filter(([, objective]) => Boolean(objective))
    const decisiones = selections.map(([dimension, objetivo]) => ({
      dimension,
      objetivo,
      estrategia: strategyTextByDimension[dimension] || '',
      indicador: indicatorTextByDimension[dimension] || '',
      plazo: deadlineTextByDimension[dimension] || '',
      responsable: ownerTextByDimension[dimension] || '',
      evaluacion: evaluationTextByDimension[dimension] || '',
    }))

    const usuariosSeleccionados = usuarios
      .filter((usuario) => selectedSearchIds.includes(usuario.rut))
      .map((usuario) => ({
        rut: usuario.rut,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        edad: usuario.edad,
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        equipo_tratante: usuario.equipo_tratante || '',
        estado_motivacional: usuario.estado_motivacional || '',
        programa: usuario.programa || '',
      }))

    const payload = {
      ids: selectedSearchIds,
      meta: searchMetaText,
      usuarios: usuariosSeleccionados,
      decisiones,
    }

    try {
      const res = await fetch(API_WORD_EXPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        throw new Error(errorText || `Error ${res.status} al generar el documento`)
      }

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const data = await res.json()

        if (data?.downloadUrl) {
          window.open(data.downloadUrl, '_blank')
          return
        }

        if (data?.fileUrl) {
          window.open(data.fileUrl, '_blank')
          return
        }

        if (data?.fileBase64 || data?.base64) {
          const fileName = data.fileName || `plan-intervencion-${Date.now()}.docx`
          const mimeType = data.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          const blob = base64ToBlob(data.fileBase64 || data.base64, mimeType)
          downloadBlob(blob, fileName)
          return
        }

        throw new Error('El backend no devolvio un archivo descargable')
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get('content-disposition') || ''
      const fileName = parseContentDispositionFilename(contentDisposition) || `plan-intervencion-${Date.now()}.docx`
      downloadBlob(blob, fileName)
    } catch (error) {
      console.error('No se pudo generar/descargar el Word:', error)
      setWordDownloadError(error?.message || 'No se pudo descargar el archivo Word')
    } finally {
      setIsGeneratingWord(false)
    }
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
        fecha_nacimiento: updatedUser.fecha_nacimiento ?? editForm.fecha_nacimiento,
        equipo_tratante: updatedUser.equipo_tratante ?? editForm.equipo_tratante,
        estado_motivacional: updatedUser.estado_motivacional ?? editForm.estado_motivacional,
        programa: updatedUser.programa ?? editForm.programa,
        meta: searchMetaText,
      }

      setUsuarios((prev) => prev.map((u) => (u.rut === normalizedUser.rut ? normalizedUser : u)))
      setSearchResults((prev) => prev ? prev.map((u) => (u.rut === normalizedUser.rut ? normalizedUser : u)) : prev)
      setEditingUser(null)
      setEditForm({
        rut: '',
        nombre: '',
        apellido: '',
        edad: '',
        fecha_nacimiento: '',
        equipo_tratante: '',
        estado_motivacional: '',
        programa: ''
      })
      setSelectedSearchIds([normalizedUser.rut])
      setSearchMetaText(normalizedUser.meta || '')
    } catch (error) {
      console.error('No se pudo actualizar el usuario:', error)
    }

    fetchUsuarios(true)
  }

  const footerDate = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <div className="container py-4 flex-grow-1 pb-5">
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
            <div className="card mt-4">
              <div className="card-header fw-bold">Buscar Usuario</div>
              <div className="card-body">
                <div className="input-group mb-3">
                  <input type="text" className="form-control" placeholder="RUT, nombre o apellido..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} />
                  <button className="btn btn-primary" onClick={buscarUsuario}>
                    Buscar
                  </button>
                </div>

                {(
                  <>
                    {searchResults.length === 0 ? (
                      <p className="text-muted">{usuarios.length === 0 ? 'No hay usuarios registrados.' : 'No se encontraron usuarios.'}</p>
                    ) : (
                      <>
                        <table className="table table-striped">
                          <thead className="table-dark">
                            <tr>
                              <th style={{ width: '40px' }}>
                                <input type="checkbox" className="form-check-input" onChange={toggleAllSearch} checked={selectedSearchIds.length === searchResults.length && searchResults.length > 0} />
                              </th>
                              <th style={{ width: '160px' }}>RUT</th>
                              <th style={{ width: '200px' }}>Nombre</th>
                              <th style={{ width: '200px' }}>Apellido</th>
                              <th style={{ width: '80px' }}>Edad</th>
                              <th style={{ width: '170px' }}>Fecha nacimiento</th>
                              <th style={{ width: '180px' }}>Equipo tratante</th>
                              <th style={{ width: '180px' }}>Estado motivacional</th>
                              <th style={{ width: '160px' }}>Programa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchResults.map((u) => (
                              <tr key={u.rut}>
                                <td>
                                  <input type="checkbox" className="form-check-input" checked={selectedSearchIds.includes(u.rut)} onChange={() => toggleSearch(u.rut)} />
                                </td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.rut}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.nombre}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.apellido}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.edad}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.fecha_nacimiento || '-'}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.equipo_tratante || '-'}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.estado_motivacional || '-'}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{u.programa || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {selectedSearchIds.length > 0 && (
                          <div className="mt-4 p-2 border rounded bg-light">
                            <div className="d-flex flex-column gap-2">
                              {dimensiones.map((dimension) => {
                                const selectedValue = selectedObjectivesByDimension[dimension] || ''
                                const suggestedOptions = objetivosPorDimension[dimension] || []

                                return (
                                  <div className="border rounded p-2 bg-white" key={dimension}>
                                    <div className="row g-2 align-items-center">
                                      <div className="col-lg-3 d-flex justify-content-center">
                                        <div className="fw-semibold small text-center">{dimension}</div>
                                      </div>
                                      <div className="col-lg-9">
                                        <div className="d-flex gap-1 align-items-end" style={{ marginTop: '2px' }}>
                                          <div className="flex-grow-1 min-width-0" style={{ width: '90%', maxWidth: '90%' }}>
                                            <Dropdown
                                              label=""
                                              value={selectedValue}
                                              options={suggestedOptions}
                                              onChange={(objective) => handleObjectiveSelection(dimension, objective)}
                                              placeholder="Seleccione un objetivo"
                                              disabled={!suggestedOptions.length}
                                            />
                                          </div>
                                          <div className="d-flex align-items-stretch flex-shrink-0" style={{ marginLeft: '4px' }}>
                                            <button
                                              type="button"
                                              className="btn btn-outline-secondary btn-sm"
                                              onClick={() => resetObjective(dimension)}
                                              title="Reiniciar selección"
                                              style={{ height: '38px', minHeight: '38px', paddingTop: '0.25rem', paddingBottom: '0.25rem', marginLeft: '2px', alignSelf: 'flex-end' }}
                                            >
                                              Reiniciar
                                            </button>
                                          </div>
                                        </div>
                                        <textarea
                                          className="form-control mt-2"
                                          rows="2"
                                          value={selectedValue}
                                          onChange={(e) => handleObjectiveTextChange(dimension, e.target.value)}
                                          placeholder="Ajuste el objetivo aquí..."
                                          style={{ minHeight: '64px', height: 'calc(100% - 40px)' }}
                                        />
                                        <div className="row g-2 mt-1">
                                          <div className="col-12 col-xl-6">
                                            <div className="border rounded p-2 h-100 bg-light-subtle">
                                              <label className="form-label fw-bold mb-1">Estrategia (editable)</label>
                                              <textarea
                                                className="form-control"
                                                rows="4"
                                                value={strategyTextByDimension[dimension] || ''}
                                                onChange={(e) => handleStrategyTextChange(dimension, e.target.value)}
                                                placeholder="Se cargarán estrategias desde decisiones-dimension..."
                                                style={{ minHeight: '110px' }}
                                              />
                                            </div>
                                          </div>
                                          <div className="col-12 col-xl-6">
                                            <div className="border rounded p-2 h-100 bg-light-subtle">
                                              <label className="form-label fw-bold mb-1">Indicador (editable)</label>
                                              <textarea
                                                className="form-control"
                                                rows="4"
                                                value={indicatorTextByDimension[dimension] || ''}
                                                onChange={(e) => handleIndicatorTextChange(dimension, e.target.value)}
                                                placeholder="Se cargarán indicadores desde decisiones-dimension..."
                                                style={{ minHeight: '110px' }}
                                              />
                                            </div>
                                          </div>
                                          <div className="col-12 col-md-4">
                                            <div className="border rounded p-2 h-100 bg-light-subtle">
                                              <label className="form-label fw-bold mb-1">Plazo</label>
                                              <textarea
                                                className="form-control"
                                                rows="3"
                                                value={deadlineTextByDimension[dimension] || ''}
                                                onChange={(e) => handleDeadlineTextChange(dimension, e.target.value)}
                                                placeholder="Defina plazo..."
                                                style={{ minHeight: '90px' }}
                                              />
                                            </div>
                                          </div>
                                          <div className="col-12 col-md-4">
                                            <div className="border rounded p-2 h-100 bg-light-subtle">
                                              <label className="form-label fw-bold mb-1">Responsable</label>
                                              <textarea
                                                className="form-control"
                                                rows="3"
                                                value={ownerTextByDimension[dimension] || ''}
                                                onChange={(e) => handleOwnerTextChange(dimension, e.target.value)}
                                                placeholder="Defina responsable..."
                                                style={{ minHeight: '90px' }}
                                              />
                                            </div>
                                          </div>
                                          <div className="col-12 col-md-4">
                                            <div className="border rounded p-2 h-100 bg-light-subtle">
                                              <label className="form-label fw-bold mb-1">Evaluación</label>
                                              <textarea
                                                className="form-control"
                                                rows="3"
                                                value={evaluationTextByDimension[dimension] || ''}
                                                onChange={(e) => handleEvaluationTextChange(dimension, e.target.value)}
                                                placeholder="Defina evaluación..."
                                                style={{ minHeight: '90px' }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            <div className="d-flex align-items-center justify-content-between mt-3 mb-1">
                              <label className="form-label fw-bold mb-0">META</label>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setSearchMetaText('')}
                                title="Reiniciar meta"
                                aria-label="Reiniciar meta"
                                disabled={!searchMetaText}
                                style={{ height: '38px', minHeight: '38px', paddingTop: '0.25rem', paddingBottom: '0.25rem', marginLeft: '2px' }}
                              >
                                Reiniciar
                              </button>
                            </div>
                            <textarea className="form-control" rows="2" value={searchMetaText} onChange={(e) => setSearchMetaText(e.target.value)} placeholder="Ingrese la meta del usuario..."></textarea>

                            <div className="mt-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                              <div className="small text-danger">{wordDownloadError}</div>
                              <div className="d-flex gap-2 ms-md-auto">
                                <button className="btn btn-info text-white" onClick={abrirPreviewBusqueda} disabled={selectedSearchIds.length === 0}>
                                  Vista previa ({selectedSearchIds.length})
                                </button>
                                <button
                                  className="btn btn-success"
                                  onClick={generarWordBusqueda}
                                  disabled={selectedSearchIds.length === 0 || isGeneratingWord}
                                >
                                  {isGeneratingWord ? 'Generando...' : 'Generar Word'}
                                </button>
                              </div>
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
                      <div className="col-md-3">
                        <label className="form-label">Fecha de nacimiento</label>
                        <input name="fecha_nacimiento" type="date" className="form-control" value={editForm.fecha_nacimiento} onChange={handleEditFormChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Equipo tratante</label>
                        <input name="equipo_tratante" className="form-control" value={editForm.equipo_tratante} onChange={handleEditFormChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Estado motivacional</label>
                        <input name="estado_motivacional" className="form-control" value={editForm.estado_motivacional} onChange={handleEditFormChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Programa</label>
                        <input name="programa" className="form-control" value={editForm.programa} onChange={handleEditFormChange} />
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
            <UsuarioForm onSubmit={createUsuario} />

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
                      <div className="col-md-3">
                        <label className="form-label">Fecha de nacimiento</label>
                        <input name="fecha_nacimiento" type="date" className="form-control" value={editForm.fecha_nacimiento} onChange={handleEditFormChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Equipo tratante</label>
                        <input name="equipo_tratante" className="form-control" value={editForm.equipo_tratante} onChange={handleEditFormChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Estado motivacional</label>
                        <input name="estado_motivacional" className="form-control" value={editForm.estado_motivacional} onChange={handleEditFormChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Programa</label>
                        <input name="programa" className="form-control" value={editForm.programa} onChange={handleEditFormChange} />
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

        <footer className="position-fixed bottom-0 start-0 end-0 border-top bg-white text-center text-muted small py-3 px-3 shadow-sm">
          {footerDate}
        </footer>
      </div>
    </div>
  )
}

export default App
