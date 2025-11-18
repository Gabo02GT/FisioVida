# 🔐 Guía de Seguridad para Deployment - FisioVida

## 📋 Checklist de Seguridad Antes de Subir a Netlify

### 1. ✅ Variables de Entorno

**NUNCA** commits `.env.local`:
```bash
# ✅ Ya configurado en .gitignore
*.local
```

**Variables sensibles a proteger:**
- ❌ `VITE_FIREBASE_API_KEY` - Clave de API de Firebase
- ❌ `VITE_FATSECRET_CLIENT_SECRET` - Secreto de FatSecret
- ❌ `VITE_ADMIN_FISIO_UID` - UID del administrador
- ❌ `VITE_FORMSPREE_ENDPOINT` - Endpoint de formularios

**Checklist:**
- [ ] `.env.local` está en `.gitignore`
- [ ] NO hay `.env.local` en git history
- [ ] `.env.example` está sin valores sensibles
- [ ] Todas las variables están documentadas

---

### 2. ✅ Firebase Security Rules

**Archivo:** `firestore.rules`

```
- [ ] Validar que solo fisios autenticados pueden crear/actualizar citas
- [ ] Validar que pacientes solo ven sus propios datos
- [ ] Validar que solo admin puede invitar pacientes
- [ ] Implementar validación de roles en rules
- [ ] Restricción de acceso a datos de otros usuarios
```

**Reglas actuales (revisar en Firebase Console):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pacientes
    match /pacientes/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Citas
    match /citas/{citaId} {
      allow read: if request.auth.uid == resource.data.fisio_uid ||
                     request.auth.uid == resource.data.paciente_uid;
      allow write: if request.auth.uid == resource.data.fisio_uid &&
                      request.auth.token.claims.role == 'fisio';
    }

    // Planes alimenticios
    match /planes/{pacienteId}/historial/{planId} {
      allow read, write: if request.auth.uid == pacienteId;
    }
  }
}
```

---

### 3. ✅ Authentication Security

**En Firebase Console:**
```
- [ ] Email/Contraseña: Habilitado ✓
- [ ] Anonymous: Deshabilitado ✗
- [ ] Otros providers: Revisar si se necesitan
- [ ] Password requirements: Mínimo 8 caracteres ✓
```

**En Código:**
```typescript
// ✅ Validar contraseñas en cliente
const validatePassword = (password: string) => {
  return password.length >= 8;
};

// ✅ Usar signInWithEmailAndPassword (no almacenar tokens)
// ❌ NUNCA guardes tokens en localStorage
```

---

### 4. ✅ Secretos Protegidos en Netlify

**Pasos para configurar:**

1. Ve a **Netlify Dashboard** → Tu sitio
2. **Site Settings** → **Build & Deploy** → **Environment**
3. Agrega cada variable:

```
VITE_FIREBASE_API_KEY = AIzaSyA_0z6Xr3WZeWvXzBNDNOvd3uoKvZlZRwk
VITE_FIREBASE_AUTH_DOMAIN = fisiovida-e5e19.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = fisiovida-e5e19
VITE_FIREBASE_STORAGE_BUCKET = fisiovida-e5e19.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 57951981234
VITE_FIREBASE_APP_ID = 1:57951981234:web:2a69a461ad5110beca03ab
VITE_FIREBASE_MEASUREMENT_ID = G-72XQQV5YPZ
VITE_FATSECRET_CLIENT_ID = d8563b830922450884392ed3ab9b0006
VITE_FATSECRET_CLIENT_SECRET = 5e1d29341c4244f891b07dea71233e61
VITE_FATSECRET_API_BASE = https://platform.fatsecret.com/rest/server.api
VITE_ADMIN_FISIO_UID = E3SCfoJlCNNXgDgNhpiWrHANXrA2
VITE_ADMIN_FISIO_EMAIL = adminlftgerman@admin.com
VITE_FORMSPREE_ENDPOINT = https://formspree.io/f/mblqazwr
```

**Checklist:**
- [ ] Todas las variables están en Netlify
- [ ] Nombres de variables exactos (con VITE_)
- [ ] Valores correctos (sin espacios)
- [ ] Secretos NO están en código fuente

---

### 5. ✅ CORS Configuration

**Configurar en Firebase:**
1. Firebase Console → Project Settings
2. Agregar dominio Netlify a CORS:
   ```
   https://tu-sitio.netlify.app
   ```

**En código (ya está):**
```typescript
// firebaseConfig.ts ya importa desde variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

