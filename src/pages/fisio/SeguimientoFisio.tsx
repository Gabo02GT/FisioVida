import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../../styles/dashboard.css";
import type {
  MeasurementComplete,
} from "../../types/measurements";
import {
  MEASUREMENT_REFERENCES,
  MEASUREMENT_LABELS,
} from "../../types/measurements";

interface Props {
  pacienteId: string;
}

const SeguimientoFisio: React.FC<Props> = ({ pacienteId }) => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<MeasurementComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<MeasurementComplete | null>(null);
  const [sexo, setSexo] = useState<string>("hombre");

  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadData = async () => {
      try {
        const docRef = doc(db, "users", pacienteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSexo(data.sexo?.toLowerCase() || "hombre");
          setMeasurements(data.measurements || []);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pacienteId, user]);

  const handleEdit = (measurement: MeasurementComplete) => {
    setEditingId(measurement.date);
    setEditData({ ...measurement });
  };

  const handleSaveEdit = async () => {
    if (!editData || !editingId) return;

    try {
      const updated = measurements.map((m) =>
        m.date === editingId ? editData : m
      );
      await updateDoc(doc(db, "users", pacienteId!), {
        measurements: updated,
      });
      setMeasurements(updated);
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      console.error("Error actualizando:", error);
    }
  };

  const handleDelete = async (date: string) => {
    if (!window.confirm("¿Eliminar este registro?")) return;

    try {
      const updated = measurements.filter((m) => m.date !== date);
      await updateDoc(doc(db, "users", pacienteId!), {
        measurements: updated,
      });
      setMeasurements(updated);
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="container-content">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="container-content">
        <div className="header-section">
          <div>
            <h1>📊 Seguimiento Mensual - Mediciones del Paciente</h1>
            <p className="gender-info">Género: <span className="gender-badge">{sexo.charAt(0).toUpperCase() + sexo.slice(1)}</span></p>
          </div>
        </div>

        {measurements.length === 0 ? (
          <div className="empty-state">
            <p>No hay mediciones registradas para este paciente</p>
          </div>
        ) : (
          <>
            <div className="references-section">
              <h3>📏 7 Medidas Clave para {sexo.charAt(0).toUpperCase() + sexo.slice(1)}</h3>
              <div className="references-grid-large">
                {[
                  { field: "pecho", icon: "💪" },
                  { field: "cintura", icon: "📏" },
                  { field: "cadera", icon: "🍑" },
                  { field: "brazoDerecho", icon: "💸" },
                  { field: "brazoIzquierdo", icon: "💸" },
                  { field: "musloAlto", icon: "🦵" },
                  { field: "pantorrilla", icon: "👟" },
                ].map(({ field, icon }) => {
                  const refs = MEASUREMENT_REFERENCES[sexo][field];
                  const label = MEASUREMENT_LABELS[field as keyof typeof MEASUREMENT_LABELS];
                  
                  return refs ? (
                    <div key={field} className="reference-card-large">
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
                      <div className="ref-title">{label.label}</div>
                      <div className="ref-range">{refs.min} - {refs.max} {label.unit}</div>
                      <div className="ref-desc">{label.desc}</div>
                    </div>
                  ) : (
                    <div key={field} className="reference-card-large">
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
                      <div className="ref-title">{label.label}</div>
                      <div className="ref-desc">{label.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  {["pecho", "cintura", "cadera", "brazoDerecho", "brazoIzquierdo", "musloAlto", "pantorrilla"].map((field) => (
                    <th key={field} title={MEASUREMENT_LABELS[field as keyof typeof MEASUREMENT_LABELS]?.desc}>
                      {MEASUREMENT_LABELS[field as keyof typeof MEASUREMENT_LABELS]?.label}
                    </th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((measurement) =>
                  editingId === measurement.date && editData ? (
                    <tr key={measurement.date} className="editing-row">
                      <td>
                        {new Date(measurement.date).toLocaleDateString()}
                      </td>
                      {["pecho", "cintura", "cadera", "brazoDerecho", "brazoIzquierdo", "musloAlto", "pantorrilla"].map((field) => (
                        <td key={field}>
                          <input
                            type="number"
                            value={editData[field as keyof MeasurementComplete] || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                [field]: parseFloat(e.target.value) || 0,
                              })
                            }
                            step="0.1"
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          onClick={handleSaveEdit}
                          className="btn-save"
                          title="Guardar"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-cancel"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={measurement.date}>
                      <td>
                        {new Date(measurement.date).toLocaleDateString()}
                      </td>
                      {["pecho", "cintura", "cadera", "brazoDerecho", "brazoIzquierdo", "musloAlto", "pantorrilla"].map((field) => (
                        <td key={field}>
                          {(measurement[field as keyof MeasurementComplete] as number)?.toFixed(1) || "-"} {MEASUREMENT_LABELS[field as keyof typeof MEASUREMENT_LABELS]?.unit}
                        </td>
                      ))}
                      <td>
                        <button
                          onClick={() => handleEdit(measurement)}
                          className="btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(measurement.date)}
                          className="btn-delete"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      <style>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-section h1 {
          margin: 0;
          color: #0891b2;
          font-size: 1.5rem;
        }

        .gender-info {
          margin: 0.5rem 0 0 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .gender-badge {
          background: #dbeafe;
          color: #0c4a6e;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: 600;
        }

        .references-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .references-section h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .references-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .reference-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #0891b2;
          text-align: center;
        }

        .ref-title {
          font-weight: 600;
          color: #0c4a6e;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .ref-range {
          font-size: 1.2rem;
          color: #0891b2;
          font-weight: 700;
        }

        .references-grid-large {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .reference-card-large {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #0891b2;
          border-top: 2px solid #0891b2;
        }

        .reference-card-large .ref-title {
          font-weight: 700;
          color: #0c4a6e;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .reference-card-large .ref-range {
          font-size: 1.1rem;
          color: #0891b2;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .reference-card-large .ref-desc {
          font-size: 0.85rem;
          color: #0c4a6e;
          font-style: italic;
          line-height: 1.4;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .table-responsive {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f3f4f6;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .data-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table tbody tr:hover {
          background: #f9fafb;
        }

        .editing-row {
          background: #fffbeb;
        }

        .data-table input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .btn-edit,
        .btn-delete,
        .btn-save,
        .btn-cancel {
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0.5rem;
          margin: 0 0.25rem;
          transition: transform 0.2s;
        }

        .btn-edit:hover,
        .btn-save:hover {
          transform: scale(1.2);
        }

        .btn-delete:hover,
        .btn-cancel:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default SeguimientoFisio;
