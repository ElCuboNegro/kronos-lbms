# Kronos BioLabs - LBMS (Laboratory Biological Management System)

LBMS es un sistema integral de gestión de laboratorio diseñado para automatizar, trazar y controlar los procesos de micropropagación in vitro, formulación química y trazabilidad biológica de Kronos BioLabs.

## 🚀 Características Principales

- **Gestión Botánica Avanzada:** Trazabilidad de especies, líneas genéticas, variegaciones y parentescos (Árbol genealógico).
- **Recetario Químico (Formulaciones):** Motor de cálculo para medios de cultivo (ej. MS Basal) y soluciones stock de fitohormonas (ANA, BAP). Soporta reactivos puros y soluciones híbridas.
- **Control de Inventarios y Lotes:** Registro de lotes de laboratorio con control estricto de fechas de fabricación, vencimiento y niveles de pureza/concentración.
- **Motor de Impresión Térmica:** Integración nativa con impresoras de etiquetas (ej. GEZI) para generar automáticamente etiquetas físicas con códigos QR/Barras, advertencias de bioseguridad, y metadatos técnicos. Posee dos formatos: etiqueta completa (reactivos/medios) y etiqueta doblable (banderas para estacas biológicas).
- **Escáner Integrado:** Lector de QR y códigos de barras (1D) directamente desde la aplicación web progresiva (PWA) para identificar individuos, reactivos, o contenedores físicos al instante.
- **Agrupación en Contenedores:** Interfaz *Drag & Drop / Scan* para mover múltiples especímenes a un único contenedor físico (ej. un frasco con múltiples clones).
- **Protocolos y Timers Globales:** Documentación de Standard Operating Procedures (SOPs) y temporizadores persistentes para controlar autoclaves, fotoperiodos y microcirugía.

## 🛠 Stack Tecnológico

- **Frontend:** React (Vite), Interfaz "Biological Dark Mode" optimizada para móviles (PWA).
- **Backend:** Python (FastAPI), SQLAlchemy (ORM).
- **Base de Datos:** PostgreSQL 16 con migraciones gestionadas por Alembic.
- **Despliegue:** Docker, Docker Compose, Nginx y Caddy Reverse Proxy.
- **CI/CD:** GitHub Actions.

## 🐳 Despliegue Local (Desarrollo)

Asegúrate de tener Docker y Docker Compose instalados.

1. Clona el repositorio.
2. Copia el archivo de entorno: `cp .env.example .env` (y configura tus variables).
3. Levanta los servicios:
   ```bash
   docker compose up -d --build
   ```
4. Aplica las migraciones de la base de datos:
   ```bash
   docker compose exec backend alembic upgrade head
   ```
5. Accede a la plataforma web en `http://localhost` (o el puerto configurado).

## 🌍 Continuous Delivery (CI/CD)

El proyecto cuenta con un flujo de trabajo de GitHub Actions (`.github/workflows/deploy.yml`) que despliega automáticamente a un VPS al hacer push a la rama `master` o `main`.

**Secretos requeridos en GitHub:**
- `VPS_HOST`: Dominio o IP del servidor (ej. `vps.kronosb.com`).
- `VPS_USER`: Usuario SSH (ej. `root`).
- `VPS_SSH_KEY`: Llave privada SSH con acceso al servidor.

El tráfico en producción está orquestado detrás de un servidor **Caddy**. El frontend interno se expone en el puerto `8081` para que el proxy inverso lo encamine de forma segura mediante HTTPS.

---
**Kronos Biotech S.A.S. - 2026**
