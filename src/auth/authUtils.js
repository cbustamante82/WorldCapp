// authUtils.js — Validación de contraseña, hashing de respuesta secreta y datos de formulario.
// El hashing de contraseñas y la autenticación los maneja Supabase Auth.

export function validatePassword(pwd) {
  if (!pwd || pwd.length < 8)                               return 'Mínimo 8 caracteres.'
  if (pwd.length > 16)                                      return 'Máximo 16 caracteres.'
  if (!/[A-Z]/.test(pwd))                                   return 'Debe incluir al menos una letra mayúscula.'
  if (!/[0-9]/.test(pwd))                                   return 'Debe incluir al menos un número.'
  if (!/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/.test(pwd)) return 'Debe incluir al menos un carácter especial.'
  return null
}

// SHA-256 de la respuesta normalizada (trim + lowercase)
export async function hashSecretAnswer(answer) {
  const normalized = answer.trim().toLowerCase()
  const data = new TextEncoder().encode(normalized)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const SECRET_QUESTIONS = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el nombre de tu mejor amigo de infancia?',
  '¿Cuál es el nombre de soltera de tu madre?',
  '¿Cuál era el nombre de tu colegio primario?',
  '¿Cuál es tu película favorita de infancia?',
  '¿Cuál es el nombre de tu equipo de fútbol favorito?',
  '¿Cuál fue el modelo de tu primer automóvil?',
  '¿En qué calle vivías de niño/a?',
]

export const COUNTRIES = [
  'Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Cuba',
  'Ecuador','El Salvador','España','Guatemala','Honduras','México','Nicaragua',
  'Panamá','Paraguay','Perú','Puerto Rico','República Dominicana','Uruguay',
  'Venezuela','Estados Unidos','Canadá','Francia','Alemania','Italia',
  'Portugal','Reino Unido','Australia','Japón','Marruecos','Otro',
]

export const COUNTRY_ISO = {
  'Argentina':'ar','Bolivia':'bo','Brasil':'br','Chile':'cl','Colombia':'co',
  'Costa Rica':'cr','Cuba':'cu','Ecuador':'ec','El Salvador':'sv','España':'es',
  'Guatemala':'gt','Honduras':'hn','México':'mx','Nicaragua':'ni','Panamá':'pa',
  'Paraguay':'py','Perú':'pe','Puerto Rico':'pr','República Dominicana':'do',
  'Uruguay':'uy','Venezuela':'ve','Estados Unidos':'us','Canadá':'ca',
  'Francia':'fr','Alemania':'de','Italia':'it','Portugal':'pt','Reino Unido':'gb',
  'Australia':'au','Japón':'jp','Marruecos':'ma',
}
