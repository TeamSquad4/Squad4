
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/services/auth-context";
import { api, type RecordResponse } from "@/services/api";
import { getRole } from "@/lib/auth-state";
import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  FileText,
  Pill,
  Scan,
  ClipboardList,
  Sparkles,
  Download,
  Share2,
  Calendar,
  Building2,
  UserRound,
  HardDrive,
  Plus,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RecordType =
  | "Lab Report"
  | "Prescription"
  | "Scan"
  | "Discharge Summary";

type RecordView = {
  id: string;
  name: string;
  type: RecordType;
  doctor: string;
  hospital: string;
  date: string;
  fileSize: string;
  fileName: string;
  aiSummary: string;
  details: { label: string; value: string }[];
  treatmentNotes: {
    id: string;
    doctor: string;
    date: string;
    note: string;
  }[];
  record: RecordResponse;
};

export const Route = createFileRoute("/records")({
  validateSearch: (search: Record<string, unknown>) => ({
    patientId: search.patientId ? Number(search.patientId) : undefined,
      q: typeof search.q === "string" ? search.q : "",
  }),

  beforeLoad: () => {
    const role = getRole();
    if (!role) {
      throw redirect({ to: "/login" });
    }
  },

  head: () => ({
    meta: [
      { title: "Medical Records — MedVault" },
      {
        name: "description",
        content: "Browse, filter and view AI-summarized medical records.",
      },
    ],
  }),

  component: RecordsPage,
});

const typeIconMap: Record<
  RecordType,
  {
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }
> = {
  "Lab Report": {
    Icon: ClipboardList,
    color: "text-info",
    bg: "bg-info/10",
  },
  Prescription: {
    Icon: Pill,
    color: "text-success",
    bg: "bg-success/10",
  },
  Scan: {
    Icon: Scan,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  "Discharge Summary": {
    Icon: FileText,
    color: "text-warning-foreground",
    bg: "bg-warning/15",
  },
};

const downloadCSV = (record: RecordView) => {
  const rows = [
    ["Record Name", record.name],
    ["Record Type", record.type],
    ["Doctor", record.doctor],
    ["Hospital", record.hospital],
    ["Date", record.date],
    ...record.details.map((d) => [d.label, d.value]),
    ["AI Summary", record.aiSummary.replace(/,/g, ";")],
  ];

  const csvContent = rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.name.replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function RecordsPage() {
  const { role, userId } = useAuth();
  const searchParams = Route.useSearch();

  const [search, setSearch] = useState("");
  useEffect(() => {
    if (searchParams.q) {
      setSearch(searchParams.q);
    }
  }, [searchParams.q]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selected, setSelected] = useState<RecordView | null>(null);
  const [newNote, setNewNote] = useState("");
  const [records, setRecords] = useState<RecordResponse[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const inferRecordType = (record: RecordResponse): RecordType => {
    if (record.record_type) {
      return record.record_type as RecordType;
    }

    const lower = record.record_name.toLowerCase();

    if (
      lower.includes("rx") ||
      lower.includes("prescription") ||
      lower.includes("med")
    ) {
      return "Prescription";
    }

    if (
      lower.includes("scan") ||
      lower.includes("mri") ||
      lower.includes("xray") ||
      lower.includes("ct")
    ) {
      return "Scan";
    }

    if (
      lower.includes("discharge") ||
      lower.includes("summary")
    ) {
      return "Discharge Summary";
    }

    return "Lab Report";
  };

  useEffect(() => {
    const fetchRecords = async () => {
      let targetPatientId: number | undefined;

      if (role === "doctor") {
        targetPatientId = searchParams.patientId;
      } else if (role === "patient") {
        targetPatientId = userId ?? undefined;
      }

      if (!targetPatientId) {
        setRecords([]);
        return;
      }

      setLoadingRecords(true);

      try {
        const items = await api.records.getRecords(targetPatientId);
        setRecords(items);
      } catch (error) {
        toast.error(
          `Failed to load records: ${(error as Error).message}`
        );
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchRecords();
  }, [role, userId, searchParams.patientId]);

  const recordViews = useMemo<RecordView[]>(() => {
    return records.map((record) => ({
      id: String(record.id),
      name: record.record_name,
      type: inferRecordType(record),
      doctor:
        record.doctor_name ||
        (role === "doctor" ? "Partner Provider" : "Your Provider"),
      hospital: record.hospital || "Secure Vault",
      date:
        record.record_date ||
        new Date().toISOString().split("T")[0],
      fileSize: "—",
      fileName: record.record_name,
      aiSummary:
        record.description ||
        "This record was retrieved from your secure health vault.",
      details: [
        { label: "File", value: record.record_name },
        { label: "Record ID", value: String(record.id) },
        { label: "Storage Path", value: record.file_path },
        {
          label: "Notes",
          value: record.notes || "No notes available",
        },
      ],
      treatmentNotes: [],
      record,
    }));
  }, [records, role]);

  const filtered = useMemo(() => {
    return recordViews.filter((r) => {
      const matchSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.doctor.toLowerCase().includes(search.toLowerCase()) ||
        r.hospital.toLowerCase().includes(search.toLowerCase());

      const matchType =
        typeFilter === "all" || r.type === typeFilter;

      const matchDate =
        dateFilter === "all" ||
        (dateFilter === "30d" &&
          new Date(r.date) >
            new Date(Date.now() - 30 * 86400000)) ||
        (dateFilter === "90d" &&
          new Date(r.date) >
            new Date(Date.now() - 90 * 86400000));

      return matchSearch && matchType && matchDate;
    });
  }, [recordViews, search, typeFilter, dateFilter]);

  const addTreatmentNote = () => {
    if (!selected || !newNote.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      doctor: "Dr. Sarah Chen",
      date: new Date().toISOString().split("T")[0],
      note: newNote.trim(),
    };

    selected.treatmentNotes.push(note);
    setSelected({ ...selected });
    setNewNote("");
    toast.success("Treatment note added");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Medical Records
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {recordViews.length} records available
            </p>
          </div>

          <Button
            onClick={() =>
              toast.info("Requesting new records from providers...")
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Request Records
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Lab Report">
                    Lab Report
                  </SelectItem>
                  <SelectItem value="Prescription">
                    Prescription
                  </SelectItem>
                  <SelectItem value="Scan">Scan</SelectItem>
                  <SelectItem value="Discharge Summary">
                    Discharge Summary
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loadingRecords ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading records...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => {
                      const { Icon, color, bg } =
                        typeIconMap[r.type];

                      return (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer"
                          onClick={() => setSelected(r)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg",
                                  bg
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "h-4 w-4",
                                    color
                                  )}
                                />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {r.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {r.fileName}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {r.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{r.doctor}</TableCell>
                          <TableCell>{r.hospital}</TableCell>
                          <TableCell>{r.date}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.fileName}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      AI Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {selected.aiSummary}
                    </p>
                  </CardContent>
                </Card>

                {role === "doctor" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">
                      Treatment Notes
                    </h3>
                    <textarea
                      value={newNote}
                      onChange={(e) =>
                        setNewNote(e.target.value)
                      }
                      placeholder="Add treatment note..."
                      className="w-full min-h-[100px] rounded-md border p-3"
                    />
                    <Button
                      onClick={addTreatmentNote}
                      disabled={!newNote.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => downloadCSV(selected)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};
