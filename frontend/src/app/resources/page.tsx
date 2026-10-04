"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Clock, ShieldAlert, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function Resources() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    // Fetch guides from API
    async function fetchGuides() {
      try {
        const res = await fetch(`/api/resources?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(selectedCategory)}`);
        if (res.ok) {
          const data = await res.json();
          setGuides(data.guides || []);
        }
      } catch (err) {
        console.error("Failed to load guides", err);
      } finally {
        setLoading(false);
      }
    }
    
    // Debounce the fetch slightly if search changes
    const timeoutId = setTimeout(() => {
      fetchGuides();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const categories = ["All", "Account Recovery", "Financial Fraud", "Device Security", "Privacy", "Phishing & Scams"];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-16 items-center justify-between px-6 md:px-10 lg:px-12 relative">
          <Link href="/" className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl tracking-tight hidden md:inline-block">CyberAid</span>
          </Link>
          {/* Centered nav */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary text-muted-foreground">Home</Link>
            <Link href="/assessment" className="transition-colors hover:text-primary text-muted-foreground">Get Help</Link>
            <Link href="/resources" className="transition-colors text-foreground font-semibold">Resources</Link>
          </nav>
          <div className="w-[100px]" /> {/* spacer to balance logo */}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col items-center mb-12 text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold tracking-tight lg:text-5xl">Cybersecurity Resource Center</h1>
          <p className="text-xl text-muted-foreground max-w-[800px]">
            Verified guides, recovery steps, and prevention strategies to protect your digital life.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search guides (e.g., 'Instagram hacked', 'Phishing')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-border rounded-md py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-lg shadow-sm"
            />
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap font-mono text-sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse bg-panel border-border h-[250px]" />
            ))}
          </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id} className="border-border bg-panel hover:border-primary/50 transition-colors flex flex-col group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                      {guide.category}
                    </span>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {guide.estimatedMinutes} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {guide.difficulty}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50">
                  <Link href={`/resources/${guide.id}`} className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-between hover:bg-primary/10 group-hover:text-primary")}>
                    Read Guide <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-panel rounded-lg border border-border border-dashed">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium mb-1">No guides found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
