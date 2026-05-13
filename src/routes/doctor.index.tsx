// src/routes/doctor.index.tsx

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Sparkles,
  TrendingUp,
  Stethoscope,
  Brain,
  Activity,
  FileText,
} from "lucide-react";
import { FadeIn, GlowCard } from "@/components/motion-wrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/doctor/")({
  component: DoctorDashboardPage,
});

function DoctorDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.access.getMyPatients();
        setPatients(data);
      } catch (error) {
        toast.error(`Failed to load patients: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const docMetrics = [
    {
      label: "Active Patients",
      value: patients.length.toString(),
      change: "Approved access",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "AI Alerts",
      value: "0",
      change: "No alerts",
      icon: Sparkles,
      color: "text-warning-foreground",
      bg: "bg-warning/15",
    },
    {
      label: "Today's Consults",
      value: "0",
      change: "No consults",
      icon: Stethoscope,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "Avg. Risk Score",
      value: "—",
      change: "Not available",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Good morning, Dr. Chen
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Clinical Overview
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 2000)),
                {
                  loading: "Analyzing patient history...",
                  success: "Patient health summary generated!",
                  error: "Failed to generate summary",
                }
              );
              setShowSummary(true);
            }}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Generate Health Summary
          </Button>

          <Badge
            variant="outline"
            className="h-9 gap-1.5 border-info/30 bg-info/10 text-info"
          >
            <Brain className="h-3 w-3" />
            AI Co-pilot active
          </Badge>
        </div>
      </FadeIn>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {docMetrics.map((m, i) => (
          <FadeIn key={m.label} delay={i * 0.1}>
            <GlowCard>
              <Card className="border-border/60 shadow-card">
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "mb-4 flex h-11 w-11 items-center justify-center rounded-lg",
                      m.bg
                    )}
                  >
                    <m.icon className={cn("h-5 w-5", m.color)} />
                  </div>
                  <p className="text-3xl font-bold">{m.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {m.change}
                  </p>
                </CardContent>
              </Card>
            </GlowCard>
          </FadeIn>
        ))}
      </div>

      {/* Patient Roster */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Patient Roster</CardTitle>
              <CardDescription>
                Patients currently under your care
              </CardDescription>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link to="/doctor/patients">View all</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No approved patients yet
            </div>
          ) : (
            <div className="space-y-4">
              {patients.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {p.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status="Stable" />

                    <Button asChild variant="ghost" size="sm">
  <Link
    to="/records"
    search={{ patientId: p.id }}
  >
    View Records
  </Link>
</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}