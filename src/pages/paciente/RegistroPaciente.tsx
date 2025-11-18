import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, User, AlertCircle, CheckCircle, Heart } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { auth, db } from "../../auth/firebaseConfig";
import "../../styles/auth.css";

export default function RegistroPaciente() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Validar token en montaje
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError("Token o email inválido. La invitación puede haber expirado.");
        setValidatingToken(false);
        return;
      }

      try {
        // Buscar invitación en Firestore
        const invitationsRef = collection(db, "invitations");
        const q = query(
          invitationsRef,
          where("token", "==", token),
          where("email", "==", email)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError("Invitación no encontrada");
          setValidatingToken(false);
          return;
        }

        const invitation = snapshot.docs[0].data();

        // Verificar si está expirada
        if (invitation.expiresAt && new Date(invitation.expiresAt.toDate()) < new Date()) {
          setError("La invitación ha expirado");
          setValidatingToken(false);
          return;
        }

        // Verificar si ya fue registrada
        if (invitation.registered) {
          setError("Esta invitación ya fue utilizada");
          setValidatingToken(false);
          return;
        }

        setTokenValid(true);
        setValidatingToken(false);
      } catch (err) {
        console.error("Error validando token:", err);
        setError("Error al validar la invitación");
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (formData.nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return false;
    }
    if (!formData.edad) {
      setError("La edad es requerida");
      return false;
    }
    const edadNum = parseInt(formData.edad);
    if (isNaN(edadNum) || edadNum < 1 || edadNum > 150) {
      setError("La edad debe ser un número válido entre 1 y 150");
      return false;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (formData.telefono && !/^[0-9+\-() ]+$/.test(formData.telefono)) {
      setError("El teléfono solo puede contener números, espacios, +, -, y paréntesis");
      return false;
    }
    if (formData.telefono && formData.telefono.replace(/[^0-9]/g, "").length < 7) {
      setError("El teléfono debe contener al menos 7 dígitos");
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
      // Crear cuenta en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email!,
        formData.password
      );

      const userId = userCredential.user.uid;

      // Pequeño delay para asegurar que la autenticación esté establecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Crear documento en Firestore con los datos del paciente
      const userData = {
        email,
        nombre: formData.nombre,
        edad: parseInt(formData.edad),
        telefono: formData.telefono || "",
        role: "paciente",
        sexo: null,
        peso: null,
        altura: null,
        imcHistory: [],
        measurements: [],
        createdAt: new Date(),
      };

      console.log("Creando documento de usuario:", userData);
      await setDoc(doc(db, "users", userId), userData);
      console.log("Documento de usuario creado exitosamente");

      // Marcar invitación como registrada
      try {
        console.log("Buscando invitación con token:", token, "email:", email);
        
        const invitationsRef = collection(db, "invitations");
        const q = query(
          invitationsRef,
          where("token", "==", token),
          where("email", "==", email)
        );
        const snapshot = await getDocs(q);

        console.log("Invitaciones encontradas:", snapshot.size);
        
        if (!snapshot.empty) {
          const invitationId = snapshot.docs[0].id;
          const invitationData = snapshot.docs[0].data();
          console.log("Invitación encontrada:", invitationId, invitationData);
          
          await updateDoc(doc(db, "invitations", invitationId), {
            registered: true,
            registeredUserId: userId,
            registeredAt: new Date(),
          });
          console.log("✅ Invitación marcada como registrada");
        } else {
          console.warn("⚠️ No se encontró invitación con ese token y email");
          // Intentar buscar solo por token
          const q2 = query(invitationsRef, where("token", "==", token));
          const snapshot2 = await getDocs(q2);
          if (!snapshot2.empty) {
            console.log("Encontrada invitación solo por token:", snapshot2.docs[0].id);
            const invId = snapshot2.docs[0].id;
            await updateDoc(doc(db, "invitations", invId), {
              registered: true,
              registeredUserId: userId,
              registeredAt: new Date(),
            });
          }
        }
      } catch (inviteErr) {
        console.error("❌ Error actualizando invitación:", inviteErr);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login/paciente");
      }, 2000);
    } catch (err: any) {
      console.error("Error completo:", err);
      let errorMessage = "Error al crear la cuenta";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "El email no es válido";
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Heart className="logo-icon" size={40} />
            </div>
            <h1 className="auth-title">FisioVida</h1>
            <p className="auth-subtitle">Completar Registro</p>
          </div>
          <div className="loading-spinner"></div>
          <p className="text-center">Validando tu invitación...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo error">
              <AlertCircle className="logo-icon" size={40} />
            </div>
            <h1 className="auth-title">Invitación Inválida</h1>
          </div>
          <div className="invalid-token-message">
            <p>{error}</p>
            <p>Por favor, solicita a tu fisioterapeuta que te envíe una nueva invitación.</p>
            <Link to="/" className="auth-button" style={{ display: "inline-block", marginTop: "20px" }}>
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo success">
              <CheckCircle className="logo-icon" size={40} />
            </div>
            <h1 className="auth-title">¡Bienvenido!</h1>
            <p className="auth-subtitle">Tu cuenta ha sido creada exitosamente</p>
          </div>
          <div className="success-message">
            <p>Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Heart className="logo-icon" size={40} />
          </div>
          <h1 className="auth-title">FisioVida</h1>
          <p className="auth-subtitle">Completa tu Registro</p>
          <p className="auth-email">Se enviará información a: <strong>{email}</strong></p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {/* Nombre Completo */}
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre Completo
            </label>
            <div className="form-input-wrapper">
              <User className="input-icon" size={20} />
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Edad */}
          <div className="form-group">
            <label htmlFor="edad" className="form-label">
              Edad
            </label>
            <input
              id="edad"
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleInputChange}
              placeholder="25"
              className="form-input"
              min="1"
              max="150"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono (Opcional)
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="+57 300 1234567"
              className="form-input"
              pattern="[0-9+\-() ]*"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="form-input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                className="form-input"
                required
              />
            </div>
            <small className="form-hint">Mínimo 6 caracteres</small>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña
            </label>
            <div className="form-input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repite tu contraseña"
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
            {loading ? "Creando cuenta..." : "Completar Registro"}
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
    </div>
  );
}
