import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRole } from "@/lib/auth-state";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Plus,
  ShieldCheck,
  ShieldX,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Stethoscope,
  Activity,
  History,
  ShieldAlert,
  Search,
} from "lucide-react";
import { 
  doctorAccessList, 
  emergencyRequests as initialEmergencyRequests, 
  systemLogs,
  type DoctorAccess,
  type EmergencyRequest 
} from "@/lib/mock-data";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const role = getRole();
    if (!role || role !== "admin") throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard — MedVault" },
      { name: "description", content: "Hospital and doctor management system." },
    ],
  }),
  component: AdminPage,
});

// Mock hospital data
const mockHospitals = [
  { id: "h1", name: "Mount Sinai Medical Center", location: "New York, NY", contact: "+1 (212) 241-6500", email: "info@mountsinai.org", verified: true },
  { id: "h2", name: "Cleveland Clinic", location: "Cleveland, OH", contact: "+1 (216) 444-2200", email: "info@clevelandclinic.org", verified: true },
  { id: "h3", name: "Johns Hopkins Hospital", location: "Baltimore, MD", contact: "+1 (410) 955-5000", email: "info@jhmi.edu", verified: true },
  { id: "h4", name: "Mayo Clinic", location: "Rochester, MN", contact: "+1 (507) 284-2511", email: "info@mayo.edu", verified: false },
];

