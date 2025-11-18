# 🔐 RESUMEN DE SEGURIDAD - FISIOVIDA

## Enfoque de Seguridad

FisioVida implementa seguridad en múltiples capas:

```
┌─────────────────────────────────────────┐
│  NAVEGADOR (Cliente)                    │
│  - Validación de inputs                 │
│  - HTTPS forzado                        │
│  - CSP Headers                          │
└─────────────────────────────────────────┘
           ↓↑
┌─────────────────────────────────────────┐
│  APIS (Externas)                        │
│  - Firebase Authentication              │
│  - Firestore Database                   │
│  - FatSecret API                        │
│  - Formspree                            │
└─────────────────────────────────────────┘
           ↓↑
┌─────────────────────────────────────────┐
│  BACKEND (Firestore Rules)              │
│  - Autenticación requerida              │
│  - Validación de roles                  │
│  - Restricción de datos por usuario     │
│  - Validación de tipos                  │
└─────────────────────────────────────────┘
```

---

## Variables de Entorno - Clasificación de Seguridad

### 🟥 CRÍTICAS (Guardar con cuidado)

```
VITE_FIREBASE_API_KEY          ← Clave de API de Firebase
VITE_FATSECRET_CLIENT_SECRET   ← Secreto OAuth de FatSecret
VITE_ADMIN_FISIO_UID           ← UID del administrador
```

**Protección:**
- ✅ En `.env.local` (no en git)
- ✅ En Netlify Environment (dashboard privado)
- ❌ NUNCA en comentarios o código
- ❌ NUNCA compartir por email/chat

### 🟨 SENSIBLES (Verificar acceso)

```
VITE_FIREBASE_AUTH_DOMAIN      ← Dominio de Firebase
VITE_FIREBASE_PROJECT_ID       ← ID del proyecto
VITE_FATSECRET_CLIENT_ID       ← ID cliente de FatSecret
VITE_ADMIN_FISIO_EMAIL         ← Email del admin
```

**Protección:**
- ✅ En `.env.local`
- ✅ En Netlify Environment
- ⚠️ Expuestas en cliente (pero validadas en server)

### 🟩 PÚBLICAS (Pueden exponerse)

```
VITE_FIREBASE_STORAGE_BUCKET   ← Bucket de storage
VITE_FIREBASE_MEASUREMENT_ID   ← Google Analytics
VITE_FATSECRET_API_BASE        ← Endpoint de API
VITE_FORMSPREE_ENDPOINT        ← Endpoint de formularios
```

**Protección:**
- ✅ Visibles en cliente
- ✅ Documentadas públicamente
- ℹ️ Protegidas por CORS en servidor

---

## Flujo de Autenticación

```
USUARIO
   ↓
[NAVEGADOR]
   ↓
Ingresa email/contraseña
   ↓
[FIREBASE AUTH]
   ↓
Valida credenciales
   ↓
Retorna JWT Token
   ↓
[NAVEGADOR]
   ↓
Mantiene sesión (localStorage)
   ↓
[FIRESTORE]
   ↓
Valida token en cada request
   ↓
Validar roles en Firestore Rules
   ↓
✅ Acceso permitido o ❌ Denegado
```

---

## Validación de Datos

### Cliente (TypeScript)

```typescript
// 1. Validación de tipos
interface Cita {
  id: string;
  fecha: Date;
  hora: string;
  fisio_uid: string;
  paciente_uid: string;
}

// 2. Validación de inputs
const validateCita = (cita: any): cita is Cita => {
  return (
    typeof cita.fecha === 'object' &&
    typeof cita.hora === 'string' &&
    typeof cita.fisio_uid === 'string' &&
    typeof cita.paciente_uid === 'string'
  );
};
```

### Servidor (Firestore Rules)

```
match /citas/{citaId} {
  // Solo el fisio puede crear citas
  allow create: if request.auth.uid == request.resource.data.fisio_uid &&
                   request.auth.token.claims.role == 'fisio';
  
  // Solo fisio/paciente pueden leer
  allow read: if request.auth.uid == resource.data.fisio_uid ||
                 request.auth.uid == resource.data.paciente_uid;
  
  // Validar tipos de datos
  allow update: if request.resource.data.fecha is timestamp &&
                   request.resource.data.hora is string;
}
```

---

## Protección de Datos

### Contraseñas

```typescript
// ✅ Manejadas por Firebase
// Firebase encripta automáticamente
// Nunca se guardan en texto plano
// Mínimo 8 caracteres validado en cliente
// Validación adicional en servidor
```

### Datos en Firestore

```typescript
// ✅ Encriptados en tránsito (HTTPS)
// ✅ Encriptados en reposo (Firebase)
// ✅ Validación en Firestore Rules
// ✅ Sin exposición de datos entre usuarios
```

### APIs Externas

```typescript
// Firebase
// ✅ Autenticación OAuth 2.0
// ✅ JWT Tokens con expiración
// ✅ CORS configurado

// FatSecret
// ✅ OAuth 1.0a (Two-legged)
// ✅ Signature HMAC-SHA1
// ✅ CLIENT_SECRET no expuesto en cliente

// Formspree
// ✅ Endpoint público pero protegido
// ✅ Rate limiting
// ✅ Validación de email
```

---

## Headers de Seguridad (Netlify)

