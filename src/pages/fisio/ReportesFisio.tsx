import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface ProgressMetric {
  metric: string;
  current: number;
  initial: number;
  unit: string;
}

interface Recommendation {
  titulo: string;
  descripcion: string;
}

interface ReportData {
  progressMetrics: ProgressMetric[];
  overallProgress: number;
  evaluation: string;
  recommendations: Recommendation[];
  fecha?: string;
}

interface Props {
  pacienteId: string;
}

const ReportesFisio: React.FC<Props> = ({ pacienteId }) => {
  const { user } = useAuth();
  const [report, setReport] = useState<ReportData>({
    progressMetrics: [],
    overallProgress: 0,
    evaluation: "",
    recommendations: [],
    fecha: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [newMetric, setNewMetric] = useState<ProgressMetric>({
    metric: "",
    current: 0,
    initial: 0,
    unit: "",
  });
  const [newRecommendation, setNewRecommendation] = useState({
    titulo: "",
    descripcion: "",
  });

  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadReport = async () => {
      try {
        const docRef = doc(db, "reports", pacienteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport(docSnap.data() as ReportData);
        }
      } catch (error) {
        console.error("Error cargando reporte:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [pacienteId, user]);

  const handleAddMetric = () => {
    if (!newMetric.metric.trim() || !newMetric.unit.trim()) {
      alert("Por favor completa el nombre y unidad");
      return;
    }

    setReport({
      ...report,
      progressMetrics: [...report.progressMetrics, newMetric],
    });

    setNewMetric({ metric: "", current: 0, initial: 0, unit: "" });
  };

  const handleRemoveMetric = (index: number) => {
    setReport({
      ...report,
      progressMetrics: report.progressMetrics.filter((_, i) => i !== index),
    });
  };

  const handleAddRecommendation = () => {
    if (!newRecommendation.titulo.trim()) {
      alert("Por favor ingresa un título");
      return;
    }

    setReport({
      ...report,
      recommendations: [...report.recommendations, newRecommendation],
    });

    setNewRecommendation({ titulo: "", descripcion: "" });
  };

  const handleRemoveRecommendation = (index: number) => {
    setReport({
      ...report,
      recommendations: report.recommendations.filter((_, i) => i !== index),
    });
  };

  const handleSaveReport = async () => {
    try {
      await setDoc(doc(db, "reports", pacienteId!), report);
      alert("Reporte guardado exitosamente");
    } catch (error) {
      console.error("Error guardando reporte:", error);
      alert("Error al guardar el reporte");
    }
  };

  const calculateProgress = (metric: ProgressMetric) => {
    if (metric.initial === 0) return 0;
    return Math.round(
      ((metric.current - metric.initial) / Math.abs(metric.initial)) * 100
    );
  };

  if (loading) {
    return (
      <div>
        <div className="container-content">Cargando reporte...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="container-content">
        <div className="header-section">
          <h1>📈 Reportes y Evaluación - Editar para Paciente</h1>
        </div>

        <div className="report-editor">
          {/* Overall Progress */}
          <div className="progress-section">
            <h3>Progreso General del Paciente</h3>
            <div className="progress-input">
              <label>Porcentaje de Progreso General (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={report.overallProgress}
                onChange={(e) =>
                  setReport({
                    ...report,
                    overallProgress: parseInt(e.target.value) || 0,
                  })
                }
                className="input-field"
              />
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${report.overallProgress}%` }}
                >
                  {report.overallProgress}%
                </div>
              </div>
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="metrics-section">
            <h3>Métricas de Progreso</h3>

            {report.progressMetrics.length === 0 ? (
              <div className="empty-message">
                No hay métricas añadidas. Agrega una para comenzar.
              </div>
            ) : (
              <div className="metrics-list">
                {report.progressMetrics.map((metric, idx) => {
                  const progress = calculateProgress(metric);
                  const isPositive = progress >= 0;
                  return (
                    <div key={idx} className="metric-card">
                      <div className="metric-header">
                        <h4>{metric.metric}</h4>
                        <button
                          onClick={() => handleRemoveMetric(idx)}
                          className="btn-remove"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="metric-values">
                        <div className="value-item">
                          <span className="label">Inicial:</span>
                          <span className="value">
                            {metric.initial} {metric.unit}
                          </span>
                        </div>
                        <div className="value-item">
                          <span className="label">Actual:</span>
                          <span className="value">
                            {metric.current} {metric.unit}
                          </span>
                        </div>
                        <div className={`value-item progress-item ${isPositive ? "positive" : "negative"}`}>
                          <span className="label">Progreso:</span>
                          <span className="value">
                            {isPositive ? "+" : ""}
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Metric Form */}
            <div className="add-metric-form">
              <h4>Agregar Métrica</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la Métrica</label>
                  <input
                    type="text"
                    value={newMetric.metric}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, metric: e.target.value })
                    }
                    placeholder="Ej: Peso, IMC, Flexibilidad"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Unidad</label>
                  <input
                    type="text"
                    value={newMetric.unit}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, unit: e.target.value })
                    }
                    placeholder="Ej: kg, cm, %"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor Inicial</label>
                  <input
                    type="number"
                    value={newMetric.initial}
                    onChange={(e) =>
                      setNewMetric({
                        ...newMetric,
                        initial: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Valor Actual</label>
                  <input
                    type="number"
                    value={newMetric.current}
                    onChange={(e) =>
                      setNewMetric({
                        ...newMetric,
                        current: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <button onClick={handleAddMetric} className="btn btn-primary btn-small">
                + Agregar Métrica
              </button>
            </div>
          </div>

          {/* Evaluation */}
          <div className="evaluation-section">
            <h3>Evaluación del Fisioterapeuta</h3>
            <textarea
              value={report.evaluation}
              onChange={(e) =>
                setReport({ ...report, evaluation: e.target.value })
              }
              placeholder="Escribe la evaluación general del paciente..."
              className="input-field"
              rows={5}
            />
          </div>

          {/* Recommendations */}
          <div className="recommendations-section">
            <h3>Recomendaciones</h3>

            {report.recommendations.length === 0 ? (
              <div className="empty-message">
                No hay recomendaciones. Agrega una para comenzar.
              </div>
            ) : (
              <div className="recommendations-list">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-card">
                    <div className="rec-header">
                      <h4>{rec.titulo}</h4>
                      <button
                        onClick={() => handleRemoveRecommendation(idx)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="rec-description">{rec.descripcion}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Recommendation Form */}
            <div className="add-recommendation-form">
              <h4>Agregar Recomendación</h4>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newRecommendation.titulo}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      titulo: e.target.value,
                    })
                  }
                  placeholder="Ej: Continuar con ejercicios"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newRecommendation.descripcion}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Detalla la recomendación..."
                  className="input-field"
                  rows={3}
                />
              </div>

              <button
                onClick={handleAddRecommendation}
                className="btn btn-primary btn-small"
              >
                + Agregar Recomendación
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="button-group">
            <button onClick={handleSaveReport} className="btn btn-primary btn-large">
              💾 Guardar Reporte
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container-content {
          max-width: 1000px;
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

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #10b981;
          color: white;
        }

        .btn-primary:hover {
          background: #059669;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          width: 100%;
        }

        .report-editor {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .progress-section,
        .metrics-section,
        .evaluation-section,
        .recommendations-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .progress-section:last-child,
        .metrics-section:last-child,
        .evaluation-section:last-child,
        .recommendations-section:last-child {
          border-bottom: none;
        }

        h3 {
          color: #0891b2;
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        h4 {
          color: #374151;
          margin: 0 0 1rem 0;
        }

        .empty-message {
          text-align: center;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .progress-input {
          background: #f0fdf4;
          padding: 1.5rem;
          border-radius: 10px;
          border: 2px solid #10b981;
        }

        .progress-input label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: inherit;
          font-size: 1rem;
          box-sizing: border-box;
          margin-bottom: 1rem;
        }

        .input-field:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .progress-bar {
          width: 100%;
          height: 30px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
          transition: width 0.3s ease;
        }

        .metrics-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .metric-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .metric-header h4 {
          margin: 0;
          color: #0891b2;
        }

        .btn-remove {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 1.3rem;
          padding: 0;
        }

        .metric-values {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .value-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .value-item.progress-item {
          font-weight: 600;
        }

        .value-item.progress-item.positive {
          background: #dcfce7;
          color: #15803d;
        }

        .value-item.progress-item.negative {
          background: #fee2e2;
          color: #991b1b;
        }

        .value-item .label {
          font-weight: 600;
          color: #6b7280;
        }

        .add-metric-form,
        .add-recommendation-form {
          background: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 10px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .recommendation-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 1.5rem;
        }

        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .rec-header h4 {
          margin: 0;
          color: #10b981;
        }

        .rec-description {
          margin: 0;
          color: #4b5563;
          line-height: 1.5;
        }

        .button-group {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ReportesFisio;
