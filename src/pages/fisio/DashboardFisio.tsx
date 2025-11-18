import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { LogOut, Users, Calendar, Plus, TrendingUp, Clock, CheckCircle2, Clock3, Mail, RefreshCw, ArrowRight, Zap, Brain, Heart } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../auth/firebaseConfig";
import "../../styles/dashboard.css";
import "../../styles/responsive.css";

interface InvitationStats {
  total: number;
  accepted: number;
  pending: number;
}

interface CitaRequest {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;
  hora: string;
  tipoConsulta: string;
  status: "Solicitada" | "Aceptada" | "Rechazada";
}

export default function DashboardFisio() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<InvitationStats>({ total: 0, accepted: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [citasProximas, setCitasProximas] = useState<CitaRequest[]>([]);
  const [citasPendientes, setCitasPendientes] = useState<CitaRequest[]>([]);

  useEffect(() => {
    if (!user) return;

    let unsubscribe1: (() => void) | undefined;
    let unsubscribe2: (() => void) | undefined;

    // Listener para invitaciones
    const invitationsRef = collection(db, "invitations");
    const q = query(invitationsRef, where("fisioId", "==", user.uid));

    unsubscribe1 = onSnapshot(
      q,
      (snapshot) => {
        let accepted = 0;
        let pending = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.registered) {
            accepted++;
          } else {
            pending++;
          }
        });

        setStats({
          total: snapshot.size,
          accepted,
          pending,
        });
      },
      (error) => {
        console.error("Error fetching stats:", error);
      }
    );

    // Listener para citas
    const citasRef = collection(db, "citaRequests");
    const q2 = query(citasRef, where("fisioId", "==", user.uid));

    unsubscribe2 = onSnapshot(
      q2,
      (snapshot) => {
        const citas: CitaRequest[] = [];
        snapshot.forEach((doc) => {
          citas.push({ id: doc.id, ...doc.data() } as CitaRequest);
        });

        // Separar citas pendientes y próximas
        const ahora = new Date();
        const pendientes = citas.filter(c => c.status === "Solicitada").slice(0, 3);
        const proximas = citas.filter(c => c.status === "Aceptada" && new Date(`${c.fecha}T${c.hora}`) >= ahora)
          .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())
          .slice(0, 3);

        setCitasPendientes(pendientes);
        setCitasProximas(proximas);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching citas:", error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe1) unsubscribe1();
      if (unsubscribe2) unsubscribe2();
    };
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0f4f8 100%)", minHeight: "100vh" }}>
      {/* Header Profesional */}
      <nav style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backdropFilter: "blur(10px)",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #4fc3dc 0%, #5dd889 100%)",
            padding: "0.75rem",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Heart size={24} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, color: "white", fontSize: "clamp(1.3rem, 5vw, 1.8rem)", fontWeight: "900" }}>FisioVida</h1>
            <p style={{ margin: "0.3rem 0 0 0", color: "#cbd5e1", fontSize: "clamp(0.7rem, 2vw, 0.85rem)" }}>Plataforma Profesional</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4fc3dc 0%, #5dd889 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "900",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(79, 195, 220, 0.3)"
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, color: "white", fontWeight: "600", fontSize: "0.95rem" }}>Fisioterapeuta</p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#94a3b8", fontSize: "0.8rem" }}>{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              border: "1px solid #fee2e2",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
              transition: "all 0.3s",
              fontSize: "0.9rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        {/* Welcome Section */}
        <div style={{
          marginBottom: "3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "2rem",
          flexWrap: "wrap"
        }}>
          <div>
            <h2 style={{
              fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
              fontWeight: "900",
              color: "#0f172a",
              margin: 0
            }}>
              Bienvenido de nuevo 👋
            </h2>
            <p style={{
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              color: "#64748b",
              margin: "0.8rem 0 0 0",
              maxWidth: "500px"
            }}>
              Aquí está el resumen de tu actividad. Gestiona tus pacientes y mantén el control de tus citas.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: "white",
                color: "#4fc3dc",
                border: "2px solid #4fc3dc",
                padding: "0.8rem 1.5rem",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                transition: "all 0.3s",
                fontSize: "0.95rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#4fc3dc";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#4fc3dc";
              }}
            >
              <RefreshCw size={18} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>

            <Link
              to="/invitar/paciente"
              style={{
                background: "linear-gradient(135deg, #4fc3dc 0%, #5dd889 100%)",
                color: "white",
                border: "none",
                padding: "0.8rem 1.8rem",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                transition: "all 0.3s",
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(79, 195, 220, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(79, 195, 220, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(79, 195, 220, 0.3)";
              }}
            >
              <Plus size={20} />
              Nuevo Paciente
            </Link>
          </div>
        </div>

        {/* Stats Grid - 4 Cards Profesionales */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem"
        }}>
          {/* Card 1: Total Invitaciones */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "2px solid transparent",
            transition: "all 0.3s",
            cursor: "default",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(79, 195, 220, 0.15)";
            e.currentTarget.style.borderColor = "#4fc3dc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "transparent";
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #4fc3dc15 0%, #5dd88915 100%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)"
            }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total de Invitaciones</p>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #4fc3dc 0%, #5dd889 100%)",
                padding: "0.75rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Users size={20} color="white" />
              </div>
            </div>

            <div style={{
              fontSize: "3rem",
              fontWeight: "900",
              color: "#0f172a",
              margin: "1rem 0",
              position: "relative",
              zIndex: 1
            }}>
              {loading ? "-" : stats.total}
            </div>

            <p style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#64748b",
              position: "relative",
              zIndex: 1
            }}>
              Pacientes invitados a la plataforma
            </p>
          </div>

          {/* Card 2: Registrados */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "2px solid transparent",
            transition: "all 0.3s",
            cursor: "default",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(16, 185, 129, 0.15)";
            e.currentTarget.style.borderColor = "#10b981";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "transparent";
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #10b98115 0%, #5dd88915 100%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Registrados</p>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                padding: "0.75rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CheckCircle2 size={20} color="white" />
              </div>
            </div>

            <div style={{
              fontSize: "3rem",
              fontWeight: "900",
              color: "#0f172a",
              margin: "1rem 0",
              position: "relative",
              zIndex: 1
            }}>
              {loading ? "-" : stats.accepted}
            </div>

            <p style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#64748b",
              position: "relative",
              zIndex: 1
            }}>
              Pacientes activos en el sistema
            </p>
          </div>

          {/* Card 3: En Espera */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "2px solid transparent",
            transition: "all 0.3s",
            cursor: "default",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(245, 158, 11, 0.15)";
            e.currentTarget.style.borderColor = "#f59e0b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "transparent";
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #f59e0b15 0%, #fcd34d15 100%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>En Espera</p>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)",
                padding: "0.75rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Clock3 size={20} color="white" />
              </div>
            </div>

            <div style={{
              fontSize: "3rem",
              fontWeight: "900",
              color: "#0f172a",
              margin: "1rem 0",
              position: "relative",
              zIndex: 1
            }}>
              {loading ? "-" : stats.pending}
            </div>

            <p style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#64748b",
              position: "relative",
              zIndex: 1
            }}>
              Pendientes de registro
            </p>
          </div>

          {/* Card 4: Tasa de Activación */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "2px solid transparent",
            transition: "all 0.3s",
            cursor: "default",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(99, 102, 241, 0.15)";
            e.currentTarget.style.borderColor = "#6366f1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "transparent";
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #6366f115 0%, #a78bfa15 100%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tasa de Activación</p>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)",
                padding: "0.75rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <TrendingUp size={20} color="white" />
              </div>
            </div>

            <div style={{
              fontSize: "3rem",
              fontWeight: "900",
              color: "#0f172a",
              margin: "1rem 0",
              position: "relative",
              zIndex: 1
            }}>
              {loading ? "-" : stats.total === 0 ? "0%" : Math.round((stats.accepted / stats.total) * 100) + "%"}
            </div>

            <p style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#64748b",
              position: "relative",
              zIndex: 1
            }}>
              Porcentaje de pacientes activos
            </p>
          </div>
        </div>

        {/* Citas Pendientes Section */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "1.5rem"
          }}>
            <Zap size={24} color="#f59e0b" />
            <h3 style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "900",
              color: "#0f172a"
            }}>
              Solicitudes Pendientes
              <span style={{
                marginLeft: "0.8rem",
                background: "#f59e0b",
                color: "white",
                padding: "0.3rem 0.8rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "700"
              }}>
                {citasPendientes.length}
              </span>
            </h3>
          </div>

          {citasPendientes.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem"
            }}>
              {citasPendientes.map(cita => (
                <div
                  key={cita.id}
                  onClick={() => navigate(`/citas/detalles/${cita.id}`)}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "1.8rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "2px solid #f59e0b",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 15px 40px rgba(245, 158, 11, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    background: "#f59e0b"
                  }} />

                  <div style={{ marginBottom: "1.2rem" }}>
                    <span style={{
                      display: "inline-block",
                      background: "#f59e0b15",
                      color: "#f59e0b",
                      padding: "0.4rem 0.9rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      ⏳ Requiere respuesta
                    </span>
                  </div>

                  <h4 style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1.3rem",
                    fontWeight: "900",
                    color: "#0f172a"
                  }}>
                    {cita.pacienteNombre}
                  </h4>

                  <p style={{
                    margin: "0.8rem 0 0 0",
                    fontSize: "0.9rem",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <span>🏥</span> {cita.tipoConsulta}
                  </p>

                  <div style={{
                    marginTop: "1.2rem",
                    paddingTop: "1.2rem",
                    borderTop: "1px solid #f59e0b15",
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.85rem",
                    color: "#64748b"
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      📅 {new Date(cita.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      🕐 {cita.hora}
                    </span>
                  </div>

                  <div style={{
                    marginTop: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.8rem"
                  }}>
                    <span style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "#4fc3dc"
                    }}>
                      Ver solicitud completa
                    </span>
                    <ArrowRight size={16} color="#4fc3dc" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)",
              borderRadius: "14px",
              padding: "3rem",
              textAlign: "center",
              border: "2px dashed #bfdbfe"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem"
              }}>
                ✨
              </div>
              <p style={{
                color: "#64748b",
                fontSize: "1rem",
                margin: 0,
                fontWeight: "600"
              }}>
                No tienes solicitudes pendientes
              </p>
              <p style={{
                color: "#94a3b8",
                fontSize: "0.9rem",
                margin: "0.5rem 0 0 0"
              }}>
                Todos tus pacientes están al día
              </p>
            </div>
          )}
        </div>

        {/* Próximas Citas Section */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "1.5rem"
          }}>
            <Calendar size={24} color="#10b981" />
            <h3 style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "900",
              color: "#0f172a"
            }}>
              Próximas Citas
              <span style={{
                marginLeft: "0.8rem",
                background: "#10b981",
                color: "white",
                padding: "0.3rem 0.8rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "700"
              }}>
                {citasProximas.length}
              </span>
            </h3>
          </div>

          <Link
            to="/citas/proximas"
            style={{
              display: "block",
              background: "white",
              borderRadius: "14px",
              padding: "2rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "2px solid #10b981",
              textDecoration: "none",
              transition: "all 0.3s",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              background: "#10b981"
            }} />

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                padding: "1rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CheckCircle2 size={32} color="white" />
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: "900",
                  color: "#0f172a"
                }}>
                  Ver Próximas Citas Confirmadas
                </h4>
                <p style={{
                  margin: "0.6rem 0 0 0",
                  color: "#64748b",
                  fontSize: "0.95rem"
                }}>
                  Tienes <strong>{citasProximas.length}</strong> {citasProximas.length === 1 ? "cita" : "citas"} confirmadas. Revisa tu cronograma completo.
                </p>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                color: "#10b981",
                fontWeight: "700"
              }}>
                Acceder
                <ArrowRight size={24} />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "1.5rem"
          }}>
            <Brain size={24} color="#4fc3dc" />
            <h3 style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "900",
              color: "#0f172a"
            }}>
              Acciones Rápidas
            </h3>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: "1.5rem"
          }}>
            {/* Invitar Paciente */}
            <Link
              to="/invitar/paciente"
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.3s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "#4fc3dc";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(79, 195, 220, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={{
                background: "#4fc3dc15",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem"
              }}>
                <Mail size={28} color="#4fc3dc" />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                Invitar Paciente
              </h4>
              <p style={{
                margin: "0.5rem 0 0 0",
                color: "#64748b",
                fontSize: "0.9rem"
              }}>
                Envía invitaciones a nuevos pacientes
              </p>
            </Link>

            {/* Mis Pacientes */}
            <Link
              to="/mis-pacientes"
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.3s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "#10b981";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(16, 185, 129, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={{
                background: "#10b98115",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem"
              }}>
                <Users size={28} color="#10b981" />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                Mis Pacientes
              </h4>
              <p style={{
                margin: "0.5rem 0 0 0",
                color: "#64748b",
                fontSize: "0.9rem"
              }}>
                Gestiona todos tus pacientes registrados
              </p>
            </Link>

            {/* Agendar Sesión */}
            <Link
              to="/citas"
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.3s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "#f59e0b";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(245, 158, 11, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={{
                background: "#f59e0b15",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem"
              }}>
                <Calendar size={28} color="#f59e0b" />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                Agendar Sesión
              </h4>
              <p style={{
                margin: "0.5rem 0 0 0",
                color: "#64748b",
                fontSize: "0.9rem"
              }}>
                Crea nuevas citas y responde solicitudes
              </p>
            </Link>

            {/* Reportes */}
            <Link
              to="/mis-pacientes"
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.3s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(99, 102, 241, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={{
                background: "#6366f115",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem"
              }}>
                <TrendingUp size={28} color="#6366f1" />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                Reportes
              </h4>
              <p style={{
                margin: "0.5rem 0 0 0",
                color: "#64748b",
                fontSize: "0.9rem"
              }}>
                Consulta estadísticas y progresos
              </p>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{
          background: "white",
          borderRadius: "14px",
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "2px solid #f0f9ff"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                marginBottom: "1rem"
              }}>
                <div style={{
                  background: "#4fc3dc15",
                  padding: "0.6rem",
                  borderRadius: "8px"
                }}>
                  <Clock size={20} color="#4fc3dc" />
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "900",
                  color: "#0f172a"
                }}>
                  Validez de Invitaciones
                </h4>
              </div>
              <p style={{
                margin: 0,
                color: "#64748b",
                fontSize: "0.9rem",
                lineHeight: "1.6"
              }}>
                Las invitaciones tienen una validez de 7 días. Después de este período, deberás enviar una nueva invitación.
              </p>
            </div>

            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                marginBottom: "1rem"
              }}>
                <div style={{
                  background: "#10b98115",
                  padding: "0.6rem",
                  borderRadius: "8px"
                }}>
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "900",
                  color: "#0f172a"
                }}>
                  Pacientes Registrados
                </h4>
              </div>
              <p style={{
                margin: 0,
                color: "#64748b",
                fontSize: "0.9rem",
                lineHeight: "1.6"
              }}>
                Tus pacientes registrados tienen acceso completo a todas las herramientas de FisioVida.
              </p>
            </div>

            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                marginBottom: "1rem"
              }}>
                <div style={{
                  background: "#f59e0b15",
                  padding: "0.6rem",
                  borderRadius: "8px"
                }}>
                  <Zap size={20} color="#f59e0b" />
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "900",
                  color: "#0f172a"
                }}>
                  Soporte en Tiempo Real
                </h4>
              </div>
              <p style={{
                margin: 0,
                color: "#64748b",
                fontSize: "0.9rem",
                lineHeight: "1.6"
              }}>
                Recibe notificaciones instantáneas de solicitudes y cambios en tu plataforma.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          main {
            padding: 2rem 1.5rem;
          }
        }

        @media (max-width: 768px) {
          main {
            padding: 1.5rem 1rem;
          }

          nav {
            flex-direction: column;
            padding: 1rem;
            text-align: center;
          }

          .nav-actions {
            width: 100%;
            flex-direction: column;
          }

          .logout-btn {
            width: 100%;
          }

          h1 {
            font-size: 1.5rem;
          }

          h2 {
            font-size: 1.3rem;
          }

          h3 {
            font-size: 1.1rem;
          }

          p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 1rem 0.75rem;
          }

          nav {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          h1 {
            font-size: 1.3rem;
          }

          h2 {
            font-size: 1.2rem;
          }

          h3 {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
