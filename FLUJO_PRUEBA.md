# 🧪 FLUJO DE PRUEBA - Sistema de Sugerencias

## El Problema Anterior
El Fisio veía "⚠️ Datos de IMC No Disponibles" porque:
1. El paciente al registrarse no guardaba `sexo`, `peso`, `altura`
2. Los arrays `imcHistory` y `measurements` estaban vacíos

## La Solución Implementada
Ahora cuando un paciente se registra, se crea el documento con:
```javascript
{
  nombre: "Juan",
  email: "juan@example.com",
  edad: 35,
  sexo: null,        ← AHORA EXISTE
  peso: null,        ← AHORA EXISTE
  altura: null,      ← AHORA EXISTE
  imcHistory: [],    ← AHORA EXISTE (vacío)
  measurements: [],  ← AHORA EXISTE (vacío)
  role: "paciente"
}
```

---

## 📋 PASOS PARA PROBAR (Opción A - Con Usuario Nuevo)

### 1️⃣ **Crear Nueva Invitación como Fisio**
- Abre la app como Fisio
- Ve a "📨 Invitar Paciente"
- Invita a: `prueba@test.com`
- Copia el enlace de invitación

### 2️⃣ **Registrarse como Paciente**
- Abre el enlace en incógnito/nuevo navegador
- Completa:
  - Nombre: "Juan Pérez"
  - Edad: 35
  - Password: 123456
- Click "Registrarse"
- ✅ Verifica que se creó el documento en Firebase con campos vacíos

### 3️⃣ **Paciente Ingresa IMC**
- Login como paciente
- Va a "⚖️ Calculadora IMC"
- Completa:
  - Peso: 85 kg
  - Altura: 175 cm
  - Click "Calcular IMC"
- ✅ Se guarda en Firebase:
  ```
  peso: 85
  altura: 1.75
  imcHistory: [{
    imc: 27.8,
    peso: 85,
    altura: 1.75,
    categoria: "Sobrepeso"
  }]
  ```

### 4️⃣ **Paciente Ingresa Mediciones**
- Va a "📊 Seguimiento Mensual"
- Completa:
  - Brazos: 34 cm
  - Cintura: 105 cm
  - Pecho: 110 cm
  - Piernas: 62 cm
- Click "Guardar"
- ✅ Se guarda en Firebase:
  ```
  measurements: [{
    date: "16/11/2024",
    brazoDerecho: 34,
    brazoIzquierdo: 34,
    cintura: 105,
    pecho: 110,
    piernaDerecha: 62,
    piernaIzquierda: 62
  }]
  ```

### 5️⃣ **Fisio Abre Vista del Paciente**
- Cambias a Fisio
- Ve a "👥 Mis Pacientes"
- Click "Ver Detalles" en Juan Pérez

### 6️⃣ **Fisio Ve Plan Alimenticio**
- En VistaPacienteFisio, click tab "🍎 Plan"
- ✅ **DEBE APARECER caja azul con:**
  ```
  💡 Sugerencia de Calorías Basada en IMC
  Según los datos del paciente...
  1836
  calorías/día
  ✓ Aplicar Sugerencia
  ```

### 7️⃣ **Fisio Ve Rutinas**
- Click tab "💪 Rutinas"
- ✅ **DEBE APARECER caja púrpura con:**
  ```
  💡 Sugerencia de Intensidad Basada en Métricas
  Intensidad moderada-alta con énfasis cardiovascular
  
  Mediciones Actuales:
  Cintura: 105 cm
  Pecho: 110 cm
  Brazos: 34 cm
  Piernas: 62 cm
  ```

---

## 📋 PASOS PARA PROBAR (Opción B - Con Usuario Existente)

Si ya tienes un usuario registrado pero sin datos de IMC:

### 1️⃣ **Paciente Ingresa IMC**
- Login como paciente
- Ve a "⚖️ Calculadora IMC"
- Completa peso y altura
- Click "Calcular IMC"

### 2️⃣ **Paciente Ingresa Mediciones**
- Ve a "📊 Seguimiento Mensual"
- Ingresa mediciones
- Click "Guardar"

### 3️⃣ **Fisio Abre Plan/Rutinas**
- Cambias a Fisio
- Ve detalles del paciente
- Abre Plan y Rutinas
- ✅ **Deben aparecer las sugerencias**

---

## 🔍 Qué Verificar en Firebase

En Firebase Console, ve a Firestore y verifica:

**Colección: `users`**
- Documento del paciente debe tener:
  - ✅ `peso`: 85
  - ✅ `altura`: 1.75
  - ✅ `imcHistory`: Array con registros
  - ✅ `measurements`: Array con mediciones

**Si FALTA algo:**
- Puede ser que los datos antiguos no se actualizaron
- Solución: Elimina el documento del usuario y crea uno nuevo desde cero

---

## ❌ Si Aún No Funciona

### Checklist:
- [ ] ¿El paciente tiene peso y altura guardados?
  - Verifica en Firebase: `users/{uid}.peso` y `users/{uid}.altura`
  
- [ ] ¿El paciente tiene imcHistory?
  - Verifica en Firebase: `users/{uid}.imcHistory` debe ser un array
  
- [ ] ¿El paciente tiene measurements?
  - Verifica en Firebase: `users/{uid}.measurements` debe ser un array
  
- [ ] ¿Estás usando el UID correcto del paciente?
  - El PlanAlimenticioFisio y RutinasFisio reciben `pacienteId` como parámetro

### Debug en Console:
Abre la consola del navegador (F12) y busca:
- Errores rojo
- Mensajes de "Error cargando datos"
- Verificar que los datos se leen correctamente

---

## 📊 Resumen del Flujo Correcto

```
PACIENTE                          FIREBASE                        FISIO
─────────────────────            ─────────────────────            ─────────────────────
                                 
Ingresa IMC          ──────→   peso: 85                ──────→   Lee peso/altura
(85 kg, 175 cm)                 altura: 1.75                     Calcula IMC
                                imcHistory: [...]                Muestra sugerencias
                                
Ingresa Mediciones   ──────→   measurements: [...]    ──────→   Lee mediciones
(brazos, cintura...)           {brazos: 34, ...}               Muestra en UI
                               
                               
RESULTADO:
- PlanAlimenticioFisio: Muestra caja azul con calorías sugeridas
- RutinasFisio: Muestra caja púrpura con intensidad + mediciones
```

---

## 🚀 Próximos Pasos

Una vez que funcione:
1. Fisio puede hacer click "✓ Aplicar Sugerencia" para usar las calorías calculadas
2. Fisio continúa creando el plan alimenticio
3. Fisio continúa creando rutinas
4. Paciente puede ver todo completado en sus tabs

