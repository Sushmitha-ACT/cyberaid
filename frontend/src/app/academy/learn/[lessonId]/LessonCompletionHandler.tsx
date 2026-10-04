"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import InteractiveQuiz from "@/components/academy/InteractiveQuiz";

interface LessonCompletionHandlerProps {
  courseId: string;
  nextLessonId?: string;
  quiz?: any;
}

export default function LessonCompletionHandler({ courseId, nextLessonId, quiz }: LessonCompletionHandlerProps) {
  const [passedQuiz, setPassedQuiz] = useState(false);

  return (
    <div className="w-full">
      {quiz && (
        <InteractiveQuiz 
          quiz={quiz} 
          onComplete={(passed) => setPassedQuiz(passed)} 
        />
      )}

      {/* Navigation Buttons appear if no quiz, or if quiz passed */}
      {(!quiz || passedQuiz) && (
        <div className="mt-20 pt-10 border-t border-white/10 flex justify-between items-center">
          <Link href={`/academy/course/${courseId}`}>
            <Button variant="outline" className="border-white/10">Back to Overview</Button>
          </Link>
          
          {nextLessonId ? (
            <Link href={`/academy/learn/${nextLessonId}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href={`/academy/claim-certificate/${courseId}`}>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                Complete Course <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
