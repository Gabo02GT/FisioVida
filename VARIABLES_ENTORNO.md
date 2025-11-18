# 🔐 Variables de Entorno - FisioVida

## Descripción

Este documento describe todas las variables de entorno requeridas y opcionales para ejecutar la aplicación FisioVida.

---

## 📋 Variables Requeridas

### Firebase Configuration

```env
VITE_FIREBASE_API_KEY=AIzaSyA_0z6Xr3WZeWvXzBNDNOvd3uoKvZlZRwk
VITE_FIREBASE_AUTH_DOMAIN=fisiovida-e5e19.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fisiovida-e5e19
VITE_FIREBASE_STORAGE_BUCKET=fisiovida-e5e19.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=57951981234
VITE_FIREBASE_APP_ID=1:57951981234:web:2a69a461ad5110beca03ab
VITE_FIREBASE_MEASUREMENT_ID=G-72XQQV5YPZ
```

**Descripción:**
- Credenciales de Firebase para autenticación y base de datos
- Obtenidas del proyecto de Firebase Console
- Necesarias para iniciar sesión y persistencia de datos

---

### FatSecret API Configuration

```env
VITE_FATSECRET_CLIENT_ID=d8563b830922450884392ed3ab9b0006
VITE_FATSECRET_CLIENT_SECRET=5e1d29341c4244f891b07dea71233e61
VITE_FATSECRET_API_BASE=https://platform.fatsecret.com/rest/server.api
```

**Descripción:**
- `VITE_FATSECRET_CLIENT_ID`: ID de cliente OAuth 1.0a de FatSecret (Consumer Key)
- `VITE_FATSECRET_CLIENT_SECRET`: Secreto del cliente OAuth 1.0a (Consumer Secret)
- `VITE_FATSECRET_API_BASE`: URL base de la API de FatSecret
- Necesarias para búsqueda de alimentos y cálculo nutricional automático
- 🔒 **SENSIBLE**: No compartir ni commitear a repositorio público

**Obtención:**
1. Registrarse en https://platform.fatsecret.com/
2. Ir a "My Apps" o "Applications"
3. Crear o seleccionar una aplicación
4. Encontrar:
   - `Consumer Key` → copiar en `VITE_FATSECRET_CLIENT_ID`
   - `Consumer Secret` → copiar en `VITE_FATSECRET_CLIENT_SECRET`
5. Agregar en `.env.local`

**Autenticación:**
- Utiliza OAuth 1.0a (Two-legged OAuth)
- Firma HMAC-SHA1 en cada request
- No requiere tokens de usuario, solo credenciales de aplicación

---

### Admin/Fisio Configuration

```env
VITE_ADMIN_FISIO_UID=E3SCfoJlCNNXgDgNhpiWrHANXrA2
VITE_ADMIN_FISIO_EMAIL=adminlftgerman@admin.com
```

**Descripción:**
- `VITE_ADMIN_FISIO_UID`: UID del usuario administrador fisioterapeuta en Firebase
- `VITE_ADMIN_FISIO_EMAIL`: Email del usuario administrador
- Usadas para validación de permisos de administrador

---

### Formspree Configuration

```env
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/mblqazwr
```

**Descripción:**
- Endpoint para envío de contactos y formularios
- Usado en página de landing
- Obtenido de Formspree.io

---

## 📂 Archivos de Configuración

### `.env.local` (Desarrollo)
```
Ubicación: /fisiovida/.env.local
Visibilidad: ❌ Ignorado por Git (.gitignore)
Propósito: Variables locales con credenciales reales
Uso: npm run dev
```

### `.env.example` (Plantilla)
```
Ubicación: /fisiovida/.env.example
Visibilidad: ✅ Tracked en repositorio
Propósito: Plantilla sin valores sensibles
Uso: Referencia para nuevos desarrolladores
```

---

## 🔒 Seguridad

### Mejores Prácticas

✅ **DO's:**
- Agregar `.env.local` a `.gitignore`
- Usar variables diferentes por ambiente
- Rotar credenciales regularmente
- Usar keys específicas por aplicación
- Documentar qué necesita cada variable

❌ **DON'Ts:**
- ❌ NO hardcodear secretos en código
- ❌ NO commitear `.env.local` a repositorio
- ❌ NO compartir credenciales por chat/email
- ❌ NO usar misma key en múltiples proyectos
- ❌ NO exponer variables sensibles en logs

### En Producción

Para producción, usar:
- **Vercel:** Variables de entorno en dashboard
- **Firebase Hosting:** Secrets en Cloud Functions
- **Docker:** Secrets como volúmenes o env en runtime
- **AWS:** Secrets Manager o Parameter Store

---

## 🚀 Configuración por Ambiente

### Desarrollo

