import React, { useState, useEffect } from "react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ArrowLeft, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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

const DetallesCita: React.FC = () => {
  const navigate = useNavigate();
  const { citaId } = useParams<{ citaId: string }>();
  
  const [cita, setCita] = useState<CitaRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState<"delete" | "complete" | null>(null);

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
    if (!citaId) return;
    
    const loadCita = async () => {
      try {
        const citaDoc = await getDoc(doc(db, "citaRequests", citaId));
        if (citaDoc.exists()) {
          setCita({ id: citaDoc.id, ...citaDoc.data() } as CitaRequest);
        }
      } catch (error) {
        console.error("Error cargando cita:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCita();
  }, [citaId]);

  const finalizarCita = async () => {
    if (!citaId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "citaRequests", citaId), {
        status: "Completada",
        completedAt: new Date().toISOString()
      });
      setShowConfirm(null);
      alert("✅ Cita finalizada correctamente");
      navigate(-1);
    } catch (error) {
      console.error("Error finalizando cita:", error);
      alert("❌ Error al finalizar la cita");
    } finally {
      setSaving(false);
    }
  };

  const eliminarCita = async () => {
    if (!citaId) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, "citaRequests", citaId));
      setShowConfirm(null);
      alert("✅ Cita eliminada correctamente");
      navigate(-1);
    } catch (error) {
      console.error("Error eliminando cita:", error);
      alert("❌ Error al eliminar la cita");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.text, fontSize: "1.1rem" }}>Cargando cita...</p>
      </div>
    );
  }

  if (!cita) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, padding: "2rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
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
              marginBottom: "2rem"
            }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
          <div style={{ padding: "2rem", background: colors.cardBg, borderRadius: "12px", textAlign: "center" }}>
            <p style={{ color: colors.textLight, fontSize: "1rem" }}>Cita no encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const citaDate = new Date(cita.fecha);
  const statusColor = cita.status === "Aceptada" ? colors.success : cita.status === "Solicitada" ? colors.warning : colors.danger;
  const statusLabel = cita.status === "Aceptada" ? "Confirmada" : cita.status === "Solicitada" ? "Pendiente" : "Rechazada";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, padding: "2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, color: colors.text, fontSize: "2rem", fontWeight: "900" }}>📋 Detalles de la Cita</h1>
          <button
            onClick={() => {
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
              gap: "0.5rem"
            }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
        </div>

        {/* Main Card */}
        <div style={{
          background: colors.cardBg,
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          {/* Status Badge */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{
              padding: "0.7rem 1.2rem",
              background: statusColor + "20",
              color: statusColor,
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              {cita.status === "Aceptada" && <CheckCircle2 size={18} />}
              {cita.status === "Solicitada" && <Clock size={18} />}
              {cita.status === "Rechazada" && <AlertCircle size={18} />}
              {statusLabel}
            </div>
          </div>

          {/* Paciente Info */}
          <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: `2px solid ${colors.border}` }}>
            <h2 style={{ margin: "0 0 1rem 0", color: colors.text, fontSize: "1.5rem", fontWeight: "900" }}>👤 Paciente</h2>
            <p style={{ margin: "0.5rem 0", color: colors.text, fontSize: "1.1rem", fontWeight: "700" }}>{cita.pacienteNombre}</p>
            <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight, fontSize: "0.95rem" }}>ID: {cita.pacienteId}</p>
          </div>

          {/* Cita Details Grid */}
          <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: `2px solid ${colors.border}` }}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: colors.text, fontSize: "1.3rem", fontWeight: "900" }}>📅 Detalles de la Cita</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>📅 Fecha</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: "900", fontSize: "1.2rem" }}>
                  {citaDate.toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>🕐 Hora</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: "900", fontSize: "1.2rem" }}>{cita.hora}</p>
              </div>

              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>📋 Tipo de Consulta</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: "700", fontSize: "1rem" }}>{cita.tipoConsulta}</p>
              </div>

              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>📝 Estado</p>
                <p style={{ margin: 0, color: statusColor, fontWeight: "700", fontSize: "1rem" }}>{statusLabel}</p>
              </div>
            </div>
          </div>

          {/* Notas */}
          {cita.notas && (
            <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: `2px solid ${colors.border}` }}>
              <h2 style={{ margin: "0 0 1rem 0", color: colors.text, fontSize: "1.3rem", fontWeight: "900" }}>📝 Notas</h2>
              <div style={{
                padding: "1.2rem",
                background: colors.lightBg,
                borderRadius: "8px",
                borderLeft: `4px solid ${colors.primary}`,
                lineHeight: "1.6"
              }}>
                <p style={{ margin: 0, color: colors.text, fontSize: "1rem" }}>{cita.notas}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button
              onClick={() => setShowConfirm("complete")}
              disabled={saving || cita.status !== "Aceptada"}
              style={{
                padding: "1rem",
                background: cita.status === "Aceptada" ? colors.success : colors.textLight + "40",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: cita.status === "Aceptada" ? "pointer" : "not-allowed",
                fontWeight: "700",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: cita.status === "Aceptada" ? 1 : 0.5,
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                if (cita.status === "Aceptada") {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <CheckCircle2 size={20} /> Finalizar Cita
            </button>

            <button
              onClick={() => setShowConfirm("delete")}
              disabled={saving}
              style={{
                padding: "1rem",
                background: colors.danger,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Trash2 size={20} /> Eliminar Cita
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "400px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ margin: "0 0 1rem 0", color: colors.text, fontSize: "1.3rem", fontWeight: "900" }}>
                {showConfirm === "complete" ? "¿Finalizar cita?" : "¿Eliminar cita?"}
              </h3>
              <p style={{ margin: "0 0 2rem 0", color: colors.textLight, fontSize: "0.95rem", lineHeight: "1.5" }}>
                {showConfirm === "complete" 
                  ? "Esta acción marcará la cita como completada."
                  : "Esta acción es irreversible. La cita será eliminada permanentemente."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={saving}
                  style={{
                    padding: "0.8rem 1rem",
                    background: colors.lightBg,
                    color: colors.text,
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "0.95rem"
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={showConfirm === "complete" ? finalizarCita : eliminarCita}
                  disabled={saving}
                  style={{
                    padding: "0.8rem 1rem",
                    background: showConfirm === "complete" ? colors.success : colors.danger,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? "Procesando..." : showConfirm === "complete" ? "Finalizar" : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          main {
            padding: 1.5rem 1rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .header-section {
            flex-direction: column;
            gap: 1rem;
          }

          button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 1rem;
          }

          h2 {
            font-size: 1.3rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .modal-buttons {
            flex-direction: column;
            gap: 0.8rem;
          }

          button {
            padding: 0.8rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DetallesCita;
