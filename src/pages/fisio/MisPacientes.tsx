import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft, Search, Mail, Phone, Calendar, CheckCircle2 } from "lucide-react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../auth/firebaseConfig";
import { useAuth } from "../../auth/useAuth";
import "../../styles/dashboard.css";
import "../../styles/responsive.css";

interface Paciente {
  id: string;
  nombre: string;
  email: string;
  edad: number;
  telefono: string;
  createdAt: Date;
}

export default function MisPacientes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const invitationsRef = collection(db, "invitations");
    const invQuery = query(
      invitationsRef,
      where("fisioId", "==", user.uid),
      where("registered", "==", true)
    );

    const unsubscribe = onSnapshot(
      invQuery,
      async (snapshot) => {
        const registeredEmails = snapshot.docs.map((doc) => doc.data().email);

        if (registeredEmails.length === 0) {
          setPacientes([]);
          setLoading(false);
          return;
        }

        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, where("role", "==", "paciente"));
        const querySnapshot = await getDocs(usersQuery);

        const pacientesList: Paciente[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (registeredEmails.includes(data.email)) {
            pacientesList.push({
              id: doc.id,
              nombre: data.nombre || "",
              email: data.email || "",
              edad: data.edad || 0,
              telefono: data.telefono || "",
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            });
          }
        });

        setPacientes(pacientesList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching pacientes:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredPacientes = pacientes.filter((paciente) => {
    return (
      paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="patients-page">
      <button onClick={() => navigate("/dashboard/fisio")} className="back-button">
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="patients-container">
        {/* Header */}
        <div className="patients-header">
          <div>
            <h1>Mis Pacientes</h1>
            <p>Gestiona y visualiza toda la información de tus pacientes registrados</p>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <Users size={24} />
              <div>
                <div className="stat-number">{pacientes.length}</div>
                <div className="stat-label">Pacientes Activos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="patients-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Pacientes */}
        <div className="patients-list">
          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Cargando pacientes...</p>
            </div>
          ) : filteredPacientes.length === 0 && searchTerm ? (
            <div className="empty-state-large">
              <Search size={64} />
              <h2>No se encontraron resultados</h2>
              <p>Intenta con otro término de búsqueda</p>
            </div>
          ) : filteredPacientes.length === 0 ? (
            <div className="empty-state-large">
              <Users size={64} />
              <h2>No hay pacientes registrados</h2>
              <p>Invita a tus primeros pacientes para que se registren en FisioVida</p>
              <button 
                onClick={() => navigate("/invitar/paciente")}
                className="btn-primary"
              >
                Invitar Paciente
              </button>
            </div>
          ) : (
            <>
              <div className="patients-grid">
                {filteredPacientes.map((paciente) => (
                  <div key={paciente.id} className="patient-card">
                    <div className="patient-header">
                      <div className="patient-avatar">
                        {paciente.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-basic">
                        <h3>{paciente.nombre}</h3>
                        <span className="patient-status-badge">
                          <CheckCircle2 size={14} />
                          Activo
                        </span>
                      </div>
                    </div>

                    <div className="patient-info">
                      <div className="info-item">
                        <Mail size={16} />
                        <div>
                          <label>Email</label>
                          <p>{paciente.email}</p>
                        </div>
                      </div>

                      {paciente.edad > 0 && (
                        <div className="info-item">
                          <Users size={16} />
                          <div>
                            <label>Edad</label>
                            <p>{paciente.edad} años</p>
                          </div>
                        </div>
                      )}

                      {paciente.telefono && (
                        <div className="info-item">
                          <Phone size={16} />
                          <div>
                            <label>Teléfono</label>
                            <p>{paciente.telefono}</p>
                          </div>
                        </div>
                      )}

                      <div className="info-item">
                        <Calendar size={16} />
                        <div>
                          <label>Registrado</label>
                          <p>{paciente.createdAt.toLocaleDateString("es-MX")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="patient-actions">
                      <button 
                        onClick={() => navigate(`/fisio/paciente/${paciente.id}`)}
                        className="action-btn primary-btn"
                      >
                        Ver Detalles
                      </button>
                      <button className="action-btn secondary-btn">
                        Contactar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="results-info">
                Mostrando <strong>{filteredPacientes.length}</strong> de <strong>{pacientes.length}</strong> pacientes
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .patients-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 20px;
        }

        .patients-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .patients-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 20px;
        }

        .patients-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .patients-header p {
          color: #6b7280;
          margin: 5px 0 0 0;
          font-size: 14px;
        }

        .header-stats {
          display: flex;
          gap: 20px;
        }

        .stat-box {
          background: white;
          padding: 20px 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .stat-box svg {
          color: #0891b2;
          flex-shrink: 0;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .patients-toolbar {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          background: white;
          padding: 15px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f9fafb;
          padding: 10px 15px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .search-box svg {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
          color: #1f2937;
        }

        .search-box input::placeholder {
          color: #9ca3af;
        }

        .patients-list {
          margin-top: 30px;
        }

        .loading-state {
          background: white;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .loading-state .spinner {
          display: block;
          margin: 0 auto 20px;
        }

        .empty-state-large {
          background: white;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .empty-state-large svg {
          color: #d1d5db;
          margin: 0 auto 20px;
        }

        .empty-state-large h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 10px 0;
        }

        .empty-state-large p {
          color: #6b7280;
          margin: 0 0 30px 0;
        }

        .empty-state-large .btn-primary {
          display: inline-flex;
        }

        .patients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .patient-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .patient-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: #cffafe;
        }

        .patient-header {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .patient-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0891b2, #06b6d4);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .patient-basic {
          flex: 1;
        }

        .patient-basic h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 5px 0;
        }

        .patient-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .patient-status-badge svg {
          color: #16a34a;
        }

        .patient-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .info-item svg {
          color: #0891b2;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-item label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .info-item p {
          font-size: 13px;
          color: #1f2937;
          margin: 0;
          word-break: break-word;
        }

        .patient-actions {
          display: flex;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid #f3f4f6;
        }

        .action-btn {
          flex: 1;
          padding: 10px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.primary-btn {
          background: linear-gradient(135deg, #0891b2, #06b6d4);
          color: white;
        }

        .action-btn.primary-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .action-btn.secondary-btn {
          background: #f3f4f6;
          color: #1f2937;
          border: 1px solid #d1d5db;
        }

        .action-btn.secondary-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .results-info {
          text-align: center;
          color: #6b7280;
          font-size: 13px;
          margin-top: 20px;
        }

        .results-info strong {
          color: #1f2937;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .patients-header {
            flex-direction: column;
            text-align: center;
          }

          .patients-header h1 {
            font-size: 24px;
          }

          .header-stats {
            justify-content: center;
          }

          .patients-toolbar {
            flex-direction: column;
            gap: 1rem;
          }

          .patients-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .search-input {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .patients-header h1 {
            font-size: 1.4rem;
          }

          .patients-toolbar {
            flex-direction: column;
            gap: 0.8rem;
          }

          .patients-grid {
            grid-template-columns: 1fr;
          }

          .patient-card {
            padding: 1rem;
          }

          .action-btn {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
