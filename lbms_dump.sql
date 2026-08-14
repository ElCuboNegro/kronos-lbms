--
-- PostgreSQL database dump
--

\restrict r8m68CF5hZq2kqNcAyfSQVCL7UllT449lHYaWmmu09dnoRHqSXhH63sJwyExtMa

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: lbms
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO lbms;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: lbms
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO lbms;

--
-- Name: elementos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.elementos (
    id uuid NOT NULL,
    element_id character varying(100) NOT NULL,
    tipo character varying(100) NOT NULL,
    descripcion character varying(500) NOT NULL,
    cantidad double precision,
    unidad character varying(30),
    estado character varying(30) NOT NULL,
    notas text,
    created_at timestamp without time zone
);


ALTER TABLE public.elementos OWNER TO lbms;

--
-- Name: especies; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.especies (
    id uuid NOT NULL,
    codigo character varying(10),
    nombre_cientifico character varying(255) NOT NULL,
    categoria character varying(30) DEFAULT 'especie'::character varying NOT NULL,
    nombre_comun character varying(255),
    familia character varying(100),
    genero character varying(100),
    descripcion text,
    requerimientos jsonb,
    config_estandar jsonb,
    ficha jsonb,
    created_at timestamp without time zone
);


ALTER TABLE public.especies OWNER TO lbms;

--
-- Name: especimenes; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.especimenes (
    id uuid NOT NULL,
    uid character varying(100) NOT NULL,
    contenedor_uid character varying(100),
    especie character varying(255) NOT NULL,
    especie_id uuid,
    linea_id uuid,
    variegacion_id uuid,
    madre_id uuid,
    padre_id uuid,
    lote_id uuid,
    fecha_ingreso date NOT NULL,
    origen character varying(255),
    coordenadas jsonb,
    indice integer,
    estado character varying(30) NOT NULL,
    notas text,
    created_at timestamp without time zone
);


ALTER TABLE public.especimenes OWNER TO lbms;

--
-- Name: eventos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.eventos (
    id uuid NOT NULL,
    tipo character varying(50) NOT NULL,
    descripcion text NOT NULL,
    especimen_id uuid,
    elemento_id uuid,
    experimento_id uuid,
    usuario_id uuid NOT NULL,
    ejecutado_por_id uuid,
    "timestamp" timestamp without time zone,
    meta jsonb
);


ALTER TABLE public.eventos OWNER TO lbms;

--
-- Name: experimento_elemento; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.experimento_elemento (
    experimento_id uuid NOT NULL,
    elemento_id uuid NOT NULL
);


ALTER TABLE public.experimento_elemento OWNER TO lbms;

--
-- Name: experimento_especimen; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.experimento_especimen (
    experimento_id uuid NOT NULL,
    especimen_id uuid NOT NULL,
    rol character varying(50)
);


ALTER TABLE public.experimento_especimen OWNER TO lbms;

--
-- Name: experimentos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.experimentos (
    id uuid NOT NULL,
    codigo character varying(50),
    nombre character varying(255) NOT NULL,
    hipotesis text,
    protocolo_id uuid,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    estado character varying(30) NOT NULL,
    director_id uuid NOT NULL,
    operador_id uuid,
    especie_id uuid,
    linea_id uuid,
    variegacion_id uuid,
    config_estandar jsonb,
    notas text,
    created_at timestamp without time zone
);


ALTER TABLE public.experimentos OWNER TO lbms;

--
-- Name: formulacion_componentes; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.formulacion_componentes (
    id uuid NOT NULL,
    formulacion_id uuid,
    reactivo_id uuid,
    formulacion_ingrediente_id uuid,
    cantidad_base double precision NOT NULL,
    notas_pesaje text
);


ALTER TABLE public.formulacion_componentes OWNER TO lbms;

--
-- Name: formulaciones; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.formulaciones (
    id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo_referencia character varying(50),
    descripcion text,
    procedimiento text,
    volumen_base_l double precision,
    caducidad_dias integer,
    created_at timestamp without time zone
);


ALTER TABLE public.formulaciones OWNER TO lbms;

--
-- Name: lineas; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.lineas (
    id uuid NOT NULL,
    especie_id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    metodo_propagacion character varying(50) DEFAULT 'desconocido'::character varying NOT NULL,
    descripcion text,
    config_estandar jsonb,
    notas text,
    created_at timestamp without time zone
);


ALTER TABLE public.lineas OWNER TO lbms;

--
-- Name: lotes_preparados; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.lotes_preparados (
    id uuid NOT NULL,
    uid character varying(100) NOT NULL,
    formulacion_id uuid,
    preparado_por_id uuid,
    fecha_preparacion timestamp without time zone,
    fecha_expiracion timestamp without time zone,
    volumen_l double precision NOT NULL,
    concentracion_x double precision,
    ph_final double precision,
    trazabilidad_reactivos jsonb,
    estado character varying(30),
    notas text
);


ALTER TABLE public.lotes_preparados OWNER TO lbms;

