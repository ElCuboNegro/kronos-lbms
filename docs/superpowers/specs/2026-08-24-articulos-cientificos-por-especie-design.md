# Artículos científicos por especie — Diseño

**Fecha:** 2026-08-24
**Autor:** Juan José Alban (con Claude Code)
**Estado:** Aprobado (diseño)

## Objetivo

Que la plataforma **le aporte conocimiento** a la científica: al abrir una especie, recomendar automáticamente **artículos científicos revisados por pares** relevantes a esa especie y a las técnicas de cultivo in vitro. Nace de la retroalimentación: "entro y no me aporta nada para ningún experimento".

Esta es la **primera de dos piezas** acordadas (la segunda, un panel de diagnóstico de sus datos, va después). Es un proyecto independiente con su propio ciclo spec → plan → implementación.

## Alcance

**Incluye:**
- Pestaña **"Artículos"** en la ficha de cada especie (junto a Ficha / Líneas / Experimentos / Protocolos).
- Búsqueda automática por **nombre científico de la especie** + términos de técnica in vitro (germinación, desinfección, micropropagación, cultivo de tejidos).
- Campo para **afinar** la búsqueda (agregar/quitar palabras clave).
- Cada resultado (tarjeta): **título original**, **mini-resumen en español** (por qué sirve), autores, año, revista, y **enlace al artículo (DOI)**.
- **Caché por especie** para no repetir la consulta en cada visita.

**No incluye (YAGNI, se puede después):**
- Biblioteca personal / guardar favoritos / exportar citas (BibTeX).
- Búsqueda por tema libre desligada de una especie.
- Recomendación "ligada al problema" (depende del panel de diagnóstico, pieza 2).
- Scopus / ScienceDirect (requieren suscripción de pago; la usuaria no tiene clave).

## Fuentes de datos

Sólo **fuentes abiertas** (sin clave de pago):
- **Europe PMC** — REST abierta, ciencias de la vida, devuelve abstract. Fuente principal.
- **SciELO** — ciencia iberoamericana en español/portugués (pedido explícito de la usuaria).
- *(Ampliables luego: OpenAlex, Semantic Scholar, Crossref para resolver DOI.)*

Nota: aunque no se consulten Scopus/ScienceDirect directamente, los papers publicados en revistas de Elsevier igual aparecen vía estos índices, con su enlace/DOI (el texto completo puede requerir suscripción).

**Seguridad:** a las fuentes externas sólo se envían **términos genéricos** (nombre científico + técnica), nunca datos privados del laboratorio. Alineado con las políticas de la organización (tratar la info del lab como confidencial; preferir ejemplos genéricos).

## Resumen en español (IA)

El mini-resumen en español lo genera un modelo de IA (Claude API) a partir del título+abstract original.

**Degradación elegante:** si no hay clave de IA configurada en el despliegue, la tarjeta muestra el **abstract original** (normalmente inglés) y omite el resumen en español — la funcionalidad **no se rompe**. La clave de IA la gestiona quien despliega, **fuera del chat** (por seguridad).

## Arquitectura

Reutiliza el patrón existente de enriquecimiento externo por especie (el endpoint de Wikipedia `GET /especies/{id}/wiki` en `backend/app/routers/especies.py`, que usa `httpx` async).

**Backend (FastAPI):**
- Nuevo **service** `article_service.py` (la lógica de consulta/normalización/dedup vive aquí, respeta import-linter): consulta cada fuente con `httpx` async, normaliza a un formato común, deduplica por DOI (y por título normalizado si falta DOI), y opcionalmente pide el resumen en español a la IA.
- Nuevo endpoint async `GET /especies/{id}/articulos?q=<keywords>` que delega en el service y devuelve una lista de artículos.
- Schema `ArticuloOut` (titulo, resumen_es, resumen_original, autores, anio, revista, doi, url, fuente).
- **Caché:** guardar el último resultado por especie (p. ej. en `Especie.ficha.articulos` + `articulos_fetched_at`, siguiendo el patrón wiki) para servir rápido y refrescar bajo demanda.

**Frontend (React):**
- Pestaña "Artículos" en la ficha de especie (`EspecieDetail`), consumiendo `api.get('/especies/{id}/articulos')`.
- Lista de tarjetas con el diseño acordado; botones "Ver resumen original" y "Abrir artículo" (enlace DOI); campo para afinar palabras clave.
- Estilos inline siguiendo la convención del proyecto (`const s = {...}`, paleta verde).

**Aislamiento y límites:** el `article_service` no conoce de HTTP/rutas (recibe términos, devuelve datos); el router es delgado; cada fuente externa se adapta en su propia función normalizadora → se puede probar y ampliar sin tocar el resto.

## Manejo de errores

- Si una fuente falla o tarda (timeout ~8s como en wiki), se omite y se sirven las demás (no se cae toda la búsqueda).
- Si ninguna fuente devuelve resultados: mensaje claro "sin artículos por ahora, prueba afinar la búsqueda".
- Si la IA falla o no hay clave: se muestra el original sin resumen en español.

## Pruebas (BDD primero, según convención del proyecto)

- `.feature` en `docs/features/` describiendo: buscar artículos por especie, afinar por palabra clave, degradación sin IA, y tolerancia a fuente caída.
- Step defs con `pytest-bdd` en `backend/tests/step_defs/`, contra la API, con las fuentes externas **simuladas** (mock httpx) para no depender de internet en las pruebas.
- Correr contra `lbms_test` (nunca la BD viva).

## Criterio de éxito

Abrir una especie (p. ej. Coriandro) → pestaña "Artículos" → ver una lista de papers reales, con su enlace, y un mini-resumen en español que le diga a la científica de qué trata y por qué le sirve.
