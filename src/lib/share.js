// share.js — Utilidades para compartir la app en redes sociales y mensajería.

export function whatsappInviteUrl() {
  const url  = window.location.origin
  const text = `¡Hola! 🎴 Estoy usando WorldCapp para registrar mi álbum del FIFA World Cup 2026. ¡Únete y lleva el control de tu colección también! 👉 ${url}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