```env
# .env.local
VITE_FIREBASE_API_KEY=AIzaSyA_0z6Xr3WZeWvXzBNDNOvd3uoKvZlZRwk
VITE_FIREBASE_AUTH_DOMAIN=fisiovida-e5e19.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fisiovida-e5e19
VITE_FIREBASE_STORAGE_BUCKET=fisiovida-e5e19.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=57951981234
VITE_FIREBASE_APP_ID=1:57951981234:web:2a69a461ad5110beca03ab
VITE_FIREBASE_MEASUREMENT_ID=G-72XQQV5YPZ

VITE_FATSECRET_CLIENT_ID=d8563b830922450884392ed3ab9b0006
VITE_FATSECRET_API_BASE=https://platform.fatsecret.com/rest/server.api

VITE_ADMIN_FISIO_UID=E3SCfoJlCNNXgDgNhpiWrHANXrA2
VITE_ADMIN_FISIO_EMAIL=adminlftgerman@admin.com

VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/mblqazwr
```

### Producción

Use el mismo `.env.local` pero con credenciales de producción:

```env
# En plataforma de hosting (Vercel, Firebase Hosting, etc.)
VITE_FATSECRET_CLIENT_ID=<production_client_id>
VITE_FATSECRET_API_BASE=<production_api_url>
# ... otras variables ...
```

---

## 🛠️ Acceso a Variables en Código

### Vite (import.meta.env)

```typescript
// Acceso en componentes React
const clientId = import.meta.env.VITE_FATSECRET_CLIENT_ID;
const apiBase = import.meta.env.VITE_FATSECRET_API_BASE;

// Con validación
const requiredVar = import.meta.env.VITE_FATSECRET_CLIENT_ID || "";
if (!requiredVar) {
  console.error("Variable requerida no configurada");
}
```

### TypeScript

Para mejor tipado, agregar tipos en `vite.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_FATSECRET_CLIENT_ID: string;
  readonly VITE_FATSECRET_API_BASE: string;
  readonly VITE_FIREBASE_API_KEY: string;
  // ... más variables ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## ✅ Checklist de Configuración

- [ ] Archivo `.env.local` creado en raíz del proyecto
- [ ] `.env.local` agregado a `.gitignore`
- [ ] Todas las variables requeridas completadas
- [ ] Firebase credentials validadas
- [ ] FatSecret Client ID configurado
- [ ] Admin UID y email correctos
- [ ] Variables no hardcodeadas en código
- [ ] Servidor de desarrollo puede acceder a variables (`npm run dev`)
- [ ] Sin errores de variables faltantes en consola
- [ ] Todas las APIs responden correctamente

---

## 🐛 Troubleshooting

### Error: "Variable not found"

**Síntoma:** `import.meta.env.VITE_XXX` es undefined

**Soluciones:**
1. Verificar que `.env.local` existe
2. Verificar que la variable está correctamente nombrada
3. Reiniciar servidor de desarrollo (`npm run dev`)
4. Verificar que no hay espacios en blanco en el nombre

```bash
# Reiniciar desarrollo
npm run dev
```

### Error: "FatSecret Client ID not configured"

**Síntoma:** Consola muestra error sobre FatSecret

**Soluciones:**
1. Verificar que `VITE_FATSECRET_CLIENT_ID` está en `.env.local`
2. Obtener nuevo Client ID de FatSecret
3. Validar que no hay espacios adicionales

```env
# ✅ Correcto
VITE_FATSECRET_CLIENT_ID=d8563b830922450884392ed3ab9b0006

# ❌ Incorrecto (espacios)
VITE_FATSECRET_CLIENT_ID = d8563b830922450884392ed3ab9b0006
```

### Error: "Firebase API key invalid"

**Síntoma:** No puede autenticar con Firebase

**Soluciones:**
1. Verificar credenciales en Firebase Console
2. Copiar correctamente sin espacios
3. Verificar que proyecto está activo

---

## 📝 Notas Importantes

### VITE_PREFIX
- Todas las variables públicas deben comenzar con `VITE_`
- Solo variables con este prefijo están disponibles en el cliente
- Otros prefijos son privados del servidor (no disponibles en cliente)

### Cambios de Variables
- Al cambiar `.env.local`, reiniciar servidor: `npm run dev`
- Las variables se inyectan en tiempo de compilación
- No se actualizan dinámicamente sin reinicio

### Variables Sensibles en Cliente
- ⚠️ Todas las variables en `.env.local` son públicas en el cliente
- No almacenar secretos de backend
- FatSecret Client ID es información de aplicación pública
- Para datos sensibles, usar backend con variables de servidor

---

## 🔗 Referencias

- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **Firebase Documentation:** https://firebase.google.com/docs
- **FatSecret API:** https://platform.fatsecret.com/api/
- **Best Practices:** https://12factor.net/config

---

## 📞 Soporte

Para problemas con variables de entorno:
1. Revisar este documento
2. Verificar `.env.local` existe y tiene valores
3. Reiniciar servidor de desarrollo
4. Revisar consola de errores en navegador
5. Contactar al equipo de desarrollo

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0  
**Estado:** ✅ Actualizado con seguridad mejorada
