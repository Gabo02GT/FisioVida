# 🍽️ Gestión de Planes Alimenticios - Guía del Fisioterapeuta

## ✨ ¿Qué es?

Es una **interfaz profesional** donde los fisioterapeutas pueden crear, editar y gestionar planes alimenticios personalizados para cada paciente.

---

## 🎯 Características Principales

### ✅ Gestión de Pacientes
- Selecciona un paciente de tu lista
- Ve información personal (peso, altura, edad)
- Crea un plan único para cada paciente

### ✅ Búsqueda en FatSecret
- Busca alimentos profesionales en tiempo real
- Acceso a miles de alimentos con datos nutricionales verificados
- Múltiples opciones de porciones

### ✅ Entrada Manual
- Agrega alimentos no encontrados en FatSecret
- Define porción y nutrientes manualmente

### ✅ Gestión de Comidas
- **4 comidas al día**: Desayuno, Almuerzo, Merienda, Cena
- Expande/contrae cada comida
- Elimina alimentos individuales

### ✅ Cálculo Automático
- Totales de calorías, proteína, carbohidratos y grasas
- Se recalcula automáticamente al agregar/eliminar

### ✅ Notas Personalizadas
- Agrega recomendaciones especiales
- Restricciones o consideraciones

### ✅ Guardado en Firestore
- El paciente verá el plan inmediatamente
- Auditoría con fechas de creación/actualización

---

## 🚀 Cómo Usar

### Paso 1: Acceder
```
Menu → 🍽️ Plan Alimenticio
URL: /fisio/plan-alimenticio
```

### Paso 2: Seleccionar Paciente
1. En el panel izquierdo, haz click en un paciente
2. Se cargará su plan (existente o nuevo)
3. Verás su información personal

### Paso 3: Agregar Alimentos - OPCIÓN A (FatSecret)
1. Click en **"🔍 Buscar en FatSecret"** en la comida deseada
2. Escribe el alimento (ej: "pollo", "arroz")
3. Selecciona un resultado
4. Elige la porción
5. Click en **"+ Agregar"**

**Resultado**: El alimento aparecerá en la comida con:
- ✓ Nombre del alimento
- ✓ Descripción de la porción
- ✓ Calorías automáticas
- ✓ Proteína, carbohidratos, grasas
- ✓ Badge "FatSecret"

### Paso 4: Agregar Alimentos - OPCIÓN B (Manual)
1. Click en **"✏️ Agregar Manual"** en la comida deseada
2. Completa:
   - Nombre del alimento
   - Descripción (ej: "100g", "1 taza")
   - Calorías
   - Proteína (g)
   - Carbohidratos (g)
   - Grasas (g)
3. Click en **"+ Agregar"**

**Ejemplo Manual**:
```
Nombre: Pollo a la parrilla
Descripción: 150g
Calorías: 275
Proteína: 50
Carbohidratos: 0
Grasas: 6
```

### Paso 5: Ver Resumen
- **Panel superior**: Totales de nutrientes (4 tarjetas coloreadas)
- **Cada comida**: Calorías totales y cantidad de alimentos
- **Detalles**: Expande para ver cada alimento

### Paso 6: Eliminar Alimentos
1. Expande la comida
2. Haz click en el 🗑️ (basura) en el alimento
3. Se elimina automáticamente

### Paso 7: Notas
1. Scroll al final
2. Escribe notas personalizadas:
   ```
   - Evitar productos lácteos
   - Tomar 2L de agua diarios
   - Alimentos con bajo índice glucémico
   - Consultar sobre suplementos
   ```

### Paso 8: Guardar
1. Click en **"💾 Guardar Plan"** (al final)
2. Espera confirmación verde
3. El plan está disponible para el paciente

---

## 📊 Interfaz Visual

### Panel Izquierdo: Pacientes
```
┌─────────────────┐
│ 👥 Mis Pacientes│
├─────────────────┤
│ ✓ Juan Pérez    │  ← Seleccionado (azul)
│   juan@email.com│
├─────────────────┤
│   María García  │  ← Sin seleccionar (gris)
│   maria@email.com
└─────────────────┘
```

