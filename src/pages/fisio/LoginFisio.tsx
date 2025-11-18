import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Heart, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, ADMIN_FISIO_EMAIL, ADMIN_FISIO_UID } from "../../auth/firebaseConfig";
import "../../styles/auth.css";
import "../../styles/responsive.css";

export default function LoginFisio() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verificar que el email sea el del admin
      if (email !== ADMIN_FISIO_EMAIL) {
        setError("Solo el administrador puede acceder como Fisioterapeuta");
        setLoading(false);
        return;
      }

      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Verificar que el UID coincida
      if (userCredential.user.uid !== ADMIN_FISIO_UID) {
        // Si por algún motivo el UID no coincide, cerrar sesión
        await auth.signOut();
        setError("Acceso denegado. Solo el administrador puede ingresar.");
        setLoading(false);
        return;
      }

      // Login exitoso
      navigate("/dashboard/fisio");
    } catch (err: any) {
      let errorMessage = "Error al iniciar sesión";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header con logo/branding */}
        <div className="auth-header">
          <div className="auth-logo">
            <Heart className="logo-icon" size={40} />
          </div>
          <h1 className="auth-title">FisioVida</h1>
          <p className="auth-subtitle">Portal para Administrador</p>
        </div>

        {/* Admin Only Notice */}
        <div className="info-banner" style={{ backgroundColor: "#fef3c7", borderColor: "#fcd34d", color: "#92400e" }}>
          <AlertCircle size={20} />
          <p>⚠️ Solo el administrador puede acceder a esta sección</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="form-input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="form-input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`auth-button ${loading ? "loading" : ""}`}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <Link to="/" className="back-link">
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Decoración */}
      <div className="auth-decoration top"></div>
      <div className="auth-decoration bottom"></div>

      <style>{`
        @media (max-width: 768px) {
          .auth-container {
            padding: 2rem;
          }

          .auth-box {
            padding: 2rem;
            max-width: 100%;
          }

          .auth-box h1 {
            font-size: 1.6rem;
          }

          .form-group input {
            padding: 0.7rem;
            font-size: 0.95rem;
          }

          .auth-button {
            padding: 0.8rem;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 1rem;
          }

          .auth-box {
            padding: 1.5rem;
            border-radius: 12px;
          }

          .auth-box h1 {
            font-size: 1.4rem;
          }

          .auth-box p {
            font-size: 0.85rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-group input {
            padding: 0.6rem;
            font-size: 0.9rem;
          }

          .auth-button {
            padding: 0.7rem;
            font-size: 0.9rem;
          }

          .back-link {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
