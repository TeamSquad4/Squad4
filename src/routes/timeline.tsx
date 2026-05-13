import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRole } from "@/lib/auth-state";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Pill,
  Scan,
  ClipboardList,
  Calendar,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react";
import { medicalRecords, type RecordType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timeline")({
  beforeLoad: () => {
    const role = getRole();
    if (!role) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Medical Timeline — MedVault" },
      { name: "description", content: "View your medical history in chronological order." },
    ],
  }),
  component: TimelinePage,
});

const typeIconMap: Record<RecordType, { Icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  "Lab Report": { Icon: ClipboardList, color: "text-info", bg: "bg-info/10" },
  Prescription: { Icon: Pill, color: "text-success", bg: "bg-success/10" },
  Scan: { Icon: Scan, color: "text-primary", bg: "bg-primary/10" },
  "Discharge Summary": { Icon: FileText, color: "text-warning-foreground", bg: "bg-warning/15" },
};

function TimelinePage() {
  // Sort records by date (newest first)
  const sortedRecords = [...medicalRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group records by year and month
  const groupedRecords = sortedRecords.reduce((acc, record) => {
    const date = new Date(record.date);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {} as Record<string, typeof medicalRecords>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Timeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your complete medical history in chronological order
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([period, records]) => {
            const [year, month] = period.split('-');
            return (
              <div key={period} className="relative">
                {/* Timeline header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {month.slice(0, 3)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{month} {year}</h2>
                    <p className="text-sm text-muted-foreground">{records.length} medical event{records.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Timeline line */}
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />

                {/* Records */}
                <div className="space-y-6 ml-16">
                  {records.map((record, index) => {
                    const { Icon, color, bg } = typeIconMap[record.type];
                    const isLast = index === records.length - 1;
                    
                    return (
                      <div key={record.id} className="relative">
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute -left-10 top-6 h-4 w-4 rounded-full border-4 border-background",
                          bg.replace('bg-', 'bg-')
                        )} />

                        <Card className="border-border/60 shadow-card hover:shadow-elegant transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", bg)}>
                                  <Icon className={cn("h-4 w-4", color)} />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{record.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-2">
                                    <span>{record.doctor}</span>
                                    <span>•</span>
                                    <span>{record.hospital}</span>
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline" className={cn("font-medium", color)}>
                                  {record.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(record.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* AI Summary */}
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
                                <Sparkles className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-info mb-1">AI Summary</p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {record.aiSummary}
                                  </p>
                                </div>
                              </div>

                              {/* Key findings */}
                              <div className="grid gap-2 sm:grid-cols-2">
                                {record.details.slice(0, 4).map((detail) => (
                                  <div key={detail.label} className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                                    <span className="text-xs text-muted-foreground">{detail.label}</span>
                                    <span className={cn(
                                      "text-xs font-semibold",
                                      detail.value.includes("↑") && "text-destructive",
                                      detail.value.includes("↓") && "text-warning-foreground",
                                    )}>
                                      {detail.value}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Activity className="h-3 w-3" />
                                  <span>{record.fileSize}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  View Details
                                  <ChevronRight className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Connection line to next item */}
                        {!isLast && (
                          <div className="absolute -left-10 top-16 bottom-0 w-0.5 bg-border" style={{ height: 'calc(100% + 1.5rem)' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(groupedRecords).length === 0 && (
          <Card className="border-border/60 shadow-card">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No medical records yet</h3>
              <p className="text-muted-foreground mb-4">
                Your medical timeline will appear here once you upload records.
              </p>
              <Button className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
                Upload First Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}