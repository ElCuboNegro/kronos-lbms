--
-- PostgreSQL database dump
--

\restrict vhKdZeo46rgSLcWIJPyd9gp87P2G26chEF4ImCYAXF3CzBNYLSHKy9tHulF3Ih9

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
    nombre_cientifico character varying(255) NOT NULL,
    nombre_comun character varying(255),
    familia character varying(100),
    genero character varying(100),
    descripcion text,
    requerimientos jsonb,
    created_at timestamp without time zone,
    codigo character varying(10),
    ficha jsonb,
    config_estandar jsonb DEFAULT '{}'::jsonb,
    categoria character varying(30) DEFAULT 'especie'::character varying
);


ALTER TABLE public.especies OWNER TO lbms;

--
-- Name: especimenes; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.especimenes (
    id uuid NOT NULL,
    uid character varying(100) NOT NULL,
    especie character varying(255) NOT NULL,
    especie_id uuid,
    fecha_ingreso date NOT NULL,
    origen character varying(255),
    estado character varying(30) NOT NULL,
    notas text,
    created_at timestamp without time zone,
    linea_id uuid,
    variegacion_id uuid,
    coordenadas jsonb,
    indice integer,
    madre_id uuid,
    padre_id uuid
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
    "timestamp" timestamp without time zone,
    meta jsonb,
    ejecutado_por_id uuid
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
    nombre character varying(255) NOT NULL,
    hipotesis text,
    protocolo_id uuid,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    estado character varying(30) NOT NULL,
    director_id uuid NOT NULL,
    notas text,
    created_at timestamp without time zone,
    operador_id uuid,
    config_estandar jsonb DEFAULT '{}'::jsonb,
    especie_id uuid,
    linea_id uuid,
    variegacion_id uuid
);


ALTER TABLE public.experimentos OWNER TO lbms;

--
-- Name: lineas; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.lineas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    especie_id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    notas text,
    created_at timestamp without time zone DEFAULT now(),
    metodo_propagacion character varying(50) DEFAULT 'desconocido'::character varying,
    config_estandar jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.lineas OWNER TO lbms;

--
-- Name: protocolos; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.protocolos (
    id uuid NOT NULL,
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
-- Name: registros_evolucion; Type: TABLE; Schema: public; Owner: lbms
--

CREATE TABLE public.registros_evolucion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    especimen_id uuid NOT NULL,
    registrado_por_id uuid NOT NULL,
    protocolo_clonacion_id uuid,
    fecha timestamp without time zone DEFAULT now(),
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
    tipo_contenedor character varying(50),
    diametro_contenedor_cm double precision,
    temperatura_c double precision,
    humedad_relativa_pct double precision,
    humedad_sustrato_pct double precision,
    ph_sustrato double precision,
    luz_lux double precision,
    conductividad_ec double precision,
    fotos jsonb,
    notas text,
    npk character varying(50),
    ppm double precision,
    sustrato_id uuid
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
    nombre character varying(255) NOT NULL,
    descripcion text,
    componentes jsonb,
    ph_teorico double precision,
    conductividad_teorica double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone,
    foto_url character varying(500)
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
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    linea_id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    notas text,
    created_at timestamp without time zone DEFAULT now(),
    config_estandar jsonb DEFAULT '{}'::jsonb,
    codigo character varying(10)
);


ALTER TABLE public.variegaciones OWNER TO lbms;

--
-- Data for Name: elementos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.elementos (id, element_id, tipo, descripcion, cantidad, unidad, estado, notas, created_at) FROM stdin;
\.


