import { useState, useRef, useEffect } from "react";
import { X, Send, Activity, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Markdown from "markdown-to-jsx";
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ColorfulAiLogo } from "@/components/logo";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}



const SYSTEM_INSTRUCTION = `You are the HealthChain AI Assistant. You help users navigate the HealthChain app and answer health questions.
If a user asks how to do an action (e.g., upload a report, add a doctor, open settings, view records), you MUST include a specific navigation command in your response exactly as formatted below.
Commands available:
- To upload a report: [NAVIGATE:/upload]
- To manage access/add doctor: [NAVIGATE:/access]
- To view records: [NAVIGATE:/records]
- To open dashboard: [NAVIGATE:/dashboard]
You can include this command anywhere in your response, and the app will automatically perform it.
For health questions, you must always include a brief disclaimer that you are an AI and they should consult a professional.
Keep your answers concise and friendly.`;

export function AiAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am **HealthChain AI**. How can I help you manage your medical records today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("Missing API Key");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      if (response.text) {
        let text = response.text;
        
        const navMatch = text.match(/\[NAVIGATE:([^\]]+)\]/);
        if (navMatch) {
          const route = navMatch[1];
          navigate({ to: route });
          toast.success(`Navigating to ${route}`);
          text = text.replace(/\[NAVIGATE:[^\]]+\]/g, "");
        }
        
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "model", content: text.trim() || "Executing action..." }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          content: "Sorry, I am currently unavailable. Please check your API key configuration.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100]">
        {!isOpen && (
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl group-hover:bg-primary/60 transition-all animate-pulse" />
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-white dark:bg-muted border-4 border-primary shadow-2xl transition-all hover:scale-110 p-0 overflow-hidden relative z-10"
              onClick={() => setIsOpen(true)}
            >
              <div className="h-full w-full flex items-center justify-center">
                <ColorfulAiLogo size={32} />
              </div>
            </Button>
          </div>
        )}

        {isOpen && (
          <Card className="w-[380px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-border/40 overflow-hidden flex flex-col h-[600px] max-h-[85vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 rounded-[40px] backdrop-blur-xl bg-white/95 dark:bg-card/95">
            <CardHeader className="bg-primary text-primary-foreground p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl p-1.5 shadow-lg">
                  <ColorfulAiLogo size={28} />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight">HealthChain AI</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 h-10 w-10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <div className="bg-muted/50 px-6 py-2 border-b flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>MedVault Intelligence v4.0</span>
            </div>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-[24px] px-5 py-3.5 text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none font-medium"
                        : "bg-white dark:bg-muted text-foreground rounded-bl-none border border-border/50 leading-relaxed"
                    )}
                  >
                    <Markdown className="prose prose-sm dark:prose-invert max-w-none">{m.content}</Markdown>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-muted text-primary max-w-[80%] rounded-[24px] rounded-bl-none px-5 py-4 text-sm flex gap-1.5 shadow-sm border border-border/50">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-4 border-t bg-white/50 dark:bg-card/50">
              <form onSubmit={handleSend} className="flex w-full gap-3 items-center">
                <Input
                  placeholder="Ask me anything..."
                  className="flex-1 bg-muted/30 border-2 border-transparent focus-visible:border-primary/20 rounded-[20px] h-12 px-5 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="shrink-0 h-12 w-12 bg-primary text-white rounded-[18px] shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
