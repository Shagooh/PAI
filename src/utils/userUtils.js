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

export const sanitizePersonName = (value) => value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '')