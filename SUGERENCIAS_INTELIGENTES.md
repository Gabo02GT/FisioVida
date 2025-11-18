# 🎯 Sistema de Sugerencias Inteligentes - Implementación

## Resumen
Se implementó un sistema de **sugerencias automáticas basadas en datos** en los módulos del Fisioterapeuta para planes alimenticios y rutinas de ejercicios. Ahora el Fisio puede ver recomendaciones inteligentes basadas en el IMC y mediciones del paciente.

---

## 🍎 Plan Alimenticio Fisio - Sugerencias de Calorías

### ¿Qué se hizo?
**PlanAlimenticioFisio.tsx** ahora carga el IMC del paciente y calcula automáticamente las calorías diarias recomendadas.

### Flujo:
1. **Carga de datos**: Cuando el fisio abre el plan de un paciente, el sistema:
   - Lee el peso, altura, edad y sexo del usuario
   - Obtiene el último IMC de la historia del paciente
   
2. **Cálculo de calorías**: Usa la **ecuación Harris-Benedict** para metabolismo basal:
   ```
   Hombres: BMR = 88.362 + 13.397×peso + 4.799×altura(cm) - 5.677×edad
   Mujeres: BMR = 447.593 + 9.247×peso + 3.098×altura(cm) - 4.33×edad
   ```

3. **Ajuste según IMC**:
   - **Bajo peso** (IMC < 18.5): +10% calorías
   - **Normal** (18.5-25): Calorías base
   - **Sobrepeso** (25-30): -15% calorías
   - **Obesidad** (>30): -25% calorías

4. **Visualización**: Se muestra un panel con:
   - Caja de sugerencia azul clara con icono 💡
   - Valor de calorías recomendadas en grande
   - Botón "✓ Aplicar Sugerencia" para usar automáticamente

### Ejemplo:
```
Paciente: 85 kg, 1.75 m, 35 años, Masculino
IMC: 27.8 (Sobrepeso)
BMR: ~1,800 kcal
TDEE: ~2,160 kcal (×1.2 sedentario)
Sugerencia: ~1,836 kcal (-15% por sobrepeso)
```

---

## 💪 Rutinas Fisio - Sugerencias de Intensidad

### ¿Qué se hizo?
**RutinasFisio.tsx** ahora muestra:
- Recomendación de intensidad según el IMC
- Mediciones actuales del paciente en tiempo real

### Flujo:
1. **Carga de datos**: Cuando el fisio abre las rutinas:
   - Lee el IMC más reciente
   - Carga las mediciones actuales (brazos, pecho, cintura, piernas)

2. **Sugerencia de intensidad**:
   - **Bajo peso**: "Baja intensidad con énfasis en fortalecimiento"
   - **Normal**: "Intensidad moderada con entrenamiento funcional"
   - **Sobrepeso**: "Intensidad moderada-alta con énfasis cardiovascular"
   - **Obesidad**: "Entrenamiento de bajo impacto progresivo"

3. **Visualización**: Panel con:
   - Caja de sugerencia púrpura con icono 💡
   - Texto de recomendación clara
   - Tabla de mediciones actuales debajo:
     - Cintura, Pecho, Brazos, Piernas (en cm)

### Ejemplo:
```
Paciente: 90 kg, 1.70 m, IMC 31.1 (Obesidad)
Sugerencia: "Entrenamiento de bajo impacto progresivo"
Mediciones actuales:
  - Cintura: 105 cm
  - Pecho: 110 cm
  - Brazos: 34 cm
  - Piernas: 62 cm
```

---

## 📊 Cálculos Implementados

### 1. Ecuación de Calorías (Harris-Benedict)
```typescript
const calculateSuggestedCalories = (
  peso: number,
  altura: number,
  edad: number,
  sexo: string,
  imc: number
): number => {
  let bmr: number;
  if (sexo === "masculino" || sexo === "M") {
    bmr = 88.362 + 13.397 * peso + 4.799 * (altura * 100) - 5.677 * edad;
  } else {
    bmr = 447.593 + 9.247 * peso + 3.098 * (altura * 100) - 4.33 * edad;
  }
  const tdee = bmr * 1.2; // Factor sedentario
  
  // Ajuste según IMC
  if (imc < 18.5) return Math.round(tdee * 1.1);
  if (imc < 25) return Math.round(tdee);
  if (imc < 30) return Math.round(tdee * 0.85);
  return Math.round(tdee * 0.75);
};
```

