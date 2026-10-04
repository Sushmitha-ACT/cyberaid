import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, BookOpen, Award, Sparkles, ChevronRight, GraduationCap, Lock, Database } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/academy/CourseCard";

export default async function AcademyLandingPage() {
  // Fetch available courses and categories from the database
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group">
            <ShieldCheck className="w-6 h-6 text-primary group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all" />
            <span className="font-bold text-xl tracking-tight">CyberAid <span className="text-primary font-medium">Academy</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/academy/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">Dashboard</Button>
            </Link>
            <Link href="/home">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                Back to CyberAid
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full opacity-30" />
          </div>

          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
            <Sparkles className="w-3 h-3 mr-2" />
            Welcome to the future of learning
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8">
            Master Cybersecurity Skills <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Through Interactive Learning.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Structured learning paths, professional courses, AI-assisted explanations, and hands-on simulations designed to make you digitally bulletproof.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="#courses">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                Explore Courses <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/academy/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5">
                My Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, label: "Professional Courses", value: "15+" },
              { icon: Shield, label: "Interactive Labs", value: "50+" },
              { icon: Award, label: "Verified Certificates", value: "Premium" },
              { icon: GraduationCap, label: "AI Mentor Support", value: "24/7" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Begin your cybersecurity journey today.</p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5">
              <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

// Ensure Badge is imported if used locally, or use basic styling
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}
