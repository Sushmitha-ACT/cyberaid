"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Home, HelpCircle, BookOpen, MessageSquareWarning, Settings, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/assessment", label: "Get Help", icon: HelpCircle },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/checkup", label: "Msg Checkup", icon: MessageSquareWarning },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-6 md:px-10 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline-block">CyberAid</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[120px]">
                {session.user?.name || session.user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
