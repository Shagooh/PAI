export const EMPTY_USER_FORM = {
  rut: '',
  nombre: '',
  apellido: '',
  edad: '',
  fecha_nacimiento: '',
  equipo_tratante: '',
  estado_motivacional: '',
  programa: ''
}

export const EMPTY_NEW_USER_FORM = {
  rut: '',
  nombre_apellidos: '',
  situacion: '',
  fecha_ingreso: '',
  convenio_senda: '',
  fecha_tentativa_ev_in: '',
  gestor: '',
  fecha_ev_integral: '',
  fecha_ultimo_pci: '',
  tiempo_pci: '',
  fecha_proximo_pci: '',
  tiempo_pci_1: '',
  fecha_proximo_pci_1: '',
  tiempo_pci_2: '',
  fecha_proximo_pci_2: ''
}

export const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$/

export const formatDateForDisplay = (value, { shortYear = false } = {}) => {
  if (!value) return ''

  const rawValue = `${value}`.trim()
  if (!rawValue) return ''

  const isoMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${shortYear ? year.slice(-2) : year}`
  }

  const compactMatch = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (compactMatch) {
    const [, day, month, year] = compactMatch
    const normalizedYear = String(year)
    const displayYear = shortYear ? normalizedYear.slice(-2) : normalizedYear
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${displayYear}`
  }

  return rawValue
}

export const formatDateForInput = (value) => {
  const digits = `${value}`.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  if (digits.length <= 6) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export const formatRut = (value) => {
  const cleaned = value.replace(/[^0-9Kk]/g, '')
  if (!cleaned) return ''

  if (/[Kk]$/.test(cleaned)) {
    const dv = cleaned.slice(-1).toUpperCase()
    const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${body}-${dv}`
  }

  if (value.includes('-') && cleaned.length > 1) {
    const dv = cleaned.slice(-1)
    const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${body}-${dv}`
  }

  if (value.endsWith('-')) {
    return `${cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-`
  }

  if (cleaned.length > 7) {
    const dv = cleaned.slice(-1)
    const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${body}-${dv}`
  }

  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const addMonthsToDate = (value, months) => {
  const match = `${value ?? ''}`.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  const n = Number(months)
  if (!match || !Number.isInteger(n) || n < 1) return ''

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1 + n, 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, lastDay))
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

export const sanitizePersonName = (value) => value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '')