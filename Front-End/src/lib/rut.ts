/**
 * Limpia un RUT dejando solo dígitos y dígito verificador (sin puntos ni guion).
 */
function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

/**
 * Valida un RUT chileno con el algoritmo módulo 11.
 */
export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut)
  if (limpio.length < 2) return false

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false

  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }

  const resto = 11 - (suma % 11)
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === esperado
}

/**
 * Formatea un RUT como 12.345.678-9.
 */
export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut)
  if (limpio.length < 2) return limpio

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}
