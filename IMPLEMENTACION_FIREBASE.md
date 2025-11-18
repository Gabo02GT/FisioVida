# ✅ Checklist de Implementación - Firebase Integration

Este documento enumera todos los pasos necesarios para completar la integración con Firebase y que el sistema sea completamente funcional.

---

## 🔐 Firebase Authentication Setup

### Paso 1: Habilitar Authentication
```
Firebase Console → Authentication → Sign-in method
- ✅ Email/Password
- (Opcional) Google Sign-In
- (Opcional) GitHub Sign-In
```

### Paso 2: Estructura de Firestore
```
Firestore Database
├── users/ (Colección)
│   └── {userId} (Documento)
│       ├── email: string
│       ├── nombre: string
│       ├── role: "fisio" | "paciente"
│       ├── createdAt: timestamp
│       ├── tipoDocumento: string
│       ├── numeroDocumento: string
│       ├── telefono: string (opcional)
│       └── [Campos adicionales según rol]
│
├── invitations/ (Colección)
│   └── {invitationId} (Documento)
│       ├── fisioId: string
│       ├── token: string (único)
│       ├── email: string
│       ├── nombre: string
│       ├── expiresAt: timestamp
│       ├── registered: boolean
│       ├── registeredUserId: string (cuando se registra)
│       └── createdAt: timestamp
```

---

## 📝 Archivos a Modificar

### 1. `src/auth/useAuth.tsx`

```typescript
import { useState, useEffect, useContext, createContext } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  Auth 
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

interface AuthContextType {
  user: User | null;
  userRole: "fisio" | "paciente" | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"fisio" | "paciente" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Obtener rol desde Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error obteniendo rol:", error);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error al desloguearse:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
```

### 2. `src/pages/fisio/LoginFisio.tsx`

Reemplazar en `handleSubmit`:
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Autenticarse con Firebase
    await signInWithEmailAndPassword(auth, email, password);
    // El cambio de estado lo maneja el useAuth
    navigate("/dashboard/fisio");
  } catch (err: any) {
    const errorMessage = err.code === "auth/user-not-found"
      ? "Usuario no encontrado"
      : err.code === "auth/wrong-password"
      ? "Contraseña incorrecta"
      : "Error al iniciar sesión";
    setError(errorMessage);
    setLoading(false);
  }
};
```

Agregar imports:
```typescript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../auth/firebaseConfig";
```

### 3. `src/pages/paciente/LoginPaciente.tsx`

Idéntico a LoginFisio (mismo flujo de autenticación)

### 4. `src/pages/paciente/RegistroPaciente.tsx`

Reemplazar la validación de token:
```typescript
const validateToken = async () => {
  if (!token || !email) {
    setError("Token o email inválido");
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
    if (new Date(invitation.expiresAt.toDate()) < new Date()) {
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
```

Reemplazar el submit:
```typescript
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
    
    // Crear documento en Firestore
    const userData = {
      email,
      nombre: formData.nombre,
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      telefono: formData.telefono || "",
      role: "paciente",
      createdAt: new Date(),
    };
    
    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    // Marcar invitación como registrada
    const invitationsRef = collection(db, "invitations");
    const q = query(
      invitationsRef,
      where("token", "==", token),
      where("email", "==", email)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const invitationId = snapshot.docs[0].id;
      await updateDoc(doc(db, "invitations", invitationId), {
        registered: true,
        registeredUserId: userCredential.user.uid,
      });
    }
    
    setSuccess(true);
    setTimeout(() => {
      navigate("/login/paciente");
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.code === "auth/email-already-in-use"
      ? "Este email ya está registrado"
      : err.code === "auth/weak-password"
      ? "La contraseña es muy débil"
      : "Error al crear la cuenta";
    setError(errorMessage);
    setLoading(false);
  }
};
```

Agregar imports:
```typescript
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../auth/firebaseConfig";
import { collection, getDocs, query, where, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../../auth/firebaseConfig";
```

### 5. `src/pages/fisio/InvitarPaciente.tsx`

Reemplazar el submit:
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");

  if (!validateForm()) return;

  setLoading(true);

  try {
    // Obtener el ID del fisio actual
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("Usuario no autenticado");
      setLoading(false);
      return;
    }
    
    // Generar token único
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);
    
    // Calcular expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Crear documento en Firestore
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
    
    // Generar URL
    const url = `${window.location.origin}/registro/paciente?token=${token}&email=${encodeURIComponent(formData.emailPaciente)}`;
    
    // Enviar email (usar tu servicio de email)
    // await sendInvitationEmail(formData.emailPaciente, url);
    
    setSuccess(true);
    setInvitationUrl(url);
    setLoading(false);
  } catch (err) {
    console.error("Error creando invitación:", err);
    setError("Error al crear la invitación");
    setLoading(false);
  }
};
```

Agregar imports:
```typescript
import { auth } from "../../auth/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../auth/firebaseConfig";
```

---

## 📧 Servicio de Email (Opcional pero Recomendado)

### Crear `src/services/emailService.ts`

```typescript
// Opción 1: Firebase Cloud Functions
// Opción 2: SendGrid
// Opción 3: Resend
// Opción 4: EmailJS

// Ejemplo con EmailJS (más simple):
import emailjs from '@emailjs/browser';

emailjs.init('YOUR_PUBLIC_KEY');

export const sendInvitationEmail = async (
  email: string,
  invitationUrl: string,
  pacienteName: string
) => {
  try {
    await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      to_email: email,
      to_name: pacienteName,
      invitation_url: invitationUrl,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
```

---

## 🔑 Variables de Entorno

Crear `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Email Service (si usas)
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_key
```

---

## 🧪 Testing Checklist

- [ ] Crear cuenta de fisio
- [ ] Login de fisio
- [ ] Crear invitación de paciente
- [ ] Recibir email de invitación
- [ ] Aceptar invitación y completar registro
- [ ] Login de paciente
- [ ] Logout de ambos roles
- [ ] Validar redireccionamiento de rutas protegidas
- [ ] Validar token expirado
- [ ] Validar token inválido

---

## 🚀 Desplegamiento

```bash
# 1. Build
npm run build

# 2. Deploy a Firebase Hosting
firebase deploy

# 3. Verificar en https://your-project.web.app
```

---

## 📊 Métricas a Monitorear

- Tiempo de login/registro
- Tasa de invitaciones aceptadas
- Errores de autenticación
- Rendimiento de Firestore

---

¡Listo para implementar! 🚀
