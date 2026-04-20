# Frontend `paramascotasec/app`

Aplicacion Next.js de ParaMascotas.

## Lo importante para editar a mano

- Configuracion global del sitio:
  [siteConfig.ts](/home/admincenter/contenedores/paramascotasec/app/src/config/siteConfig.ts)
- Categorias, imagenes, rutas y filtros visibles:
  [petCategoryCards.ts](/home/admincenter/contenedores/paramascotasec/app/src/data/petCategoryCards.ts)
- Home principal:
  [Home.tsx](/home/admincenter/contenedores/paramascotasec/app/src/tenants/paramascotasec.com/Home.tsx)

## Desarrollo local

```bash
cd /home/admincenter/contenedores/paramascotasec/app
npm install
npm run dev
```

## Docker

Desarrollo:

```bash
cd /home/admincenter/contenedores/paramascostas-DB
./scripts/deploy-development.sh

cd /home/admincenter/contenedores/paramascotasec
./scripts/deploy-development.sh
```

El frontend en Docker depende de que `paramascotasec-backend` y la base `paramascostas-DB` esten accesibles en la red `edge`.

Produccion:

```bash
cd /home/admincenter/contenedores/paramascotasec
./scripts/deploy-production.sh
```

## Validacion

```bash
cd /home/admincenter/contenedores/paramascotasec/app
npx eslint src
./node_modules/.bin/tsc --noEmit --pretty false
```
