import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, CheckCircle2 } from "lucide-react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/useAuth";

interface Exercise {
  id: number;
  name: string;
  series: number;
  reps: string;
  days: string;
}

export default function RutinasPersonalizadas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hasRoutines, setHasRoutines] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  // Cargar rutinas desde Firestore
  useEffect(() => {
    const loadRoutines = async () => {
      if (!user?.uid) return;

      try {
        const routinesDocRef = doc(db, "routines", user.uid);
        const routinesDoc = await getDoc(routinesDocRef);

        if (routinesDoc.exists()) {
          const data = routinesDoc.data();
          setExercises(data.exercises || []);
          setCompletedExercises(data.completedExercises || []);
          setHasRoutines(true);
        }
      } catch (err) {
        console.error("Error cargando rutinas:", err);
        setHasRoutines(false);
      }
    };

    loadRoutines();
  }, [user?.uid]);

  const toggleCompleted = async (id: number) => {
    const updated = completedExercises.includes(id) 
      ? completedExercises.filter(e => e !== id) 
      : [...completedExercises, id];
    
    setCompletedExercises(updated);

    // Guardar en Firestore
    try {
      const routinesDocRef = doc(db, "routines", user!.uid);
      await updateDoc(routinesDocRef, {
        completedExercises: updated
      });
    } catch (err) {
      console.error("Error guardando ejercicio completado:", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button onClick={() => navigate("/dashboard/paciente")} style={{ display: "flex", gap: "8px", padding: "10px 16px", background: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, marginBottom: "20px", color: "#0891b2" }}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
            <Dumbbell size={32} color="#a855f7" />
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1f2937", margin: 0 }}>Rutinas Personalizadas</h1>
              <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Ejercicios diseñados para ti</p>
            </div>
          </div>

          {hasRoutines ? (
            <>
              <div style={{ background: "#f3f4f6", borderRadius: "12px", padding: "20px", marginBottom: "30px" }}>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                  Completados: <strong style={{ color: "#a855f7" }}>{completedExercises.length} de {exercises.length}</strong>
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {exercises.map(exercise => (
                  <div
                    key={exercise.id}
                    onClick={() => toggleCompleted(exercise.id)}
                    style={{
                      background: completedExercises.includes(exercise.id) ? "#f0fdf4" : "white",
                      borderRadius: "12px",
                      padding: "20px",
                      border: "2px solid " + (completedExercises.includes(exercise.id) ? "#10b981" : "#e5e7eb"),
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: completedExercises.includes(exercise.id) ? "#10b981" : "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {completedExercises.includes(exercise.id) ? (
                          <CheckCircle2 size={24} color="white" />
                        ) : (
                          <Dumbbell size={20} color="#a855f7" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#1f2937", fontWeight: 600 }}>
                          {exercise.name}
                          {completedExercises.includes(exercise.id) && " ✓"}
                        </h3>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                          <div>{exercise.series} series × {exercise.reps}</div>
                          <div style={{ marginTop: "4px", color: "#a855f7", fontWeight: 500 }}>
                            {exercise.days}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "40px", padding: "20px", background: "#f0fdf4", borderRadius: "12px", borderLeft: "4px solid #10b981" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#166534" }}>Consejos para obtener mejores resultados</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#166534", fontSize: "14px" }}>
                  <li style={{ marginBottom: "8px" }}>Realiza los ejercicios con la forma correcta</li>
                  <li style={{ marginBottom: "8px" }}>Descansa 1 minuto entre series</li>
                  <li>Aumenta gradualmente la intensidad cada semana</li>
                </ul>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#f0fdf4", borderRadius: "12px", borderLeft: "4px solid #10b981" }}>
              <Dumbbell size={48} style={{ margin: "0 auto 15px", color: "#16a34a" }} />
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#166534" }}>No hay rutinas por el momento</p>
              <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#166534" }}>Tu fisioterapeuta diseñará ejercicios personalizados para ti</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
