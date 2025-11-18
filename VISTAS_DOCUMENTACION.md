# 🏥 FisioVida - Vistas de Autenticación

## ✅ Vistas Creadas

He creado un conjunto completo de vistas profesionales para el sistema de autenticación y autorización de FisioVida. Todas las vistas están diseñadas siguiendo un esquema de colores azul/verde adecuado para un negocio de fisioterapia.

### 📋 Archivos Creados

```
src/
├── pages/
│   ├── fisio/
│   │   ├── LoginFisio.tsx          ✨ NEW
│   │   ├── InvitarPaciente.tsx     ✨ NEW
│   │   └── DashboardFisio.tsx      ✨ NEW
│   └── paciente/
│       ├── LoginPaciente.tsx       ✨ NEW
│       ├── RegistroPaciente.tsx    ✨ NEW
│       └── DashboardPaciente.tsx   ✨ NEW
├── auth/
│   ├── RequireAuth.tsx             ✨ ACTUALIZADO
│   └── useAuth.tsx                 ✨ NEW
├── components/
│   └── Loading.tsx                 ✨ NEW
└── styles/
    ├── auth.css                    ✨ NEW
    └── dashboard.css               ✨ NEW
```

---

## 🎨 Diseño Visual

### Colores Utilizados
- **Primario**: Cyan `#0891b2` (Azul profesional)
- **Secundario**: Verde Esmeralda `#10b981` (Salud y bienestar)
- **Error**: Rojo `#dc2626`
- **Success**: Verde `#16a34a`
- **Fondo**: Blanco y grises claros

### Características Visuales
✅ Gradientes azul-verde en fondos
✅ Bordes y transiciones suaves
✅ Iconos de lucide-react profesionales
✅ Animaciones fluidas (slide, spin, fade)
✅ Diseño completamente responsive
✅ Formularios accesibles con labels claros
✅ Validación visual de errores
✅ Estados de carga animados

---

## 🔐 Seguridad de Rutas

Todas las rutas están protegidas con validación de rol. Ver `AppRouter.tsx`:

```tsx
// Rutas públicas (sin protección)
/                    → Landing page
/login/fisio         → Login Fisioterapeuta
/login/paciente      → Login Paciente
/registro/paciente   → Registro Paciente (requiere token válido)

// Rutas protegidas para FISIO (requiredRole="fisio")
/invitar/paciente    → Invitar nuevo paciente
/dashboard/fisio     → Dashboard principal

// Rutas protegidas para PACIENTE (requiredRole="paciente")
/dashboard/paciente  → Dashboard paciente
```

---

## 🔄 Flujo de Autenticación

### 1️⃣ FISIOTERAPEUTA

```
Landing (/)
    ↓
Login Fisio (/login/fisio)
    ↓
Dashboard Fisio (/dashboard/fisio) [PROTEGIDO]
    ├→ Invitar Paciente (/invitar/paciente) [PROTEGIDO]
    └→ Gestionar Pacientes [próximamente]
```

### 2️⃣ PACIENTE

```
Landing (/)
    ↓
Invitación por Email (link con token)
    ↓
Registro Paciente (/registro/paciente?token=XXX&email=YYY)
    ↓
Login Paciente (/login/paciente)
    ↓
Dashboard Paciente (/dashboard/paciente) [PROTEGIDO]
```

---

## 📝 Componentes y sus Responsabilidades

### `LoginFisio.tsx`
- Formulario de email y contraseña
- Validación de campos
- Enlace a solicitud de acceso
- Redireccionamiento al dashboard tras éxito

### `LoginPaciente.tsx`
- Formulario de email y contraseña
- Nota aclaratoria sobre invitación requerida
- Redireccionamiento al dashboard tras éxito

### `RegistroPaciente.tsx`
- Validación de token en montaje
- Mostrar error si el token es inválido/expirado
- Formulario completo:
  - Nombre completo
  - Tipo de documento (CC, TI, CE, PP)
  - Número de documento
  - Teléfono (opcional)
  - Contraseña (mínimo 8 caracteres)
  - Confirmación de contraseña
- Validación de todos los campos
- Pantalla de éxito con redirección

### `InvitarPaciente.tsx`
- Formulario para crear invitación:
  - Nombre del paciente
  - Email del paciente
- Generación de URL con token único
- Botón para copiar URL al portapapeles
- Resumen de la invitación creada
- Opción para invitar más pacientes

