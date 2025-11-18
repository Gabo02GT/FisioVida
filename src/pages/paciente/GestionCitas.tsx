import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { ADMIN_FISIO_UID } from "../../auth/firebaseConfig";
import { collection, getDocs, doc, setDoc, query, where, onSnapshot } from "firebase/firestore";
import { Plus, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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

const GestionCitas: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citaRequests, setCitaRequests] = useState<CitaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fisioId, setFisioId] = useState<string>("");
  const [pacienteName, setPacienteName] = useState<string>("");

  const [newRequest, setNewRequest] = useState({
    fecha: "",
    hora: "",
    tipoConsulta: "Seguimiento" as "Evaluación" | "Seguimiento" | "Rehabilitación" | "Control" | "Descarga Muscular" | "Otro",
    notas: ""
  });

  const colors = {
    primary: "#4fc3dc",
    secondary: "#5dd889",
    lightBg: "#f0f9ff",
    text: "#1e293b",
    textLight: "#64748b",
    border: "#bfdbfe",
    cardBg: "#ffffff",
    warning: "#f59e0b",
    danger: "#ef4444",
    success: "#10b981"
  };

  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        // Obtener nombre del paciente desde invitations usando su userId
        const invitationsRef = collection(db, "invitations");
        const pacienteQuery = query(invitationsRef, where("registeredUserId", "==", user.uid));
        const pacienteSnapshot = await getDocs(pacienteQuery);
        
        if (pacienteSnapshot.size > 0) {
          const pacienteData = pacienteSnapshot.docs[0].data();
          setPacienteName(pacienteData.nombre || user.displayName || "Paciente");
          console.log("✓ Nombre del paciente cargado:", pacienteData.nombre);
        } else {
          setPacienteName(user.displayName || "Paciente");
          console.log("⚠️ No se encontró paciente en invitations, usando displayName");
        }

        let assignedFisioId = ADMIN_FISIO_UID;
        
        if (!assignedFisioId) {
          const usersRef = collection(db, "users");
          const fisioQuery = query(usersRef, where("role", "==", "fisio"));
          const fisioSnapshot = await getDocs(fisioQuery);
          
          if (fisioSnapshot.size > 0) {
            assignedFisioId = fisioSnapshot.docs[0].id;
          } else {
            console.error("No se encontró fisioterapeuta");
            setLoading(false);
            return;
          }
        }

        setFisioId(assignedFisioId);

        const requestsRef = collection(db, "citaRequests");
        const requestsQuery = query(requestsRef, where("pacienteId", "==", user.uid));
        unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
          const requests: CitaRequest[] = [];
          snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() } as CitaRequest);
          });
          console.log(`✓ Mis citas actualizadas: ${requests.length}`);
          setCitaRequests(requests);
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const getDateAvailability = (fecha: string) => {
    const count = citaRequests.filter(r => r.fecha === fecha && r.status === "Aceptada").length;
    if (count >= 8) return { color: "#ef4444", label: "Lleno", bgColor: "#fecaca" };
    if (count > 0) return { color: "#f59e0b", label: "Parcial", bgColor: "#fef3c7" };
    return { color: "#10b981", label: "Disponible", bgColor: "#dcfce7" };
  };

  const getAvailableHours = () => {
    const hours = [];
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    const occupied = new Set<string>();
    citaRequests.forEach(r => {
      if (r.fecha === newRequest.fecha && r.status === "Aceptada") {
        occupied.add(r.hora);
      }
    });

    for (let h = 8; h < 18; h++) {
      if (newRequest.fecha === today && h <= currentHour) continue;
      const time = `${String(h).padStart(2, '0')}:00`;
      if (!occupied.has(time)) hours.push(time);
    }
    return hours;
  };

  const requestAppointment = async () => {
    if (!fisioId || !newRequest.fecha || !newRequest.hora) {
      alert("Completa todos los campos");
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    if (newRequest.fecha < now) {
      alert("No puedes solicitar citas en el pasado");
      return;
    }

    if (newRequest.fecha === now) {
      const currentHour = new Date().getHours();
      const requestedHour = parseInt(newRequest.hora.split(':')[0]);
      if (requestedHour <= currentHour) {
        alert("La hora ya pasó");
        return;
      }
    }

    try {
      setSaving(true);

      const cita: CitaRequest = {
        id: Date.now().toString(),
        pacienteId: user!.uid,
        pacienteNombre: pacienteName || user?.displayName || "Paciente",
        fecha: newRequest.fecha,
        hora: newRequest.hora,
        tipoConsulta: newRequest.tipoConsulta,
        notas: newRequest.notas,
        status: "Solicitada",
        fisioId: fisioId,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "citaRequests", cita.id), cita);
      console.log("✓ Solicitud enviada:", { id: cita.id, fisioId, fecha: cita.fecha, hora: cita.hora });
      
      setNewRequest({ fecha: "", hora: "", tipoConsulta: "Seguimiento", notas: "" });
      setShowForm(false);
      alert("✓ Solicitud enviada al fisioterapeuta");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar solicitud");
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...citaRequests].sort((a, b) => 
    new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: colors.lightBg }}>
        <div style={{ fontSize: "1.2rem", color: colors.textLight }}>Cargando...</div>
      </div>
    );
  }

  const solicitadas = citaRequests.filter(c => c.status === "Solicitada").length;
  const aceptadas = citaRequests.filter(c => c.status === "Aceptada").length;
  const rechazadas = citaRequests.filter(c => c.status === "Rechazada").length;

  return (
    <div style={{ background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, minHeight: "100vh", padding: "2rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header con botón de regreso */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0", color: colors.text, fontSize: "2.5rem", fontWeight: "900" }}>📅 Mis Citas</h1>
            <p style={{ margin: 0, color: colors.textLight, fontSize: "1rem" }}>Solicita y gestiona tus citas con el fisioterapeuta</p>
          </div>
          <button
            onClick={() => {
              // Intenta ir atrás, si no hay historial va al dashboard
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate("/dashboard/paciente");
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

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ background: colors.cardBg, padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.warning}50` }}>
            <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.9rem", fontWeight: "700" }}>⏳ Pendientes</p>
            <p style={{ margin: 0, color: colors.warning, fontSize: "2rem", fontWeight: "900" }}>{solicitadas}</p>
          </div>

          <div style={{ background: colors.cardBg, padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.success}50` }}>
            <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.9rem", fontWeight: "700" }}>✓ Confirmadas</p>
            <p style={{ margin: 0, color: colors.success, fontSize: "2rem", fontWeight: "900" }}>{aceptadas}</p>
          </div>

          <div style={{ background: colors.cardBg, padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.danger}50` }}>
            <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.9rem", fontWeight: "700" }}>✕ Rechazadas</p>
            <p style={{ margin: 0, color: colors.danger, fontSize: "2rem", fontWeight: "900" }}>{rechazadas}</p>
          </div>
        </div>

        {/* Solicitar Cita */}
        <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.5rem", marginBottom: "2.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.border}` }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "0.8rem 1.2rem",
              background: colors.secondary,
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
            <Plus size={18} /> {showForm ? "Cerrar" : "Solicitar Cita"}
          </button>

          {showForm && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: `2px solid ${colors.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Tipo de Consulta</label>
                  <select
                    value={newRequest.tipoConsulta}
                    onChange={(e) => setNewRequest({...newRequest, tipoConsulta: e.target.value as any})}
                    style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem" }}
                  >
                    <option>Evaluación</option>
                    <option>Seguimiento</option>
                    <option>Rehabilitación</option>
                    <option>Control</option>
                    <option>Descarga Muscular</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Fecha *</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="date"
                      value={newRequest.fecha}
                      onChange={(e) => setNewRequest({...newRequest, fecha: e.target.value, hora: ""})}
                      style={{ flex: 1, padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem" }}
                    />
                    {newRequest.fecha && (
                      <div style={{ padding: "0.8rem", borderRadius: "8px", backgroundColor: getDateAvailability(newRequest.fecha).bgColor, border: `2px solid ${getDateAvailability(newRequest.fecha).color}`, color: getDateAvailability(newRequest.fecha).color, fontWeight: "700", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {getDateAvailability(newRequest.fecha).label}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Hora *</label>
                  <select
                    value={newRequest.hora}
                    onChange={(e) => setNewRequest({...newRequest, hora: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem" }}
                  >
                    <option value="">Hora...</option>
                    {getAvailableHours().map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Notas (opcional)</label>
                <textarea
                  value={newRequest.notas}
                  onChange={(e) => setNewRequest({...newRequest, notas: e.target.value})}
                  placeholder="Cuéntale al fisio por qué necesitas esta cita..."
                  style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem", minHeight: "70px", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              <button
                onClick={requestAppointment}
                disabled={saving}
                style={{
                  padding: "0.8rem 1.2rem",
                  background: colors.success,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </div>
          )}
        </div>

        {/* Citas */}
        <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.border}` }}>
          <h2 style={{ margin: "0 0 1.5rem 0", color: colors.text, fontSize: "1.4rem", fontWeight: "900" }}>📋 Mis Solicitudes ({citaRequests.length})</h2>

          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 2rem", background: `${colors.primary}15`, borderRadius: "12px", border: `2px dashed ${colors.border}` }}>
              <p style={{ fontSize: "1.1rem", color: colors.text, fontWeight: "700", margin: "0 0 0.5rem 0" }}>📅 No tienes citas registradas</p>
              <p style={{ fontSize: "0.95rem", color: colors.textLight, margin: 0 }}>¡Solicita tu primera cita!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {sorted.map(cita => (
                <div
                  key={cita.id}
                  style={{
                    background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.lightBg} 100%)`,
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: `2px solid ${cita.status === "Solicitada" ? colors.warning + "50" : cita.status === "Aceptada" ? colors.success + "50" : colors.danger + "50"}`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Barra izquierda */}
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5px", background: cita.status === "Solicitada" ? colors.warning : cita.status === "Aceptada" ? colors.success : colors.danger }} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start" }}>
                    {/* Información de la cita */}
                    <div>
                      {/* Tipo y estado */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                        <div style={{ background: colors.primary + "30", padding: "0.8rem", borderRadius: "8px", fontSize: "1.5rem" }}>🏥</div>
                        <div>
                          <h3 style={{ margin: "0 0 0.2rem 0", color: colors.text, fontSize: "1.1rem", fontWeight: "900" }}>{cita.tipoConsulta}</h3>
                          <span style={{ display: "inline-block", background: cita.status === "Solicitada" ? colors.warning + "30" : cita.status === "Aceptada" ? colors.success + "30" : colors.danger + "30", color: cita.status === "Solicitada" ? colors.warning : cita.status === "Aceptada" ? colors.success : colors.danger, padding: "0.3rem 0.8rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                            {cita.status === "Solicitada" && "⏳ Pendiente de Respuesta"}
                            {cita.status === "Aceptada" && "✓ Confirmada"}
                            {cita.status === "Rechazada" && "✕ Rechazada"}
                          </span>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "1rem", padding: "1rem", background: colors.lightBg, borderRadius: "10px", marginBottom: "1rem" }}>
                        <div>
                          <p style={{ margin: "0 0 0.3rem 0", color: colors.textLight, fontSize: "0.8rem", fontWeight: "700" }}>📅 FECHA</p>
                          <p style={{ margin: 0, color: colors.text, fontSize: "1rem", fontWeight: "900" }}>
                            {new Date(cita.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: "0 0 0.3rem 0", color: colors.textLight, fontSize: "0.8rem", fontWeight: "700" }}>🕐 HORA</p>
                          <p style={{ margin: 0, color: colors.text, fontSize: "1rem", fontWeight: "900" }}>{cita.hora}</p>
                        </div>
                      </div>

                      {/* Notas */}
                      {cita.notas && (
                        <div style={{ padding: "0.8rem", background: colors.primary + "10", borderRadius: "8px", borderLeft: `4px solid ${colors.primary}` }}>
                          <p style={{ margin: "0 0 0.3rem 0", color: colors.text, fontSize: "0.8rem", fontWeight: "700" }}>💬 TU SOLICITUD</p>
                          <p style={{ margin: 0, color: colors.textLight, fontSize: "0.85rem" }}>{cita.notas}</p>
                        </div>
                      )}

                      {/* Mensajes de estado */}
                      {cita.status === "Aceptada" && (
                        <div style={{ marginTop: "1rem", padding: "0.8rem", background: colors.success + "15", borderRadius: "8px", borderLeft: `4px solid ${colors.success}`, display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                          <CheckCircle size={18} style={{ color: colors.success, marginTop: "0.1rem", flexShrink: 0 }} />
                          <div>
                            <p style={{ margin: 0, color: colors.success, fontSize: "0.85rem", fontWeight: "700" }}>Cita Confirmada</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight, fontSize: "0.8rem" }}>Tu fisioterapeuta confirmó esta cita</p>
                          </div>
                        </div>
                      )}

                      {cita.status === "Rechazada" && (
                        <div style={{ marginTop: "1rem", padding: "0.8rem", background: colors.danger + "15", borderRadius: "8px", borderLeft: `4px solid ${colors.danger}`, display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                          <XCircle size={18} style={{ color: colors.danger, marginTop: "0.1rem", flexShrink: 0 }} />
                          <div>
                            <p style={{ margin: 0, color: colors.danger, fontSize: "0.85rem", fontWeight: "700" }}>Cita Rechazada</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight, fontSize: "0.8rem" }}>El fisioterapeuta no disponía de ese horario. Intenta solicitar otra fecha.</p>
                          </div>
                        </div>
                      )}

                      {cita.status === "Solicitada" && (
                        <div style={{ marginTop: "1rem", padding: "0.8rem", background: colors.warning + "15", borderRadius: "8px", borderLeft: `4px solid ${colors.warning}`, display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                          <AlertCircle size={18} style={{ color: colors.warning, marginTop: "0.1rem", flexShrink: 0 }} />
                          <div>
                            <p style={{ margin: 0, color: colors.warning, fontSize: "0.85rem", fontWeight: "700" }}>Pendiente de Respuesta</p>
                            <p style={{ margin: "0.3rem 0 0 0", color: colors.textLight, fontSize: "0.8rem" }}>Tu fisioterapeuta pronto responderá tu solicitud</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            main {
              padding: 1.5rem 1rem;
            }

            .header-section {
              flex-direction: column;
              gap: 1rem;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .stats-container {
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
            }

            .availability-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.75rem;
            }
          }

          @media (max-width: 480px) {
            main {
              padding: 1rem;
            }

            h2 {
              font-size: 1.4rem;
            }

            h3 {
              font-size: 1.1rem;
            }

            .stats-container {
              grid-template-columns: 1fr;
            }

            .availability-grid {
              grid-template-columns: 1fr;
            }

            button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GestionCitas;
