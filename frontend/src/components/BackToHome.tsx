import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToHome() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="w-full flex h-14 items-center px-6 md:px-10 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>
    </header>
  );
}
