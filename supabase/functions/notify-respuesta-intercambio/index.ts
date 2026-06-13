// Edge Function: notify-respuesta-intercambio
// Disparada por un Database Webhook en UPDATE sobre public.intercambios.
// Envía un email al solicitante cuando su solicitud es aprobada o rechazada.
//
// Variables de entorno requeridas en Supabase → Settings → Edge Functions:
//   BREVO_API_KEY         — clave de API de Brevo (Transactional Emails)
//   BREVO_SENDER_EMAIL    — email verificado en Brevo como remitente
//   BREVO_SENDER_NAME     — nombre del remitente (ej: WorldCapp)
//   APP_URL               — URL pública de la app (ej: https://worldcapp.vercel.app)
//
// Variables que Supabase inyecta automáticamente:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BREVO_API_KEY      = Deno.env.get('BREVO_API_KEY')
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') ?? 'no-reply@worldcapp.vercel.app'
const BREVO_SENDER_NAME  = Deno.env.get('BREVO_SENDER_NAME')  ?? 'WorldCapp'
const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL            = Deno.env.get('APP_URL') ?? 'https://worldcapp.vercel.app'

serve(async (req) => {
  try {
    const payload    = await req.json()
    const record     = payload.record      // fila actualizada
    const oldRecord  = payload.old_record  // fila anterior

    // Solo notificar cuando el estado cambia a aprobado o rechazado
    if (!record?.estado || record.estado === oldRecord?.estado) {
      return new Response('no state change', { status: 200 })
    }
    if (!['aprobado', 'rechazado'].includes(record.estado)) {
      return new Response('irrelevant state', { status: 200 })
    }

    if (!record?.solicitante_id || !record?.receptor_id) {
      return new Response('missing fields', { status: 400 })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

    const [{ data: solicitanteData }, { data: receptorData }] = await Promise.all([
      admin.auth.admin.getUserById(record.solicitante_id),
      admin.auth.admin.getUserById(record.receptor_id),
    ])

    const solicitante = solicitanteData?.user
    const receptor    = receptorData?.user
    if (!solicitante?.email) return new Response('solicitante not found', { status: 404 })

    const solicitanteNombre = solicitante.user_metadata?.name ?? solicitante.email.split('@')[0]
    const receptorNombre    = receptor?.user_metadata?.name   ?? receptor?.email?.split('@')[0] ?? 'El otro coleccionista'

    if (!BREVO_API_KEY) {
      console.warn('BREVO_API_KEY no configurada — email omitido')
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const aprobado = record.estado === 'aprobado'

    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: solicitante.email, name: solicitanteNombre }],
        subject: aprobado
          ? `${receptorNombre} aceptó tu solicitud de intercambio`
          : `${receptorNombre} no aceptó tu solicitud de intercambio`,
        htmlContent: buildEmailHtml(solicitanteNombre, receptorNombre, aprobado, APP_URL),
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Brevo error:', err)
      return new Response(err, { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })

  } catch (e) {
    console.error(e)
    return new Response(String(e), { status: 500 })
  }
})

function buildEmailHtml(
  solicitanteNombre: string,
  receptorNombre: string,
  aprobado: boolean,
  appUrl: string
): string {
  const headerBg  = aprobado ? '#1a4d2e' : '#7f1d1d'
  const titulo    = aprobado ? '¡Solicitud aceptada!' : 'Solicitud no aceptada'
  const cuerpo    = aprobado
    ? `<strong style="color:#1a1a1a">${receptorNombre}</strong> acept&#243; tu solicitud
       de intercambio. Ahora pueden ver qu&#233; l&#225;minas repetidas pueden
       ofrecerse mutuamente.`
    : `<strong style="color:#1a1a1a">${receptorNombre}</strong> no acept&#243; tu
       solicitud de intercambio en esta ocasi&#243;n. Puedes enviarle una nueva
       solicitud m&#225;s adelante.`
  const botonTexto = aprobado ? 'Ver intercambio en WorldCapp' : 'Ir a WorldCapp'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:system-ui,sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

    <div style="background:${headerBg};padding:28px 32px;text-align:center">
      <p style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px">
        WorldCapp &#127183;
      </p>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:13px">
        FIFA World Cup 2026&#8482;
      </p>
    </div>

    <div style="padding:32px">
      <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a1a">
        ${titulo}
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6">
        Hola <strong style="color:#1a1a1a">${solicitanteNombre}</strong>,<br><br>
        ${cuerpo}
      </p>

      <a href="${appUrl}/intercambios"
         style="display:inline-block;background:${headerBg};color:#fff;
                padding:13px 28px;border-radius:8px;font-size:14px;
                font-weight:700;text-decoration:none">
        ${botonTexto}
      </a>
    </div>

    <div style="padding:16px 32px 24px;border-top:1px solid #f0ebe4">
      <p style="margin:0;font-size:11px;color:#aaa;text-align:center;line-height:1.5">
        Recibes este correo porque enviaste una solicitud de intercambio en WorldCapp.
      </p>
    </div>

  </div>
</body>
</html>`
}