--
-- Data for Name: especies; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.especies (id, nombre_cientifico, nombre_comun, familia, genero, descripcion, requerimientos, created_at, codigo, ficha, config_estandar, categoria) FROM stdin;
0794a1fb-8331-4f6a-8099-4b179f1c567d	Syngonium podophyllum	Singonio	Araceae	Syngonium	Planta Cabeza de Flecha. Hemiepífita trepadora tropical.	{"ph": "5.5 - 6.5", "luz": "Luz brillante indirecta", "riego": "Sustrato ligeramente húmedo", "humedad": "60% - 80%", "sustrato": "Aroid mix (fibra de coco, pino, perlita, humus)", "toxicidad": "Contiene oxalatos de calcio. Mantener lejos de mascotas (Cronos).", "temperatura": "18°C - 28°C"}	2026-04-28 06:31:03.567653	SYNG	\N	{"luz_lux": 2000.0, "sustrato": "Aroid Mix", "ph_sustrato": 6.0, "temperatura_c": 23.0, "humedad_relativa_pct": 70.0}	especie
e179b89f-6c04-4507-99d6-dfb26a5f6b78	Sphagnum magellanicum	Musgo	Araceae	Monstera	Sphagnum magellanicum es una especie de musgo de la familia Sphagnaceae. Es endémica de Argentina, Chile y Perú. Su hábitat natural son las turberas y humedales.	{"ph": "pH de 4.2 y 4.8.", "luz": "50 µmol m⁻² s⁻¹ de radiación fotosintéticamente activa (PAR)", "humedad": "98 ± 1%.", "sustrato": "Oligotrófico y saturado de agua", "temperatura": "4 a 19 °C"}	2026-04-28 03:17:07.561093	MOSS	{"wiki_url": "https://es.wikipedia.org/wiki/Sphagnum_magellanicum", "wiki_lang": "es", "ciclo_vida": "Posee una alternancia de generaciones heteromorfas donde la fase del gametofito (haploide) es perenne y dominante. La germinación inicia cuando las esporas logran romper latencia (requiriendo aportes puntuales de fósforo), dando origen a un protonema juvenil de aspecto taloide o laminar que se adhiere mediante rizoides multicelulares. Durante el crecimiento vegetativo, madura hacia el gametóforo adulto (tallo, ramas esparcidas y ramas colgantes), perdiendo los rizoides y basando su absorción en capilaridad a través de poros e hialocistos muertos. Al ser una briófita no tiene floración, pero produce órganos sexuales (arquegonios femeninos y anteridios masculinos); tras una fecundación dependiente de una película de agua, se inicia la fructificación o fase esporofítica. El esporofito forma una cápsula esférica que, al madurar (finales de primavera), se torna oscura y es elevada por el pseudopodio del tejido materno, expulsando explosivamente sus esporas haploides. Su propagación dominante, no obstante, es clónica a través de ramificaciones, fragmentación o gemas de resistencia en casos de estrés por hongos.", "maduracion": "A nivel celular, la maduración del estrato vegetativo se consolida cuando las células hialinas (hialocistos) completan una muerte celular programada constructiva, vaciando su citoplasma y desarrollando paredes secundarias macizas que les permiten almacenar masivamente el agua. Bioquímicamente, el tejido maduro se tiñe cromáticamente a colores rojo-vinoso debido a la síntesis de esfagnorrubinas bajo alta radiación y bajas temperaturas; este pigmento actúa como termo-absorbedor. Agronómicamente, el indicador de madurez técnica para realizar el corte de cosecha ocurre cuando la descomposición natural en la base húmeda iguala o se aproxima a la tasa de nueva producción verde en la cima del dosel. Legal y ecológicamente, tras una recolección comercial, los indicadores de recuperación (madurez para re-ingreso) toman rangos moratorios que van desde los 12 años en ecosistemas dinámicos y cálidos hasta 85 años estrictos en hábitats periglaciares polares.", "wiki_titulo": "Sphagnum magellanicum", "notas_cultivo": "— En la siembra al aire libre sobre turba nivelada, se debe esparcir obligatoriamente un mantillo de paja suelta protectora (al menos 3000 kg/ha) con un espesor menor a 3 cm; esto amortigua la temperatura y evita la desecación sin bloquear el umbral de luz asimilatoria.\\n— Está absolutamente prohibido superponer lona o mallas geotextiles directamente a ras de suelo sobre el musgo recién sembrado; retienen la humedad hasta colapsar el intercambio gaseoso y pudren el cultivo por anoxia fulminante (es mejor usar sombra en mallas altas aéreas).\\n— Para cultivo y propagación biotecnológica in vitro en vivero, el uso de cultivos líquidos agitados en biorreactores enriquecidos con sacarosa y nitrato de amonio genera tasas asombrosas que multiplican la biomasa de 10 a 30 veces en tan solo 4 semanas.\\n— En extracción de turberas, jamás se debe cosechar en verano (se agrava el estrés hídrico de la planta en la sequía).\\n— Práctica de resiembra obligatoria: Es imperativo no arrancar las hierbas co-estructurales (como Juncus procerus) que le brindan anclaje al tejido. Asimismo, al finalizar la cosecha mecánica o manual, se deben dejar fragmentos como piso residual (mínimo el 30%) y re-esparcir las partes apicales de las hierbas cortadas alisándolas contra el sustrato para reanudar succión hídrica rápida y acortar hasta un año la regeneración clonal.", "wiki_fetched_at": "2026-04-28T05:26:15.343Z"}	{"luz_lux": 500.0, "sustrato": "Sphagnum saturado", "ph_sustrato": 4.5, "temperatura_c": 11.0, "humedad_relativa_pct": 98.0}	especie
ce8f5267-3380-407b-9722-2aa9c18b55c3	Nepenthes Khasiensis x ventricosa x maxima	St Gaya	\N	\N	\N	{"ph": "4.5 - 5.5 (ligeramente ácido)", "luz": "15,000 - 30,000 lux. Brillante pero indirecta o filtrada. Sol directo quema hojas; luz insuficiente detiene producción de jarros", "notas": "Prohibido fertilizantes convencionales en sustrato (queman raíces). Nutrición mediante insectos atrapados en los jarros", "riego": "Solo agua destilada, ósmosis inversa o lluvia (TDS < 50 ppm). Siempre húmedo, nunca encharcado. Buen drenaje, sin plato con agua estancada", "humedad": "60% - 80%+. A mayor humedad, mayor tamaño y durabilidad de las trampas", "sustrato": "Pobre en minerales, aireado y alta retención de humedad. Ideal: Sphagnum (50%) + Perlita (25%) + Corteza de pino/orquídea (25%)", "temperatura": "22°C - 28°C día / 15°C - 18°C noche (fluctuaciones térmicas favorecen formación de jarros)"}	2026-04-28 05:32:47.59735	NPNTH	{"ciclo_vida": "Germinación: Lenta, 1-3 meses en alta humedad y luz filtrada.\\nCrecimiento vegetativo: Etapa prolongada con roseta basal y jarros inferiores (más redondeados, posados en suelo).\\nFase trepadora: El tallo se alarga formando enredadera y produce jarros superiores (más tubulares, para atrapar insectos voladores).\\nFloración: Plantas dioicas (machos y hembras). Producen inflorescencia en racimo simple.\\nFructificación: Solo con polinización cruzada entre macho y hembra, produciendo cápsulas que liberan semillas filiformes al secarse.", "maduracion": "Tiempo: 3 a 5 años desde semilla para alcanzar madurez sexual y fase trepadora.\\nIndicadores: Transición de roseta basal a crecimiento en liana (tallo alargado). Cambio en morfología de trampas (inferiores a superiores) y aparición de espiga floral.", "notas_cultivo": "Aclimatación: Muy susceptibles al estrés por cambios de ambiente. Normal que aborten jarros y detengan crecimiento las primeras semanas en un lugar nuevo.\\nLimpieza: Cortar hojas y jarros completamente secos (marrones) desde la base para evitar hongos.\\nRescate inicial: Lavado profundo de sustrato con agua destilada al adquirir de vivero, para eliminar acumulación de sales minerales del agua corriente."}	{"luz_lux": 22000.0, "sustrato": "Sphagnum/Perlita/Corteza", "ph_sustrato": 5.0, "temperatura_c": 25.0, "humedad_relativa_pct": 75.0}	especie
be25e0ef-afd7-42c9-845f-68dde2b5b79e	Darlingtonia californica	Planta Cobra	Sarraceniaceae	Darlingtonia	Darlingtonia californica, conocida como Planta Cobra, es la única especie del género Darlingtonia. Planta carnívora nativa del norte de California y sur de Oregón. Vive en manantiales de agua fría con suelos oligotróficos y alta oxigenación.	{"ph": "4.5 - 5.5 (ácido)", "luz": "50,000 - 80,000 lux. Sol directo o semisombra muy brillante. Alta exposición indispensable para coloración rojiza y fenestraciones", "notas": "Extremadamente intolerante al calor radicular. Si el sustrato se calienta, raíces muy susceptibles a pudrición por patógenos", "riego": "Agua destilada, ósmosis inversa o lluvia (0-50 ppm). Riego superior con agua muy fría (cubitos de hielo destilados). Evitar bandeja si el agua se calienta", "humedad": "60% - 80% o superior. Ambiente muy húmedo y bien ventilado; evitar estancamiento del aire", "sustrato": "Sphagnum puro o mezcla con perlita y piedra pómez (1:1 o 2:1). Máxima oxigenación, CERO nutrientes ni fertilizantes", "temperatura": "Aire: 15°C - 25°C. CRÍTICO: raíces estrictamente bajo 20°C. Dormancia invernal: 0°C - 10°C"}	2026-04-28 06:10:42.147126	DARL	{"ciclo_vida": "Germinación: Requiere estratificación en frío (4-6 semanas en nevera) para romper latencia. Tras esto, germinación lenta de 3-8 semanas bajo luz brillante y alta humedad.\\nCrecimiento vegetativo: Primeros años producen hojas juveniles simples sin forma de cúpula. Crecimiento lento. En etapas posteriores desarrollan jarras tubulares adultas. Crecimiento activo en primavera y verano. Genera estolones subterráneos de los que brotan nuevos individuos (clones).\\nFloración: Ocurre en primavera, frecuentemente antes de que las jarras nuevas se abran. Produce flor única y péndula de tonos rojizos y verdosos al final de un tallo largo. El tallo alto separa a los polinizadores de las trampas.\\nFructificación: Tras polinización exitosa, se forma una cápsula erecta que al secarse se abre y dispersa cientos de semillas muy pequeñas.\\nDormancia: En invierno la planta detiene su crecimiento. Requiere 3-4 meses de frío para recuperar energía; sin este reposo se debilita y muere a largo plazo.", "maduracion": "Tiempo: 3-5 años desde semilla para alcanzar madurez y florecer. Con propagación vegetativa por división de estolones: 1-2 años.\\nIndicadores: Jarras grandes y robustas, cúpula bien definida con fenestraciones traslúcidas evidentes, apéndice bífido (\\"lengua\\") completamente desarrollado y capacidad anual de producir tallos florales.", "notas_cultivo": "Ventaja del microclima: En entornos de alta montaña o sabana con noches frías y días templados, el cultivo es más fácil; el riesgo fatal de sobrecalentamiento radicular disminuye sin equipos de refrigeración.\\nManejo de dormancia sin estaciones: Al carecer de inviernos bajo cero, inducir dormancia artificial: desenterrar el rizoma, aplicar fungicida preventivo a base de azufre, envolver en Sphagnum ligeramente húmedo y almacenar en refrigerador a 4°C-5°C durante 3-4 meses cada año.\\nOxigenación radicular: Las raíces necesitan flujo constante de agua fría y oxígeno. Usar macetas de red (hidroponía) dentro de macetas de cerámica porosa permite que la evaporación enfríe el cepellón y fomente circulación de aire en el sustrato."}	{"luz_lux": 65000.0, "sustrato": "Sphagnum/Pómez", "ph_sustrato": 5.0, "temperatura_c": 20.0, "humedad_relativa_pct": 75.0}	especie
d815c9e0-7fbd-4420-8256-11af5e1a6e51	Cotyledon tomentosa subsp. ladismithiensis variegata	Garrita de Oso	Crassulaceae	Cotyledon	Cotyledon tomentosa subsp. ladismithiensis variegata, conocida como Garrita de Oso, es una suculenta perenne de la familia Crassulaceae originaria del sur de África. Sus hojas carnosas cubiertas de tricomas blancos con uñas rojizas en las puntas son su rasgo más reconocible. En su forma variegada presenta zonas blanquecinas o amarillas por ausencia parcial de clorofila. De crecimiento lento y porte arbustivo.	{"ph": "6.0 - 7.0 (ligeramente ácido a neutro)", "luz": "4,000 - 6,000 lux. Sombra parcial o luz filtrada brillante. Alta luminosidad para mantener variegación; sol directo de mediodía puede quemar zonas blancas", "notas": "Los tricomas retienen agua si se riega por encima, facilitando hongos. Manipular con cuidado; hojas muy quebradizas", "riego": "Empapar y secar: regar solo cuando el sustrato esté completamente seco. En invierno reducir al mínimo (1 vez/mes o menos). Nunca mojar las hojas", "humedad": "30% - 50% (baja a moderada). El exceso junto con frío puede pudrir las hojas vellosas", "sustrato": "50% mineral (pómez, perlita, arena gruesa) + 50% orgánico (turba o fibra de coco). Excelente drenaje obligatorio", "temperatura": "18°C - 25°C. Tolera máximas de 30°C con buena ventilación. Sensible a heladas; evitar temperaturas menores a 5°C"}	2026-04-28 06:18:01.47856	COTV	{"ciclo_vida": "Germinación: Lenta y errática (1-3 semanas). Semillas minúsculas que requieren luz para germinar.\\nCrecimiento vegetativo: Perenne de crecimiento lento, especialmente en forma variegada. Desarrolla tallos leñosos con el tiempo.\\nFloración: Primavera/verano. Produce tallos florales con flores acampanadas de color naranja a rojizo.\\nFructificación: Produce cápsulas pequeñas con semillas finas tras polinización.", "maduracion": "Tiempo: 2-5 años para alcanzar forma arbustiva madura.\\nIndicadores: Tallo marrón y lignificado. Las uñas en punta de hojas se tornan rojo intenso bajo estrés lumínico óptimo.", "notas_cultivo": "Propagación: Esquejes de tallo son más exitosos que por hoja (las hojas suelen pudrirse antes de enraizar).\\nManejo: Hojas muy quebradizas; manipular con cuidado.\\nFertilización: Solo en primavera con fertilizante bajo en nitrógeno.\\nSensibilidad: Si la planta se torna muy verde, necesita más luz (reversión de variegación por falta de luz)."}	{"luz_lux": 5000.0, "sustrato": "50/50 Mineral/Orgánico", "ph_sustrato": 6.5, "temperatura_c": 22.0, "humedad_relativa_pct": 40.0}	especie
77aed2f3-7ab0-4674-9e47-a0877200263b	Lithops fulviceps	Piedras Vivas	Aizoaceae	Lithops	Lithops fulviceps, conocida como Piedra Viva o Cactus Piedra, es una suculenta de la familia Aizoaceae nativa del sur de Africa. Su morfologia es una adaptacion evolutiva extrema llamada mimetismo criptico: imita piedras y guijarros para camuflarse de herbivoros. Cada planta consiste en un par de hojas fusionadas muy suculentas separadas por una fisura central. El patron de puntos oscuros sobre fondo ocre/pardo corresponde a celulas ricas en taninos que actuan como ventanas translucidas para conducir la luz hacia el interior donde ocurre la fotosintesis.	{"ph": "6.5 - 7.0 (neutro a ligeramente acido)", "luz": "10,000+ lux. Sol directo de la manana y sombra parcial en horas mas intensas de la tarde. Las ventanas en la parte superior conducen luz hacia el interior para la fotosintesis", "notas": "Ante la duda, NO riegues. Es mil veces mas facil matar un Lithops por exceso de agua que por sequia extrema. Usar macetas profundas (min 10 cm) para la raiz pivotante", "riego": "CERO agua durante la muda. Riego profundo cada 3-4 semanas solo en etapa activa (otono e inicio de primavera). Si hojas firmes: no regar. Si se arrugan ligeramente: es hora de regar", "humedad": "Muy baja (< 30%). Prosperan en ambientes aridos. Requieren excelente ventilacion en interiores para evitar pudricion fungica", "sustrato": "80-90% mineral (pomez, arena gruesa de silice, grava volcanica) + 10-20% organico (tierra para cactus sin cortezas). Macetas profundas minimo 10 cm por la raiz pivotante", "temperatura": "18°C - 30°C. Toleran frio nocturno hasta 5°C SOLO si el sustrato esta estrictamente seco. Evitar baja temperatura combinada con humedad en raices"}	2026-04-28 06:25:58.59123	LFUL	{"ciclo_vida": "Germinacion: Semillas como polvo. Germinan con alta humedad inicial, pero las plantulas deben pasar gradualmente a condiciones secas para evitar pudricion (damping-off).\\nCrecimiento vegetativo y Muda: A finales de invierno/primavera, un nuevo par de hojas emerge del centro de la fisura. Las hojas viejas se secan lentamente convirtiendose en costras de papel, transfiriendo agua y nutrientes al nuevo par. NO regar bajo ninguna circunstancia durante este proceso.\\nFloracion: Mediados o finales de otono. Flor tipo margarita (amarilla o blanca segun especie) emerge de la fisura central y se abre por las tardes.\\nFructificacion: Tras polinizacion cruzada, se forma una capsula higrocasica (solo se abre y libera semillas cuando llueve).", "maduracion": "Tiempo: 3-4 anos desde semilla para alcanzar madurez sexual y producir la primera flor.\\nIndicadores: En plantas maduras, durante la muda una cabeza (par de hojas) puede dividirse dando lugar a dos pares, formando gradualmente agrupaciones multicefalas con los anos.", "notas_cultivo": "Riego: Ante la duda, no riegues. El exceso de agua es la causa de muerte mas comun.\\nMuda: No arrancar hojas viejas aunque se vean feas. Dejar que la planta las reabsorba completamente.\\nLuz en interiores: Ubicar en ventana con mayor exposicion solar (orientacion este o norte preferible). Si empiezan a estirarse perdiendo su forma plana (etiolacion), necesitan mas luz urgentemente.\\nMaceta: Usar macetas profundas (minimo 10 cm) para la larga raiz pivotante principal."}	{"luz_lux": 15000.0, "sustrato": "90% Mineral", "ph_sustrato": 6.8, "temperatura_c": 24.0, "humedad_relativa_pct": 25.0}	especie
\.


