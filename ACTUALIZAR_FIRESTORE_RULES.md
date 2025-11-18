# 🔧 Instrucciones para Actualizar Firestore Rules

## Problema Identificado
❌ Los nuevos pacientes no pueden validar invitaciones porque no están autenticados aún

## Solución
✅ Se han actualizado las reglas de Firestore para permitir lectura pública de invitaciones

## Pasos para Actualizar en Firebase Console

1. **Abre Firebase Console**
   - Dirígete a: https://console.firebase.google.com/
   - Selecciona el proyecto **FisioVida**

2. **Navega a Firestore Database**
   - En el menú izquierdo, busca **Firestore Database**
   - Haz clic en la pestaña **Rules**

3. **Reemplaza las Reglas**
   - Copia TODO el contenido del archivo `firestore.rules` (en la raíz del proyecto)
   - Pégalo en el editor de Firebase Console
   - El contenido debe incluir:
     ```
     // Invitations: permitir lectura para validar invitación (sin autenticación)
     match /invitations/{document=**} {
       allow read: if true; // Permitir lectura pública
       allow write: if request.auth != null;
     }
     ```

4. **Publica las Reglas**
   - Haz clic en el botón **Publish** en la esquina superior derecha
   - Espera a que se confirme la actualización (10-15 segundos)

5. **Verifica que Funcionó**
   - El mensaje de estado debe cambiar a verde: "Rules updated"
   - Ahora los nuevos pacientes podrán validar invitaciones correctamente

## Archivo de Referencia
```plaintext
📁 fisiovida/firestore.rules
```

## Cambios Realizados
✅ Permitir lectura pública de invitaciones (sin autenticación)
✅ Mantener restricción de escritura solo para usuarios autenticados
✅ Todas las otras colecciones siguen protegidas

---
**Nota**: Una vez actualizado en Firebase Console, el sistema funcionará correctamente para nuevas invitaciones.
