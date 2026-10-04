"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Upload, X, FileImage, Loader2, Sparkles, Lightbulb, AlertOctagon, Link as LinkIcon, Video, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function DashboardContent() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams?.get("assessmentId");
  
  const [incident, setIncident] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [generatingStep, setGeneratingStep] = useState(false);
  
  // Verification Engine State
  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [verificationState, setVerificationState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [verificationFeedback, setVerificationFeedback] = useState<any>(null);
  const [scanStage, setScanStage] = useState(0);
  const [userDescription, setUserDescription] = useState("");

  const fetchIncident = async () => {
    if (!assessmentId) return;
    try {
      const res = await fetch(`/api/assessment/${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        const ctx = data.incident?.contextData;
        
        if (ctx?.isComplete) {
          setIsComplete(true);
          setLoading(false);
          return;
        }

        const generated = ctx?.generatedSteps || [];
        const completed = ctx?.completedSteps || [];
        
        // If no steps generated, or all generated steps are completed, generate next
        if (generated.length === 0 || completed.length >= generated.length) {
          generateNextStep();
        } else {
          setActiveStep(generated[generated.length - 1]);
          setStepCompleted(false);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const generateNextStep = async () => {
    setGeneratingStep(true);
    try {
      const res = await fetch("/api/assessment/next-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId })
      });
      const data = await res.json();
      
      if (data.step === null) {
        setIsComplete(true);
      } else if (data.step) {
        setActiveStep(data.step);
        setStepCompleted(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingStep(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [assessmentId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
        setVerificationState("idle");
        setVerificationFeedback(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!screenshotBase64 || !activeStep) return;
    
    setVerificationState("scanning");
    setScanStage(0);
    
    const stages = ["Uploading...", "Running OCR...", "Reading interface...", "Detecting platform...", "Comparing expected screen...", "Checking completion..."];
    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) setScanStage(stageIdx);
    }, 1000);

    try {
      const res = await fetch("/api/verify-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          stepTitle: activeStep.title,
          stepDescription: activeStep.instructions,
          screenshotBase64,
          userDescription
        })
      });

      clearInterval(stageInterval);
      const data = await res.json();

      if (data.verification?.verified) {
        setVerificationState("success");
        setVerificationFeedback(data.verification);
        
        // Wait 3 seconds, then generate the NEXT step
        setTimeout(() => {
          setScreenshotBase64("");
          setUserDescription("");
          setVerificationState("idle");
          setVerificationFeedback(null);
          generateNextStep();
        }, 3000);
      } else {
        setVerificationState("error");
        setVerificationFeedback(data.verification);
      }
    } catch (error) {
      clearInterval(stageInterval);
      setVerificationState("error");
      setVerificationFeedback({ reason: "Network error during verification.", missingElements: [] });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-xl font-heading text-primary animate-pulse">Initializing CyberAid SOC...</p>
    </div>;
  }

  const completedCount = incident?.contextData?.completedSteps?.length || 0;
  const currentStepNumber = completedCount + 1;
  const estimatedTotal = activeStep?.estimatedTotalSteps || (completedCount + 1);
  const progressPercentage = Math.min(100, Math.max(0, (completedCount / estimatedTotal) * 100));

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur">
        <div className="w-full flex h-16 items-center px-6 md:px-10 lg:px-12 justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl tracking-tight">CyberAid SOC</span>
          </Link>
          <div className="flex items-center gap-4">
             <Link href="/checkup" className="text-sm font-medium hover:text-primary hidden sm:flex items-center gap-1">
               <MessagesSquare className="h-4 w-4" /> Message Checkup
             </Link>
             <Link href="/" className="text-sm font-medium hover:text-primary hidden sm:block">
               Return to Home
             </Link>
             <span className="text-sm text-muted-foreground border border-border px-3 py-1 rounded-full bg-background/50">
               {isComplete ? 'Recovery Complete' : `Step ${currentStepNumber} / ${estimatedTotal}`}
             </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-panel p-6 rounded-xl border border-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">Active Recovery Session</h1>
            <p className="text-muted-foreground mt-2 mb-4">CyberAid will guide you step-by-step based on continuous analysis.</p>
            
            {/* Progress Bar */}
            {!isComplete && (
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>Recovery Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {incident && (
            <div className={`px-4 py-2 rounded-md flex flex-col items-end gap-1 border font-medium ${
              incident.severity === 'CRITICAL' ? 'bg-destructive/10 text-destructive border-destructive/20' :
              incident.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
               <div className="flex items-center gap-2">
                 <AlertTriangle className="h-5 w-5" />
                 Severity: {incident.severity}
               </div>
               {incident.contextData?.severityReason && (
                 <span className="text-[10px] opacity-80 max-w-[200px] text-right font-normal leading-tight">
                   {incident.contextData.severityReason}
                 </span>
               )}
            </div>
          )}
        </div>

        {generatingStep ? (
          <div className="p-12 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center space-y-6">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            <div className="text-center">
              <h2 className="text-2xl font-heading text-foreground mb-2">AI is analyzing context...</h2>
              <p className="text-muted-foreground">Generating the next best step for your recovery.</p>
            </div>
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : isComplete ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center backdrop-blur-md shadow-2xl"
          >
            <ShieldCheck className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-4xl font-heading font-bold text-green-500 mb-4">100% Recovery Complete</h2>
            
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="bg-background/50 border border-border p-4 rounded-lg flex flex-col items-center min-w-[120px]">
                <span className="text-3xl font-bold text-primary">A+</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Security Score</span>
              </div>
              <div className="bg-background/50 border border-border p-4 rounded-lg flex flex-col items-center min-w-[120px]">
                <span className="text-3xl font-bold text-foreground">{completedCount}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Steps Completed</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Based on our AI analysis of your actions, your digital presence has been secured for this incident.
            </p>
            
            <div className="bg-background/50 border border-border/50 rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-heading font-bold text-xl mb-4">Completed Actions</h3>
              <div className="space-y-4">
                {incident?.contextData?.completedSteps?.map((step: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 bg-green-500/20 p-1 rounded-full shrink-0"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.verifiedReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background/50 border border-border/50 rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-heading font-bold text-xl mb-4 text-primary">Security Improvement Checklist</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Download your complete recovery report.</li>
                <li>Review active sessions on all connected devices.</li>
                <li>Consider using a hardware security key for Two-Factor Authentication.</li>
                <li>Audit third-party apps connected to your accounts.</li>
              </ul>
            </div>

            <Link href="/" className={buttonVariants({ variant: "default", size: "lg" })}>
              Return to Dashboard
            </Link>
          </motion.div>
        ) : activeStep ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-xl border border-primary/40 bg-panel/80 shadow-[0_0_50px_-12px_rgba(0,100,255,0.2)] backdrop-blur-md relative"
          >
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-primary bg-primary/10 text-primary">
                  <span className="font-bold text-2xl">{currentStepNumber}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-2xl text-foreground font-heading">{activeStep.title}</h3>
                  <span className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-wider self-start ${
                    activeStep.priority === 'CRITICAL' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                    activeStep.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                    'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                  }`}>
                    {activeStep.priority} Priority
                  </span>
                </div>
                
                <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Why this matters:</strong> {activeStep.whyItMatters}
                  </div>

                  <div className="bg-background/50 p-6 rounded-md border border-border whitespace-pre-wrap">
                    <strong className="text-primary block mb-3 text-lg font-heading tracking-wide uppercase">Instructions</strong>
                    {activeStep.instructions}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStep.helpfulTips && activeStep.helpfulTips.length > 0 && (
                      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-md">
                        <strong className="text-blue-500 flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4" /> Helpful Tips</strong>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {activeStep.helpfulTips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {activeStep.commonMistakes && activeStep.commonMistakes.length > 0 && (
                      <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-md">
                        <strong className="text-destructive flex items-center gap-2 mb-2"><AlertOctagon className="h-4 w-4" /> Common Mistakes</strong>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {activeStep.commonMistakes.map((mistake: string, i: number) => <li key={i}>{mistake}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    {activeStep.officialResourceLink && (
                      <a href={activeStep.officialResourceLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <LinkIcon className="h-4 w-4" /> Official Resource Link
                      </a>
                    )}
                    {activeStep.videoTutorialUrl && (
                      <a href={activeStep.videoTutorialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Video className="h-4 w-4" /> Video Tutorial
                      </a>
                    )}
                  </div>

                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Expected Result:</strong> {activeStep.expectedResult}
                  </div>
                </div>
              </div>
            </div>

            {/* After Reading Action */}
            {!stepCompleted && (
              <div className="mt-8 border-t border-border pt-6 text-center">
                <Button size="lg" className="h-14 px-8 text-lg w-full md:w-auto font-heading" onClick={() => setStepCompleted(true)}>
                  I Have Completed This Step
                </Button>
              </div>
            )}

            {/* Verification Area */}
            {stepCompleted && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-border/50 pt-8 mt-4 overflow-hidden"
                >
                  <h4 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Upload Proof to Continue
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    <strong>Required Screenshot:</strong> {activeStep.expectedNextScreenshot}
                  </p>
                  <div className="space-y-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Describe your actions:</label>
                      <textarea 
                        value={userDescription}
                        onChange={(e) => setUserDescription(e.target.value)}
                        placeholder="What steps did you take to complete this?"
                        className="w-full bg-background border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                        rows={3}
                        disabled={verificationState === 'scanning'}
                      />
                    </div>
                  </div>
                  
                  {!screenshotBase64 ? (
                    <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-colors cursor-pointer relative overflow-hidden group">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleImageUpload}
                      />
                      <Upload className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-lg text-primary">Click or drag your screenshot here</p>
                      <p className="text-sm text-muted-foreground mt-2">Max size: 5MB (PNG, JPG, WEBP)</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="border border-border/50 bg-background/50 rounded-xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <FileImage className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <span className="font-bold text-lg block">Screenshot uploaded</span>
                            <span className="text-sm text-muted-foreground">Ready for AI Verification</span>
                          </div>
                        </div>
                        <Button variant="ghost" onClick={() => setScreenshotBase64("")} disabled={verificationState === 'scanning'} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <X className="h-5 w-5 mr-2" /> Remove
                        </Button>
                      </div>

                      {verificationState === "idle" && (
                        <div className="space-y-4">
                          <Button size="lg" className="w-full text-lg h-14 font-heading" onClick={handleVerify} disabled={!userDescription.trim()}>
                            <ShieldCheck className="mr-2 h-5 w-5" /> Verify Proof & Unlock Next Step
                          </Button>
                        </div>
                      )}

                      {verificationState === "scanning" && (
                        <div className="border border-primary/30 bg-primary/10 rounded-xl p-8 flex flex-col items-center justify-center space-y-6">
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                          <div className="flex flex-col items-center text-center">
                            <p className="font-bold text-xl text-primary mb-2">AI Verifying...</p>
                            <p className="text-base text-muted-foreground animate-pulse">
                              {["Uploading...", "Running OCR...", "Reading interface...", "Detecting platform...", "Comparing expected screen...", "Checking completion..."][scanStage]}
                            </p>
                          </div>
                        </div>
                      )}

                      {verificationState === "success" && (
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="border-2 border-green-500/50 bg-green-500/10 rounded-xl p-6 text-green-500"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="h-6 w-6 shrink-0" />
                            <h5 className="font-bold text-xl">The uploaded screenshot appears consistent with the requested recovery step.</h5>
                          </div>
                          <p className="text-base mb-4 text-green-500/80">Confidence: ~{verificationFeedback?.confidence}%</p>
                          <p className="text-base bg-green-500/20 p-4 rounded-md">{verificationFeedback?.reason}</p>
                          <div className="flex items-center gap-2 mt-6 font-bold">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating next recommendation...
                          </div>
                        </motion.div>
                      )}

                      {verificationState === "error" && (
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="border-2 border-destructive/50 bg-destructive/10 rounded-xl p-6 space-y-4"
                        >
                          <div className="flex items-center gap-3 text-destructive">
                            <AlertTriangle className="h-6 w-6 shrink-0" />
                            <h5 className="font-bold text-xl">Verification Unsuccessful</h5>
                          </div>
                          <p className="text-base text-foreground/90 bg-destructive/20 p-4 rounded-md font-medium">{verificationFeedback?.reason}</p>
                          
                          {verificationFeedback?.missingElements?.length > 0 && (
                            <div className="mt-4 text-sm text-foreground/80 bg-background/50 p-4 rounded-md border border-destructive/20">
                              <p className="font-bold mb-2 text-destructive">Missing Elements:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {verificationFeedback.missingElements.map((m: string, i: number) => (
                                  <li key={i}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {verificationFeedback?.actionableAdvice && (
                            <div className="mt-4 text-sm text-foreground/80 bg-primary/10 p-4 rounded-md border border-primary/20">
                              <p className="font-bold mb-2 text-primary flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" /> Next Steps:
                              </p>
                              <p className="whitespace-pre-wrap">{verificationFeedback.actionableAdvice}</p>
                            </div>
                          )}
                          
                          <Button variant="outline" size="lg" className="w-full mt-4 border-destructive/50 text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => {
                            setScreenshotBase64("");
                            setUserDescription("");
                            setVerificationState("idle");
                          }}>
                            Upload a Different Screenshot
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