--
-- Data for Name: especimenes; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.especimenes (id, uid, especie, especie_id, fecha_ingreso, origen, estado, notas, created_at, linea_id, variegacion_id, coordenadas, indice, madre_id, padre_id) FROM stdin;
f204241e-2000-4cd2-883f-cd6341217c4b	TEST-001	Agave tequilana	\N	2026-04-27	Campo norte	activo	\N	2026-04-27 23:31:39.184747	\N	\N	\N	\N	\N	\N
4c36758e-d05c-46ca-94ac-6e8b74b9c531	TEST-002	Agave tequilana	\N	2026-04-27	\N	activo	\N	2026-04-27 23:32:11.425658	\N	\N	\N	\N	\N	\N
cc521fff-95db-461d-a654-5772ae16b135	TEST-003	Agave tequilana	\N	2026-04-27	\N	activo	\N	2026-04-27 23:32:41.278086	\N	\N	\N	\N	\N	\N
6944a9bc-a3e8-4f4e-9c94-3e2c59fa5a21	MOSS-24042810-001	Sphagnum magellanicum	e179b89f-6c04-4507-99d6-dfb26a5f6b78	2026-04-24	Pared Norte Jardin Apto 113 Calle del sol	activo	\N	2026-04-28 04:07:03.322991	\N	\N	{"lat": 4.5967695929793875, "lng": -74.07157301902772}	\N	\N	\N
5f502971-a9f4-4437-90a5-65c2c98bd961	MOSS-260424-104816-01	Sphagnum magellanicum	e179b89f-6c04-4507-99d6-dfb26a5f6b78	2026-04-24	pared con vista al sur del jardin privado apto 213 calle del sol	activo	\N	2026-04-28 04:49:31.027212	\N	\N	{"lat": 4.596784464775855, "lng": -74.07154619693758}	\N	\N	\N
3c9b091c-1f0a-4872-a07c-7efe1e99bc7d	MOSS-240428-100944-01	Sphagnum magellanicum	e179b89f-6c04-4507-99d6-dfb26a5f6b78	2026-04-24	pared sur 	activo	\N	2026-04-28 05:12:13.556294	\N	\N	{"lat": 4.596779117613114, "lng": -74.07157301902772}	\N	\N	\N
eb62924b-6d18-45fb-b365-9eef72d3fde1	NPNTH-260428-111111-01	Nepenthes Khasiensis x ventricosa x maxima	ce8f5267-3380-407b-9722-2aa9c18b55c3	2026-04-28	Comprada a proveedor de plantas de colección.	activo	\N	2026-04-28 05:47:28.134902	\N	\N	{"lat": 4.60620610316945, "lng": -74.07353639602663}	\N	\N	\N
a58f3943-0c69-4169-ad95-72abe245095b	DARL-260428-061326-01	Darlingtonia californica	be25e0ef-afd7-42c9-845f-68dde2b5b79e	2026-04-28	Registro inicial	activo	\N	2026-04-28 06:13:26.774678	\N	\N	null	\N	\N	\N
11d1c7c4-cd34-4499-9725-c86fb0623596	COTV-260428-061946-01	Cotyledon tomentosa subsp. ladismithiensis variegata	d815c9e0-7fbd-4420-8256-11af5e1a6e51	2026-04-28	Registro inicial	activo	\N	2026-04-28 06:19:46.91971	\N	\N	null	\N	\N	\N
d5d9b3dc-5522-492f-aae2-cc7531af6be8	LFUL-260428-062558-01	Lithops fulviceps	77aed2f3-7ab0-4674-9e47-a0877200263b	2026-04-28	Registro inicial	activo	\N	2026-04-28 06:25:58.620518	\N	\N	null	\N	\N	\N
646dc187-466a-4c36-abfb-109d6be652e4	SYNG-260428-063132-01	Syngonium podophyllum	0794a1fb-8331-4f6a-8099-4b179f1c567d	2026-04-28	Colección personal	activo	Ejemplar con variegación quimérica. Se observa ligera necrosis en bordes blancos. Requiere humedad alta (60-80%).	2026-04-28 06:31:40.540096	135eccee-c723-47ab-82d2-be176e1a678b	4938b902-b262-415c-90cf-894723c18266	null	\N	\N	\N
4bc7e677-216e-4a34-b52c-9c13c6da2637	MOSS-260428-073553-01	Sphagnum magellanicum	e179b89f-6c04-4507-99d6-dfb26a5f6b78	2026-04-28	Sustrato vivo (Asociación)	activo	Musgo acompañando como sustrato vivo a la Nepenthes (ID: eb62924b-6d18-45fb-b365-9eef72d3fde1). Requiere humedad de saturación.	2026-04-28 07:35:59.704624	\N	\N	null	\N	\N	\N
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.eventos (id, tipo, descripcion, especimen_id, elemento_id, experimento_id, usuario_id, "timestamp", meta, ejecutado_por_id) FROM stdin;
e3ad5bc9-3f51-4f23-99d4-54178f263fb1	sanitizacion	Sanitización de campana de flujo laminar	cc521fff-95db-461d-a654-5772ae16b135	\N	\N	40a58428-7a27-4462-87f1-4d4f07443de9	2026-04-28 00:01:55.406467	null	072df402-5190-4fd8-86f1-2d20ede25fac
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
\.


