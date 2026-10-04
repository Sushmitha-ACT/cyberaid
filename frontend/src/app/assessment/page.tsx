"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, Upload, X, FileImage } from "lucide-react";
import Link from "next/link";
import BackToHome from "@/components/BackToHome";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AssessmentWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanStage, setScanStage] = useState("");
  
  const [formData, setFormData] = useState({
    description: "",
    screenshotBase64: "",
  });

  const updateFormData = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData("screenshotBase64", reader.result as string);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateFormData("screenshotBase64", "");
  };

  const submitAssessment = async () => {
    if (!formData.description.trim()) {
      setError("Please describe the incident.");
      return;
    }
    
    setLoading(true);
    setError("");

    // Start scanning animation
    const stages = ["Uploading...", "Reading interface...", "Detecting platform...", "Running AI Threat Analysis...", "Initializing Recovery Session..."];
    let stageIdx = 0;
    setScanStage(stages[0]);
    const stageInterval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) setScanStage(stages[stages.length - 1]); // keep at last if it takes long
      else setScanStage(stages[Math.min(stageIdx, stages.length - 1)]);
    }, 1200);

    try {
      const res = await fetch("/api/assessment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      clearInterval(stageInterval);
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize recovery session");
      }
      
      router.push(`/dashboard?assessmentId=${data.assessmentId}`);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <BackToHome />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl flex flex-col justify-center">
        <Card className="border-border/50 bg-panel shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
            <div className="h-full bg-primary w-full animate-pulse"></div>
          </div>
          
          <CardHeader className="pb-6 pt-8">
            <CardTitle className="text-3xl font-heading">Report a Digital Incident</CardTitle>
            <CardDescription className="text-lg">
              Our AI incident responder will analyze your situation and generate a dynamic, step-by-step recovery plan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-lg font-semibold" htmlFor="description">What happened?</Label>
              <p className="text-sm text-muted-foreground">Describe the incident in your own words (e.g. "My Instagram account was hacked" or "I clicked a phishing link").</p>
              <textarea 
                id="description"
                className="w-full min-h-[120px] rounded-md border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                placeholder="I received a suspicious email from 'Apple Support' and clicked the link..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Upload Evidence (Highly Recommended)</Label>
              <p className="text-sm text-muted-foreground">Upload a screenshot related to the incident so our AI can accurately assess the threat.</p>
              
              {!formData.screenshotBase64 ? (
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer relative group bg-background/50">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                  <Upload className="h-10 w-10 text-muted-foreground mb-4 group-hover:text-primary group-hover:scale-110 transition-all" />
                  <p className="font-medium text-lg">Click or drag an image here</p>
                  <p className="text-sm text-muted-foreground mt-2">Max size: 5MB (PNG, JPG, WEBP)</p>
                </div>
              ) : (
                <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileImage className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-primary">Screenshot attached</p>
                      <p className="text-xs text-muted-foreground">Ready for AI analysis</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeImage} className="hover:text-destructive" disabled={loading}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
            
            {loading && scanStage && (
              <div className="border border-primary/30 bg-primary/10 rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div className="flex flex-col items-center">
                  <p className="font-medium text-primary">AI Threat Analysis in Progress...</p>
                  <p className="text-sm text-muted-foreground animate-pulse mt-1">{scanStage}</p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6 border-t border-border/50">
            <Link href="/" className={buttonVariants({ variant: "outline" })} aria-disabled={loading}>
              Cancel
            </Link>
            
            <Button onClick={submitAssessment} disabled={loading || !formData.description.trim()} className="min-w-[180px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Start Recovery Session <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