### `DashboardFisio.tsx`
- Navegación con botón de logout
- Tarjetas para:
  - Invitar Paciente (enlace funcional)
  - Mis Pacientes (próximamente)
  - Mis Sesiones (próximamente)

### `DashboardPaciente.tsx`
- Navegación con botón de logout
- Tarjetas para:
  - Mi Progreso (próximamente)
  - Mis Sesiones (próximamente)
  - Ejercicios (próximamente)

### `RequireAuth.tsx`
- Componente HOC que protege rutas
- Valida si el usuario está autenticado
- Valida que el rol coincida con lo requerido
- Muestra spinner de carga mientras se valida
- Redirige a inicio si no hay permisos

### `useAuth.tsx`
- Context para la autenticación global
- Proporciona `user`, `userRole`, `loading`, `logout`
- Provider a envolver en App.tsx

### `Loading.tsx`
- Componente reutilizable de carga
- Spinner animado con estilo consistente

---

## 🎯 Implementación Pendiente

Todas las vistas están listas UI/UX, pero necesitan conectar con Firebase:

### En `LoginFisio.tsx` y `LoginPaciente.tsx`:
```tsx
// Reemplazar el placeholder con:
// 1. Usar Firebase Auth signInWithEmailAndPassword()
// 2. Obtener role desde Firestore
// 3. Actualizar context de useAuth
// 4. Guardar token en localStorage/sessionStorage
```

### En `RegistroPaciente.tsx`:
```tsx
// Reemplazar el placeholder con:
// 1. Validar token llamando a Cloud Function o Firestore
// 2. Usar Firebase Auth createUserWithEmailAndPassword()
// 3. Actualizar documento en Firestore con registered: true
// 4. Enviar email de confirmación
```

### En `InvitarPaciente.tsx`:
```tsx
// Reemplazar el placeholder con:
// 1. Crear documento en Firestore con datos del paciente
// 2. Generar token único (usar crypto.randomUUID o similar)
// 3. Guardar token temporalmente (con expiración)
// 4. Generar URL con token y email
// 5. Enviar email con el link usando SendGrid/Resend/similar
```

### En `useAuth.tsx`:
```tsx
// Reemplazar el placeholder con:
// 1. onAuthStateChanged() de Firebase Auth
// 2. Obtener role desde Firestore
// 3. Implementar logout() con signOut()
// 4. Manejar states de carga
```

---

## 🚀 Cómo Usar

### Desarrollo
```bash
npm run dev
# Acceder a http://localhost:5173
```

### Compilación
```bash
npm run build
# ✓ Compila sin errores
```

### Estructura de Archivos
- **Vistas**: `src/pages/`
- **Estilos**: `src/styles/` (auth.css, dashboard.css)
- **Autenticación**: `src/auth/` (useAuth, RequireAuth)
- **Componentes**: `src/components/` (Loading)

---

## 📱 Responsivo

Todas las vistas están optimizadas para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

Utilizan CSS Grid y Flexbox para adaptarse automáticamente.

---

## 🔒 Notas de Seguridad

1. **Tokens Temporales**: Los tokens de invitación deben expirar (recomendado 7 días)
2. **HTTPS**: Asegurar que en producción se use HTTPS
3. **Contraseñas**: Usar al menos 8 caracteres (aplicado en validación)
4. **Roles**: Validar roles tanto en cliente como en servidor
5. **Environment Variables**: Guardar credenciales de Firebase en `.env`

---

## 📞 Próximos Pasos

1. ✅ Implementar Firebase Auth (signIn, signUp, logout)
2. ✅ Implementar Firestore (crear docs, validar tokens)
3. ✅ Implementar servicio de email (invitaciones)
4. ✅ Mejorar dashboards con más funcionalidades
5. ✅ Agregar validaciones adicionales
6. ✅ Testing y debugging

---

## 💡 Tips de Implementación

### Para generar tokens únicos:
```typescript
// Opción 1: UUID
const token = crypto.randomUUID();

// Opción 2: Random string
const token = Math.random().toString(36).substring(2, 15) + 
              Math.random().toString(36).substring(2, 15);
```

### Para guardar invitaciones en Firestore:
```typescript
// Estructura recomendada
{
  fisioId: "uid_del_fisio",
  paciente: {
    nombre: "Juan Pérez",
    email: "juan@example.com"
  },
  token: "token_unico",
  expiresAt: timestamp + 7 días,
  registered: false,
  registeredAt: null
}
```

### Para la ruta de registro:
```
/registro/paciente?token=abc123&email=juan@example.com
```

---

¡Las vistas están listas para integrar con tu backend! 🎉
