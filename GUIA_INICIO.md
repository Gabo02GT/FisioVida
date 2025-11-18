# 🚀 Guía de Inicio - FisioVida

## Inicio Rápido

### 1. **Instalar dependencias**
```bash
npm install
```

### 2. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### 3. **Compilar para producción**
```bash
npm run build
```

---

## 🔐 Credenciales de Prueba

### **Admin/Fisioterapeuta**
- **Email**: `adminlftgerman@admin.com`
- **Contraseña**: (usa la que ya tienes en Firebase)
- **URL de Login**: `http://localhost:5173/login/fisio`

---

## 📍 Rutas Principales

```
Inicio                  → http://localhost:5173/
Login Admin             → http://localhost:5173/login/fisio
Login Paciente          → http://localhost:5173/login/paciente
Dashboard Admin         → http://localhost:5173/dashboard/fisio
Invitar Paciente        → http://localhost:5173/invitar/paciente
Registro Paciente       → http://localhost:5173/registro/paciente?token=XXX&email=YYY
```

---

## ✅ Checklist de Funcionalidades

### **Login Admin**
- [ ] Ir a `/login/fisio`
- [ ] Ingresar `adminlftgerman@admin.com`
- [ ] Ingresar contraseña
- [ ] Debería redirigir a `/dashboard/fisio`
- [ ] Dashboard muestra email del usuario

### **Invitar Paciente**
- [ ] Desde dashboard, hacer clic en "Invitar Paciente"
- [ ] Llenar nombre y email del paciente
- [ ] Crear invitación
- [ ] Copiar URL generada

### **Registro Paciente**
- [ ] Abrir URL de invitación
- [ ] Sistema valida token automáticamente
- [ ] Llenar datos:
  - Nombre
  - Edad
  - Teléfono (opcional)
  - Contraseña (mín. 6 caracteres)
  - Confirmar contraseña
- [ ] Crear cuenta
- [ ] Redirige a login paciente

### **Login Paciente**
- [ ] Ir a `/login/paciente`
- [ ] Ingresar email de paciente
- [ ] Ingresar contraseña
- [ ] Debería redirigir a `/dashboard/paciente`

### **Logout**
- [ ] En cualquier dashboard, hacer clic en "Cerrar Sesión"
- [ ] Debería redirigir a inicio

---

## 🐛 Troubleshooting

### **Error: "Firebase not initialized"**
- Verifica que el archivo `.env.local` exista
- Asegúrate que `VITE_FIREBASE_API_KEY` está configurado

### **Error: "Email must belong to admin"**
- Estás usando un email que no es el del admin
- Login debe hacerse con: `adminlftgerman@admin.com`

### **Error: "Invitación no encontrada"**
- El token es inválido o expiró
- Solicita una nueva invitación al admin

### **Error: "Email already in use"**
- El email ya fue registrado como paciente
- Intenta con otro email

### **Cambios no aparecen en pantalla**
- Presiona `Ctrl+Shift+R` para limpiar caché del navegador
- O abre las DevTools y cierra la caché del navegador

---

## 📁 Estructura Importante del Proyecto

```
FisioVida/
├── src/
│   ├── auth/
│   │   ├── firebaseConfig.ts    ← Configuración Firebase
│   │   ├── useAuth.tsx          ← Context de autenticación
│   │   └── RequireAuth.tsx      ← HOC para proteger rutas
│   ├── pages/
│   │   ├── fisio/
│   │   │   ├── LoginFisio.tsx
│   │   │   ├── DashboardFisio.tsx
│   │   │   └── InvitarPaciente.tsx
│   │   ├── paciente/
│   │   │   ├── LoginPaciente.tsx
│   │   │   ├── RegistroPaciente.tsx
│   │   │   └── DashboardPaciente.tsx
│   └── styles/
│       ├── auth.css             ← Estilos login/registro
│       └── dashboard.css        ← Estilos dashboards
├── .env.local                   ← Variables de entorno
└── AUTENTICACION_IMPLEMENTADA.md ← Este documento
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build
npm run build           # Compila para producción
npm run preview         # Previsualiza build de producción

# Linting
npm run lint            # Ejecuta ESLint

# Limpiar
rm -rf node_modules    # Elimina dependencias (si es necesario reinstalar)
```

---

## 💡 Tips

1. **Abrir DevTools**: F12 o Ctrl+Shift+I
   - Útil para ver errores en consola

2. **Firestore Console**: 
   - Ve a https://console.firebase.google.com
   - Selecciona proyecto "fisiovida-e5e19"
   - Ve a "Firestore Database"
   - Ahí puedes ver los datos guardados

3. **Firebase Auth Console**:
   - En Firebase Console, ve a "Authentication"
   - Verás todos los usuarios registrados

4. **Recargar sin caché**: Ctrl+Shift+R

5. **Inspeccionar elementos**: Clic derecho → Inspeccionar

---

## 📞 Contacto / Ayuda

Si encuentras problemas:
1. Verifica que todas las variables en `.env.local` estén configuradas
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que Firebase esté funcionando en `console.firebase.google.com`
4. Asegúrate que el usuario admin existe en Firebase Auth

---

## 📊 Firebase Console Links

- **Firestore**: https://console.firebase.google.com/u/0/project/fisiovida-e5e19/firestore
- **Authentication**: https://console.firebase.google.com/u/0/project/fisiovida-e5e19/authentication
- **Project Settings**: https://console.firebase.google.com/u/0/project/fisiovida-e5e19/settings/general

---

**¡Tu aplicación está lista! 🎉**

Diviértete construyendo FisioVida.
