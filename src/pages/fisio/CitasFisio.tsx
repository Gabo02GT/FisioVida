import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, setDoc, collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { Plus, Check, X, ArrowLeft, User, Mail, Phone } from "lucide-react";
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

interface Paciente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  condicion?: string;
  fisioId: string;
  [key: string]: any;
}

const CitasFisio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citaRequests, setCitaRequests] = useState<CitaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [requestsTab, setRequestsTab] = useState<"Solicitada" | "Aceptada" | "Rechazada" | "Todas">("Solicitada");
  const [pacientesMap, setPacientesMap] = useState<Map<string, Paciente>>(new Map());

  const [newAppointment, setNewAppointment] = useState({
    pacienteId: "",
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

    const fisioId = user.uid;
    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        // Cargar pacientes desde invitations (donde se guardan)
        const invitationsRef = collection(db, "invitations");
        const invitationsQuery = query(invitationsRef, where("fisioId", "==", fisioId), where("registered", "==", true));
        const invitationsSnapshot = await getDocs(invitationsQuery);
        const pats: Paciente[] = [];
        const pmap = new Map<string, Paciente>();
        
        invitationsSnapshot.forEach(doc => {
          const data = doc.data();
          const pacient: Paciente = {
            id: doc.id,
            nombre: data.nombre || "Sin nombre",
            email: data.email || "",
            telefono: data.telefono || "",
            condicion: data.condicion || "",
            fisioId: data.fisioId,
            ...data
          };
          pats.push(pacient);
          pmap.set(pacient.id, pacient);
        });
        console.log(`✓ Pacientes cargados: ${pats.length}`, pats.map(p => p.nombre));
        setPatients(pats);
        setPacientesMap(pmap);

        const requestsRef = collection(db, "citaRequests");
        const requestsQuery = query(requestsRef, where("fisioId", "==", fisioId));
        unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
          const requests: CitaRequest[] = [];
          snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() } as CitaRequest);
          });
          console.log(`✓ Citas actualizadas: ${requests.length}`);
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

  const addAppointment = async () => {
    if (!newAppointment.pacienteId || !newAppointment.fecha || !newAppointment.hora) {
      alert("Completa todos los campos");
      return;
    }

    // Validar que no haya otra cita confirmada a la misma hora
    const citaEnMismaHora = citaRequests.find(c => 
      c.fecha === newAppointment.fecha && 
      c.hora === newAppointment.hora && 
      c.status === "Aceptada"
    );

    if (citaEnMismaHora) {
      alert("❌ Ya existe una cita confirmada a esa hora el mismo día. Por favor, elige otro horario.");
      return;
    }

    try {
      setSaving(true);
      const paciente = pacientesMap.get(newAppointment.pacienteId);
      
      const cita: CitaRequest = {
        id: Date.now().toString(),
        pacienteId: newAppointment.pacienteId,
        pacienteNombre: paciente?.nombre || "Paciente",
        fecha: newAppointment.fecha,
        hora: newAppointment.hora,
        tipoConsulta: newAppointment.tipoConsulta,
        notas: newAppointment.notas,
        status: "Aceptada",
        fisioId: user!.uid,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "citaRequests", cita.id), cita);
      console.log("✓ Cita creada directamente como aceptada");
      
      setNewAppointment({ pacienteId: "", fecha: "", hora: "", tipoConsulta: "Seguimiento", notas: "" });
      setShowForm(false);
      alert("✓ Cita creada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear cita");
    } finally {
      setSaving(false);
    }
  };

  const acceptCita = async (cita: CitaRequest) => {
    try {
      setSaving(true);
      await setDoc(doc(db, "citaRequests", cita.id), { ...cita, status: "Aceptada" });
      console.log("✓ Cita aceptada");
    } catch (error) {
      console.error("Error aceptando cita:", error);
    } finally {
      setSaving(false);
    }
  };

  const rejectCita = async (cita: CitaRequest) => {
    try {
      setSaving(true);
      await setDoc(doc(db, "citaRequests", cita.id), { ...cita, status: "Rechazada" });
      console.log("✓ Cita rechazada");
    } catch (error) {
      console.error("Error rechazando cita:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: colors.lightBg }}>
        <div style={{ fontSize: "1.2rem", color: colors.textLight }}>Cargando...</div>
      </div>
    );
  }

  const filtered = requestsTab === "Todas" ? citaRequests : citaRequests.filter(c => c.status === requestsTab);
  const sorted = [...filtered].sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());

  const pendingSolicitudes = citaRequests.filter(c => c.status === "Solicitada").length;
  const acceptedSolicitudes = citaRequests.filter(c => c.status === "Aceptada").length;

  return (
    <div style={{ background: `linear-gradient(135deg, ${colors.lightBg} 0%, #e0f2fe 100%)`, minHeight: "100vh", padding: "2rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header con botón de regreso */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0", color: colors.text, fontSize: "2.5rem", fontWeight: "900" }}>📅 Gestión de Citas</h1>
            <p style={{ margin: 0, color: colors.textLight, fontSize: "1rem" }}>Administra las solicitudes de citas de tus pacientes</p>
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

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          <div style={{ background: colors.cardBg, padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.warning}50` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.9rem", fontWeight: "700" }}>⏳ Pendientes</p>
                <p style={{ margin: 0, color: colors.warning, fontSize: "2rem", fontWeight: "900" }}>{pendingSolicitudes}</p>
              </div>
              <div style={{ fontSize: "3rem", opacity: 0.2 }}>📋</div>
            </div>
          </div>

          <div style={{ background: colors.cardBg, padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.success}50` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.9rem", fontWeight: "700" }}>✓ Aceptadas</p>
                <p style={{ margin: 0, color: colors.success, fontSize: "2rem", fontWeight: "900" }}>{acceptedSolicitudes}</p>
              </div>
              <div style={{ fontSize: "3rem", opacity: 0.2 }}>✅</div>
            </div>
          </div>

          <div style={{ background: colors.cardBg, padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.primary}50` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 0.5rem 0", color: colors.textLight, fontSize: "0.9rem", fontWeight: "700" }}>👥 Pacientes</p>
                <p style={{ margin: 0, color: colors.primary, fontSize: "2rem", fontWeight: "900" }}>{patients.length}</p>
              </div>
              <div style={{ fontSize: "3rem", opacity: 0.2 }}>👨‍⚕️</div>
            </div>
          </div>
        </div>

        {/* Crear Cita */}
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
            <Plus size={18} /> {showForm ? "Cerrar" : "Crear Cita"}
          </button>

          {showForm && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: `2px solid ${colors.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Paciente *</label>
                  <select
                    value={newAppointment.pacienteId}
                    onChange={(e) => setNewAppointment({...newAppointment, pacienteId: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem" }}
                  >
                    <option value="">-- Selecciona un paciente --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  {patients.length === 0 && (
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: colors.danger, fontWeight: "700" }}>❌ No tienes pacientes registrados</p>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Tipo de Consulta</label>
                  <select
                    value={newAppointment.tipoConsulta}
                    onChange={(e) => setNewAppointment({...newAppointment, tipoConsulta: e.target.value as any})}
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
                  <input
                    type="date"
                    value={newAppointment.fecha}
                    onChange={(e) => setNewAppointment({...newAppointment, fecha: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Hora *</label>
                  <select
                    value={newAppointment.hora}
                    onChange={(e) => setNewAppointment({...newAppointment, hora: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem" }}
                  >
                    <option value="">Hora...</option>
                    {Array.from({length: 10}, (_, i) => {
                      const h = 8 + i;
                      const time = `${String(h).padStart(2, '0')}:00`;
                      return <option key={time} value={time}>{time}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: colors.text, fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Notas</label>
                <textarea
                  value={newAppointment.notas}
                  onChange={(e) => setNewAppointment({...newAppointment, notas: e.target.value})}
                  placeholder="Notas (opcional)"
                  style={{ width: "100%", padding: "0.8rem", border: `2px solid ${colors.border}`, borderRadius: "8px", fontSize: "0.9rem", minHeight: "70px", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              <button
                onClick={addAppointment}
                disabled={saving || !newAppointment.pacienteId}
                style={{
                  padding: "0.8rem 1.2rem",
                  background: colors.success,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: saving || !newAppointment.pacienteId ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  opacity: saving || !newAppointment.pacienteId ? 0.7 : 1
                }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )}
        </div>

        {/* Citas - Versión Premium */}
        <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `2px solid ${colors.border}` }}>
          <h2 style={{ margin: "0 0 1.5rem 0", color: colors.text, fontSize: "1.4rem", fontWeight: "900" }}>
            📋 Todas las Solicitudes ({citaRequests.length})
          </h2>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {["Solicitada", "Aceptada", "Rechazada", "Todas"].map(status => (
              <button
                key={status}
                onClick={() => setRequestsTab(status as any)}
                style={{
                  padding: "0.7rem 1.2rem",
                  background: requestsTab === status ? (status === "Solicitada" ? colors.warning : status === "Aceptada" ? colors.success : status === "Rechazada" ? colors.danger : colors.primary) : colors.lightBg,
                  color: requestsTab === status ? "white" : colors.text,
                  border: `2px solid ${requestsTab === status ? (status === "Solicitada" ? colors.warning : status === "Aceptada" ? colors.success : status === "Rechazada" ? colors.danger : colors.primary) : colors.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.9rem"
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 2rem", background: `${colors.primary}15`, borderRadius: "12px", border: `2px dashed ${colors.border}` }}>
              <p style={{ fontSize: "1.1rem", color: colors.text, fontWeight: "700", margin: "0 0 0.5rem 0" }}>📅 No hay solicitudes en esta categoría</p>
              <p style={{ fontSize: "0.95rem", color: colors.textLight, margin: 0 }}>Las nuevas solicitudes aparecerán aquí</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {sorted.map(cita => {
                const paciente = pacientesMap.get(cita.pacienteId);
                return (
                  <div
                    key={cita.id}
                    onClick={() => navigate(`/citas/detalles/${cita.id}`)}
                    style={{
                      background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.lightBg} 100%)`,
                      padding: "1.5rem",
                      borderRadius: "12px",
                      border: `2px solid ${cita.status === "Solicitada" ? colors.warning + "50" : cita.status === "Aceptada" ? colors.success + "50" : colors.danger + "50"}`,
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Barra izquierda */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5px", background: cita.status === "Solicitada" ? colors.warning : cita.status === "Aceptada" ? colors.success : colors.danger }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start" }}>
                      {/* Información de la solicitud */}
                      <div>
                        {/* Paciente Info */}
                        <div style={{ marginBottom: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                            <div style={{ background: colors.primary + "30", padding: "0.8rem", borderRadius: "8px", fontSize: "1.5rem" }}>👤</div>
                            <div>
                              <h3 style={{ margin: "0 0 0.2rem 0", color: colors.text, fontSize: "1.1rem", fontWeight: "900" }}>Paciente - {cita.pacienteNombre}</h3>
                              {paciente?.email && (
                                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: colors.textLight, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  <Mail size={14} /> {paciente.email}
                                </p>
                              )}
                              {paciente?.telefono && (
                                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: colors.textLight, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  <Phone size={14} /> {paciente.telefono}
                                </p>
                              )}
                            </div>
                          </div>
                          <span style={{ display: "inline-block", background: cita.status === "Solicitada" ? colors.warning + "30" : cita.status === "Aceptada" ? colors.success + "30" : colors.danger + "30", color: cita.status === "Solicitada" ? colors.warning : cita.status === "Aceptada" ? colors.success : colors.danger, padding: "0.4rem 0.9rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "800" }}>
                            {cita.status === "Solicitada" && "⏳ Pendiente de Respuesta"}
                            {cita.status === "Aceptada" && "✓ Confirmada"}
                            {cita.status === "Rechazada" && "✕ Rechazada"}
                          </span>
                        </div>

                        {/* Detalles de la cita */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", padding: "1rem", background: colors.lightBg, borderRadius: "10px" }}>
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
                          <div>
                            <p style={{ margin: "0 0 0.3rem 0", color: colors.textLight, fontSize: "0.8rem", fontWeight: "700" }}>📋 TIPO</p>
                            <p style={{ margin: 0, color: colors.text, fontSize: "0.9rem", fontWeight: "700" }}>{cita.tipoConsulta}</p>
                          </div>
                        </div>

                        {/* Notas */}
                        {cita.notas && (
                          <div style={{ marginTop: "1rem", padding: "0.8rem", background: colors.primary + "10", borderRadius: "8px", borderLeft: `4px solid ${colors.primary}` }}>
                            <p style={{ margin: "0 0 0.3rem 0", color: colors.text, fontSize: "0.8rem", fontWeight: "700" }}>💬 NOTAS DEL PACIENTE</p>
                            <p style={{ margin: 0, color: colors.textLight, fontSize: "0.85rem" }}>{cita.notas}</p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", minWidth: "150px" }}>
                        {cita.status === "Solicitada" && (
                          <>
                            <button
                              onClick={() => acceptCita(cita)}
                              disabled={saving}
                              style={{
                                padding: "0.7rem 1rem",
                                background: colors.success,
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: saving ? "not-allowed" : "pointer",
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.4rem",
                                opacity: saving ? 0.7 : 1
                              }}
                            >
                              <Check size={16} /> Aceptar
                            </button>
                            <button
                              onClick={() => rejectCita(cita)}
                              disabled={saving}
                              style={{
                                padding: "0.7rem 1rem",
                                background: colors.danger,
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: saving ? "not-allowed" : "pointer",
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.4rem",
                                opacity: saving ? 0.7 : 1
                              }}
                            >
                              <X size={16} /> Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/fisio/paciente/${cita.pacienteId}`)}
                          style={{
                            padding: "0.7rem 1rem",
                            background: colors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem"
                          }}
                        >
                          <User size={16} /> Ver Paciente
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            main {
              padding: 1.5rem 1rem;
            }

            .stats-container {
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .tabs-container {
              flex-wrap: wrap;
            }

            .cita-card {
              padding: 1rem;
            }
          }

          @media (max-width: 480px) {
            main {
              padding: 1rem;
            }

            .stats-container {
              grid-template-columns: 1fr;
            }

            h2 {
              font-size: 1.4rem;
            }

            h3 {
              font-size: 1.1rem;
            }

            .cita-card {
              flex-direction: column;
              gap: 1rem;
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

export default CitasFisio;