### Panel Derecho: Plan
```
┌────────────────────────────────────┐
│ Juan Pérez                         │
│ 75 kg | 175 cm | 35 años           │
└────────────────────────────────────┘

┌─────────┬────────┬──────┬────────┐
│ Calorías│Proteína│Carbos│ Grasas │
│  2450   │  145g  │ 250g │  75g   │
└─────────┴────────┴──────┴────────┘

🌅 Desayuno (580 kcal) ▼
├─ Huevo (2 unidades) ... [🗑️]
├─ Pan Integral (100g) ... [🗑️]
└─ [🔍 FatSecret] [✏️ Manual]

🍽️ Almuerzo (850 kcal) ▼
├─ Pollo Pechuga (150g) ... [🗑️]
├─ Arroz Cocido (200g) ... [🗑️]
├─ Ensalada Mixta ... [🗑️]
└─ [🔍 FatSecret] [✏️ Manual]

... más comidas ...

📝 Notas: [Textarea con notas]

[💾 Guardar Plan]
```

---

## 🎨 Colores por Comida

| Comida    | Color   | Icono |
|-----------|---------|-------|
| Desayuno  | Ámbar   | 🌅    |
| Almuerzo  | Azul    | 🍽️    |
| Merienda  | Rosado  | ☕    |
| Cena      | Índigo  | 🌙    |

---

## 💡 Tips Profesionales

### 1. Búsqueda Efectiva en FatSecret
```
✓ Usa nombres en español e inglés
✓ "pollo" encontrará: "Pollo Pechuga", "Chicken Breast", etc.
✓ "arroz" encontrará diferentes tipos
✓ Sé específico: "Huevo cocido" vs "Huevo frito"
```

### 2. Porciones
- FatSecret muestra múltiples porciones (100g, 1 taza, etc.)
- Elige la que use tu paciente
- Las calorias varían significativamente por porción

### 3. Cálculos Automáticos
- No necesitas sumar: se calcula automáticamente
- Los totales se actualizan en tiempo real
- Siempre puedes editar notas sin guardar

### 4. Recomendaciones Nutricionales
```
Carbohidratos:  45-65% de calorías
Proteína:       15-25% de calorías
Grasas:         20-35% de calorías

Ejemplo para 2000 kcal:
- Carbos: 225-325g
- Proteína: 75-125g
- Grasas: 44-78g
```

---

## 🔐 Seguridad

✅ **Datos Seguros**
- Guardados en Firestore con encriptación
- Solo el fisio de ese paciente puede editar
- Historial de cambios con timestamps

✅ **Privacidad**
- El paciente solo ve su plan
- No puede ver otros planes

---

## ❌ Errores Comunes

### "No se encuentran resultados en FatSecret"
- Intenta con nombres más generales
- Prueba en inglés
- Usa "Agregar Manual" como alternativa

### "¿Se guardó el plan?"
- Espera a ver el mensaje verde
- Si hay error, aparecerá en consola
- Intenta guardar de nuevo

### "¿Por qué cambiaron los valores?"
- Se recalculan automáticamente al editar
- Si borraste un alimento, se restarán sus nutrientes

---

## 📱 Responsive Design

| Dispositivo | Vista    |
|-------------|----------|
| Desktop    | 2 paneles (izq pacientes, dch plan) |
| Tablet     | Puede scrollear horizontalmente |
| Móvil      | Ajustado, stacked |

---

## 🔄 Flujo Completo

```
1. Ir a /fisio/plan-alimenticio
   ↓
2. Seleccionar paciente
   ↓
3. Ver plan (existente o nuevo)
   ↓
4. Agregar alimentos (FatSecret o Manual)
   ↓
5. Eliminar alimentos si es necesario
   ↓
6. Agregar notas personalizadas
   ↓
7. Guardar plan
   ↓
8. ✓ Paciente verá el plan en su Dashboard
```

---

## 📞 Soporte

Si hay problemas:
1. Verifica que el paciente existe
2. Comprueba conexión a internet
3. Abre consola (F12) para ver errores
4. Intenta refrescar la página

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2025  
**Estado**: ✅ Producción
