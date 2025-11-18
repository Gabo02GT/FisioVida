import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Apple, Utensils, Flame, Zap, Wheat, Droplet } from "lucide-react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../auth/useAuth";
import "../../styles/responsive.css";

interface MealItem {
  nombre: string;
  descripcion?: string;
  calorias?: number;
  proteina?: number;
  carbohidratos?: number;
  grasas?: number;
}

interface PlanData {
  desayuno: (string | MealItem)[];
  almuerzo: (string | MealItem)[];
  merienda: (string | MealItem)[];
  cena: (string | MealItem)[];
  calorias?: number;
  proteina?: number;
  carbohidratos?: number;
  grasas?: number;
  notas?: string;
}

export default function PlanAlimenticio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hasPlan, setHasPlan] = useState(false);
  const [meals, setMeals] = useState<PlanData>({
    desayuno: [],
    almuerzo: [],
    merienda: [],
    cena: []
  });
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!user?.uid) return;

      try {
        const planDocRef = doc(db, "plans", user.uid);
        const planDoc = await getDoc(planDocRef);

        if (planDoc.exists()) {
          setMeals(planDoc.data() as PlanData);
          setHasPlan(true);
        }
      } catch (err) {
        console.error("Error cargando plan:", err);
        setHasPlan(false);
      }
    };

    loadPlan();
  }, [user?.uid]);

  const calculateTotalNutrients = (items: any[]) => {
    return items.reduce(
      (acc, item) => {
        const cal = typeof item === "string" ? 0 : (item?.calorias || 0);
        const prot = typeof item === "string" ? 0 : (item?.proteina || 0);
        const carbs = typeof item === "string" ? 0 : (item?.carbohidratos || 0);
        const fat = typeof item === "string" ? 0 : (item?.grasas || 0);
        return {
          calorias: acc.calorias + cal,
          proteina: acc.proteina + prot,
          carbohidratos: acc.carbohidratos + carbs,
          grasas: acc.grasas + fat,
        };
      },
      { calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0 }
    );
  };

  const getMealIcon = (tipo: string) => {
    switch (tipo) {
      case "desayuno":
        return <Utensils size={24} />;
      case "almuerzo":
        return <Flame size={24} />;
      case "merienda":
        return <Apple size={24} />;
      case "cena":
        return <Zap size={24} />;
      default:
        return <Apple size={24} />;
    }
  };

  const getMealColor = (tipo: string) => {
    switch (tipo) {
      case "desayuno":
        return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", accent: "#f59e0b" };
      case "almuerzo":
        return { bg: "#d1fae5", border: "#10b981", text: "#065f46", accent: "#10b981" };
      case "merienda":
        return { bg: "#fce7f3", border: "#ec4899", text: "#831843", accent: "#ec4899" };
      case "cena":
        return { bg: "#cffafe", border: "#0891b2", text: "#164e63", accent: "#0891b2" };
      default:
        return { bg: "#f3f4f6", border: "#6b7280", text: "#374151", accent: "#6b7280" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <button onClick={() => navigate("/dashboard/paciente")} style={{ display: "flex", gap: "8px", padding: "10px 16px", background: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, marginBottom: "20px", color: "#0891b2" }}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "40px" }}>
            <Apple size={32} color="#f59e0b" />
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1f2937", margin: 0 }}>Plan Alimenticio</h1>
              <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Tu plan nutricional personalizado</p>
            </div>
          </div>

          {hasPlan ? (
            <>
              {/* Resumen Nutricional General */}
              <div style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderRadius: "12px", padding: "24px", marginBottom: "30px", borderLeft: "4px solid #f59e0b" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flame size={20} /> Resumen Nutricional Diario
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "15px" }}>
                  <div style={{ background: "white", padding: "15px", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Calorías</div>
                    <div style={{ fontSize: "26px", fontWeight: 700, color: "#f59e0b", marginTop: "8px" }}>{meals.calorias || 0}</div>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>kcal/día</div>
                  </div>
                  <div style={{ background: "white", padding: "15px", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Zap size={14} /> Proteína</div>
                    <div style={{ fontSize: "26px", fontWeight: 700, color: "#10b981", marginTop: "8px" }}>{meals.proteina || 0}</div>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>gramos</div>
                  </div>
                  <div style={{ background: "white", padding: "15px", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Wheat size={14} /> Carbohidratos</div>
                    <div style={{ fontSize: "26px", fontWeight: 700, color: "#0891b2", marginTop: "8px" }}>{meals.carbohidratos || 0}</div>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>gramos</div>
                  </div>
                  <div style={{ background: "white", padding: "15px", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Droplet size={14} /> Grasas</div>
                    <div style={{ fontSize: "26px", fontWeight: 700, color: "#8b5cf6", marginTop: "8px" }}>{meals.grasas || 0}</div>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>gramos</div>
                  </div>
                </div>
              </div>

              {/* Comidas Detalladas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                {["desayuno", "almuerzo", "merienda", "cena"].map((tipo) => {
                  const items = meals[tipo as keyof PlanData] as any[];
                  const mealNutrients = calculateTotalNutrients(items);
                  const isExpanded = expandedMeal === tipo;
                  const colors = getMealColor(tipo);

                  return (
                    <div
                      key={tipo}
                      style={{
                        background: "#fff",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        border: `2px solid ${colors.border}`,
                      }}
                    >
                      {/* Header */}
                      <div
                        onClick={() => setExpandedMeal(isExpanded ? null : tipo)}
                        style={{
                          background: colors.bg,
                          padding: "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ color: colors.accent, fontSize: "20px" }}>
                            {getMealIcon(tipo)}
                          </span>
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "18px",
                                fontWeight: 600,
                                color: colors.text,
                                textTransform: "capitalize",
                              }}
                            >
                              {tipo}
                            </h3>
                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                              {items.length} item{items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            background: "rgba(255,255,255,0.7)",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: colors.accent,
                          }}
                        >
                          {mealNutrients.calorias} kcal
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ padding: "16px" }}>
                        {Array.isArray(items) && items.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {items.map((item: any, i: number) => (
                              <div
                                key={i}
                                style={{
                                  background: "#f9fafb",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  borderLeft: `3px solid ${colors.accent}`,
                                }}
                              >
                                <p
                                  style={{
                                    margin: "0 0 4px 0",
                                    fontWeight: 600,
                                    color: "#111827",
                                    fontSize: "14px",
                                  }}
                                >
                                  {typeof item === "string" ? item : item?.nombre || "Sin nombre"}
                                </p>
                                {item?.descripcion && (
                                  <p
                                    style={{
                                      margin: "4px 0",
                                      fontSize: "12px",
                                      color: "#6b7280",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {item.descripcion}
                                  </p>
                                )}
                                {(typeof item !== "string" && (item?.calorias || item?.proteina || item?.carbohidratos || item?.grasas)) && (
                                  <div
                                    style={{
                                      marginTop: "8px",
                                      paddingTop: "8px",
                                      borderTop: "1px solid #e5e7eb",
                                      display: "grid",
                                      gridTemplateColumns: "repeat(4, 1fr)",
                                      gap: "8px",
                                      fontSize: "11px",
                                    }}
                                  >
                                    <div style={{ textAlign: "center" }}>
                                      <div style={{ color: "#6b7280", fontWeight: 600 }}>Cal</div>
                                      <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                                        {item.calorias || 0}
                                      </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                      <div style={{ color: "#6b7280", fontWeight: 600 }}>Prot</div>
                                      <div style={{ color: "#10b981", fontWeight: 700 }}>
                                        {item.proteina || 0}g
                                      </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                      <div style={{ color: "#6b7280", fontWeight: 600 }}>Carbs</div>
                                      <div style={{ color: "#0891b2", fontWeight: 700 }}>
                                        {item.carbohidratos || 0}g
                                      </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                      <div style={{ color: "#6b7280", fontWeight: 600 }}>Fat</div>
                                      <div style={{ color: "#8b5cf6", fontWeight: 700 }}>
                                        {item.grasas || 0}g
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: "14px", fontStyle: "italic", color: "#9ca3af" }}>
                            No hay ítems registrados
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notas */}
              {meals.notas && (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "2px solid #10b981",
                    borderRadius: "12px",
                    padding: "16px",
                    marginTop: "20px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 8px 0",
                      color: "#065f46",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    📝 Notas de tu Fisioterapeuta
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: "#047857",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {meals.notas}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderRadius: "12px", borderLeft: "4px solid #f59e0b" }}>
              <Apple size={56} style={{ margin: "0 auto 20px", color: "#b45309" }} />
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#92400e" }}>
                No hay plan alimenticio aún
              </p>
              <p style={{ margin: "10px 0 0 0", fontSize: "15px", color: "#b45309", lineHeight: "1.6" }}>
                Tu fisioterapeuta creará un plan nutricional personalizado para ti basado en tus objetivos y necesidades.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          main {
            padding: 1.5rem 1rem;
          }

          .meal-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .meal-card {
            padding: 1.2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 1rem;
          }

          h2 {
            font-size: 1.3rem;
          }

          .meal-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .meal-card {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .stat-item {
            padding: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
