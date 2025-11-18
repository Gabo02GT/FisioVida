# 🔧 Guía: Configurar FatSecret API

## ¿Por qué no funciona la búsqueda de alimentos?

La búsqueda de alimentos requiere credenciales válidas de FatSecret API. Sin ellas, verás el mensaje: **"No se encontraron resultados"**

## Paso a Paso: Obtener Credenciales

### 1️⃣ Crear Cuenta en FatSecret

1. Ve a [https://platform.fatsecret.com](https://platform.fatsecret.com)
2. Haz clic en **"Sign Up"** o **"Crear Cuenta"**
3. Completa el registro con email y contraseña
4. Verifica tu email

### 2️⃣ Crear una Aplicación

1. Inicia sesión en tu cuenta
2. Ve a **"Manage My Apps"** o **"Developer Apps"**
3. Haz clic en **"Create New App"** / **"Nueva Aplicación"**
4. Completa los datos:
   - **App Name**: "FisioVida" (o el nombre que prefieras)
   - **Description**: "Plan alimenticio para pacientes"
   - **OAuth Redirect URL**: `http://localhost:5173` (o tu URL)

### 3️⃣ Obtener las Credenciales

Después de crear la app, recibirás:
- **OAuth Consumer Key** (Client ID)
- **OAuth Consumer Secret** (Client Secret)

Copia estos valores.

### 4️⃣ Configurar en tu Proyecto

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Agrega estas líneas:

```env
VITE_FATSECRET_CLIENT_ID=tu_consumer_key_aqui
VITE_FATSECRET_CLIENT_SECRET=tu_consumer_secret_aqui
VITE_FATSECRET_API_BASE=https://platform.fatsecret.com/rest/server.api
```

**Ejemplo:**
```env
VITE_FATSECRET_CLIENT_ID=f1a2b3c4d5e6f7g8h9i0
VITE_FATSECRET_CLIENT_SECRET=aBcDeFgHiJkLmNoPqRsT
VITE_FATSECRET_API_BASE=https://platform.fatsecret.com/rest/server.api
```

### 5️⃣ Reiniciar el Servidor

```bash
# Presiona Ctrl+C en la terminal donde corre `npm run dev`
# Luego:
npm run dev
```

## ✅ Verificar que Funciona

1. Abre el modal de búsqueda de alimentos
2. Busca un alimento (ej: "chicken", "apple", "rice")
3. Deberían aparecer resultados

## 🐛 Si Aún No Funciona

Abre la **Consola del Navegador** (F12) y busca errores:

- **"FatSecret credentials not configured"** → Verifica `.env.local`
- **"API error: 401"** → Credenciales incorrectas
- **"API error: 403"** → Acceso denegado
- **"No results found"** → La búsqueda es válida pero sin resultados para ese término

## 📚 Recursos

- [FatSecret API Docs](https://platform.fatsecret.com/api/Default.aspx)
- [OAuth 2-Legged (Two-Legged)](https://platform.fatsecret.com/api/Default.aspx?Return=oauth_authentication)
- [Foods Search Method](https://platform.fatsecret.com/api/Default.aspx?return=foods_search)

## 🔐 Seguridad

⚠️ **NUNCA** compartas tu `CLIENT_SECRET` públicamente. El archivo `.env.local` está en `.gitignore` y no se sube a Git.

---

**Estado**: 🟢 Guía Completada
**Fecha**: 16 de Noviembre 2024
