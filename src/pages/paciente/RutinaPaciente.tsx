import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Play, ChevronRight, Target, Dumbbell } from "lucide-react";

interface Exercise {
  id: string;
  nombre: string;
  musculos?: string[];  // Nuevo schema Wger
  equipo?: string;      // Nuevo schema Wger
  target?: string;      // Viejo schema ExerciseDB
  equipment?: string;   // Viejo schema ExerciseDB
  series: number;
  repeticiones: number;
  descripcion?: string;
  imagen?: string;      // Nuevo schema Wger
  gifUrl?: string;      // Viejo schema ExerciseDB
  dias?: string[];
}

interface RoutineData {
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
  notas?: string;
}

interface Props {
  pacienteId: string;
}

const RutinaPaciente: React.FC<Props> = ({ pacienteId }) => {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<RoutineData>({ exercises: [] });
  const [loading, setLoading] = useState(true);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const colors = {
    primary: "#4fc3dc",
    secondary: "#5dd889",
    lightBg: "#f0f9ff",
    text: "#1e293b",
    textLight: "#64748b",
    border: "#bfdbfe",
    cardBg: "#ffffff",
    accentLight: "#ecf0f1"
  };

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Función auxiliar para obtener músculos de forma segura
  const getMuscles = (exercise: Exercise): string => {
    if (exercise.musculos && exercise.musculos.length > 0) {
      return exercise.musculos.join(", ");
    }
    return exercise.target || "";
  };

  // Función auxiliar para obtener equipo de forma segura
  const getEquipment = (exercise: Exercise): string => {
    return exercise.equipo || exercise.equipment || "";
  };

  // Función auxiliar para obtener imagen de forma segura
  const getImage = (exercise: Exercise): string | undefined => {
    return exercise.imagen || exercise.gifUrl;
  };

  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadRoutine = async () => {
      try {
        const routineRef = doc(db, "routines", pacienteId);
        const routineSnap = await getDoc(routineRef);
        if (routineSnap.exists()) {
          setRoutine(routineSnap.data() as RoutineData);
        }
      } catch (error) {
        console.error("Error cargando rutina:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [pacienteId, user]);

  const getExercisesForDay = (day: string) => {
    return routine.exercises.filter(ex => ex.dias?.includes(day));
  };

  const todayExercises = getExercisesForDay(
    days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: colors.lightBg }}>
        <div style={{ fontSize: "1.2rem", color: colors.textLight }}>Cargando rutina...</div>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, minHeight: "100vh", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #0891b2 100%)`,
        color: "white",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(79, 195, 220, 0.3)"
      }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "800" }}>💪 Mi Rutina Personalizada</h1>
        <p style={{ margin: "0.7rem 0 0 0", fontSize: "0.95rem", opacity: 0.9 }}>
          {routine.exercises.length} ejercicios asignados
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {routine.exercises.length === 0 ? (
          <div style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "3rem 2rem",
            textAlign: "center",
            border: `2px dashed ${colors.border}`
          }}>
            <Dumbbell size={48} style={{ color: colors.textLight, marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.1rem", color: colors.textLight }}>
              Aún no tienes ejercicios asignados
            </p>
          </div>
        ) : (
          <>
            {/* Hoy */}
            {todayExercises.length > 0 && (
              <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ color: colors.text, fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>
                  📅 Hoy ({days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]})
                </h2>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  {todayExercises.map((exercise) => (
                    <div key={exercise.id} style={{
                      background: colors.cardBg,
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      border: `2px solid ${colors.secondary}20`,
                      overflow: "hidden"
                    }}>
                      {getImage(exercise) && (
                        <img
                          src={getImage(exercise)!}
                          alt={exercise.nombre}
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            backgroundColor: "#f0f0f0"
                          }}
                        />
                      )}
                      <div style={{ padding: "1.5rem" }}>
                        <h3 style={{ margin: "0 0 0.5rem 0", color: colors.text, fontSize: "1.2rem", fontWeight: "700" }}>
                          {exercise.nombre}
                        </h3>
                        <p style={{ margin: "0.5rem 0", color: colors.textLight, fontSize: "0.9rem" }}>
                          <Target size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
                          {getMuscles(exercise)} • {getEquipment(exercise)}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                          <div style={{ background: colors.lightBg, padding: "1rem", borderRadius: "8px" }}>
                            <p style={{ margin: 0, color: colors.textLight, fontSize: "0.8rem" }}>Series</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: colors.primary, fontSize: "1.5rem", fontWeight: "700" }}>
                              {exercise.series}
                            </p>
                          </div>
                          <div style={{ background: colors.lightBg, padding: "1rem", borderRadius: "8px" }}>
                            <p style={{ margin: 0, color: colors.textLight, fontSize: "0.8rem" }}>Repeticiones</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: colors.secondary, fontSize: "1.5rem", fontWeight: "700" }}>
                              {exercise.repeticiones}
                            </p>
                          </div>
                        </div>
                        {exercise.descripcion && (
                          <p style={{ margin: "1rem 0 0 0", color: colors.textLight, fontSize: "0.9rem", fontStyle: "italic" }}>
                            {exercise.descripcion}
                          </p>
                        )}
                        <button style={{
                          width: "100%",
                          marginTop: "1.5rem",
                          padding: "0.9rem",
                          background: colors.secondary,
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.75rem",
                          fontSize: "0.95rem"
                        }}>
                          <Play size={18} /> Comenzar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Semana */}
            <div>
              <h2 style={{ color: colors.text, fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>
                📆 Rutina de la Semana
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {days.map((day) => {
                  const dayExercises = getExercisesForDay(day);
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      style={{
                        padding: "1rem",
                        background: isSelected ? colors.primary : colors.cardBg,
                        color: isSelected ? "white" : colors.text,
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s",
                        textAlign: "center"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = colors.primary;
                          e.currentTarget.style.background = `${colors.primary}10`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.background = colors.cardBg;
                        }
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{day}</p>
                      <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
                        {dayExercises.length} ejercicios
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div style={{
                  background: colors.cardBg,
                  borderRadius: "12px",
                  padding: "2rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  border: `2px solid ${colors.primary}`
                }}>
                  <h3 style={{ margin: "0 0 1.5rem 0", color: colors.text, fontSize: "1.2rem", fontWeight: "700" }}>
                    Ejercicios de {selectedDay}
                  </h3>
                  {getExercisesForDay(selectedDay).length === 0 ? (
                    <p style={{ color: colors.textLight, textAlign: "center" }}>Sin ejercicios este día</p>
                  ) : (
                    <div style={{ display: "grid", gap: "1.5rem" }}>
                      {getExercisesForDay(selectedDay).map((exercise) => (
                        <div
                          key={exercise.id}
                          onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                          style={{
                            background: colors.lightBg,
                            padding: "1.5rem",
                            borderRadius: "10px",
                            border: `1px solid ${colors.border}`,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, color: colors.text, fontSize: "1rem", fontWeight: "700" }}>
                                {exercise.nombre}
                              </h4>
                              <p style={{ margin: "0.5rem 0 0 0", color: colors.textLight, fontSize: "0.85rem" }}>
                                {exercise.series}x{exercise.repeticiones} • {getMuscles(exercise)}
                              </p>
                            </div>
                            <ChevronRight
                              size={20}
                              style={{
                                color: colors.primary,
                                transform: expandedExercise === exercise.id ? "rotate(90deg)" : "none",
                                transition: "transform 0.2s"
                              }}
                            />
                          </div>

                          {expandedExercise === exercise.id && (
                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${colors.border}` }}>
                              {getImage(exercise) && (
                                <img
                                  src={getImage(exercise)!}
                                  alt={exercise.nombre}
                                  style={{
                                    width: "100%",
                                    maxHeight: "250px",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    marginBottom: "1rem",
                                    backgroundColor: "#f0f0f0"
                                  }}
                                />
                              )}
                              {exercise.descripcion && (
                                <p style={{ margin: 0, color: colors.textLight, fontSize: "0.9rem", fontStyle: "italic" }}>
                                  {exercise.descripcion}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RutinaPaciente;
