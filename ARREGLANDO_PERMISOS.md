# 🔐 ARREGLANDO PERMISOS DE FIRESTORE

## El Problema
```
Error: "Missing or insufficient permissions"
```

Las reglas de seguridad de Firestore NO permiten que el Fisio lea los datos del Paciente.

---

## ✅ La Solución

### PASO 1: Ir a Firebase Console
1. Abre: https://console.firebase.google.com/
2. Selecciona tu proyecto (FisioVida)
3. En el menú izquierdo: **Firestore Database**
4. Click en la pestaña: **Rules**

### PASO 2: Reemplazar las Reglas
Copia TODO el contenido del archivo `firestore.rules` en la raíz del proyecto y pégalo en Firebase Console.

**El archivo `firestore.rules` ya existe en:**
```
c:/Users/gabri/Desktop/FisioVida/fisiovida/firestore.rules
```

### Resumen de lo que hacen las nuevas reglas:

```javascript
// 1. Cada usuario puede leer/escribir sus propios datos
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// 2. Los FISIOS pueden leer datos de TODOS los pacientes
match /users/{userId} {
  allow read: if request.auth.uid es fisio;
}

// 3. Lo mismo aplica para plans, routines, appointments, reports
// Los fisios pueden leer/escribir en cualquier paciente
```

### PASO 3: Publicar las Reglas
1. En Firebase Console, después de copiar las reglas
2. Click el botón **"Publish"** (abajo a la derecha)
3. Espera a que se confirme (dice "Rules updated")

---

## 🧪 Verificar que Funciona

Después de publicar:
1. Actualiza la página del navegador (F5)
2. Abre Calculadora IMC del paciente
3. Abre Plan Alimenticio del paciente
4. ✅ **Deben desaparecer los errores de permisos**
5. ✅ **Deben aparecer los datos correctamente**

---

## Estructura de las Reglas Explicada

### Permisos por Rol:

```
┌─────────────────────────────────────────────────┐
│           PACIENTE (role: "paciente")           │
├─────────────────────────────────────────────────┤
│ ✅ Puede leer su propio documento users/{uid}   │
│ ✅ Puede escribir en su propio documento        │
│ ✅ Puede leer/escribir sus plans                │
│ ✅ Puede leer/escribir sus routines             │
│ ✅ Puede leer/escribir sus appointments         │
│ ✅ Puede leer/escribir sus reports              │
│ ❌ NO puede ver datos de otros pacientes       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         FISIOTERAPEUTA (role: "fisio")          │
├─────────────────────────────────────────────────┤
│ ✅ Puede leer su propio documento users/{uid}   │
│ ✅ Puede leer/escribir datos de TODOS           │
│    los pacientes:                               │
│    - users/{anyPatientId}                       │
│    - plans/{anyPatientId}                       │
│    - routines/{anyPatientId}                    │
│    - appointments/{anyPatientId}                │
│    - reports/{anyPatientId}                     │
│ ✅ Puede crear invitaciones                     │
│ ✅ Puede ver invitaciones                       │
└─────────────────────────────────────────────────┘
```

---

## ❌ Si Aún No Funciona Después de Publicar

### Checklist:

- [ ] ¿Publicaste las reglas en Firebase Console? (Click "Publish")
- [ ] ¿Esperaste 10-15 segundos después de publicar?
- [ ] ¿Actualizaste la página del navegador? (F5)
- [ ] ¿Limpiaste la caché del navegador? (Ctrl+Shift+Supprimir)
- [ ] ¿El usuario está logueado como FISIO? (No como paciente)
- [ ] ¿El documento del paciente existe en Firestore?

### Debug en Consola:

Abre la consola del navegador (F12) y busca:
- ❌ Errores rojos
- ❌ "Missing or insufficient permissions"
- ❌ "Permission denied"

Si aún ves errores, toma una screenshot del error y muéstrame.

---

## 📋 Pasos Rápidos Resumidos:

1. Firebase Console → Firestore Database → Rules
2. Copia contenido de `firestore.rules`
3. Pega en Firebase Console
4. Click "Publish"
5. Espera 10-15 segundos
6. Actualiza navegador (F5)
7. ✅ Prueba nuevamente

---

## 🚀 Después de Arreglarlo:

Todo debería funcionar:
- ✅ Fisio ve Calculadora IMC del paciente
- ✅ Fisio ve Mediciones del paciente
- ✅ Fisio ve Plan Alimenticio (con sugerencias)
- ✅ Fisio ve Rutinas (con sugerencias)
- ✅ Fisio puede crear planes
- ✅ Fisio puede crear rutinas
- ✅ Etc.

