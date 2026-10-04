"use client";

import { useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, ShieldCheck, Mail } from "lucide-react";

export default function ClaimCertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/academy/issue-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: resolvedParams.courseId, name })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to issue certificate");
      }

      // Success, redirect to the new certificate
      router.push(`/academy/certificate/${data.certificateId}`);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10 shadow-2xl relative z-10">
        <form onSubmit={handleClaim}>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 border border-secondary/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Award className="w-8 h-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl font-bold">Course Completed!</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Congratulations! You have successfully completed the course. Enter your name exactly as you want it to appear on your official certificate.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Full Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Mail className="w-4 h-4" />
              <span>A copy will also be emailed to your account address.</span>
            </div>
          </CardContent>
          
          <CardFooter className="pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              disabled={loading || !name.trim()}
            >
              {loading ? "Generating..." : "Claim Certificate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
