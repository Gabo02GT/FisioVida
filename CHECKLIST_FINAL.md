# 🎯 CHECKLIST FINAL - Todo Lo Que Necesitas Hacer

## ✅ PASO 1: ACTUALIZAR REGLAS DE FIRESTORE (MUY IMPORTANTE)

### Acciones:
1. **Abre Firebase Console**: https://console.firebase.google.com/
2. **Selecciona tu proyecto** (FisioVida)
3. **Ve a**: Firestore Database → Rules
4. **Copia el contenido** de este archivo:
   - Ubicación: `c:/Users/gabri/Desktop/FisioVida/fisiovida/firestore.rules`
5. **Pega en Firebase Console** (reemplaza todo lo que hay)
6. **Haz click "Publish"**
7. **Espera 10-15 segundos** hasta que aparezca "Rules updated"

**Esto es CRÍTICO** - sin esto, el Fisio no puede leer datos del Paciente.

---

## ✅ PASO 2: COMPRENDER EL FLUJO

### Flujo Correcto:

```
PACIENTE (Login como Paciente)
├─ Va a "⚖️ Calculadora IMC"
│  ├─ Completa forma de perfil (edad, sexo)
│  ├─ Ingresa peso y altura
│  ├─ Click "Calcular"
│  └─ ✅ Se guarda en Firebase:
│     users/{pacienteId}.peso
│     users/{pacienteId}.altura
│     users/{pacienteId}.imcHistory[]
│
└─ Va a "📊 Seguimiento Mensual"
   ├─ Ingresa mediciones (brazos, cintura, etc)
   ├─ Click "Guardar"
   └─ ✅ Se guarda en Firebase:
      users/{pacienteId}.measurements[]

FISIOTERAPEUTA (Login como Fisio)
├─ Ve a "👥 Mis Pacientes"
├─ Click "Ver Detalles" en un paciente
├─ VistaPacienteFisio abre (7 tabs)
│
├─ Tab "⚖️ Calculadora"
│  └─ ✅ Ve el historial de IMC del paciente
│     (LEE de Firebase users/{pacienteId}.imcHistory)
│
├─ Tab "📊 Mediciones"
│  └─ ✅ Ve las mediciones del paciente
│     (LEE de Firebase users/{pacienteId}.measurements)
│
├─ Tab "🍎 Plan Alimenticio"
│  ├─ SI hay datos de IMC:
│  │  └─ Muestra caja azul con calorías sugeridas
│  └─ SI NO hay datos de IMC:
│     ├─ Muestra opción "➕ Ingresar Datos Manualmente"
│     └─ Fisio ingresa peso, altura, edad, sexo
│        └─ Calcula calorías automáticamente
│
├─ Tab "💪 Rutinas"
│  ├─ SI hay datos de IMC:
│  │  └─ Muestra caja púrpura con intensidad sugerida
│  │     + tabla de mediciones actuales
│  └─ SI NO hay datos:
│     └─ Muestra advertencia
│
└─ Tab "📅 Citas" / "📈 Reportes"
   └─ Funciona normalmente
```

---

## ✅ PASO 3: PROBAR CON UN USUARIO NUEVO (RECOMENDADO)

### Crear un nuevo usuario desde cero:

**Como FISIO:**
1. Ve a "📨 Invitar Paciente"
2. Invita a: `test@example.com`
3. Copia el enlace de invitación
4. Abre en una ventana incógnita

**Registrarse como PACIENTE:**
1. Pega el enlace
2. Completa:
   - Nombre: "Juan Test"
   - Edad: 30
   - Password: 123456
3. Click "Registrarse"

**PACIENTE - Ingresa datos:**
1. Login como paciente
2. Ve a "⚖️ Calculadora IMC"
3. Completa:
   - Peso: 85 kg
   - Altura: 175 cm
   - Click "Calcular"
4. Ve a "📊 Seguimiento Mensual"
5. Completa mediciones:
   - Brazos: 34
   - Cintura: 105
   - Pecho: 110
   - Piernas: 62
6. Click "Guardar"

**FISIO - Ve los datos:**
1. Logout del paciente
2. Login como Fisio
3. Ve a "Mis Pacientes"
4. Click "Ver Detalles" en Juan Test
5. Abre tab "🍎 Plan"
   - ✅ Debe aparecer caja azul con calorías sugeridas
6. Abre tab "💪 Rutinas"
   - ✅ Debe aparecer caja púrpura + mediciones

---

## ❌ Errores Comunes y Soluciones

### Error: "Missing or insufficient permissions"
- **Causa**: No actualizaste las reglas de Firestore
- **Solución**: Sigue PASO 1 exactamente

### La landing page aparece en lugar de datos
- **Causa**: Error al cargar datos + redirección
- **Solución**: 
  1. Verifica que actualizaste reglas
  2. Verifica que el usuario está logueado como FISIO
  3. Abre consola (F12) y busca el error exacto

### No aparecen las sugerencias de calorías
- **Causa**: El paciente no tiene datos de IMC guardados
- **Solución**: 
  - Opción 1: El paciente ingresa datos en su CalculadoraCorporal
  - Opción 2: El Fisio hace click "➕ Ingresar Datos Manualmente" en Plan

### No aparecen las mediciones
- **Causa**: El paciente no ingresó mediciones
- **Solución**: Paciente va a "📊 Seguimiento Mensual" y guarda mediciones

---

## 📋 Resumen de Cambios Implementados

### En el Código:
1. ✅ `RegistroPaciente.tsx` - Ahora crea campos iniciales (sexo, peso, altura, imcHistory, measurements)
2. ✅ `CalculadoraCorporal.tsx` - Guarda peso y altura en campos raíz
3. ✅ `PlanAlimenticioFisio.tsx` - Carga datos de Firebase + modal para ingresar manualmente
4. ✅ `RutinasFisio.tsx` - Carga datos de Firebase + muestra sugerencias
5. ✅ `SeguimientoFisio.tsx` - Lee mediciones de Firebase
6. ✅ `CalculadoraPacienteFisio.tsx` - Lee historial IMC de Firebase

### En Firebase:
1. ✅ Estructura de datos verificada
2. ✅ `firestore.rules` creado con permisos correctos

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE TODO ESTO

1. Fisio puede crear planes alimenticios
2. Fisio puede crear rutinas personalizadas
3. Fisio puede agendar citas
4. Fisio puede crear reportes de progreso
5. Paciente ve todo en su dashboard

---

## 📞 Si Algo No Funciona

Abre la consola del navegador (F12) y busca:
- Errores rojos
- Mensajes en la consola
- Network errors
- Firebase errors

Copia el error exacto y muéstramelo para diagnosticar.

---

**IMPORTANTE**: El PASO 1 es crítico. Sin actualizar las reglas de Firestore, nada funcionará.

