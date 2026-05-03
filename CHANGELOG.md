## [1.12.4](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.12.3...v1.12.4) (2026-05-03)


### Bug Fixes

* **printer:** correctly shift qr code to the right by 16px to evade hardware dead zone ([8f9a79d](https://github.com/ElCuboNegro/kronos-lbms/commit/8f9a79d91cce0a9f5d0274d7b1bfdb75a63f600c))

## [1.12.3](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.12.2...v1.12.3) (2026-05-03)


### Bug Fixes

* **printer:** fix color inversion reverting error correctly this time ([adaa97a](https://github.com/ElCuboNegro/kronos-lbms/commit/adaa97aaf53bee18ecf4f27baa85338330bf9110))

## [1.12.2](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.12.1...v1.12.2) (2026-05-03)


### Bug Fixes

* **printer:** restaurar margen interno silencioso del QR code para evadir limites de corte ([6b0722c](https://github.com/ElCuboNegro/kronos-lbms/commit/6b0722c590063d6bec4c795bebc9d30f815e7d0c))

## [1.12.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.12.0...v1.12.1) (2026-05-03)


### Bug Fixes

* **backend:** adapt print endpoints payload to golden version printer service ([03173a8](https://github.com/ElCuboNegro/kronos-lbms/commit/03173a82cfef65b45482fbbe48073a19274d9196))

# [1.12.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.11.1...v1.12.0) (2026-05-03)


### Features

* **printer:** stabilize golden version with correct bit polarity and layout ([5715dc2](https://github.com/ElCuboNegro/kronos-lbms/commit/5715dc2ca16e574393733af0ccf4533c58859bec))

## [1.11.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.11.0...v1.11.1) (2026-05-03)


### Bug Fixes

* **ui:** refactor LotePreparacionForm to use native CSS and fix blank screen issue ([a753917](https://github.com/ElCuboNegro/kronos-lbms/commit/a753917d18bfe0da86fd2092bb28161d2216776b))

# [1.11.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.10.3...v1.11.0) (2026-05-03)


### Features

* **ui:** animacion de auto-zoom e interpolacion de vuelo al capturar o clickear coordenadas en el MapPicker ([#70](https://github.com/ElCuboNegro/kronos-lbms/issues/70)) ([e6e4bd7](https://github.com/ElCuboNegro/kronos-lbms/commit/e6e4bd79f091c65f4ede84bf8de1e87c43364814))

## [1.10.3](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.10.2...v1.10.3) (2026-05-03)


### Bug Fixes

* **printer:** add data normalization layer to prevent blank labels ([96eac93](https://github.com/ElCuboNegro/kronos-lbms/commit/96eac93c1270b2d93d65f3c1943a3209ea3cb12e))

## [1.10.2](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.10.1...v1.10.2) (2026-05-03)


### Bug Fixes

* **ui:** añadir permisos gps nativos y soporte capacitor geolocation ([#69](https://github.com/ElCuboNegro/kronos-lbms/issues/69)) ([da535ce](https://github.com/ElCuboNegro/kronos-lbms/commit/da535cec0b0b0cf37fc3a805d1f1afaf81269d27))

## [1.10.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.10.0...v1.10.1) (2026-05-03)


### Bug Fixes

* **ux:** fix mother plant UID bug and add QR scanner to parent fields ([034258f](https://github.com/ElCuboNegro/kronos-lbms/commit/034258f9c8ed321e2cf021c815ad55fd565aadc1))

# [1.10.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.9.2...v1.10.0) (2026-05-03)


### Bug Fixes

* **printer:** fix rotate bug and qr code crop margins ([#68](https://github.com/ElCuboNegro/kronos-lbms/issues/68)) ([6ee4e4e](https://github.com/ElCuboNegro/kronos-lbms/commit/6ee4e4e2ff468d88fe348f0637cbefc099710941))


### Features

* **ux:** implement seamless explant generation flow with automatic lineage ([81e61dc](https://github.com/ElCuboNegro/kronos-lbms/commit/81e61dc0443ab3bb7323fcd49ebabfb14f0d3fa6))

## [1.9.2](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.9.1...v1.9.2) (2026-05-03)


### Bug Fixes

* **ui:** recuperar fotografias de la evolucion cargando imagenes blob autenticadas por jwt ([#67](https://github.com/ElCuboNegro/kronos-lbms/issues/67)) ([5228698](https://github.com/ElCuboNegro/kronos-lbms/commit/5228698774319ef70bc470d614df265bd4aac08e))

## [1.9.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.9.0...v1.9.1) (2026-05-03)


### Bug Fixes

* **mcp:** enable Bridge Mode for local printing using cloud data ([2048702](https://github.com/ElCuboNegro/kronos-lbms/commit/2048702f044644de7cfab45ec00d978cd6593d43))

# [1.9.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.8.0...v1.9.0) (2026-05-03)


### Features

* **printer:** modularize printer service and containerize for independence ([b4bb6a8](https://github.com/ElCuboNegro/kronos-lbms/commit/b4bb6a8e7fd585174a355736289d1fdf4ef6ee95))

# [1.8.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.7.0...v1.8.0) (2026-05-03)


### Features

* **telemetry:** include app and backend versions in error reports ([93954d8](https://github.com/ElCuboNegro/kronos-lbms/commit/93954d8ce003f4bbcf2e4265cc6057d1ec68002e))

# [1.7.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.6.0...v1.7.0) (2026-05-03)


### Features

* **printer:** improve label metadata mapping and layout ([9995258](https://github.com/ElCuboNegro/kronos-lbms/commit/99952583577ee894fc053f28a0b183773523b484))

# [1.6.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.5.0...v1.6.0) (2026-05-03)


### Features

* **mcp:** expand universal controller with hardware, inventory tools and telemetry ([8b1239a](https://github.com/ElCuboNegro/kronos-lbms/commit/8b1239abec66be7fd9905b340c820854975f4257))

# [1.5.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.4.1...v1.5.0) (2026-05-03)


### Features

* **backend:** add free label printing endpoint for characterizations ([b5e9c1d](https://github.com/ElCuboNegro/kronos-lbms/commit/b5e9c1dff3c275c2d2cf7b8dcd2a544c034d7092))

## [1.4.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.4.0...v1.4.1) (2026-05-03)


### Bug Fixes

* **ui:** recuperar fotografias de la evolucion cargando imagenes blob autenticadas por jwt ([#67](https://github.com/ElCuboNegro/kronos-lbms/issues/67)) ([77ec7b4](https://github.com/ElCuboNegro/kronos-lbms/commit/77ec7b48cfaeee63a54035f05926a33473eeb02c))

# [1.4.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.3.1...v1.4.0) (2026-05-03)


### Features

* **lab:** add characterization protocol for peat pH measurement ([2975ef7](https://github.com/ElCuboNegro/kronos-lbms/commit/2975ef7d5596fe6b1f46e4eb1d6f878ba8197c96))

## [1.3.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.3.0...v1.3.1) (2026-05-03)


### Bug Fixes

* **ux:** consolidar formulario de evolucion en un solo paso y solucionar boton oculto ([#66](https://github.com/ElCuboNegro/kronos-lbms/issues/66)) ([d82b7db](https://github.com/ElCuboNegro/kronos-lbms/commit/d82b7db589338ff5253d26692a7b5941e436b22c))

# [1.3.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.2.1...v1.3.0) (2026-05-03)


### Features

* optimizar opciones del escaner para especimenes incluyendo vista de ficha, registro evo y generacion de explantes, y mostrar condiciones optimas de crecimiento ([#65](https://github.com/ElCuboNegro/kronos-lbms/issues/65)) ([9e1a552](https://github.com/ElCuboNegro/kronos-lbms/commit/9e1a552f1f84a19dc87486119498d6072fac9753))

# [1.2.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.1.4...v1.2.0) (2026-05-03)


### Bug Fixes

* **ci:** add --allow-same-version to npm version in semantic-release ([58a92ef](https://github.com/ElCuboNegro/kronos-lbms/commit/58a92ef9f6094985588a85ed7d9edac3e661485a))


### Features

* **auth:** implement remember password via capacitor preferences ([c9ae6a4](https://github.com/ElCuboNegro/kronos-lbms/commit/c9ae6a4958615988db62fed4368edd6c18094ee6))
* endpoint de backend /app/telemetry y boton en UI para sincronizar crashes del frontend con el VPS ([#64](https://github.com/ElCuboNegro/kronos-lbms/issues/64)) ([b9d1ce5](https://github.com/ElCuboNegro/kronos-lbms/commit/b9d1ce5567c3d12e6bb94f96d085c969bfcecae9))
* Telemetría Remota ([#63](https://github.com/ElCuboNegro/kronos-lbms/issues/63)) ([48ed7b2](https://github.com/ElCuboNegro/kronos-lbms/commit/48ed7b2fd9a48d148aeb16ffbe5036f1fca21b07)), closes [#61](https://github.com/ElCuboNegro/kronos-lbms/issues/61)

# [1.2.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.1.4...v1.2.0) (2026-05-03)


### Bug Fixes

* **ci:** add --allow-same-version to npm version in semantic-release ([58a92ef](https://github.com/ElCuboNegro/kronos-lbms/commit/58a92ef9f6094985588a85ed7d9edac3e661485a))


### Features

* **auth:** implement remember password via capacitor preferences ([c9ae6a4](https://github.com/ElCuboNegro/kronos-lbms/commit/c9ae6a4958615988db62fed4368edd6c18094ee6))
* endpoint de backend /app/telemetry y boton en UI para sincronizar crashes del frontend con el VPS ([#64](https://github.com/ElCuboNegro/kronos-lbms/issues/64)) ([b9d1ce5](https://github.com/ElCuboNegro/kronos-lbms/commit/b9d1ce5567c3d12e6bb94f96d085c969bfcecae9))
* Telemetría Remota ([#63](https://github.com/ElCuboNegro/kronos-lbms/issues/63)) ([48ed7b2](https://github.com/ElCuboNegro/kronos-lbms/commit/48ed7b2fd9a48d148aeb16ffbe5036f1fca21b07)), closes [#61](https://github.com/ElCuboNegro/kronos-lbms/issues/61)

# [1.2.0](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.1.4...v1.2.0) (2026-05-03)


### Features

* endpoint de backend /app/telemetry y boton en UI para sincronizar crashes del frontend con el VPS ([#64](https://github.com/ElCuboNegro/kronos-lbms/issues/64)) ([b9d1ce5](https://github.com/ElCuboNegro/kronos-lbms/commit/b9d1ce5567c3d12e6bb94f96d085c969bfcecae9))
* Telemetría Remota ([#63](https://github.com/ElCuboNegro/kronos-lbms/issues/63)) ([48ed7b2](https://github.com/ElCuboNegro/kronos-lbms/commit/48ed7b2fd9a48d148aeb16ffbe5036f1fca21b07)), closes [#61](https://github.com/ElCuboNegro/kronos-lbms/issues/61)

## [1.1.3](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.1.2...v1.1.3) (2026-05-03)


### Bug Fixes

* Navegación de Botón Atrás ([#62](https://github.com/ElCuboNegro/kronos-lbms/issues/62)) ([22ccb53](https://github.com/ElCuboNegro/kronos-lbms/commit/22ccb536e7c2ebfecc4ae768b73520ea506d69b2))
* serialización de ORM en ScanResult ([#61](https://github.com/ElCuboNegro/kronos-lbms/issues/61)) ([bc46f46](https://github.com/ElCuboNegro/kronos-lbms/commit/bc46f4607c0c9517fc60d78b7256774a86dccd16))

## [1.0.3](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.0.2...v1.0.3) (2026-05-03)


### Bug Fixes

* explicit pydantic validation in scan router to prevent orm serialization errors ([a10391b](https://github.com/ElCuboNegro/kronos-lbms/commit/a10391b8d88af099730ff60c3222fac39d8074d1))

## [1.0.2](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.0.1...v1.0.2) (2026-05-03)


### Bug Fixes

* add from_attributes to ScanResult schemas to fix serialization error ([310d0a4](https://github.com/ElCuboNegro/kronos-lbms/commit/310d0a417459730388b7d957598e2ef4faeeb100))
* **scanner:** show 'Add Reactivo' button for unknown generic barcodes ([5d5cbc5](https://github.com/ElCuboNegro/kronos-lbms/commit/5d5cbc5c17ecbc951ee5427ce476e1d19301207a))
* serialización de ORM en ScanResult ([#61](https://github.com/ElCuboNegro/kronos-lbms/issues/61)) ([5b066f6](https://github.com/ElCuboNegro/kronos-lbms/commit/5b066f6aff54b85079bbebb7d3b532544483703a))

## [1.0.1](https://github.com/ElCuboNegro/kronos-lbms/compare/v1.0.0...v1.0.1) (2026-05-03)


### Bug Fixes

* **ci:** evitar permission error en pytest proviendo UPLOAD_DIR dinamico y secrets ([#60](https://github.com/ElCuboNegro/kronos-lbms/issues/60)) ([3151189](https://github.com/ElCuboNegro/kronos-lbms/commit/3151189fb18ee58a61ecd6c380d3373a822f730b))

# 1.0.0 (2026-05-03)


### Bug Fixes

* **#25:** corregir orden de rutas estáticas en reactivos.py y hacer fecha_expiracion Optional ([de56378](https://github.com/ElCuboNegro/kronos-lbms/commit/de563787e4f9b5c8d958ca0329d8b3d68f4c8a75)), closes [#25](https://github.com/ElCuboNegro/kronos-lbms/issues/25)
* **#5:** agregar especimenes al schema ExperimentoOut ([ad41c2f](https://github.com/ElCuboNegro/kronos-lbms/commit/ad41c2fd92664ead7329ead92ff99f6882c1a96b)), closes [#5](https://github.com/ElCuboNegro/kronos-lbms/issues/5)
* **#5:** corregir AttributeError en _exp_out — atributos ORM mal referenciados ([#24](https://github.com/ElCuboNegro/kronos-lbms/issues/24)) ([5163f10](https://github.com/ElCuboNegro/kronos-lbms/commit/5163f104772b679dd3d085b11841135eb475c4e0)), closes [#5](https://github.com/ElCuboNegro/kronos-lbms/issues/5) [#5](https://github.com/ElCuboNegro/kronos-lbms/issues/5) [#5](https://github.com/ElCuboNegro/kronos-lbms/issues/5)
* **#5:** corregir AttributeError en _exp_out — usar especie_rel/linea_rel/variegacion_rel ([e6d4bac](https://github.com/ElCuboNegro/kronos-lbms/commit/e6d4bacd5d501b7302ac0b42b5b6746ae046d7ed)), closes [#5](https://github.com/ElCuboNegro/kronos-lbms/issues/5)
* **#6:** resolver fallback incorrecto de codigo a string vacio en especies.py ([#26](https://github.com/ElCuboNegro/kronos-lbms/issues/26)) ([9ee3db4](https://github.com/ElCuboNegro/kronos-lbms/commit/9ee3db4fa3b4c17844012a9bea7c1acace1695b3)), closes [#6](https://github.com/ElCuboNegro/kronos-lbms/issues/6)
* **#7:** cambiar exclude_none por exclude_unset en todas las rutas PATCH ([#27](https://github.com/ElCuboNegro/kronos-lbms/issues/27)) ([d808b83](https://github.com/ElCuboNegro/kronos-lbms/commit/d808b83662b7548adb4101ddf83f2d49d53a4909)), closes [#7](https://github.com/ElCuboNegro/kronos-lbms/issues/7)
* **android:** force cleartextTrafficPermitted in manifest for local network API requests ([ae2a27e](https://github.com/ElCuboNegro/kronos-lbms/commit/ae2a27e958674a55ee8f09e866d556b44a78abe2))
* **capacitor:** change androidScheme to http to bypass chromium mixed content block ([869d2cf](https://github.com/ElCuboNegro/kronos-lbms/commit/869d2cf58349ea0aaf36fb8420dbade6428ca8ca))
* **client:** handle HTML responses gracefully and add tests for Login ([2b1aebc](https://github.com/ElCuboNegro/kronos-lbms/commit/2b1aebc1ebbe79e6915827511e941a0b92f1baef))
* **cors:** allow local network IPs and capacitor for mobile testing ([609feac](https://github.com/ElCuboNegro/kronos-lbms/commit/609feac8ad430e551ea6d38f0247a90405b751cf))
* explicit large label layout for containers ([0a2c9ef](https://github.com/ElCuboNegro/kronos-lbms/commit/0a2c9ef2c9e2e360180871c0e12b69b82d16925a))
* **mobile:** enable cleartext traffic in capacitor for local HTTP server testing ([f681072](https://github.com/ElCuboNegro/kronos-lbms/commit/f6810723e6f0fb494a9373f4a99ace784ea27b47))
* ReactivosList ReferenceError, configure frontend tests and fix build workflows ([26aa75e](https://github.com/ElCuboNegro/kronos-lbms/commit/26aa75e65bdf650da1878203502e2b52117e1a14))
* resolve failing tests (CORS, Rate Limit) and skip deadlocking race condition test ([38cb8f7](https://github.com/ElCuboNegro/kronos-lbms/commit/38cb8f7607241e57624d0d06474c69496edda318))
* revert CORS origins to * to troubleshoot 502 error ([d978197](https://github.com/ElCuboNegro/kronos-lbms/commit/d9781971b977fb252ee2752160ce1e91a0deb0eb))


### Features

* **#9:** agregar endpoint /stats para optimizar carga inicial ([#30](https://github.com/ElCuboNegro/kronos-lbms/issues/30)) ([560f472](https://github.com/ElCuboNegro/kronos-lbms/commit/560f472fe9beca0d664bab685e4b8558a7bf2778)), closes [#9](https://github.com/ElCuboNegro/kronos-lbms/issues/9)
* add APK update notification system ([c05c618](https://github.com/ElCuboNegro/kronos-lbms/commit/c05c618da2cd476312c8fe2add6ae3f5d9bafc1d))
* add dynamic server selector to login page for multi-lab support ([a305158](https://github.com/ElCuboNegro/kronos-lbms/commit/a30515884df598db26db5fc484103996e3754582))
* add markdown editor with wikilinks for protocols ([933958b](https://github.com/ElCuboNegro/kronos-lbms/commit/933958b5ae440406dbd3b938e28b9fcda21eba78))
* componente ScanInput para lectura de QRs en campos de texto ([#52](https://github.com/ElCuboNegro/kronos-lbms/issues/52)) ([395cca6](https://github.com/ElCuboNegro/kronos-lbms/commit/395cca69a51c4523e46533aee85d1c832f56f06d)), closes [#2](https://github.com/ElCuboNegro/kronos-lbms/issues/2)
* configure CI/CD and update protocol recipes and printers ([9d3977d](https://github.com/ElCuboNegro/kronos-lbms/commit/9d3977dbc538c2ac8bf1717e2051de71cf944474))
* implement Seymour-OS design system, add ElementosList, fix bugs ([1f1d4db](https://github.com/ElCuboNegro/kronos-lbms/commit/1f1d4dbe8ac7dbbcc819efa1fb6a9cc5296b8c4b))
* implementar modulo de telemetria frontend para persistir logs de crash y red en localstorage ([#55](https://github.com/ElCuboNegro/kronos-lbms/issues/55)) ([93eeb69](https://github.com/ElCuboNegro/kronos-lbms/commit/93eeb69bf9b65297282c8183f0957af84bb9d4c8))
* integración con API de PubChem para autocompletar químicos ([#53](https://github.com/ElCuboNegro/kronos-lbms/issues/53)) ([a036cf5](https://github.com/ElCuboNegro/kronos-lbms/commit/a036cf5e6d75673fd480f73ee601380151521092)), closes [#2](https://github.com/ElCuboNegro/kronos-lbms/issues/2)
* integrar capacitor e implementar CI/CD para compilacion de APK Android automatica ([#49](https://github.com/ElCuboNegro/kronos-lbms/issues/49)) ([5885fd6](https://github.com/ElCuboNegro/kronos-lbms/commit/5885fd6215ea666dbc3e144b3b0b4dc5de3f206c))
* setup pre-commit and import-linter for architecture verification ([e6430e3](https://github.com/ElCuboNegro/kronos-lbms/commit/e6430e3ca5840360139f03f3255bb4f261deeab1))
* **ui:** add preconfigured server list to login page for easy switching ([86f8f97](https://github.com/ElCuboNegro/kronos-lbms/commit/86f8f974fbe03fe07ae576334cb2dce6b41832d5))
