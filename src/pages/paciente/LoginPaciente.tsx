import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Heart } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../auth/firebaseConfig";
import "../../styles/auth.css";

export default function LoginPaciente() {
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
      // Autenticar con Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // El rol se determina automáticamente en useAuth
      // Si no es el admin, será paciente
      navigate("/dashboard/paciente");
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
          <p className="auth-subtitle">Portal para Pacientes</p>
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
                placeholder="tu@email.com"
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
          <p className="footer-text">
            ¿No tienes cuenta?{" "}
            <Link to="/" className="footer-link">
              Vuelve al inicio
            </Link>
          </p>
          <p className="footer-text small">
            Si no tienes cuenta, espera a que tu fisioterapeuta te envíe una invitación
          </p>
        </div>
      </div>

      {/* Decoración */}
      <div className="auth-decoration top"></div>
      <div className="auth-decoration bottom"></div>
    </div>
  );
}
