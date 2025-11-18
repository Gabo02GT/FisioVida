import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/useAuth";
import "../../styles/responsive.css";

interface IMCRecord {
  date: string;
  imc: number;
  peso: number;
  altura: number;
  categoria: string;
}

interface UserProfile {
  edad: number | null;
  sexo: "masculino" | "femenino" | null;
}

export default function CalculadoraCorporal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ edad: null, sexo: null });
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [unidadPeso, setUnidadPeso] = useState<"kg" | "lb">("kg");
  const [unidadAltura, setUnidadAltura] = useState<"cm" | "m" | "ft">("cm");
  
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [imc, setIMC] = useState<number | null>(null);
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<IMCRecord[]>([]);

  const edad = userProfile.edad;
  const sexo = userProfile.sexo;

  // Cargar perfil del usuario desde Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.uid) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.edad && userData.sexo) {
            setUserProfile({
              edad: userData.edad,
              sexo: userData.sexo as "masculino" | "femenino"
            });
            setShowProfileForm(false);
            
            // Cargar historial de IMC
            if (userData.imcHistory) {
              setHistory(userData.imcHistory);
            }
          } else {
            setShowProfileForm(true);
          }
        } else {
          setShowProfileForm(true);
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    };

    loadUserProfile();
  }, [user?.uid]);

  const getIMCCategory = (value: number) => {
    if (value < 18.5) return { text: "Bajo peso", color: "#3b82f6", bg: "#dbeafe" };
    if (value < 25) return { text: "Peso normal", color: "#10b981", bg: "#dcfce7" };
    if (value < 30) return { text: "Sobrepeso", color: "#f59e0b", bg: "#fef3c7" };
    if (value < 35) return { text: "Obesidad Clase I", color: "#ef4444", bg: "#fee2e2" };
    if (value < 40) return { text: "Obesidad Clase II", color: "#991b1b", bg: "#fecaca" };
    return { text: "Obesidad Clase III", color: "#7c2d12", bg: "#fed7aa" };
  };

  const getRecommendations = (imcValue: number, edadParam: number | null) => {
    const recs: string[] = [];
    
    if (imcValue < 18.5) {
      recs.push("Aumentar ingesta calórica de forma equilibrada");
      recs.push("Consumir proteínas de calidad (huevos, pollo, pescado)");
      recs.push("Realizar ejercicios de fortalecimiento muscular");
    } else if (imcValue < 25) {
      recs.push("¡Mantén este peso saludable!");
      recs.push("Continúa con hábitos de ejercicio regular");
      recs.push("Consume una dieta equilibrada y variada");
    } else if (imcValue < 30) {
      recs.push("Aumentar actividad física gradualmente");
      recs.push("Reducir consumo de alimentos ultraprocesados");
      recs.push("Incrementar ingesta de frutas y verduras");
    } else {
      recs.push("Consulta con tu fisioterapeuta para un plan personalizado");
      recs.push("Actividad física moderada (caminar, natación)");
      recs.push("Monitoreo regular del peso");
    }

    if (edadParam && edadParam > 60) {
      recs.push("Enfoque especial en ejercicios de movilidad y equilibrio");
    }

    return recs;
  };

  const convertToCM = (value: number, unit: "cm" | "m" | "ft"): number => {
    switch(unit) {
      case "m": return value * 100;
      case "ft": return value * 30.48;
      default: return value;
    }
  };

  const convertToKG = (value: number, unit: "kg" | "lb"): number => {
    return unit === "lb" ? value * 0.453592 : value;
  };

  const validateInputs = (): boolean => {
    setError("");
    const pesoNum = Number(peso);
    const alturaNum = Number(altura);

    if (!peso || !altura) {
      setError("Por favor completa todos los campos");
      return false;
    }

    if (pesoNum <= 0 || pesoNum > 500) {
      setError("El peso debe estar entre 1 y 500 kg/libras");
      return false;
    }

    if (alturaNum <= 0 || alturaNum > 300) {
      setError("La altura no es válida");
      return false;
    }

    return true;
  };

  const handleCalculateIMC = async () => {
    if (!validateInputs()) return;

    const pesoKG = convertToKG(Number(peso), unidadPeso);
    const alturaCM = convertToCM(Number(altura), unidadAltura);
    const alturaM = alturaCM / 100;

    const imcValue = pesoKG / (alturaM * alturaM);
    const imcRounded = Math.round(imcValue * 10) / 10;

    setIMC(imcRounded);
    const cat = getIMCCategory(imcRounded);
    setCategoria(cat.text);

    const date = new Date().toLocaleDateString("es-MX");
    const newRecord: IMCRecord = { date, imc: imcRounded, peso: pesoKG, altura: alturaCM, categoria: cat.text };
    const newHistory = [newRecord, ...history];
    setHistory(newHistory);

    // Guardar en Firestore
    try {
      const userDocRef = doc(db, "users", user!.uid);
      await updateDoc(userDocRef, {
        peso: pesoKG,
        altura: alturaM,
        imcHistory: newHistory
      });
    } catch (err) {
      console.error("Error guardando historial de IMC:", err);
    }

    setPeso("");
    setAltura("");
  };

  const handleSaveProfile = async () => {
    if (!userProfile.edad || !userProfile.sexo) {
      setError("Por favor completa edad y sexo");
      return;
    }
    if (userProfile.edad < 1 || userProfile.edad > 120) {
      setError("La edad debe estar entre 1 y 120 años");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user!.uid);
      await updateDoc(userDocRef, {
        edad: userProfile.edad,
        sexo: userProfile.sexo,
        profileCompletedAt: new Date().toISOString()
      });
      setShowProfileForm(false);
      setError("");
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setError("Error al guardar el perfil");
    }
  };

  if (showProfileForm) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <button onClick={() => navigate("/dashboard/paciente")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, marginBottom: "20px", color: "#0891b2" }}>
            <ArrowLeft size={20} /> Volver
          </button>

          <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
              <Calculator size={32} color="#0891b2" />
              <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1f2937", margin: 0 }}>Información Personal</h1>
            </div>

            <p style={{ color: "#6b7280", marginBottom: "30px" }}>Necesitamos algunos datos para personalizar tus recomendaciones</p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", color: "#374151", fontWeight: 600, display: "block", marginBottom: "10px" }}>Edad (años)</label>
              <input
                type="number"
                placeholder="30"
                value={userProfile.edad || ""}
                onChange={(e) => setUserProfile({ ...userProfile, edad: e.target.value ? Number(e.target.value) : null })}
                min="1"
                max="120"
                style={{ width: "100%", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "16px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ fontSize: "14px", color: "#374151", fontWeight: 600, display: "block", marginBottom: "10px" }}>Sexo</label>
              <div style={{ display: "flex", gap: "15px" }}>
                {(["masculino", "femenino"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setUserProfile({ ...userProfile, sexo: s })}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: userProfile.sexo === s ? "2px solid #0891b2" : "2px solid #e5e7eb",
                      borderRadius: "8px",
                      background: userProfile.sexo === s ? "#e0f2fe" : "white",
                      color: userProfile.sexo === s ? "#0891b2" : "#6b7280",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0891b2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = imc ? getIMCCategory(imc) : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <button onClick={() => navigate("/dashboard/paciente")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, marginBottom: "20px", color: "#0891b2" }}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <Calculator size={32} color="#0891b2" />
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1f2937", margin: 0 }}>Calculadora de IMC</h1>
                <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Índice de Masa Corporal</p>
              </div>
            </div>
            {edad && sexo && (
              <div style={{ textAlign: "right", fontSize: "14px", color: "#6b7280" }}>
                <p style={{ margin: 0 }}>Edad: <strong>{edad} años</strong></p>
                <p style={{ margin: "5px 0 0 0" }}>Sexo: <strong>{sexo === "masculino" ? "Masculino" : "Femenino"}</strong></p>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
            <div>
              <h3 style={{ margin: "0 0 20px 0", color: "#1f2937", fontWeight: 600 }}>Datos de entrada</h3>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "8px" }}>Peso</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="number"
                    placeholder="70"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    step="0.1"
                    style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }}
                  />
                  <select value={unidadPeso} onChange={(e) => setUnidadPeso(e.target.value as "kg" | "lb")} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "8px" }}>Altura</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="number"
                    placeholder="175"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    step="0.1"
                    style={{ flex: 1, padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }}
                  />
                  <select value={unidadAltura} onChange={(e) => setUnidadAltura(e.target.value as "cm" | "m" | "ft")} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}>
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleCalculateIMC}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0891b2",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Calcular IMC
              </button>
            </div>

            {imc && categoryInfo && (
              <div style={{ background: categoryInfo.bg, borderRadius: "12px", padding: "30px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", borderLeft: `4px solid ${categoryInfo.color}` }}>
                <div style={{ fontSize: "13px", color: categoryInfo.color, fontWeight: 600, marginBottom: "10px" }}>Tu IMC</div>
                <div style={{ fontSize: "56px", fontWeight: 700, color: categoryInfo.color, lineHeight: 1 }}>{imc}</div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: categoryInfo.color, marginTop: "15px", marginBottom: "20px" }}>{categoria}</div>
                <div style={{ fontSize: "12px", color: categoryInfo.color, opacity: 0.8 }}>
                  Basado en peso y altura
                </div>
              </div>
            )}
          </div>

          {imc && categoryInfo && (
            <>
              <div style={{ background: "#f0f9ff", borderRadius: "12px", padding: "20px", marginBottom: "30px", borderLeft: "4px solid #0891b2" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Info size={20} color="#0891b2" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: "0 0 10px 0", color: "#1e40af", fontWeight: 600 }}>Recomendaciones</h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e40af", fontSize: "14px" }}>
                      {getRecommendations(imc, edad).map((rec, idx) => (
                        <li key={idx} style={{ marginBottom: "6px" }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div style={{ background: "#f3f4f6", borderRadius: "12px", padding: "20px", marginBottom: "30px" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#1f2937", fontWeight: 600 }}>Escala de IMC</h4>
                <div style={{ display: "flex", gap: "8px", height: "30px", borderRadius: "6px", overflow: "hidden" }}>
                  {[
                    { label: "Bajo", color: "#3b82f6", range: "<18.5" },
                    { label: "Normal", color: "#10b981", range: "18.5-24.9" },
                    { label: "Sobre", color: "#f59e0b", range: "25-29.9" },
                    { label: "Obesidad", color: "#ef4444", range: "≥30" }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        background: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: 600,
                        opacity: categoryInfo.text.includes(item.label) ? 1 : 0.4
                      }}
                    >
                      {item.range}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {history.length > 0 && (
            <div>
              <h3 style={{ color: "#1f2937", marginBottom: "15px", fontWeight: 600 }}>Historial de cálculos</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#1f2937" }}>Fecha</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#1f2937" }}>Peso (kg)</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#1f2937" }}>Altura (cm)</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#1f2937" }}>IMC</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#1f2937" }}>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px", color: "#6b7280" }}>{record.date}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{record.peso.toFixed(1)}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{record.altura.toFixed(1)}</td>
                        <td style={{ padding: "12px", color: "#1f2937", fontWeight: 600 }}>{record.imc}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{record.categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          main {
            padding: 1.5rem 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .input-group {
            grid-template-columns: 1fr;
          }

          table {
            font-size: 0.85rem;
          }

          th, td {
            padding: 0.8rem !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 1rem;
          }

          h2 {
            font-size: 1.3rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          input, select {
            padding: 0.6rem;
            font-size: 0.85rem;
          }

          button {
            padding: 0.7rem 1rem;
            font-size: 0.85rem;
            width: 100%;
          }

          table {
            font-size: 0.75rem;
            width: 100%;
            overflow-x: auto;
          }

          th, td {
            padding: 0.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}
