import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const guide = await prisma.guide.findFirst({
    where: { id: resolvedParams.id, isPublished: true },
  });

  if (!guide) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/resources" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Resources</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
              {guide.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">{guide.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{guide.description}</p>
          
          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground border-b border-border pb-8">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{guide.estimatedMinutes} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{guide.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-safe" />
              <span>Verified CyberAid Resource</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
               <span className="font-mono text-xs">Updated: {guide.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <article className="prose prose-invert max-w-none text-foreground prose-headings:font-heading prose-headings:text-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {guide.content}
          </ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
          <p className="text-muted-foreground">Was this guide helpful?</p>
          <div className="flex gap-4">
             <Button variant="outline" className="font-mono">Yes</Button>
             <Button variant="outline" className="font-mono">No</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
