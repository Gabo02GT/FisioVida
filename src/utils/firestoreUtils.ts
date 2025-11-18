// ============================================================================
// UTILIDADES FIRESTORE - EJEMPLOS DE USO
// ============================================================================

import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

/**
 * 1. CARGAR DATOS DEL USUARIO
 */
export async function loadUserProfile(userId: string) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (err) {
    console.error("Error cargando perfil:", err);
    return null;
  }
}

/**
 * 2. GUARDAR/ACTUALIZAR PERFIL DEL USUARIO
 */
export async function updateUserProfile(
  userId: string,
  data: { edad?: number; sexo?: string; nombre?: string }
) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error actualizando perfil:", err);
    throw err;
  }
}

/**
 * 3. AGREGAR MEDIDA AL HISTORIAL
 */
export async function addMeasurement(
  userId: string,
  measurement: {
    date: string;
    brazoDerecho: number;
    brazoIzquierdo: number;
    piernaDerecha: number;
    piernaIzquierda: number;
    cintura: number;
    pecho: number;
  }
) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    const currentMeasurements = userDoc.data()?.measurements || [];
    const newMeasurements = [measurement, ...currentMeasurements];
    
    await updateDoc(userDocRef, {
      measurements: newMeasurements,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error guardando medida:", err);
    throw err;
  }
}

/**
 * 4. AGREGAR CÁLCULO DE IMC
 */
export async function addIMCRecord(
  userId: string,
  record: {
    date: string;
    imc: number;
    peso: number;
    altura: number;
    categoria: string;
  }
) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    const currentHistory = userDoc.data()?.imcHistory || [];
    const newHistory = [record, ...currentHistory];
    
    await updateDoc(userDocRef, {
      imcHistory: newHistory,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error guardando IMC:", err);
    throw err;
  }
}

/**
 * 5. CARGAR PLAN ALIMENTICIO
 */
export async function loadMealPlan(userId: string) {
  try {
    const planDocRef = doc(db, "plans", userId);
    const planDoc = await getDoc(planDocRef);
    
    if (planDoc.exists()) {
      return planDoc.data();
    }
    return null;
  } catch (err) {
    console.error("Error cargando plan:", err);
    return null;
  }
}

/**
 * 6. CREAR/ACTUALIZAR PLAN ALIMENTICIO (Solo Fisio)
 */
export async function updateMealPlan(
  userId: string,
  planData: {
    desayuno: string[];
    almuerzo: string[];
    merienda: string[];
    cena: string[];
    calorias?: number;
    proteina?: number;
    carbohidratos?: number;
    grasas?: number;
  },
  _fisioId: string
) {
  try {
    const planDocRef = doc(db, "plans", userId);
    await setDoc(planDocRef, {
      ...planData,
      createdBy: _fisioId,
      createdDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error actualizando plan:", err);
    throw err;
  }
}

/**
 * 7. CARGAR RUTINAS DE EJERCICIO
 */
export async function loadRoutines(userId: string) {
  try {
    const routinesDocRef = doc(db, "routines", userId);
    const routinesDoc = await getDoc(routinesDocRef);
    
    if (routinesDoc.exists()) {
      return routinesDoc.data();
    }
    return null;
  } catch (err) {
    console.error("Error cargando rutinas:", err);
    return null;
  }
}

/**
 * 8. MARCAR EJERCICIO COMO COMPLETADO
 */
export async function markExerciseCompleted(
  userId: string,
  exerciseId: number
) {
  try {
    const routinesDocRef = doc(db, "routines", userId);
    const routinesDoc = await getDoc(routinesDocRef);
    
    const currentCompleted = routinesDoc.data()?.completedExercises || [];
    const newCompleted = currentCompleted.includes(exerciseId)
      ? currentCompleted.filter((id: number) => id !== exerciseId)
      : [...currentCompleted, exerciseId];
    
    await updateDoc(routinesDocRef, {
      completedExercises: newCompleted,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error actualizando ejercicio:", err);
    throw err;
  }
}

/**
 * 9. CARGAR CITAS
 */
export async function loadAppointments(userId: string) {
  try {
    const appointmentsDocRef = doc(db, "appointments", userId);
    const appointmentsDoc = await getDoc(appointmentsDocRef);
    
    if (appointmentsDoc.exists()) {
      return appointmentsDoc.data()?.appointments || [];
    }
    return [];
  } catch (err) {
    console.error("Error cargando citas:", err);
    return [];
  }
}

/**
 * 10. CREAR/ACTUALIZAR CITA (Solo Fisio)
 */
export async function updateAppointments(
  userId: string,
  appointments: {
    id: number;
    date: string;
    time: string;
    status: "scheduled" | "completed" | "cancelled";
    notes: string;
  }[],
  _fisioId: string
) {
  try {
    const appointmentsDocRef = doc(db, "appointments", userId);
    await setDoc(appointmentsDocRef, {
      appointments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error actualizando citas:", err);
    throw err;
  }
}

/**
 * 11. CARGAR REPORTE DE PROGRESO
 */
export async function loadReport(userId: string) {
  try {
    const reportDocRef = doc(db, "reports", userId);
    const reportDoc = await getDoc(reportDocRef);
    
    if (reportDoc.exists()) {
      return reportDoc.data();
    }
    return null;
  } catch (err) {
    console.error("Error cargando reporte:", err);
    return null;
  }
}

/**
 * 12. CREAR REPORTE DE PROGRESO (Solo Fisio)
 */
export async function createReport(
  userId: string,
  reportData: {
    progressMetrics: Array<{
      metric: string;
      current: string;
      initial: string;
      progress: number;
      unit: string;
    }>;
    overallProgress: number;
    evaluation: string;
    recommendations: string[];
  },
  fisioId: string
) {
  try {
    const reportDocRef = doc(db, "reports", userId);
    await setDoc(reportDocRef, {
      ...reportData,
      createdBy: fisioId,
      createdDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error creando reporte:", err);
    throw err;
  }
}

/**
 * 13. OBTENER TODOS LOS PACIENTES DEL FISIO (Solo Fisio)
 * - Requiere un índice en Firestore: invitations.fisioId + invitations.status
 */
export async function getPatientsList(_fisioId: string) {
  try {
    // Esta función requeriría consultas más complejas
    // que se implementarían cuando tengas la lista de pacientes
    console.log("Función para obtener lista de pacientes del fisio");
  } catch (err) {
    console.error("Error obteniendo pacientes:", err);
  }
}

// ============================================================================
// EJEMPLOS DE USO EN COMPONENTES
// ============================================================================

/*
// En un componente:
import { useAuth } from "../../auth/useAuth";
import { loadUserProfile, addMeasurement } from "../../utils/firestoreUtils";

export function MiComponente() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile(user.uid).then(profile => {
        console.log("Perfil cargado:", profile);
      });
    }
  }, [user?.uid]);
  
  const handleSaveMeasurement = async (measurement) => {
    if (user?.uid) {
      await addMeasurement(user.uid, measurement);
    }
  };
  
  return (
    // Tu JSX aquí
  );
}
*/

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/*
1. Siempre usar useAuth() para obtener el user.uid actual
2. Manejar errores con try/catch o .catch()
3. Usar updateDoc para actualizar campos específicos
4. Usar setDoc para sobrescribir el documento completo
5. Para arrays, siempre leer primero el documento actual
6. Las timestamps deben estar en ISO format: new Date().toISOString()
7. Los costos de Firestore aumentan con las lecturas, cachear datos si es posible
8. Validar siempre que el usuario esté autenticado antes de operaciones
*/
