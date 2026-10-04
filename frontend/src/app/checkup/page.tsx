"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, ShieldAlert, FileText, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import LinkTo from "next/link";
import BackToHome from "@/components/BackToHome";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CheckupResult {
  isScam: boolean;
  confidence: number;
  explanation: string;
  redFlags: string[];
}

export default function MessageCheckup() {
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<CheckupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!message.trim()) return;

    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/checkup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageContent: message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze message");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <BackToHome />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            Message Checkup
          </h1>
          <p className="text-xl text-muted-foreground">
            Paste a suspicious email, SMS, or DM below. Our AI will analyze it for phishing or scam indicators.
          </p>
        </div>

        <div className="bg-panel border border-border rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Message Content
            </label>
            <Textarea 
              placeholder="Paste the suspicious text here..." 
              className="min-h-[200px] resize-y bg-background font-mono text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isVerifying}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md mb-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleVerify} 
              disabled={!message.trim() || isVerifying}
              className="font-mono uppercase tracking-wider"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  Verify Message <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className={`border p-8 rounded-xl ${
                result.isScam 
                  ? "bg-destructive/5 border-destructive/30" 
                  : "bg-green-500/5 border-green-500/30"
              }`}>
                <div className="flex items-start gap-4 mb-6">
                  {result.isScam ? (
                    <ShieldAlert className="h-12 w-12 text-destructive shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-12 w-12 text-green-500 shrink-0" />
                  )}
                  <div>
                    <h2 className={`text-3xl font-heading font-bold mb-2 ${result.isScam ? "text-destructive" : "text-green-500"}`}>
                      {result.isScam ? "Suspicious Activity Detected" : "Appears Safe"}
                    </h2>
                    <p className="text-foreground text-lg">{result.explanation}</p>
                  </div>
                </div>

                <div className="bg-background border border-border/50 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <span className="font-medium">AI Confidence Score</span>
                  <span className="text-2xl font-mono font-bold text-primary">{result.confidence}%</span>
                </div>

                {result.redFlags && result.redFlags.length > 0 && (
                  <div className="bg-background border border-border/50 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Identified Red Flags
                    </h3>
                    <ul className="space-y-3">
                      {result.redFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-destructive font-bold mt-0.5">•</span>
                          <span className="text-foreground">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.isScam && (
                  <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center">
                    <p className="text-muted-foreground">If you engaged with this message, you might need a recovery plan.</p>
                    <LinkTo href="/assessment" className={buttonVariants({ variant: "destructive" })}>
                      Start Recovery Plan
                    </LinkTo>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