--
-- Name: protocolos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.protocolos (
    id uuid NOT NULL,
    codigo character varying(50),
    nombre character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    version character varying(20) NOT NULL,
    descripcion text,
    pasos jsonb NOT NULL,
    materiales jsonb,
    estado_validacion character varying(30) NOT NULL,
    creado_por_id uuid NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.protocolos OWNER TO lbms;

--
-- Name: reactivos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.reactivos (
    id uuid NOT NULL,
    codigo_barras character varying(255),
    nombre character varying(255) NOT NULL,
    formula_quimica character varying(255),
    marca character varying(100),
    pureza_pct double precision,
    concentracion_gl double precision,
    fecha_expiracion date,
    unidad_medida character varying(20),
    peligrosidad jsonb,
    notas text,
    created_at timestamp without time zone
);


ALTER TABLE public.reactivos OWNER TO lbms;

--
-- Name: registros_evolucion; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.registros_evolucion (
    id uuid NOT NULL,
    especimen_id uuid NOT NULL,
    registrado_por_id uuid NOT NULL,
    protocolo_clonacion_id uuid,
    fecha timestamp without time zone,
    altura_cm double precision,
    ancho_hoja_max_cm double precision,
    largo_hoja_max_cm double precision,
    num_hojas integer,
    num_brotes integer,
    num_hijuelos integer,
    num_nodos integer,
    diametro_tallo_mm double precision,
    porcentaje_variegacion double precision,
    patron_variegacion character varying(50),
    color_variegacion character varying(50),
    sustrato character varying(100),
    sustrato_id uuid,
    tipo_contenedor character varying(50),
    diametro_contenedor_cm double precision,
    temperatura_c double precision,
    humedad_relativa_pct double precision,
    humedad_sustrato_pct double precision,
    ph_sustrato double precision,
    luz_lux double precision,
    conductividad_ec double precision,
    npk character varying(50),
    ppm double precision,
    fotos jsonb,
    notas text
);


ALTER TABLE public.registros_evolucion OWNER TO lbms;

--
-- Name: resultados_investigacion; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.resultados_investigacion (
    id uuid NOT NULL,
    experimento_id uuid NOT NULL,
    titulo character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    descripcion text NOT NULL,
    datos jsonb,
    archivos jsonb,
    registrado_por_id uuid NOT NULL,
    fecha timestamp without time zone
);


ALTER TABLE public.resultados_investigacion OWNER TO lbms;

--
-- Name: sustratos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.sustratos (
    id uuid NOT NULL,
    codigo_formulacion character varying(50) NOT NULL,
    tipo character varying(50) DEFAULT 'sustrato'::character varying NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    componentes jsonb,
    ph_teorico double precision,
    conductividad_teorica double precision,
    formulacion_id uuid,
    lote_id uuid,
    created_at timestamp without time zone
);


ALTER TABLE public.sustratos OWNER TO lbms;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying NOT NULL,
    rol character varying(20) NOT NULL,
    activo boolean,
    foto_url character varying(500),
    created_at timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO lbms;

--
-- Name: validaciones_protocolo; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.validaciones_protocolo (
    id uuid NOT NULL,
    protocolo_id uuid NOT NULL,
    experimento_id uuid,
    usuario_id uuid NOT NULL,
    resultado character varying(20) NOT NULL,
    observaciones text NOT NULL,
    metricas jsonb,
    fecha timestamp without time zone
);


ALTER TABLE public.validaciones_protocolo OWNER TO lbms;

--
-- Name: variegaciones; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.variegaciones (
    id uuid NOT NULL,
    linea_id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo character varying(10),
    descripcion text,
    config_estandar jsonb,
    notas text,
    created_at timestamp without time zone
);


ALTER TABLE public.variegaciones OWNER TO lbms;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.alembic_version (version_num) FROM stdin;
e1a2b3c4d5e6
\.


--
-- Data for Name: elementos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.elementos (id, element_id, tipo, descripcion, cantidad, unidad, estado, notas, created_at) FROM stdin;
\.


--
-- Data for Name: especies; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.especies (id, codigo, nombre_cientifico, categoria, nombre_comun, familia, genero, descripcion, requerimientos, config_estandar, ficha, created_at) FROM stdin;
0794a1fb-8331-4f6a-8099-4b179f1c567d	SYNG	Syngonium podophyllum	especie	Singonio	Araceae	Syngonium	Planta Cabeza de Flecha. Hemiepífita trepadora tropical.	{"ph": "5.5 - 6.5", "luz": "Luz brillante indirecta", "riego": "Sustrato ligeramente húmedo", "humedad": "60% - 80%", "sustrato": "Aroid mix (fibra de coco, pino, perlita, humus)", "toxicidad": "Contiene oxalatos de calcio. Mantener lejos de mascotas (Cronos).", "temperatura": "18°C - 28°C"}	{"luz_lux": 2000.0, "sustrato": "Aroid Mix", "ph_sustrato": 6.0, "temperatura_c": 23.0, "humedad_relativa_pct": 70.0}	\N	2026-04-28 06:31:03.567653
e179b89f-6c04-4507-99d6-dfb26a5f6b78	MOSS	Sphagnum magellanicum	especie	Musgo	Araceae	Monstera	Sphagnum magellanicum es una especie de musgo de la familia Sphagnaceae. Es endémica de Argentina, Chile y Perú. Su hábitat natural son las turberas y humedales.	{"ph": "pH de 4.2 y 4.8.", "luz": "50 µmol m⁻² s⁻¹ de radiación fotosintéticamente activa (PAR)", "humedad": "98 ± 1%.", "sustrato": "Oligotrófico y saturado de agua", "temperatura": "4 a 19 °C"}	{"luz_lux": 500.0, "sustrato": "Sphagnum saturado", "ph_sustrato": 4.5, "temperatura_c": 11.0, "humedad_relativa_pct": 98.0}	{"wiki_url": "https://es.wikipedia.org/wiki/Sphagnum_magellanicum", "wiki_lang": "es", "ciclo_vida": "Posee una alternancia de generaciones heteromorfas donde la fase del gametofito (haploide) es perenne y dominante. La germinación inicia cuando las esporas logran romper latencia (requiriendo aportes puntuales de fósforo), dando origen a un protonema juvenil de aspecto taloide o laminar que se adhiere mediante rizoides multicelulares. Durante el crecimiento vegetativo, madura hacia el gametóforo adulto (tallo, ramas esparcidas y ramas colgantes), perdiendo los rizoides y basando su absorción en capilaridad a través de poros e hialocistos muertos. Al ser una briófita no tiene floración, pero produce órganos sexuales (arquegonios femeninos y anteridios masculinos); tras una fecundación dependiente de una película de agua, se inicia la fructificación o fase esporofítica. El esporofito forma una cápsula esférica que, al madurar (finales de primavera), se torna oscura y es elevada por el pseudopodio del tejido materno, expulsando explosivamente sus esporas haploides. Su propagación dominante, no obstante, es clónica a través de ramificaciones, fragmentación o gemas de resistencia en casos de estrés por hongos.", "maduracion": "A nivel celular, la maduración del estrato vegetativo se consolida cuando las células hialinas (hialocistos) completan una muerte celular programada constructiva, vaciando su citoplasma y desarrollando paredes secundarias macizas que les permiten almacenar masivamente el agua. Bioquímicamente, el tejido maduro se tiñe cromáticamente a colores rojo-vinoso debido a la síntesis de esfagnorrubinas bajo alta radiación y bajas temperaturas; este pigmento actúa como termo-absorbedor. Agronómicamente, el indicador de madurez técnica para realizar el corte de cosecha ocurre cuando la descomposición natural en la base húmeda iguala o se aproxima a la tasa de nueva producción verde en la cima del dosel. Legal y ecológicamente, tras una recolección comercial, los indicadores de recuperación (madurez para re-ingreso) toman rangos moratorios que van desde los 12 años en ecosistemas dinámicos y cálidos hasta 85 años estrictos en hábitats periglaciares polares.", "wiki_titulo": "Sphagnum magellanicum", "notas_cultivo": "— En la siembra al aire libre sobre turba nivelada, se debe esparcir obligatoriamente un mantillo de paja suelta protectora (al menos 3000 kg/ha) con un espesor menor a 3 cm; esto amortigua la temperatura y evita la desecación sin bloquear el umbral de luz asimilatoria.\\n— Está absolutamente prohibido superponer lona o mallas geotextiles directamente a ras de suelo sobre el musgo recién sembrado; retienen la humedad hasta colapsar el intercambio gaseoso y pudren el cultivo por anoxia fulminante (es mejor usar sombra en mallas altas aéreas).\\n— Para cultivo y propagación biotecnológica in vitro en vivero, el uso de cultivos líquidos agitados en biorreactores enriquecidos con sacarosa y nitrato de amonio genera tasas asombrosas que multiplican la biomasa de 10 a 30 veces en tan solo 4 semanas.\\n— En extracción de turberas, jamás se debe cosechar en verano (se agrava el estrés hídrico de la planta en la sequía).\\n— Práctica de resiembra obligatoria: Es imperativo no arrancar las hierbas co-estructurales (como Juncus procerus) que le brindan anclaje al tejido. Asimismo, al finalizar la cosecha mecánica o manual, se deben dejar fragmentos como piso residual (mínimo el 30%) y re-esparcir las partes apicales de las hierbas cortadas alisándolas contra el sustrato para reanudar succión hídrica rápida y acortar hasta un año la regeneración clonal.", "wiki_fetched_at": "2026-04-28T05:26:15.343Z"}	2026-04-28 03:17:07.561093
ce8f5267-3380-407b-9722-2aa9c18b55c3	NPNTH	Nepenthes Khasiensis x ventricosa x maxima	especie	St Gaya	\N	\N	\N	{"ph": "4.5 - 5.5 (ligeramente ácido)", "luz": "15,000 - 30,000 lux. Brillante pero indirecta o filtrada. Sol directo quema hojas; luz insuficiente detiene producción de jarros", "notas": "Prohibido fertilizantes convencionales en sustrato (queman raíces). Nutrición mediante insectos atrapados en los jarros", "riego": "Solo agua destilada, ósmosis inversa o lluvia (TDS < 50 ppm). Siempre húmedo, nunca encharcado. Buen drenaje, sin plato con agua estancada", "humedad": "60% - 80%+. A mayor humedad, mayor tamaño y durabilidad de las trampas", "sustrato": "Pobre en minerales, aireado y alta retención de humedad. Ideal: Sphagnum (50%) + Perlita (25%) + Corteza de pino/orquídea (25%)", "temperatura": "22°C - 28°C día / 15°C - 18°C noche (fluctuaciones térmicas favorecen formación de jarros)"}	{"luz_lux": 22000.0, "sustrato": "Sphagnum/Perlita/Corteza", "ph_sustrato": 5.0, "temperatura_c": 25.0, "humedad_relativa_pct": 75.0}	{"ciclo_vida": "Germinación: Lenta, 1-3 meses en alta humedad y luz filtrada.\\nCrecimiento vegetativo: Etapa prolongada con roseta basal y jarros inferiores (más redondeados, posados en suelo).\\nFase trepadora: El tallo se alarga formando enredadera y produce jarros superiores (más tubulares, para atrapar insectos voladores).\\nFloración: Plantas dioicas (machos y hembras). Producen inflorescencia en racimo simple.\\nFructificación: Solo con polinización cruzada entre macho y hembra, produciendo cápsulas que liberan semillas filiformes al secarse.", "maduracion": "Tiempo: 3 a 5 años desde semilla para alcanzar madurez sexual y fase trepadora.\\nIndicadores: Transición de roseta basal a crecimiento en liana (tallo alargado). Cambio en morfología de trampas (inferiores a superiores) y aparición de espiga floral.", "notas_cultivo": "Aclimatación: Muy susceptibles al estrés por cambios de ambiente. Normal que aborten jarros y detengan crecimiento las primeras semanas en un lugar nuevo.\\nLimpieza: Cortar hojas y jarros completamente secos (marrones) desde la base para evitar hongos.\\nRescate inicial: Lavado profundo de sustrato con agua destilada al adquirir de vivero, para eliminar acumulación de sales minerales del agua corriente."}	2026-04-28 05:32:47.59735
be25e0ef-afd7-42c9-845f-68dde2b5b79e	DARL	Darlingtonia californica	especie	Planta Cobra	Sarraceniaceae	Darlingtonia	Darlingtonia californica, conocida como Planta Cobra, es la única especie del género Darlingtonia. Planta carnívora nativa del norte de California y sur de Oregón. Vive en manantiales de agua fría con suelos oligotróficos y alta oxigenación.	{"ph": "4.5 - 5.5 (ácido)", "luz": "50,000 - 80,000 lux. Sol directo o semisombra muy brillante. Alta exposición indispensable para coloración rojiza y fenestraciones", "notas": "Extremadamente intolerante al calor radicular. Si el sustrato se calienta, raíces muy susceptibles a pudrición por patógenos", "riego": "Agua destilada, ósmosis inversa o lluvia (0-50 ppm). Riego superior con agua muy fría (cubitos de hielo destilados). Evitar bandeja si el agua se calienta", "humedad": "60% - 80% o superior. Ambiente muy húmedo y bien ventilado; evitar estancamiento del aire", "sustrato": "Sphagnum puro o mezcla con perlita y piedra pómez (1:1 o 2:1). Máxima oxigenación, CERO nutrientes ni fertilizantes", "temperatura": "Aire: 15°C - 25°C. CRÍTICO: raíces estrictamente bajo 20°C. Dormancia invernal: 0°C - 10°C"}	{"luz_lux": 65000.0, "sustrato": "Sphagnum/Pómez", "ph_sustrato": 5.0, "temperatura_c": 20.0, "humedad_relativa_pct": 75.0}	{"ciclo_vida": "Germinación: Requiere estratificación en frío (4-6 semanas en nevera) para romper latencia. Tras esto, germinación lenta de 3-8 semanas bajo luz brillante y alta humedad.\\nCrecimiento vegetativo: Primeros años producen hojas juveniles simples sin forma de cúpula. Crecimiento lento. En etapas posteriores desarrollan jarras tubulares adultas. Crecimiento activo en primavera y verano. Genera estolones subterráneos de los que brotan nuevos individuos (clones).\\nFloración: Ocurre en primavera, frecuentemente antes de que las jarras nuevas se abran. Produce flor única y péndula de tonos rojizos y verdosos al final de un tallo largo. El tallo alto separa a los polinizadores de las trampas.\\nFructificación: Tras polinización exitosa, se forma una cápsula erecta que al secarse se abre y dispersa cientos de semillas muy pequeñas.\\nDormancia: En invierno la planta detiene su crecimiento. Requiere 3-4 meses de frío para recuperar energía; sin este reposo se debilita y muere a largo plazo.", "maduracion": "Tiempo: 3-5 años desde semilla para alcanzar madurez y florecer. Con propagación vegetativa por división de estolones: 1-2 años.\\nIndicadores: Jarras grandes y robustas, cúpula bien definida con fenestraciones traslúcidas evidentes, apéndice bífido (\\"lengua\\") completamente desarrollado y capacidad anual de producir tallos florales.", "notas_cultivo": "Ventaja del microclima: En entornos de alta montaña o sabana con noches frías y días templados, el cultivo es más fácil; el riesgo fatal de sobrecalentamiento radicular disminuye sin equipos de refrigeración.\\nManejo de dormancia sin estaciones: Al carecer de inviernos bajo cero, inducir dormancia artificial: desenterrar el rizoma, aplicar fungicida preventivo a base de azufre, envolver en Sphagnum ligeramente húmedo y almacenar en refrigerador a 4°C-5°C durante 3-4 meses cada año.\\nOxigenación radicular: Las raíces necesitan flujo constante de agua fría y oxígeno. Usar macetas de red (hidroponía) dentro de macetas de cerámica porosa permite que la evaporación enfríe el cepellón y fomente circulación de aire en el sustrato."}	2026-04-28 06:10:42.147126
d815c9e0-7fbd-4420-8256-11af5e1a6e51	COTV	Cotyledon tomentosa subsp. ladismithiensis variegata	especie	Garrita de Oso	Crassulaceae	Cotyledon	Cotyledon tomentosa subsp. ladismithiensis variegata, conocida como Garrita de Oso, es una suculenta perenne de la familia Crassulaceae originaria del sur de África. Sus hojas carnosas cubiertas de tricomas blancos con uñas rojizas en las puntas son su rasgo más reconocible. En su forma variegada presenta zonas blanquecinas o amarillas por ausencia parcial de clorofila. De crecimiento lento y porte arbustivo.	{"ph": "6.0 - 7.0 (ligeramente ácido a neutro)", "luz": "4,000 - 6,000 lux. Sombra parcial o luz filtrada brillante. Alta luminosidad para mantener variegación; sol directo de mediodía puede quemar zonas blancas", "notas": "Los tricomas retienen agua si se riega por encima, facilitando hongos. Manipular con cuidado; hojas muy quebradizas", "riego": "Empapar y secar: regar solo cuando el sustrato esté completamente seco. En invierno reducir al mínimo (1 vez/mes o menos). Nunca mojar las hojas", "humedad": "30% - 50% (baja a moderada). El exceso junto con frío puede pudrir las hojas vellosas", "sustrato": "50% mineral (pómez, perlita, arena gruesa) + 50% orgánico (turba o fibra de coco). Excelente drenaje obligatorio", "temperatura": "18°C - 25°C. Tolera máximas de 30°C con buena ventilación. Sensible a heladas; evitar temperaturas menores a 5°C"}	{"luz_lux": 5000.0, "sustrato": "50/50 Mineral/Orgánico", "ph_sustrato": 6.5, "temperatura_c": 22.0, "humedad_relativa_pct": 40.0}	{"ciclo_vida": "Germinación: Lenta y errática (1-3 semanas). Semillas minúsculas que requieren luz para germinar.\\nCrecimiento vegetativo: Perenne de crecimiento lento, especialmente en forma variegada. Desarrolla tallos leñosos con el tiempo.\\nFloración: Primavera/verano. Produce tallos florales con flores acampanadas de color naranja a rojizo.\\nFructificación: Produce cápsulas pequeñas con semillas finas tras polinización.", "maduracion": "Tiempo: 2-5 años para alcanzar forma arbustiva madura.\\nIndicadores: Tallo marrón y lignificado. Las uñas en punta de hojas se tornan rojo intenso bajo estrés lumínico óptimo.", "notas_cultivo": "Propagación: Esquejes de tallo son más exitosos que por hoja (las hojas suelen pudrirse antes de enraizar).\\nManejo: Hojas muy quebradizas; manipular con cuidado.\\nFertilización: Solo en primavera con fertilizante bajo en nitrógeno.\\nSensibilidad: Si la planta se torna muy verde, necesita más luz (reversión de variegación por falta de luz)."}	2026-04-28 06:18:01.47856
77aed2f3-7ab0-4674-9e47-a0877200263b	LFUL	Lithops fulviceps	especie	Piedras Vivas	Aizoaceae	Lithops	Lithops fulviceps, conocida como Piedra Viva o Cactus Piedra, es una suculenta de la familia Aizoaceae nativa del sur de Africa. Su morfologia es una adaptacion evolutiva extrema llamada mimetismo criptico: imita piedras y guijarros para camuflarse de herbivoros. Cada planta consiste en un par de hojas fusionadas muy suculentas separadas por una fisura central. El patron de puntos oscuros sobre fondo ocre/pardo corresponde a celulas ricas en taninos que actuan como ventanas translucidas para conducir la luz hacia el interior donde ocurre la fotosintesis.	{"ph": "6.5 - 7.0 (neutro a ligeramente acido)", "luz": "10,000+ lux. Sol directo de la manana y sombra parcial en horas mas intensas de la tarde. Las ventanas en la parte superior conducen luz hacia el interior para la fotosintesis", "notas": "Ante la duda, NO riegues. Es mil veces mas facil matar un Lithops por exceso de agua que por sequia extrema. Usar macetas profundas (min 10 cm) para la raiz pivotante", "riego": "CERO agua durante la muda. Riego profundo cada 3-4 semanas solo en etapa activa (otono e inicio de primavera). Si hojas firmes: no regar. Si se arrugan ligeramente: es hora de regar", "humedad": "Muy baja (< 30%). Prosperan en ambientes aridos. Requieren excelente ventilacion en interiores para evitar pudricion fungica", "sustrato": "80-90% mineral (pomez, arena gruesa de silice, grava volcanica) + 10-20% organico (tierra para cactus sin cortezas). Macetas profundas minimo 10 cm por la raiz pivotante", "temperatura": "18°C - 30°C. Toleran frio nocturno hasta 5°C SOLO si el sustrato esta estrictamente seco. Evitar baja temperatura combinada con humedad en raices"}	{"luz_lux": 15000.0, "sustrato": "90% Mineral", "ph_sustrato": 6.8, "temperatura_c": 24.0, "humedad_relativa_pct": 25.0}	{"ciclo_vida": "Germinacion: Semillas como polvo. Germinan con alta humedad inicial, pero las plantulas deben pasar gradualmente a condiciones secas para evitar pudricion (damping-off).\\nCrecimiento vegetativo y Muda: A finales de invierno/primavera, un nuevo par de hojas emerge del centro de la fisura. Las hojas viejas se secan lentamente convirtiendose en costras de papel, transfiriendo agua y nutrientes al nuevo par. NO regar bajo ninguna circunstancia durante este proceso.\\nFloracion: Mediados o finales de otono. Flor tipo margarita (amarilla o blanca segun especie) emerge de la fisura central y se abre por las tardes.\\nFructificacion: Tras polinizacion cruzada, se forma una capsula higrocasica (solo se abre y libera semillas cuando llueve).", "maduracion": "Tiempo: 3-4 anos desde semilla para alcanzar madurez sexual y producir la primera flor.\\nIndicadores: En plantas maduras, durante la muda una cabeza (par de hojas) puede dividirse dando lugar a dos pares, formando gradualmente agrupaciones multicefalas con los anos.", "notas_cultivo": "Riego: Ante la duda, no riegues. El exceso de agua es la causa de muerte mas comun.\\nMuda: No arrancar hojas viejas aunque se vean feas. Dejar que la planta las reabsorba completamente.\\nLuz en interiores: Ubicar en ventana con mayor exposicion solar (orientacion este o norte preferible). Si empiezan a estirarse perdiendo su forma plana (etiolacion), necesitan mas luz urgentemente.\\nMaceta: Usar macetas profundas (minimo 10 cm) para la larga raiz pivotante principal."}	2026-04-28 06:25:58.59123
f68e7a6f-cbc9-464c-9d65-834f910de21a	CHLO	Chlorophytum comosum	especie	Cinta / Malamadre	Asparagaceae	Chlorophytum	\N	\N	\N	\N	2026-07-15 02:27:37.214872
0e217d16-59cf-49c1-950b-41b8ca80c308	CAFE	Coffea arabica 'Caturra'	cultivar	Café arábico Caturra	Rubiaceae	Coffea	\N	\N	\N	\N	2026-07-15 02:27:37.214872
923fae79-57da-4537-a95a-60dba8b59253	BEGO	Begonia cucullata	especie	Begonia de cera	Begoniaceae	Begonia	\N	\N	\N	\N	2026-07-15 02:27:37.214872
b06ceafd-8df0-480d-a81b-2b1a64541c15	PHAL	Phalaenopsis sp.	sp	Orquídea mariposa	Orchidaceae	Phalaenopsis	\N	\N	\N	\N	2026-07-15 03:45:20.026721
514ab0ac-e6c9-4c29-b196-680c78b0a97e	PIMT	Capsicum annuum	especie	Pimentón / Pimiento	Solanaceae	Capsicum	\N	\N	\N	\N	2026-07-24 03:25:50.639667
ac88c62b-909b-471f-a585-7adb236941d2	ZINN	Zinnia elegans	especie	Zinnia	Asteraceae	Zinnia	\N	\N	\N	\N	2026-07-29 02:56:48.344675
e994a941-3f7f-46b2-885b-d874bc40a6b4	BOCA	Antirrhinum majus	especie	Boca de dragón / Conejito	Plantaginaceae	Antirrhinum	\N	\N	\N	\N	2026-07-29 02:58:23.184838
1c6415ec-f735-4d0d-a742-cb15ad817323	SIEM	Xerochrysum bracteatum	especie	Siempreviva / Flor de paja	Asteraceae	Xerochrysum	Registrada por defecto como Xerochrysum bracteatum (strawflower). VERIFICAR: "siempreviva" también puede ser Sempervivum, Helichrysum u otras; corregir si aplica.	\N	\N	\N	2026-07-29 02:58:55.507179
baf05c4d-6439-4318-bc9f-684830d396e3	GITA	Zinnia elegans 'Gitana'	cultivar	Zinnia Gitana	Asteraceae	Zinnia	\N	\N	\N	\N	2026-07-29 03:03:59.310423
a3d17334-68f5-46f5-9eb0-2b7e978ca902	MOSB	Sinapis alba	especie	Mostaza blanca / amarilla	Brassicaceae	Sinapis	\N	\N	\N	\N	2026-08-11 03:28:02.760715
bf6c4bc3-524d-4939-b234-e889dec68cbe	CORI	Coriandrum sativum	especie	Cilantro / Coriandro	Apiaceae	Coriandrum	\N	\N	\N	\N	2026-08-14 02:27:00.809644
\.


--
-- Data for Name: especimenes; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.especimenes (id, uid, contenedor_uid, especie, especie_id, linea_id, variegacion_id, madre_id, padre_id, lote_id, fecha_ingreso, origen, coordenadas, indice, estado, notas, created_at) FROM stdin;
2d9eae3f-0093-40d3-83b3-76809074ffc4	GITA-260807-033754-002	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	2	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
cd27ad2d-b42f-47ce-bf27-14c19038bc8e	GITA-260807-033754-003	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	3	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
b829d795-b025-4d2a-b7db-c680d9393c38	GITA-260807-033754-004	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	4	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
ffee70c3-bcb9-4697-8b6b-e03e4fa62557	GITA-260807-033754-005	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	5	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
4fcb4832-e017-4e3d-b3c7-015973897517	GITA-260807-033754-006	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	6	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
379f171b-82e9-46ce-85e5-8acb680c1614	GITA-260807-033754-007	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	7	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
95fb0019-0c47-4d7d-bc60-2c0996e54211	GITA-260807-033754-008	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	8	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
202ea4e2-eb96-4de9-973f-c4f2d810e140	ZINN-260807-033753-001	\N	Zinnia elegans	ac88c62b-909b-471f-a585-7adb236941d2	36f8ba7e-c5ab-4e9b-94ec-0b4d50075161	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	1	activo	Frasco de germinacion - 2 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
53bb0e2d-1e30-4a83-9a9b-6ca4d5820fae	ZINN-260807-033753-002	\N	Zinnia elegans	ac88c62b-909b-471f-a585-7adb236941d2	36f8ba7e-c5ab-4e9b-94ec-0b4d50075161	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	2	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
8cc3967d-9b1b-47f1-9dde-9bf122a8308d	ZINN-260807-033753-003	\N	Zinnia elegans	ac88c62b-909b-471f-a585-7adb236941d2	36f8ba7e-c5ab-4e9b-94ec-0b4d50075161	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	3	activo	Frasco de germinacion - 2 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
d492ca17-1994-498b-be47-dec03026f0a2	GITA-260807-033754-001	\N	Zinnia elegans 'Gitana'	baf05c4d-6439-4318-bc9f-684830d396e3	1cfd615d-b0e1-4eeb-977f-7c02093487de	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-06	Semilla	null	1	activo	Frasco de germinacion - 4 semillas - MED-GERM-01	2026-08-07 03:12:31.68299
ba18c114-5b9e-4718-b852-d38810971b78	BOCA-260812-025404-001	\N	Antirrhinum majus	e994a941-3f7f-46b2-885b-d874bc40a6b4	\N	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-07	\N	null	1	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-12 02:18:43.784164
f6a385f4-3ec2-4211-93a0-f7b9010030a4	BOCA-260812-025404-002	\N	Antirrhinum majus	e994a941-3f7f-46b2-885b-d874bc40a6b4	\N	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-07	\N	null	2	activo	Frasco de germinacion - 6 semillas - MED-GERM-01	2026-08-12 02:18:43.784164
ab5d6d8f-5616-44ab-9673-1c41288f0edb	MOSB-260814-021226-001	\N	Sinapis alba	a3d17334-68f5-46f5-9eb0-2b7e978ca902	893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-13	Semilla	\N	1	activo	Frasco de germinacion - 70 semillas - MED-GERM-01	2026-08-14 02:12:26.433198
125ff480-216b-48ce-b2e0-b860c3147e9d	MOSB-260814-021226-002	\N	Sinapis alba	a3d17334-68f5-46f5-9eb0-2b7e978ca902	893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-13	Semilla	\N	2	activo	Frasco de germinacion - 74 semillas - MED-GERM-01	2026-08-14 02:12:26.433198
3a44eb6b-61e0-4585-b108-a1e965e8fa8d	MOSB-260814-021226-003	\N	Sinapis alba	a3d17334-68f5-46f5-9eb0-2b7e978ca902	893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-13	Semilla	\N	3	activo	Frasco de germinacion - 34 semillas - MED-GERM-01	2026-08-14 02:12:26.433198
a2ffeb89-4276-4764-919c-2072c368463d	MOSB-260814-021226-004	\N	Sinapis alba	a3d17334-68f5-46f5-9eb0-2b7e978ca902	893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-13	Semilla	\N	4	activo	Frasco de germinacion - 32 semillas - MED-GERM-01	2026-08-14 02:12:26.433198
20fac992-0f88-4b09-9cec-f838f25e74b4	MOSB-260814-021226-005	\N	Sinapis alba	a3d17334-68f5-46f5-9eb0-2b7e978ca902	893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-13	Semilla	\N	5	activo	Frasco de germinacion - 32 semillas - MED-GERM-01	2026-08-14 02:12:26.433198
25d8f8c1-88e1-4232-9ffc-dffd0ac73425	MOSB-260814-021226-006	\N	Sinapis alba	a3d17334-68f5-46f5-9eb0-2b7e978ca902	893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-13	Semilla	\N	6	activo	Frasco de germinacion - 34 semillas - MED-GERM-01	2026-08-14 02:12:26.433198
f9ab2786-0a4d-4498-b0e7-f970e56d0e16	CORI-260814-022700-001	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	1	activo	Frasco de germinacion - 10 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
82200479-8601-4ba0-aed0-18b91468734b	CORI-260814-022700-002	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	2	activo	Frasco de germinacion - 10 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
786cb64b-f411-45b0-9528-60892318cda4	CORI-260814-022700-003	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	3	activo	Frasco de germinacion - 7 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
4ec4d402-1d97-4d07-b170-ee1126e0cd2f	CORI-260814-022700-004	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	4	activo	Frasco de germinacion - 14 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
7735c69d-2422-4f8d-98ab-c300910083e7	CORI-260814-022700-005	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	5	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
7ebe2269-f652-4e33-ad7d-1def5429b5b8	CORI-260814-022700-006	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	6	activo	Frasco de germinacion - 11 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
c034e0aa-c4d6-4c95-a674-a813e600d905	CORI-260814-022700-007	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	7	activo	Frasco de germinacion - 11 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
bfa19edb-1729-4d4f-947d-49c291870969	CORI-260814-022700-008	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	8	activo	Frasco de germinacion - 6 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
ac0385c3-fa0f-450b-bc55-8ed82f7bcfa7	CORI-260814-022700-009	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	9	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
82c8ff89-5580-45ba-93f1-3f07ef212570	CORI-260814-022700-010	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	10	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
b20d9435-83fc-486b-9e07-d8ecf5303200	CORI-260814-022700-011	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	11	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
d362798c-9361-4124-8293-41aa5ee9a14f	CORI-260814-022700-012	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	12	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
e8725f4b-5f22-4fdf-85e0-20ddf0aebdde	CORI-260814-022700-013	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	13	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
e8c700b7-3849-40c8-a607-15e0d2a71a47	CORI-260814-022700-014	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	14	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
90a8a059-8dd2-42ac-a57e-925d8544e9a3	CORI-260814-022700-015	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	15	activo	Frasco de germinacion - 4 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
f082ab0c-0aa7-4e99-9bb5-c8beaabdeeab	CORI-260814-022700-016	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	16	activo	Frasco de germinacion - 5 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
d72a1433-8f6e-4277-bd05-e59584be6979	CORI-260814-022700-017	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	17	activo	Frasco de germinacion - 3 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
71540329-11fe-4007-b691-5e030101296a	CORI-260814-022700-018	\N	Coriandrum sativum	bf6c4bc3-524d-4939-b234-e889dec68cbe	95cd07c6-5436-4e6b-b296-40ffa9aa3e78	\N	\N	\N	9e77fe10-c6a3-4c3e-990a-639f4a230cde	2026-08-11	Semilla	\N	18	activo	Frasco de germinacion - 8 semillas - MED-GERM-01	2026-08-14 02:27:00.809644
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.eventos (id, tipo, descripcion, especimen_id, elemento_id, experimento_id, usuario_id, ejecutado_por_id, "timestamp", meta) FROM stdin;
a267b6bb-0100-49a4-87a2-8833a2e223a2	observacion	Revisión de rutina 10-ago-2026: sin reporte de contaminación. Cultivos sanos a la fecha.	\N	\N	7caad194-7a33-4727-87ff-09b5cd60fcc2	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-10 00:00:00	{"revision": "contaminacion", "resultado": "sin_contaminacion"}
17f21c55-c596-45a9-989f-1be44826924c	observacion	Revisión de rutina 10-ago-2026: sin reporte de contaminación. Cultivos sanos a la fecha.	\N	\N	34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-10 00:00:00	{"revision": "contaminacion", "resultado": "sin_contaminacion"}
a5cce012-f72d-48d8-a010-2644b9150551	observacion	Revisión día 8 (12-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	7caad194-7a33-4727-87ff-09b5cd60fcc2	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-12 00:00:00	{"dia": 8, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
d261a7bf-f3e5-4f3f-acca-74aa4bcb24db	sanitizacion	Desinfeccion de las SEMILLAS de zinnia con agua oxigenada (peroxido de hidrogeno) al 3%: 5 mL, aforado con agua hasta completar el volumen, dejado actuar 24 horas. Metodo tomado del youtuber "plants in jars".	\N	\N	7caad194-7a33-4727-87ff-09b5cd60fcc2	8cc2b2f5-da3a-4369-bec2-4194ff37d379	\N	2026-08-07 00:00:00	{"aforo": "agua hasta completar el volumen", "agente": "peroxido de hidrogeno (agua oxigenada)", "objetos": ["semillas"], "concentracion_pct": 3, "fuente_referencia": "youtuber: plants in jars", "volumen_agente_ml": 5, "tiempo_exposicion_horas": 24}
63268d65-4780-4bca-8be2-7441e037cd94	sanitizacion	Desinfeccion de las SEMILLAS de gitana con agua oxigenada (peroxido de hidrogeno) al 3%: 5 mL, aforado con agua hasta completar el volumen, dejado actuar 24 horas. Metodo tomado del youtuber "plants in jars".	\N	\N	34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	8cc2b2f5-da3a-4369-bec2-4194ff37d379	\N	2026-08-07 00:00:00	{"aforo": "agua hasta completar el volumen", "agente": "peroxido de hidrogeno (agua oxigenada)", "objetos": ["semillas"], "concentracion_pct": 3, "fuente_referencia": "youtuber: plants in jars", "volumen_agente_ml": 5, "tiempo_exposicion_horas": 24}
2219f764-4756-41ba-96f6-76656245c038	sanitizacion	Desinfeccion de las SEMILLAS de boca de dragon con el protocolo ya establecido DESINF-02 (Desinfeccion de semillas, base hipoclorito). Distinto al de zinnia/gitana. Nota: ajustar mas suave por semilla pequeña.	\N	\N	46049ce3-b84b-4a30-aa58-9336bc4ebf6a	8cc2b2f5-da3a-4369-bec2-4194ff37d379	\N	2026-08-07 00:00:00	{"nota": "ajustar mas suave por semilla pequeña", "objetos": ["semillas"], "protocolo_id": "c5736d6a-1ef3-49c5-8a73-8195518965cd", "protocolo_codigo": "DESINF-02"}
10b97f06-2bb8-49c7-85bd-5fd91058ff58	observacion	Revisión día 8 (12-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-12 00:00:00	{"dia": 8, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
7d5f5b79-dc1e-492e-af71-166e058fe18e	observacion	Revisión día 8 (12-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	46049ce3-b84b-4a30-aa58-9336bc4ebf6a	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-12 00:00:00	{"dia": 8, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
be78b93a-3794-438c-abb5-974c2d28b778	observacion	Revisión día 9 (13-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	7caad194-7a33-4727-87ff-09b5cd60fcc2	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-13 00:00:00	{"dia": 9, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
c4f91e34-8074-41c2-ab8e-1a4fdc0c9f97	observacion	Revisión día 9 (13-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-13 00:00:00	{"dia": 9, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
05a24395-c67f-4d2e-8d82-19ab1197f813	observacion	Revisión día 9 (13-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	46049ce3-b84b-4a30-aa58-9336bc4ebf6a	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-13 00:00:00	{"dia": 9, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
494819e6-e414-46ae-81eb-0a05115d6962	sanitizacion	Desinfeccion de las SEMILLAS de cilantro (coriandro) antes de la siembra del 11-ago-2026. Secuencia completa: (1) lavado con detergente, (2) alcohol/etanol al 70% por 60 s, (3) clorox (hipoclorito) al 2% de trabajo (producto 10% segun empaque, dilucion 1:5) + Tween por 5 min, (4) 3 enjuagues en agua destilada. Coincide con la familia DESINF (detergente -> etanol -> hipoclorito+Tween -> enjuagues).	\N	\N	b2a0a1c8-e4ab-4b02-9aab-419476620339	8cc2b2f5-da3a-4369-bec2-4194ff37d379	\N	2026-08-11 00:00:00	{"aditivo": "Tween", "agentes": ["hipoclorito (clorox)", "etanol (alcohol)"], "objetos": ["semillas"], "enjuagues": {"medio": "agua destilada", "numero": 3}, "secuencia": [{"paso": 1, "accion": "lavado", "agente": "detergente"}, {"paso": 2, "agente": "etanol (alcohol)", "tiempo_seg": 60, "concentracion_pct": 70}, {"paso": 3, "agente": "hipoclorito (clorox) + Tween", "tiempo_min": 5, "concentracion_trabajo_pct": 2}, {"paso": 4, "accion": "enjuague", "agente": "agua destilada", "repeticiones": 3}], "clorox_dilucion": "1:5 (1 parte clorox 10% + 4 de agua)", "clorox_tiempo_min": 5, "protocolo_familia": "DESINF-02", "alcohol_tiempo_seg": 60, "protocolo_completo": true, "alcohol_concentracion_pct": 70, "clorox_concentracion_trabajo_pct": 2, "clorox_concentracion_producto_pct": 10, "clorox_concentracion_producto_fuente": "empaque"}
c2f64248-87fe-40df-b43c-840786d8cf77	observacion	Revisión día 2 (13-ago-2026): sin contaminación; sin germinación aún. Frascos limpios.	\N	\N	b2a0a1c8-e4ab-4b02-9aab-419476620339	40a58428-7a27-4462-87f1-4d4f07443de9	\N	2026-08-13 00:00:00	{"dia": 2, "revision": "contaminacion+germinacion", "resultado": "sin_contaminacion", "germinacion": "sin_germinacion"}
\.


--
-- Data for Name: experimento_elemento; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.experimento_elemento (experimento_id, elemento_id) FROM stdin;
\.


--
-- Data for Name: experimento_especimen; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.experimento_especimen (experimento_id, especimen_id, rol) FROM stdin;
7caad194-7a33-4727-87ff-09b5cd60fcc2	53bb0e2d-1e30-4a83-9a9b-6ca4d5820fae	\N
7caad194-7a33-4727-87ff-09b5cd60fcc2	8cc3967d-9b1b-47f1-9dde-9bf122a8308d	\N
7caad194-7a33-4727-87ff-09b5cd60fcc2	202ea4e2-eb96-4de9-973f-c4f2d810e140	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	d492ca17-1994-498b-be47-dec03026f0a2	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	2d9eae3f-0093-40d3-83b3-76809074ffc4	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	4fcb4832-e017-4e3d-b3c7-015973897517	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	b829d795-b025-4d2a-b7db-c680d9393c38	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	cd27ad2d-b42f-47ce-bf27-14c19038bc8e	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	ffee70c3-bcb9-4697-8b6b-e03e4fa62557	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	379f171b-82e9-46ce-85e5-8acb680c1614	\N
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	95fb0019-0c47-4d7d-bc60-2c0996e54211	\N
46049ce3-b84b-4a30-aa58-9336bc4ebf6a	f6a385f4-3ec2-4211-93a0-f7b9010030a4	\N
46049ce3-b84b-4a30-aa58-9336bc4ebf6a	ba18c114-5b9e-4718-b852-d38810971b78	\N
b4065b21-0085-4a4c-b703-2bcd64b72204	ab5d6d8f-5616-44ab-9673-1c41288f0edb	\N
b4065b21-0085-4a4c-b703-2bcd64b72204	125ff480-216b-48ce-b2e0-b860c3147e9d	\N
b4065b21-0085-4a4c-b703-2bcd64b72204	3a44eb6b-61e0-4585-b108-a1e965e8fa8d	\N
b4065b21-0085-4a4c-b703-2bcd64b72204	a2ffeb89-4276-4764-919c-2072c368463d	\N
b4065b21-0085-4a4c-b703-2bcd64b72204	20fac992-0f88-4b09-9cec-f838f25e74b4	\N
b4065b21-0085-4a4c-b703-2bcd64b72204	25d8f8c1-88e1-4232-9ffc-dffd0ac73425	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	f9ab2786-0a4d-4498-b0e7-f970e56d0e16	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	82200479-8601-4ba0-aed0-18b91468734b	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	786cb64b-f411-45b0-9528-60892318cda4	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	4ec4d402-1d97-4d07-b170-ee1126e0cd2f	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	7735c69d-2422-4f8d-98ab-c300910083e7	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	7ebe2269-f652-4e33-ad7d-1def5429b5b8	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	c034e0aa-c4d6-4c95-a674-a813e600d905	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	bfa19edb-1729-4d4f-947d-49c291870969	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	ac0385c3-fa0f-450b-bc55-8ed82f7bcfa7	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	82c8ff89-5580-45ba-93f1-3f07ef212570	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	b20d9435-83fc-486b-9e07-d8ecf5303200	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	d362798c-9361-4124-8293-41aa5ee9a14f	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	e8725f4b-5f22-4fdf-85e0-20ddf0aebdde	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	e8c700b7-3849-40c8-a607-15e0d2a71a47	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	90a8a059-8dd2-42ac-a57e-925d8544e9a3	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	f082ab0c-0aa7-4e99-9bb5-c8beaabdeeab	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	d72a1433-8f6e-4277-bd05-e59584be6979	\N
b2a0a1c8-e4ab-4b02-9aab-419476620339	71540329-11fe-4007-b691-5e030101296a	\N
\.


--
-- Data for Name: experimentos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.experimentos (id, codigo, nombre, hipotesis, protocolo_id, fecha_inicio, fecha_fin, estado, director_id, operador_id, especie_id, linea_id, variegacion_id, config_estandar, notas, created_at) FROM stdin;
763e8dbf-ac0c-40f2-a9f3-2e454475d330	EXP-GERM-SIEM	Germinación in vitro — Siempreviva / Flor de paja (14 semillas)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-07-29	\N	planificado	40a58428-7a27-4462-87f1-4d4f07443de9	\N	1c6415ec-f735-4d0d-a742-cb15ad817323	\N	\N	{"medio": "MED-GERM-01", "n_semillas": 14, "protocolo_siembra": "SIEMB-01", "protocolo_desinfeccion": "DESINF-02"}	Experimento de germinación de semillas de flor. Desinfección: DESINF-02 (más suave). Siembra: SIEMB-01 en MED-GERM-01 (sin hormonas).	2026-07-29 03:08:38.163545
24aa6644-2223-4e8a-b71a-3c2ec44a7240	EXP-GERM-PIMT	Germinación in vitro — Pimentón (Capsicum annuum)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-08-06	\N	completado	40a58428-7a27-4462-87f1-4d4f07443de9	\N	514ab0ac-e6c9-4c29-b196-680c78b0a97e	\N	\N	{"medio": "MED-GERM-01", "propagacion": "solo semilla", "protocolo_siembra": "SIEMB-01", "protocolo_desinfeccion": "DESINF-02"}	Germinación de semillas de pimentón (propagación SOLO por semilla). Desinfección DESINF-02 (clorox 2% 10-15 min + 3-4 enjuagues). Siembra SIEMB-01 en MED-GERM-01 (sin hormonas).	2026-08-07 03:24:59.264002
1bc79743-23cc-4249-a38e-41269e0fcbf2	EXP-CAFE-MER	Inducción in vitro — Café (ápice/meristema) — factorial 8 tratamientos	\N	6bb08e7e-6ce9-4e49-845e-785e3cb6d7e7	2026-08-06	\N	planificado	40a58428-7a27-4462-87f1-4d4f07443de9	\N	0e217d16-59cf-49c1-950b-41b8ca80c308	\N	\N	{"medio": "MED-CAFE-01", "manejo": "1 semana en oscuridad; subcultivo cada 4-5 días", "explante": "ápice/meristema", "factorial": {"T1": "testigo BAP 0 / aux 0", "T2": "BAP 1000 µL", "T3": "BAP 1000 + ANA 100 µL", "T4": "BAP 1000 + ANA 500 µL", "T5": "BAP 1000 + AIA 100 µL", "T6": "BAP 1000 + AIA 500 µL", "T7": "BAP 2000 + ANA 100 µL", "T8": "BAP 2000 + AIA 100 µL"}, "pretratamiento": "ácido ascórbico 100 mg/L, remojo 15-30 min (fuera del medio)", "carbon_activado": false}	Factorial de inducción en MED-CAFE-01 (sin carbón activado). Explante: ápice/meristema. Pretratamiento: remojo 15-30 min en ácido ascórbico 100 mg/L (fuera del medio). Manejo: 1 semana en oscuridad para reducir pardeamiento, luego subcultivo cada 4-5 días. Hormonas por tratamiento (µL/L desde stock 1 mg/mL): T1 testigo (0/0); T2 BAP 1000; T3 BAP 1000+ANA 100; T4 BAP 1000+ANA 500; T5 BAP 1000+AIA 100; T6 BAP 1000+AIA 500; T7 BAP 2000+ANA 100; T8 BAP 2000+AIA 100.	2026-08-07 03:24:59.264002
3c410ae3-8862-462e-b7e4-377df558e57f	EXP-CAFE-VAR	Inducción in vitro — Café (vara floral, tallo raspado) — factorial 8 tratamientos	\N	6bb08e7e-6ce9-4e49-845e-785e3cb6d7e7	2026-08-06	\N	planificado	40a58428-7a27-4462-87f1-4d4f07443de9	\N	0e217d16-59cf-49c1-950b-41b8ca80c308	\N	\N	{"medio": "MED-CAFE-01", "manejo": "1 semana en oscuridad; subcultivo cada 4-5 días", "explante": "vara floral (tallo raspado)", "factorial": {"T1": "testigo BAP 0 / aux 0", "T2": "BAP 1000 µL", "T3": "BAP 1000 + ANA 100 µL", "T4": "BAP 1000 + ANA 500 µL", "T5": "BAP 1000 + AIA 100 µL", "T6": "BAP 1000 + AIA 500 µL", "T7": "BAP 2000 + ANA 100 µL", "T8": "BAP 2000 + AIA 100 µL"}, "pretratamiento": "ácido ascórbico 100 mg/L, remojo 15-30 min (fuera del medio)", "carbon_activado": false, "preparacion_explante": "raspar la superficie del tallo (muy duro) antes de sembrar"}	Factorial de inducción en MED-CAFE-01 (sin carbón activado). Explante: vara floral. El tallo es muy duro: RASPAR la superficie antes de sembrar para favorecer la proliferación. Pretratamiento: remojo 15-30 min en ácido ascórbico 100 mg/L (fuera del medio). Manejo: 1 semana en oscuridad, luego subcultivo cada 4-5 días. Hormonas por tratamiento (µL/L desde stock 1 mg/mL): T1 testigo (0/0); T2 BAP 1000; T3 BAP 1000+ANA 100; T4 BAP 1000+ANA 500; T5 BAP 1000+AIA 100; T6 BAP 1000+AIA 500; T7 BAP 2000+ANA 100; T8 BAP 2000+AIA 100.	2026-08-07 03:24:59.264002
b4065b21-0085-4a4c-b703-2bcd64b72204	EXP-GERM-MOSB	Germinación in vitro — Mostaza blanca (Sinapis alba)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-08-10	\N	activo	40a58428-7a27-4462-87f1-4d4f07443de9	\N	a3d17334-68f5-46f5-9eb0-2b7e978ca902	\N	\N	{"medio": "MED-GERM-01", "fotoperiodo": "16/8", "ph_sustrato": 5.7, "protocolo_siembra": "SIEMB-01", "protocolo_desinfeccion": "DESINF-02"}	Experimento de germinación de semilla de mostaza blanca. Desinfección: DESINF-02 (semilla pequeña, ajustar más suave). Siembra: SIEMB-01 en MED-GERM-01 (sin hormonas). Nº de semillas por definir.	2026-08-11 03:28:02.760715
b2a0a1c8-e4ab-4b02-9aab-419476620339	EXP-GERM-CORI	Germinación in vitro — Cilantro (Coriandrum sativum)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-08-11	\N	activo	40a58428-7a27-4462-87f1-4d4f07443de9	\N	bf6c4bc3-524d-4939-b234-e889dec68cbe	\N	\N	{"medio": "MED-GERM-01", "fotoperiodo": "16/8", "ph_sustrato": 5.7, "protocolo_siembra": "SIEMB-01", "protocolo_desinfeccion": "DESINF-02"}	Experimento de germinación de semilla de cilantro. Siembra 11-ago-2026 (18 frascos, 140 semillas). Desinfección DESINF-02, medio MED-GERM-01 (sin hormonas).	2026-08-14 02:27:00.809644
7caad194-7a33-4727-87ff-09b5cd60fcc2	EXP-GERM-ZINN	Germinación in vitro — Zinnia (7 semillas)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-07-29	\N	activo	40a58428-7a27-4462-87f1-4d4f07443de9	\N	ac88c62b-909b-471f-a585-7adb236941d2	\N	\N	{"medio": "MED-GERM-01", "n_semillas": 7, "fotoperiodo": "16/8", "ph_sustrato": 5.7, "protocolo_siembra": "SIEMB-01", "condiciones_cultivo": {"luz": "misma luz para todas (fotoperiodo, no oscuridad)", "medio": "MS sin hormonas (MED-GERM-01)", "estante": "mismo estante (posición común, temperatura uniforme)", "registrado": "2026-08-12", "fecha_siembra": "2026-08-06"}, "protocolo_desinfeccion": "DESINF-02"}	Experimento de germinación de semillas de flor. Desinfección: DESINF-02 (más suave). Siembra: SIEMB-01 en MED-GERM-01 (sin hormonas).	2026-07-29 03:08:38.163545
34c7e6bc-bb6f-4f12-86ba-ea533a7509e4	EXP-GERM-GITA	Germinación in vitro — Zinnia Gitana (10 semillas)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-07-29	\N	activo	40a58428-7a27-4462-87f1-4d4f07443de9	\N	baf05c4d-6439-4318-bc9f-684830d396e3	\N	\N	{"luz": "REQUIERE luz para germinar (fotoperiodo normal, NO oscuridad)", "medio": "MED-GERM-01", "n_semillas": 10, "fotoperiodo": "16/8", "ph_sustrato": 5.7, "protocolo_siembra": "SIEMB-01", "condiciones_cultivo": {"luz": "misma luz para todas (fotoperiodo, no oscuridad)", "medio": "MS sin hormonas (MED-GERM-01)", "estante": "mismo estante (posición común, temperatura uniforme)", "registrado": "2026-08-12", "fecha_siembra": "2026-08-06"}, "protocolo_desinfeccion": "DESINF-02"}	Experimento de germinación de semillas de flor. Desinfección: DESINF-02 (más suave). Siembra: SIEMB-01 en MED-GERM-01 (sin hormonas). NOTA: requiere LUZ para germinar (fotoperiodo, no oscuridad). Semilla diminuta: manejar en gasa/tul.	2026-07-29 03:08:38.163545
46049ce3-b84b-4a30-aa58-9336bc4ebf6a	EXP-GERM-BOCA	Germinación in vitro — Boca de dragón / Conejito (35 semillas)	\N	d4baef39-e6bf-4401-aaf6-ac7406de583f	2026-07-29	\N	activo	40a58428-7a27-4462-87f1-4d4f07443de9	\N	e994a941-3f7f-46b2-885b-d874bc40a6b4	\N	\N	{"luz": "REQUIERE luz para germinar (fotoperiodo normal, NO oscuridad)", "medio": "MED-GERM-01", "n_semillas": 35, "fotoperiodo": "16/8", "ph_sustrato": 5.7, "protocolo_siembra": "SIEMB-01", "condiciones_cultivo": {"luz": "misma luz para todas (fotoperiodo, no oscuridad)", "medio": "MS sin hormonas (MED-GERM-01)", "estante": "mismo estante (posición común, temperatura uniforme)", "registrado": "2026-08-12", "fecha_siembra": "2026-08-06"}, "protocolo_desinfeccion": "DESINF-02"}	Experimento de germinación de semillas de flor. Desinfección: DESINF-02 (más suave). Siembra: SIEMB-01 en MED-GERM-01 (sin hormonas). NOTA: requiere LUZ para germinar (fotoperiodo, no oscuridad). Semilla diminuta: manejar en gasa/tul.	2026-07-29 03:08:38.163545
\.


--
-- Data for Name: formulacion_componentes; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.formulacion_componentes (id, formulacion_id, reactivo_id, formulacion_ingrediente_id, cantidad_base, notas_pesaje) FROM stdin;
5868ca02-e3ca-465d-972c-1f2247bf69e3	fb933400-ca8d-4392-92d8-c0b6cd709e29	4b61e0dd-0a0a-47dc-8211-1df0672d853d	\N	4.3	g/L
00622875-12e3-40fc-a0e5-fd90cf083ee6	fb933400-ca8d-4392-92d8-c0b6cd709e29	cfe87e2e-b2e0-4b5c-99d3-9a748ad6e595	\N	30	g/L
58b128d1-ea7f-4b0c-900c-0f5367834c66	fb933400-ca8d-4392-92d8-c0b6cd709e29	dbee0832-adc7-4825-8485-5961a057945c	\N	7	g/L
3d3856cf-bdc1-4cd4-86d6-0c918fc77c73	fb933400-ca8d-4392-92d8-c0b6cd709e29	511acbe9-6ced-429e-b525-2a091c023b57	\N	1	1 mL/L (stock preparado en 21.6 mL)
d462d80b-53f0-4f42-be04-89c467950b4c	86b1c730-97e0-4eed-b5b4-c460795a384f	4b61e0dd-0a0a-47dc-8211-1df0672d853d	\N	4.3	g/L
760706c1-4438-4ee3-bf6b-61028cb263a5	86b1c730-97e0-4eed-b5b4-c460795a384f	cfe87e2e-b2e0-4b5c-99d3-9a748ad6e595	\N	30	g/L
c5e810de-2dba-4531-bc3b-da67f752f105	86b1c730-97e0-4eed-b5b4-c460795a384f	dbee0832-adc7-4825-8485-5961a057945c	\N	7	g/L
89a6faab-b2b7-40aa-8f2f-5bc8a1d92dcc	86b1c730-97e0-4eed-b5b4-c460795a384f	511acbe9-6ced-429e-b525-2a091c023b57	\N	1	1 mL/L
3fa648d7-9fa9-4326-a2f3-12849686f893	b6f63664-0e5f-4606-9741-96149111cbea	4b61e0dd-0a0a-47dc-8211-1df0672d853d	\N	4.3	g/L
4a145ad3-6866-41de-a2a8-7dec78bf6524	b6f63664-0e5f-4606-9741-96149111cbea	cfe87e2e-b2e0-4b5c-99d3-9a748ad6e595	\N	30	g/L
10d18689-9f6c-4154-93cd-a17facde6880	b6f63664-0e5f-4606-9741-96149111cbea	dbee0832-adc7-4825-8485-5961a057945c	\N	7	g/L
19c87bcc-d634-4e67-8f62-8be919c0a6a8	b6f63664-0e5f-4606-9741-96149111cbea	511acbe9-6ced-429e-b525-2a091c023b57	\N	1	1 mL/L
3b7f6c68-b9b1-4856-8131-660f1eae93ff	fb933400-ca8d-4392-92d8-c0b6cd709e29	54cbbdea-1174-4c66-9a41-8196a4f86fef	\N	100	100 µL/L de stock 1 mg/mL (= 0.1 mg/L)
a828fb17-77fe-41eb-bbab-fe4f1dd0c874	b6f63664-0e5f-4606-9741-96149111cbea	54cbbdea-1174-4c66-9a41-8196a4f86fef	\N	100	100 µL/L de stock 1 mg/mL (= 0.1 mg/L)
4baabe0e-281c-4911-bb89-3d18e9769de3	fb933400-ca8d-4392-92d8-c0b6cd709e29	53991ab5-d8d0-44e4-8253-570e129a47c9	\N	1000	1000 µL/L de stock 1 mg/mL (= 1.0 mg/L)
1de4131f-e1cf-4424-8845-61dd6cdf25e0	b6f63664-0e5f-4606-9741-96149111cbea	53991ab5-d8d0-44e4-8253-570e129a47c9	\N	1000	1000 µL/L de stock 1 mg/mL (= 1.0 mg/L)
87d63def-585c-4808-b3be-051a3b1e562d	11345420-36f1-45d0-9822-33fc152aeaea	cfe87e2e-b2e0-4b5c-99d3-9a748ad6e595	\N	20	g/L
498534f4-4dd3-4600-93ac-9e58261cce5e	11345420-36f1-45d0-9822-33fc152aeaea	dbee0832-adc7-4825-8485-5961a057945c	\N	7	g/L
0b4a71fa-b93c-454e-8e6b-af8c9892c5e8	11345420-36f1-45d0-9822-33fc152aeaea	511acbe9-6ced-429e-b525-2a091c023b57	\N	1	1 mL/L (según dosis fabricante)
649830d1-87f5-49ca-aca5-00724bf606ab	11345420-36f1-45d0-9822-33fc152aeaea	0a527b08-32a7-4128-a9a5-0e3586438903	\N	4.1	g/L (según etiqueta del premix)
9d8502eb-72fa-47e6-8a43-bf89b892e9f9	11345420-36f1-45d0-9822-33fc152aeaea	87247c51-7ef2-4163-9576-167927132bf6	\N	100	100 mL/L (opcional)
618245f6-166f-495f-aff8-62d2288ed3a2	ec6c3e97-f8f6-4d3f-a03c-c1c2ed77de7c	4b61e0dd-0a0a-47dc-8211-1df0672d853d	\N	4.3	g/L (½MS = 2.15 g/L)
c25079a3-a131-4308-be01-dc340de2c848	ec6c3e97-f8f6-4d3f-a03c-c1c2ed77de7c	dbee0832-adc7-4825-8485-5961a057945c	\N	7	g/L
7b8cec6f-a5d9-4697-b175-ed307169d496	ec6c3e97-f8f6-4d3f-a03c-c1c2ed77de7c	511acbe9-6ced-429e-b525-2a091c023b57	\N	1	1 mL/L
de7320f6-daae-4a10-b9a0-0710ade8fec7	ec6c3e97-f8f6-4d3f-a03c-c1c2ed77de7c	cfe87e2e-b2e0-4b5c-99d3-9a748ad6e595	\N	25	g/L (semillas: 20-30 g/L ok; aquí 25)
\.


--
-- Data for Name: formulaciones; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.formulaciones (id, nombre, codigo_referencia, descripcion, procedimiento, volumen_base_l, caducidad_dias, created_at) FROM stdin;
fb933400-ca8d-4392-92d8-c0b6cd709e29	Medio MS - Chlorophytum comosum (BAP 1.0 / ANA 0.1)	MED-CHLO-01	Medio de multiplicación in-vitro para Chlorophytum comosum sobre base MS.	Ajustar pH a 5.7 antes de agregar el agar. Vitaminas: 1 mL/L de solución stock.	1	30	2026-07-15 02:36:25.69112
ec6c3e97-f8f6-4d3f-a03c-c1c2ed77de7c	Medio de germinación SIN hormonas (MS)	MED-GERM-01	Medio para germinación/siembra de semillas desinfectadas (paso 6 de DESINF-02). Sin reguladores de crecimiento.	Sin hormonas (único cambio vs. el medio de la cinta MED-CHLO). Opción ½MS = 2.58 g para 1200 mL (mitad de sales), también va bien y más económico.\nPREPARACIÓN (ejemplo lote 1200 mL: MS 5.16 g, vitaminas 1200 µL, sacarosa 30 g, agar 8.4 g):\n1) Disolver MS, vitaminas y sacarosa en 700-1000 mL de agua destilada.\n2) Aforar a ~1150 mL.\n3) Medir y ajustar pH a 5.7 con NaOH/HCl gota a gota.\n4) Completar a 1200 mL exactos.\n5) Agregar el agar y calentar hasta disolución completa (queda traslúcido).\n6) Dispensar 30 mL por envase.\n7) Autoclave 121 C, 15 min.\n8) Enfriar dentro del autoclave con la puerta entreabierta, envases verticales y nivelados (evita agua de condensación).\n9) Reposar 24-48 h antes de sembrar (descartar los que se contaminen solos).\nCLAVES: pH antes del agar y tras aforar casi al volumen final (deja margen, luego completa a 1200); enfriado lento = menos condensación; el agar va al final, ya con el pH ajustado.	1	30	2026-07-24 03:23:02.555269
b6f63664-0e5f-4606-9741-96149111cbea	Medio MS - Begonia cucullata (hoja, BAP 1.0 / ANA 0.1)	MED-BEGO-01	Medio para propagación in-vitro de Begonia cucullata a partir de explante de HOJA. Misma base MS que el medio de café.	Ajustar pH a 5.7 antes del agar. Vitaminas: 1 mL/L de stock (2.25 g/21.6 mL). Explante: hoja de begonia. Hormonas: BAP 1.0 mg/L + ANA 0.1 mg/L (mismas que Chlorophytum).	1	30	2026-07-15 03:17:13.231581
11345420-36f1-45d0-9822-33fc152aeaea	Medio Knudson C - Phalaenopsis sp. (varas florales)	MED-PHAL-01	Medio para cultivo in-vitro de Phalaenopsis a partir de varas florales (segmentos nodales). Base Knudson C.	Receta por 1 L. Ajustar pH a 5.2 con NaOH/HCl. Vitaminas MS: según dosis del fabricante (asumido 1 mL/L del stock in-vitro; ajustar si difiere). Agua de coco OPCIONAL (100 mL/L). Explante: varas florales. Lote preparado real: 2500 mL (×2.5): Knudson ~10.3 g, sacarosa 50 g, agar 17.5 g, agua de coco 250 mL.\nSIEMBRA (vara floral/tallo): el tallo es muy duro; RASPAR la superficie del tallo antes de sembrar para favorecer la proliferación.	1	30	2026-07-15 03:46:51.682432
86b1c730-97e0-4eed-b5b4-c460795a384f	Medio para meristemas de café - Coffea arabica 'Caturra' (base)	MED-CAFE-01	Medio de inducción para café (Coffea arabica 'Caturra'). SIN carbón activado. Vitamina C en pretratamiento (fuera del medio). Explantes: ápice/meristema y vara floral (tallo raspado).	Ajustar pH a 5.7 antes del agar. Vitaminas: 1 mL/L de stock (2.25 g/21.6 mL). SIN carbón activado. PRETRATAMIENTO: remojo del explante 15-30 min en ácido ascórbico 100 mg/L (agua destilada estéril, filtrada). Manejo: dejar 1 SEMANA en oscuridad (reduce el pardeamiento; buena práctica), luego subcultivo cada 4-5 días.\nHormonas por tratamiento, en µL/L desde stock 1 mg/mL:\nT1 (testigo): BAP 0 / aux 0.\nT2: BAP 1000 µL.\nT3: BAP 1000 µL + ANA 100 µL.\nT4: BAP 1000 µL + ANA 500 µL.\nT5: BAP 1000 µL + AIA 100 µL.\nT6: BAP 1000 µL + AIA 500 µL.\nT7: BAP 2000 µL + ANA 100 µL.\nT8: BAP 2000 µL + AIA 100 µL.\nSIEMBRA (vara floral/tallo): el tallo es muy duro; RASPAR la superficie del tallo antes de sembrar para favorecer la proliferación.	1	30	2026-07-15 02:51:45.591487
\.


--
-- Data for Name: lineas; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.lineas (id, especie_id, nombre, metodo_propagacion, descripcion, config_estandar, notas, created_at) FROM stdin;
135eccee-c723-47ab-82d2-be176e1a678b	0794a1fb-8331-4f6a-8099-4b179f1c567d	Albo Variegatum	clonacion	Variedad con variegación blanca estable pero inestable en balance.	{}	Requiere poda si revierte a verde o si sale totalmente blanca.	2026-04-28 06:31:07.569857
12744ad2-cbff-487e-8528-41bef6ccc58b	514ab0ac-e6c9-4c29-b196-680c78b0a97e	Semilla	semilla	\N	\N	Propagación únicamente por semilla. Germinación in vitro: desinfección DESINF-02 + siembra en MED-GERM-01 (sin hormonas).	2026-07-24 03:25:50.639667
c766b75f-23b2-4c66-a92a-ad7ecffaa84f	e994a941-3f7f-46b2-885b-d874bc40a6b4	Semilla	semilla	\N	\N	Propagación por semilla. Sembradas 35 semillas. Germinación in vitro: desinfección DESINF-02 (ajustar más suave por semilla muy pequeña de flor) + siembra en MED-GERM-01 (sin hormonas).	2026-07-29 02:58:23.184838
c57a5afb-c9c4-40f5-991e-8f94f63fc11f	1c6415ec-f735-4d0d-a742-cb15ad817323	Semilla	semilla	\N	\N	Propagación por semilla. Sembradas 14 semillas. Germinación in vitro: desinfección DESINF-02 (ajustar más suave por semilla pequeña de flor) + siembra en MED-GERM-01 (sin hormonas).	2026-07-29 02:58:55.507179
36f8ba7e-c5ab-4e9b-94ec-0b4d50075161	ac88c62b-909b-471f-a585-7adb236941d2	Semilla	semilla	\N	\N	Propagación por semilla. Sembradas 7 semillas. Germinación in vitro: DESINF-02 (más suave) + MED-GERM-01 (sin hormonas).	2026-07-29 02:56:48.344675
1cfd615d-b0e1-4eeb-977f-7c02093487de	baf05c4d-6439-4318-bc9f-684830d396e3	Semilla	semilla	\N	\N	Propagación por semilla. Sembradas 10 semillas. Germinación in vitro: DESINF-02 (más suave) + MED-GERM-01 (sin hormonas).	2026-07-29 03:03:59.310423
893cb10a-df4e-48a4-8d36-d04cc3b9eaa4	a3d17334-68f5-46f5-9eb0-2b7e978ca902	Semilla	semilla	Propagación por semilla	{}	\N	2026-08-13 02:49:24.509231
b9b4f976-73ca-4a44-91f3-4ee46e00fe72	0e217d16-59cf-49c1-950b-41b8ca80c308	Meristemo	clonacion	Propagación por ápice/meristema (EXP-CAFE-MER)	{}	\N	2026-08-13 02:53:07.325176
b725f5a6-f5e4-4108-b3fd-05bfd269b64b	0e217d16-59cf-49c1-950b-41b8ca80c308	Vara floral	clonacion	Propagación por vara floral, tallo raspado (EXP-CAFE-VAR)	{}	\N	2026-08-13 02:53:07.325176
95cd07c6-5436-4e6b-b296-40ffa9aa3e78	bf6c4bc3-524d-4939-b234-e889dec68cbe	Semilla	semilla	Propagación por semilla	{}	\N	2026-08-14 02:27:00.809644
\.


--
-- Data for Name: lotes_preparados; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.lotes_preparados (id, uid, formulacion_id, preparado_por_id, fecha_preparacion, fecha_expiracion, volumen_l, concentracion_x, ph_final, trazabilidad_reactivos, estado, notas) FROM stdin;
9e77fe10-c6a3-4c3e-990a-639f4a230cde	LOTE-MEDGERM-260806-01	ec6c3e97-f8f6-4d3f-a03c-c1c2ed77de7c	40a58428-7a27-4462-87f1-4d4f07443de9	\N	\N	1.2	1	\N	\N	disponible	Lote de MED-GERM-01 (sin hormonas). Preparados 1.2 L; salieron aprox. 47 frascos de ~30 mL c/u.
\.


--
-- Data for Name: protocolos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.protocolos (id, codigo, nombre, tipo, version, descripcion, pasos, materiales, estado_validacion, creado_por_id, created_at, updated_at) FROM stdin;
c5f27366-9350-4ec1-ad6c-d480ada5e278	DESINF-01	Desinfección de explantes (protocolo general)	desinfeccion	1.0	Protocolo de desinfección superficial de explantes. La cinta (Chlorophytum) tolera más que la begonia (más sensible): ajustar tiempos/concentración según la planta.	[{"notas": "Agitar suavemente", "orden": 1, "instruccion": "Lavado con agua + 1 gota de detergente", "tiempo_minutos": 1}, {"notas": null, "orden": 2, "instruccion": "Enjuague con agua", "tiempo_minutos": null}, {"notas": "30-60 s. La cinta aguanta más que la begonia.", "orden": 3, "instruccion": "Inmersión en etanol 70%", "tiempo_minutos": 1}, {"notas": "NUNCA usar clorox puro.", "orden": 4, "instruccion": "Inmersión en hipoclorito diluido al 1% (1 parte de clorox comercial 5% + 4 de agua) + 1 gota de Tween-20", "tiempo_minutos": 10}, {"notas": "Retirar todo residuo de desinfectante.", "orden": 5, "instruccion": "3-4 enjuagues con agua destilada estéril (solo agua)", "tiempo_minutos": null}]	[{"notas": null, "nombre": "Detergente", "unidad": "gota", "cantidad": 1}, {"notas": "Inmersión 30-60 s", "nombre": "Etanol 70%", "unidad": null, "cantidad": null}, {"notas": "Diluir a 1% (1:5) al momento de uso; nunca puro", "nombre": "Clorox 5% (hipoclorito de sodio)", "unidad": null, "cantidad": null}, {"notas": "Surfactante", "nombre": "Tween-20", "unidad": "gota", "cantidad": 1}, {"notas": "3-4 enjuagues finales", "nombre": "Agua destilada estéril", "unidad": null, "cantidad": null}]	borrador	40a58428-7a27-4462-87f1-4d4f07443de9	2026-07-15 04:02:53.931909	2026-07-15 04:02:53.931909
c5736d6a-1ef3-49c5-8a73-8195518965cd	DESINF-02	Desinfección de semillas (pimentón y similares)	desinfeccion	1.0	Desinfección de semillas de cubierta dura (ej. pimentón). Margen amplio: la semilla tolera más que el tejido tierno. AJUSTES: si no germinan (exceso) bajar a clorox 1% o menos tiempo; si se contaminan subir a 2.5% o 20 min, o remojo previo más largo. TRUCO semillas difíciles: remojo en agua tibia (no caliente) unas horas antes; o doble hipoclorito (uno fuerte breve -> enjuague -> uno suave) para semillas muy cargadas.	[{"notas": null, "orden": 1, "instruccion": "Selección: elegir semillas sanas, llenas, sin daños ni manchas", "tiempo_minutos": null}, {"notas": "10-30 min. Hidrata y ablanda suciedad. Descartar las que floten (vacías/inviables). Enjuagar después.", "orden": 2, "instruccion": "Remojo previo en agua + 1 gota de detergente", "tiempo_minutos": null}, {"notas": "1-2 min. La semilla aguanta más que el tejido tierno.", "orden": 3, "instruccion": "Inmersión en etanol 70%, agitando", "tiempo_minutos": null}, {"notas": "10-15 min. NUNCA puro. Toleran esta fuerza por su cubierta dura.", "orden": 4, "instruccion": "Hipoclorito al 2% (1 parte de clorox comercial 5% + 1.5 de agua) + 1 gota de Tween, agitación constante", "tiempo_minutos": null}, {"notas": "OBLIGATORIO: quitar todo el cloro.", "orden": 5, "instruccion": "3-4 enjuagues con agua destilada estéril, agitando bien cada vez", "tiempo_minutos": null}, {"notas": "Distribuir separadas sobre el agar; no enterrar, solo apoyar.", "orden": 6, "instruccion": "Siembra sobre medio SIN hormonas (MS o 1/2 MS + vitaminas + azúcar + agar) en cámara", "tiempo_minutos": null}]	[{"notas": "Llenas, sin daño ni mancha", "nombre": "Semillas sanas", "unidad": null, "cantidad": null}, {"notas": "En el remojo previo", "nombre": "Detergente", "unidad": "gota", "cantidad": 1}, {"notas": "Inmersión 1-2 min", "nombre": "Etanol 70%", "unidad": null, "cantidad": null}, {"notas": "Diluir a 2% (1:1.5) al momento de uso; nunca puro", "nombre": "Clorox 5% (hipoclorito de sodio)", "unidad": null, "cantidad": null}, {"notas": "Surfactante", "nombre": "Tween-20", "unidad": "gota", "cantidad": 1}, {"notas": "3-4 enjuagues finales", "nombre": "Agua destilada estéril", "unidad": null, "cantidad": null}, {"notas": "Para siembra/germinación", "nombre": "Medio sin hormonas (MS o 1/2 MS)", "unidad": null, "cantidad": null}]	borrador	40a58428-7a27-4462-87f1-4d4f07443de9	2026-07-24 03:19:50.495397	2026-07-24 03:19:50.495397
d4baef39-e6bf-4401-aaf6-ac7406de583f	SIEMB-01	Siembra y germinación de semillas de flores in vitro	propagacion_in_vitro	1.0	Siembra en cámara de semillas de flor previamente desinfectadas, en medio SIN hormonas (MED-GERM-01). Un envase por especie, bien marcado, para comparar.	[{"notas": "Semillas diminutas (boca de dragón, gitana): manejarlas en gasa/tul para no perderlas. Ver DESINF-02.", "orden": 1, "instruccion": "Desinfectar las semillas: clorox 2% 10-15 min (aguantan fuerte) + 3-4 enjuagues con agua destilada estéril", "tiempo_minutos": 15}, {"notas": null, "orden": 2, "instruccion": "En cámara de flujo laminar, sembrar sobre medio MED-GERM-01 (sin hormonas) con pinzas estériles", "tiempo_minutos": null}, {"notas": "Para poder comparar entre especies", "orden": 3, "instruccion": "Distribuir las semillas separadas sobre el agar; no enterrar, solo apoyar. Un envase por especie, bien marcado", "tiempo_minutos": null}, {"notas": "Zinnia y siempreviva: fotoperiodo normal también.", "orden": 4, "instruccion": "Sellar, etiquetar e incubar. BOCA DE DRAGÓN y GITANA necesitan LUZ para germinar -> fotoperiodo normal, NO oscuridad. Registrar % germinación y % contaminación", "tiempo_minutos": null}]	[{"notas": "Sin hormonas", "nombre": "Medio de germinación MED-GERM-01", "unidad": null, "cantidad": null}, {"notas": null, "nombre": "Pinzas estériles", "unidad": null, "cantidad": null}, {"notas": null, "nombre": "Cámara de flujo laminar", "unidad": null, "cantidad": null}]	borrador	40a58428-7a27-4462-87f1-4d4f07443de9	2026-07-29 03:08:38.163545	2026-07-29 03:24:17.783575
6bb08e7e-6ce9-4e49-845e-785e3cb6d7e7	PROP-CAFE-01	Micropropagación de café (pretratamiento + inducción, factorial 8 tratamientos)	propagacion_in_vitro	1.0	Inducción in vitro de Coffea arabica 'Caturra' en medio MED-CAFE-01 (sin carbón activado). Pretratamiento con ácido ascórbico fuera del medio. Explantes: ápice/meristema y vara floral (tallo raspado). Factorial de 8 tratamientos (T1 testigo a T8) variando BAP y auxinas (ANA/AIA).	[{"notas": "Fuera del medio. Reduce el pardeamiento (oxidación de fenoles).", "orden": 1, "instruccion": "Pretratamiento: remojar el explante 15-30 min en ácido ascórbico (vitamina C) 100 mg/L en agua destilada estéril filtrada", "tiempo_minutos": 30}, {"notas": null, "orden": 2, "instruccion": "En cámara de flujo laminar, desinfectar el explante (ver DESINF-01 general) y enjuagar con agua destilada estéril", "tiempo_minutos": null}, {"notas": "Solo aplica al explante de vara floral; el ápice/meristema se siembra directo.", "orden": 3, "instruccion": "Vara floral: RASPAR la superficie del tallo (muy duro) antes de sembrar para favorecer la proliferación", "tiempo_minutos": null}, {"notas": "µL/L desde stock 1 mg/mL. T1 testigo 0/0; T2 BAP 1000; T3 BAP 1000+ANA 100; T4 BAP 1000+ANA 500; T5 BAP 1000+AIA 100; T6 BAP 1000+AIA 500; T7 BAP 2000+ANA 100; T8 BAP 2000+AIA 100.", "orden": 4, "instruccion": "Sembrar en MED-CAFE-01 (sin carbón activado, pH 5.7) aplicando las hormonas según el tratamiento del factorial (T1 a T8)", "tiempo_minutos": null}, {"notas": "La semana en oscuridad reduce el pardeamiento (buena práctica).", "orden": 5, "instruccion": "Incubar 1 semana en oscuridad, luego subcultivar cada 4-5 días. Registrar proliferación, pardeamiento y contaminación", "tiempo_minutos": null}]	[{"notas": "Sin carbón activado, pH 5.7", "nombre": "Medio de inducción MED-CAFE-01", "unidad": null, "cantidad": null}, {"notas": "Pretratamiento, fuera del medio", "nombre": "Ácido ascórbico (vitamina C)", "unidad": "mg/L", "cantidad": 100}, {"notas": "Según tratamiento (µL/L)", "nombre": "BAP (stock 1 mg/mL)", "unidad": null, "cantidad": null}, {"notas": "Según tratamiento", "nombre": "ANA (stock 1 mg/mL)", "unidad": null, "cantidad": null}, {"notas": "Según tratamiento", "nombre": "AIA (stock 1 mg/mL)", "unidad": null, "cantidad": null}, {"notas": "Raspado de la vara floral", "nombre": "Bisturí y pinzas estériles", "unidad": null, "cantidad": null}, {"notas": null, "nombre": "Cámara de flujo laminar", "unidad": null, "cantidad": null}]	borrador	40a58428-7a27-4462-87f1-4d4f07443de9	2026-08-07 03:24:59.264002	2026-08-07 03:24:59.264002
\.


--
-- Data for Name: reactivos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.reactivos (id, codigo_barras, nombre, formula_quimica, marca, pureza_pct, concentracion_gl, fecha_expiracion, unidad_medida, peligrosidad, notas, created_at) FROM stdin;
4b61e0dd-0a0a-47dc-8211-1df0672d853d	\N	Sales MS (Murashige & Skoog)	\N	\N	\N	\N	\N	g	\N	Sales basales, sin vitaminas	2026-07-15 02:36:25.69112
cfe87e2e-b2e0-4b5c-99d3-9a748ad6e595	\N	Sacarosa	C12H22O11	\N	\N	\N	\N	g	\N	Fuente de carbono	2026-07-15 02:36:25.69112
dbee0832-adc7-4825-8485-5961a057945c	\N	Agar	\N	\N	\N	\N	\N	g	\N	Gelificante	2026-07-15 02:36:25.69112
4ad0ec76-61e9-49bc-91b9-605f487b12a8	\N	ANA (ácido 1-naftalenacético)	C12H10O2	\N	\N	\N	\N	mg	\N	Auxina	2026-07-15 02:36:25.69112
76ec32de-b978-40ac-a24f-c280dfd85066	\N	BAP (6-bencilaminopurina)	C12H11N5	\N	\N	\N	\N	mg	\N	Citoquinina	2026-07-15 02:36:25.69112
67b2cde6-272d-4353-9004-438c045da9d6	\N	AIA (ácido indol-3-acético)	C10H9NO2	\N	\N	\N	\N	mg	\N	Auxina; se agrega según tratamiento	2026-07-15 02:51:45.591487
511acbe9-6ced-429e-b525-2a091c023b57	\N	Vitaminas para cultivo in vitro (solución stock)	\N	\N	\N	\N	\N	mL	\N	Solución stock in-vitro: 2.25 g de polvo en 21.6 mL de agua destilada. Dosis: 1 mL/L de medio. Refrigerar sobrante tapado.	2026-07-15 02:36:25.69112
dd629214-2df0-4413-8510-abdad4d4dcaf	\N	Vitamina C (ácido ascórbico)	C6H8O6	\N	\N	\N	\N	mg	\N	Antioxidante. USO: pretratamiento del explante (remojo 15-30 min en solución 100 mg/L agua destilada estéril, filtrada), NO dentro del medio. Repetir en subcultivos si hay pardeamiento.	2026-07-15 02:51:45.591487
45dbf481-4dfc-4ae3-aca8-254f6cc798a2	\N	Carbón activado	\N	\N	\N	\N	\N	g	\N	Adsorbente de fenoles. Establecimiento y enraizamiento: 1-2 g/L. NO usar en la fase de inducción (factorial) porque adsorbe las hormonas.	2026-07-15 02:53:44.847045
54cbbdea-1174-4c66-9a41-8196a4f86fef	\N	ANA stock 1 mg/mL	\N	\N	\N	\N	\N	µL	\N	Solución madre: 50 mg de ANA en gotas de NaOH 1N, aforar a 50 mL. Refrigerar.	2026-07-15 03:38:31.55887
53991ab5-d8d0-44e4-8253-570e129a47c9	\N	BAP stock 1 mg/mL	\N	\N	\N	\N	\N	µL	\N	Solución madre: 50 mg de BAP en gotas de NaOH 1N, aforar a 50 mL. Refrigerar.	2026-07-15 03:38:31.55887
ccddea2b-f6bc-4aab-a89a-4617cbe5882c	\N	AIA stock 1 mg/mL	\N	\N	\N	\N	\N	µL	\N	Solución madre: 50 mg de AIA en gotas de NaOH 1N (o etanol), aforar a 50 mL. Fotosensible: frasco ámbar, refrigerado, preparar fresco.	2026-07-15 03:39:31.972646
0a527b08-32a7-4128-a9a5-0e3586438903	\N	Sales Knudson (medio Knudson C)	\N	\N	\N	\N	\N	g	\N	Medio base alternativo a MS (sales de Knudson C). Base de comparación opcional.	2026-07-15 03:41:59.365612
87247c51-7ef2-4163-9576-167927132bf6	\N	Agua de coco	\N	\N	\N	\N	\N	mL	\N	Aditivo orgánico opcional (citocininas naturales). Filtrar y esterilizar.	2026-07-15 03:46:51.682432
f1af1784-4a18-40bf-b8c6-694b4fd069ba	\N	Clorox 5% (hipoclorito de sodio)	NaOCl	\N	\N	\N	\N	mL	["corrosivo", "oxidante", "irritante"]	Desinfectante. PREPARAR LA SOLUCIÓN DE TRABAJO EN EL MOMENTO DE USO (no guardar; pierde efecto). NUNCA usar puro. Concentraciones de trabajo según la planta: GENERAL/mayoría de plantas = 1% (dilución 1:5 → 1 parte clorox 5% + 4 de agua); BEGONIA (más sensible) = 0.5% (dilución 1:9 → ej. 3 mL clorox + 27 mL agua = 30 mL). Ver protocolo DESINF-01.	2026-07-15 03:56:12.475307
9bc39c15-6964-4b18-a01b-3eb8e263e063	\N	Etanol 70%	C2H5OH	\N	\N	\N	\N	mL	["inflamable", "irritante"]	Desinfección superficial: inmersión breve del explante/semilla (30 s a 2 min según material). Mantener lejos de llamas. Usado en DESINF-01 y DESINF-02.	2026-07-24 03:17:06.028465
a1441cf2-d7dd-4504-9472-ed98c2cdaad4	\N	Tween-20	\N	\N	\N	\N	\N	gota	[]	Surfactante (tensioactivo). 1 gota en la solución de hipoclorito para mejorar el mojado del material. Usado en DESINF-01 y DESINF-02.	2026-07-24 03:17:06.028465
\.


--
-- Data for Name: registros_evolucion; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.registros_evolucion (id, especimen_id, registrado_por_id, protocolo_clonacion_id, fecha, altura_cm, ancho_hoja_max_cm, largo_hoja_max_cm, num_hojas, num_brotes, num_hijuelos, num_nodos, diametro_tallo_mm, porcentaje_variegacion, patron_variegacion, color_variegacion, sustrato, sustrato_id, tipo_contenedor, diametro_contenedor_cm, temperatura_c, humedad_relativa_pct, humedad_sustrato_pct, ph_sustrato, luz_lux, conductividad_ec, npk, ppm, fotos, notas) FROM stdin;
\.


--
-- Data for Name: resultados_investigacion; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.resultados_investigacion (id, experimento_id, titulo, tipo, descripcion, datos, archivos, registrado_por_id, fecha) FROM stdin;
b555e514-bc8d-444a-a8e8-67cfaecefd94	24aa6644-2223-4e8a-b71a-3c2ec44a7240	Siembra contaminada (hongos y bacterias) - resultado final	conclusion	La siembra de pimenton se contamino con hongos y bacterias; la tanda se perdio. Resultado final del experimento de germinacion.	{"desenlace": "siembra perdida por contaminacion", "contaminantes": ["hongos", "bacterias"]}	\N	8cc2b2f5-da3a-4369-bec2-4194ff37d379	2026-08-07 00:00:00
\.


--
-- Data for Name: sustratos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.sustratos (id, codigo_formulacion, tipo, nombre, descripcion, componentes, ph_teorico, conductividad_teorica, formulacion_id, lote_id, created_at) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.usuarios (id, nombre, email, hashed_password, rol, activo, foto_url, created_at) FROM stdin;
072df402-5190-4fd8-86f1-2d20ede25fac	Hellen Cardenas	cardenashellen937@gmail.com	$2b$12$meTs7cCFKto5P4Cf.NMAZ.4147M8QB3u6mCQYS7gln2Fh2c0R6cmG	admin	t	\N	2026-04-27 23:55:18.946786
40a58428-7a27-4462-87f1-4d4f07443de9	Juan Jose Alban	jalban.arq@gmail.com	$2b$12$CGAMQP7sNrgO35eWH.db6.0S4pISutBBtr2qw7cyf0bVToV7yJ3eS	admin	t	\N	2026-04-27 23:31:30.804164
8cc2b2f5-da3a-4369-bec2-4194ff37d379	Administrador	admin@kronos.lab	$2b$12$j1K6kor4Pg03UJpSkINNLO8AXANQcEllPvStDLsTKeqMJTD8u9yTW	admin	t	\N	2026-06-02 21:15:06.434779
\.


--
-- Data for Name: validaciones_protocolo; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.validaciones_protocolo (id, protocolo_id, experimento_id, usuario_id, resultado, observaciones, metricas, fecha) FROM stdin;
\.


--
-- Data for Name: variegaciones; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.variegaciones (id, linea_id, nombre, codigo, descripcion, config_estandar, notas, created_at) FROM stdin;
4938b902-b262-415c-90cf-894723c18266	135eccee-c723-47ab-82d2-be176e1a678b	Sectorial y Moteada	\N	Patrón quimérico con sectores blancos puros y salpicado (mint/moteado).	{}	Zonas blancas frágiles, propensas a necrosis si hay baja humedad.	2026-04-28 06:31:23.558869
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: elementos elementos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.elementos
    ADD CONSTRAINT elementos_pkey PRIMARY KEY (id);


--
-- Name: especies especies_codigo_key; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especies
    ADD CONSTRAINT especies_codigo_key UNIQUE (codigo);


--
-- Name: especies especies_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especies
    ADD CONSTRAINT especies_pkey PRIMARY KEY (id);


--
-- Name: especimenes especimenes_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_pkey PRIMARY KEY (id);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- Name: experimento_elemento experimento_elemento_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimento_elemento
    ADD CONSTRAINT experimento_elemento_pkey PRIMARY KEY (experimento_id, elemento_id);


--
-- Name: experimento_especimen experimento_especimen_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimento_especimen
    ADD CONSTRAINT experimento_especimen_pkey PRIMARY KEY (experimento_id, especimen_id);


--
-- Name: experimentos experimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_pkey PRIMARY KEY (id);


--
-- Name: formulacion_componentes formulacion_componentes_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.formulacion_componentes
    ADD CONSTRAINT formulacion_componentes_pkey PRIMARY KEY (id);


--
-- Name: formulaciones formulaciones_codigo_referencia_key; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.formulaciones
    ADD CONSTRAINT formulaciones_codigo_referencia_key UNIQUE (codigo_referencia);


--
-- Name: formulaciones formulaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.formulaciones
    ADD CONSTRAINT formulaciones_pkey PRIMARY KEY (id);


--
-- Name: lineas lineas_especie_id_nombre_key; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lineas
    ADD CONSTRAINT lineas_especie_id_nombre_key UNIQUE (especie_id, nombre);


--
-- Name: lineas lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lineas
    ADD CONSTRAINT lineas_pkey PRIMARY KEY (id);


--
-- Name: lotes_preparados lotes_preparados_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lotes_preparados
    ADD CONSTRAINT lotes_preparados_pkey PRIMARY KEY (id);


--
-- Name: lotes_preparados lotes_preparados_uid_key; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lotes_preparados
    ADD CONSTRAINT lotes_preparados_uid_key UNIQUE (uid);


--
-- Name: protocolos protocolos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.protocolos
    ADD CONSTRAINT protocolos_pkey PRIMARY KEY (id);


--
-- Name: reactivos reactivos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.reactivos
    ADD CONSTRAINT reactivos_pkey PRIMARY KEY (id);


--
-- Name: registros_evolucion registros_evolucion_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.registros_evolucion
    ADD CONSTRAINT registros_evolucion_pkey PRIMARY KEY (id);


--
-- Name: resultados_investigacion resultados_investigacion_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.resultados_investigacion
    ADD CONSTRAINT resultados_investigacion_pkey PRIMARY KEY (id);


--
-- Name: sustratos sustratos_codigo_formulacion_key; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.sustratos
    ADD CONSTRAINT sustratos_codigo_formulacion_key UNIQUE (codigo_formulacion);


--
-- Name: sustratos sustratos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.sustratos
    ADD CONSTRAINT sustratos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: validaciones_protocolo validaciones_protocolo_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.validaciones_protocolo
    ADD CONSTRAINT validaciones_protocolo_pkey PRIMARY KEY (id);


--
-- Name: variegaciones variegaciones_linea_id_nombre_key; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.variegaciones
    ADD CONSTRAINT variegaciones_linea_id_nombre_key UNIQUE (linea_id, nombre);


--
-- Name: variegaciones variegaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.variegaciones
    ADD CONSTRAINT variegaciones_pkey PRIMARY KEY (id);


--
-- Name: ix_elementos_element_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_elementos_element_id ON public.elementos USING btree (element_id);


--
-- Name: ix_especies_nombre_cientifico; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_especies_nombre_cientifico ON public.especies USING btree (nombre_cientifico);


--
-- Name: ix_especimenes_contenedor_uid; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_contenedor_uid ON public.especimenes USING btree (contenedor_uid);


--
-- Name: ix_especimenes_especie_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_especie_id ON public.especimenes USING btree (especie_id);


--
-- Name: ix_especimenes_linea_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_linea_id ON public.especimenes USING btree (linea_id);


--
-- Name: ix_especimenes_lote_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_lote_id ON public.especimenes USING btree (lote_id);


--
-- Name: ix_especimenes_madre_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_madre_id ON public.especimenes USING btree (madre_id);


--
-- Name: ix_especimenes_padre_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_padre_id ON public.especimenes USING btree (padre_id);


--
-- Name: ix_especimenes_uid; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_especimenes_uid ON public.especimenes USING btree (uid);


--
-- Name: ix_especimenes_variegacion_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_variegacion_id ON public.especimenes USING btree (variegacion_id);


--
-- Name: ix_eventos_elemento_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_eventos_elemento_id ON public.eventos USING btree (elemento_id);


--
-- Name: ix_eventos_especimen_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_eventos_especimen_id ON public.eventos USING btree (especimen_id);


--
-- Name: ix_eventos_experimento_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_eventos_experimento_id ON public.eventos USING btree (experimento_id);


--
-- Name: ix_eventos_timestamp; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_eventos_timestamp ON public.eventos USING btree ("timestamp");


--
-- Name: ix_experimentos_codigo; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_experimentos_codigo ON public.experimentos USING btree (codigo);


--
-- Name: ix_lineas_especie_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_lineas_especie_id ON public.lineas USING btree (especie_id);


--
-- Name: ix_protocolos_codigo; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_protocolos_codigo ON public.protocolos USING btree (codigo);


--
-- Name: ix_reactivos_codigo_barras; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_reactivos_codigo_barras ON public.reactivos USING btree (codigo_barras);


--
-- Name: ix_reg_evol_especimen; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_reg_evol_especimen ON public.registros_evolucion USING btree (especimen_id);


--
-- Name: ix_reg_evol_fecha; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_reg_evol_fecha ON public.registros_evolucion USING btree (fecha);


--
-- Name: ix_registros_evolucion_especimen_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_registros_evolucion_especimen_id ON public.registros_evolucion USING btree (especimen_id);


--
-- Name: ix_registros_evolucion_fecha; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_registros_evolucion_fecha ON public.registros_evolucion USING btree (fecha);


--
-- Name: ix_resultados_investigacion_experimento_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_resultados_investigacion_experimento_id ON public.resultados_investigacion USING btree (experimento_id);


--
-- Name: ix_resultados_investigacion_fecha; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_resultados_investigacion_fecha ON public.resultados_investigacion USING btree (fecha);


--
-- Name: ix_usuarios_email; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: ix_validaciones_protocolo_protocolo_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_validaciones_protocolo_protocolo_id ON public.validaciones_protocolo USING btree (protocolo_id);


--
-- Name: ix_variegaciones_linea_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_variegaciones_linea_id ON public.variegaciones USING btree (linea_id);


--
-- Name: especimenes especimenes_especie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_especie_id_fkey FOREIGN KEY (especie_id) REFERENCES public.especies(id);


--
-- Name: especimenes especimenes_linea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES public.lineas(id);


--
-- Name: especimenes especimenes_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes_preparados(id);


--
-- Name: especimenes especimenes_madre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_madre_id_fkey FOREIGN KEY (madre_id) REFERENCES public.especimenes(id);


--
-- Name: especimenes especimenes_padre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_padre_id_fkey FOREIGN KEY (padre_id) REFERENCES public.especimenes(id);


--
-- Name: especimenes especimenes_variegacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.especimenes
    ADD CONSTRAINT especimenes_variegacion_id_fkey FOREIGN KEY (variegacion_id) REFERENCES public.variegaciones(id);


--
-- Name: eventos eventos_ejecutado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_ejecutado_por_id_fkey FOREIGN KEY (ejecutado_por_id) REFERENCES public.usuarios(id);


--
-- Name: eventos eventos_elemento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_elemento_id_fkey FOREIGN KEY (elemento_id) REFERENCES public.elementos(id);


--
-- Name: eventos eventos_especimen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_especimen_id_fkey FOREIGN KEY (especimen_id) REFERENCES public.especimenes(id);


--
-- Name: eventos eventos_experimento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_experimento_id_fkey FOREIGN KEY (experimento_id) REFERENCES public.experimentos(id);


--
-- Name: eventos eventos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: experimento_elemento experimento_elemento_elemento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimento_elemento
    ADD CONSTRAINT experimento_elemento_elemento_id_fkey FOREIGN KEY (elemento_id) REFERENCES public.elementos(id);


--
-- Name: experimento_elemento experimento_elemento_experimento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimento_elemento
    ADD CONSTRAINT experimento_elemento_experimento_id_fkey FOREIGN KEY (experimento_id) REFERENCES public.experimentos(id);


--
-- Name: experimento_especimen experimento_especimen_especimen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimento_especimen
    ADD CONSTRAINT experimento_especimen_especimen_id_fkey FOREIGN KEY (especimen_id) REFERENCES public.especimenes(id);


--
-- Name: experimento_especimen experimento_especimen_experimento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimento_especimen
    ADD CONSTRAINT experimento_especimen_experimento_id_fkey FOREIGN KEY (experimento_id) REFERENCES public.experimentos(id);


--
-- Name: experimentos experimentos_director_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_director_id_fkey FOREIGN KEY (director_id) REFERENCES public.usuarios(id);


--
-- Name: experimentos experimentos_especie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_especie_id_fkey FOREIGN KEY (especie_id) REFERENCES public.especies(id);


--
-- Name: experimentos experimentos_linea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES public.lineas(id);


--
-- Name: experimentos experimentos_operador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_operador_id_fkey FOREIGN KEY (operador_id) REFERENCES public.usuarios(id);


--
-- Name: experimentos experimentos_protocolo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_protocolo_id_fkey FOREIGN KEY (protocolo_id) REFERENCES public.protocolos(id);


--
-- Name: experimentos experimentos_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_responsable_id_fkey FOREIGN KEY (director_id) REFERENCES public.usuarios(id);


--
-- Name: experimentos experimentos_variegacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.experimentos
    ADD CONSTRAINT experimentos_variegacion_id_fkey FOREIGN KEY (variegacion_id) REFERENCES public.variegaciones(id);


--
-- Name: formulacion_componentes formulacion_componentes_formulacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.formulacion_componentes
    ADD CONSTRAINT formulacion_componentes_formulacion_id_fkey FOREIGN KEY (formulacion_id) REFERENCES public.formulaciones(id) ON DELETE CASCADE;


--
-- Name: formulacion_componentes formulacion_componentes_formulacion_ingrediente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.formulacion_componentes
    ADD CONSTRAINT formulacion_componentes_formulacion_ingrediente_id_fkey FOREIGN KEY (formulacion_ingrediente_id) REFERENCES public.formulaciones(id);


--
-- Name: formulacion_componentes formulacion_componentes_reactivo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.formulacion_componentes
    ADD CONSTRAINT formulacion_componentes_reactivo_id_fkey FOREIGN KEY (reactivo_id) REFERENCES public.reactivos(id);


--
-- Name: lineas lineas_especie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lineas
    ADD CONSTRAINT lineas_especie_id_fkey FOREIGN KEY (especie_id) REFERENCES public.especies(id);


--
-- Name: lotes_preparados lotes_preparados_formulacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lotes_preparados
    ADD CONSTRAINT lotes_preparados_formulacion_id_fkey FOREIGN KEY (formulacion_id) REFERENCES public.formulaciones(id);


--
-- Name: lotes_preparados lotes_preparados_preparado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lotes_preparados
    ADD CONSTRAINT lotes_preparados_preparado_por_id_fkey FOREIGN KEY (preparado_por_id) REFERENCES public.usuarios(id);


--
-- Name: protocolos protocolos_creado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.protocolos
    ADD CONSTRAINT protocolos_creado_por_id_fkey FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id);


--
-- Name: registros_evolucion registros_evolucion_especimen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.registros_evolucion
    ADD CONSTRAINT registros_evolucion_especimen_id_fkey FOREIGN KEY (especimen_id) REFERENCES public.especimenes(id);


--
-- Name: registros_evolucion registros_evolucion_protocolo_clonacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.registros_evolucion
    ADD CONSTRAINT registros_evolucion_protocolo_clonacion_id_fkey FOREIGN KEY (protocolo_clonacion_id) REFERENCES public.protocolos(id);


--
-- Name: registros_evolucion registros_evolucion_registrado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.registros_evolucion
    ADD CONSTRAINT registros_evolucion_registrado_por_id_fkey FOREIGN KEY (registrado_por_id) REFERENCES public.usuarios(id);


--
-- Name: registros_evolucion registros_evolucion_sustrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.registros_evolucion
    ADD CONSTRAINT registros_evolucion_sustrato_id_fkey FOREIGN KEY (sustrato_id) REFERENCES public.sustratos(id);


--
-- Name: resultados_investigacion resultados_investigacion_experimento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.resultados_investigacion
    ADD CONSTRAINT resultados_investigacion_experimento_id_fkey FOREIGN KEY (experimento_id) REFERENCES public.experimentos(id);


--
-- Name: resultados_investigacion resultados_investigacion_registrado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.resultados_investigacion
    ADD CONSTRAINT resultados_investigacion_registrado_por_id_fkey FOREIGN KEY (registrado_por_id) REFERENCES public.usuarios(id);


--
-- Name: sustratos sustratos_formulacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.sustratos
    ADD CONSTRAINT sustratos_formulacion_id_fkey FOREIGN KEY (formulacion_id) REFERENCES public.formulaciones(id);


--
-- Name: sustratos sustratos_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.sustratos
    ADD CONSTRAINT sustratos_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes_preparados(id);


--
-- Name: validaciones_protocolo validaciones_protocolo_experimento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.validaciones_protocolo
    ADD CONSTRAINT validaciones_protocolo_experimento_id_fkey FOREIGN KEY (experimento_id) REFERENCES public.experimentos(id);


--
-- Name: validaciones_protocolo validaciones_protocolo_protocolo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.validaciones_protocolo
    ADD CONSTRAINT validaciones_protocolo_protocolo_id_fkey FOREIGN KEY (protocolo_id) REFERENCES public.protocolos(id);


--
-- Name: validaciones_protocolo validaciones_protocolo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.validaciones_protocolo
    ADD CONSTRAINT validaciones_protocolo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: variegaciones variegaciones_linea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.variegaciones
    ADD CONSTRAINT variegaciones_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES public.lineas(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: lbms
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict r8m68CF5hZq2kqNcAyfSQVCL7UllT449lHYaWmmu09dnoRHqSXhH63sJwyExtMa

