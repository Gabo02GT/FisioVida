# 🍎 Mejoras en Plan Alimenticio - FisioVida

## 📋 Resumen de Mejoras

Se han implementado mejoras significativas en la vista de **Plan Alimenticio** para pacientes y fisioterapeutas, incluyendo integración completa con la **API de FatSecret** para acceso a una base de datos de alimentos profesional.

---

## ✨ Características Principales

### Para el Fisioterapeuta (PlanAlimenticioFisioMejorado.tsx)

#### 1. **Búsqueda integrada con FatSecret**
- Búsqueda en tiempo real de miles de alimentos
- Selección flexible de porciones
- Información nutricional completa y precisa
- Alternancia entre búsqueda en FatSecret e ingreso manual

#### 2. **Cálculo Automático de Calorías**
- Usa fórmula Harris-Benedict para calcular metabolismo basal
- Ajusta automáticamente según IMC del paciente
- Opción de ingreso manual de datos si no existen en el sistema
- Categorías: Bajo peso, Normal, Sobrepeso, Obeso

#### 3. **Gestión Intuitiva de Comidas**
- 4 comidas (Desayuno, Almuerzo, Merienda, Cena)
- Agregar, editar y eliminar comidas fácilmente
- Visualización clara de nutrientes por comida
- Historial de cambios con timestamps

#### 4. **Resumen Nutricional Completo**
- Visualización de calorías, proteína, carbohidratos y grasas
- Distribución de macronutrientes por comida
- Edición directa de objetivos nutricionales
- Notas personalizadas para el paciente

---

### Para el Paciente (PlanAlimenticioMejorado.tsx)

#### 1. **Vista Mejora del Plan**
- Interfaz clara y moderna
- Comidas organizadas con expand/collapse
- Resumen nutricional diario destacado
- Distribución visual de macronutrientes (%)

#### 2. **Información Detallada**
- Detalles completos de cada alimento
- Badges que indican fuente (FatSecret o Manual)
- Información de porción y descripción
- Breakdowns nutricionales visuales

#### 3. **Elementos Visuales Mejorados**
- Íconos descriptivos por comida
- Colores diferenciados
- Notas personalizadas del fisioterapeuta
- Fecha de última actualización

---

## 🔧 Integración con FatSecret API

### Credenciales Configuradas

```
Client ID (OAuth 2.0): d8563b830922450884392ed3ab9b0006
API Base: https://platform.fatsecret.com/rest/server.api
```

### Funciones Principales

#### 1. **searchFoods(query: string)**
```typescript
// Busca alimentos en la base de datos de FatSecret
const results = await searchFoods("pollo");
// Devuelve: Array de alimentos con ID, nombre, tipo y marca
```

**Respuesta Ejemplo:**
```json
[
  {
    "food_id": "123456",
    "food_name": "Chicken Breast",
    "food_type": "Meat",
    "brand_name": "Generic"
  }
]
```

#### 2. **getFoodDetails(foodId: string)**
```typescript
// Obtiene detalles completos incluidas porciones disponibles
const details = await getFoodDetails("123456");
// Devuelve: Detalles del alimento con array de porciones
```

**Respuesta Ejemplo:**
```json
{
  "food": { /* datos del alimento */ },
  "servings": [
    {
      "serving_id": "1",
      "serving_description": "1 breast (88g)",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  ]
}
```

### Ubicación del Código

**Archivo:** `src/services/fatSecretService.ts`

```typescript
// Importar en tus componentes
import { searchFoods, getFoodDetails, POPULAR_FOODS } from "../../services/fatSecretService";
```

---

## 📊 Estructura de Datos

### Estructura del Plan (Firestore)

