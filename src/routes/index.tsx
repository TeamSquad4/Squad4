import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getRole } from "@/lib/auth-state";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getRole();
    if (!role) {
      navigate({ to: "/login" });
    } else if (role === "admin") {
      navigate({ to: "/admin" });
    } else if (role === "doctor") {
      navigate({ to: "/doctor" });
    } else {
      navigate({ to: "/dashboard" });
    }
  }, []);

  return null;
}