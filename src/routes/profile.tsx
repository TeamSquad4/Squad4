import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRole } from "@/lib/auth-state";
import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  Shield,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    const role = getRole();
    if (!role) throw redirect({ to: "/login" });
    if (role !== "patient") throw redirect({ to: "/doctor" });
  },
  head: () => ({
    meta: [
      { title: "Profile — MedVault" },
      {
        name: "description",
        content: "Manage your personal health profile and information.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    id: 0,
    name: "",
    email: "",
    role: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    insuranceProvider: "",
    insuranceId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, requestsData] = await Promise.all([
          api.profile.getProfile(),
          api.access.getMyRequests(),
        ]);

        setProfile((prev) => ({
          ...prev,
          id: profileData.id,
          name: profileData.name || "",
          email: profileData.email || "",
          role: profileData.role || "",
          phone: profileData.phone || "",
          dob: profileData.dob || "",
          gender: profileData.gender || "",
          bloodGroup: profileData.blood_group || "",
          address: profileData.address || "",
        }));

        setRequests(requestsData);
      } catch (error) {
        toast.error(`Failed to load data: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = () => {
    toast.success("Profile updated locally");
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your personal information and health details.
            </p>
          </div>

          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {profile.name
                    ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{profile.name || "User"}</CardTitle>
              <CardDescription>Patient ID: {profile.id}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">
                    Verified Patient
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-xs text-muted-foreground">January 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details about yourself</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={profile.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        className="pl-9"
                        value={profile.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        className="pl-9"
                        value={profile.dob}
                        onChange={(e) =>
                          handleInputChange("dob", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={profile.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <div className="relative">
                      <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Select
                        value={profile.bloodGroup}
                        onValueChange={(value) =>
                          handleInputChange("bloodGroup", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Blood Group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      className="pl-9 min-h-[80px]"
                      value={profile.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Information</CardTitle>
                <CardDescription>
                  Medical details and emergency contacts
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input
                      value={profile.emergencyContact}
                      onChange={(e) =>
                        handleInputChange("emergencyContact", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Emergency Phone</Label>
                    <Input
                      value={profile.emergencyPhone}
                      onChange={(e) =>
                        handleInputChange("emergencyPhone", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Textarea
                    value={profile.allergies}
                    onChange={(e) =>
                      handleInputChange("allergies", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <Textarea
                    value={profile.medicalConditions}
                    onChange={(e) =>
                      handleInputChange("medicalConditions", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Medications</Label>
                  <Textarea
                    value={profile.currentMedications}
                    onChange={(e) =>
                      handleInputChange("currentMedications", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor Access Requests</CardTitle>
                <CardDescription>
                  Manage requests from doctors to access your medical records
                </CardDescription>
              </CardHeader>

              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            Doctor ID: {req.doctor_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {req.status}
                          </p>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await api.access.approve(req.id);
                                toast.success("Access approved");
                                setRequests((prev) =>
                                  prev.map((r) =>
                                    r.id === req.id
                                      ? { ...r, status: "approved" }
                                      : r
                                  )
                                );
                              }}
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await api.access.reject(req.id);
                                toast.success("Access rejected");
                                setRequests((prev) =>
                                  prev.map((r) =>
                                    r.id === req.id
                                      ? { ...r, status: "rejected" }
                                      : r
                                  )
                                );
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}