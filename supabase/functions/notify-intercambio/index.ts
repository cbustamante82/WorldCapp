// Edge Function: notify-intercambio
// Disparada por un Database Webhook en INSERT sobre public.intercambios.
// Envía un email al receptor via Brevo (brevo.com).
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

const BREVO_API_KEY       = Deno.env.get('BREVO_API_KEY')
const BREVO_SENDER_EMAIL  = Deno.env.get('BREVO_SENDER_EMAIL') ?? 'no-reply@worldcapp.vercel.app'
const BREVO_SENDER_NAME   = Deno.env.get('BREVO_SENDER_NAME')  ?? 'WorldCapp'
const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL             = Deno.env.get('APP_URL') ?? 'https://worldcapp.vercel.app'

serve(async (req) => {
  try {
    const payload = await req.json()
    const record  = payload.record   // fila de intercambios recién insertada

    if (!record?.receptor_id || !record?.solicitante_id) {
      return new Response('missing fields', { status: 400 })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

    const [{ data: receptorData }, { data: solicitanteData }] = await Promise.all([
      admin.auth.admin.getUserById(record.receptor_id),
      admin.auth.admin.getUserById(record.solicitante_id),
    ])

    const receptor    = receptorData?.user
    const solicitante = solicitanteData?.user
    if (!receptor?.email) return new Response('receptor not found', { status: 404 })

    const receptorNombre = receptor.user_metadata?.name ?? receptor.email.split('@')[0]
    const solicitanteNombre =
      solicitante?.user_metadata?.name ??
      solicitante?.email?.split('@')[0]  ??
      'Un coleccionista'

    if (!BREVO_API_KEY) {
      console.warn('BREVO_API_KEY no configurada — email omitido')
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: receptor.email, name: receptorNombre }],
        subject: `${solicitanteNombre} te envió una solicitud de intercambio`,
        htmlContent: buildEmailHtml(solicitanteNombre, APP_URL),
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

function buildEmailHtml(solicitanteNombre: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Nueva solicitud de intercambio</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:system-ui,sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;
              overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

    <!-- Encabezado -->
    <div style="background:#1a4d2e;padding:28px 32px;text-align:center">
      <p style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px">
        WorldCapp &#127183;
      </p>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:13px">
        FIFA World Cup 2026&#8482;
      </p>
    </div>

    <!-- Cuerpo -->
    <div style="padding:32px">
      <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a1a">
        Nueva solicitud de intercambio
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6">
        <strong style="color:#1a1a1a">${solicitanteNombre}</strong> quiere intercambiar
        l&#225;minas contigo. Acepta la solicitud para ver qu&#233; repetidas pueden
        ofrecerse mutuamente.
      </p>

      <a href="${appUrl}/intercambios"
         style="display:inline-block;background:#1a4d2e;color:#fff;
                padding:13px 28px;border-radius:8px;font-size:14px;
                font-weight:700;text-decoration:none">
        Ver solicitud en WorldCapp
      </a>
    </div>

    <!-- Pie -->
    <div style="padding:16px 32px 24px;border-top:1px solid #f0ebe4">
      <p style="margin:0;font-size:11px;color:#aaa;text-align:center;line-height:1.5">
        Recibes este correo porque alguien te envi&#243; una solicitud de intercambio
        en WorldCapp. Si no reconoces esta solicitud, puedes ignorar este mensaje.
      </p>
    </div>

  </div>
</body>
</html>`
}
