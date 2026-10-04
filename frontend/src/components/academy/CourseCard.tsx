import Link from 'next/link';
import { Clock, BookOpen, Star, PlayCircle, Shield, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedHours: number;
    instructor: string;
    category?: {
      name: string;
      icon: string | null;
    };
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  // Determine icon based on category or default
  const Icon = course.category?.icon === 'Lock' ? Lock : Shield;

  return (
    <Card className="group relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 hover:border-primary/50 transition-all duration-300">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {course.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-xl font-semibold text-white group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-2 mt-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{course.estimatedHours} hrs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{course.category?.name || 'Fundamentals'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative z-10 pt-4 border-t border-white/5">
        <Link href={`/academy/course/${course.id}`} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            <PlayCircle className="w-4 h-4 mr-2" />
            Explore Course
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
