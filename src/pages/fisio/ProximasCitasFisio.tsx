import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/responsive.css";

interface CitaRequest {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;
  hora: string;
  tipoConsulta: "Evaluación" | "Seguimiento" | "Rehabilitación" | "Control" | "Descarga Muscular" | "Otro";
  notas?: string;
  status: "Solicitada" | "Aceptada" | "Rechazada";
  fisioId: string;
  createdAt?: string;
}

const ProximasCitasFisio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citasProximas, setCitasProximas] = useState<CitaRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: "#4fc3dc",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    text: "#1e293b",
    textLight: "#64748b",
    cardBg: "#ffffff",
    lightBg: "#f0f9ff",
    border: "#bfdbfe"
  };

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "citaRequests"),
      where("fisioId", "==", user.uid),
      where("status", "==", "Aceptada")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const citas = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as CitaRequest))
        .filter((c) => c.fecha >= today)
        .sort((a, b) => {
          const dateCompare = a.fecha.localeCompare(b.fecha);
          if (dateCompare !== 0) return dateCompare;
          return a.hora.localeCompare(b.hora);
        });

      setCitasProximas(citas);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0", color: colors.text, fontSize: "2.5rem", fontWeight: "900" }}>🗓️ Próximas Citas</h1>
            <p style={{ margin: 0, color: colors.textLight, fontSize: "1rem" }}>Tus citas confirmadas</p>
          </div>
          <button
            onClick={() => {
              // Intenta ir atrás, si no hay historial va al dashboard
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate("/dashboard/fisio");
              }
            }}
            style={{
              padding: "0.8rem 1.5rem",
              background: colors.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem"
            }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
        </div>

        {/* Citas List */}
        {!loading && citasProximas.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {citasProximas.map((cita) => (
              <div
                key={cita.id}
                onClick={() => navigate(`/citas/detalles/${cita.id}`)}
                style={{
                  background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.lightBg} 100%)`,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: `2px solid ${colors.success}50`,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Barra izquierda */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5px", background: colors.success }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start" }}>
                  {/* Información */}
                  <div>
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                        <div style={{ background: colors.success + "30", padding: "0.8rem", borderRadius: "8px", fontSize: "1.5rem" }}>👤</div>
                        <div>
                          <h3 style={{ margin: "0 0 0.2rem 0", color: colors.text, fontSize: "1.1rem", fontWeight: "900" }}>Paciente - {cita.pacienteNombre}</h3>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textLight }}>{cita.tipoConsulta}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                      <div>
                        <p style={{ margin: "0 0 0.3rem 0", color: colors.textLight, fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>📅 Fecha</p>
                        <p style={{ margin: 0, color: colors.text, fontWeight: "900", fontSize: "1.1rem" }}>
                          {new Date(cita.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 0.3rem 0", color: colors.textLight, fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>🕐 Hora</p>
                        <p style={{ margin: 0, color: colors.text, fontWeight: "900", fontSize: "1.1rem" }}>{cita.hora}</p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 0.3rem 0", color: colors.textLight, fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>📋 Tipo</p>
                        <p style={{ margin: 0, color: colors.text, fontWeight: "900", fontSize: "0.95rem" }}>{cita.tipoConsulta}</p>
                      </div>
                    </div>

                    {/* Notas */}
                    {cita.notas && (
                      <div style={{ padding: "1rem", background: colors.lightBg, borderRadius: "8px", borderLeft: `4px solid ${colors.primary}`, marginBottom: "1rem" }}>
                        <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>📝 Notas</p>
                        <p style={{ margin: 0, color: colors.text, fontSize: "0.95rem", lineHeight: "1.5" }}>{cita.notas}</p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ padding: "0.5rem 1rem", background: colors.success + "20", color: colors.success, borderRadius: "6px", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <CheckCircle2 size={16} /> Confirmada
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", background: colors.lightBg, borderRadius: "12px", border: `2px dashed ${colors.border}` }}>
            <p style={{ margin: 0, color: colors.textLight, fontSize: "1rem" }}>✅ No tienes citas próximas</p>
          </div>
        ) : (
          <div style={{ padding: "3rem 2rem", textAlign: "center", background: colors.lightBg, borderRadius: "12px" }}>
            <p style={{ margin: 0, color: colors.textLight, fontSize: "1rem" }}>Cargando...</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          main {
            padding: 1.5rem 1rem;
          }

          .citas-grid {
            grid-template-columns: 1fr;
          }

          .cita-card {
            flex-direction: column;
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

          .cita-card {
            padding: 1rem;
          }

          p {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProximasCitasFisio;
