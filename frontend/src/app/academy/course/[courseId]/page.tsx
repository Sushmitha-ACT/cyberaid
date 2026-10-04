import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, BookOpen, ChevronRight, PlayCircle, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CourseOverviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!course) {
    redirect("/academy");
  }

  // Check enrollment
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id
      }
    }
  });

  // Find the first lesson to start/resume
  const firstLesson = course.modules[0]?.lessons[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/academy" className="flex items-center gap-2 group">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">CyberAid <span className="text-primary font-medium">Academy</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/academy/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Course Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-primary mb-4">
            <BookOpen className="w-4 h-4" />
            <span>{course.category.name}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Course Overview</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{course.description}</p>
          
          <div className="flex flex-wrap gap-6 mb-8 text-sm border-y border-white/5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">{course.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{course.estimatedHours} Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <span>Certificate of Completion</span>
            </div>
          </div>

          {firstLesson ? (
            <Link href={`/academy/learn/${firstLesson.id}`}>
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto">
                <PlayCircle className="w-5 h-5 mr-2" />
                {enrollment ? "Resume Course" : "Start Course"}
              </Button>
            </Link>
          ) : (
            <Button disabled size="lg" className="h-14 px-8">Course content pending</Button>
          )}
        </div>

        {/* Course Syllabus */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Course Syllabus</h2>
          <div className="space-y-6">
            {course.modules.map((module) => (
              <div key={module.id} className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5 font-medium flex justify-between items-center">
                  <span>{module.title}</span>
                  <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                </div>
                <div className="divide-y divide-white/5">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-primary opacity-70" />
                        <span className="text-sm">{lesson.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{lesson.estimatedMinutes} min</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
