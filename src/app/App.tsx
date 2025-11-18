import { RouterProvider } from "react-router-dom";
import { router } from "./AppRouter";
import { AuthProvider } from "../auth/useAuth";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}