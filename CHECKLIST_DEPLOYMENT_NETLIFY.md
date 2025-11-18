# ✅ CHECKLIST DE DEPLOYMENT A NETLIFY - FISIOVIDA

## 🔐 SEGURIDAD (ANTES DE SUBIR)

### Variables de Entorno
- [ ] `.env.local` existe en tu máquina
- [ ] `.env.local` está en `.gitignore`
- [ ] `.env.local` NO está en git (verificar con `git status`)
- [ ] `.env.example` tiene estructura pero sin valores
- [ ] Todas las variables están documentadas

### Firebase Security
- [ ] Firestore Rules están configuradas correctamente
- [ ] Solo fisios autenticados pueden crear citas
- [ ] Pacientes solo ven sus propios datos
- [ ] Admin UID está limitado a un usuario
- [ ] Authentication está en Email/Contraseña + custom roles

### Código Seguro
- [ ] NO hay API keys hardcodeadas en código
- [ ] NO hay credenciales en comentarios
- [ ] Validación de inputs en cliente
- [ ] Validación de datos en Firestore Rules
- [ ] Contraseñas validadas (mín 8 caracteres)

### Build Seguro
- [ ] `npm run build` compila sin errores
- [ ] No hay warnings sobre dependencias
- [ ] No hay variables sensibles en `dist/`
- [ ] `dist/index.html` NO contiene secretos

```bash
# Verificar que no hay secretos en build
npm run build
grep -r "AIzaSyA\|CLIENT_SECRET" dist/  # No debe retornar nada
```

---

## 📦 PREPARAR REPOSITORIO GIT

### Crear repositorio
```bash
cd c:\Users\gabri\Desktop\FisioVida\fisiovida
git init
git config user.name "Tu Nombre"
git config user.email "tu_email@gmail.com"
```

### Verificar gitignore
```bash
# Debe incluir:
cat .gitignore
# Debe mostrar: *.local
```

### Hacer commit
```bash
git add .
git status  # Verificar que NO incluye .env.local

git commit -m "Initial commit - FisioVida application"
```

### Crear repositorio remoto
**En GitHub/GitLab/Bitbucket:**
1. Crear nuevo repositorio (ej: FisioVida)
2. Copiar URL
3. En terminal:
```bash
git remote add origin https://github.com/tu_usuario/FisioVida.git
git branch -M main
git push -u origin main
```

---

## 🚀 DEPLEGAR EN NETLIFY

### 1. Conectar Repositorio
- [ ] Ir a https://app.netlify.com
- [ ] Click "New site from Git"
- [ ] Seleccionar proveedor (GitHub, GitLab, etc.)
- [ ] Autorizar Netlify en tu cuenta
- [ ] Seleccionar repositorio "FisioVida"

### 2. Configurar Build
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Click "Deploy site"

### 3. Agregar Variables de Entorno (CRÍTICO)
**Esperar a que el primer deploy falle (sin variables)**

- [ ] Ir a **Site Settings** → **Build & Deploy** → **Environment**
- [ ] Click "Edit variables"
- [ ] Copiar desde `.env.local`:

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

- [ ] Click "Save"
- [ ] **Triggers** → **Deploy site** (para forzar rebuild con variables)

### 4. Verificar Deploy
- [ ] Deploy finaliza sin errores
- [ ] Site está en vivo (URL asignada automáticamente)
- [ ] Puedes acceder a https://tu-sitio.netlify.app

---

## ✅ TESTING EN PRODUCCIÓN

