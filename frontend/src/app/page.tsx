import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import SplashAuthButtons from "./SplashAuthButtons";
import SplashManager from "./SplashManager";

export default async function SplashPage() {
  const session = await getAuthSession();
  
  if (session) {
    redirect("/home");
  }

  return (
    <SplashManager>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Container */}
        <div className="w-full max-w-md bg-panel/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
          {/* Glow behind the box */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="h-16 w-16 bg-background/50 border border-border shadow-[0_0_30px_rgba(34,211,238,0.2)] rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </div>

          {/* Auth Buttons */}
          <SplashAuthButtons />

          {/* Footer info */}
          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            By signing in, you agree to our <Link href="/privacy" className="hover:text-primary transition-colors underline underline-offset-2">Privacy Policy</Link> and <Link href="/terms" className="hover:text-primary transition-colors underline underline-offset-2">Terms of Service</Link>.
          </p>
        </div>
      </main>
    </SplashManager>
  );
}