function AdminPage() {
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [doctors, setDoctors] = useState<DoctorAccess[]>(doctorAccessList);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>(initialEmergencyRequests);
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newHospital, setNewHospital] = useState({
    name: "",
    location: "",
    contact: "",
    email: "",
  });

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    hospital: "",
    doctorId: "",
  });

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospital.name || !newHospital.location) return;

    const hospital = {
      id: `h${Date.now()}`,
      ...newHospital,
      verified: false,
    };

    setHospitals([hospital, ...hospitals]);
    setIsAddHospitalOpen(false);
    setNewHospital({ name: "", location: "", contact: "", email: "" });
    toast.success("Hospital added successfully", { description: "Pending verification." });
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.doctorId) return;

    const doctor: DoctorAccess = {
      id: `d${Date.now()}`,
      name: newDoctor.name.startsWith("Dr. ") ? newDoctor.name : `Dr. ${newDoctor.name}`,
      specialty: newDoctor.specialty,
      hospital: newDoctor.hospital,
      doctorId: newDoctor.doctorId,
      avatarColor: `oklch(0.6 0.1 ${Math.floor(Math.random() * 360)})`,
      canView: false,
      canDownload: false,
      grantedDate: new Date().toISOString().split('T')[0],
      accessLevel: "view",
      emergencyAccess: false,
      verified: false,
    };

    setDoctors([doctor, ...doctors]);
    setIsAddDoctorOpen(false);
    setNewDoctor({ name: "", specialty: "", hospital: "", doctorId: "" });
    toast.success("Doctor added successfully", { description: "Pending verification." });
  };

  const toggleHospitalVerification = (id: string) => {
    setHospitals(prev => prev.map(h => 
      h.id === id ? { ...h, verified: !h.verified } : h
    ));
    toast.success("Hospital verification updated");
  };

  const toggleDoctorVerification = (id: string) => {
    setDoctors(prev => prev.map(d => 
      d.id === id ? { ...d, verified: !d.verified } : d
    ));
    toast.success("Doctor verification updated");
  };

  const handleEmergencyAction = (id: string, action: "approved" | "denied") => {
    setEmergencyRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action } : req
    ));
    toast.info(`Emergency request ${action}`);
  };

  const verifiedDoctors = doctors.filter(d => d.verified === true).length;
  const verifiedHospitals = hospitals.filter(h => h.verified).length;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Admin Control</h1>
            <p className="text-muted-foreground font-medium">
              Enterprise management for HealthChain network
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsAddHospitalOpen(true)}
              variant="outline"
              className="rounded-xl border-2 font-bold"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Add Hospital
            </Button>
            <Button 
              onClick={() => setIsAddDoctorOpen(true)}
              className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 rounded-xl px-6 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto flex-wrap sm:flex-nowrap">
            <TabsTrigger value="overview" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Activity className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="mr-2 h-4 w-4" /> Hospitals
            </TabsTrigger>
            <TabsTrigger value="doctors" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Stethoscope className="mr-2 h-4 w-4" /> Doctors
            </TabsTrigger>
            <TabsTrigger value="emergency" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShieldAlert className="mr-2 h-4 w-4" /> Emergency
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <History className="mr-2 h-4 w-4" /> System Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Verified Hospitals", value: verifiedHospitals, total: hospitals.length, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Verified Doctors", value: verifiedDoctors, total: doctors.length, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Total Users", value: doctors.length + 142, total: 200, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Network Health", value: 98, total: 100, icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10", unit: "%" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-elegant overflow-hidden group">
                  <CardContent className="p-6 relative">
                    <div className={cn("absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110", stat.color)}>
                      <stat.icon className="h-24 w-24" />
                    </div>
                    <div className="space-y-4">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-black">{stat.value}{stat.unit}</p>
                          <p className="text-sm text-muted-foreground font-bold">/ {stat.total}</p>
                        </div>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</p>
                      </div>
                      <Progress value={(stat.value / stat.total) * 100} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-none shadow-elegant">
                <CardHeader>
                  <CardTitle className="uppercase font-black text-sm tracking-widest">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {systemLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                          log.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                        )}>
                          {log.status === "success" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{log.user} — {log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.resource}</p>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">{log.timestamp.split(" ")[1]}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-elegant">
                <CardHeader>
                  <CardTitle className="uppercase font-black text-sm tracking-widest">Pending Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {doctors.filter(d => d.verified === false).slice(0, 3).map((doctor) => (
                      <div key={doctor.id} className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {doctor.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-lg font-bold" onClick={() => toggleDoctorVerification(doctor.id)}>Verify</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="uppercase font-black text-xl">Hospital Network</CardTitle>
                  <CardDescription className="font-medium">Registered medical facilities across the network</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search hospitals..." className="pl-10 rounded-xl" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-muted/50">
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Hospital</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Location</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Contact</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((hospital) => (
                      <TableRow key={hospital.id} className="border-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold">{hospital.name}</p>
                              <p className="text-xs text-muted-foreground">{hospital.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {hospital.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {hospital.contact}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hospital.verified ? "default" : "secondary"} className="rounded-full px-3 py-0.5 gap-1.5 font-bold">
                            {hospital.verified ? (
                              <><CheckCircle className="h-3 w-3" /> Verified</>
                            ) : (
                              <><XCircle className="h-3 w-3" /> Pending</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHospitalVerification(hospital.id)}
                            className={cn(
                              "font-bold rounded-lg",
                              hospital.verified ? "text-destructive hover:bg-destructive/10" : "text-green-500 hover:bg-green-500/10"
                            )}
                          >
                            {hospital.verified ? "Revoke" : "Verify"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="uppercase font-black text-xl">Doctor Registry</CardTitle>
                  <CardDescription className="font-medium">Authorized healthcare providers in HealthChain</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search doctors..." className="pl-10 rounded-xl" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-muted/50">
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Doctor</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Specialty</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">License ID</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((doctor) => (
                      <TableRow key={doctor.id} className="border-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                              <AvatarFallback className="bg-primary/10 text-xs font-black text-primary">
                                {doctor.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold">{doctor.name}</p>
                              <p className="text-xs text-muted-foreground font-medium">{doctor.hospital}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-bold text-muted-foreground">{doctor.specialty}</TableCell>
                        <TableCell className="text-sm font-mono font-bold">{doctor.doctorId}</TableCell>
                        <TableCell>
                          <Badge variant={doctor.verified === true ? "default" : "secondary"} className="rounded-full px-3 py-0.5 gap-1.5 font-bold">
                            {doctor.verified === true ? (
                              <><CheckCircle className="h-3 w-3" /> Verified</>
                            ) : (
                              <><XCircle className="h-3 w-3" /> Pending</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDoctorVerification(doctor.id)}
                            className={cn(
                              "font-bold rounded-lg",
                              doctor.verified === true ? "text-destructive hover:bg-destructive/10" : "text-green-500 hover:bg-green-500/10"
                            )}
                          >
                            {doctor.verified === true ? "Revoke" : "Verify"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6">
              {emergencyRequests.map((req) => (
                <Card key={req.id} className={cn(
                  "border-none shadow-elegant overflow-hidden",
                  req.status === "pending" ? "ring-2 ring-primary/20" : ""
                )}>
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className={cn(
                      "w-2 shrink-0",
                      req.status === "pending" ? "bg-primary animate-pulse" : req.status === "approved" ? "bg-green-500" : "bg-red-500"
                    )} />
                    <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={req.status === "pending" ? "secondary" : "outline"} className="uppercase text-[10px] font-black tracking-widest">
                            {req.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-bold">{req.time}</span>
                        </div>
                        <h3 className="text-xl font-black">{req.patientName}</h3>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
                          <span className="flex items-center gap-1"><Stethoscope className="h-4 w-4" /> {req.doctorName}</span>
                          <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {req.hospital}</span>
                        </div>
                        <p className="text-sm bg-muted/30 p-3 rounded-xl border border-muted/50 font-medium italic">
                          "{req.reason}"
                        </p>
                      </div>
                      
                      {req.status === "pending" && (
                        <div className="flex gap-3 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 md:flex-none border-2 text-destructive border-destructive/20 hover:bg-destructive/5 font-bold rounded-xl"
                            onClick={() => handleEmergencyAction(req.id, "denied")}
                          >
                            Deny
                          </Button>
                          <Button 
                            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 font-bold rounded-xl px-8"
                            onClick={() => handleEmergencyAction(req.id, "approved")}
                          >
                            Approve Access
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-elegant">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-muted/50">
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Timestamp</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">User</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Action</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">Resource</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest">IP Address</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id} className="border-muted/50">
                        <TableCell className="text-xs font-mono font-bold text-muted-foreground">{log.timestamp}</TableCell>
                        <TableCell className="font-bold">{log.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold bg-muted/50">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{log.resource}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{log.ip}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              log.status === "success" ? "bg-green-500" : log.status === "failure" ? "bg-red-500" : "bg-orange-500"
                            )} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Hospital Dialog */}
        <Dialog open={isAddHospitalOpen} onOpenChange={setIsAddHospitalOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh opacity-20" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Add Hospital</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 font-medium">
                  Register a new medical facility in the HealthChain network.
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleAddHospital} className="p-8 space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={newHospital.name}
                    onChange={e => setNewHospital({...newHospital, name: e.target.value})}
                    placeholder="e.g. Mayo Clinic"
                    className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalLocation" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location</Label>
                  <Input
                    id="hospitalLocation"
                    value={newHospital.location}
                    onChange={e => setNewHospital({...newHospital, location: e.target.value})}
                    placeholder="City, State"
                    className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalContact" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact</Label>
                    <Input
                      id="hospitalContact"
                      value={newHospital.contact}
                      onChange={e => setNewHospital({...newHospital, contact: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalEmail" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                    <Input
                      id="hospitalEmail"
                      type="email"
                      value={newHospital.email}
                      onChange={e => setNewHospital({...newHospital, email: e.target.value})}
                      placeholder="admin@hospital.com"
                      className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAddHospitalOpen(false)} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-8 font-bold bg-primary text-primary-foreground">Add Hospital</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Doctor Dialog */}
        <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh opacity-20" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Add Doctor</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 font-medium">
                  Register a new healthcare professional.
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleAddDoctor} className="p-8 space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="doctorName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <Input
                    id="doctorName"
                    value={newDoctor.name}
                    onChange={e => setNewDoctor({...newDoctor, name: e.target.value})}
                    placeholder="Dr. John Smith"
                    className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorSpecialty" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Specialization</Label>
                  <Input
                    id="doctorSpecialty"
                    value={newDoctor.specialty}
                    onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})}
                    placeholder="e.g. Cardiology"
                    className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorHospital" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hospital Assignment</Label>
                  <Input
                    id="doctorHospital"
                    value={newDoctor.hospital}
                    onChange={e => setNewDoctor({...newDoctor, hospital: e.target.value})}
                    placeholder="Select hospital"
                    className="h-12 rounded-xl bg-muted/30 border-none px-4 font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Medical License ID</Label>
                  <Input
                    id="doctorId"
                    value={newDoctor.doctorId}
                    onChange={e => setNewDoctor({...newDoctor, doctorId: e.target.value})}
                    placeholder="DOC-XXXXXX"
                    className="h-12 rounded-xl bg-muted/30 border-none px-4 font-mono font-bold"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAddDoctorOpen(false)} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-8 font-bold bg-primary text-primary-foreground">Add Doctor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}