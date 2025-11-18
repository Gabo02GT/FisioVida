import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Trash2, Plus, Target, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface Exercise {
  id: string;
  nombre: string;
  musculos?: string[];
  equipo?: string;
  series: number;
  repeticiones: number;
  intensidad?: "Baja" | "Moderada" | "Alta";
  tipoSerie?: "Normal" | "Biserie" | "Triserie" | "Circuito" | "Dropset" | "Superserie" | "Serie Gigante";
  tempo?: string;
  rir?: string;
  orden?: string;
  grupoId?: string;
  descanso?: string;
  descripcion?: string;
  tecnica?: string;
  dia: string;
}

interface RoutineData {
  exercises: Exercise[];
  objetivo?: string;
  nivelFisico?: string;
  frecuencia?: string;
  createdAt?: string;
  updatedAt?: string;
  notas?: string;
}

interface Props {
  pacienteId: string;
}

const RutinasFisio: React.FC<Props> = ({ pacienteId }) => {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<RoutineData>({ exercises: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pacienteName, setPacienteName] = useState("");

  // Flujo principal: seleccionar día primero
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Datos de la rutina general
  const [routineInfo, setRoutineInfo] = useState({
    objetivo: "",
    nivelFisico: "",
    frecuencia: ""
  });

  // Formulario del ejercicio
  const [newExercise, setNewExercise] = useState({
    nombre: "",
    musculos: "",
    equipo: "",
    series: 3,
    repeticiones: 10,
    intensidad: "Moderada" as "Baja" | "Moderada" | "Alta",
    tipoSerie: "Normal" as "Normal" | "Biserie" | "Triserie" | "Circuito" | "Dropset" | "Superserie" | "Serie Gigante",
    tempo: "",
    rir: "",
    orden: "",
    grupoId: "",
    descanso: "60-90 segundos",
    descripcion: "",
    tecnica: ""
  });

  // Rastrear grupos de biserie/triserie
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const colors = {
    primary: "#4fc3dc",
    secondary: "#5dd889",
    lightBg: "#f0f9ff",
    text: "#1e293b",
    textLight: "#64748b",
    border: "#bfdbfe",
    cardBg: "#ffffff",
    accentLight: "#ecf0f1",
    warning: "#f59e0b",
    danger: "#ef4444"
  };

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Obtener ejercicios del día seleccionado
  const getDayExercises = (day: string): Exercise[] => {
    return routine.exercises.filter(ex => ex.dia === day);
  };

  // Obtener músculos como texto
  const getMuscles = (exercise: Exercise): string => {
    if (exercise.musculos && exercise.musculos.length > 0) {
      return exercise.musculos.join(", ");
    }
    return "";
  };

  // Obtener ejercicios en el mismo grupo
  const getGroupExercises = (exercise: Exercise): Exercise[] => {
    if (!exercise.grupoId) return [];
    return routine.exercises.filter(
      ex => ex.grupoId === exercise.grupoId && ex.dia === exercise.dia
    );
  };

  // Obtener cantidad de ejercicios requeridos para un tipo de serie
  const getRequiredGroupSize = (tipoSerie: string): number => {
    switch (tipoSerie) {
      case "Biserie":
      case "Superserie":
        return 2;
      case "Triserie":
        return 3;
      case "Serie Gigante":
        return 4;
      case "Circuito":
        return 3;
      default:
        return 1;
    }
  };

  // Cargar rutina existente
  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadRoutine = async () => {
      try {
        const userRef = doc(db, "users", pacienteId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setPacienteName(userSnap.data().nombre || "");
        }

        const routineRef = doc(db, "routines", pacienteId);
        const routineSnap = await getDoc(routineRef);
        if (routineSnap.exists()) {
          const data = routineSnap.data() as RoutineData;
          setRoutine(data);
          setRoutineInfo({
            objetivo: data.objetivo || "",
            nivelFisico: data.nivelFisico || "",
            frecuencia: data.frecuencia || ""
          });
        }
      } catch (error) {
        console.error("Error cargando rutina:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [pacienteId, user]);

  // Agregar ejercicio al día seleccionado
  const addExerciseToDay = () => {
    if (!newExercise.nombre.trim() || !selectedDay) {
      alert("Por favor completa el nombre del ejercicio");
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      nombre: newExercise.nombre,
      musculos: newExercise.musculos
        .split(",")
        .map(m => m.trim())
        .filter(m => m.length > 0),
      equipo: newExercise.equipo || undefined,
      series: newExercise.series,
      repeticiones: newExercise.repeticiones,
      intensidad: newExercise.intensidad || undefined,
      tipoSerie: newExercise.tipoSerie || undefined,
      tempo: newExercise.tempo || undefined,
      rir: newExercise.rir || undefined,
      orden: newExercise.orden || undefined,
      grupoId: newExercise.grupoId || undefined,
      descanso: newExercise.descanso || undefined,
      descripcion: newExercise.descripcion || undefined,
      tecnica: newExercise.tecnica || undefined,
      dia: selectedDay
    };

    setRoutine(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));

    // Verificar si el grupo está completo
    if (currentGroupId) {
      const groupExercises = routine.exercises.filter(
        ex => ex.grupoId === currentGroupId && ex.dia === selectedDay
      );
      const requiredSize = getRequiredGroupSize(newExercise.tipoSerie);
      const willBeComplete = groupExercises.length + 1 >= requiredSize;

      if (willBeComplete) {
        alert(`✓ ¡Grupo completado! ${newExercise.tipoSerie} con ${requiredSize} ejercicios.`);
        setCurrentGroupId(null);
      }
    }

    // Resetear formulario
    setNewExercise({
      nombre: "",
      musculos: "",
      equipo: "",
      series: 3,
      repeticiones: 10,
      intensidad: "Moderada",
      tipoSerie: currentGroupId ? (newExercise.tipoSerie || "Normal") : "Normal",
      tempo: "",
      rir: "",
      orden: "",
      grupoId: currentGroupId || "",
      descanso: "60-90 segundos",
      descripcion: "",
      tecnica: ""
    });
    setShowExerciseForm(false);
  };

  // Eliminar ejercicio
  const removeExercise = (exerciseId: string) => {
    setRoutine(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId)
    }));
  };

  // Guardar rutina completa
  const saveRoutine = async () => {
    if (routine.exercises.length === 0) {
      alert("Agrega al menos un ejercicio a la rutina");
      return;
    }

    try {
      setSaving(true);

      const dataToSave: RoutineData = {
        exercises: routine.exercises,
        objetivo: routineInfo.objetivo || undefined,
        nivelFisico: routineInfo.nivelFisico || undefined,
        frecuencia: routineInfo.frecuencia || undefined,
        updatedAt: new Date().toISOString(),
        ...(routine.createdAt && { createdAt: routine.createdAt })
      };

      await setDoc(doc(db, "routines", pacienteId), dataToSave);
      alert("✓ Rutina guardada exitosamente");
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Error al guardar la rutina");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: colors.lightBg }}>
        <div style={{ fontSize: "1.2rem", color: colors.textLight }}>Cargando rutina...</div>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, minHeight: "100vh", margin: 0, padding: 0, width: "100%" }}>
      {/* Header Premium */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #0891b2 100%)`,
        color: "white",
        padding: "3.5rem 3rem",
        textAlign: "center",
        boxShadow: "0 12px 48px rgba(79, 195, 220, 0.35)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* Decorative Background Elements */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-100px",
          width: "300px",
          height: "300px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-80px",
          left: "-120px",
          width: "400px",
          height: "400px",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "50%"
        }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: "900", letterSpacing: "-1px" }}>💪 Crear Rutina Personalizada</h1>
          <p style={{ margin: "1rem 0 0 0", fontSize: "1.1rem", opacity: 0.95, fontWeight: "600", letterSpacing: "0.5px" }}>{pacienteName}</p>
        </div>
      </div>

      {/* Content Container - Full Width */}
      <div style={{ padding: "3rem", background: colors.lightBg, width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Información de la Rutina */}
        <div style={{
          background: colors.cardBg,
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "2.5rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          border: `2px solid ${colors.border}`,
          borderLeft: `6px solid ${colors.primary}`,
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            right: "30px",
            background: `linear-gradient(135deg, ${colors.primary} 0%, #0891b2 100%)`,
            color: "white",
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(79, 195, 220, 0.3)"
          }}>
            📋
          </div>
          
          <h2 style={{ margin: "0 0 1.8rem 0", color: colors.text, fontSize: "1.3rem", fontWeight: "800" }}>
            Información de la Rutina
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <div style={{ position: "relative" }}>
              <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                🎯 Objetivo
              </label>
              <input
                type="text"
                placeholder="ej: Ganancia muscular, Pérdida de peso, Resistencia"
                value={routineInfo.objetivo}
                onChange={(e) => setRoutineInfo({ ...routineInfo, objetivo: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  border: `2px solid ${colors.border}`,
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.3s",
                  backgroundColor: "#fafafa"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                📊 Nivel Físico
              </label>
              <select
                value={routineInfo.nivelFisico}
                onChange={(e) => setRoutineInfo({ ...routineInfo, nivelFisico: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  border: `2px solid ${colors.border}`,
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fafafa",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div style={{ position: "relative" }}>
              <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                ⏱️ Frecuencia de Entrenamiento
              </label>
              <input
                type="text"
                placeholder="ej: 4 días por semana"
                value={routineInfo.frecuencia}
                onChange={(e) => setRoutineInfo({ ...routineInfo, frecuencia: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  border: `2px solid ${colors.border}`,
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.3s",
                  backgroundColor: "#fafafa"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Selector de Días - Grid Layout */}
        <div style={{
          background: colors.cardBg,
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "2.5rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          border: `2px solid ${colors.border}`,
          borderLeft: `6px solid ${colors.secondary}`,
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            right: "30px",
            background: `linear-gradient(135deg, ${colors.secondary} 0%, #4ade80 100%)`,
            color: "white",
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(93, 216, 137, 0.3)"
          }}>
            📅
          </div>

          <h2 style={{ margin: "0 0 1.8rem 0", color: colors.text, fontSize: "1.3rem", fontWeight: "800" }}>
            Selecciona el Día para Agregar Ejercicios
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.2rem" }}>
            {days.map((day) => {
              const dayExercises = getDayExercises(day);
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    padding: "1.3rem 1rem",
                    background: isSelected ? `linear-gradient(135deg, ${colors.primary} 0%, #0891b2 100%)` : colors.lightBg,
                    color: isSelected ? "white" : colors.text,
                    border: `2.5px solid ${isSelected ? colors.primary : colors.border}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "800",
                    fontSize: "0.95rem",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isSelected ? `0 8px 24px ${colors.primary}40` : "0 2px 8px rgba(0, 0, 0, 0.05)",
                    transform: isSelected ? "translateY(-2px)" : "translateY(0)"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <div style={{ marginBottom: "0.6rem", fontSize: "1.05rem" }}>{day}</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "700", opacity: 0.85, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{dayExercises.length > 0 ? "✓" : "○"}</span>
                    {dayExercises.length} {dayExercises.length === 1 ? "ejercicio" : "ejercicios"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario de Ejercicio para el Día Seleccionado */}
        {selectedDay && (
          <div style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            border: `2px solid ${colors.primary}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, color: colors.text, fontSize: "1.2rem", fontWeight: "700" }}>
                ➕ Agregar Ejercicio para {selectedDay}
              </h2>
              <button
                onClick={() => setShowExerciseForm(!showExerciseForm)}
                style={{
                  padding: "0.6rem 1rem",
                  background: colors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                {showExerciseForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                {showExerciseForm ? "Ocultar Formulario" : "Mostrar Formulario"}
              </button>
            </div>

            {/* Indicador de grupo */}
            {currentGroupId && (
              <div style={{
                background: `${colors.warning}15`,
                border: `2px solid ${colors.warning}`,
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem"
              }}>
                <span style={{ fontSize: "1.4rem" }}>🔗</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: colors.text, display: "block" }}>
                    Agrupando {newExercise.tipoSerie}
                  </strong>
                  <small style={{ color: colors.textLight }}>
                    {(() => {
                      const required = getRequiredGroupSize(newExercise.tipoSerie);
                      const groupExercises = routine.exercises.filter(
                        ex => ex.grupoId === currentGroupId && ex.dia === selectedDay
                      );
                      const count = groupExercises.length + (newExercise.nombre ? 1 : 0);
                      return `${count} de ${required} ejercicios agregados`;
                    })()}
                  </small>
                </div>
                <button
                  onClick={() => {
                    setCurrentGroupId(null);
                    setNewExercise(prev => ({ ...prev, grupoId: "", tipoSerie: "Normal" }));
                  }}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: colors.warning,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "700"
                  }}
                >
                  ✕ Cancelar Grupo
                </button>
              </div>
            )}

            {showExerciseForm && (
              <div style={{ background: `linear-gradient(135deg, ${colors.lightBg} 0%, #fafbfc 100%)`, padding: "2.5rem", borderRadius: "14px", border: `2px solid ${colors.border}`, boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.05)" }}>
                {/* Alert si es Biserie o Triserie */}
                {(newExercise.tipoSerie === "Biserie" || newExercise.tipoSerie === "Triserie") && (
                  <div style={{
                    background: `${colors.secondary}15`,
                    border: `2px solid ${colors.secondary}`,
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1.8rem",
                    color: colors.secondary,
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    🔗 Agregando ejercicios a {newExercise.tipoSerie.toLowerCase()} - Puedes agregar {newExercise.tipoSerie === "Biserie" ? "2" : "3"} ejercicios con el mismo grupo
                  </div>
                )}

                {/* Nombre Ejercicio */}
                <div style={{ marginBottom: "1.8rem" }}>
                  <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                    💪 Nombre del Ejercicio *
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Sentadillas, Press de Banca, Dominadas..."
                    value={newExercise.nombre}
                    onChange={(e) => setNewExercise({ ...newExercise, nombre: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      border: `2px solid ${colors.border}`,
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      backgroundColor: colors.cardBg,
                      transition: "all 0.3s",
                      fontWeight: "600"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Tipo de Serie */}
                <div style={{ marginBottom: "1.8rem" }}>
                  <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                    🔗 Tipo de Serie
                  </label>
                  <select
                    value={newExercise.tipoSerie}
                    onChange={(e) => {
                      const tipoSelected = e.target.value as any;
                      const needsGrouping = ["Biserie", "Triserie", "Circuito", "Superserie", "Serie Gigante"].includes(tipoSelected);
                      const groupId = needsGrouping ? `grupo-${Date.now()}` : "";
                      setNewExercise({ ...newExercise, tipoSerie: tipoSelected, grupoId: groupId });
                      if (groupId) setCurrentGroupId(groupId);
                    }}
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      border: `2px solid ${colors.border}`,
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      background: colors.cardBg,
                      cursor: "pointer",
                      transition: "all 0.3s",
                      fontWeight: "600"
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <option value="Normal">Serie normal</option>
                    <option value="Biserie">Biserie</option>
                    <option value="Triserie">Triserie</option>
                    <option value="Circuito">Circuito</option>
                    <option value="Dropset">Dropset</option>
                    <option value="Superserie">Superserie</option>
                    <option value="Serie Gigante">Serie Gigante</option>
                  </select>
                </div>

                {/* Músculos y Equipo */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem", marginBottom: "1.8rem" }}>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      🎯 Músculos Trabajados
                    </label>
                    <input
                      type="text"
                      placeholder="ej: Cuádriceps, Glúteos, Isquiotibiales"
                      value={newExercise.musculos}
                      onChange={(e) => setNewExercise({ ...newExercise, musculos: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <small style={{ color: colors.textLight, marginTop: "0.4rem", display: "block", fontWeight: "600" }}>Separados por comas</small>
                  </div>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      🏋️ Equipo Necesario
                    </label>
                    <input
                      type="text"
                      placeholder="ej: Mancuernas, Barra, Máquina, Peso corporal"
                      value={newExercise.equipo}
                      onChange={(e) => setNewExercise({ ...newExercise, equipo: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Series, Reps, Tempo, Intensidad */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "1.8rem" }}>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      ✕ Series
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newExercise.series}
                      onChange={(e) => setNewExercise({ ...newExercise, series: parseInt(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s",
                        fontWeight: "700"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      ⦿ Repeticiones
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newExercise.repeticiones}
                      onChange={(e) => setNewExercise({ ...newExercise, repeticiones: parseInt(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s",
                        fontWeight: "700"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      ⏱️ Tempo (ej: 3-1-1)
                    </label>
                    <input
                      type="text"
                      placeholder="ej: 3-1-1 o 2-0-2"
                      value={newExercise.tempo}
                      onChange={(e) => setNewExercise({ ...newExercise, tempo: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      🔥 Intensidad
                    </label>
                    <select
                      value={newExercise.intensidad}
                      onChange={(e) => setNewExercise({ ...newExercise, intensidad: e.target.value as "Baja" | "Moderada" | "Alta" })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        background: colors.cardBg,
                        cursor: "pointer",
                        transition: "all 0.3s",
                        fontWeight: "700"
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = colors.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <option value="Baja">Baja</option>
                      <option value="Moderada">Moderada</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>

                {/* RIR y Orden */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem", marginBottom: "1.8rem" }}>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      💪 RIR/RPE (Esfuerzo)
                    </label>
                    <input
                      type="text"
                      placeholder="ej: RPE 8-9 o RIR 2-3"
                      value={newExercise.rir}
                      onChange={(e) => setNewExercise({ ...newExercise, rir: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      🔤 Orden del Ejercicio
                    </label>
                    <input
                      type="text"
                      placeholder="ej: A1, B2, C1"
                      value={newExercise.orden}
                      onChange={(e) => setNewExercise({ ...newExercise, orden: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Descanso y Técnica */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem", marginBottom: "1.8rem" }}>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      ⏱️ Descanso entre Series
                    </label>
                    <input
                      type="text"
                      placeholder="ej: 60-90 segundos"
                      value={newExercise.descanso}
                      onChange={(e) => setNewExercise({ ...newExercise, descanso: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      🧠 Notas de Técnica
                    </label>
                    <input
                      type="text"
                      placeholder="ej: Mantener espalda recta"
                      value={newExercise.tecnica}
                      onChange={(e) => setNewExercise({ ...newExercise, tecnica: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.95rem",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: colors.cardBg,
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", color: colors.text, fontWeight: "800", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                    📝 Descripción o Notas Adicionales
                  </label>
                  <textarea
                    placeholder="Instrucciones detalladas para el paciente..."
                    value={newExercise.descripcion}
                    onChange={(e) => setNewExercise({ ...newExercise, descripcion: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      border: `2px solid ${colors.border}`,
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      minHeight: "110px",
                      outline: "none",
                      fontFamily: "inherit",
                      resize: "vertical",
                      boxSizing: "border-box",
                      backgroundColor: colors.cardBg,
                      transition: "all 0.3s"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "1.2rem" }}>
                  <button
                    onClick={addExerciseToDay}
                    style={{
                      flex: 1,
                      padding: "1rem",
                      background: `linear-gradient(135deg, ${colors.secondary} 0%, #4ade80 100%)`,
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "800",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      boxShadow: `0 4px 12px ${colors.secondary}40`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      letterSpacing: "0.5px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 8px 20px ${colors.secondary}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${colors.secondary}40`;
                    }}
                  >
                    <Plus size={20} /> Agregar Ejercicio
                  </button>
                  <button
                    onClick={() => setShowExerciseForm(false)}
                    style={{
                      padding: "1rem 2.5rem",
                      background: "#f3f4f6",
                      color: colors.text,
                      border: `2px solid ${colors.border}`,
                      borderRadius: "10px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                    }}
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Ejercicios del Día Seleccionado */}
            {getDayExercises(selectedDay).length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: colors.text, fontSize: "1.1rem", fontWeight: "700" }}>
                  Ejercicios de {selectedDay} ({getDayExercises(selectedDay).length})
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {getDayExercises(selectedDay).map((exercise) => (
                    <div
                      key={exercise.id}
                      style={{
                        background: colors.cardBg,
                        padding: "1.5rem",
                        borderRadius: "10px",
                        border: `1px solid ${colors.border}`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                      }}
                      onClick={() => setExpandedExerciseId(expandedExerciseId === exercise.id ? null : exercise.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.3rem" }}>
                            <h4 style={{ margin: 0, color: colors.text, fontSize: "1rem", fontWeight: "700" }}>
                              {exercise.nombre}
                            </h4>
                            {exercise.grupoId && (
                              <span style={{
                                background: colors.warning + "30",
                                color: colors.warning,
                                padding: "0.2rem 0.6rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem"
                              }}>
                                🔗 {exercise.tipoSerie}
                              </span>
                            )}
                          </div>
                          {exercise.musculos && exercise.musculos.length > 0 && (
                            <p style={{ margin: "0.5rem 0 0 0", color: colors.textLight, fontSize: "0.85rem" }}>
                              <Target size={14} style={{ display: "inline", marginRight: "0.3rem" }} />
                              {getMuscles(exercise)}
                            </p>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "0.8rem" }}>
                            <span style={{ background: colors.primary + "20", color: colors.primary, padding: "0.4rem 0.8rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.85rem" }}>
                              <Zap size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
                              {exercise.series}x{exercise.repeticiones}
                            </span>
                            {exercise.intensidad && (
                              <span style={{ background: colors.warning + "20", color: colors.warning, padding: "0.4rem 0.8rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.85rem" }}>
                                {exercise.intensidad}
                              </span>
                            )}
                            {exercise.equipo && (
                              <span style={{ background: colors.secondary + "20", color: colors.secondary, padding: "0.4rem 0.8rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.85rem" }}>
                                {exercise.equipo}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExercise(exercise.id);
                          }}
                          style={{
                            background: "#fee2e2",
                            color: colors.danger,
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.6rem 0.8rem",
                            cursor: "pointer",
                            marginLeft: "1rem"
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Detalles expandidos */}
                      {expandedExerciseId === exercise.id && (
                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${colors.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.9rem" }}>
                          {exercise.tipoSerie && exercise.tipoSerie !== "Normal" && (
                            <div>
                              <strong style={{ color: colors.text }}>🔗 Tipo de Serie:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight }}>{exercise.tipoSerie}</p>
                            </div>
                          )}
                          {exercise.grupoId && getGroupExercises(exercise).length > 0 && (
                            <div>
                              <strong style={{ color: colors.secondary }}>👥 Grupo ({getGroupExercises(exercise).length} ejercicios):</strong>
                              <div style={{ margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                {getGroupExercises(exercise).map(ex => (
                                  <small key={ex.id} style={{ color: colors.textLight, background: colors.secondary + "10", padding: "0.3rem 0.6rem", borderRadius: "4px" }}>
                                    {ex.nombre}
                                  </small>
                                ))}
                              </div>
                            </div>
                          )}
                          {exercise.orden && (
                            <div>
                              <strong style={{ color: colors.text }}>🔤 Orden:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight }}>{exercise.orden}</p>
                            </div>
                          )}
                          {exercise.tempo && (
                            <div>
                              <strong style={{ color: colors.text }}>⏱️ Tempo:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight }}>{exercise.tempo}</p>
                            </div>
                          )}
                          {exercise.rir && (
                            <div>
                              <strong style={{ color: colors.text }}>💪 RIR/RPE:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight }}>{exercise.rir}</p>
                            </div>
                          )}
                          {exercise.descanso && (
                            <div>
                              <strong style={{ color: colors.text }}>Descanso:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight }}>{exercise.descanso}</p>
                            </div>
                          )}
                          {exercise.tecnica && (
                            <div>
                              <strong style={{ color: colors.text }}>Técnica:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight }}>{exercise.tecnica}</p>
                            </div>
                          )}
                          {exercise.descripcion && (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <strong style={{ color: colors.text }}>Descripción:</strong>
                              <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight, fontStyle: "italic" }}>{exercise.descripcion}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resumen General */}
        {routine.exercises.length > 0 && (
          <div style={{
            background: `linear-gradient(135deg, ${colors.lightBg} 0%, #ecfdf5 100%)`,
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2.5rem",
            border: `2px solid ${colors.secondary}`,
            borderLeft: `6px solid ${colors.secondary}`,
            position: "relative",
            boxShadow: "0 10px 30px rgba(93, 216, 137, 0.15)"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "30px",
              background: `linear-gradient(135deg, ${colors.secondary} 0%, #4ade80 100%)`,
              color: "white",
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(93, 216, 137, 0.3)"
            }}>
              📊
            </div>

            <h2 style={{ margin: "0 0 1.8rem 0", color: colors.text, fontSize: "1.3rem", fontWeight: "800" }}>
              Resumen de la Rutina
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.2rem" }}>
              {days.map((day) => {
                const count = getDayExercises(day).length;
                return (
                  <div key={day} style={{
                    background: colors.cardBg,
                    padding: "1.5rem",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: count > 0 ? `2.5px solid ${colors.secondary}` : `1px solid ${colors.border}`,
                    boxShadow: count > 0 ? "0 4px 12px rgba(93, 216, 137, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.3s",
                    transform: count > 0 ? "scale(1.02)" : "scale(1)"
                  }}>
                    <div style={{ fontWeight: "800", color: colors.text, marginBottom: "0.7rem", fontSize: "0.95rem" }}>
                      {day}
                    </div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "900", color: count > 0 ? colors.secondary : colors.textLight, marginBottom: "0.5rem" }}>
                      {count}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: colors.textLight, fontWeight: "700" }}>
                      {count === 1 ? "ejercicio" : "ejercicios"}
                    </div>
                    {count > 0 && (
                      <div style={{ marginTop: "0.8rem", fontSize: "1.2rem", color: colors.secondary }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button
            onClick={saveRoutine}
            disabled={saving || routine.exercises.length === 0}
            style={{
              padding: "1.3rem 4rem",
              background: routine.exercises.length > 0 
                ? `linear-gradient(135deg, ${colors.primary} 0%, #0891b2 100%)` 
                : "#cbd5e1",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "1.05rem",
              cursor: routine.exercises.length > 0 ? "pointer" : "not-allowed",
              opacity: saving ? 0.7 : 1,
              boxShadow: routine.exercises.length > 0 ? `0 8px 24px ${colors.primary}40` : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              if (routine.exercises.length > 0 && !saving) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 32px ${colors.primary}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (routine.exercises.length > 0 && !saving) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary}40`;
              }
            }}
          >
            {saving ? "⏳ Guardando..." : "💾 Guardar Rutina Completa"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RutinasFisio;
