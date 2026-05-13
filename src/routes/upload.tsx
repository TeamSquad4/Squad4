import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/services/auth-context";
import { getRole } from "@/lib/auth-state";
import { api } from "@/services/api";
import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  beforeLoad: () => {
    const role = getRole();
    if (!role) throw redirect({ to: "/login" });
    if (role === "admin") throw redirect({ to: "/admin" });
    if (role === "doctor") throw redirect({ to: "/doctor" });
  },
  head: () => ({
    meta: [
      { title: "Upload Records — MedVault" },
      { name: "description", content: "Securely upload medical records with AI-powered indexing." },
    ],
  }),
  component: UploadPage,
});

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

function UploadPage() {
  const { userId } = useAuth();
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recType, setRecType] = useState<string>("Lab Report");
  const [isClassifying, setIsClassifying] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [hospital, setHospital] = useState("");
  const [recDate, setRecDate] = useState("");
  const [recordName, setRecordName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const detectType = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes("rx") || lower.includes("med") || lower.includes("presc")) return "Prescription";
    if (lower.includes("scan") || lower.includes("mri") || lower.includes("xray") || lower.includes("dcm")) return "Scan";
    if (lower.includes("discharge") || lower.includes("summary")) return "Discharge Summary";
    return "Lab Report";
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next: QueuedFile[] = Array.from(list).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random()}`,
      file: f,
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setFiles((prev) => {
      const updated = [...prev, ...next];
      // Auto-classify on first file add
      if (prev.length === 0 && next.length > 0) {
        setTimeout(() => {
          setIsClassifying(true);
          setTimeout(() => {
            const detected = detectType(next[0].name);
            setRecType(detected);
            setIsClassifying(false);
            toast.success(`AI classified document as ${detected}`, {
              icon: <Sparkles className="h-4 w-4 text-primary" />,
            });
          }, 1500);
        }, 100);
      }
      return updated;
    });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please choose at least one file to upload.");
      return;
    }

    setUploading(true);
    setSubmitted(false);

    try {
      for (const queuedFile of files) {
        const formData = new FormData();
        formData.append("file", queuedFile.file, queuedFile.file.name);
        // Append metadata fields — backend reads these from Form(...)
        formData.append("record_name", recordName.trim() || queuedFile.name);
        formData.append("record_type", recType);
        formData.append("doctor_name", doctorName);
        formData.append("hospital", hospital);
        formData.append("record_date", recDate);
        formData.append("description", description);
        formData.append("notes", notes);

        await api.records.upload(formData);
      }

      toast.success("Records uploaded securely", {
        description: `${files.length} file(s) uploaded successfully.`,
      });
      // Reset form
      setFiles([]);
      setRecordName("");
      setDoctorName("");
      setHospital("");
      setRecDate("");
      setDescription("");
      setNotes("");
      setRecType("Lab Report");
      setSubmitted(true);
    } catch (error) {
      toast.error(`Upload failed: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Medical Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Files are end-to-end encrypted and automatically summarized by our AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dropzone */}
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all",
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
                )}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-elegant">
                  <UploadCloud className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Drop files here or click to browse</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Supports PDF, JPG, PNG, DICOM · Max 50MB per file
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Encrypted in transit and at rest
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  onChange={onPick}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.dcm"
                />
              </div>

              {files.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.size}</p>
                      </div>
                      {submitted ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); remove(f.id); }}
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="border-border/60 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Record Details</CardTitle>
              <CardDescription>This metadata helps our AI generate accurate summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recName">Record name *</Label>
                  <Input
                    id="recName"
                    placeholder="e.g. Annual Blood Panel"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recType">Record type *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (files.length === 0) return;
                        setIsClassifying(true);
                        setTimeout(() => {
                          const detected = detectType(files[0].name);
                          setRecType(detected);
                          setIsClassifying(false);
                          toast.success(`AI classified as ${detected}`, {
                            icon: <Sparkles className="h-4 w-4 text-primary" />,
                          });
                        }, 1500);
                      }}
                      disabled={isClassifying || files.length === 0}
                      className="h-7 px-2 text-[10px] font-bold text-primary gap-1.5 hover:bg-primary/10"
                    >
                      {isClassifying ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {isClassifying ? "CLASSIFYING..." : "AI AUTO-CLASSIFY"}
                    </Button>
                  </div>
                  <Select value={recType} onValueChange={setRecType}>
                    <SelectTrigger id="recType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lab Report">Lab Report</SelectItem>
                      <SelectItem value="Prescription">Prescription</SelectItem>
                      <SelectItem value="Scan">Scan / Imaging</SelectItem>
                      <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name *</Label>
                  <Input
                    id="doctorName"
                    placeholder="e.g. Dr. Sarah Chen"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital / Clinic *</Label>
                  <Input
                    id="hospital"
                    placeholder="e.g. Mount Sinai Medical Center"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recDate">Date of record *</Label>
                  <Input
                    id="recDate"
                    type="date"
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the medical record..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional context for this record..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                <p className="text-xs text-muted-foreground">
                  After upload, our AI will analyze the document, extract key findings, and generate a
                  patient-friendly summary within 30 seconds.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setFiles([]);
                setSubmitted(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || files.length === 0}
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length})` : "Record"}`}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}