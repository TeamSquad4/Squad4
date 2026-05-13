import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, User, Mail, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HealthChainLogo } from "@/components/logo";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/services/auth-context";

export const Route = createFileRoute("/login")({
  validateSearch: (
    search: Record<string, unknown>
  ): { mode?: "signin" | "register" } => ({
    mode: (search.mode as "signin" | "register") || "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — HealthChain" },
      { name: "description", content: "Secure medical records management." },
    ],
  }),
  component: LoginPage,
});

function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      type="button"
      onClick={onClick}
      className="w-full h-14 rounded-2xl flex items-center justify-center gap-4 font-bold border-2 bg-white dark:bg-card"
    >
      <span className="text-foreground">{label}</span>
    </Button>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const { login: loginUser } = useAuth();

  const [tab, setTab] = useState<"patient" | "doctor" | "admin">("patient");
  const [isRegister, setIsRegister] = useState(search.mode === "register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setIsRegister(!isRegister);
  };

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          toast.error("Please enter your name.");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        await api.auth.register({
          name,
          email,
          password,
          role: tab,
          phone,
          dob,
          gender,
          blood_group: bloodGroup,
          address,
        });

        toast.success("Account created successfully. Please login now.");
        setIsRegister(false);
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const response = await api.auth.login(email, password);

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("user_id", String(response.user_id));

      loginUser(
        response.token,
        response.role as "patient" | "doctor" | "admin",
        response.user_id
      );

      toast.success("Login successful!");

      navigate({
        to:
          response.role === "doctor"
            ? "/doctor"
            : response.role === "admin"
              ? "/admin"
              : "/dashboard",
      });
    } catch (error) {
      toast.error("Authentication failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-background p-4 md:p-8 font-sans overflow-y-auto">
      <motion.div
        layout
        initial={false}
        className="relative w-full max-w-[1050px] bg-white/80 dark:bg-card/80 backdrop-blur-2xl rounded-[50px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[580px]"
      >
        <div
          className={cn(
            "w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center transition-all duration-700 order-2 md:order-1",
            isRegister
              ? "md:translate-x-full opacity-0 pointer-events-none scale-95"
              : "translate-x-0 opacity-100 scale-100"
          )}
        >
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-1">
              <HealthChainLogo className="mx-auto mb-2 h-14 w-14" />
              <h2 className="text-2xl font-black tracking-tight uppercase">
                Login to Vault
              </h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-12 h-12 bg-muted/30 border-none rounded-xl"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        className="pl-12 h-12 bg-muted/30 border-none rounded-xl"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-xs font-black tracking-[0.2em]"
                  >
                    {loading ? "LOGGING IN..." : "ACCESS ACCOUNT"}
                  </Button>
                </form>

                <GoogleButton label="Login with Google" onClick={() => {}} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className={cn(
            "w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center transition-all duration-700 order-3",
            !isRegister
              ? "md:-translate-x-full opacity-0 pointer-events-none scale-95"
              : "translate-x-0 opacity-100 scale-100"
          )}
        >
          <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-1">
              <HealthChainLogo className="mx-auto mb-2 h-14 w-14" />
              <h2 className="text-2xl font-black tracking-tight uppercase">
                Create ID
              </h2>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label>{tab === "doctor" ? "Doctor Name" : "Full Name"}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-12 h-11 bg-muted/30 border-none rounded-xl text-sm"
                      placeholder={tab === "doctor" ? "Dr. Full Name" : "Full Name"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      className="pl-12 h-11 bg-muted/30 border-none rounded-xl text-sm"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      className="pl-12 h-11 bg-muted/30 border-none rounded-xl text-sm"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {tab === "patient" && (
                  <>
                    <div className="space-y-1">
                      <Label>DOB</Label>
                      <Input
                        type="date"
                        className="h-11 bg-muted/30 border-none rounded-xl text-sm"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Gender</Label>
                      <Select value={gender} onValueChange={setGender} required>
                        <SelectTrigger className="h-11 bg-muted/30 border-none rounded-xl text-sm">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Blood</Label>
                      <Select
                        value={bloodGroup}
                        onValueChange={setBloodGroup}
                        required
                      >
                        <SelectTrigger className="h-11 bg-muted/30 border-none rounded-xl text-sm">
                          <SelectValue placeholder="Blood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label>Address</Label>
                      <Input
                        className="h-11 bg-muted/30 border-none rounded-xl text-sm"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      className="pl-12 h-11 bg-muted/30 border-none rounded-xl text-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Confirm</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      className="pl-12 h-11 bg-muted/30 border-none rounded-xl text-sm"
                      placeholder="Confirm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex bg-muted/20 p-1 rounded-xl">
                {["patient", "doctor"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTab(r as "patient" | "doctor")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      tab === r
                        ? "bg-white dark:bg-background shadow-sm text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-[10px] font-black tracking-widest bg-gradient-to-r from-primary to-primary-glow"
              >
                {loading ? "REGISTERING..." : "REGISTER NOW"}
              </Button>
            </form>

            <GoogleButton label="Sign up with Google" onClick={() => {}} />
          </div>
        </div>

        <div
          className={cn(
            "hidden md:flex absolute top-0 left-0 h-full w-1/2 z-40 transition-all duration-700",
            isRegister ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="h-full w-full bg-primary relative flex flex-col items-center justify-center text-primary-foreground p-16 text-center">
            <div className="absolute inset-0 bg-mesh opacity-40 mix-blend-overlay" />
            <motion.div
              key={isRegister ? "reg-text" : "login-text"}
              initial={{ opacity: 0, x: isRegister ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black tracking-widest uppercase">
                <Sparkles className="h-4 w-4" /> Blockchain Secured
              </div>

              <h1 className="text-5xl font-black tracking-tighter leading-none uppercase whitespace-pre-line">
                {isRegister ? "Welcome \nBack" : "Health \nChain"}
              </h1>

              <p className="text-lg font-medium opacity-80 max-w-[280px] mx-auto leading-relaxed">
                {isRegister
                  ? "Access your unified medical history securely."
                  : "Join the future of intelligent medical records."}
              </p>

              <Button
                variant="outline"
                type="button"
                onClick={handleToggle}
                className="mt-4 px-12 h-14 rounded-full border-4 border-white bg-transparent text-white hover:bg-white hover:text-primary text-lg font-black tracking-widest"
              >
                {isRegister ? "SIGN IN" : "REGISTER"}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="md:hidden p-8 text-center bg-muted/20 border-t border-border mt-auto order-last z-40">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {isRegister ? "Member?" : "New?"}{" "}
            <button
              type="button"
              onClick={handleToggle}
              className="font-black text-primary hover:underline ml-1"
            >
              {isRegister ? "LOGIN" : "REGISTER"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}