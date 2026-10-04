"use client";

import { motion } from "framer-motion";
import { ShieldAlert, CreditCard, Smartphone, UserX, FileWarning, Link, Key, MessagesSquare, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, History, Settings, LogOut, Database, Sparkles, Lock, GraduationCap, Menu } from "lucide-react";
import LinkTo from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const incidents = [
    { id: "ACCOUNT_HACKED", icon: ShieldAlert, title: "Account Hacked", desc: "Regain access and secure your data" },
    { id: "PAYMENT_SCAM", icon: CreditCard, title: "Payment Scam", desc: "Report fraudulent transfers" },
    { id: "PHONE_LOST", icon: Smartphone, title: "Phone Lost/Stolen", desc: "Protect your mobile data" },
    { id: "IMPERSONATION", icon: UserX, title: "Fake Profile", desc: "Stop impersonation online" },
    { id: "PRIVATE_CONTENT", icon: FileWarning, title: "Private Content", desc: "Address non-consensual sharing" },
    { id: "SUSPICIOUS_LINK", icon: Link, title: "Suspicious Link", desc: "Check for malware/phishing" },
    { id: "CREDENTIALS_EXPOSED", icon: Key, title: "Password Exposed", desc: "Secure leaked credentials" },
    { id: "HARASSMENT", icon: MessagesSquare, title: "Online Harassment", desc: "Document and report abuse" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="w-full flex h-16 items-center justify-between px-6 md:px-10 lg:px-12">
          <LinkTo href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl tracking-tight text-foreground">CyberAid</span>
          </LinkTo>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <LinkTo href="/resources" className="hover:text-primary transition-colors">Resources</LinkTo>
            <LinkTo href="/academy" className="hover:text-primary transition-colors flex items-center gap-1"><GraduationCap className="h-4 w-4"/> Academy</LinkTo>
            <LinkTo href="/checkup" className="hover:text-primary transition-colors flex items-center gap-1"><MessagesSquare className="h-4 w-4"/> Message Checkup</LinkTo>
            <LinkTo href="#how-it-works" className="hover:text-primary transition-colors">How It Works</LinkTo>
            <LinkTo href="/privacy" className="hover:text-primary transition-colors">Privacy</LinkTo>
          </nav>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                    {(session.user?.name || session.user?.email || "?")[0].toUpperCase()}
                  </span>
                  <span className="hidden sm:block max-w-[80px] truncate">{session.user?.name || session.user?.email}</span>
                  <ChevronDown className="h-3 w-3 hidden sm:block" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-56 bg-panel border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-sm text-foreground truncate">{session.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                    <div className="p-1">
                      <LinkTo
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4" /> Profile & Settings
                      </LinkTo>
                      <LinkTo
                        href="/settings?tab=history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                      >
                        <History className="h-4 w-4" /> View History
                      </LinkTo>
                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <LinkTo href="/login" className="text-sm font-medium hover:text-primary hidden sm:block transition-colors">Sign In</LinkTo>
            )}
            <LinkTo href="/assessment" className={cn(buttonVariants({ size: "sm" }), "font-mono uppercase tracking-wider")}>
              Get Help Now
            </LinkTo>
            <button 
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-md border border-border hover:bg-muted transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-xl absolute w-full left-0">
            <nav className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
              <LinkTo href="/resources" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Resources</LinkTo>
              <LinkTo href="/academy" className="hover:text-primary transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><GraduationCap className="h-4 w-4"/> Academy</LinkTo>
              <LinkTo href="/checkup" className="hover:text-primary transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><MessagesSquare className="h-4 w-4"/> Message Checkup</LinkTo>
              <LinkTo href="#how-it-works" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</LinkTo>
              <LinkTo href="/privacy" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Privacy</LinkTo>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden flex flex-col justify-center pt-24 pb-32">
          {/* Subtle glow background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full opacity-30" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-6 md:px-10 text-center">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/20 hover:bg-primary/20 transition-colors mb-6">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Your digital first-aid toolkit
                </span>
              </motion.div>
              
              <motion.h1 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto"
              >
                Know what to do when <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  something goes wrong online.
                </span>
              </motion.h1>
              
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              >
                CyberAid creates an immediate, verified recovery plan tailored to your specific digital-safety incident. No jargon, just clear steps.
              </motion.p>
              
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <LinkTo href="/assessment" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.4)]")}>
                  Start Digital First-Aid <ArrowRight className="ml-2 h-5 w-5" />
                </LinkTo>
                <LinkTo href="/resources" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 px-8 text-lg border-white/10 hover:bg-white/5")}>
                  Browse Safety Guides
                </LinkTo>
              </motion.div>

              {/* Stats Bar */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto"
              >
                {[
                  { icon: ShieldCheck, label: "Verified Recovery", value: "100%" },
                  { icon: Lock, label: "Privacy First", value: "Zero Logs" },
                  { icon: Database, label: "Incident Types", value: "25+" },
                  { icon: Sparkles, label: "AI Assisted", value: "Smart" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Incident Selection Grid */}
        <section className="py-20 bg-panel border-y border-border">
          <div className="w-full px-6 md:px-10 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4">What happened?</h2>
              <p className="text-muted-foreground">Select an incident to get an adaptive recovery plan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {incidents.map((incident, i) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="h-full border-0 bg-elevated transition-all cursor-pointer group relative overflow-hidden rounded-2xl">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-70 group-hover:opacity-100 group-hover:h-2 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                    <CardHeader className="pt-8 pb-10 text-center relative z-10 flex flex-col items-center">
                      <div className="h-16 w-16 mb-4 rounded-xl bg-background/50 flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <incident.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <CardTitle className="text-xl mb-2 font-bold text-foreground">{incident.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">{incident.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-32 relative overflow-hidden">
          {/* Subtle background glow for this section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/5 rounded-[100%] blur-[100px] pointer-events-none" />
          
          <div className="w-full px-6 md:px-10 lg:px-12 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <span className="text-primary font-mono text-sm tracking-wider uppercase mb-3 block">Process</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">How CyberAid Works</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />
              
              {[
                { step: "01", title: "Assess", desc: "Answer a few simple, adaptive questions about the incident without sharing sensitive data." },
                { step: "02", title: "Analyze", desc: "Our deterministic engine calculates severity and identifies the correct verified actions." },
                { step: "03", title: "Recover", desc: "Follow a step-by-step checklist tailored to your country and the specific platforms involved." }
              ].map((item, i) => (
                <motion.div 
                  key={item.step} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div className="w-full bg-elevated/80 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center group">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-mono text-2xl font-bold mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Trust Center */}
        <section className="py-24 relative overflow-hidden bg-panel border-t border-border">
          <div className="w-full px-6 md:px-10 lg:px-12 max-w-7xl mx-auto relative z-10 text-center">
            <span className="text-primary font-mono text-sm tracking-wider uppercase mb-3 block">Trust Center</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-16">Built for absolute privacy.</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: ShieldCheck, title: "Zero Tracking", desc: "No cookies or ad networks. Your sessions are strictly anonymous." },
                { icon: Key, title: "No Passwords", desc: "We never ask for your passwords, PINs, or sensitive credentials." },
                { icon: Database, title: "Encrypted Data", desc: "If you create an account, all incident logs are encrypted at rest." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-8 bg-elevated/50 border border-border/50 rounded-2xl hover:border-primary/30 transition-colors group">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-elevated/30 border border-border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between text-left gap-6">
              <div className="flex items-start gap-4">
                <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Platform Limitations</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CyberAid provides educational incident-response guidance. We cannot recover lost funds/crypto, restore suspended accounts directly, or contact law enforcement on your behalf.
                  </p>
                </div>
              </div>
              <LinkTo href="/privacy" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 whitespace-nowrap")}>
                Full Privacy Policy
              </LinkTo>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="w-full px-6 md:px-10 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>CyberAid © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <LinkTo href="/legal/terms" className="hover:text-primary">Terms</LinkTo>
            <LinkTo href="/legal/privacy" className="hover:text-primary">Privacy Policy</LinkTo>
            <LinkTo href="/legal/security" className="hover:text-primary">Security</LinkTo>
          </div>
        </div>
      </footer>
    </div>
  );
}