### 2. Intensidad de Ejercicio
```typescript
const calculateExerciseIntensity = (imc: number): string => {
  if (imc < 18.5) return "Baja intensidad con énfasis en fortalecimiento";
  if (imc < 25) return "Intensidad moderada con entrenamiento funcional";
  if (imc < 30) return "Intensidad moderada-alta con énfasis cardiovascular";
  return "Entrenamiento de bajo impacto progresivo";
};
```

---

## 🎨 Estilos UI

### Plan Alimenticio - Caja de Sugerencia
```css
.suggestion-box {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #0891b2;
  border-radius: 12px;
}
```
**Colores**: Azul claro con énfasis en verde para calorías

### Rutinas - Caja de Sugerencia
```css
.suggestion-box {
  background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
  border: 2px solid #8b5cf6;
  border-radius: 12px;
}
```
**Colores**: Púrpura para intensidad, Verde para mediciones

---

## 🔄 Integración Firebase

### Datos Leídos:
```typescript
users/{pacienteId}:
  - peso (kg)
  - altura (m)
  - edad (años)
  - sexo (string)
  - imcHistory: Array<{imc: number, peso: number, ...}>
  - measurements: {
      brazos: number,
      piernas: number,
      cintura: number,
      pecho: number,
      espalda?: number,
      cadera?: number
    }
```

### Datos Guardados:
```typescript
plans/{pacienteId}:
  - calorias (número sugerido)
  - ...resto de plan

routines/{pacienteId}:
  - exercises: Array<{...}>
  - ...resto de rutinas
```

---

## ✅ Cambios de Código

### 1. PlanAlimenticioFisio.tsx
- **Línea 53-82**: Agregado useEffect que carga user data + calcula calorías
- **Línea 84-108**: Nueva función `calculateSuggestedCalories`
- **Línea 137-140**: Nueva función `handleApplySuggestedCalories` 
- **Línea 190-206**: UI de sugerencia de calorías
- **Línea 589-627**: Estilos CSS nuevos

### 2. RutinasFisio.tsx
- **Línea 17-27**: Nuevas interfaces (Measurements, UserData)
- **Línea 45-47**: Nuevas variables de estado (userData, suggestedIntensity)
- **Línea 58-96**: useEffect expandido para cargar IMC + mediciones
- **Línea 98-108**: Nueva función `calculateExerciseIntensity`
- **Línea 188-229**: UI de sugerencia con mediciones
- **Línea 735-794**: Estilos CSS nuevos

---

## 🧪 Build Status

```
✅ TypeScript: 0 errors
✅ Bundle: 935.36 kB (gzip: 272.91 kB)
✅ Build time: 7.12 seconds
⚠️ Warning: Chunk size > 500kB (normal, no crítico)
```

---

## 🚀 Cómo Usar

### Para el Fisioterapeuta:
1. **Acceder a plan del paciente**
   - Click en "Ver Detalles" desde MisPacientes
   - Ir a tab "🍎 Plan"
   - ✅ Ver sugerencia de calorías automática

2. **Acceder a rutina del paciente**
   - Click en "Ver Detalles" desde MisPacientes
   - Ir a tab "💪 Rutinas"
   - ✅ Ver recomendación de intensidad automática
   - ✅ Ver mediciones actuales del paciente

3. **Usar sugerencias**
   - Click en "✓ Aplicar Sugerencia" para usar calorías propuestas
   - Las mediciones son solo informativos (para considerar al crear rutinas)

---

## 🔮 Mejoras Futuras

1. **Análisis de progreso**: Usar histórico de IMC para ver tendencias
2. **Recomendaciones de macros**: Distribuir proteína, carbs, grasas basado en tipo de ejercicio
3. **Ejercicios específicos**: Sugerir ejercicios concretos según mediciones
4. **Gráficas de progreso**: Visualizar cambios en mediciones
5. **Alertas**: Notificar si paciente sale de rango saludable

---

## 📝 Notas Técnicas

- Las ecuaciones de Harris-Benedict son estándares en nutrición
- Los ajustes por IMC son conservadores pero efectivos
- El factor de actividad se fija en 1.2 (sedentario) - se puede expandir con selector
- Todas las sugerencias se pueden editar manualmente por el fisio

