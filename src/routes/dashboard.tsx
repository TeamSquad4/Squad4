import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getRole, getUserId } from "@/lib/auth-state";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Activity,
  ArrowUpRight,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  Play,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { api, type RecordResponse, type UserResponse } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const role = getRole();

    if (!role) throw redirect({ to: "/login" });
    if (role === "admin") throw redirect({ to: "/admin" });
    if (role === "doctor") throw redirect({ to: "/doctor" });
  },
  head: () => ({
    meta: [
      { title: "Dashboard — HealthBlocks" },
      { name: "description", content: "Your personal health overview." },
    ],
  }),
  component: PatientDashboard,
});

function PatientDashboard() {
  const [records, setRecords] = useState<RecordResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();

    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [recordsData, profileData] = await Promise.all([
          api.records.getRecords(userId),
          api.profile.getProfile(),
        ]);

        setRecords(recordsData);
        setUser(profileData);
      } catch (error) {
        toast.error(`Failed to load dashboard: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recordCount = records.length;
  const recentUploads = records.slice(0, 3);

  return (
    <AppLayout>
      <div className="space-y-12 pb-12">
        <div className="relative overflow-hidden rounded-[40px] bg-white dark:bg-card border border-border/50 shadow-card p-8 md:p-12 lg:p-16 min-h-[400px] flex items-center">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[#f8f6f0] dark:bg-muted/10 blob-shape translate-x-1/4 -translate-y-1/4 -z-10" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[40%] h-[60%] bg-primary/5 rounded-full blur-3xl -z-10" />

          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold">
                <Sparkles className="h-4 w-4" />
                AI Health Assistant Active
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                Health & <br />
                <span className="text-primary">Medical Records</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-md">
                Securely manage your personal medical data and connect with your
                healthcare providers through HealthBlocks.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg font-bold group shadow-elegant">
                  <Link to="/upload">
                    Upload Record
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg font-bold">
                  <Link to="/records" search={{ patientId: undefined, q: "" }}>
                    View History
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block h-[400px]">
              <div className="absolute top-4 left-0 p-4 bg-white dark:bg-muted shadow-xl rounded-2xl rounded-tl-none border border-border/50 animate-float max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden border border-primary/20">
                    <img src="https://i.pravatar.cc/150?u=doc1" alt="Doctor avatar" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Dr. Stella</p>
                    <p className="text-[10px] text-muted-foreground">Everything looks great!</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 right-4 p-4 bg-white dark:bg-muted shadow-xl rounded-2xl border border-border/50 animate-float">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                  <div className="w-32 h-1 bg-muted rounded-full relative">
                    <div className="absolute inset-0 w-1/2 bg-primary rounded-full" />
                  </div>
                  <span className="text-xs font-mono">0:32</span>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-muted shadow-2xl rounded-3xl border border-border/50 w-[280px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <Badge className="bg-success text-success-foreground font-bold">
                    Secured
                  </Badge>
                </div>

                <h3 className="text-lg font-bold mb-1">Vault Status</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your records are encrypted and synced.
                </p>

                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your registered health details</CardDescription>
          </CardHeader>

          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <p><b>Name:</b> {user?.name || "-"}</p>
            <p><b>Email:</b> {user?.email || "-"}</p>
            <p><b>Phone:</b> {user?.phone || "-"}</p>
            <p><b>DOB:</b> {user?.dob || "-"}</p>
            <p><b>Gender:</b> {user?.gender || "-"}</p>
            <p><b>Blood Group:</b> {user?.blood_group || "-"}</p>
            <p className="sm:col-span-2"><b>Address:</b> {user?.address || "-"}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/records" search={{ patientId: undefined, q: "" }} className="group">
            <DashboardActionCard
              title="View Records"
              desc="Access your complete medical history, lab results, and AI summaries."
              icon={FileText}
              color="bg-blue-500"
            />
          </Link>

          <Link to="/upload" className="group">
            <DashboardActionCard
              title="Upload New"
              desc="Securely upload prescriptions, scans, or summaries for AI indexing."
              icon={Upload}
              color="bg-indigo-500"
            />
          </Link>

          <Link to="/access" className="group">
            <DashboardActionCard
              title="Manage Access"
              desc="Control which doctors or clinics can view your health information."
              icon={Users}
              color="bg-cyan-600"
            />
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Medical Records Overview</CardTitle>
                <CardDescription>Your uploaded medical documents and files</CardDescription>
              </div>

              <Badge variant="outline" className="text-primary border-primary/30">
                {recordCount} Records
              </Badge>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  Loading records...
                </div>
              ) : recordCount === 0 ? (
                <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">No records yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your first medical record to get started.
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/upload">Upload Record</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Uploads</h4>

                  {recentUploads.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{record.record_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Record ID: {record.id}
                          </p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" asChild>
                        <Link to="/records" search={{ patientId: undefined, q: "" }}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}

                  {recordCount > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/records" search={{ patientId: undefined, q: "" }}>
                        View All Records
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-border/60 shadow-card bg-mesh text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/80" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg">AI Health Insight</CardTitle>
                <CardDescription className="text-white/70">
                  Powered by HealthBlocks Intelligence
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <p className="text-xl font-bold mb-4">
                  "Your heart rate stability has improved by 12% this week."
                </p>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 w-fit text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Keep it up!
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5 shadow-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-sm font-bold">
                    Live AI Trend Analysis
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-white dark:bg-muted border border-destructive/20 space-y-1">
                  <p className="text-xs font-bold">Elevated Systolic Trend</p>
                  <p className="text-[11px] text-muted-foreground">
                    Your systolic BP has increased by 8mmHg over the last 3 mornings.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <Link to="/records" search={{ patientId: undefined, q: "" }} className="w-full">
                  <QuickAccessButton label="Request New Report" icon={Search} bg="bg-primary/10" text="text-primary" />
                </Link>

                <Link to="/access" className="w-full">
                  <QuickAccessButton label="Share with Doctor" icon={Plus} bg="bg-orange-100" text="text-orange-600" />
                </Link>

                <Link to="/records" search={{ patientId: undefined, q: "" }} className="w-full">
                  <QuickAccessButton label="AI Record Analysis" icon={Sparkles} bg="bg-green-100" text="text-green-600" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

type IconType = React.ComponentType<{ className?: string }>;

function DashboardActionCard({
  title,
  desc,
  icon: Icon,
  color,
}: {
  title: string;
  desc: string;
  icon: IconType;
  color: string;
}) {
  return (
    <Card
      className={cn(
        "h-full border-none shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-elegant overflow-hidden relative",
        color
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-24 w-24" />
      </div>

      <CardHeader className="relative z-10 text-white">
        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-white/80 text-base leading-relaxed">
          {desc}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="inline-flex items-center text-white font-bold group-hover:underline">
          Manage Now <ArrowUpRight className="ml-2 h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessButton({
  label,
  icon: Icon,
  bg,
  text,
}: {
  label: string;
  icon: IconType;
  bg: string;
  text: string;
}) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors text-left mb-4 last:mb-0">
      <div className="flex items-center gap-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", bg, text)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}