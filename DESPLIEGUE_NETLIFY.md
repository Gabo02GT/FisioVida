# 🚀 Despliegue en Netlify (100% Gratuito)

## ✅ Cómo Funciona

Tu aplicación ahora detecta automáticamente si está en **desarrollo** o **producción**:

- **En desarrollo (localhost)**: Usa el servidor proxy local en `localhost:3001`
- **En Netlify (producción)**: Usa **Netlify Functions** serverless (totalmente gratuito)

No hay costo adicional. Netlify incluye gratis:
- ✅ Hosting estático
- ✅ 125,000 invocaciones/mes de Netlify Functions (más que suficiente)
- ✅ SSL automático
- ✅ CDN global

## 📋 Pasos para Desplegar en Netlify

### 1️⃣ Conectar GitHub a Netlify

1. Sube tu código a GitHub
2. Ve a [https://app.netlify.com](https://app.netlify.com)
3. Haz clic en **"New site from Git"**
4. Selecciona tu repositorio
5. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2️⃣ Configurar Variables de Entorno

En Netlify:
1. Ve a **Site Settings** → **Build & Deploy** → **Environment**
2. Haz clic en **"Edit variables"**
3. Agrega:
   ```
   VITE_FATSECRET_CLIENT_ID=d8563b830922450884392ed3ab9b0006
   VITE_FATSECRET_CLIENT_SECRET=5e1d29341c4244f891b07dea71233e61
   ```

### 3️⃣ Deploy Automático

Cuando hagas `git push`, Netlify automáticamente:
1. Ejecuta `npm run build`
2. Despliega la carpeta `dist`
3. Activa las Netlify Functions

¡Listo! Tu sitio estará en vivo en segundos.

## 🏠 Desarrollo Local

### Opción A: Con Proxy Local (Recomendado)

```bash
npm run dev:full
```

Ejecuta:
- Vite dev server (puerto 5173)
- Proxy local (puerto 3001)

### Opción B: Solo Frontend

```bash
npm run dev
```

La búsqueda no funcionará sin el proxy, pero puedes agregar alimentos manualmente.

## 📁 Estructura de Archivos para Netlify

```
tu-proyecto/
├── netlify/
│   └── functions/
│       ├── search-foods.mjs          ← Buscar alimentos
│       └── food-details.mjs          ← Obtener detalles
├── netlify.toml                      ← Config de Netlify
├── src/
├── dist/                             ← Generado por build
└── package.json
```

## 🔒 Seguridad

- ⚠️ Las credenciales de FatSecret están **protegidas en Netlify**
- Las Netlify Functions no ejecutan código de cliente
- El proxy valida y firma todas las requests OAuth

## 💰 Costos

**$0** por mes para:
- Hosting
- Netlify Functions (hasta 125,000 invocaciones)
- Actualizaciones automáticas
- SSL/TLS gratis

## 🐛 Troubleshooting

### "Cannot find module 'crypto'"

Las Netlify Functions usan Node.js nativo. Si tienes problemas:

1. Asegúrate de que `netlify.toml` existe
2. Verifica que las funciones estén en `netlify/functions/`
3. Rebuilds en Netlify (Site Settings → Trigger deploy)

### La búsqueda no funciona en Netlify

1. Abre **Netlify Functions** en el dashboard
2. Ve a **View logs** para ver errores
3. Verifica que las variables de entorno están configuradas

### Error: "API credentials not configured"

Las variables de entorno no se cargaron. Solución:

1. En Netlify, ve a **Build & Deploy** → **Environment**
2. Verifica que `VITE_FATSECRET_CLIENT_ID` y `VITE_FATSECRET_CLIENT_SECRET` existen
3. Haz un **Trigger deploy** para que se recompilen

## 📊 Monitoring

En el dashboard de Netlify:
- **Functions** → Ver logs y estadísticas de uso
- **Deploys** → Historial de actualizaciones automáticas
- **Analytics** → Tráfico y errores

## 🎯 URL de tu Sitio

Una vez desplegado, tu sitio estará en:
```
https://tu-sitio.netlify.app
```

Las Netlify Functions estarán disponibles en:
- `https://tu-sitio.netlify.app/.netlify/functions/search-foods`
- `https://tu-sitio.netlify.app/.netlify/functions/food-details`

---

**Estado**: ✅ Listo para Netlify
**Costo Mensual**: $0
**Funciones Incluidas**: Hasta 125,000/mes

