import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  ShieldCheck,
  Stethoscope,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRole, clearAuth } from "@/lib/auth-state";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { medicalRecords } from "@/lib/mock-data";
import { AiAssistant } from "@/components/ai-assistant";
import { HealthChainLogo } from "@/components/logo";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("patient" | "doctor" | "admin")[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["patient"] },
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard, roles: ["doctor"] },
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/doctor/patients", label: "Patients", icon: Users, roles: ["doctor"] },
  { to: "/records", label: "Medical Records", icon: FileText, roles: ["patient", "doctor"] },
  { to: "/timeline", label: "Timeline", icon: Activity, roles: ["patient", "doctor"] },
  { to: "/upload", label: "Upload Records", icon: Upload, roles: ["patient"] },
  { to: "/profile", label: "My Profile", icon: User, roles: ["patient"] },
  { to: "/access", label: "Access Control", icon: ShieldCheck, roles: ["patient"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const role = getRole() ?? "patient";

  const visibleItems = navItems.filter((i) => i.roles.includes(role as any));

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSuggestions = searchQuery.trim()
    ? medicalRecords.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.hospital.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/records", search: { q: searchQuery } });
      setShowSuggestions(false);
    }
  };

  const handleThemeToggle = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 350,
          easing: "ease-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const handleLogout = () => {
    clearAuth();
    navigate({ to: "/login" });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="flex min-h-screen w-full bg-background overflow-hidden relative"
    >
      {/* Interactive Glow */}
      <div
        className="pointer-events-none absolute z-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] transition-opacity duration-1000"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <Link 
          to={role === "doctor" ? "/doctor" : role === "admin" ? "/admin" : "/dashboard"}
          className="flex h-20 items-center gap-3 border-b border-sidebar-border px-4 group transition-colors hover:bg-sidebar-accent/50 cursor-pointer"
        >
          <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-white dark:bg-muted rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
            <HealthChainLogo size={32} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                HealthChain
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-sidebar-foreground/40 transition-colors">
                MEDICAL VAULT
              </span>
            </div>
          )}
        </Link>

        <nav className="flex-1 space-y-1 p-3">
          {visibleItems.map((item) => {
            const active = location.pathname === item.to ||
              (item.to !== "/dashboard" && item.to !== "/doctor" && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 group",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-elegant"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-300",
                  !active && "group-hover:scale-125 group-hover:text-primary-glow group-hover:-translate-y-0.5",
                  active && "scale-110"
                )} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center justify-center gap-2 rounded-md p-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn("flex flex-1 flex-col transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur">
          <form ref={searchRef} onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search records, doctors, prescriptions..."
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-card transition-all duration-300 focus-visible:ring-primary/50"
            />
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 mt-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {searchSuggestions.length > 0 ? (
                  <ul className="py-2">
                    {searchSuggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted focus:bg-muted transition-colors flex flex-col"
                          onClick={() => {
                            setSearchQuery(suggestion.name);
                            setShowSuggestions(false);
                            navigate({ to: "/records", search: { q: suggestion.name } });
                          }}
                        >
                          <span className="font-medium">{suggestion.name}</span>
                          <span className="text-xs text-muted-foreground flex gap-2">
                            <span>{suggestion.doctor}</span>
                            <span>&middot;</span>
                            <span>{suggestion.type}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No results found.</div>
                )}
              </div>
            )}
          </form>

          <div className="ml-auto flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group hover:bg-primary/10 transition-colors">
                  <Bell className="h-5 w-5 transition-transform duration-300 origin-top group-hover:rotate-12 group-hover:scale-110" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={8}
                collisionPadding={16}
                className="w-80"
              >
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <div className="flex w-full items-center gap-2">
                    <Activity className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">AI Alert</span>
                    <span className="ml-auto text-xs text-muted-foreground">8m</span>
                  </div>
                  <p className="text-xs text-muted-foreground">High cholesterol detected in latest panel</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <div className="flex w-full items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">New record</span>
                    <span className="ml-auto text-xs text-muted-foreground">1h</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Dr. Chen uploaded CBC results</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="rounded-full group hover:bg-primary/10 transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 group-hover:text-warning" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 group-hover:text-primary-glow" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full p-1 pr-3 transition hover:bg-muted">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                      {role === "doctor" ? "DR" : role === "admin" ? "AD" : "JD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium leading-tight">
                      {role === "doctor" ? "Dr. Sarah Chen" : role === "admin" ? "Admin User" : "John Doe"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                      {role === "doctor" ? <Stethoscope className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                      {role}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={8}
                collisionPadding={16}
                className="w-56"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group">
                  <User className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="group">
                  <Settings className="mr-2 h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AiAssistant />
    </div>
  );
}

export function StatusBadge({ status }: { status: "Stable" | "Monitoring" | "Critical" }) {
  const map = {
    Stable: "bg-success/15 text-success border-success/30",
    Monitoring: "bg-warning/15 text-warning-foreground border-warning/40",
    Critical: "bg-destructive/15 text-destructive border-destructive/30",
  } as const;
  return (
    <Badge variant="outline" className={cn("font-medium", map[status])}>
      {status}
    </Badge>
  );
}
