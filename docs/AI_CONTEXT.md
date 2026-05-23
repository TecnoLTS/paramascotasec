# ParamascotasEC - AI_CONTEXT.md

> Copia versionada de `/home/admincenter/contenedores/AGENTS.md`.
> Si este archivo y `AGENTS.md` difieren, manda `AGENTS.md` en la raiz del workspace.
> Ultima sincronizacion: 2026-05-23.

# ParamascotasEC - AGENTS.md

Fuente canonica de contexto IA para `/home/admincenter/contenedores`.
`MapaCompleto.md` es el mapa tecnico amplio; este archivo conserva reglas operativas, decisiones vigentes y avances importantes.

## Proposito del proyecto

ParamascotasEC es un workspace integrado para e-commerce de mascotas en Ecuador. Incluye frontend Next.js, backend PHP, base PostgreSQL, microservicio de facturacion electronica SRI y gateway Nginx/Certbot.

El objetivo operativo es mantener un entorno desplegable por scripts, con reglas de negocio server-side, seguridad admin estricta y contexto suficiente para que una IA o un desarrollador pueda continuar trabajo sin redescubrir decisiones recientes.

## Mantenimiento de contexto IA

- `AGENTS.md` en la raiz del workspace es la fuente canonica.
- La copia versionada vive en `paramascotasec/docs/AI_CONTEXT.md`; si hay conflicto, manda este archivo raiz.
- Al cerrar trabajo importante, actualizar primero `AGENTS.md` y luego sincronizar la copia versionada.
- Registrar avances en `Historial de trabajo IA` con fecha, objetivo, cambios, decisiones y pendientes. Consolidar entradas antiguas para evitar duplicados temporales.
- No guardar secretos, passwords, tokens reales, certificados, llaves `.p12` ni datos sensibles de clientes.
- La raiz `/home/admincenter/contenedores` no es repo Git; los componentes (`paramascotasec`, `paramascotasec-backend`, `Facturador`, `Gateway`, `paramascotasec-DB`) son repos separados.

## Despliegue critico

**Nunca ejecutar `docker compose up` directamente**: rompe el ruteo SSL y el aislamiento por perfiles. Usar siempre scripts de deploy.

```bash
# Workspace completo, en este orden:
cd /home/admincenter/contenedores
./deploy-development.sh       # dev: certificado autofirmado
./deploy-production.sh        # prod: Let's Encrypt

# Orden orquestado por scripts/deploy-workspace.sh:
# Facturador -> DB -> Backend -> Frontend -> Gateway

# Componente individual:
cd <component> && ./scripts/deploy-{mode}.sh

# Bootstrap de DB vacia (requiere DB + Backend corriendo):
cd paramascotasec-backend
RUN_COMPOSER_INSTALL=1 RUN_DB_SETUP=1 ./scripts/deploy-development.sh
```

## Red

Todos los contenedores comparten la red bridge externa `edge`, creada por los scripts.

| Servicio | Host interno | Notas |
|----------|--------------|-------|
| Backend API | `http://paramascotasec-backend-web/api` | PHP-FPM detras de Nginx |
| Frontend | `http://paramascotasec-frontend:3000` | Next.js |
| Facturador | `http://facturador:8084` | Billing/SRI |
| DB principal | `db:5432` | PostgreSQL principal |

## Arquitectura

| Componente | Tech | Contenedores |
|------------|------|--------------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS + TypeScript | `paramascotasec-app` prod / `paramascotasec-app-dev` dev |
| Backend | PHP 8.2 MVC propio + PostgreSQL | `paramascotasec-backend-app`, `paramascotasec-backend-web` |
| Database | PostgreSQL 16 | `next-test-db` |
| Facturador | PHP 8.2 + PostgreSQL | `billing-service`, `billing-recovery-worker`, `billing-postgres`, `billing-nginx` |
| Gateway | Nginx + Certbot | `nginx-gateway`, `certbot` |

## Frontend `paramascotasec/app`

- Entry point: `src/app/layout.tsx`; rutas con Next.js App Router en `src/app/`.
- Comandos desde `paramascotasec/app`:

