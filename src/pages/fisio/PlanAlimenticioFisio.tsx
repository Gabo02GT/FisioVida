import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Trash2, Plus, Edit2, Check, X, Apple } from "lucide-react";

interface Alimento {
  id: string;
  nombre: string;
  porcion: string;
  descripcion?: string;
}

interface Comida {
  id: string;
  nombre: string;
  alimentos: Alimento[];
  editando?: boolean;
  nuevoNombre?: string;
}

interface PlanData {
  comidas: Comida[];
  notas?: string;
  updatedAt?: string;
}

interface Props {
  pacienteId: string;
}

const PlanAlimenticioFisio: React.FC<Props> = ({ pacienteId }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanData>({
    comidas: [{ id: "1", nombre: "Desayuno", alimentos: [] }]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pacienteName, setPacienteName] = useState("");
  const [showAddFood, setShowAddFood] = useState<string | null>(null);
  const [newFood, setNewFood] = useState({ nombre: "", porcion: "", descripcion: "" });

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

  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadData = async () => {
      try {
        const userRef = doc(db, "users", pacienteId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setPacienteName(userSnap.data().nombre || "");
        }

        const planRef = doc(db, "plans", pacienteId);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          const data = planSnap.data() as PlanData;
          setPlan(data);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pacienteId, user]);

  const handleAddFood = (comidaId: string) => {
    if (!newFood.nombre.trim() || !newFood.porcion.trim()) return;

    setPlan(prev => ({
      ...prev,
      comidas: prev.comidas.map(comida =>
        comida.id === comidaId
          ? {
              ...comida,
              alimentos: [
                ...comida.alimentos,
                { id: Date.now().toString(), ...newFood }
              ]
            }
          : comida
      )
    }));

    setNewFood({ nombre: "", porcion: "", descripcion: "" });
    setShowAddFood(null);
  };

  const handleRemoveFood = (comidaId: string, foodId: string) => {
    setPlan(prev => ({
      ...prev,
      comidas: prev.comidas.map(comida =>
        comida.id === comidaId
          ? { ...comida, alimentos: comida.alimentos.filter(a => a.id !== foodId) }
          : comida
      )
    }));
  };

  const handleAddMealType = () => {
    const newMealId = Date.now().toString();
    setPlan(prev => ({
      ...prev,
      comidas: [...prev.comidas, { id: newMealId, nombre: "Nueva Comida", alimentos: [] }]
    }));
  };

  const handleDeleteMealType = (comidaId: string) => {
    if (plan.comidas.length === 1) {
      alert("Debe mantener al menos una comida");
      return;
    }
    setPlan(prev => ({
      ...prev,
      comidas: prev.comidas.filter(c => c.id !== comidaId)
    }));
  };

  const handleEditMealName = (comidaId: string) => {
    const comida = plan.comidas.find(c => c.id === comidaId);
    if (!comida) return;

    setPlan(prev => ({
      ...prev,
      comidas: prev.comidas.map(c =>
        c.id === comidaId
          ? { ...c, editando: !c.editando, nuevoNombre: c.nombre }
          : c
      )
    }));
  };

  const handleSaveMealName = (comidaId: string) => {
    const comida = plan.comidas.find(c => c.id === comidaId);
    if (!comida || !comida.nuevoNombre?.trim()) return;

    setPlan(prev => ({
      ...prev,
      comidas: prev.comidas.map(c =>
        c.id === comidaId
          ? { ...c, nombre: comida.nuevoNombre!, editando: false }
          : c
      )
    }));
  };

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      await setDoc(
        doc(db, "plans", pacienteId),
        { ...plan, updatedAt: new Date().toISOString() }
      );
      alert("Plan guardado exitosamente");
    } catch (error) {
      console.error("Error guardando plan:", error);
      alert("Error al guardar el plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: colors.lightBg }}>
        <div style={{ fontSize: "1.2rem", color: colors.textLight }}>Cargando plan alimenticio...</div>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, height: "100vh", display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #0891b2 100%)`,
        color: "white",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(79, 195, 220, 0.3)",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <Apple size={40} strokeWidth={1.5} />
          <h1 style={{ margin: 0, fontSize: "2.8rem", fontWeight: "800", letterSpacing: "-0.5px" }}>Plan Alimenticio</h1>
        </div>
        <p style={{ margin: "0.7rem 0 0 0", fontSize: "1.1rem", opacity: 0.95, fontWeight: "500" }}>{pacienteName}</p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "3rem 2rem", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2.5rem", marginBottom: "3rem", width: "100%", maxWidth: "1400px", margin: "0 auto 3rem" }}>
          {plan.comidas.map((comida) => (
            <div key={comida.id} style={{
              background: colors.cardBg,
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              border: `2px solid ${colors.border}`,
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "flex",
              flexDirection: "column",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            }}>
              {/* Card Header */}
              <div style={{
                background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
                padding: "1.5rem",
                borderBottom: `2px solid ${colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                {comida.editando ? (
                  <input
                    type="text"
                    value={comida.nuevoNombre || ""}
                    onChange={(e) =>
                      setPlan(prev => ({
                        ...prev,
                        comidas: prev.comidas.map(c =>
                          c.id === comida.id ? { ...c, nuevoNombre: e.target.value } : c
                        )
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: "0.7rem 1rem",
                      border: `2px solid ${colors.primary}`,
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      color: colors.text,
                      outline: "none"
                    }}
                  />
                ) : (
                  <h3 style={{ margin: 0, color: colors.text, fontSize: "1.4rem", fontWeight: "700" }}>
                    {comida.nombre}
                  </h3>
                )}

                <div style={{ display: "flex", gap: "0.6rem", marginLeft: "1rem", flexShrink: 0 }}>
                  {comida.editando ? (
                    <>
                      <button
                        onClick={() => handleSaveMealName(comida.id)}
                        style={{
                          background: colors.secondary,
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.6rem 0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#4caf50"}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleEditMealName(comida.id)}
                        style={{
                          background: "#94a3b8",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.6rem 0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#64748b"}
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditMealName(comida.id)}
                        style={{
                          background: "transparent",
                          color: colors.primary,
                          border: `2px solid ${colors.primary}`,
                          borderRadius: "8px",
                          padding: "0.6rem 0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.primary;
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = colors.primary;
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteMealType(comida.id)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.6rem 0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fca5a5"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                {comida.alimentos.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem", flex: 1 }}>
                    {comida.alimentos.map((alimento) => (
                      <div key={alimento.id} style={{
                        background: colors.accentLight,
                        padding: "1.2rem",
                        borderRadius: "10px",
                        border: `1px solid ${colors.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = colors.lightBg}
                      onMouseLeave={(e) => e.currentTarget.style.background = colors.accentLight}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: "0 0 0.4rem 0", fontWeight: "700", color: colors.text, fontSize: "0.95rem" }}>
                            {alimento.nombre}
                          </p>
                          <p style={{ margin: "0.3rem 0", fontSize: "0.85rem", color: colors.primary, fontWeight: "600" }}>
                            📏 {alimento.porcion}
                          </p>
                          {alimento.descripcion && (
                            <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: colors.textLight, fontStyle: "italic" }}>
                              {alimento.descripcion}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFood(comida.id, alimento.id)}
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.5rem 0.6rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#fca5a5"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: colors.textLight, fontStyle: "italic", margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>
                    Sin alimentos agregados
                  </p>
                )}

                {showAddFood === comida.id ? (
                  <div style={{
                    background: colors.lightBg,
                    padding: "1.5rem",
                    borderRadius: "10px",
                    border: `2px solid ${colors.primary}`,
                    marginTop: "auto"
                  }}>
                    <h4 style={{ margin: "0 0 1rem 0", color: colors.text, fontSize: "0.95rem", fontWeight: "700" }}>
                      Agregar Alimento
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <input
                        type="text"
                        placeholder="Nombre del alimento"
                        value={newFood.nombre}
                        onChange={(e) => setNewFood({ ...newFood, nombre: e.target.value })}
                        style={{
                          padding: "0.8rem",
                          border: `2px solid ${colors.border}`,
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          outline: "none",
                          transition: "border 0.2s"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                        onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
                      />

                      <input
                        type="text"
                        placeholder="Porción (ej: 500g, 1 taza)"
                        value={newFood.porcion}
                        onChange={(e) => setNewFood({ ...newFood, porcion: e.target.value })}
                        style={{
                          padding: "0.8rem",
                          border: `2px solid ${colors.border}`,
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          outline: "none",
                          transition: "border 0.2s"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                        onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
                      />

                      <textarea
                        placeholder="Descripción (opcional)"
                        value={newFood.descripcion}
                        onChange={(e) => setNewFood({ ...newFood, descripcion: e.target.value })}
                        style={{
                          padding: "0.8rem",
                          border: `2px solid ${colors.border}`,
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          minHeight: "70px",
                          fontFamily: "inherit",
                          outline: "none",
                          transition: "border 0.2s",
                          resize: "vertical"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                        onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
                      />

                      <div style={{ display: "flex", gap: "0.8rem" }}>
                        <button
                          onClick={() => handleAddFood(comida.id)}
                          disabled={!newFood.nombre.trim() || !newFood.porcion.trim()}
                          style={{
                            flex: 1,
                            padding: "0.8rem",
                            background: newFood.nombre.trim() && newFood.porcion.trim() ? colors.secondary : "#cbd5e1",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: newFood.nombre.trim() && newFood.porcion.trim() ? "pointer" : "not-allowed",
                            fontSize: "0.9rem",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            if (newFood.nombre.trim() && newFood.porcion.trim()) {
                              e.currentTarget.style.background = "#4caf50";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = newFood.nombre.trim() && newFood.porcion.trim() ? colors.secondary : "#cbd5e1";
                          }}
                        >
                          ✓ Agregar
                        </button>
                        <button
                          onClick={() => {
                            setShowAddFood(null);
                            setNewFood({ nombre: "", porcion: "", descripcion: "" });
                          }}
                          style={{
                            flex: 1,
                            padding: "0.8rem",
                            background: "#94a3b8",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#64748b"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#94a3b8"}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddFood(comida.id)}
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      background: `${colors.primary}20`,
                      color: colors.primary,
                      border: `2px dashed ${colors.primary}`,
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s",
                      marginTop: "auto"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${colors.primary}30`;
                      e.currentTarget.style.borderColor = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${colors.primary}20`;
                    }}
                  >
                    <Plus size={18} /> Agregar Alimento
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap", paddingBottom: "1rem", maxWidth: "1400px", margin: "0 auto" }}>
          <button
            onClick={handleAddMealType}
            disabled={plan.comidas.length >= 7}
            style={{
              padding: "1rem 2.5rem",
              background: plan.comidas.length >= 7 ? "#cbd5e1" : colors.secondary,
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: plan.comidas.length >= 7 ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(93, 216, 137, 0.3)"
            }}
            onMouseEnter={(e) => {
              if (plan.comidas.length < 7) {
                e.currentTarget.style.background = "#4caf50";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.secondary;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus size={20} /> Agregar Comida ({plan.comidas.length}/7)
          </button>

          <button
            onClick={handleSavePlan}
            disabled={saving}
            style={{
              padding: "1rem 2.5rem",
              background: colors.primary,
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(79, 195, 220, 0.3)"
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = "#0891b2";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primary;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {saving ? "Guardando..." : "💾 Guardar Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanAlimenticioFisio;
