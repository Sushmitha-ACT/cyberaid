import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    const catNetworks = await prisma.category.upsert({
      where: { name: 'Network Security' },
      update: {},
      create: {
        name: 'Network Security',
        description: 'Learn how networks operate and how to protect them.',
        icon: 'Activity',
      },
    });

    // 2. Clear existing dummy courses to prevent duplicates during seeding
    await prisma.course.deleteMany({
      where: {
        title: {
          in: ['Introduction to Password Security', 'Phishing & Social Engineering', 'Network Privacy & VPNs', 'Network Security Fundamentals']
        }
      }
    });

    // 3. Create Course 1: Passwords
    await prisma.course.create({
      data: {
        title: 'Introduction to Password Security',
        description: 'Passwords protect almost every aspect of our digital lives, from email and social media to banking and workplace systems. However, weak or reused passwords remain one of the leading causes of cyberattacks and data breaches. This course introduces the fundamentals of password security, helping learners understand how passwords work, why they are important, and how to create and manage them securely.',
        difficulty: 'Beginner',
        estimatedHours: 4.5,
        isPublished: true,
        instructor: 'CyberAid AI Mentor',
        categoryId: catFundamentals.id,
        modules: {
          create: [
            {
              title: 'Module 1: Introduction to Password Security',
              order: 1,
              lessons: {
                create: [
                  {
                    title: 'The Basics of Passwords',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### Topics Covered\n- What is a password?\n- Why passwords are important\n- Digital identity protection\n- Importance of account security\n- Common password mistakes\n\n### Learning Points\nPasswords act as the first layer of security. A weak password makes it easy for attackers to gain access to personal information, emails, financial accounts, and company resources.`
                  }
                ]
              }
            },
            {
              title: 'Module 2: Understanding Password Threats',
              order: 2,
              lessons: {
                create: [
                  {
                    title: 'Threats and Vulnerabilities',
                    estimatedMinutes: 30,
                    order: 1,
                    content: `### Topics Covered\n- Weak passwords\n- Password reuse\n- Public Wi-Fi risks\n- Social engineering\n- Password leaks\n- Data breaches\n\n### Common Threats\n- **Brute Force Attack**\n- **Dictionary Attack**\n- **Credential Stuffing**\n- **Password Spraying**\n- **Phishing**\n- **Keyloggers**\n- **Malware**\n\n### Real-Life Example\nIf you use the same password for Facebook, Gmail, and Online Banking, and Facebook experiences a data breach, attackers may try the same password on your Gmail and banking accounts.`
                  }
                ]
              }
            },
            {
              title: 'Module 3: Creating Strong Passwords',
              order: 3,
              lessons: {
                create: [
                  {
                    title: 'Characteristics of Strong Passwords',
                    estimatedMinutes: 35,
                    order: 1,
                    content: `### Characteristics of Strong Passwords\n- At least 12–16 characters\n- Uppercase letters\n- Lowercase letters\n- Numbers\n- Special characters\n- Random words or passphrases\n\n### Weak Password Examples\n- 123456\n- password\n- admin\n- welcome123\n- qwerty\n- iloveyou\n- abc123\n\n### Strong Password Examples\n- Rain$Coffee#2026!\n- PurpleTiger&Moon94\n- MyDog!Runs@Every7AM\n- S!lverMountain#88\n\n### Password Tips\n- Avoid personal information.\n- Don't use birthdays.\n- Avoid common words.\n- Never reuse passwords.\n- Use different passwords for every account.`
                  }
                ]
              }
            },
            {
              title: 'Module 4: Password Managers',
              order: 4,
              lessons: {
                create: [
                  {
                    title: 'Using Password Managers',
                    estimatedMinutes: 25,
                    order: 1,
                    content: `### What is a Password Manager?\nA password manager is software that securely stores all your passwords in an encrypted vault. You only need to remember one master password.\n\n### Benefits\n- Generates strong passwords\n- Stores passwords securely\n- Auto-fills login credentials\n- Syncs across devices\n- Prevents password reuse\n\n### Popular Password Managers\n- Bitwarden\n- 1Password\n- Dashlane\n- Keeper\n- NordPass`
                  }
                ]
              }
            },
            {
              title: 'Module 5: Multi-Factor Authentication',
              order: 5,
              lessons: {
                create: [
                  {
                    title: 'What is MFA?',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### What is MFA?\nMulti-Factor Authentication requires users to provide two or more verification methods before accessing an account.\n\n### Authentication Factors\n\n**Something you know**\n- Password\n- PIN\n\n**Something you have**\n- Mobile phone\n- Security key\n- Authentication app\n\n**Something you are**\n- Fingerprint\n- Face ID\n- Iris scan\n\n### Benefits\n- Extra security\n- Prevents unauthorized access\n- Protects accounts even if passwords are stolen`
                  }
                ]
              }
            },
            {
              title: 'Module 6: Safe Password Habits',
              order: 6,
              lessons: {
                create: [
                  {
                    title: 'Best Practices',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### Best Practices\n- Use a unique password for every account.\n- Change passwords after a security breach.\n- Enable MFA whenever possible.\n- Never share passwords.\n- Lock your computer when away.\n- Avoid entering passwords on public computers.\n- Keep devices updated.\n- Use antivirus software.\n- Log out from shared devices.`
                  }
                ]
              }
            },
            {
              title: 'Module 7: Recognizing Phishing',
              order: 7,
              lessons: {
                create: [
                  {
                    title: 'Warning Signs of Phishing',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### Warning Signs\n- Unexpected login requests\n- Suspicious links\n- Poor grammar\n- Fake websites\n- Urgent messages\n- Unknown email senders\n\n### Example\n"Your account will be deleted today! Click here immediately."\n\n**Always verify the sender before clicking links.**`
                  }
                ]
              }
            },
            {
              title: 'Module 8: Recovery and Assessment',
              order: 8,
              lessons: {
                create: [
                  {
                    title: 'Password Recovery and Account Protection',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### Tips\n- Use recovery email.\n- Add a recovery phone number.\n- Keep backup codes safe.\n- Review login activity regularly.\n- Remove unknown devices.\n\n### Password Security Checklist\n- Use passwords longer than 12 characters\n- Include uppercase and lowercase letters\n- Include numbers\n- Include symbols\n- Never reuse passwords\n- Enable MFA\n- Use a password manager\n- Beware of phishing\n- Update passwords after breaches\n- Keep recovery information updated`
                  },
                  {
                    title: 'Final Assessment',
                    estimatedMinutes: 30,
                    order: 2,
                    content: `### Assessment Phase\nPlease complete the interactive assessment below. You must score at least 70% to claim your certificate of completion.\n\nGood luck!`,
                    quiz: {
                      create: {
                        title: 'Password Security Final Exam',
                        passingScore: 70,
                        questions: {
                          create: [
                            {
                              text: 'What is the main purpose of a password?',
                              answers: {
                                create: [
                                  { text: 'Increase internet speed', isCorrect: false },
                                  { text: 'Protect user accounts', isCorrect: true },
                                  { text: 'Install software', isCorrect: false },
                                  { text: 'Browse websites', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which password is strongest?',
                              answers: {
                                create: [
                                  { text: 'abc123', isCorrect: false },
                                  { text: 'password', isCorrect: false },
                                  { text: 'Summer2025', isCorrect: false },
                                  { text: 'My$ecure#Tiger92!', isCorrect: true }
                                ]
                              }
                            },
                            {
                              text: 'Passwords should contain:',
                              answers: {
                                create: [
                                  { text: 'Only numbers', isCorrect: false },
                                  { text: 'Only letters', isCorrect: false },
                                  { text: 'Letters, numbers, and symbols', isCorrect: true },
                                  { text: 'Only names', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'What is password reuse?',
                              answers: {
                                create: [
                                  { text: 'Using multiple browsers', isCorrect: false },
                                  { text: 'Using the same password on multiple websites', isCorrect: true },
                                  { text: 'Resetting a password', isCorrect: false },
                                  { text: 'Sharing passwords', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which attack guesses passwords automatically?',
                              answers: {
                                create: [
                                  { text: 'Phishing', isCorrect: false },
                                  { text: 'Brute Force', isCorrect: true },
                                  { text: 'DDoS', isCorrect: false },
                                  { text: 'SQL Injection', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Dictionary attacks use:',
                              answers: {
                                create: [
                                  { text: 'Firewalls', isCorrect: false },
                                  { text: 'Random hardware', isCorrect: false },
                                  { text: 'Lists of common passwords', isCorrect: true },
                                  { text: 'Antivirus software', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'MFA stands for:',
                              answers: {
                                create: [
                                  { text: 'Multi-Factor Authentication', isCorrect: true },
                                  { text: 'Main File Access', isCorrect: false },
                                  { text: 'Multiple File Authentication', isCorrect: false },
                                  { text: 'Mobile File Account', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which is NOT a good password?',
                              answers: {
                                create: [
                                  { text: 'Tiger@Moon89', isCorrect: false },
                                  { text: 'Password123', isCorrect: true },
                                  { text: 'Rain!Coffee#44', isCorrect: false },
                                  { text: 'PurpleSky$2026', isCorrect: false }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });

    // 4. Create Course 2: Network Security
    await prisma.course.create({
      data: {
        title: 'Network Security Fundamentals',
        description: 'Network Security Fundamentals introduces learners to the essential concepts of securing computer networks from unauthorized access, cyberattacks, and data breaches. As businesses and individuals rely heavily on connected devices, understanding how networks operate and how to protect them has become a critical cybersecurity skill.\n\nThis course covers networking basics, common network threats, firewalls, VPNs, intrusion detection systems, wireless security, and network monitoring. Through real-world examples and practical concepts, learners will gain the knowledge needed to secure home and organizational networks.',
        difficulty: 'Beginner',
        estimatedHours: 3.0,
        isPublished: true,
        instructor: 'CyberAid AI Mentor',
        categoryId: catNetworks.id,
        modules: {
          create: [
            {
              title: 'Module 1: Introduction to Network Security',
              order: 1,
              lessons: {
                create: [
                  {
                    title: 'Network Security Basics',
                    estimatedMinutes: 25,
                    order: 1,
                    content: `### Topics Covered\n- What is a computer network?\n- Types of networks\n- Why network security matters\n- Network security goals\n- Importance of protecting data`
                  }
                ]
              }
            },
            {
              title: 'Module 2: Types of Computer Networks',
              order: 2,
              lessons: {
                create: [
                  {
                    title: 'LAN, WAN, MAN, and WLAN',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### LAN (Local Area Network)\nConnects devices within a limited area such as a home, school, or office.\n\n### WAN (Wide Area Network)\nConnects networks over large geographical areas.\n\n### MAN (Metropolitan Area Network)\nCovers an entire city or campus.\n\n### WLAN (Wireless LAN)\nAllows wireless communication using Wi-Fi.`
                  }
                ]
              }
            },
            {
              title: 'Module 3: Common Network Threats',
              order: 3,
              lessons: {
                create: [
                  {
                    title: 'Understanding Network Attacks',
                    estimatedMinutes: 25,
                    order: 1,
                    content: `### Malware\nMalicious software that spreads through networks.\n\n### Denial-of-Service (DoS)\nFloods a server with traffic until it becomes unavailable.\n\n### Distributed Denial-of-Service (DDoS)\nMultiple systems attack one target simultaneously.\n\n### Man-in-the-Middle (MITM)\nIntercepts communication between two users.\n\n### Packet Sniffing\nCaptures network traffic to steal information.\n\n### Spoofing\nPretending to be another device or user.`
                  }
                ]
              }
            },
            {
              title: 'Module 4: Firewalls',
              order: 4,
              lessons: {
                create: [
                  {
                    title: 'Firewalls and Traffic Control',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### What is a Firewall?\nA firewall monitors incoming and outgoing network traffic and blocks unauthorized access.\n\n### Types of Firewalls\n- Packet Filtering Firewall\n- Stateful Firewall\n- Proxy Firewall\n- Next-Generation Firewall (NGFW)\n\n### Benefits\n- Blocks unauthorized traffic\n- Prevents attacks\n- Controls network access`
                  }
                ]
              }
            },
            {
              title: 'Module 5: Virtual Private Network (VPN)',
              order: 5,
              lessons: {
                create: [
                  {
                    title: 'Encrypting Internet Traffic',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### What is a VPN?\nA VPN creates an encrypted connection between a user and the internet, protecting data from interception.\n\n### Benefits\n- Encrypts internet traffic\n- Protects privacy\n- Secures remote access\n- Safe browsing on public Wi-Fi`
                  }
                ]
              }
            },
            {
              title: 'Module 6: Intrusion Detection and Prevention',
              order: 6,
              lessons: {
                create: [
                  {
                    title: 'IDS and IPS',
                    estimatedMinutes: 15,
                    order: 1,
                    content: `### IDS (Intrusion Detection System)\nDetects suspicious network activity and alerts administrators.\n\n### IPS (Intrusion Prevention System)\nDetects and automatically blocks malicious traffic.`
                  }
                ]
              }
            },
            {
              title: 'Module 7: Wireless Network Security',
              order: 7,
              lessons: {
                create: [
                  {
                    title: 'Securing Wi-Fi Networks',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### Wi-Fi Security Standards\n- WPA2\n- WPA3\n\n### Best Practices\n- Change default router password\n- Use strong Wi-Fi passwords\n- Disable WPS\n- Update router firmware\n- Hide SSID if necessary`
                  }
                ]
              }
            },
            {
              title: 'Module 8: Network Monitoring and Final Assessment',
              order: 8,
              lessons: {
                create: [
                  {
                    title: 'Monitoring Tools and Best Practices',
                    estimatedMinutes: 20,
                    order: 1,
                    content: `### Monitoring Tools\n- Network logs\n- Traffic monitoring\n- Alerts\n- Performance analysis\n\n### Why Monitoring Matters\n- Detect attacks early\n- Improve performance\n- Troubleshoot problems\n- Maintain uptime\n\n### Best Practices\n- Use strong passwords for routers.\n- Keep firmware updated.\n- Enable firewalls.\n- Use VPNs for remote access.\n- Monitor network activity.\n- Secure Wi-Fi with WPA3.\n- Disable unused network ports.\n- Regularly review access permissions.\n\n### Real-World Scenario\nA coffee shop offers free public Wi-Fi. An attacker connects to the same network and uses packet sniffing tools to capture unencrypted login credentials from users. By using HTTPS websites and a VPN, users can protect their information from being intercepted.`
                  },
                  {
                    title: 'Final Assessment',
                    estimatedMinutes: 35,
                    order: 2,
                    content: `### Assessment Phase\nPlease complete the interactive assessment below. You must score at least 70% to claim your certificate of completion.\n\nGood luck!`,
                    quiz: {
                      create: {
                        title: 'Network Security Final Exam',
                        passingScore: 70,
                        questions: {
                          create: [
                            {
                              text: 'What does LAN stand for?',
                              answers: {
                                create: [
                                  { text: 'Large Area Network', isCorrect: false },
                                  { text: 'Local Area Network', isCorrect: true },
                                  { text: 'Long Area Network', isCorrect: false },
                                  { text: 'Linked Area Network', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which device filters network traffic?',
                              answers: {
                                create: [
                                  { text: 'Printer', isCorrect: false },
                                  { text: 'Firewall', isCorrect: true },
                                  { text: 'Keyboard', isCorrect: false },
                                  { text: 'Scanner', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'What is the purpose of a VPN?',
                              answers: {
                                create: [
                                  { text: 'Increase internet speed', isCorrect: false },
                                  { text: 'Encrypt internet traffic', isCorrect: true },
                                  { text: 'Delete malware', isCorrect: false },
                                  { text: 'Block advertisements', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which attack floods a server with excessive traffic?',
                              answers: {
                                create: [
                                  { text: 'Phishing', isCorrect: false },
                                  { text: 'DDoS', isCorrect: true },
                                  { text: 'SQL Injection', isCorrect: false },
                                  { text: 'Password Attack', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which Wi-Fi security standard is the most secure?',
                              answers: {
                                create: [
                                  { text: 'WEP', isCorrect: false },
                                  { text: 'WPA', isCorrect: false },
                                  { text: 'WPA2', isCorrect: false },
                                  { text: 'WPA3', isCorrect: true }
                                ]
                              }
                            },
                            {
                              text: 'What does IDS stand for?',
                              answers: {
                                create: [
                                  { text: 'Internet Detection Service', isCorrect: false },
                                  { text: 'Intrusion Detection System', isCorrect: true },
                                  { text: 'Internal Data Security', isCorrect: false },
                                  { text: 'Integrated Defense Service', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which system can automatically block malicious traffic?',
                              answers: {
                                create: [
                                  { text: 'IDS', isCorrect: false },
                                  { text: 'IPS', isCorrect: true },
                                  { text: 'VPN', isCorrect: false },
                                  { text: 'DNS', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'What is packet sniffing?',
                              answers: {
                                create: [
                                  { text: 'Compressing files', isCorrect: false },
                                  { text: 'Capturing network traffic', isCorrect: true },
                                  { text: 'Encrypting passwords', isCorrect: false },
                                  { text: 'Installing updates', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Why should router firmware be updated?',
                              answers: {
                                create: [
                                  { text: 'To change the router color', isCorrect: false },
                                  { text: 'To improve security and fix vulnerabilities', isCorrect: true },
                                  { text: 'To increase storage', isCorrect: false },
                                  { text: 'To disable Wi-Fi', isCorrect: false }
                                ]
                              }
                            },
                            {
                              text: 'Which protocol encrypts website communication?',
                              answers: {
                                create: [
                                  { text: 'HTTP', isCorrect: false },
                                  { text: 'FTP', isCorrect: false },
                                  { text: 'HTTPS', isCorrect: true },
                                  { text: 'SMTP', isCorrect: false }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });

    return NextResponse.json({ success: true, message: "Detailed courses and interactive quizzes seeded!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
