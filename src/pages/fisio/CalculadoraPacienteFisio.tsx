import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../auth/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import NavbarFisio from "../../components/NavbarFisio";

interface IMCRecord {
  date: string;
  imc: number;
  peso: number;
  altura: number;
  categoria: string;
}

const CalculadoraPacienteFisio: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imcHistory, setImcHistory] = useState<IMCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [unidadPeso, setUnidadPeso] = useState<"kg" | "lb">("kg");
  const [unidadAltura, setUnidadAltura] = useState<"m" | "cm" | "ft">("cm");

  useEffect(() => {
    if (!pacienteId || !user) return;

    const loadData = async () => {
      try {
        const docRef = doc(db, "users", pacienteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setImcHistory(data.imcHistory || []);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pacienteId, user]);

  const convertPesoAKg = (value: number, unit: "kg" | "lb"): number => {
    return unit === "lb" ? value * 0.453592 : value;
  };

  const convertAlturaAM = (value: number, unit: "m" | "cm" | "ft"): number => {
    if (unit === "cm") return value / 100;
    if (unit === "ft") return value * 0.3048;
    return value;
  };

  const calcularIMC = (pesoKg: number, alturaM: number): number => {
    return pesoKg / (alturaM * alturaM);
  };

  const handleAddIMC = async () => {
    if (!peso || !altura) {
      alert("Por favor completa peso y altura");
      return;
    }

    try {
      const pesoKg = convertPesoAKg(parseFloat(peso), unidadPeso);
      const alturaM = convertAlturaAM(parseFloat(altura), unidadAltura);
      const imc = calcularIMC(pesoKg, alturaM);

      const getIMCCategory = (imcValue: number): string => {
        if (imcValue < 18.5) return "Bajo peso";
        if (imcValue < 25) return "Normal";
        if (imcValue < 30) return "Sobrepeso";
        if (imcValue < 35) return "Obesidad Clase I";
        if (imcValue < 40) return "Obesidad Clase II";
        return "Obesidad Clase III";
      };

      const newRecord: IMCRecord = {
        date: new Date().toISOString().split("T")[0],
        imc: Math.round(imc * 10) / 10,
        peso: Math.round(pesoKg * 10) / 10,
        altura: Math.round(alturaM * 100) / 100,
        categoria: getIMCCategory(imc),
      };

      const updatedHistory = [newRecord, ...imcHistory];
      await updateDoc(doc(db, "users", pacienteId!), {
        imcHistory: updatedHistory,
        peso: pesoKg,
        altura: alturaM,
      });

      setImcHistory(updatedHistory);
      setPeso("");
      setAltura("");
      setShowForm(false);
      alert("IMC agregado correctamente");
    } catch (error) {
      console.error("Error agregando IMC:", error);
      alert("Error al agregar IMC");
    }
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { text: "Bajo Peso", color: "#3b82f6" };
    if (imc < 25) return { text: "Peso Normal", color: "#10b981" };
    if (imc < 30) return { text: "Sobrepeso", color: "#f59e0b" };
    if (imc < 35) return { text: "Obesidad Clase I", color: "#ef4444" };
    if (imc < 40) return { text: "Obesidad Clase II", color: "#dc2626" };
    return { text: "Obesidad Clase III", color: "#7f1d1d" };
  };

  const handleDelete = async (date: string) => {
    if (!window.confirm("¿Eliminar este registro?")) return;

    try {
      const newHistory = imcHistory.filter((record) => record.date !== date);
      await updateDoc(doc(db, "users", pacienteId!), {
        imcHistory: newHistory,
      });
      setImcHistory(newHistory);
    } catch (error) {
      console.error("Error eliminando registro:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <NavbarFisio />
        <div className="container-content">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <NavbarFisio />
      <div className="container-content">
        <div className="header-section">
          <h1>📊 Calculadora IMC - Historial del Paciente</h1>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            ← Volver
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ marginBottom: "1.5rem" }}
        >
          ⚖️ Agregar Nuevo IMC
        </button>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Registrar IMC Nuevo</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label>Peso:</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="number"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ej: 85"
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={unidadPeso}
                    onChange={(e) => setUnidadPeso(e.target.value as "kg" | "lb")}
                    className="input-field"
                    style={{ width: "80px" }}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Altura:</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="number"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="Ej: 175"
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={unidadAltura}
                    onChange={(e) =>
                      setUnidadAltura(e.target.value as "m" | "cm" | "ft")
                    }
                    className="input-field"
                    style={{ width: "80px" }}
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button onClick={handleAddIMC} className="btn btn-primary">
                  Guardar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {imcHistory.length === 0 ? (
          <div className="empty-state">
            <p>No hay registros de IMC para este paciente</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>Altura (m)</th>
                  <th>IMC</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {imcHistory.map((record) => {
                  const category = getIMCCategory(record.imc);
                  return (
                    <tr key={record.date}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.peso.toFixed(2)}</td>
                      <td>{record.altura.toFixed(2)}</td>
                      <td className="imc-value">{record.imc.toFixed(1)}</td>
                      <td>
                        <span
                          className="categoria-badge"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.text}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(record.date)}
                          className="btn-delete"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
          overflow: hidden;
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
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table tbody tr:hover {
          background: #f9fafb;
        }

        .imc-value {
          font-weight: bold;
          color: #0891b2;
          font-size: 1.1rem;
        }

        .categoria-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .btn-delete {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: transform 0.2s;
        }

        .btn-delete:hover {
          transform: scale(1.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal h3 {
          margin: 0 0 1.5rem 0;
          color: #111827;
        }

        .modal label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: inherit;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .input-field:focus {
          outline: none;
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CalculadoraPacienteFisio;
