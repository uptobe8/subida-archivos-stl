# Juego educativo: Digitalización con IA (2026)

Este proyecto contiene un videojuego educativo offline para aprender a elegir canales, herramientas y estrategias de marketing digital según el sector (B2B, B2C, educación, bienes raíces, salud, restauración), basado en el plan proporcionado.

## Requisitos

No requiere dependencias externas ni conexión a internet.

## Ejecución local

### Opción 1 (recomendada): abrir directamente
1. Entra a la carpeta `game/`.
2. Abre `index.html` con cualquier navegador moderno (Chrome, Firefox, Edge, Safari).

### Opción 2: servidor local simple (opcional)
Si prefieres servirlo por HTTP:

```bash
python3 -m http.server 8000
```

Luego abre: `http://localhost:8000/game/`

## Estructura

- `game/index.html`: interfaz principal del juego.
- `game/styles.css`: estilos visuales.
- `game/data/plan_data.json`: datos estructurados del plan (sectores, canales, herramientas, estrategias y misiones).
- `game/js/game.js`: lógica del juego, puntuación, niveles, insignias y feedback.
- `start.sh`: script de arranque para Linux/macOS.
- `start.bat`: script de arranque para Windows.
- `scripts/crear_zip.sh`: script para generar el archivo comprimido de entrega sin versionar binarios en Git.

## Mecánicas del juego

1. El alumno elige un sector.
2. Completa misiones con decisiones múltiples:
   - canal principal,
   - herramienta recomendada,
   - estrategia de captación/contacto,
   - implementación responsable de IA.
3. Recibe retroalimentación inmediata en cada decisión.
4. Obtiene puntuación por coherencia con el plan.
5. Desbloquea nivel e insignias según rendimiento.

## Gamificación

- **Puntuación máxima por partida:** 400 puntos.
- **Niveles:**
  - Novato Digital
  - Practicante Estratégico
  - Arquitecto de Embudos
  - Maestro de IA Responsable
- **Insignias:**
  - Selector de Canales
  - Automatizador
  - Conversión Efectiva
  - IA Responsable

## Scripts de arranque multiplataforma

- Linux/macOS: `./start.sh`
- Windows: `start.bat`

Ambos inician un servidor local y abren la ruta del juego.


## Generar ZIP de entrega (sin versionar binarios)

Para evitar errores de `pull` en entornos que bloquean binarios, el ZIP no se guarda en Git.
Genera el paquete cuando lo necesites:

```bash
./scripts/crear_zip.sh
```

Se creará: `dist/entrega-juego-digitalizacion-ia-2026.zip`.


## Publicar en GitHub Pages

Este repositorio incluye el workflow `.github/workflows/deploy-pages.yml` que publica automáticamente el contenido de `game/` en GitHub Pages.

Pasos:
1. Sube este repo a GitHub.
2. Ve a **Settings → Pages** y selecciona **GitHub Actions** como fuente.
3. Haz push a `main`, `master` o `work` (o ejecuta el workflow manualmente).
4. La URL pública aparecerá en la ejecución del workflow.
