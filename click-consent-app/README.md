# Click & Consent App (Apps Script)

Aplicación mínima para recoger:
- aceptación legal (obligatoria)
- consentimiento comercial (opcional)
- baja/revocación

y guardar todo en Google Sheets.

## Archivos
- `codigo.gs`
- `index.html`
- `baja.html`
- resto de vistas legales HTML

## Instalación rápida
1. Crear hoja de cálculo en Google Sheets.
2. Abrir Extensiones → Apps Script.
3. Pegar `codigo.gs` y crear los HTML (sin `.html` en el nombre).
4. Reemplazar en `codigo.gs` el `SHEET_ID`.
5. Ejecutar `setupSheet` una vez.
6. Implementar como Aplicación web (`/exec`, acceso `Cualquiera`).

## URLs
- Principal: `.../exec`
- Baja: `.../exec?page=baja`
- Legales: `.../exec?page=terminos`, `.../exec?page=privacidad`, etc.
