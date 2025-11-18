import React, { useState, useEffect } from "react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface IMCRecord {
  date: string;
  imc: number;
  peso: number;
  altura: number;
  categoria: string;
}

interface UserProfile {
  nombre?: string;
  edad: number | null;
  sexo: "masculino" | "femenino" | null;
  peso?: number;
  altura?: number;
}

interface Props {
  pacienteId: string;
}

const CalculadoraCorporalFisio: React.FC<Props> = ({ pacienteId }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    edad: null,
    sexo: null,
  });
  const [imc, setIMC] = useState<number | null>(null);
  const [categoria, setCategoria] = useState("");
  const [history, setHistory] = useState<IMCRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [pacienteId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, "users", pacienteId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          nombre: userData.nombre,
          edad: userData.edad || null,
          sexo: userData.sexo || null,
          peso: userData.peso,
          altura: userData.altura,
        });

        if (userData.imcHistory) {
          setHistory(userData.imcHistory);
        }

        if (userData.peso && userData.altura) {
          const imcValue = userData.peso / (userData.altura * userData.altura);
          setIMC(Math.round(imcValue * 10) / 10);
          setCategoria(getIMCCategory(imcValue).text);
        }
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIMCCategory = (value: number) => {
    if (value < 18.5) return { text: "Bajo peso", color: "#3b82f6", bg: "#dbeafe" };
    if (value < 25) return { text: "Peso normal", color: "#10b981", bg: "#dcfce7" };
    if (value < 30) return { text: "Sobrepeso", color: "#f59e0b", bg: "#fef3c7" };
    if (value < 35) return { text: "Obesidad Clase I", color: "#ef4444", bg: "#fee2e2" };
    if (value < 40) return { text: "Obesidad Clase II", color: "#991b1b", bg: "#fecaca" };
    return { text: "Obesidad Clase III", color: "#7c2d12", bg: "#fed7aa" };
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        Cargando datos del paciente...
      </div>
    );
  }

  const categoryInfo = imc ? getIMCCategory(imc) : null;
  const edad = userProfile.edad;
  const sexo = userProfile.sexo;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937", margin: 0 }}>
            📊 Historial de IMC - {userProfile.nombre}
          </h2>
          <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
            Índice de Masa Corporal
          </p>
        </div>
        {edad && sexo && (
          <div style={{ textAlign: "right", fontSize: "14px", color: "#6b7280" }}>
            <p style={{ margin: 0 }}>
              Edad: <strong>{edad} años</strong>
            </p>
            <p style={{ margin: "5px 0 0 0" }}>
              Sexo:{" "}
              <strong>{sexo === "masculino" ? "Masculino" : "Femenino"}</strong>
            </p>
          </div>
        )}
      </div>

      {/* IMC Actual */}
      {imc && categoryInfo && (
        <div
          style={{
            background: categoryInfo.bg,
            borderRadius: "12px",
            padding: "30px",
            marginBottom: "30px",
            borderLeft: `4px solid ${categoryInfo.color}`,
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "13px",
                color: categoryInfo.color,
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              IMC Actual
            </div>
            <div
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: categoryInfo.color,
                lineHeight: 1,
                marginBottom: "15px",
              }}
            >
              {imc}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: categoryInfo.color,
              }}
            >
              {categoria}
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: "14px", color: categoryInfo.color }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Medidas Actuales</p>
            <p style={{ margin: "8px 0 0 0" }}>
              Peso: <strong>{userProfile.peso?.toFixed(1)} kg</strong>
            </p>
            <p style={{ margin: "5px 0 0 0 " }}>
              Altura: <strong>{userProfile.altura?.toFixed(2)} m</strong>
            </p>
          </div>
        </div>
      )}

      {/* Escala de IMC */}
      {imc && categoryInfo && (
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
      )}

      {/* Historial */}
      {history.length > 0 && (
        <div>
          <h3
            style={{
              color: "#1f2937",
              marginBottom: "15px",
              fontWeight: 600,
            }}
          >
            Historial de mediciones ({history.length})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    Peso (kg)
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    Altura (m)
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    IMC
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    Categoría
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px", color: "#6b7280" }}>
                      {record.date}
                    </td>
                    <td style={{ padding: "12px", color: "#1f2937" }}>
                      {record.peso.toFixed(1)}
                    </td>
                    <td style={{ padding: "12px", color: "#1f2937" }}>
                      {record.altura.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#1f2937",
                        fontWeight: 600,
                      }}
                    >
                      {record.imc}
                    </td>
                    <td style={{ padding: "12px", color: "#1f2937" }}>
                      {record.categoria}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div
          style={{
            background: "#f3f4f6",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <p>No hay historial de mediciones aún.</p>
        </div>
      )}
    </div>
  );
};

export default CalculadoraCorporalFisio;
