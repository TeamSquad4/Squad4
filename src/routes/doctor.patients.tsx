// src/routes/doctor.patients.tsx

import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileText, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({
    meta: [
      { title: "Patients — MedVault" },
      {
        name: "description",
        content: "Full patient roster with quick actions.",
      },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestPatientId, setRequestPatientId] = useState("");
  const [requesting, setRequesting] = useState(false);

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

  const handleRequestAccess = async () => {
    const patientId = Number(requestPatientId);

    if (!patientId) {
      toast.error("Enter a valid patient ID");
      return;
    }

    setRequesting(true);

    try {
      await api.access.requestAccess(patientId);
      toast.success("Access request sent", {
        description: "Patient will be notified of your request.",
      });

      setRequestPatientId("");
    } catch (error) {
      toast.error(
        `Failed to request access: ${(error as Error).message}`
      );
    } finally {
      setRequesting(false);
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} with approved access
        </p>
      </div>

      {/* Request Access Card */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            Request Access to New Patient
          </CardTitle>
          <CardDescription>
            Enter the patient ID to request access to their medical records.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:max-w-xl">
            <Input
              type="number"
              placeholder="Patient ID (e.g., 1)"
              value={requestPatientId}
              onChange={(e) => setRequestPatientId(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleRequestAccess()
              }
              disabled={requesting}
              className="sm:flex-1"
            />

            <Button
              onClick={handleRequestAccess}
              disabled={requesting}
              className="sm:min-w-[140px]"
            >
              <Plus className="mr-2 h-4 w-4" />
              {requesting ? "Requesting..." : "Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approved Patients */}
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">Approved Patients</CardTitle>
              <CardDescription>
                Patients who have granted you access to their records.
              </CardDescription>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search patient..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center">Loading patients...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {patients.length === 0
                        ? "No approved patients yet. Request access to get started."
                        : "No patients match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {p.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="font-medium leading-tight">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {p.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {p.email}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status="Stable" />
                      </TableCell>

                      <TableCell className="text-right">
                       <Button asChild variant="outline" size="sm">
  <Link
    to="/records"
    search={{ patientId: p.id }}
  >
    <FileText className="mr-2 h-4 w-4" />
    View Records
  </Link>
</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}