```typescript
interface PlanData {
  desayuno: Meal[];
  almuerzo: Meal[];
  merienda: Meal[];
  cena: Meal[];
  calorias?: number;           // Calorías totales diarias
  proteina?: number;           // Proteína total (g)
  carbohidratos?: number;      // Carbohidratos totales (g)
  grasas?: number;             // Grasas totales (g)
  notas?: string;              // Notas del fisioterapeuta
  createdAt?: string;          // Timestamp de creación
  updatedAt?: string;          // Timestamp de actualización
}

interface Meal {
  nombre: string;
  descripcion?: string;        // Porción, marca, etc.
  calorias?: number;
  proteina?: number;
  carbohidratos?: number;
  grasas?: number;
  fuente?: "manual" | "fatsecret"; // Origen del dato
}
```

### Estructura en Firestore

```
firestore
└── plans/
    └── {userId}/
        ├── desayuno: Meal[]
        ├── almuerzo: Meal[]
        ├── merienda: Meal[]
        ├── cena: Meal[]
        ├── calorias: number
        ├── proteina: number
        ├── carbohidratos: number
        ├── grasas: number
        ├── notas: string
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

---

## 🚀 Guía de Uso - Para Fisioterapeuta

### Paso 1: Acceder a la Vista
```
Ruta: /fisio/paciente/{pacienteId}
En VistaPacienteFisio → Opción "Plan Alimenticio"
```

### Paso 2: Crear un Plan

#### Opción A: Usando Búsqueda FatSecret (Recomendado)
1. Click en "Agregar Comida" en cualquier comida
2. Seleccionar pestaña "🔍 Buscar en FatSecret"
3. Escribir nombre del alimento (ej: "Pollo")
4. Seleccionar resultado deseado
5. Elegir porción disponible
6. Click en "✓ Agregar esta porción"

#### Opción B: Entrada Manual
1. Click en "Agregar Comida"
2. Seleccionar pestaña "✏️ Entrada Manual"
3. Completar:
   - Nombre del alimento
   - Descripción (porción)
   - Nutrientes: Calorías, Proteína, Carbohidratos, Grasas
4. Click en "✓ Agregar comida"

### Paso 3: Configurar Calorías Diarias

**Automático:**
- Si el paciente tiene datos IMC → Se calcula automáticamente
- Click en "✓ Aplicar Sugerencia"

**Manual:**
- Click en "➕ Ingresar Datos Manualmente"
- Completar: Peso, Altura, Edad, Sexo
- Click en "Calcular & Usar"

### Paso 4: Ajustar Nutrientes y Notas

- Editar valores en sección "Resumen Nutricional Diario"
- Agregar notas personalizadas para el paciente
- Las notas serán visibles en el plan del paciente

### Paso 5: Guardar Plan

- Click en "💾 Guardar Plan Completo"
- Se guardará en Firestore con timestamp
- Mensaje de confirmación

---

## 👥 Guía de Uso - Para Paciente

### Acceder al Plan
```
Ruta: /paciente/plan-alimenticio
Dashboard Paciente → "Plan Alimenticio"
```

### Visualización

1. **Resumen Nutricional** - Ve tus objetivos diarios
2. **Comidas Expandibles** - Click para ver detalles
3. **Nutrientes por Alimento** - Calorías, Proteína, Carbs, Grasas
4. **Distribución Macro** - Porcentaje de cada macronutriente
5. **Notas Especiales** - Consejos de tu fisioterapeuta

### Badges de Origen
- 🔵 **FatSecret** - Datos de base de datos profesional
- 🟣 **Manual** - Datos ingresados manualmente

---

## 🧮 Fórmula de Cálculo de Calorías

### Harris-Benedict (Metabolismo Basal)

**Hombres:**
```
BMR = 88.362 + (13.397 × peso) + (4.799 × altura×100) - (5.677 × edad)
```

**Mujeres:**
```
BMR = 447.593 + (9.247 × peso) + (3.098 × altura×100) - (4.33 × edad)
```

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × 1.2  (factor de actividad sedentario)
```

### Ajuste según IMC

| IMC | Categoría | Ajuste | Fórmula |
|-----|-----------|--------|---------|
| < 18.5 | Bajo peso | +10% | TDEE × 1.1 |
| 18.5-25 | Normal | Base | TDEE × 1.0 |
| 25-30 | Sobrepeso | -15% | TDEE × 0.85 |
| > 30 | Obeso | -25% | TDEE × 0.75 |

