import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, BookOpen, Award, Flame, PlayCircle, Trophy, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Make sure authOptions is exported here
import CourseCard from "@/components/academy/CourseCard";
import { redirect } from "next/navigation";

export default async function AcademyDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user data with enrollments
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: { category: true }
          }
        }
      },
      achievements: {
        orderBy: { createdAt: 'desc' },
        take: 4
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const enrolledCourses = user.enrollments.map(e => e.course);
  
  // Dummy logic for calculating progress if no progress is saved
  const completedCoursesCount = user.enrollments.filter(e => e.isCompleted).length;

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
            <Link href="/academy">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">Browse Courses</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Welcome & Stats Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'Student'}</h1>
            <p className="text-muted-foreground">Resume your learning and boost your security score.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg"><Flame className="w-5 h-5 text-primary" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Streak</div>
                <div className="font-bold">{user.learningStreak} Days</div>
              </div>
            </div>
            
            <div className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg"><Trophy className="w-5 h-5 text-secondary" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Experience</div>
                <div className="font-bold">{user.xp} XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Current Learning
              </h2>
              
              {enrolledCourses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">You haven't enrolled in any courses yet.</h3>
                  <p className="text-muted-foreground mb-6">Start your cybersecurity journey by browsing our professional courses.</p>
                  <Link href="/academy">
                    <Button className="bg-primary hover:bg-primary/90">Browse Courses</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>
          </div>
          
          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Quick Stats Card */}
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <h3 className="font-medium mb-6">Overall Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Courses Completed</span>
                    <span className="font-medium">{completedCoursesCount} / {enrolledCourses.length || 1}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: enrolledCourses.length > 0 ? `${(completedCoursesCount / enrolledCourses.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Snippet */}
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium">Recent Badges</h3>
                <Link href="/academy/achievements" className="text-sm text-primary hover:underline">View All</Link>
              </div>
              {user.achievements.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Complete a course to earn your first badge!
                </div>
              ) : (
                <div className="space-y-3">
                  {user.achievements.map(badge => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{badge.title}</p>
                        <p className="text-xs text-muted-foreground">+{badge.xpReward} XP earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
