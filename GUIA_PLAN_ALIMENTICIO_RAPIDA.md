# 📚 Guía Rápida - Plan Alimenticio Mejorado

## 🚀 Cómo Empezar

### Para Fisioterapeutas

#### 1. Acceder a la Vista de Edición
```
1. Ir a "Mis Pacientes"
2. Click en paciente deseado
3. En el card del paciente, click en "Plan Alimenticio"
4. Se abre: PlanAlimenticioFisioMejorado.tsx
```

#### 2. Ejemplo: Crear un Plan Básico

**Paso 1: Calcular calorías automáticamente**
- Sistema detecta datos IMC del paciente
- Muestra sugerencia automática
- Click "✓ Aplicar Sugerencia"
- ✅ Hecho

**Paso 2: Agregar Desayuno**
- Click "Agregar Comida" en Desayuno
- Pestaña "🔍 Buscar en FatSecret"
- Buscar: "Avena"
- Seleccionar resultado
- Elegir porción: "1 cup cooked"
- Click "✓ Agregar esta porción"
- ✅ Avena agregada con nutrientes automáticos

**Paso 3: Agregar Almuerzo (Manual)**
- Click "Agregar Comida" en Almuerzo
- Pestaña "✏️ Entrada Manual"
- Nombre: "Pollo con arroz"
- Descripción: "300g pechuga, 1 taza arroz"
- Calorías: 450
- Proteína: 40g
- Carbohidratos: 50g
- Grasas: 8g
- Click "✓ Agregar comida"
- ✅ Comida manual agregada

**Paso 4: Agregar Merienda y Cena**
- Repetir proceso con otros alimentos
- Puede mezclar búsqueda + manual

**Paso 5: Resumen Nutricional**
- Sistema calcula automáticamente totales
- Editar si necesita ajustes
- Agregar notas: "Evitar alimentos muy grasosos"
- Click "💾 Guardar Plan Completo"
- ✅ Plan guardado

---

### Para Pacientes

#### 1. Acceder al Plan
```
Dashboard Paciente → "Plan Alimenticio"
Se abre: PlanAlimenticioMejorado.tsx
```

#### 2. Ver el Plan
- **Resumen Nutricional** - Ve totales diarios
- **Comidas expandibles** - Click para ver detalles
- **Distribuación macro** - % de cada nutriente
- **Notas especiales** - Consejos personalizados

#### 3. Entender los Badges

```
🔵 FatSecret    = Dato profesional de base de datos
🟣 Manual        = Dato ingresado por fisioterapeuta
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Paciente con Sobrepeso
```typescript
// Datos paciente:
peso: 85kg
altura: 1.75m
edad: 35 años
sexo: masculino
IMC: 27.7 (Sobrepeso)

// Cálculo:
BMR = 88.362 + (13.397 × 85) + (4.799 × 175) - (5.677 × 35)
BMR ≈ 1,805 kcal
TDEE = 1,805 × 1.2 = 2,166 kcal
Ajuste Sobrepeso = 2,166 × 0.85 = 1,841 kcal

// Resultado: Se sugieren 1,841 kcal/día
```

### Caso 2: Paciente Normal
```typescript
peso: 65kg
altura: 1.68m
edad: 28 años
sexo: femenino
IMC: 23.0 (Normal)

// Resultado: Se sugieren calorías TDEE sin ajuste
```

### Caso 3: Atleta con Bajo Peso
```typescript
peso: 55kg
altura: 1.70m
edad: 22 años
sexo: femenino
IMC: 19.0 (Normal pero bajo)