**Ejemplo:**
```
Paciente: Mujer, 70kg, 1.65m, 30 años
BMR = 447.593 + (9.247×70) + (3.098×165) - (4.33×30)
BMR = 1,584 kcal

TDEE = 1,584 × 1.2 = 1,900 kcal
IMC = 70 / (1.65²) = 25.7 (Sobrepeso)
Recomendado = 1,900 × 0.85 = 1,615 kcal/día
```

---

## 🔐 Seguridad y Privacidad

### Credenciales
- Client ID almacenado en el código frontend
- FatSecret API es pública con OAuth 2.0
- No requiere autenticación para búsquedas básicas

### Datos Guardados
- Se guardan en Firestore bajo `/plans/{userId}`
- Solo el propietario y su fisioterapeuta asignado pueden ver
- Timestamps para auditoría de cambios

---

## 🛠️ Troubleshooting

### Problema: "No se encuentran alimentos"
**Solución:** 
- Verificar que la búsqueda tenga al menos 2 caracteres
- Intentar términos en inglés (ej: "chicken" en lugar de "pollo")
- Usar API de FatSecret directamente para verificar disponibilidad

### Problema: "Error al guardar"
**Solución:**
- Verificar conexión a internet
- Verificar permisos de Firestore en reglas
- Revisar consola del navegador para detalles del error

### Problema: "Calorías no se calculan"
**Solución:**
- El paciente debe tener datos completos: Peso, Altura, Edad, Sexo
- Si no existen, usar opción manual "➕ Ingresar Datos Manualmente"

---

## 📈 Próximas Mejoras Sugeridas

1. **Análisis Gráfico**
   - Gráficos de distribución de nutrientes
   - Seguimiento semanal/mensual de cumplimiento

2. **Sugerencias Inteligentes**
   - Recomendaciones de alimentos basadas en objetivos
   - Alimentos frecuentes rápidos para agregar

3. **Historial**
   - Ver versiones anteriores del plan
   - Comparar planes en el tiempo

4. **Sincronización**
   - Integrar con fitness trackers
   - Exportar a PDF

5. **Multiplataforma**
   - Aplicación móvil nativa
   - Sincronización en tiempo real

---

## 📝 Archivos Modificados

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `src/services/fatSecretService.ts` | Mejorado con getFoodDetails y ServingDetail | ✅ |
| `src/pages/fisio/PlanAlimenticioFisioMejorado.tsx` | Nuevo componente mejorado | ✅ Nuevo |
| `src/pages/paciente/PlanAlimenticioMejorado.tsx` | Nuevo componente mejorado | ✅ Nuevo |
| `src/app/AppRouter.tsx` | Actualizado con nuevas rutas | ✅ |
| `src/pages/paciente/PlanAlimenticio.tsx` | Original (mantenido para compatibilidad) | ✅ |
| `src/pages/fisio/PlanAlimenticioFisio.tsx` | Original (mantenido para compatibilidad) | ✅ |

---

## 🎯 Objetivos Logrados

✅ Integración completa de FatSecret API  
✅ Búsqueda avanzada de alimentos  
✅ Cálculo automático de calorías basado en IMC  
✅ Interfaz mejorada para fisioterapeuta  
✅ Visualización mejorada para paciente  
✅ Badges de origen de datos  
✅ Distribución de macronutrientes  
✅ Notas personalizadas  
✅ Timestamps de actualización  
✅ Modo de entrada manual y automática  

---

## 📞 Soporte

Para issues o preguntas sobre la integración:
1. Verificar logs en consola del navegador
2. Revisar estado de Firestore
3. Verificar credenciales de FatSecret API
4. Contactar al equipo de desarrollo

---

**Última actualización:** Noviembre 2025  
**Versión:** 2.0 - Mejoras de Plan Alimenticio con FatSecret