--
-- Data for Name: experimentos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.experimentos (id, nombre, hipotesis, protocolo_id, fecha_inicio, fecha_fin, estado, director_id, notas, created_at, operador_id, config_estandar, especie_id, linea_id, variegacion_id) FROM stdin;
\.


--
-- Data for Name: lineas; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.lineas (id, especie_id, nombre, descripcion, notas, created_at, metodo_propagacion, config_estandar) FROM stdin;
135eccee-c723-47ab-82d2-be176e1a678b	0794a1fb-8331-4f6a-8099-4b179f1c567d	Albo Variegatum	Variedad con variegación blanca estable pero inestable en balance.	Requiere poda si revierte a verde o si sale totalmente blanca.	2026-04-28 06:31:07.569857	clonacion	{}
\.


--
-- Data for Name: protocolos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.protocolos (id, nombre, tipo, version, descripcion, pasos, materiales, estado_validacion, creado_por_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: registros_evolucion; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.registros_evolucion (id, especimen_id, registrado_por_id, protocolo_clonacion_id, fecha, altura_cm, ancho_hoja_max_cm, largo_hoja_max_cm, num_hojas, num_brotes, num_hijuelos, num_nodos, diametro_tallo_mm, porcentaje_variegacion, patron_variegacion, color_variegacion, sustrato, tipo_contenedor, diametro_contenedor_cm, temperatura_c, humedad_relativa_pct, humedad_sustrato_pct, ph_sustrato, luz_lux, conductividad_ec, fotos, notas, npk, ppm, sustrato_id) FROM stdin;
\.


--
-- Data for Name: resultados_investigacion; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.resultados_investigacion (id, experimento_id, titulo, tipo, descripcion, datos, archivos, registrado_por_id, fecha) FROM stdin;
\.


--
-- Data for Name: sustratos; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.sustratos (id, codigo_formulacion, nombre, descripcion, componentes, ph_teorico, conductividad_teorica, created_at) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.usuarios (id, nombre, email, hashed_password, rol, activo, created_at, foto_url) FROM stdin;
072df402-5190-4fd8-86f1-2d20ede25fac	Hellen Cardenas	cardenashellen937@gmail.com	$2b$12$meTs7cCFKto5P4Cf.NMAZ.4147M8QB3u6mCQYS7gln2Fh2c0R6cmG	admin	t	2026-04-27 23:55:18.946786	\N
40a58428-7a27-4462-87f1-4d4f07443de9	Juan Jose Alban	jalban.arq@gmail.com	$2b$12$CGAMQP7sNrgO35eWH.db6.0S4pISutBBtr2qw7cyf0bVToV7yJ3eS	admin	t	2026-04-27 23:31:30.804164	\N
\.


--
-- Data for Name: validaciones_protocolo; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.validaciones_protocolo (id, protocolo_id, experimento_id, usuario_id, resultado, observaciones, metricas, fecha) FROM stdin;
\.


--
-- Data for Name: variegaciones; Type: TABLE DATA; Schema: public; Owner: lbms
--

COPY public.variegaciones (id, linea_id, nombre, descripcion, notas, created_at, config_estandar, codigo) FROM stdin;
4938b902-b262-415c-90cf-894723c18266	135eccee-c723-47ab-82d2-be176e1a678b	Sectorial y Moteada	Patrón quimérico con sectores blancos puros y salpicado (mint/moteado).	Zonas blancas frágiles, propensas a necrosis si hay baja humedad.	2026-04-28 06:31:23.558869	{}	\N
\.


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
-- Name: protocolos protocolos_pkey; Type: CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.protocolos
    ADD CONSTRAINT protocolos_pkey PRIMARY KEY (id);


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
-- Name: ix_especimenes_especie_id; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_especimenes_especie_id ON public.especimenes USING btree (especie_id);


--
-- Name: ix_especimenes_uid; Type: INDEX; Schema: public; Owner: lbms
--

CREATE UNIQUE INDEX ix_especimenes_uid ON public.especimenes USING btree (uid);


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
-- Name: ix_reg_evol_especimen; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_reg_evol_especimen ON public.registros_evolucion USING btree (especimen_id);


--
-- Name: ix_reg_evol_fecha; Type: INDEX; Schema: public; Owner: lbms
--

CREATE INDEX ix_reg_evol_fecha ON public.registros_evolucion USING btree (fecha);


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
-- Name: lineas lineas_especie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lbms
--

ALTER TABLE ONLY public.lineas
    ADD CONSTRAINT lineas_especie_id_fkey FOREIGN KEY (especie_id) REFERENCES public.especies(id);


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
-- PostgreSQL database dump complete
--

\unrestrict vhKdZeo46rgSLcWIJPyd9gp87P2G26chEF4ImCYAXF3CzBNYLSHKy9tHulF3Ih9