```
X-Content-Type-Options: nosniff
  → Previene MIME-type sniffing

X-Frame-Options: DENY
  → Previene clickjacking

X-XSS-Protection: 1; mode=block
  → Protege contra XSS

Referrer-Policy: strict-origin-when-cross-origin
  → Controla información de referrer

Content-Security-Policy: default-src 'self'...
  → Controla orígenes de contenido
```

---

## Roles y Permisos

### Fisioterapeuta

```typescript
Role: 'fisio'

Permisos:
✅ Crear citas
✅ Actualizar citas propias
✅ Ver pacientes asignados
✅ Invitar pacientes
✅ Ver planes alimenticios de pacientes
❌ Ver datos de otros fisios
❌ Eliminar citas
```

### Paciente

```typescript
Role: 'paciente'

Permisos:
✅ Ver sus citas
✅ Ver su plan alimenticio
✅ Actualizar su perfil
✅ Ver sus medidas
❌ Crear citas
❌ Ver datos de otros pacientes
❌ Acceder a panel de admin
```

### Admin (Hardcoded)

```typescript
ADMIN_FISIO_UID = 'E3SCfoJlCNNXgDgNhpiWrHANXrA2'

Permisos:
✅ Todas las funciones de fisio
✅ Ver estadísticas globales
✅ Acceder a reportes

Limitación: Solo el UID específico
```

---

## Checklist Diario (Para Desarrolladores)

```
Antes de cada commit:
- [ ] Verificar que NO hay .env.local en git
- [ ] Verificar que NO hay API keys en código
- [ ] Verificar que NO hay contraseñas en comentarios
- [ ] Build sin errores: npm run build
- [ ] Test de seguridad: grep -r "AIzaSyA" dist/

Antes de cada push:
- [ ] git status (no debe mostrar .env.local)
- [ ] Revisar Firestore Rules recientes
- [ ] Verificar que URLs usan HTTPS

Antes de cada deploy:
- [ ] Todas las variables en Netlify Environment
- [ ] Verificar CORS en Firebase
- [ ] Revisar logs de build
- [ ] Testing en producción
```

---

## Escenarios de Ataque & Protección

### Ataque 1: Inyección de SQL

```
Escenario: Usuario intenta inyectar código en formulario
Protección:
✅ Firebase (NoSQL, no SQL)
✅ Validación de tipos en cliente
✅ Validación en Firestore Rules
```

### Ataque 2: CSRF (Cross-Site Request Forgery)

```
Escenario: Sitio malicioso intenta hacer cambios
Protección:
✅ Same-origin policy del navegador
✅ CORS restrictivo en APIs
✅ JWT tokens con expiración
```

### Ataque 3: XSS (Cross-Site Scripting)

```
Escenario: Script malicioso en datos
Protección:
✅ React sanitiza por defecto
✅ CSP Header bloquea inline scripts
✅ Validación de inputs en cliente
```

### Ataque 4: Man-in-the-Middle

```
Escenario: Interceptar datos en tránsito
Protección:
✅ HTTPS forzado (Netlify)
✅ HSTS Headers
✅ Certificado SSL automático
```

### Ataque 5: Fuerza Bruta (Brute Force)

```
Escenario: Intentar múltiples contraseñas
Protección:
✅ Firebase Auth limita intentos fallidos
✅ Bloqueo automático después de intentos
✅ Verificación por email
```

---

## Incidentes & Procedimiento

Si sospechas una brecha de seguridad:

1. **INMEDIATAMENTE:**
   - [ ] Cambiar todas las contraseñas
   - [ ] Verificar `.env.local` no fue comprometido

2. **EN FIREBASE:**
   - [ ] Ver logs de autenticación
   - [ ] Verificar acceso no autorizado a Firestore
   - [ ] Desactuar usuarios sospechosos

3. **EN FATSECRET:**
   - [ ] Regenerar Consumer Secret
   - [ ] Actualizar en Netlify
   - [ ] Revisar historial de API

4. **EN NETLIFY:**
   - [ ] Revisar build logs
   - [ ] Revisar deploy logs
   - [ ] Cambiar variables de entorno si es necesario

5. **COMUNICAR:**
   - [ ] Notificar a usuarios afectados
   - [ ] Documentar el incidente
   - [ ] Mejoras para evitar futuro

---

## Actualización de Dependencias

**Mantener seguridad:** Actualizar dependencias regularmente

```bash
# Verificar vulnerabilidades
npm audit

# Corregir automáticamente
npm audit fix

# Actualizar minorversiones
npm update

# Actualizar majorversiones (cuidado)
npm outdated
npm install package@latest
```

---

## Referencias de Seguridad

- **OWASP Top 10:** https://owasp.org/Top10/
- **Firebase Security:** https://firebase.google.com/docs/rules/basics
- **MDN Security:** https://developer.mozilla.org/en-US/docs/Web/Security
- **Netlify Docs:** https://docs.netlify.com/security/

---

## Contacto para Soporte de Seguridad

Si encuentras un problema de seguridad:
- ❌ NO publiques en issues públicas
- ✅ Reporta privadamente a: [tu email]
- ✅ Incluye: descripción, pasos para reproducir, impacto

---

**Estado:** ✅ Actualizado  
**Versión:** 1.0  
**Última revisión:** Noviembre 2025  
**Próxima revisión:** Febrero 2026
