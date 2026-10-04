"use client";

import { ShieldCheck, ArrowLeft, Lock, EyeOff, Server, Activity, Database, Key } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Privacy() {
  const policies = [
    {
      id: "zero-analytics",
      icon: EyeOff,
      title: "Zero Analytics on Incidents",
      content: "When you use the Incident Assessment Wizard, the details of your emergency are never sent to third-party analytics platforms, advertisers, or trackers. The inputs you provide are temporarily evaluated in memory to generate your recovery checklist. If you are logged in, we save the checklist securely to your account so you can track your progress."
    },
    {
      id: "encrypted-rest",
      icon: Lock,
      title: "Encrypted at Rest",
      content: "If you choose to create an account to save your recovery progress, your email and password are securely hashed and salted. Your generated checklists and incident logs are stored in a secure, encrypted database. We employ strict Role-Based Access Control (RBAC) ensuring that only you have access to your data."
    },
    {
      id: "data-retention",
      icon: Server,
      title: "Data Retention & Deletion",
      content: "You own your data. You have the right to request full deletion of your account and all associated incident logs at any time. Once an account deletion is requested, all records are permanently purged from our primary database and all backups within 30 days. Even if you don't delete your account, we automatically anonymize inactive incident checklists after 180 days to minimize any long-term exposure risk."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="w-full flex h-16 items-center px-6 md:px-10 lg:px-12">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium font-mono uppercase tracking-wider">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-20 border-b border-border bg-panel">
          <div className="absolute inset-0 flex justify-center -z-10">
            <div className="absolute top-0 w-full max-w-2xl h-[300px] bg-primary/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mx-auto h-20 w-20 bg-elevated border border-primary/20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6">
                Privacy & Security Policy
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your emergency is sensitive. Our data practices reflect that. We collect the absolute minimum data required to help you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid gap-12">
              {policies.map((policy, i) => (
                <motion.div 
                  key={policy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-elevated/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-10 relative overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                    <policy.icon className="w-64 h-64 -mt-16 -mr-16" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <policy.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold mb-4">{policy.title}</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {policy.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer Info */}
        <section className="py-12 border-t border-border bg-panel text-center">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider mb-2">Last updated: August 2026</p>
            <p className="text-foreground">For privacy inquiries, contact <a href="mailto:privacy@cyberaid.example.com" className="text-primary hover:underline">privacy@cyberaid.example.com</a></p>
          </div>
        </section>
      </main>
    </div>
  );
}
