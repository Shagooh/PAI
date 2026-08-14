import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import UsuarioForm from './components/UsuarioForm'
import UsuariosList from './components/UsuariosList'
import EditarUsuarioCard from './components/EditarUsuarioCard'
import dimensionesObjetivosData from './assets/lista-dimensiones-objetivos.json'
import decisionesDimensionData from './assets/decisiones-dimension.json'
import { EMPTY_USER_FORM, formatDateForDisplay, formatDateForInput } from './utils/userUtils'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://pai-be.vercel.app').replace(/\/$/, '')
const buildApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
const API_USUARIOS = buildApiUrl('/api/usuarios')
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
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, width: 0 })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const computeMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const next = { left: rect.left, top: rect.bottom + 6, width: rect.width }
    setMenuPosition((prev) =>
      prev.left === next.left && prev.top === next.top && prev.width === next.width
        ? prev
        : next
    )
  }

  useEffect(() => {
    if (!open) return

    computeMenuPosition()

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
    window.addEventListener('scroll', computeMenuPosition, true)
    window.addEventListener('resize', computeMenuPosition)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', computeMenuPosition, true)
      window.removeEventListener('resize', computeMenuPosition)
    }
  }, [open])

  return (
    <div className="relative w-full min-w-0">
      {label ? <label className="ui-label">{label}</label> : null}
      <button
        ref={buttonRef}
        type="button"
        className="ui-input h-10 truncate pr-8 text-left"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        {value || placeholder}
      </button>
      {open && !disabled && menuPosition.width > 0 &&
        createPortal(
          <div
            ref={menuRef}
            className="panel p-2"
            style={{
              position: 'fixed',
              zIndex: 2000,
              maxHeight: '320px',
              overflowY: 'auto',
              minWidth: menuPosition.width,
              maxWidth: menuPosition.width,
              left: menuPosition.left,
              top: menuPosition.top,
              width: menuPosition.width,
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm last:mb-0 ${value === option
                  ? 'bg-[#0f9d75] text-white'
                  : 'bg-white text-[#1f4436] hover:bg-[#edf7f2]'
                  }`}
                style={{ overflowWrap: 'anywhere' }}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

function App() {
  const [usuarios, setUsuarios] = useState(() => readCache('usuarios', []))
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
  const [editForm, setEditForm] = useState(EMPTY_USER_FORM)
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

  const refreshUsuarios = () => fetchUsuarios(true)

  useEffect(() => {
    const cachedUsuarios = readCache('usuarios', [])

    if (cachedUsuarios.length > 0) {
      setUsuarios(cachedUsuarios)
    }

    if (!hasValidCache('usuarios')) {
      fetchUsuarios()
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
      fecha_nacimiento: formatDateForDisplay(user.fecha_nacimiento || ''),
      equipo_tratante: user.equipo_tratante || '',
      estado_motivacional: user.estado_motivacional || '',
      programa: user.programa || ''
    })
    setSelectedSearchIds([user.rut])
    setSearchMetaText(user.meta || '')
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'fecha_nacimiento' ? formatDateForInput(value) : value
    setEditForm((prev) => ({ ...prev, [name]: nextValue }))
  }

  const cancelEditUser = () => {
    setEditingUser(null)
    setEditForm(EMPTY_USER_FORM)
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
      setEditForm(EMPTY_USER_FORM)
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
    <div className="relative flex min-h-screen flex-col">
      <div className="page-shell flex-1">
        <div className="reveal-up mb-8" style={{ '--reveal-delay': '0ms' }}>
          <h1 className="mb-2 text-3xl font-bold text-[#153629] sm:text-4xl">Gestor de Usuarios</h1>
          <p className="text-sm text-[#557264]">Administra usuarios y genera planes de intervención desde una interfaz unificada.</p>
        </div>

        <div className="reveal-up mb-5 flex flex-wrap gap-2" style={{ '--reveal-delay': '70ms' }}>
          <button className={`ui-btn-tab ${view === 'buscar' ? 'ui-btn-tab-active' : ''}`} onClick={() => setView('buscar')}>
            Buscar / Crear
          </button>
          <button className={`ui-btn-tab ${view === 'tablas' ? 'ui-btn-tab-active' : ''}`} onClick={() => setView('tablas')}>
            Usuarios y Decisiones
          </button>
        </div>

        {view === 'buscar' && (
          <>
            <div className="panel reveal-up mt-4" style={{ '--reveal-delay': '130ms' }}>
              <div className="panel-head">
                <div className="panel-title">Buscar Usuario</div>
              </div>
              <div className="panel-body">
                <div className="mb-3 flex flex-col gap-2">
                  <input type="text" className="ui-input" placeholder="RUT, nombre o apellido..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} />
                </div>

                {(
                  <>
                    {searchResults.length === 0 ? (
                      <p className="text-sm text-[#617f71]">{usuarios.length === 0 ? 'No hay usuarios registrados.' : 'No se encontraron usuarios.'}</p>
                    ) : (
                      <>
                        <div className="ui-table-wrap">
                          <table className="ui-table">
                            <thead>
                              <tr>
                                <th style={{ width: '40px' }}>
                                  <input type="checkbox" className="ui-check" onChange={toggleAllSearch} checked={selectedSearchIds.length === searchResults.length && searchResults.length > 0} />
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
                                    <input type="checkbox" className="ui-check" checked={selectedSearchIds.includes(u.rut)} onChange={() => toggleSearch(u.rut)} />
                                  </td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.rut}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.nombre}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.apellido}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.edad}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateForDisplay(u.fecha_nacimiento) || '-'}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.equipo_tratante || '-'}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.estado_motivacional || '-'}</td>
                                  <td style={{ whiteSpace: 'nowrap' }}>{u.programa || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {selectedSearchIds.length > 0 && (
                          <div className="mt-4 rounded-2xl border border-[#cee1d7] bg-[#f5faf8] p-3 sm:p-4">
                            <div className="flex flex-col gap-2">
                              {dimensiones.map((dimension, index) => {
                                const selectedValue = selectedObjectivesByDimension[dimension] || ''
                                const suggestedOptions = objetivosPorDimension[dimension] || []

                                return (
                                  <div className="reveal-up rounded-xl border border-[#d6e7de] bg-white p-3" key={dimension} style={{ '--reveal-delay': `${Math.min(index * 35, 280)}ms` }}>
                                    <div className="grid items-start gap-3 lg:grid-cols-12">
                                      <div className="flex justify-center lg:col-span-3">
                                        <div className="text-center text-xs font-bold uppercase tracking-[0.08em] text-[#3b6654]">{dimension}</div>
                                      </div>
                                      <div className="lg:col-span-9">
                                        <div className="flex items-end gap-2">
                                          <div className="min-w-0 flex-1">
                                            <Dropdown
                                              label=""
                                              value={selectedValue}
                                              options={suggestedOptions}
                                              onChange={(objective) => handleObjectiveSelection(dimension, objective)}
                                              placeholder="Seleccione un objetivo"
                                              disabled={!suggestedOptions.length}
                                            />
                                          </div>
                                          <div className="shrink-0">
                                            <button
                                              type="button"
                                              className="ui-btn-outline h-10 px-3 py-1.5 text-xs"
                                              onClick={() => resetObjective(dimension)}
                                              title="Reiniciar selección"
                                            >
                                              Reiniciar
                                            </button>
                                          </div>
                                        </div>
                                        <textarea
                                          className="ui-textarea mt-2 min-h-[64px]"
                                          rows="2"
                                          value={selectedValue}
                                          onChange={(e) => handleObjectiveTextChange(dimension, e.target.value)}
                                          placeholder="Ajuste el objetivo aquí..."
                                        />
                                        <div className="mt-2 grid gap-2 xl:grid-cols-2">
                                          <div>
                                            <div className="h-full rounded-xl border border-[#d8e7e0] bg-[#f8fcfa] p-2">
                                              <label className="ui-label mb-1">Estrategia (editable)</label>
                                              <textarea
                                                className="ui-textarea min-h-[110px]"
                                                rows="4"
                                                value={strategyTextByDimension[dimension] || ''}
                                                onChange={(e) => handleStrategyTextChange(dimension, e.target.value)}
                                                placeholder="Se cargarán estrategias desde decisiones-dimension..."
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <div className="h-full rounded-xl border border-[#d8e7e0] bg-[#f8fcfa] p-2">
                                              <label className="ui-label mb-1">Indicador (editable)</label>
                                              <textarea
                                                className="ui-textarea min-h-[110px]"
                                                rows="4"
                                                value={indicatorTextByDimension[dimension] || ''}
                                                onChange={(e) => handleIndicatorTextChange(dimension, e.target.value)}
                                                placeholder="Se cargarán indicadores desde decisiones-dimension..."
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-2 grid gap-2 md:grid-cols-3">
                                          <div>
                                            <div className="h-full rounded-xl border border-[#d8e7e0] bg-[#f8fcfa] p-2">
                                              <label className="ui-label mb-1">Plazo</label>
                                              <textarea
                                                className="ui-textarea min-h-[90px]"
                                                rows="3"
                                                value={deadlineTextByDimension[dimension] || ''}
                                                onChange={(e) => handleDeadlineTextChange(dimension, e.target.value)}
                                                placeholder="Defina plazo..."
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <div className="h-full rounded-xl border border-[#d8e7e0] bg-[#f8fcfa] p-2">
                                              <label className="ui-label mb-1">Responsable</label>
                                              <textarea
                                                className="ui-textarea min-h-[90px]"
                                                rows="3"
                                                value={ownerTextByDimension[dimension] || ''}
                                                onChange={(e) => handleOwnerTextChange(dimension, e.target.value)}
                                                placeholder="Defina responsable..."
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <div className="h-full rounded-xl border border-[#d8e7e0] bg-[#f8fcfa] p-2">
                                              <label className="ui-label mb-1">Evaluación</label>
                                              <textarea
                                                className="ui-textarea min-h-[90px]"
                                                rows="3"
                                                value={evaluationTextByDimension[dimension] || ''}
                                                onChange={(e) => handleEvaluationTextChange(dimension, e.target.value)}
                                                placeholder="Defina evaluación..."
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

                            <div className="mb-1 mt-4 flex items-center justify-between">
                              <label className="ui-label mb-0">META</label>
                              <button
                                type="button"
                                className="ui-btn-outline h-10 px-3 py-1.5 text-xs"
                                onClick={() => setSearchMetaText('')}
                                title="Reiniciar meta"
                                aria-label="Reiniciar meta"
                                disabled={!searchMetaText}
                              >
                                Reiniciar
                              </button>
                            </div>
                            <textarea className="ui-textarea min-h-[90px]" rows="2" value={searchMetaText} onChange={(e) => setSearchMetaText(e.target.value)} placeholder="Ingrese la meta del usuario..."></textarea>

                            <div className="mt-4 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
                              <div className="text-sm font-medium text-[#b42318]">{wordDownloadError}</div>
                              <div className="flex gap-2 md:ml-auto">
                                <button className="ui-btn-info" onClick={abrirPreviewBusqueda} disabled={selectedSearchIds.length === 0}>
                                  Vista previa ({selectedSearchIds.length})
                                </button>
                                <button
                                  className="ui-btn-success"
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

            <EditarUsuarioCard
              editingUser={editingUser}
              form={editForm}
              onChange={handleEditFormChange}
              onSubmit={updateUsuario}
              onCancel={cancelEditUser}
            />

          </>
        )}

        {view === 'tablas' && (
          <>
            <UsuarioForm onSubmit={createUsuario} />

            <UsuariosList usuarios={usuarios} onEdit={handleEditUser} onRefresh={refreshUsuarios} />

            <EditarUsuarioCard
              editingUser={editingUser}
              form={editForm}
              onChange={handleEditFormChange}
              onSubmit={updateUsuario}
              onCancel={cancelEditUser}
            />

          </>
        )}

        <footer className="fixed bottom-0 left-0 right-0 border-t border-[#cfe1d7] bg-white/95 px-3 py-3 text-center text-xs text-[#5b7a6c] shadow-sm backdrop-blur">
          {footerDate}
        </footer>
      </div>
    </div>
  )
}

export default App
