import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
  Plus, X, Trash2, Save, AlertCircle, Check,
  TrendingUp, Flame, Leaf, ChefHat, User,
  ChevronDown, ChevronUp, Pill
} from "lucide-react";

interface Meal {
  id: string;
  nombre: string;
  descripcion?: string;
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasas: number;
  fuente: "manual" | "fatsecret";
  createdAt?: string;
}

interface PlanData {
  desayuno: Meal[];
  almuerzo: Meal[];
  merienda: Meal[];
  cena: Meal[];
  caloriasTotales: number;
  proteinaTotales: number;
  carbohidratosTotales: number;
  grasasTotales: number;
  notas: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  fisioId: string;
  pacienteId: string;
}

interface Paciente {
  id: string;
  nombre: string;
  email: string;
  peso?: number;
  altura?: number;
  edad?: number;
}

const GestionPlanAlimenticio: React.FC = () => {
  console.log("🎯 MODAL MEJORADO ACTIVO - Nuevo Diseño");
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados para modal de entrada de alimentos
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<keyof Omit<PlanData, "caloriasTotales" | "proteinaTotales" | "carbohidratosTotales" | "grasasTotales" | "notas" | "fechaCreacion" | "fechaActualizacion" | "fisioId" | "pacienteId"> | null>(null);

  // Estados para entrada manual
  const [manualMeal, setManualMeal] = useState({
    nombre: "",
    descripcion: "",
    calorias: 0,
    proteina: 0,
    carbohidratos: 0,
    grasas: 0,
  });

  // Estados para edición
  const [expandedMealType, setExpandedMealType] = useState<keyof Omit<PlanData, "caloriasTotales" | "proteinaTotales" | "carbohidratosTotales" | "grasasTotales" | "notas" | "fechaCreacion" | "fechaActualizacion" | "fisioId" | "pacienteId"> | null>(null);

  // Cargar pacientes del fisio
  useEffect(() => {
    if (!user) return;
    
    const cargarPacientes = async () => {
      try {
        const pacientesRef = collection(db, "users");
        const q = query(pacientesRef, where("role", "==", "paciente"));
        const snapshot = await getDocs(q);
        
        const pacientesData: Paciente[] = [];
        snapshot.forEach((doc) => {
          pacientesData.push({
            id: doc.id,
            nombre: doc.data().nombre || "Sin nombre",
            email: doc.data().email || "",
            peso: doc.data().peso,
            altura: doc.data().altura,
            edad: doc.data().edad,
          });
        });
        
        setPacientes(pacientesData);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      } finally {
        setLoadingPacientes(false);
      }
    };

    cargarPacientes();
  }, [user]);

  // Cargar plan del paciente seleccionado
  useEffect(() => {
    if (!pacienteSeleccionado || !user) return;

    const cargarPlan = async () => {
      setLoadingPlan(true);
      try {
        const planRef = doc(db, "plans", pacienteSeleccionado.id);
        const planDoc = await getDoc(planRef);

        if (planDoc.exists()) {
          setPlan(planDoc.data() as PlanData);
        } else {
          // Crear plan vacío
          const newPlan: PlanData = {
            desayuno: [],
            almuerzo: [],
            merienda: [],
            cena: [],
            caloriasTotales: 0,
            proteinaTotales: 0,
            carbohidratosTotales: 0,
            grasasTotales: 0,
            notas: "",
            fisioId: user.uid,
            pacienteId: pacienteSeleccionado.id,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
          };
          setPlan(newPlan);
        }
      } catch (error) {
        console.error("Error cargando plan:", error);
      } finally {
        setLoadingPlan(false);
      }
    };

    cargarPlan();
  }, [pacienteSeleccionado, user]);

  // Agregar alimento manual
  const handleAgregarAlimentoManual = () => {
    if (!selectedMealType || !manualMeal.nombre || !plan) return;

    const newMeal: Meal = {
      id: `meal_${Date.now()}`,
      nombre: manualMeal.nombre,
      descripcion: manualMeal.descripcion || "",
      calorias: manualMeal.calorias,
      proteina: manualMeal.proteina,
      carbohidratos: manualMeal.carbohidratos,
      grasas: manualMeal.grasas,
      fuente: "manual",
      createdAt: new Date().toISOString(),
    };

    const updatedPlan = {
      ...plan,
      [selectedMealType]: [...plan[selectedMealType], newMeal],
    };

    recalcularTotales(updatedPlan);
    resetFoodModal();
  };

  // Reset food modal
  const resetFoodModal = () => {
    setShowFoodModal(false);
    setManualMeal({
      nombre: "",
      descripcion: "",
      calorias: 0,
      proteina: 0,
      carbohidratos: 0,
      grasas: 0,
    });
    setSelectedMealType(null);
  };

  // Eliminar comida
  const handleEliminarComida = (mealType: keyof Omit<PlanData, "caloriasTotales" | "proteinaTotales" | "carbohidratosTotales" | "grasasTotales" | "notas" | "fechaCreacion" | "fechaActualizacion" | "fisioId" | "pacienteId">, mealId: string) => {
    if (!plan) return;

    const updatedPlan = {
      ...plan,
      [mealType]: plan[mealType].filter((meal) => meal.id !== mealId),
    };

    recalcularTotales(updatedPlan);
  };

  // Recalcular totales
  const recalcularTotales = (updatedPlan: PlanData) => {
    let totalCals = 0,
      totalProt = 0,
      totalCarbs = 0,
      totalFats = 0;

    Object.keys(updatedPlan).forEach((key) => {
      if (["desayuno", "almuerzo", "merienda", "cena"].includes(key)) {
        const meals = updatedPlan[key as keyof Omit<PlanData, "caloriasTotales" | "proteinaTotales" | "carbohidratosTotales" | "grasasTotales" | "notas" | "fechaCreacion" | "fechaActualizacion" | "fisioId" | "pacienteId">];
        meals.forEach((meal) => {
          totalCals += meal.calorias;
          totalProt += meal.proteina;
          totalCarbs += meal.carbohidratos;
          totalFats += meal.grasas;
        });
      }
    });

    const finalPlan = {
      ...updatedPlan,
      caloriasTotales: totalCals,
      proteinaTotales: totalProt,
      carbohidratosTotales: totalCarbs,
      grasasTotales: totalFats,
      fechaActualizacion: new Date().toISOString(),
    };

    setPlan(finalPlan);
  };

  // Guardar plan en Firestore
  const handleGuardarPlan = async () => {
    if (!plan || !pacienteSeleccionado || !user) return;

    setSaving(true);
    try {
      const planRef = doc(db, "plans", pacienteSeleccionado.id);
      await setDoc(planRef, plan, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error guardando plan:", error);
    } finally {
      setSaving(false);
    }
  };

  // Helpers
  const getMealColor = (mealType: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      desayuno: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", light: "bg-amber-100" },
      almuerzo: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", light: "bg-blue-100" },
      merienda: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", light: "bg-pink-100" },
      cena: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", light: "bg-indigo-100" },
    };
    return colors[mealType] || colors.almuerzo;
  };

  const getMealIcon = (mealType: string) => {
    const icons: Record<string, React.ReactNode> = {
      desayuno: "🌅",
      almuerzo: "🍽️",
      merienda: "☕",
      cena: "🌙",
    };
    return icons[mealType] || "🍽️";
  };

  if (loadingPacientes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Planes Alimenticios</h1>
          <p className="text-gray-600">Crea y modifica planes nutricionales personalizados para cada paciente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Pacientes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Mis Pacientes
              </h2>

              {pacientes.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No hay pacientes registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pacientes.map((paciente) => (
                    <button
                      key={paciente.id}
                      onClick={() => setPacienteSeleccionado(paciente)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        pacienteSeleccionado?.id === paciente.id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      <div className="font-semibold text-sm">{paciente.nombre}</div>
                      <div className="text-xs opacity-75">{paciente.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Principal del Plan */}
          <div className="lg:col-span-3">
            {!pacienteSeleccionado ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Selecciona un Paciente</h3>
                <p className="text-gray-600">Elige un paciente de la lista para comenzar a crear su plan alimenticio</p>
              </div>
            ) : loadingPlan ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando plan...</p>
              </div>
            ) : plan ? (
              <div className="space-y-6">
                {/* Info del Paciente */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{pacienteSeleccionado.nombre}</h2>
                      <p className="text-gray-600">{pacienteSeleccionado.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">
                        {pacienteSeleccionado.peso && `${pacienteSeleccionado.peso} kg`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {pacienteSeleccionado.altura && `${pacienteSeleccionado.altura} cm`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {pacienteSeleccionado.edad && `${pacienteSeleccionado.edad} años`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de Nutrientes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-semibold">Calorías</p>
                        <p className="text-3xl font-bold">{Math.round(plan.caloriasTotales)}</p>
                        <p className="text-orange-100 text-xs mt-1">kcal</p>
                      </div>
                      <Flame size={32} className="opacity-50" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-semibold">Proteína</p>
                        <p className="text-3xl font-bold">{Math.round(plan.proteinaTotales)}</p>
                        <p className="text-red-100 text-xs mt-1">g</p>
                      </div>
                      <Pill size={32} className="opacity-50" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-semibold">Carbos</p>
                        <p className="text-3xl font-bold">{Math.round(plan.carbohidratosTotales)}</p>
                        <p className="text-yellow-100 text-xs mt-1">g</p>
                      </div>
                      <TrendingUp size={32} className="opacity-50" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-semibold">Grasas</p>
                        <p className="text-3xl font-bold">{Math.round(plan.grasasTotales)}</p>
                        <p className="text-green-100 text-xs mt-1">g</p>
                      </div>
                      <Leaf size={32} className="opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Comidas */}
                {["desayuno", "almuerzo", "merienda", "cena"].map((mealType) => {
                  const typedMealType = mealType as keyof Omit<PlanData, "caloriasTotales" | "proteinaTotales" | "carbohidratosTotales" | "grasasTotales" | "notas" | "fechaCreacion" | "fechaActualizacion" | "fisioId" | "pacienteId">;
                  const meals = plan[typedMealType];
                  const colors = getMealColor(mealType);
                  const isExpanded = expandedMealType === typedMealType;

                  return (
                    <div key={mealType} className={`${colors.bg} border-2 ${colors.border} rounded-xl shadow-lg overflow-hidden`}>
                      <div
                        className="p-4 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setExpandedMealType(isExpanded ? null : typedMealType)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getMealIcon(mealType)}</span>
                            <div>
                              <h3 className={`text-lg font-bold ${colors.text} capitalize`}>{mealType}</h3>
                              <p className="text-sm opacity-75">{meals.length} alimentos</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${colors.text}`}>{Math.round(meals.reduce((s, m) => s + m.calorias, 0))} kcal</p>
                            </div>
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`border-t-2 ${colors.border} p-4 space-y-3`}>
                          {meals.length === 0 ? (
                            <p className="text-gray-600 text-center py-4 italic">Sin alimentos agregados</p>
                          ) : (
                            meals.map((meal) => (
                              <div key={meal.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-bold text-gray-800">{meal.nombre}</h4>
                                    <p className="text-sm text-gray-600">{meal.descripcion}</p>
                                    {meal.fuente === "fatsecret" && (
                                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold">FatSecret</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleEliminarComida(typedMealType, meal.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                  <div>
                                    <p className="text-gray-600 text-xs">Calorías</p>
                                    <p className="font-bold text-gray-800">{Math.round(meal.calorias)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs">Proteína</p>
                                    <p className="font-bold text-gray-800">{Math.round(meal.proteina)}g</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs">Carbos</p>
                                    <p className="font-bold text-gray-800">{Math.round(meal.carbohidratos)}g</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs">Grasas</p>
                                    <p className="font-bold text-gray-800">{Math.round(meal.grasas)}g</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}

                          <div className="flex gap-2 pt-3 border-t-2 border-gray-300">
                            <button
                              onClick={() => {
                                setSelectedMealType(typedMealType);
                                setShowFoodModal(true);
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus size={18} />
                              Agregar Alimento
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Notas */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Notas Personalizadas</h3>
                  <textarea
                    value={plan.notas}
                    onChange={(e) => setPlan({ ...plan, notas: e.target.value })}
                    placeholder="Agrega recomendaciones, restricciones o notas especiales..."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
                    rows={4}
                  />
                </div>

                {/* Botón Guardar */}
                <button
                  onClick={handleGuardarPlan}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Guardar Plan
                    </>
                  )}
                </button>

                {saveSuccess && (
                  <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Check size={20} />
                    Plan guardado exitosamente
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold">Agregar Alimento</h2>
                <p className="text-green-100 text-sm mt-1">
                  {selectedMealType && selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                </p>
              </div>
              <button onClick={() => resetFoodModal()} className="hover:bg-green-800 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del alimento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pollo a la parrilla, Arroz, Manzana..."
                  value={manualMeal.nombre}
                  onChange={(e) => setManualMeal({ ...manualMeal, nombre: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción/Porción
                </label>
                <input
                  type="text"
                  placeholder="Ej: 100g, 1 taza, 1 filete..."
                  value={manualMeal.descripcion}
                  onChange={(e) => setManualMeal({ ...manualMeal, descripcion: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Información Nutricional
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 mb-2 uppercase">Calorías</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualMeal.calorias}
                      onChange={(e) => setManualMeal({ ...manualMeal, calorias: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base font-semibold"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 mb-2 uppercase">Proteína (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualMeal.proteina}
                      onChange={(e) => setManualMeal({ ...manualMeal, proteina: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base font-semibold"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 mb-2 uppercase">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualMeal.carbohidratos}
                      onChange={(e) => setManualMeal({ ...manualMeal, carbohidratos: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base font-semibold"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 mb-2 uppercase">Grasas (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualMeal.grasas}
                      onChange={(e) => setManualMeal({ ...manualMeal, grasas: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Vista Previa */}
              {manualMeal.nombre && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                  <div className="space-y-2">
                    <p className="font-bold text-lg text-green-900">{manualMeal.nombre}</p>
                    <p className="text-sm text-gray-700">{manualMeal.descripcion || "Sin descripción"}</p>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div className="bg-green-100 p-2 rounded text-center">
                        <p className="font-bold text-green-900">{manualMeal.calorias}</p>
                        <p className="text-xs text-green-700">kcal</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded text-center">
                        <p className="font-bold text-green-900">{manualMeal.proteina}g</p>
                        <p className="text-xs text-green-700">Proteína</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded text-center">
                        <p className="font-bold text-green-900">{manualMeal.carbohidratos}g</p>
                        <p className="text-xs text-green-700">Carbs</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded text-center">
                        <p className="font-bold text-green-900">{manualMeal.grasas}g</p>
                        <p className="text-xs text-green-700">Grasas</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => resetFoodModal()}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAgregarAlimentoManual}
                  disabled={!manualMeal.nombre}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-base"
                >
                  <Plus size={18} />
                  Agregar Alimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPlanAlimenticio;
