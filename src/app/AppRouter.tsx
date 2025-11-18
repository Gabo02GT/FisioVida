import { createBrowserRouter } from "react-router-dom";
import Landing from "../pages/public/Landing";
import LoginFisio from "../pages/fisio/LoginFisio";
import LoginPaciente from "../pages/paciente/LoginPaciente";
import RegistroPaciente from "../pages/paciente/RegistroPaciente";
import InvitarPaciente from "../pages/fisio/InvitarPaciente";
import MisPacientes from "../pages/fisio/MisPacientes";
import DashboardFisio from "../pages/fisio/DashboardFisio";
import DashboardPaciente from "../pages/paciente/DashboardPaciente";
import CalculadoraCorporal from "../pages/paciente/CalculadoraCorporal";
import SeguimientoMensual from "../pages/paciente/SeguimientoMensual";
import PlanAlimenticio from "../pages/paciente/PlanAlimenticio";
import RutinasPersonalizadas from "../pages/paciente/RutinasPersonalizadas";
import GestionCitas from "../pages/paciente/GestionCitas";
import CitasFisio from "../pages/fisio/CitasFisio";
import ReporteResultados from "../pages/paciente/ReporteResultados";
import VistaPacienteFisio from "../pages/fisio/VistaPacienteFisio";
import ProximasCitasFisio from "../pages/fisio/ProximasCitasFisio";
import DetallesCita from "../pages/fisio/DetallesCita";
import RequireAuth from "../auth/RequireAuth";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />,
    },
    {
        path: "/login/fisio",
        element: <LoginFisio />,
    },
    {
        path: "/login/paciente",
        element: <LoginPaciente />,
    },
    {
        path: "/registro/paciente",
        element: <RegistroPaciente />,
    },
    {
        path: "/invitar/paciente",
        element: (
            <RequireAuth requiredRole="fisio">
                <InvitarPaciente />
            </RequireAuth>
        ),
    },
    {
        path: "/mis-pacientes",
        element: (
            <RequireAuth requiredRole="fisio">
                <MisPacientes />
            </RequireAuth>
        ),
    },
    {
        path: "/citas",
        element: (
            <RequireAuth requiredRole="fisio">
                <CitasFisio />
            </RequireAuth>
        ),
    },
    {
        path: "/citas/proximas",
        element: (
            <RequireAuth requiredRole="fisio">
                <ProximasCitasFisio />
            </RequireAuth>
        ),
    },
    {
        path: "/citas/detalles/:citaId",
        element: (
            <RequireAuth requiredRole="fisio">
                <DetallesCita />
            </RequireAuth>
        ),
    },
    {
        path: "/dashboard/fisio",
        element: (
            <RequireAuth requiredRole="fisio">
                <DashboardFisio />
            </RequireAuth>
        ),
    },
    {
        path: "/dashboard/paciente",
        element: (
            <RequireAuth requiredRole="paciente">
                <DashboardPaciente />
            </RequireAuth>
        ),
    },
    {
        path: "/paciente/calculadora-corporal",
        element: (
            <RequireAuth requiredRole="paciente">
                <CalculadoraCorporal />
            </RequireAuth>
        ),
    },
    {
        path: "/paciente/seguimiento-mensual",
        element: (
            <RequireAuth requiredRole="paciente">
                <SeguimientoMensual />
            </RequireAuth>
        ),
    },
    {
        path: "/paciente/plan-alimenticio",
        element: (
            <RequireAuth requiredRole="paciente">
                <PlanAlimenticio />
            </RequireAuth>
        ),
    },
    {
        path: "/paciente/rutinas-personalizadas",
        element: (
            <RequireAuth requiredRole="paciente">
                <RutinasPersonalizadas />
            </RequireAuth>
        ),
    },
    {
        path: "/paciente/gestion-citas",
        element: (
            <RequireAuth requiredRole="paciente">
                <GestionCitas />
            </RequireAuth>
        ),
    },
    {
        path: "/paciente/reporte-resultados",
        element: (
            <RequireAuth requiredRole="paciente">
                <ReporteResultados />
            </RequireAuth>
        ),
    },
    {
        path: "/fisio/paciente/:pacienteId",
        element: (
            <RequireAuth requiredRole="fisio">
                <VistaPacienteFisio />
            </RequireAuth>
        ),
    },
    {
        path: "*",
        element: <div>404 - Pagina no encontrada</div>,
    },
]);