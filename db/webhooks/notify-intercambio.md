# Webhook: notify-intercambio

Dispara la Edge Function `notify-intercambio` cada vez que se inserta
una fila en `public.intercambios`, enviando un email al receptor.

## Pasos de configuración en Supabase

### 1. Desplegar la Edge Function

```bash
supabase functions deploy notify-intercambio
```

O desde el panel: **Edge Functions → Deploy**.

### 2. Configurar variables de entorno

En **Supabase → Settings → Edge Functions → Secrets**:

| Variable        | Valor                                      |
|-----------------|--------------------------------------------|
| `RESEND_API_KEY` | Clave de API de [resend.com](https://resend.com) |
| `APP_URL`        | URL pública de la app (ej: `https://worldcapp.vercel.app`) |

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se inyectan automáticamente.

### 3. Crear el Database Webhook

En **Supabase → Database → Webhooks → Create a new hook**:

| Campo            | Valor                                                   |
|------------------|---------------------------------------------------------|
| Name             | `notify-intercambio`                                    |
| Table            | `public.intercambios`                                   |
| Events           | `INSERT`                                                |
| Type             | `Supabase Edge Functions`                               |
| Edge Function    | `notify-intercambio`                                    |

### 4. Verificar dominio en Resend (producción)

En el plan gratuito de Resend puedes enviar desde `onboarding@resend.dev`
durante las pruebas. Para producción, verifica tu dominio en
**Resend → Domains** y actualiza el campo `from` en la Edge Function.
