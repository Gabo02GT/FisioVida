import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Activity } from "lucide-react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/useAuth";
import type {
  MeasurementComplete,
} from "../../types/measurements";
import {
  MEASUREMENT_LABELS,
} from "../../types/measurements";

export default function SeguimientoMensual() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sexo, setSexo] = useState("hombre");
  const [measurements, setMeasurements] = useState<Partial<MeasurementComplete>>({});
  const [history, setHistory] = useState<MeasurementComplete[]>([]);

  // Cargar sexo y medidas desde Firestore
  useEffect(() => {
    const loadMeasurements = async () => {
      if (!user?.uid) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setSexo(data.sexo?.toLowerCase() || "hombre");
          setHistory(data.measurements || []);
        }
      } catch (err) {
        console.error("Error cargando medidas:", err);
      }
    };

    loadMeasurements();
  }, [user?.uid]);

  const handleMeasurementChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;
    setMeasurements({
      ...measurements,
      [field]: value ? Number(value) : 0,
    });
  };

  const handleSaveMeasurements = async () => {
    if (Object.values(measurements).every((v) => !v || v === 0)) {
      alert("Por favor, ingresa al menos una medida");
      return;
    }

    const date = new Date().toLocaleDateString("es-MX");
    const newRecord: MeasurementComplete = {
      date,
      pecho: measurements.pecho || 0,
      cintura: measurements.cintura || 0,
      cadera: measurements.cadera || 0,
      brazoDerecho: measurements.brazoDerecho || 0,
      brazoIzquierdo: measurements.brazoIzquierdo || 0,
      musloAlto: measurements.musloAlto || 0,
      pantorrilla: measurements.pantorrilla || 0,
    };

    const newHistory = [newRecord, ...history];
    setHistory(newHistory);

    // Guardar en Firestore
    try {
      const userDocRef = doc(db, "users", user!.uid);
      await updateDoc(userDocRef, {
        measurements: newHistory,
      });
      setMeasurements({});
      alert("Medidas guardadas correctamente");
    } catch (err) {
      console.error("Error guardando medidas:", err);
      alert("Error al guardar las medidas");
    }
  };

  // Campos a mostrar (7 medidas clave)
  const fieldsToShow = ["pecho", "cintura", "cadera", "brazoDerecho", "brazoIzquierdo", "musloAlto", "pantorrilla"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/dashboard/paciente")}
          style={{
            display: "flex",
            gap: "8px",
            padding: "10px 16px",
            background: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: "20px",
            color: "#0891b2",
          }}
        >
          <ArrowLeft size={20} /> Volver
        </button>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            <TrendingUp size={32} color="#10b981" />
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Seguimiento Mensual
              </h1>
              <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                Medidas precisas de fitness para monitorear tu progreso real
              </p>
              <p style={{ color: "#10b981", margin: "8px 0 0 0", fontSize: "14px", fontWeight: 600 }}>
                Género: {sexo.charAt(0).toUpperCase() + sexo.slice(1)}
              </p>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              borderRadius: "12px",
              padding: "30px",
              marginBottom: "30px",
              borderLeft: "4px solid #10b981",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                color: "#166534",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              🏋️ Registra tus mediciones
            </h3>
            <p style={{ color: "#166534", margin: "0 0 20px 0", fontSize: "14px" }}>
              Todas las medidas en centímetros (cm). Mide antes del entrenamiento.
            </p>

            <div
              style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px",
                borderLeft: "3px solid #10b981",
              }}
            >
              <p style={{ color: "#166534", margin: "0 0 10px 0", fontSize: "13px", fontWeight: 600 }}>
                📅 ¿Cada cuánto medir?
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#166534", fontSize: "13px" }}>
                <li style={{ marginBottom: "6px" }}>
                  <strong>Cada 2 semanas</strong> si eres principiante
                </li>
                <li style={{ marginBottom: "6px" }}>
                  <strong>Cada 4 semanas</strong> si ya entrenas desde hace tiempo
                </li>
                <li>
                  <strong>Antes del entrenamiento</strong>, no después
                </li>
              </ul>
            </div>

            <p style={{ color: "#166534", margin: "0 0 15px 0", fontSize: "13px", fontStyle: "italic" }}>
              ⏱️ 7 medidas clave que toman 3-4 minutos
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {fieldsToShow.map((field) => {
                const key = field as keyof typeof MEASUREMENT_LABELS;
                const label = MEASUREMENT_LABELS[key];
                return (
                  <div key={field}>
                    <label
                      style={{
                        fontSize: "13px",
                        color: "#166534",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {label.label}
                    </label>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#4d7c0f",
                        margin: "0 0 8px 0",
                        fontStyle: "italic",
                      }}
                    >
                      {label.desc}
                    </p>
                    <input
                      type="number"
                      placeholder="0.0"
                      value={measurements[key as keyof MeasurementComplete] || ""}
                      onChange={(e) => handleMeasurementChange(e, field)}
                      step="0.1"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #86efac",
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveMeasurements}
              style={{
                padding: "12px 32px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Guardar Mediciones
            </button>
          </div>

          {history.length > 0 ? (
            <div>
              <h3
                style={{
                  color: "#1f2937",
                  marginBottom: "15px",
                  fontWeight: 600,
                  fontSize: "18px",
                }}
              >
                📊 Historial de mediciones
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
                    <tr
                      style={{
                        background: "#f3f4f6",
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#1f2937",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Fecha
                      </th>
                      {fieldsToShow.map((field) => (
                        <th
                          key={field}
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#1f2937",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {MEASUREMENT_LABELS[field as keyof typeof MEASUREMENT_LABELS]?.label.split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #e5e7eb" }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {record.date}
                        </td>
                        {fieldsToShow.map((field) => (
                          <td
                            key={field}
                            style={{
                              padding: "12px",
                              color: "#1f2937",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {record[field as keyof MeasurementComplete] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: "30px",
                  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  borderRadius: "12px",
                  padding: "25px",
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px 0",
                    color: "#92400e",
                    fontWeight: 600,
                    fontSize: "16px",
                  }}
                >
                  📸 Fotos de Progreso (Próximamente)
                </h3>
                <p
                  style={{
                    color: "#92400e",
                    margin: "0 0 15px 0",
                    fontSize: "13px",
                  }}
                >
                  Toma fotos cada 2–4 semanas para visualizar tu progreso físico de forma más clara
                </p>
                <div
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      color: "#92400e",
                      margin: "0 0 8px 0",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    📷 Ángulos a capturar:
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      color: "#92400e",
                      fontSize: "13px",
                    }}
                  >
                    <li style={{ marginBottom: "4px" }}>Frontal</li>
                    <li style={{ marginBottom: "4px" }}>Lateral</li>
                    <li>Espalda</li>
                  </ul>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <p
                    style={{
                      color: "#92400e",
                      margin: "0 0 8px 0",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    💡 Tips para consistencia:
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      color: "#92400e",
                      fontSize: "13px",
                    }}
                  >
                    <li style={{ marginBottom: "4px" }}>Misma luz</li>
                    <li style={{ marginBottom: "4px" }}>Misma pose</li>
                    <li>Misma ropa</li>
                  </ul>
                </div>
                <button
                  style={{
                    marginTop: "15px",
                    padding: "10px 24px",
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "not-allowed",
                    fontSize: "13px",
                    opacity: 0.6,
                  }}
                  disabled
                >
                  Subir Fotografías (Próximamente)
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#f3f4f6",
                borderRadius: "12px",
              }}
            >
              <Activity
                size={48}
                style={{
                  margin: "0 auto 15px",
                  opacity: 0.3,
                  color: "#6b7280",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#6b7280",
                }}
              >
                No hay mediciones registradas
              </p>
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "14px",
                  color: "#9ca3af",
                }}
              >
                Comienza a registrar tus mediciones para ver tu progreso
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
