import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import LessonCompletionHandler from "./LessonCompletionHandler";

export default async function LessonViewerPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              answers: true
            }
          }
        }
      },
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: 'asc' },
                include: { lessons: { orderBy: { order: 'asc' } } }
              }
            }
          }
        }
      }
    }
  });

  if (!lesson) redirect("/academy");

  const course = lesson.module.course;
  
  // Find next lesson
  let nextLesson = null;
  const currentModuleIdx = course.modules.findIndex(m => m.id === lesson.module.id);
  const currentLessonIdx = course.modules[currentModuleIdx].lessons.findIndex(l => l.id === lesson.id);

  if (currentLessonIdx + 1 < course.modules[currentModuleIdx].lessons.length) {
    nextLesson = course.modules[currentModuleIdx].lessons[currentLessonIdx + 1];
  } else if (currentModuleIdx + 1 < course.modules.length) {
    nextLesson = course.modules[currentModuleIdx + 1].lessons[0];
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/academy/course/${course.id}`}>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="hidden sm:block border-l border-white/10 h-6 mx-2" />
            <span className="font-medium text-sm text-muted-foreground hidden sm:block">{course.title}</span>
          </div>
          
          <div className="flex items-center gap-2 font-medium">
            <span className="text-primary">{lesson.module.title}</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 lg:py-20">
          <div className="mb-10">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4 border border-primary/20">
              Lesson {lesson.order}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{lesson.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{lesson.estimatedMinutes} min read</span>
            </div>
          </div>

          <div className="prose prose-invert prose-primary max-w-none text-muted-foreground">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-8 mb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
              }}
            >
              {lesson.content}
            </ReactMarkdown>
          </div>

          {/* Interactive Quiz / Completion Handler */}
          <LessonCompletionHandler 
            courseId={course.id}
            nextLessonId={nextLesson?.id}
            quiz={lesson.quiz}
          />
        </main>
      </div>
    </div>
  );
}
