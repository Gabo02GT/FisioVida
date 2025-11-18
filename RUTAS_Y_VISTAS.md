<!-- RUTAS Y VISTAS DE AUTENTICACIÓN -->

## 🏥 Estructura de Rutas - FisioVida

### 📋 Rutas Públicas (Sin autenticación requerida)

| Ruta | Vista | Descripción |
|------|------|-------------|
| `/` | Landing.tsx | Página de inicio/bienvenida |
| `/login/fisio` | LoginFisio.tsx | Login para fisioterapeutas |
| `/login/paciente` | LoginPaciente.tsx | Login para pacientes |
| `/registro/paciente` | RegistroPaciente.tsx | Registro de paciente con validación de token |

---

### 🔐 Rutas Protegidas - FISIOTERAPEUTA

Requieren rol: `fisio`

| Ruta | Vista | Descripción |
|------|------|-------------|
| `/dashboard/fisio` | DashboardFisio.tsx | Dashboard principal del fisio |
| `/invitar/paciente` | InvitarPaciente.tsx | Crear invitación para nuevo paciente |

---

### 🔐 Rutas Protegidas - PACIENTE

Requieren rol: `paciente`

| Ruta | Vista | Descripción |
|------|------|-------------|
| `/dashboard/paciente` | DashboardPaciente.tsx | Dashboard principal del paciente |

---

## 🎨 Diseño y Estilos

### Colores Utilizados
- **Primario**: Cyan/Azul (`#0891b2`)
- **Secundario**: Verde Esmeralda (`#10b981`)
- **Error**: Rojo (`#dc2626`)
- **Success**: Verde (`#16a34a`)
- **Neutro**: Grises (`#1e293b`, `#64748b`, `#e2e8f0`)

### Archivo de Estilos
- `src/styles/auth.css` - Estilos completos para todas las vistas de autenticación

---

## 🔄 Flujo de Registro del Paciente

```
1. Fisio va a /invitar/paciente
   ↓
2. Fisio llena:
   - Nombre del paciente
   - Email del paciente
   ↓
3. Sistema genera:
   - Documento en Firestore
   - Token único temporal
   - URL: /registro/paciente?token=XXX&email=YYY
   ↓
4. Se envía email al paciente con el enlace
   ↓
5. Paciente abre el enlace
   ↓
6. Sistema valida token
   ↓
7. Si es válido → Muestra formulario de registro
   - Nombre (pre-llenado)
   - Email (pre-llenado)
   - Tipo de documento
   - Número de documento
   - Teléfono (opcional)
   - Contraseña
   - Confirmar contraseña
   ↓
8. Paciente completa datos
   ↓
9. Se crea cuenta en Firebase Auth
   ↓
10. Se marca en Firestore: registered: true, role: "paciente"
```

---

## 📱 Componentes Creados

### LoginFisio.tsx
- Email y contraseña
- Validación de credenciales
- Enlace a solicitud de acceso
- Botón volver al inicio

### LoginPaciente.tsx
- Email y contraseña
- Validación de credenciales
- Nota sobre invitación requerida
- Botón volver al inicio

### RegistroPaciente.tsx
- Validación de token en montaje
- Formulario completo con:
  - Nombre
  - Tipo y número de documento
  - Teléfono
  - Contraseña con confirmación
- Manejo de tokens inválidos/expirados
- Mensaje de éxito con redirección

### InvitarPaciente.tsx
- Formulario para crear invitación
- Generación de URL con token y email
- Opción para copiar URL
- Mostrar detalles de invitación
- Opción para invitar otro paciente

---

## 🔒 Seguridad

- **RequireAuth.tsx**: Componente que valida autenticación y rol
- **useAuth.tsx**: Hook de contexto para gestionar estado de autenticación
- Rutas protegidas redirigen a inicio si no hay autenticación
- Validación de rol para acceso a rutas específicas
- Tokens temporales para invitaciones de pacientes

---

## 📝 Notas Importantes

1. **Placeholder Logic**: Todas las vistas tienen comentarios indicando dónde va la lógica de Firebase
2. **Rutas Dinámicas**: Las invitaciones usan query params: `?token=XXX&email=YYY`
3. **Responsive Design**: Todos los formularios son mobile-friendly
4. **Validación Cliente**: Validación básica de formularios implementada
5. **Loading States**: Spinners y estados de carga en botones
6. **Error Handling**: Mensajes de error claros y visibles

---

## 🚀 Próximos Pasos para Implementación

1. Implementar lógica de Firebase Auth en:
   - LoginFisio.tsx
   - LoginPaciente.tsx
   - RegistroPaciente.tsx

2. Implementar lógica de Firestore en:
   - InvitarPaciente.tsx (crear documento + generar token)
   - RegistroPaciente.tsx (validar token + actualizar documento)

3. Implementar email service para:
   - Enviar invitación al paciente

4. Completar useAuth.tsx con:
   - onAuthStateChanged listener
   - Lógica de logout
   - Obtención de rol desde Firestore
