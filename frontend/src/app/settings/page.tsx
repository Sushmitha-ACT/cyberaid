"use client";

import { useState, useEffect, Suspense } from "react";
import {
  User, Mail, Shield, Clock, ChevronRight, AlertTriangle,
  CheckCircle2, XCircle, Circle, Calendar, ArrowUpRight,
  Edit2, Save, X, History, BarChart3, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

interface Incident {
  id: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  contextData: any;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/30",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  PREVENTIVE: "text-green-400 bg-green-400/10 border-green-400/30",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  OPEN: <Circle className="h-4 w-4 text-blue-400" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-yellow-400" />,
  RESOLVED: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  ABANDONED: <XCircle className="h-4 w-4 text-muted-foreground" />,
};

function formatType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "history">(
    searchParams?.get("tab") === "history" ? "history" : "profile"
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.user);
        setIncidents(data.incidents || []);
        setNewName(data.user?.name || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => prev ? { ...prev, name: data.user.name } : null);
        setEditingName(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: incidents.length,
    resolved: incidents.filter((i) => i.status === "RESOLVED").length,
    inProgress: incidents.filter((i) => i.status === "IN_PROGRESS").length,
    open: incidents.filter((i) => i.status === "OPEN").length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppNavbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and view your incident history.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-panel border border-border rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "profile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" /> History
            {incidents.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{incidents.length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <Card className="bg-panel border-border col-span-2 md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <User className="h-5 w-5 text-primary" /> Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                        {(profile?.name || profile?.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{profile?.name || "No name set"}</p>
                        <p className="text-sm text-muted-foreground">{profile?.email}</p>
                      </div>
                    </div>

                    {/* Name field */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                      {editingName ? (
                        <div className="flex gap-2">
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <Button size="sm" onClick={handleSaveName} disabled={saving}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingName(false); setNewName(profile?.name || ""); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-input border border-border rounded-md px-3 py-2">
                          <span className="text-sm text-foreground">{profile?.name || "Not set"}</span>
                          <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Email (read only) */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</label>
                      <div className="bg-input border border-border rounded-md px-3 py-2 text-sm text-muted-foreground">
                        {profile?.email}
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Role</label>
                      <div className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground">
                        {profile?.role}
                      </div>
                    </div>

                    {/* Member since */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Member Since</label>
                      <div className="bg-input border border-border rounded-md px-3 py-2 text-sm text-muted-foreground">
                        {profile?.createdAt ? formatDate(profile.createdAt) : "Unknown"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-panel border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <BarChart3 className="h-5 w-5 text-primary" /> Activity Summary
                    </CardTitle>
                    <CardDescription>Your incident recovery history at a glance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background border border-border rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Cases</p>
                      </div>
                      <div className="bg-background border border-green-500/20 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
                        <p className="text-xs text-muted-foreground mt-1">Resolved</p>
                      </div>
                      <div className="bg-background border border-yellow-500/20 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
                        <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                      </div>
                      <div className="bg-background border border-blue-500/20 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-400">{stats.open}</p>
                        <p className="text-xs text-muted-foreground mt-1">Open</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => setActiveTab("history")}
                        variant="outline"
                        className="w-full border-primary/30 hover:bg-primary/10 text-primary"
                      >
                        View Full History <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {incidents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No incidents yet</h3>
                    <p className="text-muted-foreground mb-6">Start your first security assessment to see your history here.</p>
                    <Link href="/assessment">
                      <Button>Start an Assessment</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{incidents.length} incident{incidents.length !== 1 ? "s" : ""} found</p>
                    {incidents.map((incident) => {
                      const ctx = incident.contextData as any;
                      const description = ctx?.description || ctx?.incidentDescription || null;
                      return (
                        <Card key={incident.id} className="bg-panel border-border hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                  <span className="font-semibold text-foreground">{formatType(incident.type)}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[incident.severity] || "text-muted-foreground bg-muted border-border"}`}>
                                    {incident.severity}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {STATUS_ICONS[incident.status]}
                                    {incident.status.replace("_", " ")}
                                  </span>
                                </div>
                                {description && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>
                                )}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(incident.createdAt)}
                                </div>
                              </div>
                              <Link href={`/dashboard?id=${incident.id}`} className="shrink-0">
                                <Button variant="outline" size="sm" className="text-xs border-primary/30 hover:bg-primary/10 text-primary">
                                  View <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
