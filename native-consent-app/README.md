# Consentimiento Nativo (copia por empresa)

## Importante RGPD
Esta versión está pensada para que **NO tengas datos de terceros**:
- Tú envías el paquete a cada empresa.
- Cada empresa instala su propia copia.
- Cada empresa guarda sus datos en su propio `data.db`.
- Tú no necesitas acceso a su base de datos.

## Qué hace
- Formulario público de alta: `/`
- Formulario público de baja: `/baja`
- Panel privado de esa empresa: `/admin`
- Exportación CSV: `/export.csv`

## Instalación para cada empresa (copia independiente)
1. Copiar carpeta `native-consent-app` en su servidor/PC.
2. Crear entorno e instalar:
   - `python3 -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
3. Definir variables de entorno mínimas:
   - `COMPANY_NAME="Nombre Empresa"`
   - `ADMIN_PASSWORD="ClaveFuerte"`
   - `SECRET_KEY="clave-larga-aleatoria"`
4. Ejecutar: `python app.py`
5. Abrir:
   - Formulario: `http://127.0.0.1:5001/`
   - Panel: `http://127.0.0.1:5001/admin`

## Despliegue cloud rápido (sin tocar código)
### Render
- Este repo incluye `render.yaml` listo.
- En Render: **New + > Blueprint** y conecta el repositorio.
- Se desplegará usando `gunicorn` automáticamente.

### Railway
- Este repo incluye `railway.json` listo.
- En Railway: **New Project > Deploy from GitHub Repo**.

### Docker
- Incluye `Dockerfile` listo para cualquier hosting de contenedores.

## Entrega a tus alumnos/clientes
Envíales el ZIP de `native-consent-app` y estas 5 líneas.
Cada uno tendrá su instalación y sus datos, separados.
