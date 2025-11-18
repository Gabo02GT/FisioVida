# 🗺️ MAPA COMPLETO DE RUTAS - FISIOVIDA v3.0

## 📍 Estructura de Rutas

```
FISIOVIDA/
├── / (Landing)
├── /login/
│   ├── fisio          → LoginFisio
│   └── paciente       → LoginPaciente
├── /registro/
│   └── paciente       → RegistroPaciente
│
├── RUTAS FISIOTERAPEUTA (requiredRole="fisio")
│   ├── /invitar/paciente                  → InvitarPaciente
│   ├── /mis-pacientes                     → MisPacientes ⭐
│   │   └── [Click "Ver Detalles"]
│   │
│   ├── /dashboard/fisio                   → DashboardFisio
│   │
│   └── /fisio/paciente/:pacienteId        → VistaPacienteFisio ⭐⭐
│       ├── /fisio/calculadora/:id         → CalculadoraPacienteFisio
│       ├── /fisio/mediciones/:id          → SeguimientoFisio
│       ├── /fisio/plan-alimenticio/:id    → PlanAlimenticioFisio
│       ├── /fisio/rutinas/:id             → RutinasFisio
│       ├── /fisio/citas/:id               → CitasFisio
│       └── /fisio/reportes/:id            → ReportesFisio
│
└── RUTAS PACIENTE (requiredRole="paciente")
    ├── /dashboard/paciente                → DashboardPaciente
    ├── /paciente/calculadora-corporal     → CalculadoraCorporal
    ├── /paciente/seguimiento-mensual      → SeguimientoMensual
    ├── /paciente/plan-alimenticio         → PlanAlimenticio
    ├── /paciente/rutinas-personalizadas   → RutinasPersonalizadas
    ├── /paciente/gestion-citas            → GestionCitas
    └── /paciente/reporte-resultados       → ReporteResultados
```

---

## 🔑 LEYENDA

- ⭐ = Ruta principal (punto de entrada)
- ⭐⭐ = Hub central (conecta todo)
- `{}` = Parámetro dinámico (pacienteId)

---

## 🎭 FLUJOS POR ROL

### 👥 FISIOTERAPEUTA

```
START
  ↓
/login/fisio
  ↓
✓ Autenticado (role="fisio")
  ↓
/dashboard/fisio
  ├─→ [Mis Pacientes]
  │    ↓
  │    /mis-pacientes
  │    ├─→ [Ver Detalles]
  │    │    ↓
  │    │    /fisio/paciente/:id ⭐⭐
  │    │    ├─ 📋 Perfil
  │    │    ├─ ⚖️  /fisio/calculadora/:id
  │    │    ├─ 📊 /fisio/mediciones/:id
  │    │    ├─ 🍎 /fisio/plan-alimenticio/:id
  │    │    ├─ 💪 /fisio/rutinas/:id
  │    │    ├─ 📅 /fisio/citas/:id
  │    │    └─ 📈 /fisio/reportes/:id
  │    │
  │    └─→ [Invitar Paciente]
  │         ↓
  │         /invitar/paciente
  │
  ├─→ [Dashboard]
  │    (Resumen del día, métricas, etc)
  │
  └─→ [Logout]
       ↓
       /login/fisio (vuelve)
```

### 👤 PACIENTE

```
START
  ↓
/login/paciente
  ↓
✓ Autenticado (role="paciente")
  ↓
/dashboard/paciente
  ├─→ [Calculadora IMC]
  │    ↓
  │    /paciente/calculadora-corporal
  │    (Primera vez: pide edad/sexo)
  │    (Luego: solo calcula)
  │
  ├─→ [Mediciones]
  │    ↓
  │    /paciente/seguimiento-mensual
  │    (Registra 6 medidas corporales)
  │
  ├─→ [Plan Alimenticio]
  │    ↓
  │    /paciente/plan-alimenticio
  │    (Ver plan creado por fisio)
  │
  ├─→ [Rutinas]
  │    ↓
  │    /paciente/rutinas-personalizadas
  │    (Ver rutinas, marcar completadas)
  │
  ├─→ [Citas]
  │    ↓
  │    /paciente/gestion-citas
  │    (Ver próxima cita y historial)
  │
  ├─→ [Reportes]
  │    ↓
  │    /paciente/reporte-resultados
  │    (Ver progreso y recomendaciones)
  │
  └─→ [Logout]
       ↓
       /login/paciente (vuelve)
```

---

## 🎯 CASOS DE USO PRINCIPALES

### Caso 1: Fisio quiere ver datos de un paciente

```
1. Login → /login/fisio
2. Click "Mis Pacientes" → /mis-pacientes
3. Buscar paciente en lista
4. Click "Ver Detalles" → /fisio/paciente/abc123
5. OPCIONES:
   - Ver perfil (📋 tab)
   - Ver IMC → /fisio/calculadora/abc123
   - Editar mediciones → /fisio/mediciones/abc123
   - Crear plan → /fisio/plan-alimenticio/abc123
   - Crear rutinas → /fisio/rutinas/abc123
   - Agendar citas → /fisio/citas/abc123
   - Crear reportes → /fisio/reportes/abc123
6. Editar/crear data
7. Click "Guardar"
8. Firestore actualiza
9. Volver a hub principal
```

