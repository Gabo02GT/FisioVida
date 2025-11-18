import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function NavbarFisio() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar-fisio">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1 onClick={() => navigate("/dashboard/fisio")} style={{ cursor: "pointer" }}>
            FisioVida - Fisioterapeuta
          </h1>
        </div>

        <div className="navbar-menu">
          <button
            onClick={() => navigate("/mis-pacientes")}
            className="nav-btn"
          >
            👥 Mis Pacientes
          </button>
          <button
            onClick={() => navigate("/dashboard/fisio")}
            className="nav-btn"
          >
            📊 Dashboard
          </button>
          <button onClick={handleLogout} className="nav-btn logout">
            🚪 Logout
          </button>
        </div>
      </div>

      <style>{`
        .navbar-fisio {
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-brand h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .navbar-menu {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nav-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
          transform: translateY(-2px);
        }

        .nav-btn.logout {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        .nav-btn.logout:hover {
          background: rgba(239, 68, 68, 0.5);
        }

        @media (max-width: 768px) {
          .navbar-content {
            flex-direction: column;
            gap: 1rem;
          }

          .navbar-brand h1 {
            font-size: 1.2rem;
          }

          .navbar-menu {
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
          }

          .nav-btn {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </nav>
  );
}