// Resultado: Se sugieren calorías + 10%
```

---

## 🔧 Integración API FatSecret

### Endpoint de Búsqueda
```
GET /rest/server.api?method=foods.search
Query: pollo
Resultado: Array de alimentos con ID
```

### Ejemplo de Respuesta
```json
{
  "foods": {
    "food": [
      {
        "food_id": "123456",
        "food_name": "Chicken Breast, raw",
        "food_type": "Meat",
        "brand_name": "Generic"
      }
    ]
  }
}
```

### Endpoint de Detalles
```
GET /rest/server.api?method=food.get
food_id: 123456
Resultado: Detalles y porciones disponibles
```

### Ejemplo de Respuesta
```json
{
  "food": {
    "food_id": "123456",
    "food_name": "Chicken Breast",
    "servings": {
      "serving": [
        {
          "serving_id": "1",
          "serving_description": "100g",
          "calories": "165",
          "protein": "31",
          "carbohydrate": "0",
          "fat": "3.6"
        }
      ]
    }
  }
}
```

---

## 📊 Estructura de Datos Guardada

```typescript
// Lo que se guarda en Firestore
{
  desayuno: [
    {
      nombre: "Avena",
      descripcion: "1 cup cooked - 150g",
      calorias: 150,
      proteina: 5,
      carbohidratos: 27,
      grasas: 3,
      fuente: "fatsecret"
    }
  ],
  almuerzo: [
    {
      nombre: "Pollo con arroz",
      descripcion: "300g pechuga, 1 taza arroz",
      calorias: 450,
      proteina: 40,
      carbohidratos: 50,
      grasas: 8,
      fuente: "manual"
    }
  ],
  merienda: [],
  cena: [],
  calorias: 1800,
  proteina: 120,
  carbohidratos: 200,
  grasas: 60,
  notas: "Evitar alimentos grasosos",
  updatedAt: "2025-11-16T10:30:00Z"
}
```

---

## 🔐 Seguridad

### ✅ Lo que está protegido
- Solo el propietario ve su plan
- Solo el fisioterapeuta asignado puede editar
- Firestore rules lo valida

### ✅ API FatSecret
- No requiere autenticación
- Cliente ID público es normal
- Solo lectura de datos públicos

---

## 🐛 Troubleshooting

### "No se encuentran alimentos"
```
✓ Verificar caracteres: mínimo 2
✓ Intentar en inglés: "chicken" en lugar de "pollo"
✓ Revisar conexión a internet
```

### "No se calcula IMC"
```
✓ Verificar que paciente tiene datos completos
✓ Si no: Click "➕ Ingresar Datos Manualmente"
✓ Completar: Peso, Altura, Edad, Sexo
```

### "Error al guardar"
```
✓ Revisar consola (F12)
✓ Verificar permisos Firestore
✓ Verificar conexión a internet
```

---

## 🎨 Características Visuales

### Colores por Comida
- 🟡 **Desayuno**: Amber (Energía)
- 🟢 **Almuerzo**: Green (Principal)
- 🔴 **Merienda**: Pink (Snack)
- 🔵 **Cena**: Cyan (Noche)

### Iconos por Comida
- 🔥 Desayuno
- 📈 Almuerzo
- 🍃 Merienda
- 💧 Cena

---

## ✨ Mejoras Futuras Posibles

1. **Gráficos**
   - Chart.js para visualizar distribución
   - Seguimiento semanal/mensual

2. **Sincronización**
   - Integrar con fitness trackers
   - Exportar a PDF

3. **Inteligencia**
   - Sugerencias automáticas
   - Historial de alimentos frecuentes

4. **Social**
   - Compartir planes entre pacientes
   - Comentarios del fisio

---

## 📞 Contacto y Soporte

**Archivo de documentación completa:**
`PLAN_ALIMENTICIO_MEJORADO.md`

**Código fuente:**
- Fisio: `src/pages/fisio/PlanAlimenticioFisioMejorado.tsx`
- Paciente: `src/pages/paciente/PlanAlimenticioMejorado.tsx`
- API: `src/services/fatSecretService.ts`

---

**Última actualización:** Noviembre 2025  
**Versión:** 2.0 - Plan Alimenticio con FatSecret
