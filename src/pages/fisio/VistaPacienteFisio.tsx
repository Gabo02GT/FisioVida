import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import NavbarFisio from "../../components/NavbarFisio";
import CalculadoraCorporalFisio from "./CalculadoraCorporalFisio";
import SeguimientoFisio from "./SeguimientoFisio";
import PlanAlimenticioFisio from "./PlanAlimenticioFisio";
import RutinasFisio from "./RutinasFisio";
import ReportesFisio from "./ReportesFisio";
import "./VistaPacienteFisio.css";

interface UserProfile {
  nombre?: string;
  email?: string;
  edad?: number;
  sexo?: string;
  telefono?: string;
  direccion?: string;
}

const VistaPacienteFisio: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paciente, setPaciente] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("perfil");

  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadPaciente = async () => {
      try {
        const docRef = doc(db, "users", pacienteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPaciente(docSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error("Error cargando paciente:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPaciente();
  }, [pacienteId, user]);

  if (loading) {
    return (
      <div className="container-loading">
        <NavbarFisio />
        <div className="loading-spinner">Cargando perfil del paciente...</div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="container-error">
        <NavbarFisio />
        <div className="error-message">Paciente no encontrado</div>
        <button onClick={() => navigate("/mis-pacientes")} className="btn-back">
          Volver a Mis Pacientes
        </button>
      </div>
    );
  }

  return (
    <div className="vista-paciente-fisio">
      <NavbarFisio />
      <div className="container-vistapaciente">
        {/* Header */}
        <div className="paciente-header">
          <div className="paciente-info">
            <h1>{paciente.nombre || "Paciente sin nombre"}</h1>
            <p className="email">{paciente.email}</p>
            <div className="datos-basicos">
              {paciente.edad && <span>👤 Edad: {paciente.edad} años</span>}
              {paciente.sexo && <span>⚥ Sexo: {paciente.sexo}</span>}
              {paciente.telefono && <span>📱 {paciente.telefono}</span>}
            </div>
          </div>
          <button
            onClick={() => navigate("/mis-pacientes")}
            className="btn-back-simple"
          >
            ← Volver
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${selectedSection === "perfil" ? "active" : ""}`}
            onClick={() => setSelectedSection("perfil")}
          >
            📋 Perfil
          </button>
          <button
            className={`tab-btn ${selectedSection === "calculadora" ? "active" : ""}`}
            onClick={() => setSelectedSection("calculadora")}
          >
            ⚖️ Calculadora IMC
          </button>
          <button
            className={`tab-btn ${selectedSection === "mediciones" ? "active" : ""}`}
            onClick={() => setSelectedSection("mediciones")}
          >
            📊 Mediciones
          </button>
          <button
            className={`tab-btn ${selectedSection === "plan" ? "active" : ""}`}
            onClick={() => setSelectedSection("plan")}
          >
            🍎 Plan Alimenticio
          </button>
          <button
            className={`tab-btn ${selectedSection === "rutinas" ? "active" : ""}`}
            onClick={() => setSelectedSection("rutinas")}
          >
            💪 Rutinas
          </button>
          <button
            className={`tab-btn ${selectedSection === "reportes" ? "active" : ""}`}
            onClick={() => setSelectedSection("reportes")}
          >
            📈 Reportes
          </button>
        </div>

        {/* Content Container */}
        <div className="content-section">
          {selectedSection === "perfil" && (
            <div className="section-perfil">
              <h2>Información del Paciente</h2>
              <div className="perfil-grid">
                <div className="perfil-item">
                  <label>Nombre:</label>
                  <p>{paciente.nombre || "No especificado"}</p>
                </div>
                <div className="perfil-item">
                  <label>Email:</label>
                  <p>{paciente.email}</p>
                </div>
                <div className="perfil-item">
                  <label>Edad:</label>
                  <p>{paciente.edad || "No especificado"}</p>
                </div>
                <div className="perfil-item">
                  <label>Sexo:</label>
                  <p>{paciente.sexo || "No especificado"}</p>
                </div>
                <div className="perfil-item">
                  <label>Teléfono:</label>
                  <p>{paciente.telefono || "No especificado"}</p>
                </div>
                <div className="perfil-item">
                  <label>Dirección:</label>
                  <p>{paciente.direccion || "No especificado"}</p>
                </div>
              </div>
            </div>
          )}

          {selectedSection === "calculadora" && (
            <div className="section-content">
              <CalculadoraCorporalFisio pacienteId={pacienteId!} />
            </div>
          )}

          {selectedSection === "mediciones" && (
            <div className="section-content">
              <SeguimientoFisio pacienteId={pacienteId!} />
            </div>
          )}

          {selectedSection === "plan" && (
            <div className="section-content">
              <PlanAlimenticioFisio pacienteId={pacienteId!} />
            </div>
          )}

          {selectedSection === "rutinas" && (
            <div className="section-content">
              <RutinasFisio pacienteId={pacienteId!} />
            </div>
          )}

          {selectedSection === "reportes" && (
            <div className="section-content">
              <ReportesFisio pacienteId={pacienteId!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VistaPacienteFisio;
