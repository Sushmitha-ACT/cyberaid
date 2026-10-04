import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Trophy, Award, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      achievements: { orderBy: { createdAt: "desc" } },
      certificates: {
        include: { course: true },
        orderBy: { issuedAt: "desc" }
      }
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/academy/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <Link href="/academy" className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">CyberAid <span className="text-primary font-medium">Academy</span></span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-1.5 text-xs font-medium text-[#D4AF37] mb-4">
            <Trophy className="w-3.5 h-3.5" /> Achievements
          </div>
          <h1 className="text-4xl font-bold mb-2">Your Badges & Awards</h1>
          <p className="text-muted-foreground">Track every milestone you've earned on your cybersecurity journey.</p>
        </div>

        {/* XP Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="text-2xl font-bold">{user.xp} XP</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">{user.achievements.length}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificates</p>
              <p className="text-2xl font-bold">{user.certificates.length}</p>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4AF37]" /> Badges
          </h2>
          {user.achievements.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0A0A0A] border border-white/5 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No badges yet. Complete a course to earn your first one!</p>
              <Link href="/academy" className="inline-block mt-4">
                <Button className="bg-primary hover:bg-primary/90 mt-2">Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {user.achievements.map((badge) => (
                <div
                  key={badge.id}
                  className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-sm mb-1 leading-snug">{badge.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{badge.description}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" /> +{badge.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" /> Certificates
          </h2>
          {user.certificates.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0A0A0A] border border-white/5 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No certificates yet. Complete a course to earn one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {user.certificates.map((cert) => (
                <Link key={cert.id} href={`/academy/certificate/${cert.uuid}`}>
                  <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-secondary/40 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Certificate of Completion</p>
                        <h3 className="font-bold leading-snug">{cert.course.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          Issued: {new Date(cert.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
