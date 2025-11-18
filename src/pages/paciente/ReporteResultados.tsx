import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, FileText } from "lucide-react";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../auth/useAuth";
import "../../styles/responsive.css";

interface ProgressMetric {
  metric: string;
  current: string;
  initial: string;
  progress: number;
  unit: string;
}

interface ReportData {
  progressMetrics: ProgressMetric[];
  overallProgress: number;
  evaluation: string;
  recommendations: string[];
}

export default function ReporteResultados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hasResults, setHasResults] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    progressMetrics: [],
    overallProgress: 0,
    evaluation: "",
    recommendations: []
  });

  // Cargar reportes desde Firestore
  useEffect(() => {
    const loadResults = async () => {
      if (!user?.uid) return;

      try {
        const reportDocRef = doc(db, "reports", user.uid);
        const reportDoc = await getDoc(reportDocRef);

        if (reportDoc.exists()) {
          setReportData(reportDoc.data() as ReportData);
          setHasResults(true);
        }
      } catch (err) {
        console.error("Error cargando reporte:", err);
        setHasResults(false);
      }
    };

    loadResults();
  }, [user?.uid]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button onClick={() => navigate("/dashboard/paciente")} style={{ display: "flex", gap: "8px", padding: "10px 16px", background: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, marginBottom: "20px", color: "#0891b2" }}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
            <TrendingUp size={32} color="#ef4444" />
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1f2937", margin: 0 }}>Reporte de Resultados</h1>
              <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Evaluación de tu progreso</p>
            </div>
          </div>

          {hasResults ? (
            <>
              <div style={{ background: "#f3f4f6", borderRadius: "12px", padding: "20px", marginBottom: "30px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>Progreso General</h3>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div style={{ fontSize: "48px", fontWeight: 700, color: "#ef4444" }}>{reportData.overallProgress}%</div>
                  <p style={{ color: "#6b7280", margin: 0 }}>Has alcanzado el {reportData.overallProgress}% de tus objetivos este mes</p>
                </div>
              </div>

              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1f2937", fontSize: "18px", fontWeight: 600 }}>Métricas de Progreso</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  {reportData.progressMetrics.map((item, idx) => (
                    <div key={idx} style={{ background: "#f9fafb", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb" }}>
                      <div style={{ marginBottom: "15px" }}>
                        <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600, marginBottom: "8px" }}>
                          {item.metric}
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>
                          {item.current}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                          Inicial: {item.initial}
                        </div>
                      </div>
                      <div style={{ background: "#e5e7eb", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
                        <div style={{
                          width: `${item.progress}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px", textAlign: "right" }}>
                        {item.progress}% completado
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fef2f2", borderRadius: "12px", padding: "25px", marginBottom: "30px", borderLeft: "4px solid #ef4444" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#991b1b", display: "flex", gap: "10px", alignItems: "center" }}>
                  <FileText size={20} /> Evaluación de tu Fisioterapeuta
                </h3>
                <p style={{ color: "#7c2d12", margin: 0, lineHeight: "1.6" }}>
                  {reportData.evaluation}
                </p>
              </div>

              {reportData.recommendations.length > 0 && (
                <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "20px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#166534", fontSize: "16px", fontWeight: 600 }}>Recomendaciones</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#166534" }}>
                    {reportData.recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: idx < reportData.recommendations.length - 1 ? "10px" : 0 }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fef2f2", borderRadius: "12px", borderLeft: "4px solid #ef4444" }}>
              <TrendingUp size={48} style={{ margin: "0 auto 15px", color: "#991b1b" }} />
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#991b1b" }}>No hay datos disponibles por el momento</p>
              <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#991b1b" }}>Completa tus medidas mensuales y sigue tu rutina para generar reportes</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          main {
            padding: 1.5rem 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .metric-item {
            padding: 1.2rem;
          }

          h2 {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 1rem;
          }

          h2 {
            font-size: 1.2rem;
          }

          h3 {
            font-size: 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .metric-item {
            padding: 1rem;
          }

          p {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
