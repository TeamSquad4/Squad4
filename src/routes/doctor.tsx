// src/routes/doctor.tsx

import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getRole } from "@/lib/auth-state";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/doctor")({
  beforeLoad: () => {
    const role = getRole();

    // If not logged in, send to login page
    if (!role) {
      throw redirect({ to: "/login" });
    }

    // Only doctors can access /doctor routes
    if (role !== "doctor") {
      // Redirect admins to admin dashboard
      if (role === "admin") {
        throw redirect({ to: "/admin" });
      }

      // Redirect patients to patient dashboard
      throw redirect({ to: "/dashboard" });
    }
  },

  head: () => ({
    meta: [
      { title: "Doctor Dashboard — MedVault" },
      {
        name: "description",
        content: "Doctor portal for managing patients and records.",
      },
    ],
  }),

  component: DoctorLayout,
});

function DoctorLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}