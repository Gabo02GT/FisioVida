# Estructura de Firestore - FisioVida

## Collections y Documentos

### 1. **users** - Perfil y datos básicos del paciente

```
users/{userId}
├── email: string
├── nombre: string
├── rol: "paciente" | "fisioterapeuta"
├── edad: number
├── sexo: "masculino" | "femenino"
├── profileCompletedAt: timestamp
├── createdAt: timestamp
├── measurements: Measurement[] (historial de medidas)
├── imcHistory: IMCRecord[] (historial de IMC)
└── updatedAt: timestamp
```

**Ejemplo:**
```json
{
  "email": "juan@example.com",
  "nombre": "Juan García",
  "rol": "paciente",
  "edad": 30,
  "sexo": "masculino",
  "profileCompletedAt": "2024-11-16T10:30:00Z",
  "createdAt": "2024-11-01T08:00:00Z",
  "measurements": [
    {
      "date": "16/11/2024",
      "brazoDerecho": 32.5,
      "brazoIzquierdo": 32,
      "piernaDerecha": 55,
      "piernaIzquierda": 54.5,
      "cintura": 78,
      "pecho": 98
    }
  ],
  "imcHistory": [
    {
      "date": "16/11/2024",
      "imc": 24.5,
      "peso": 70,
      "altura": 170,
      "categoria": "Peso normal"
    }
  ],
  "updatedAt": "2024-11-16T14:00:00Z"
}
```

---

### 2. **plans** - Planes alimenticios

```
plans/{userId}
├── desayuno: string[]
├── almuerzo: string[]
├── merienda: string[]
├── cena: string[]
├── calorias: number (opcional)
├── proteina: number (opcional)
├── carbohidratos: number (opcional)
├── grasas: number (opcional)
├── createdBy: string (fisio_id)
├── createdDate: timestamp
└── updatedAt: timestamp
```

**Ejemplo:**
```json
{
  "desayuno": [
    "Avena con frutas",
    "Café con leche",
    "Pan integral"
  ],
  "almuerzo": [
    "Pechuga de pollo",
    "Arroz integral",
    "Ensalada verde"
  ],
  "merienda": [
    "Yogurt griego",
    "Granola",
    "Frutos secos"
  ],
  "cena": [
    "Salmón",
    "Batata al horno",
    "Brócoli"
  ],
  "calorias": 1800,
  "proteina": 120,
  "carbohidratos": 220,
  "grasas": 60,
  "createdBy": "fisioId123",
  "createdDate": "2024-11-10T09:00:00Z",
  "updatedAt": "2024-11-15T16:00:00Z"
}
```

---

### 3. **routines** - Rutinas de ejercicio personalizadas

```
routines/{userId}
├── exercises: Exercise[]
│   ├── id: number
│   ├── name: string
│   ├── series: number
│   ├── reps: string
│   └── days: string
├── completedExercises: number[] (IDs de ejercicios completados)
├── createdBy: string (fisio_id)
├── createdDate: timestamp
└── updatedAt: timestamp
```

**Ejemplo:**
```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Flexiones",
      "series": 3,
      "reps": "12",
      "days": "Lunes, Miércoles, Viernes"
    },
    {
      "id": 2,
      "name": "Sentadillas",
      "series": 4,
      "reps": "15",
      "days": "Lunes, Miércoles, Viernes"
    },
    {
      "id": 3,
      "name": "Burpees",
      "series": 3,
      "reps": "10",
      "days": "Martes, Jueves"
    }
  ],
  "completedExercises": [1, 3],
  "createdBy": "fisioId123",
  "createdDate": "2024-11-05T10:00:00Z",
  "updatedAt": "2024-11-16T15:30:00Z"
}
```

---

### 4. **appointments** - Citas y sesiones