### Pruebas Funcionales
```bash
# Acceder al sitio
https://tu-sitio.netlify.app

# 1. Landing page carga
- [ ] Logo visible
- [ ] Secciones cargan
- [ ] Formulario de contacto funciona

# 2. Authentication
- [ ] Puedo ir a Login Fisio
- [ ] Email/contraseña validan
- [ ] Inicia sesión correctamente
- [ ] Redirect a dashboard

# 3. Dashboard Fisio
- [ ] Stats se cargan
- [ ] Puedo ver pacientes
- [ ] Puedo crear cita
- [ ] Puedo ver citas

# 4. Dashboard Paciente (crear otra cuenta)
- [ ] Puedo registrarme con invitación
- [ ] Dashboard carga datos
- [ ] Puedo ver citas
- [ ] Puedo usar plan alimenticio

# 5. APIs Externas
- [ ] Formulario de contacto envía (Formspree)
- [ ] Plan alimenticio busca alimentos (FatSecret)
```

### Verificación de Seguridad
```bash
# En navegador (F12 → Console)
- [ ] NO hay warnings de CSP
- [ ] NO hay errores de CORS
- [ ] Variables de entorno NO están expuestas

# Ejecutar en consola:
console.log(import.meta.env.VITE_FIREBASE_API_KEY)
# Debe mostrar el valor (eso es OK, es pública)

console.log(import.meta.env.VITE_FATSECRET_CLIENT_SECRET)
# Debe estar vacío o undefined (NO debe exponerse en cliente)
```

---

## 🔧 CONFIGURACIÓN ADICIONAL

### Dominio Personalizado (Opcional)
- [ ] En Netlify: **Site Settings** → **Domain management**
- [ ] Click "Add custom domain"
- [ ] Ingresa tu dominio (ej: fisiovida.com)
- [ ] Sigue instrucciones de DNS

### SSL Certificate (Automático)
- [ ] Netlify genera automáticamente HTTPS
- [ ] No hay que hacer nada

### Validar CORS en Firebase
- [ ] Ir a Firebase Console > Project Settings
- [ ] Authorized domains:
  - [ ] localhost:5173
  - [ ] localhost:3000
  - [ ] tu-sitio.netlify.app

---

## 📝 LOGS Y MONITOREO

### Ver Build Logs
- [ ] En Netlify: **Deploys**
- [ ] Click en el deploy que quieres revisar
- [ ] **Deploy log** muestra todo el proceso

### Ver Errores en Producción
- [ ] En navegador: **F12** → **Console**
- [ ] Buscar errores de Firebase, FatSecret, etc.
- [ ] Comparar con desarrollo local

### Configurar Notificaciones
- [ ] **Site Settings** → **Notifications**
- [ ] Email de notificación de deploy

---

## 🔄 ACTUALIZAR CÓDIGO

**Después del primer deploy, para actualizar:**

```bash
# En tu máquina
git add .
git commit -m "Fix: descripción del cambio"
git push origin main

# Netlify detecta automáticamente y redeploy
# Esperar a que el build termine
```

---

## ❌ ERRORES COMUNES Y SOLUCIONES

### "Unexpected end of JSON input" o variables error

**Causa:** Variables no configuradas en Netlify

**Solución:**
1. Ir a Site Settings → Environment
2. Verificar que TODAS las variables están
3. Nombres exactos (con VITE_)
4. Click "Deploy site" para reconstruir

### "Firebase: Error (auth/invalid-api-key)"

**Causa:** API Key incorrecta o no incluida

**Solución:**
1. Copiar correctamente desde Firebase Console
2. Sin espacios extras
3. Verificar en Netlify Environment

### "FatSecret API: Unauthorized (401)"

**Causa:** CLIENT_SECRET expirado o incorrecto

**Solución:**
1. Ir a https://platform.fatsecret.com
2. Regenerar credenciales
3. Actualizar en Netlify
4. Trigger redeploy

### "CORS error from Firebase"

**Causa:** Dominio no autorizado

**Solución:**
1. Firebase Console → Project Settings
2. Authorized domains
3. Agregar: tu-sitio.netlify.app
4. Esperar unos minutos

---

## 📞 REFERENCIAS

- Netlify Docs: https://docs.netlify.com
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Environment Variables: https://docs.netlify.com/configure-builds/environment-variables/

---

**Estado:** ✅ Checklist Completo  
**Fecha:** Noviembre 2025  
**Versión:** 1.0
