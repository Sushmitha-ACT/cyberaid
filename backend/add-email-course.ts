import "dotenv/config";
import { prisma } from './src/lib/prisma';

async function main() {
  const catFundamentals = await prisma.category.findUnique({
    where: { name: 'Cybersecurity Fundamentals' }
  });

  if (!catFundamentals) {
    console.error('Category not found');
    return;
  }

  const existingCourse = await prisma.course.findFirst({
    where: { title: 'Email Security and Phishing Awareness' }
  });

  if (existingCourse) {
    console.log('Course already exists, skipping.');
    return;
  }

  const course = await prisma.course.create({
    data: {
      title: 'Email Security and Phishing Awareness',
      description: 'Email is one of the most widely used communication tools... This course introduces learners to the fundamentals of email security and phishing awareness. You will learn how phishing attacks work, how to recognize suspicious emails, and how to protect yourself and your organization from email-based cyber threats.',
      difficulty: 'Beginner',
      estimatedHours: 3.0,
      isPublished: true,
      instructor: 'CyberAid AI Mentor',
      categoryId: catFundamentals.id,
      modules: {
        create: [
          {
            title: 'Module 1: Introduction to Email Security',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'What is Email Security?',
                  content: 'Email security is the process of protecting email accounts, messages, and communication from unauthorized access, phishing attacks, malware, spam, and data theft.\n\n### Why is Email Security Important?\n- Protects sensitive information.\n- Prevents identity theft.\n- Prevents malware infections.\n- Protects company data.\n- Reduces financial fraud.\n- Builds customer trust.\n\n### Common Email Threats\n- Phishing\n- Spam\n- Malware\n- Email Spoofing\n- Business Email Compromise (BEC)\n- Malicious Attachments',
                  order: 1,
                  estimatedMinutes: 25,
                }
              ]
            }
          },
          {
            title: 'Module 2: Understanding Phishing',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'What is Phishing?',
                  content: 'Phishing is a cyberattack where attackers send fake emails pretending to be trusted organizations to steal personal information such as passwords, banking details, or credit card information.\n\n### Types of Phishing\n\n**1. Email Phishing**\nMass emails sent to many users pretending to be trusted companies.\n*Example: "Your bank account has been locked. Click here to verify."*\n\n**2. Spear Phishing**\nA targeted phishing attack against a specific individual or organization.\n\n**3. Whaling**\nTargets executives or senior management.\n\n**4. Clone Phishing**\nA legitimate email is copied and modified with a malicious attachment or link.',
                  order: 1,
                  estimatedMinutes: 35,
                }
              ]
            }
          },
          {
            title: 'Module 3: Recognizing Suspicious Emails',
            order: 3,
            lessons: {
              create: [
                {
                  title: 'Warning Signs',
                  content: '### Warning Signs\n- ✔ Unknown sender\n- ✔ Spelling mistakes\n- ✔ Urgent language\n- ✔ Requests for passwords\n- ✔ Suspicious attachments\n- ✔ Fake login pages\n- ✔ Unusual email address\n- ✔ Generic greetings\n\n*Example of a bad email:*\n❌ Dear Customer,\nYour account has been suspended. Click below immediately to reactivate.',
                  order: 1,
                  estimatedMinutes: 30,
                }
              ]
            }
          },
          {
            title: 'Module 4: Safe Email Practices',
            order: 4,
            lessons: {
              create: [
                {
                  title: 'Best Practices',
                  content: '### Best Practices\n- Verify sender addresses.\n- Don\'t click unknown links.\n- Scan attachments before opening.\n- Use strong passwords.\n- Enable Multi-Factor Authentication.\n- Update antivirus software.\n- Report suspicious emails.\n- Never share passwords via email.',
                  order: 1,
                  estimatedMinutes: 30,
                }
              ]
            }
          },
          {
            title: 'Module 5: Email Attachments and Links',
            order: 5,
            lessons: {
              create: [
                {
                  title: 'Handling Attachments and Links',
                  content: '### Safe Attachments\n- PDF\n- DOCX (from trusted senders)\n- Images\n\n### Dangerous File Types\n- .exe\n- .bat\n- .vbs\n- .scr\n- .js\n- .zip (if unexpected)\n\n### Before Clicking a Link\n- Hover over the link.\n- Verify the website URL.\n- Ensure HTTPS is used.\n- Avoid shortened URLs if uncertain.',
                  order: 1,
                  estimatedMinutes: 20,
                }
              ]
            }
          },
          {
            title: 'Module 6: Email Authentication Technologies',
            order: 6,
            lessons: {
              create: [
                {
                  title: 'Authentication Technologies',
                  content: '### SPF (Sender Policy Framework)\nHelps verify that an email comes from an authorized mail server.\n\n### DKIM (DomainKeys Identified Mail)\nUses digital signatures to ensure emails have not been altered.\n\n### DMARC (Domain-based Message Authentication, Reporting & Conformance)\nProtects domains from email spoofing and phishing.',
                  order: 1,
                  estimatedMinutes: 25,
                }
              ]
            }
          },
          {
            title: 'Module 7: Business Email Compromise (BEC)',
            order: 7,
            lessons: {
              create: [
                {
                  title: 'What is BEC?',
                  content: '### What is BEC?\nBusiness Email Compromise is a scam where attackers impersonate company executives or trusted partners to trick employees into sending money or sensitive information.\n\n### Prevention\n- Verify payment requests.\n- Confirm requests through phone calls.\n- Never rely only on email for financial approvals.',
                  order: 1,
                  estimatedMinutes: 20,
                }
              ]
            }
          },
          {
            title: 'Module 8: Reporting and Responding to Phishing',
            order: 8,
            lessons: {
              create: [
                {
                  title: 'What Should You Do?',
                  content: '### What Should You Do?\n- Do not reply.\n- Do not click links.\n- Report to your IT or security team.\n- Delete the email after reporting.\n- Change passwords if credentials were entered.\n- Run an antivirus scan if an attachment was opened.\n\n### Real-World Scenario\nAn employee receives an email claiming to be from the Human Resources department asking them to download a salary revision document. The email contains an attachment named Salary_Update.exe.\n\n**Correct Response**\n- Do not open the attachment.\n- Verify the email with HR.\n- Report the email as phishing.\n- Delete the email after reporting.',
                  order: 1,
                  estimatedMinutes: 20,
                }
              ]
            }
          }
        ]
      },
      finalExam: {
        create: {
          title: 'Final Assessment',
          timeLimit: 30,
          passingScore: 70,
          questions: {
            create: [
              {
                text: 'What is the main purpose of email security?',
                answers: {
                  create: [
                    { text: 'To increase internet speed', isCorrect: false },
                    { text: 'To protect email communication from cyber threats', isCorrect: true },
                    { text: 'To store files', isCorrect: false },
                    { text: 'To browse websites', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What is phishing?',
                answers: {
                  create: [
                    { text: 'A type of antivirus software', isCorrect: false },
                    { text: 'A cyberattack that tricks users into revealing sensitive information', isCorrect: true },
                    { text: 'A web browser', isCorrect: false },
                    { text: 'A cloud storage service', isCorrect: false }
                  ]
                }
              },
              {
                text: 'Which file type is generally considered risky if received unexpectedly?',
                answers: {
                  create: [
                    { text: '.pdf', isCorrect: false },
                    { text: '.jpg', isCorrect: false },
                    { text: '.exe', isCorrect: true },
                    { text: '.txt', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What should you do before clicking a link in an email?',
                answers: {
                  create: [
                    { text: 'Click immediately', isCorrect: false },
                    { text: 'Hover over the link and verify the URL', isCorrect: true },
                    { text: 'Disable antivirus software', isCorrect: false },
                    { text: 'Forward it to friends', isCorrect: false }
                  ]
                }
              },
              {
                text: 'Which email greeting is often used in phishing emails?',
                answers: {
                  create: [
                    { text: 'Dear Customer', isCorrect: true },
                    { text: 'Dear John Smith', isCorrect: false },
                    { text: 'Hello Team Lead', isCorrect: false },
                    { text: 'Good Morning Manager', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What is email spoofing?',
                answers: {
                  create: [
                    { text: 'Encrypting an email', isCorrect: false },
                    { text: 'Sending spam', isCorrect: false },
                    { text: 'Forging the sender\'s email address to appear legitimate', isCorrect: true },
                    { text: 'Blocking emails', isCorrect: false }
                  ]
                }
              },
              {
                text: 'Which authentication method adds extra protection to email accounts?',
                answers: {
                  create: [
                    { text: 'Auto-save', isCorrect: false },
                    { text: 'Multi-Factor Authentication (MFA)', isCorrect: true },
                    { text: 'Spell check', isCorrect: false },
                    { text: 'Dark mode', isCorrect: false }
                  ]
                }
              },
              {
                text: 'Which of the following is a sign of a phishing email?',
                answers: {
                  create: [
                    { text: 'Personalized greeting from a trusted contact', isCorrect: false },
                    { text: 'Urgent request for passwords or payment', isCorrect: true },
                    { text: 'Expected meeting invitation', isCorrect: false },
                    { text: 'Internal company newsletter', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What should you do if you receive a suspicious email?',
                answers: {
                  create: [
                    { text: 'Reply immediately', isCorrect: false },
                    { text: 'Click the link to check', isCorrect: false },
                    { text: 'Report it to the IT or security team', isCorrect: true },
                    { text: 'Share it on social media', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What does SPF help prevent?',
                answers: {
                  create: [
                    { text: 'Slow internet speed', isCorrect: false },
                    { text: 'Email spoofing by verifying authorized mail servers', isCorrect: true },
                    { text: 'Hardware failures', isCorrect: false },
                    { text: 'Browser crashes', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What is the purpose of DKIM?',
                answers: {
                  create: [
                    { text: 'Encrypt passwords', isCorrect: false },
                    { text: 'Ensure an email has not been altered during transmission', isCorrect: true },
                    { text: 'Block websites', isCorrect: false },
                    { text: 'Speed up email delivery', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What does DMARC help protect against?',
                answers: {
                  create: [
                    { text: 'Printer errors', isCorrect: false },
                    { text: 'Email spoofing and phishing attacks', isCorrect: true },
                    { text: 'Slow internet', isCorrect: false },
                    { text: 'Data backups', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What is Business Email Compromise (BEC)?',
                answers: {
                  create: [
                    { text: 'A software update', isCorrect: false },
                    { text: 'A scam where attackers impersonate trusted business contacts', isCorrect: true },
                    { text: 'A cloud storage service', isCorrect: false },
                    { text: 'A password manager', isCorrect: false }
                  ]
                }
              },
              {
                text: 'Which attachment should you be most cautious about?',
                answers: {
                  create: [
                    { text: 'Company_Report.pdf', isCorrect: false },
                    { text: 'Vacation_Photos.jpg', isCorrect: false },
                    { text: 'Invoice.exe', isCorrect: true },
                    { text: 'Notes.txt', isCorrect: false }
                  ]
                }
              },
              {
                text: 'What should you do if you accidentally enter your password on a phishing website?',
                answers: {
                  create: [
                    { text: 'Ignore it', isCorrect: false },
                    { text: 'Change your password immediately and notify IT', isCorrect: true },
                    { text: 'Restart your computer only', isCorrect: false },
                    { text: 'Delete your browser history', isCorrect: false }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  });

  console.log('Successfully seeded Email Security Course!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