```
appointments/{userId}
├── appointments: Appointment[]
│   ├── id: number
│   ├── date: string (YYYY-MM-DD)
│   ├── time: string (HH:mm)
│   ├── status: "scheduled" | "completed" | "cancelled"
│   └── notes: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Ejemplo:**
```json
{
  "appointments": [
    {
      "id": 1,
      "date": "2024-11-20",
      "time": "10:00",
      "status": "scheduled",
      "notes": "Sesión de evaluación"
    },
    {
      "id": 2,
      "date": "2024-11-27",
      "time": "14:00",
      "status": "scheduled",
      "notes": "Seguimiento mensual"
    },
    {
      "id": 3,
      "date": "2024-11-15",
      "time": "15:30",
      "status": "completed",
      "notes": "Primera consulta"
    }
  ],
  "createdAt": "2024-11-01T08:00:00Z",
  "updatedAt": "2024-11-16T14:00:00Z"
}
```

---

### 5. **reports** - Reportes de progreso

```
reports/{userId}
├── progressMetrics: ProgressMetric[]
│   ├── metric: string
│   ├── current: string
│   ├── initial: string
│   ├── progress: number (0-100)
│   └── unit: string
├── overallProgress: number (0-100)
├── evaluation: string (comentarios del fisio)
├── recommendations: string[]
├── createdBy: string (fisio_id)
├── createdDate: timestamp
└── updatedAt: timestamp
```

**Ejemplo:**
```json
{
  "progressMetrics": [
    {
      "metric": "Pérdida de Peso",
      "current": "78kg",
      "initial": "85kg",
      "progress": 92,
      "unit": "kg"
    },
    {
      "metric": "Masa Muscular",
      "current": "32%",
      "initial": "28%",
      "progress": 78,
      "unit": "%"
    },
    {
      "metric": "Flexibilidad",
      "current": "8/10",
      "initial": "4/10",
      "progress": 85,
      "unit": "puntos"
    }
  ],
  "overallProgress": 84,
  "evaluation": "¡Excelente progreso! Has mostrado una dedicación excepcional...",
  "recommendations": [
    "Aumenta el tiempo de estiramiento a 20 minutos diarios",
    "Complementa con actividades de cardio 2 veces por semana",
    "Mantén la consistencia en tu plan alimenticio"
  ],
  "createdBy": "fisioId123",
  "createdDate": "2024-11-10T12:00:00Z",
  "updatedAt": "2024-11-16T14:00:00Z"
}
```

---

## Reglas de Firestore

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función para verificar si es admin/fisio
    function isAdmin() {
      return request.auth.uid == resource.data.createdBy ||
             request.auth.token.role == 'fisioterapeuta';
    }
    
    // USERS - Cada usuario puede ver/editar su propio documento
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }
    
    // PLANS - Solo el paciente y su fisio pueden ver
    match /plans/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if isAdmin() && request.auth.uid != userId;
      allow create: if isAdmin();
    }
    
    // ROUTINES - Solo el paciente y su fisio pueden ver
    match /routines/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId ||
                      (isAdmin() && request.auth.uid != userId);
      allow create: if isAdmin();
    }
    
    // APPOINTMENTS - El paciente puede ver, el fisio puede crear/editar
    match /appointments/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if isAdmin() && request.auth.uid != userId;
      allow create: if isAdmin();
    }
    
    // REPORTS - El paciente puede ver, el fisio puede crear/editar
    match /reports/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if isAdmin() && request.auth.uid != userId;
      allow create: if isAdmin();
    }
  }
}
```

---

## Tipos TypeScript para cada colección

```typescript
// User Profile
interface UserProfile {
  email: string;
  nombre: string;
  rol: 'paciente' | 'fisioterapeuta';
  edad: number;
  sexo: 'masculino' | 'femenino';
  profileCompletedAt: string;
  measurements: Measurement[];
  imcHistory: IMCRecord[];
}

// Measurement for seguimiento
interface Measurement {
  date: string;
  brazoDerecho: number;
  brazoIzquierdo: number;
  piernaDerecha: number;
  piernaIzquierda: number;
  cintura: number;
  pecho: number;
}

// IMC Record
interface IMCRecord {
  date: string;
  imc: number;
  peso: number;
  altura: number;
  categoria: string;
}

// Meal Plan
interface PlanData {
  desayuno: string[];
  almuerzo: string[];
  merienda: string[];
  cena: string[];
  calorias?: number;
  proteina?: number;
  carbohidratos?: number;
  grasas?: number;
}

// Exercise
interface Exercise {
  id: number;
  name: string;
  series: number;
  reps: string;
  days: string;
}

// Routines
interface RoutinesData {
  exercises: Exercise[];
  completedExercises: number[];
}

// Appointment
interface Appointment {
  id: number;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

// Progress Report
interface ProgressMetric {
  metric: string;
  current: string;
  initial: string;
  progress: number;
  unit: string;
}

interface ReportData {
  progressMetrics: ProgressMetric[];
  overallProgress: number;
  evaluation: string;
  recommendations: string[];
}
```

---

## Notas Importantes

1. **Timestamps**: Usar `new Date().toISOString()` para guardar fechas
2. **userId**: Usar `user.uid` de Firebase Auth
3. **createdBy**: Guardar el UID del fisioterapeuta que creó el documento
4. **Arrays**: Usar `updateDoc` con FieldValue para actualizar arrays

## Ejemplo de actualización en código

```typescript
// Guardar perfil
await updateDoc(doc(db, 'users', userId), {
  edad: 30,
  sexo: 'masculino',
  profileCompletedAt: new Date().toISOString()
});

// Agregar medida
const measurements = [...existingMeasurements, newMeasurement];
await updateDoc(doc(db, 'users', userId), {
  measurements: measurements
});
```
