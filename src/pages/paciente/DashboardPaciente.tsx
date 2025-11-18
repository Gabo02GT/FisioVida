import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Heart, Calendar, Apple, Dumbbell, TrendingUp, FileText } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import "../../styles/responsive.css";

export default function DashboardPaciente() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <nav style={{ background: 'white', padding: '20px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Heart size={32} color='#0891b2' />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>FisioVida</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Tu Progreso en Fisioterapia</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{user?.email}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>Paciente</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </nav>

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937', margin: '0 0 10px 0' }}>¡Bienvenido de nuevo! 👋</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>Aquí puedes ver tu progreso, planes de ejercicio, alimentación y gestionar tus citas</p>
          </div>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0 0 25px 0' }}>Mis Módulos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Calculadora IMC', desc: 'Calcula tu índice de masa corporal', icon: Activity, path: '/paciente/calculadora-corporal', color: '#0891b2' },
              { title: 'Seguimiento Mensual', desc: 'Tu progreso con medidas, gráficas y fotos', icon: TrendingUp, path: '/paciente/seguimiento-mensual', color: '#10b981' },
              { title: 'Plan Alimenticio', desc: 'Tu plan nutricional personalizado', icon: Apple, path: '/paciente/plan-alimenticio', color: '#f59e0b' },
              { title: 'Rutinas Personalizadas', desc: 'Ejercicios diseñados para ti', icon: Dumbbell, path: '/paciente/rutinas-personalizadas', color: '#a855f7' },
              { title: 'Gestión de Citas', desc: 'Agenda, reprograma y consulta tus citas', icon: Calendar, path: '/paciente/gestion-citas', color: '#3b82f6' },
              { title: 'Reporte de Resultados', desc: 'Evaluación de tu progreso', icon: FileText, path: '/paciente/reporte-resultados', color: '#ef4444' }
            ].map((module, idx) => {
              const Icon = module.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(module.path)}
                  style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${module.color}, rgba(255,255,255,0))` }} />
                  <div style={{ width: '60px', height: '60px', background: `linear-gradient(135deg, ${module.color}, rgba(8, 145, 178, 0.1))`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: module.color, marginBottom: '20px' }}>
                    <Icon size={28} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0', lineHeight: '1.3' }}>{module.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{module.desc}</p>
                  <div style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '24px', color: module.color }}>→</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          main {
            padding: 2rem 1.5rem;
          }

          .modules-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          nav {
            padding: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          main {
            padding: 1.5rem 1rem;
            max-width: 100%;
          }

          .welcome-header {
            padding: 1.5rem;
            flex-direction: column;
            text-align: center;
          }

          .welcome-header h2 {
            font-size: 1.5rem;
          }

          .modules-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .module-card {
            padding: 1.5rem;
          }

          .module-card h3 {
            font-size: 1rem;
          }

          .module-card p {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          nav {
            flex-direction: column;
            padding: 1rem;
            text-align: center;
          }

          nav h1 {
            font-size: 1.3rem;
          }

          main {
            padding: 1rem;
          }

          .welcome-header {
            padding: 1rem;
          }

          .welcome-header h2 {
            font-size: 1.3rem;
          }

          .welcome-header p {
            font-size: 0.9rem;
          }

          .modules-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .module-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
