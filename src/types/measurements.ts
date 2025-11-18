// Interfaz para mediciones simplificadas de fitness (solo medidas del cuerpo)
export interface MeasurementComplete {
  date: string;
  pecho: number; // Tórax/Pecho
  cintura: number; // Cintura
  cadera: number; // Cadera/Glúteo
  brazoDerecho: number; // Bíceps derecho
  brazoIzquierdo: number; // Bíceps izquierdo
  musloAlto: number; // Muslo alto
  pantorrilla: number; // Pantorrilla
}

// Referencias de mediciones por género (en cm)
export const MEASUREMENT_REFERENCES: Record<string, Record<string, { min: number; max: number }>> = {
  hombre: {
    pecho: { min: 90, max: 110 },
    cintura: { min: 75, max: 95 },
    cadera: { min: 85, max: 105 },
    brazoDerecho: { min: 25, max: 40 },
    brazoIzquierdo: { min: 25, max: 40 },
    musloAlto: { min: 50, max: 65 },
    pantorrilla: { min: 32, max: 42 },
  },
  mujer: {
    pecho: { min: 80, max: 100 },
    cintura: { min: 60, max: 85 },
    cadera: { min: 85, max: 105 },
    brazoDerecho: { min: 20, max: 32 },
    brazoIzquierdo: { min: 20, max: 32 },
    musloAlto: { min: 45, max: 60 },
    pantorrilla: { min: 30, max: 40 },
  },
};

export const MEASUREMENT_LABELS = {
  pecho: { label: "Pecho", desc: "Alrededor del torso a la altura de los pezones", unit: "cm" },
  cintura: { label: "Cintura", desc: "En la parte más estrecha del torso", unit: "cm" },
  cadera: { label: "Cadera", desc: "La parte más ancha (glúteo)", unit: "cm" },
  brazoDerecho: { label: "Brazo Derecho", desc: "Parte más ancha del brazo derecho", unit: "cm" },
  brazoIzquierdo: { label: "Brazo Izquierdo", desc: "Parte más ancha del brazo izquierdo", unit: "cm" },
  musloAlto: { label: "Muslo", desc: "En la parte más ancha del muslo", unit: "cm" },
  pantorrilla: { label: "Pantorrilla", desc: "En el punto más ancho de la pantorrilla", unit: "cm" },
};

export const MEASUREMENT_ORDER = [
  "pecho",
  "cintura",
  "cadera",
  "brazoDerecho",
  "brazoIzquierdo",
  "musloAlto",
  "pantorrilla",
];