---

### 6. ✅ HTTPS & Security Headers

**Netlify lo proporciona automáticamente:**
- ✅ HTTPS forzado
- ✅ HSTS headers
- ✅ X-Frame-Options

**Verificar en netlify.toml (crear si no existe):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

### 7. ✅ API Security

**FatSecret:**
```typescript
// ❌ NUNCA expongas CLIENT_SECRET en cliente
// ✅ Usa backend proxy o Cloud Functions si necesitas

// Actual (seguro - solo CLIENT_ID en cliente):
const clientId = import.meta.env.VITE_FATSECRET_CLIENT_ID;
```

**Formspree:**
```typescript
// ✅ El endpoint es público, pero Formspree lo maneja
const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
```

---

### 8. ✅ Data Protection

**Encriptación:**
- ✅ Firebase Auth: Contraseñas encriptadas automáticamente
- ✅ Firestore: Encriptado en tránsito (HTTPS)
- ℹ️ Para datos sensibles: Implementar encriptación end-to-end

**Validación:**
- ✅ Validar inputs en cliente
- ✅ Validar en Firestore Rules (servidor)
- ✅ Validar tipos de datos

```typescript
// Ejemplo en Firestore Rules:
match /citas/{citaId} {
  allow write: if request.resource.data.fecha is timestamp &&
                  request.resource.data.hora is string &&
                  request.auth.uid == request.resource.data.fisio_uid;
}
```

---

### 9. ✅ Logging & Monitoring

**Firebase Console:**
- [ ] Revisar Authentication → Sign-in methods
- [ ] Revisar Firestore → Security Rules
- [ ] Configurar Cloud Functions logging si es necesario

**Netlify:**
- [ ] Configurar Build logs (privados)
- [ ] Revisar Deploy logs para errores

---

### 10. ✅ Testing Pre-Deployment

```bash
# 1. Verificar que no hay variables hardcodeadas
npm run build

# 2. Revisar dist/ para variables expuestas
grep -r "AIzaSyA" dist/

# 3. Verificar .gitignore
git status  # No debe mostrar .env.local

# 4. Test en environment similar a producción
VITE_FIREBASE_API_KEY=test npm run preview
```

---

## 🚀 Pasos para Subir a Netlify

### 1. Conectar Repositorio

```bash
# En tu máquina
git add .
git commit -m "Initial commit - FisioVida"
git push origin main
```

### 2. En Netlify Dashboard

1. **New site from Git**
2. Selecciona proveedor Git (GitHub, GitLab, etc.)
3. Selecciona repositorio `FisioVida/fisiovida`
4. Deploy settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. **Deploy site**

### 3. Configurar Variables de Entorno

1. **Site Settings** → **Build & Deploy** → **Environment**
2. **Edit variables**
3. Agregar todas las variables (ver sección 4)
4. **Redeploy site**

### 4. Verificar Deployment

```bash
# Verificar que se construyó correctamente
# Check Netlify Build logs

# Verificar variables en producción
# Revisar que las APIs funcionan en prod
```

---

## ⚠️ Errores Comunes & Soluciones

### Error: "Firebase API Key not configured"

**Causa:** Variable no está en Netlify
**Solución:** Verificar que todas las variables están en Netlify settings

### Error: "FatSecret API 401 Unauthorized"

**Causa:** CLIENT_SECRET expirado o incorrecto
**Solución:** Regenerar credenciales en FatSecret y actualizar en Netlify

### Error: "CORS error from Firebase"

**Causa:** Dominio no autorizado
**Solución:** Agregar dominio Netlify a Firebase > Project Settings > Authorized domains

---

## 🔄 Rotación de Credenciales

**Cada 3-6 meses:**

1. **Firebase:**
   - [ ] Verificar que no hay API keys públicas
   - [ ] Si es necesario, crear nueva key y rotar

2. **FatSecret:**
   - [ ] Regenerar Consumer Secret
   - [ ] Actualizar en Netlify
   - [ ] Verificar que sigue funcionando

3. **Formspree:**
   - [ ] Verificar que el endpoint sigue activo

---

## 📞 Soporte & Referencias

- Firebase Security Rules: https://firebase.google.com/docs/firestore/security/start
- Netlify Environment Variables: https://docs.netlify.com/configure-builds/environment-variables/
- OWASP Security Checklist: https://cheatsheetseries.owasp.org/

---

**Estado:** ✅ Guía Completa  
**Última actualización:** Noviembre 2025  
**Versión:** 1.0
