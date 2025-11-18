# 🚀 Ejecutar FatSecret API con Proxy Server

El problema de CORS se resolvió creando un **servidor proxy** que maneja las requests a FatSecret.

## 📦 Instalación de Dependencias

```bash
npm install
```

Esto instalará:
- `express` - Servidor web
- `cors` - Manejo de CORS
- `node-fetch` - HTTP client para Node
- `concurrently` - Ejecutar múltiples procesos

## 🎯 Opciones de Ejecución

### Opción 1: Ejecutar Todo Junto (RECOMENDADO)

```bash
npm run dev:full
```

Esto ejecuta simultáneamente:
- ✓ Vite dev server (puerto 5173)
- ✓ Proxy server (puerto 3001)

### Opción 2: Ejecutar por Separado

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run dev:server
```

### Opción 3: Desarrollo Solo (sin búsqueda)

```bash
npm run dev
```

## ✅ Verificar que Funciona

### 1️⃣ Ambos servidores corriendo
- Vite: http://localhost:5173
- Proxy: http://localhost:3001/health (debe devolver `{"status":"ok"}`)

### 2️⃣ Prueba la búsqueda de alimentos
- Abre la app en `http://localhost:5173`
- Ve al módulo Plan Alimenticio
- Busca un alimento (ej: "chicken")
- Deberían aparecer resultados

## 🔧 Cómo Funciona el Proxy

```
App Frontend (localhost:5173)
         ↓
    Fetch to /api/foods/search
         ↓
    Proxy Server (localhost:3001)
         ↓
    OAuth + Firma HMAC-SHA1
         ↓
    FatSecret API (api.fatsecret.com)
         ↓
    Respuesta JSON
         ↓
    App Frontend
```

## 📝 Logs Útiles

Cuando busques un alimento, verás en consola:
```
🔍 Buscando en FatSecret via proxy: chicken
Response status: 200
📦 Resultados recibidos: [...]
✓ Found 15 foods
```

Si hay error, busca en **Consola (F12)** y en la **Terminal** donde corre el proxy.

## 🐛 Troubleshooting

### "Cannot GET /api/foods/search"
- El proxy no está corriendo
- Ejecuta: `npm run dev:server`

### "Connection refused"
- El proxy se cayó
- Reinicia: `npm run dev:server`

### Sin resultados aún
- Verifica que `.env.local` tenga las credenciales de FatSecret
- Revisa la consola del navegador (F12)

## 🛑 Detener los Servidores

Si usas `npm run dev:full`, presiona `Ctrl+C` una sola vez para detener ambos.

---

**Estado**: ✅ CORS resuelto con Proxy Server
**Fecha**: 16 de Noviembre 2024
