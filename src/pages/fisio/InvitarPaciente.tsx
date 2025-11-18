import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, UserPlus, AlertCircle, CheckCircle, Copy, Check, Clock, ArrowLeft } from "lucide-react";
import { collection, doc, setDoc, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../auth/firebaseConfig";
import { useAuth } from "../../auth/useAuth";
import "../../styles/auth.css";
import "../../styles/responsive.css";

interface Invitation {
  id: string;
  nombre: string;
  email: string;
  token: string;
  registered: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export default function InvitarPaciente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombrePaciente: "",
    emailPaciente: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Cargar invitaciones con listener en tiempo real
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user) return;

      try {
        const invitationsRef = collection(db, "invitations");
        const q = query(invitationsRef, where("fisioId", "==", user.uid));
        
        // Usar onSnapshot para escuchar cambios en tiempo real
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const invitationsList: Invitation[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
              expiresAt: doc.data().expiresAt?.toDate ? doc.data().expiresAt.toDate() : new Date(),
            })) as Invitation[];

            setInvitations(invitationsList);
            setLoadingInvitations(false);
          },
          (error) => {
            console.error("Error fetching invitations:", error);
            setLoadingInvitations(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up listener:", error);
        setLoadingInvitations(false);
      }
    };

    fetchInvitations();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nombrePaciente.trim()) {
      setError("El nombre del paciente es requerido");
      return false;
    }
    if (formData.nombrePaciente.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return false;
    }
    if (!formData.emailPaciente) {
      setError("El email del paciente es requerido");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailPaciente)) {
      setError("El email no es válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitationId = doc(collection(db, "invitations")).id;
      await setDoc(doc(db, "invitations", invitationId), {
        fisioId: currentUser.uid,
        nombre: formData.nombrePaciente,
        email: formData.emailPaciente,
        token: token,
        expiresAt: expiresAt,
        registered: false,
        createdAt: new Date(),
      });

      const url = `${window.location.origin}/registro/paciente?token=${token}&email=${encodeURIComponent(formData.emailPaciente)}`;

      setSuccess(true);
      setInvitationUrl(url);
      setFormData({ nombrePaciente: "", emailPaciente: "" });
      setLoading(false);
      // Los datos se actualizarán automáticamente por el listener en tiempo real
    } catch (err) {
      console.error("Error creando invitación:", err);
      setError("Error al crear la invitación");
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // const isExpired = (expiresAt: Date) => new Date() > expiresAt;
  // const daysUntilExpiry = (expiresAt: Date) => {
  //   const days = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  //   return days;
  // };

  return (
    <div className="invite-page">
      <button onClick={() => navigate("/dashboard/fisio")} className="back-button">
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="invite-container">
        {/* Columna izquierda: Formulario */}
        <div className="invite-column invite-form-column">
          <div className="invite-card">
            <div className="invite-header">
              <div className="invite-icon">
                <Mail size={32} />
              </div>
              <h1>Invitar Paciente</h1>
              <p>Crea una invitación para que un nuevo paciente se registre en FisioVida</p>
            </div>

            <form onSubmit={handleSubmit} className="invite-form">
              {error && (
                <div className="form-message error-message">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="form-message success-message">
                  <CheckCircle size={20} />
                  <span>¡Invitación creada exitosamente!</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="nombrePaciente">Nombre del Paciente</label>
                <div className="input-wrapper">
                  <User size={20} />
                  <input
                    type="text"
                    id="nombrePaciente"
                    name="nombrePaciente"
                    value={formData.nombrePaciente}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="emailPaciente">Email del Paciente</label>
                <div className="input-wrapper">
                  <Mail size={20} />
                  <input
                    type="email"
                    id="emailPaciente"
                    name="emailPaciente"
                    value={formData.emailPaciente}
                    onChange={handleInputChange}
                    placeholder="juan@ejemplo.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creando invitación...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Crear Invitación
                  </>
                )}
              </button>
            </form>

            {/* URL de invitación generada */}
            {invitationUrl && (
              <div className="invitation-url-section">
                <div className="invitation-url-box success">
                  <CheckCircle size={24} />
                  <div>
                    <p className="label">URL de Invitación:</p>
                    <div className="url-display">
                      <code>{invitationUrl}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(invitationUrl, "main")}
                        className="copy-button"
                      >
                        {copiedId === "main" ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <small>Esta URL debe enviarse al paciente para que se registre</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Resumen de invitaciones */}
        <div className="invite-column invite-summary-column">
          <div className="invite-card">
            <h2 className="invite-section-title">
              <Mail size={24} />
              Resumen de Invitaciones
            </h2>

            {loadingInvitations ? (
              <div className="loading-placeholder">
                <span className="spinner"></span>
                <p>Cargando invitaciones...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="empty-state">
                <UserPlus size={48} />
                <h3>No hay invitaciones aún</h3>
                <p>Crea la primera invitación</p>
              </div>
            ) : (
              <>
                <div className="invitations-stats">
                  <div className="stat">
                    <strong>{invitations.length}</strong>
                    <span>Total</span>
                  </div>
                  <div className="stat accent-green">
                    <strong>{invitations.filter((i) => i.registered).length}</strong>
                    <span>Registrados</span>
                  </div>
                  <div className="stat accent-orange">
                    <strong>{invitations.filter((i) => !i.registered).length}</strong>
                    <span>En Espera</span>
                  </div>
                </div>

                <div className="invitations-quick-list">
                  {invitations.slice(0, 8).map((invitation) => (
                    <div key={invitation.id} className="invitation-item">
                      <div className="item-info">
                        <div className="item-name">{invitation.nombre}</div>
                        <div className="item-email">{invitation.email}</div>
                      </div>
                      <div className="item-status">
                        {invitation.registered ? (
                          <span className="status-badge registered">
                            <CheckCircle size={14} />
                            Activo
                          </span>
                        ) : (
                          <span className="status-badge pending">
                            <Clock size={14} />
                            Espera
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="copy-link-btn"
                        onClick={() => {
                          const token = invitation.token || invitation.id;
                          const email = invitation.email;
                          const url = `${window.location.origin}/registro/paciente?token=${token}&email=${encodeURIComponent(email)}`;
                          copyToClipboard(url, invitation.id);
                        }}
                        title={copiedId === invitation.id ? "¡Copiado!" : "Copiar enlace"}
                      >
                        {copiedId === invitation.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  ))}
                </div>

                {invitations.length > 8 && (
                  <Link to="/ver-invitaciones" className="view-all-link">
                    Ver todas las invitaciones ({invitations.length})
                    <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Acceso rápido a otras vistas */}
          <div className="invite-card quick-access">
            <h3>Acceso Rápido</h3>
            <Link to="/mis-pacientes" className="quick-link">
              <CheckCircle size={20} />
              <div>
                <strong>Mis Pacientes</strong>
                <p>Ver todos los pacientes registrados</p>
              </div>
              <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .invite-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 20px;
        }

        .invite-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .invite-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .invite-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .invite-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .invite-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .invite-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #0891b2, #06b6d4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 15px;
        }

        .invite-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 10px 0;
        }

        .invite-header p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .invite-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .invite-section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .invitations-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .invitations-stats .stat {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #0891b2;
        }

        .invitations-stats .stat strong {
          display: block;
          font-size: 24px;
          color: #0891b2;
          margin-bottom: 5px;
        }

        .invitations-stats .stat span {
          display: block;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .invitations-stats .stat.accent-green {
          border-left-color: #10b981;
        }

        .invitations-stats .stat.accent-green strong {
          color: #10b981;
        }

        .invitations-stats .stat.accent-orange {
          border-left-color: #f59e0b;
        }

        .invitations-stats .stat.accent-orange strong {
          color: #f59e0b;
        }

        .invitations-quick-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .invitations-quick-list::-webkit-scrollbar {
          width: 6px;
        }

        .invitations-quick-list::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .invitations-quick-list::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .invitation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .invitation-item:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .item-email {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .item-status {
          display: flex;
          gap: 8px;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          margin-top: 15px;
          color: #0891b2;
          text-decoration: none;
          border: 1px solid #cffafe;
          border-radius: 8px;
          background: #ecf9ff;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
        }

        .view-all-link:hover {
          background: #0891b2;
          color: white;
          border-color: #0891b2;
        }

        .quick-access {
          border-top: 2px solid #f0f0f0;
          padding-top: 20px;
        }

        .quick-access h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 15px 0;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: linear-gradient(135deg, #f0f9ff 0%, #ecf9ff 100%);
          border-radius: 8px;
          border: 1px solid #cffafe;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
        }

        .quick-link:hover {
          background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
          color: white;
          border-color: #0891b2;
          transform: translateX(4px);
        }

        .quick-link svg {
          color: #0891b2;
          flex-shrink: 0;
        }

        .quick-link:hover svg {
          color: white;
        }

        .quick-link div {
          flex: 1;
        }

        .quick-link strong {
          display: block;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .quick-link p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .quick-link:hover p {
          color: rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 1024px) {
          .invite-container {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .invite-container {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .invitations-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          input {
            padding: 0.7rem;
            font-size: 0.9rem;
          }

          button {
            padding: 0.8rem 1.2rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .invite-container {
            padding: 1rem;
          }

          .invite-container h1 {
            font-size: 1.4rem;
          }

          .form-group label {
            font-size: 0.85rem;
          }

          input {
            padding: 0.6rem;
            font-size: 0.85rem;
          }

          button {
            padding: 0.7rem 1rem;
            font-size: 0.85rem;
            width: 100%;
          }

          .invitations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
