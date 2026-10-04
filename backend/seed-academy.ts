import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Seeding CyberAid Academy database...');

  // 1. Create Categories
  const catFundamentals = await prisma.category.upsert({
    where: { name: 'Cybersecurity Fundamentals' },
    update: {},
    create: {
      name: 'Cybersecurity Fundamentals',
      description: 'The absolute basics of staying safe online.',
      icon: 'Shield',
    },
  });

  const catPrivacy = await prisma.category.upsert({
    where: { name: 'Privacy & Data Protection' },
    update: {},
    create: {
      name: 'Privacy & Data Protection',
      description: 'Learn how to keep your personal data private.',
      icon: 'Lock',
    },
  });

  // 2. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to Password Security',
      description: 'Master the art of creating unbreakable passwords and managing them securely using password managers.',
      difficulty: 'Beginner',
      estimatedHours: 2.5,
      isPublished: true,
      instructor: 'CyberAid AI Mentor',
      categoryId: catFundamentals.id,
      modules: {
        create: [
          {
            title: 'Module 1: The Basics of Passwords',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Why passwords matter',
                  content: 'Passwords are the keys to your digital kingdom...',
                  order: 1,
                  estimatedMinutes: 10,
                  video: {
                    create: {
                      youtubeId: 'dQw4w9WgXcQ', // Dummy video
                      duration: 600,
                    }
                  }
                },
                {
                  title: 'Common password mistakes',
                  content: 'Never use 123456 or password...',
                  order: 2,
                  estimatedMinutes: 15,
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Successfully seeded CyberAid Academy data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
