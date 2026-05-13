import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, User, Mail, ShieldCheck, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";
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
import { setAuth } from "@/lib/auth-state";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" | "register" } => ({
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

function GoogleAccountPicker({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (name: string) => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white dark:bg-card rounded-[32px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <svg className="h-8 w-8 mx-auto" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <h3 className="text-xl font-bold">Choose an account</h3>
          <p className="text-sm text-muted-foreground">to continue to HealthChain</p>
        </div>
        
        <div className="space-y-2">
          {[
            { name: "John Doe", email: "john.doe@gmail.com", img: "JD" },
            { name: "Sarah Chen", email: "dr.chen@healthchain.com", img: "SC" },
          ].map((acc) => (
            <button 
              key={acc.email}
              onClick={() => onSelect(acc.name)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {acc.img}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{acc.name}</p>
                <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
              </div>
            </button>
          ))}
          <button className="w-full text-left p-3 text-sm font-medium text-primary hover:underline">Use another account</button>
        </div>
        
        <button onClick={onClose} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}

function GoogleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="w-full h-14 rounded-2xl flex items-center justify-center gap-4 font-bold border-2 transition-all hover:bg-muted/50 hover:border-primary/50 group bg-white dark:bg-card"
    >
      <svg className="h-6 w-6 shrink-0" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
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
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setIsRegister(!isRegister);
    setStep("credentials");
  };

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        await api.auth.register(name, email, password, tab);
        toast.success("Registration successful. Please log in.");
        setIsRegister(false);
        setStep("credentials");
        return;
      }

      const response = await api.auth.login(email, password);
      loginUser(response.token, response.role as "patient" | "doctor" | "admin", response.user_id);
      toast.success("Login successful!");
      navigate({ to: response.role === "doctor" ? "/doctor" : response.role === "admin" ? "/admin" : "/dashboard" });
    } catch (error) {
      toast.error("Authentication failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = (name: string) => {
    setShowGooglePicker(false);
    // Mock login for demo - in real app, this would authenticate with Google
    const mockUserId = name.includes("Chen") ? 2 : 1;
    const mockRole = name.includes("Chen") ? "doctor" : "patient";
    loginUser("mock_token", mockRole as "patient" | "doctor" | "admin", mockUserId);
    toast.success(`Signed in as ${name}`);
    navigate({ to: mockRole === "doctor" ? "/doctor" : "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-background p-4 md:p-8 font-sans overflow-y-auto">
      <GoogleAccountPicker 
        isOpen={showGooglePicker} 
        onClose={() => setShowGooglePicker(false)} 
        onSelect={handleGoogleSelect}
      />

      <motion.div 
        layout
        initial={false}
        className="relative w-full max-w-[1050px] bg-white/80 dark:bg-card/80 backdrop-blur-2xl rounded-[50px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[580px]"
      >
        
        {/* Forms Container: Login */}
        <div className={cn(
          "w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] order-2 md:order-1",
          isRegister ? "md:translate-x-full opacity-0 pointer-events-none scale-95" : "translate-x-0 opacity-100 scale-100"
        )}>
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-1">
              <HealthChainLogo className="mx-auto mb-2 h-14 w-14" />
              <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Login to Vault</h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex bg-muted/30 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTab("patient")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                      tab === "patient" ? "bg-white dark:bg-background shadow-sm text-primary" : "text-muted-foreground"
                    )}
                  >PATIENT</button>
                  <button
                    type="button"
                    onClick={() => setTab("doctor")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                      tab === "doctor" ? "bg-white dark:bg-background shadow-sm text-primary" : "text-muted-foreground"
                    )}
                  >DOCTOR</button>
                  <button
                    type="button"
                    onClick={() => setTab("admin")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                      tab === "admin" ? "bg-white dark:bg-background shadow-sm text-primary" : "text-muted-foreground"
                    )}
                  >ADMIN</button>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                      <button type="button" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        className="pl-12 h-12 bg-muted/30 border-none rounded-xl" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-xs font-black tracking-[0.2em]">
                    {loading ? "LOGGING IN..." : "ACCESS ACCOUNT"}
                  </Button>
                </form>
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 border-t-2 border-muted" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Or</span>
                  <div className="flex-1 border-t-2 border-muted" />
                </div>
                <GoogleButton label="Login with Google" onClick={() => setShowGooglePicker(true)} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Forms Container: Register */}
        <div className={cn(
          "w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] order-3",
          !isRegister ? "md:-translate-x-full opacity-0 pointer-events-none scale-95" : "translate-x-0 opacity-100 scale-100"
        )}>
          <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-1">
              <HealthChainLogo className="mx-auto mb-2 h-14 w-14" />
              <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Create ID</h2>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {tab === "doctor" ? "Doctor Name" : "Full Name"}
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone</Label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input type="tel" className="pl-12 h-11 bg-muted/30 border-none rounded-xl text-sm" placeholder="+1 (555) 123" required />
                  </div>
                </div>

                {tab === "patient" ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">DOB</Label>
                      <Input type="date" className="h-11 bg-muted/30 border-none rounded-xl text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</Label>
                      <Select required>
                        <SelectTrigger className="h-11 bg-muted/30 border-none rounded-xl text-sm"><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Blood</Label>
                      <Select required>
                        <SelectTrigger className="h-11 bg-muted/30 border-none rounded-xl text-sm"><SelectValue placeholder="Blood" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address</Label>
                      <Input className="h-11 bg-muted/30 border-none rounded-xl text-sm" placeholder="Address" required />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Specialty</Label>
                      <Input className="h-11 bg-muted/30 border-none rounded-xl text-sm" placeholder="Cardiology" required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Exp.</Label>
                      <Input type="number" className="h-11 bg-muted/30 border-none rounded-xl text-sm" placeholder="Years" required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hospital</Label>
                      <Input className="h-11 bg-muted/30 border-none rounded-xl text-sm" placeholder="Clinic" required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">License</Label>
                      <Input className="h-11 bg-muted/30 border-none rounded-xl text-sm" placeholder="ID" required />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                    onClick={() => setTab(r as any)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                      tab === r ? "bg-white dark:bg-background shadow-sm text-primary" : "text-muted-foreground"
                    )}
                  >{r}</button>
                ))}
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl text-[10px] font-black tracking-widest bg-gradient-to-r from-primary to-primary-glow">REGISTER NOW</Button>
            </form>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 border-t-2 border-muted" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Or</span>
              <div className="flex-1 border-t-2 border-muted" />
            </div>
            <GoogleButton label="Sign up with Google" onClick={() => setShowGooglePicker(true)} />
          </div>
        </div>

        {/* Sliding Overlay Window */}
        <div 
          className={cn(
            "hidden md:flex absolute top-0 left-0 h-full w-1/2 z-40 transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]",
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
              <h1 className="text-5xl font-black tracking-tighter leading-none uppercase">
                {isRegister ? "Welcome \nBack" : "Health \nChain"}
              </h1>
              <p className="text-lg font-medium opacity-80 max-w-[280px] mx-auto leading-relaxed">
                {isRegister 
                  ? "Access your unified medical history securely." 
                  : "Join the future of intelligent medical records."}
              </p>
              <Button 
                variant="outline" 
                onClick={handleToggle}
                className="mt-4 px-12 h-14 rounded-full border-4 border-white bg-transparent text-white hover:bg-white hover:text-primary text-lg font-black tracking-widest transition-all"
              >
                {isRegister ? "SIGN IN" : "REGISTER"}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Toggle Footer */}
        <div className="md:hidden p-8 text-center bg-muted/20 border-t border-border mt-auto order-last z-40">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {isRegister ? "Member?" : "New?"}{" "}
            <button onClick={handleToggle} className="font-black text-primary hover:underline ml-1">
              {isRegister ? "LOGIN" : "REGISTER"}
            </button>
          </p>
        </div>

      </motion.div>
    </div>
  );
}
