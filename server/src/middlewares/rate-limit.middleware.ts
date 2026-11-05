import { rateLimit } from "express-rate-limit"

const tooMany = { message: "Demasiadas peticiones, inténtalo de nuevo en unos minutos" }

// Red de seguridad general para toda la API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany,
})

// Login y registro: frena la fuerza bruta de contraseñas.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany,
})

// Reservas y cancelaciones publicas (sin autenticacion): frena el spam de reservas.
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany,
})
