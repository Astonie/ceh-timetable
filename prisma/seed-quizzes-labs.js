import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedQuizzesAndLabs() {
  console.log('Starting quiz and lab seeding...');

  // Create a test user first
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  // Seed Virtual Labs
  const labs = [
    {
      title: 'Nmap Network Discovery Lab',
      description: 'Learn network reconnaissance using Nmap to discover hosts, services, and vulnerabilities in target networks.',
      difficulty: 'beginner',
      category: 'reconnaissance',
      estimatedTime: 60,
      instructions: `# Nmap Network Discovery Lab

## Objective
Learn to use Nmap for network discovery and reconnaissance.

## Tasks
1. Perform host discovery on the target network
2. Scan for open ports and services
3. Perform version detection
4. Conduct vulnerability scanning
5. Document your findings

## Commands to Use
- nmap -sn 192.168.1.0/24 (Host discovery)
- nmap -sS 192.168.1.100 (SYN scan)
- nmap -sV 192.168.1.100 (Version detection)
- nmap --script vuln 192.168.1.100 (Vulnerability scan)`,
      objectives: [
        'Understand network reconnaissance techniques',
        'Master Nmap command-line options',
        'Identify live hosts and open services',
        'Perform basic vulnerability assessment'
      ],
      prerequisites: [
        'Basic networking knowledge',
        'Familiarity with command line',
        'Understanding of TCP/IP'
      ],
      resources: {},
      weekReference: 'Week 2',
      creatorId: testUser.id,
    },
    {
      title: 'SQL Injection Attack Lab',
      description: 'Practice identifying and exploiting SQL injection vulnerabilities in web applications.',
      difficulty: 'intermediate',
      category: 'web_application_hacking',
      estimatedTime: 90,
      instructions: `# SQL Injection Attack Lab

## Objective
Learn to identify and exploit SQL injection vulnerabilities.

## Environment
- Target: DVWA (Damn Vulnerable Web Application)
- Tools: SQLMap, Burp Suite, Browser

## Tasks
1. Identify potential injection points
2. Test for SQL injection manually
3. Use SQLMap for automated exploitation
4. Extract database information
5. Demonstrate impact

## Manual Testing
- Test with single quote (')
- Try UNION-based injection
- Test for blind SQL injection

## SQLMap Commands
- sqlmap -u "http://target/page.php?id=1" --dbs
- sqlmap -u "http://target/page.php?id=1" -D database --tables
- sqlmap -u "http://target/page.php?id=1" -D database -T users --dump`,
      objectives: [
        'Identify SQL injection vulnerabilities',
        'Perform manual SQL injection attacks',
        'Use automated tools like SQLMap',
        'Understand impact and mitigation'
      ],
      prerequisites: [
        'Basic SQL knowledge',
        'Web application fundamentals',
        'HTTP protocol understanding'
      ],
      resources: {},
      weekReference: 'Week 8',
      creatorId: testUser.id,
    },
    {
      title: 'Metasploit Exploitation Framework',
      description: 'Master the Metasploit framework for vulnerability exploitation and post-exploitation activities.',
      difficulty: 'advanced',
      category: 'system_hacking',
      estimatedTime: 120,
      instructions: `# Metasploit Exploitation Framework Lab

## Objective
Learn to use Metasploit for exploitation and post-exploitation.

## Environment Setup
- Kali Linux with Metasploit
- Target: Metasploitable 2/3
- Network: Isolated lab environment

## Lab Tasks
1. Initialize Metasploit database
2. Perform target reconnaissance
3. Search for exploits
4. Configure and execute exploits
5. Post-exploitation activities
6. Maintain persistence

## Key Commands
- msfconsole (Start Metasploit)
- search <service> (Find exploits)
- use <exploit> (Select exploit)
- set RHOSTS <target> (Set target)
- exploit (Execute)
- sessions (List sessions)
- background (Background session)

## Post-Exploitation
- getuid (Get user ID)
- sysinfo (System information)
- hashdump (Dump password hashes)
- migrate (Process migration)`,
      objectives: [
        'Master Metasploit framework usage',
        'Perform successful exploitation',
        'Conduct post-exploitation activities',
        'Understand payload generation'
      ],
      prerequisites: [
        'Advanced networking knowledge',
        'Operating system fundamentals',
        'Basic scripting skills'
      ],
      resources: {},
      weekReference: 'Week 10',
      creatorId: testUser.id,
    }
  ];

  const createdLabs = [];

  for (const lab of labs) {
    try {
      // Check if lab already exists
      const existingLab = await prisma.virtualLab.findFirst({
        where: { title: lab.title }
      });

      if (!existingLab) {
        const createdLab = await prisma.virtualLab.create({
          data: lab
        });
        createdLabs.push(createdLab);
      } else {
        console.log(`Lab "${lab.title}" already exists, skipping...`);
        createdLabs.push(existingLab);
      }
    } catch (error) {
      console.error(`Error creating lab "${lab.title}":`, error.message);
    }
  }

  console.log('Labs created:', createdLabs.length);

  // Seed Quizzes
  const quizzes = [
    {
      title: 'Reconnaissance and Footprinting Quiz',
      description: 'Test your knowledge of reconnaissance techniques and information gathering methods.',
      category: 'domain_2',
      difficulty: 'beginner',
      timeLimit: 30,
      passingScore: 70,
      totalPoints: 100,
      weekReference: 'Week 2',
      creatorId: testUser.id,
      questions: {
        create: [
          {
            questionText: 'What is the primary purpose of footprinting in ethical hacking?',
            questionType: 'multiple_choice',
            points: 10,
            options: [
              { text: 'To gather information about the target', isCorrect: true },
              { text: 'To exploit vulnerabilities', isCorrect: false },
              { text: 'To maintain access', isCorrect: false },
              { text: 'To cover tracks', isCorrect: false }
            ]
          },
          {
            questionText: 'Which Nmap flag is used for SYN scanning?',
            questionType: 'multiple_choice',
            points: 10,
            options: [
              { text: '-sS', isCorrect: true },
              { text: '-sT', isCorrect: false },
              { text: '-sU', isCorrect: false },
              { text: '-sF', isCorrect: false }
            ]
          },
          {
            questionText: 'What information can be gathered from DNS enumeration?',
            questionType: 'multiple_choice',
            points: 10,
            options: [
              { text: 'Subdomains and IP addresses', isCorrect: true },
              { text: 'User passwords', isCorrect: false },
              { text: 'System vulnerabilities', isCorrect: false },
              { text: 'Network topology only', isCorrect: false }
            ]
          }
        ]
      }
    },
    {
      title: 'Web Application Security Quiz',
      description: 'Assess your understanding of web application vulnerabilities and attack methods.',
      category: 'domain_8',
      difficulty: 'intermediate',
      timeLimit: 45,
      passingScore: 75,
      totalPoints: 150,
      weekReference: 'Week 8',
      creatorId: testUser.id,
      questions: {
        create: [
          {
            questionText: 'Which of the following is a characteristic of SQL injection attacks?',
            questionType: 'multiple_choice',
            points: 15,
            options: [
              { text: 'Manipulating database queries through user input', isCorrect: true },
              { text: 'Intercepting network traffic', isCorrect: false },
              { text: 'Exploiting buffer overflows', isCorrect: false },
              { text: 'Social engineering attacks', isCorrect: false }
            ]
          },
          {
            questionText: 'What does XSS stand for in web security?',
            questionType: 'multiple_choice',
            points: 15,
            options: [
              { text: 'Cross-Site Scripting', isCorrect: true },
              { text: 'Cross-System Security', isCorrect: false },
              { text: 'Extended Security Scanner', isCorrect: false },
              { text: 'XML Security Standard', isCorrect: false }
            ]
          },
          {
            questionText: 'Which HTTP method is typically used to test for CSRF vulnerabilities?',
            questionType: 'multiple_choice',
            points: 15,
            options: [
              { text: 'POST', isCorrect: true },
              { text: 'GET', isCorrect: false },
              { text: 'PUT', isCorrect: false },
              { text: 'DELETE', isCorrect: false }
            ]
          }
        ]
      }
    },
    {
      title: 'System Hacking and Malware Quiz',
      description: 'Test your knowledge of system exploitation techniques and malware analysis.',
      category: 'domain_6',
      difficulty: 'advanced',
      timeLimit: 60,
      passingScore: 80,
      totalPoints: 200,
      weekReference: 'Week 10',
      creatorId: testUser.id,
      questions: {
        create: [
          {
            questionText: 'What is the purpose of a reverse shell in penetration testing?',
            questionType: 'multiple_choice',
            points: 20,
            options: [
              { text: 'To establish remote access from target to attacker', isCorrect: true },
              { text: 'To hide network traffic', isCorrect: false },
              { text: 'To encrypt communications', isCorrect: false },
              { text: 'To perform reconnaissance', isCorrect: false }
            ]
          },
          {
            questionText: 'Which technique is commonly used for privilege escalation on Windows systems?',
            questionType: 'multiple_choice',
            points: 20,
            options: [
              { text: 'Token impersonation', isCorrect: true },
              { text: 'DNS poisoning', isCorrect: false },
              { text: 'ARP spoofing', isCorrect: false },
              { text: 'Session hijacking', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the primary difference between a virus and a worm?',
            questionType: 'multiple_choice',
            points: 20,
            options: [
              { text: 'Worms self-replicate without host files', isCorrect: true },
              { text: 'Viruses spread faster than worms', isCorrect: false },
              { text: 'Worms require user interaction', isCorrect: false },
              { text: 'Viruses do not require host files', isCorrect: false }
            ]
          }
        ]
      }
    }
  ];

  const createdQuizzes = [];

  for (const quiz of quizzes) {
    try {
      // Check if quiz already exists
      const existingQuiz = await prisma.quiz.findFirst({
        where: { title: quiz.title }
      });

      if (!existingQuiz) {
        const createdQuiz = await prisma.quiz.create({
          data: quiz
        });
        createdQuizzes.push(createdQuiz);
      } else {
        console.log(`Quiz "${quiz.title}" already exists, skipping...`);
        createdQuizzes.push(existingQuiz);
      }
    } catch (error) {
      console.error(`Error creating quiz "${quiz.title}":`, error.message);
    }
  }

  console.log('Quizzes created:', createdQuizzes.length);

  // Create sample achievements
  const achievements = [
    {
      title: 'First Lab Completed',
      description: 'Successfully completed your first virtual lab',
      type: 'lab_completion',
      criteria: { labs_completed: 1 },
      points: 10,
      badgeIcon: '🎯'
    },
    {
      title: 'Quiz Master',
      description: 'Scored 90% or higher on a quiz',
      type: 'quiz_performance',
      criteria: { min_score: 90 },
      points: 15,
      badgeIcon: '🏆'
    },
    {
      title: 'Reconnaissance Expert',
      description: 'Completed all reconnaissance labs',
      type: 'category_mastery',
      criteria: { category: 'reconnaissance', labs_completed: 3 },
      points: 25,
      badgeIcon: '🔍'
    }
  ];

  const createdAchievements = [];

  for (const achievement of achievements) {
    try {
      // Check if achievement already exists
      const existingAchievement = await prisma.achievement.findFirst({
        where: { title: achievement.title }
      });

      if (!existingAchievement) {
        const createdAchievement = await prisma.achievement.create({
          data: achievement
        });
        createdAchievements.push(createdAchievement);
      } else {
        console.log(`Achievement "${achievement.title}" already exists, skipping...`);
        createdAchievements.push(existingAchievement);
      }
    } catch (error) {
      console.error(`Error creating achievement "${achievement.title}":`, error.message);
    }
  }

  console.log('Achievements created:', createdAchievements.length);
  console.log('Quiz and lab seeding completed successfully!');
}

seedQuizzesAndLabs()
  .catch((e) => {
    console.error('Error seeding quizzes and labs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