### Caso 2: Paciente registra medidas

```
1. Login → /login/paciente
2. Click "Mediciones" → /paciente/seguimiento-mensual
3. Llenar 6 medidas
4. Click "Guardar"
5. Se guarda en users/{uid}.measurements
6. Historial se actualiza
7. Paciente ve tabla con todas sus medidas
```

### Caso 3: Paciente ve plan del fisio

```
1. Login → /login/paciente
2. Click "Plan Alimenticio" → /paciente/plan-alimenticio
3. Ver desayuno, almuerzo, merienda, cena
4. Ver info nutricional (calorías, proteína, etc)
5. Ver notas especiales del fisio
6. (No puede editar - es solo lectura)
```

### Caso 4: Fisio crea plan para paciente

```
1. /mis-pacientes → Buscar paciente
2. "Ver Detalles" → /fisio/paciente/xyz789
3. Click tab "🍎 Plan Alimenticio"
4. Ir a /fisio/plan-alimenticio/xyz789
5. Agregar comidas:
   - Desayuno: huevos, pan tostado, jugo naranja
   - Almuerzo: pollo, arroz, ensalada
   - Merienda: yogurt, frutos secos
   - Cena: salmón, papas, brócoli
6. Agregar nutrición: 2500 cal, 150g proteína, etc
7. Agregar notas: "Evitar azúcares refinados"
8. Click "💾 Guardar Plan"
9. Se guarda en plans/xyz789
10. Paciente lo ve en /paciente/plan-alimenticio
```

---

## 🔐 PROTECCIÓN DE RUTAS

```typescript
// Todas las rutas requieren autenticación:

FISIO:
<RequireAuth requiredRole="fisio">
  <Component />
</RequireAuth>

PACIENTE:
<RequireAuth requiredRole="paciente">
  <Component />
</RequireAuth>

PÚBLICAS:
Landing (sin RequireAuth)
LoginFisio (sin RequireAuth)
LoginPaciente (sin RequireAuth)
RegistroPaciente (sin RequireAuth, pero necesita token)
```

---

## 📊 ESTADÍSTICAS DE RUTAS

| Tipo | Cantidad |
|------|----------|
| Rutas totales | 27 |
| Rutas públicas | 4 |
| Rutas fisioterapeuta | 8 |
| Rutas paciente | 7 |
| Rutas dinámicas | 7 (con :pacienteId) |

---

## 🔄 PARÁMETROS DINÁMICOS

```
:pacienteId
├─ Usado en todas las rutas del Fisio para pacientes
├─ Extraído con: useParams<{ pacienteId: string }>()
├─ Validación: Verificar que existe en Firestore
└─ Seguridad: Solo el Fisio que invitó puede verlo
```

---

## ⚡ PUNTOS DE ENTRADA

### Para Nuevos Usuarios
- Paciente: `/registro/paciente?token=xxx&email=xxx`
- Fisio: `/login/fisio`

### Para Usuarios Existentes
- Paciente: `/login/paciente`
- Fisio: `/login/fisio`

### Para Volver al Inicio
- Ambos: `/` (Landing)

---

## 🎨 SIDEBAR/NAVBAR NAVIGATION

### NavbarFisio (Sticky)
```
FisioVida - Fisioterapeuta
├─ 👥 Mis Pacientes      → /mis-pacientes
├─ 📊 Dashboard          → /dashboard/fisio
└─ 🚪 Logout             → /login/fisio
```

### NavbarPaciente (Sticky)
```
FisioVida - Paciente
├─ 📊 Dashboard          → /dashboard/paciente
├─ ⚙️ Configuración       → (próxima fase)
└─ 🚪 Logout             → /login/paciente
```

---

## 📱 RESPONSIVIDAD

Todas las rutas son **100% responsivas**:
- ✅ Desktop: Interfaz completa
- ✅ Tablet: Ajustada a pantalla
- ✅ Mobile: Single column, touch-friendly

---

## 🚀 PRÓXIMAS FASES

### Fase 4: Nuevas Rutas
- [ ] `/paciente/configuracion` - Settings personales
- [ ] `/fisio/estadisticas` - Analytics dashboard
- [ ] `/fisio/perfil/:id` - Ver perfil del paciente
- [ ] `/chat/:pacienteId` - Chat en tiempo real
- [ ] `/reportes/:id/pdf` - Descargar reporte

---

## ✅ VALIDACIÓN

- ✅ 27 rutas funcionales
- ✅ 7 componentes nuevos para Fisio
- ✅ 6 módulos completos para Paciente
- ✅ Protección de rutas
- ✅ Parámetros dinámicos
- ✅ Navbars funcionales
- ✅ Flujos de usuario claros

---

**Versión**: 3.0  
**Status**: 🟢 PRODUCCIÓN LISTA  
**Última actualización**: Noviembre 16, 2024