```bash
npm run dev          # hot reload; webpack por defecto, FRONTEND_DEV_BUNDLER=turbopack para Turbopack
npm run build        # build produccion
npm run lint         # ESLint --max-warnings=0
npm run typecheck    # tsc --noEmit
npm run test         # lint + typecheck
```

- Prebuild: `npm run images:manifest` antes de dev/build/lint/start; `images:home-performance` e `images:upload-variants` antes de build.
- Perfiles frontend exclusivos: `development` usa `paramascotasec-app-dev`; `production` usa `paramascotasec-app`. Los scripts remueven el perfil opuesto.
- Dev runtime via `FRONTEND_DEV_RUNTIME`: `hot` por defecto; `stable` precompila produccion detras del gateway.

## Backend `paramascotasec-backend`

- Entry point: `public/index.php`.
- Arquitectura: MVC propio sin framework; Router custom, JWT auth, CORS, CSRF y tenant resolution.
- Namespace PHP: `App\` -> `src/`.
- Bootstrap DB: `scripts/bootstrap_schema.php`, ejecutado con `RUN_DB_SETUP=1`.
- Composer se instala en deploy cuando falta `vendor/autoload.php` o se define `RUN_COMPOSER_INSTALL=1`.

## Facturador SRI Ecuador

- Requiere certificado `.p12` en `Facturador/certs/firma.p12` como volumen read-only.
- API principal: `POST /api/{env}/v1/invoices` y `GET /api/{env}/v1/invoices/{accessKey}/status`.
- Auth: `X-API-Key` o `Authorization: Bearer`.
- Worker: `php bin/process_pending_invoices.php --limit=50 --min-age-seconds=3600`, ejecutado en loop por `billing-recovery-worker`.
- DB propia: `billing-postgres`, puerto host 5434, puerto interno 5432.
- Rutas por entorno: `FACTURADOR_API_INVOICES_PATH=/api/test/v1/invoices` en dev y `/api/production/v1/invoices` en prod.

## Gateway

- Fragil para SSL y perfiles: nunca levantar manualmente con `docker compose up`.
- Usar `Gateway/scripts/deploy-development.sh` o `Gateway/scripts/deploy-production.sh`.
- `certbot` corre solo en produccion via perfil `certbot`.
- Renovacion manual:

```bash
cd Gateway && ./scripts/renew-letsencrypt.sh
```

## Verificacion

```bash
scripts/check-paramascotas.sh    # frontend lint + typecheck + backend PHP syntax + backend health
```

Para cambios acotados, correr tambien checks del componente afectado cuando aplique.

## Reglas de negocio criticas

- Pricing siempre server-side: el cliente nunca debe enviar `discount`, `total`, `subtotal`, `vat_*`, `shipping`, `grand_total`, `price`, `unit_cost`, `cost_total` ni campos monetarios derivados. `OrderController` los rechaza como manipulacion.
- IVA default: 15% Ecuador. `tax_exempt` por producto; soporta carritos mixtos exentos/no exentos.
- Envio: gratis en Centro/Norte Quito; USD 5.00 para Sur/Valles. Se determina desde direccion via `GET /api/settings/shipping`.
- Descuentos: server-side; tipos porcentaje o fijo; soportan `min_subtotal`, `max_discount`, `max_uses`.
- Inventario FIFO: `inventory_lots` rastrea lotes de compra; ordenes consumen lotes antiguos primero; costos se restauran al cancelar.
- Multi-tenant: tenant por HTTP Host header, fallback a `DEFAULT_TENANT`; config en `config/tenants.php`.

## Seguridad

- Auth: JWT HS256 en cookie httpOnly y Bearer opcional. Payload: `sub`, `email`, `name`, `role`, `tenant_id`, `jti`.
- CSRF: requerido para mutaciones API excepto auth/contact/health/quote. Header `X-CSRF-Token` debe coincidir con cookie `pm_csrf`.
- Rutas admin (`/api/admin/*`, `/api/reports/*`, `/api/users*`, `/api/shipments`): requieren `role='admin'` y allowlist IP opcional (`ADMIN_IP_MODE`, `ADMIN_IP_ALLOWLIST`).
- Bloqueo de cuenta: despues de `AUTH_LOGIN_MAX_ATTEMPTS` (default 5), bloqueo por `AUTH_LOGIN_LOCK_MINUTES` (default 15).
- MFA: OTP por email para admins (`request-otp`, `verify-otp`).
- Proxy interno: `INTERNAL_PROXY_TOKEN` permite auth inter-contenedores sin login.

## Operaciones peligrosas

```bash
# Reset de ventas solamente: preserva clientes, catalogo y config.
cd paramascotasec-backend
./scripts/reset_sales_data.sh development --yes

# Wipe completo + redeploy:
docker stop $(docker ps -aq) 2>/dev/null || true
docker system prune -a --volumes -f
./deploy-development.sh
cd paramascotasec-backend && RUN_COMPOSER_INSTALL=1 RUN_DB_SETUP=1 ./scripts/deploy-development.sh
```

Usar estas operaciones solo cuando el usuario las pida explicitamente o cuando el objetivo dependa de ellas y haya confirmacion clara.

## Analytics y SEO

- Analytics: no integrado. No hay GA4, Hotjar, Clarity, etc.
- Title template: `%s | ParaMascotasEC`.
- Sitemap: `/sitemap.xml`, generado desde `app/sitemap.ts`.
- Google Products Feed: `/feeds/google-products.xml` RSS 2.0.
- Search Console, estado mayo 2026: 1 URL indexada, 98 no indexadas, sitemap no detectado.
- Guia SEO/Google: `paramascotasec/SEO-GOOGLE-SETUP.md`.

## Historial de trabajo IA

### 2026-05-23 - Sitemap de Imagenes Robusto Para Search Console

Objetivo: corregir el error de Search Console en `https://paramascotasec.com/sitemap-images.xml` ("Falta la etiqueta XML url") y evitar respuestas vacias cuando fallan datos dinamicos.

Cambios frontend:
- `sitemap-images.xml/route.ts` sanitiza caracteres XML invalidos, reutiliza render de `<url>` y registra fallos al cargar productos/categorias.
- Si productos/categorias no generan entradas, devuelve fallback valido con `/tienda` y una imagen publica estable, evitando `<urlset>` vacio.
- `audit-seo-merchant.mjs` valida `/sitemap-images.xml`: conteo de `<url>`, imagenes, `<loc>`, imagen por URL y falla con exit code si hay errores estructurales.

Despliegue/verificacion:
- Publicado en este ambiente dev/QA con perfil frontend `production` usando `paramascotasec/scripts/deploy-production.sh`; pendiente promover el mismo cambio a produccion real.
- Verificado `https://paramascotasec.com/sitemap-images.xml`: HTTP 200, 107 URLs, 281 imagenes, `urlsetIsEmpty=false`, `errors=[]`.
- `robots.txt` incluye `sitemap.xml` y `sitemap-images.xml`.

Decisiones:
- Mantener `sitemap-images.xml` como sitemap separado listado en robots; no retirarlo de Search Console porque ya aporta URLs e imagenes validas.
- La causa probable del fallo del 22/05 fue una lectura de Google mientras el generador entrego un `urlset` sin entradas por fallo/intermitencia de datos.

Pendientes:
- Promover el cambio a produccion real, verificar `https://paramascotasec.com/sitemap-images.xml` desde fuera del servidor y reenviar `sitemap-images.xml` en Search Console; Google debe reemplazar el error tras nueva lectura.

### 2026-05-23 - Reportes Actualizados Tras Corregir Costos

Objetivo: evitar que Reporte de trazabilidad, Ranking de productos y resumen financiero sigan mostrando advertencias invalidas o utilidad inflada despues de corregir el costo de un producto.

Cambios backend:
- `OrderRepository::orderItemCostExpression()` y `orderItemUnitCostExpression()` ya no tratan `OrderItem.cost_total = 0` o `unit_cost = 0` como costo definitivo; usan el costo actual de `Product.cost` como respaldo cuando el costo historico de la linea esta vacio o en cero.
- `FinancialPeriodRepository::buildSnapshot()` usa la misma regla de costo efectivo para costo, utilidad bruta y margen del periodo.

Cambios frontend:
- Guardar, retirar, optimizar precio o cambiar publicacion de productos invalida los caches del panel admin, incluyendo `/api/admin/report`, dashboard, inventario y ranking.
- `PanelModals` dispara invalidacion del panel cuando `ProductEditorModal` actualiza productos, por lo que las incidencias de costo cero desaparecen tras guardar el costo y recargar datos.

Decisiones:
- V1 no reescribe historicos en `OrderItem`; el reporte calcula costo efectivo al vuelo para no mantener advertencias obsoletas cuando la ficha del producto ya tiene costo confiable.

Pendientes:
- Validar en produccion que al corregir el costo de un SKU vendido, desaparecen las incidencias "vendido sin costo" en trazabilidad/ranking y cambian utilidad/margen del periodo.

### 2026-05-23 - Utilidad Operativa Para Trazabilidad y Ranking

Objetivo: convertir Reporte de trazabilidad y Ranking de productos en herramientas diarias de decision usando ventas realizadas, productos, costos, inventario, lotes y compras existentes, sin migraciones ni rutas nuevas.

Cambios frontend:
- `reportingUtils.ts` agrega constructores compartidos para `TraceabilitySummary`, `TraceabilityIssue`, `ProductRankingDecisionRow` y cola "Que hacer ahora", reutilizados por UI y exportacion.
- Reporte de trazabilidad usa el `ReportPeriodSummary` activo de `/api/admin/report`, por lo que Dia/Mes/Historico cambian pedidos, productos, categorias, KPIs e incidencias.
- Nuevo `TraceabilityPanel` con KPIs de ventas auditadas, utilidad, margen, cobertura de datos, incidencias filtrables por severidad/tipo y acciones directas para ver pedido, abrir producto o registrar compra cuando falta costo.
- `SalesRankingPanel` cruza ventas con `inventoryIntelligence`, agrega contribucion, stock, cobertura, proveedor, compra sugerida, utilidad por unidad, prioridad, filtros, ordenamiento y exportacion directa desde la pestana.
- `useAdminDataLoader` carga productos e inteligencia de inventario tambien para `sales-ranking`; `reports` carga productos para acciones de trazabilidad.
- `reportExport.ts` amplia trazabilidad con hojas Resumen, Incidencias, Pedidos auditados, Productos auditados y Categorias; ranking exporta accion recomendada, prioridad, stock, cobertura, proveedor, compra sugerida, contribucion y hoja de acciones.

Decisiones:
- V1 calcula recomendaciones al vuelo y no modifica inventario, ordenes ni configuracion persistente.
- Las acciones de compra/edicion reutilizan el modal admin de producto/restock existente.
- Productos sin venta en la ventana de inventario entran como acciones de revision cuando tienen stock sin movimiento o sobrestock.

Pendientes:
- Validar manualmente en `/my-account` que Dia/Mes/Historico cambian trazabilidad/ranking y que las exportaciones abren correctamente en Excel con datos reales.

### 2026-05-23 - Centro Operativo de Inventario

Objetivo: convertir la pestana Inventario de `/my-account` en el centro principal de gestion y decision, dejando Reportes > Inventario como resumen ejecutivo coherente.

Cambios backend:
- `InventoryIntelligenceService` calcula `GET /api/admin/inventory/intelligence?window_days=30&target_days=30` con ventas realizadas (`completed`, `delivered`), stock actual, lotes FIFO abiertos, facturas de compra, costo ponderado, vencimientos, margen, proveedor y calidad de datos.
- `InventoryController::intelligence()` expone el endpoint admin y `public/index.php` registra la ruta.
- `BusinessIntelligenceService` usa el mismo payload para `inventoryValue`, `inventoryDeepDive` e `inventoryIntelligence`, evitando diferencias entre dashboard, reportes e inventario.
- Los umbrales de stock usan `reorderPoint`/`stockMin` y `stockMax`/`idealStock`; fallback minimo 5 y critico = mitad del minimo.

Cambios frontend:
- Nuevo tipo `InventoryIntelligence` y carga cacheada del endpoint desde `useAdminDataLoader.ts` para `inventory`, `reports` y `alerts`.
- `InventoryManagementPanel` agrega KPIs operativos, cola "Que hacer ahora", plan de compra por proveedor, filtros por accion/categoria/proveedor, exportacion CSV del plan y acciones rapidas de compra, ajuste, edicion, balance/lotes y factura.
- Reportes > Inventario ahora muestra resumen ejecutivo alimentado por `InventoryIntelligence`, CTAs hacia Inventario y listas de riesgo basadas en `status` calculado, no en umbrales fijos 2/5.
- `reportExport.ts` agrega hojas de plan de compra y acciones usando el mismo payload de inteligencia.

Decisiones:
- V1 no crea ordenes de compra, conteo fisico, barcode, multi-bodega ni ledger nuevo; reutiliza lotes FIFO, facturas de compra, ajustes y `PUT /api/products/{id}`.
- "Disponible" significa `Product.quantity`, porque el sistema descuenta stock al crear pedidos activos.
- Costo de inventario usa lotes abiertos cuando existen; fallback a `Product.cost`.

Pendientes:
- Validar manualmente con datos reales los escenarios de compra urgente, sobrestock, vencidos, compra/ajuste y coherencia de exportacion.

### 2026-05-18 - Optimizacion del Reporte de ventas

Objetivo: hacer que las listas y tarjetas inferiores del Reporte de ventas en `/my-account` respondan al toggle Dia/Mes/Historico y que cambiar entre vistas sea rapido.

Cambios backend:
- `OrderRepository::getReportPeriodSummary()` acepta `$selectedDate` y `$scope` para filtrar por dia, mes o historico.
- `DashboardController::report()` expone `GET /api/admin/report` como endpoint liviano que solo calcula el resumen del reporte.
- `public/index.php` registra `GET /api/admin/report`.
- `scripts/bootstrap_schema.php` agrega indice compuesto `Order_tenant_status_local_date_idx` para consultas por tenant/status/fecha local.

Cambios frontend:
- `MyAccountClient.tsx` usa `salesRankingView` como estado global del toggle para ordenes, rankings y categorias del reporte.
- Un efecto separado consulta `/api/admin/report?scope=...&date=...&period=...`, cancela peticiones previas con `AbortController` y mergea solo `businessMetrics.report`.
- `rankingCacheRef` conserva `productSalesRanking` entre toggles para evitar recalcular el ranking pesado.
- `useAdminDataLoader.ts` siempre carga el dashboard completo con `?period=YYYY-MM`; no depende de `salesRankingDate` ni `salesRankingView`.
- `useAdminDataLoader.ts` elimina `report` de la respuesta del dashboard antes de mergear para evitar que un refresh pasivo sobrescriba la vista daily/historical.
- `reportExport.ts` acepta vista `daily`.
- Tarjetas superiores del reporte se expandieron a `xl:grid-cols-10` con Ganancia bruta y Ganancia neta en color condicional.

Decisiones:
- Separar `/api/admin/report` del dashboard completo para que el toggle ejecute una consulta liviana y no el CTE pesado de `getProductSalesRanking`.
- Mantener `productSalesRanking` cacheado en ref; se refresca con cambio de mes o recarga manual, no con cada toggle.
- Mantener `period_key` como `YYYY-MM` incluso en vista diaria, porque `adjustmentSummary()` y `normalizePeriodKey()` esperan formato mensual.

Bugs corregidos:
- Race condition donde `/api/admin/dashboard/stats` sobrescribia `businessMetrics.report` con datos mensuales mientras el usuario estaba en vista diaria o historica.
- Error "Periodo financiero invalido" causado por pasar `YYYY-MM-DD` a logica que espera `YYYY-MM`.

Pendientes:
- Monitorear si el indice compuesto reduce el tiempo de `getProductSalesRanking`.
- Considerar cache similar para "Resumen y orden comercial" si se percibe lento.
