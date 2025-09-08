import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedQuizzesAndLabsSimple() {
  console.log('Starting simple quiz and lab seeding...');

  // Create or find a facilitator
  const facilitator = await prisma.facilitator.findFirst();
  if (!facilitator) {
    console.log('No facilitator found. Please run the main seed script first.');
    return;
  }

  // Create Virtual Labs without complex relations
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
      createdBy: facilitator.id,
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
5. Demonstrate impact`,
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
      createdBy: facilitator.id,
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
6. Maintain persistence`,
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
      createdBy: facilitator.id,
    }
  ];

  // Create labs
  for (const lab of labs) {
    try {
      const existingLab = await prisma.virtualLab.findFirst({
        where: { title: lab.title }
      });

      if (!existingLab) {
        await prisma.virtualLab.create({ data: lab });
        console.log(`Created lab: ${lab.title}`);
      } else {
        console.log(`Lab "${lab.title}" already exists, skipping...`);
      }
    } catch (error) {
      console.error(`Error creating lab "${lab.title}":`, error.message);
    }
  }

  // Create simple quizzes
  const quizzes = [
    {
      title: 'Reconnaissance and Footprinting Quiz',
      description: 'Test your knowledge of reconnaissance techniques and information gathering methods.',
      category: 'domain_2',
      difficulty: 'beginner',
      timeLimit: 30,
      passingScore: 70.0,
      weekReference: 'Week 2',
      createdBy: facilitator.id,
    },
    {
      title: 'Web Application Security Quiz',
      description: 'Assess your understanding of web application vulnerabilities and attack methods.',
      category: 'domain_8',
      difficulty: 'intermediate',
      timeLimit: 45,
      passingScore: 75.0,
      weekReference: 'Week 8',
      createdBy: facilitator.id,
    },
    {
      title: 'System Hacking and Malware Quiz',
      description: 'Test your knowledge of system exploitation techniques and malware analysis.',
      category: 'domain_6',
      difficulty: 'advanced',
      timeLimit: 60,
      passingScore: 80.0,
      weekReference: 'Week 10',
      createdBy: facilitator.id,
    }
  ];

  // Create quizzes
  for (const quiz of quizzes) {
    try {
      const existingQuiz = await prisma.quiz.findFirst({
        where: { title: quiz.title }
      });

      if (!existingQuiz) {
        const createdQuiz = await prisma.quiz.create({ data: quiz });
        console.log(`Created quiz: ${quiz.title}`);

        // Add some sample questions
        const sampleQuestions = [
          {
            quizId: createdQuiz.id,
            questionText: 'What is the primary purpose of footprinting in ethical hacking?',
            questionType: 'multiple_choice',
            correctAnswer: 'To gather information about the target',
            points: 10,
            options: [
              { text: 'To gather information about the target', isCorrect: true },
              { text: 'To exploit vulnerabilities', isCorrect: false },
              { text: 'To maintain access', isCorrect: false },
              { text: 'To cover tracks', isCorrect: false }
            ]
          },
          {
            quizId: createdQuiz.id,
            questionText: 'Which tool is commonly used for network reconnaissance?',
            questionType: 'multiple_choice',
            correctAnswer: 'Nmap',
            points: 10,
            options: [
              { text: 'Nmap', isCorrect: true },
              { text: 'Word', isCorrect: false },
              { text: 'Excel', isCorrect: false },
              { text: 'Photoshop', isCorrect: false }
            ]
          }
        ];

        for (const question of sampleQuestions) {
          await prisma.quizQuestion.create({ data: question });
        }

        console.log(`Added ${sampleQuestions.length} questions to quiz: ${quiz.title}`);
      } else {
        console.log(`Quiz "${quiz.title}" already exists, skipping...`);
      }
    } catch (error) {
      console.error(`Error creating quiz "${quiz.title}":`, error.message);
    }
  }

  // Create achievements
  const achievements = [
    {
      name: 'First Lab Completed',
      description: 'Successfully completed your first virtual lab',
      category: 'labs',
      criteria: { labs_completed: 1 },
      points: 10,
      icon: '🎯'
    },
    {
      name: 'Quiz Master',
      description: 'Scored 90% or higher on a quiz',
      category: 'quizzes',
      criteria: { min_score: 90 },
      points: 15,
      icon: '🏆'
    },
    {
      name: 'Reconnaissance Expert',
      description: 'Completed all reconnaissance labs',
      category: 'labs',
      criteria: { category: 'reconnaissance', labs_completed: 3 },
      points: 25,
      icon: '🔍'
    }
  ];

  for (const achievement of achievements) {
    try {
      const existingAchievement = await prisma.achievement.findFirst({
        where: { name: achievement.name }
      });

      if (!existingAchievement) {
        await prisma.achievement.create({ data: achievement });
        console.log(`Created achievement: ${achievement.name}`);
      } else {
        console.log(`Achievement "${achievement.name}" already exists, skipping...`);
      }
    } catch (error) {
      console.error(`Error creating achievement "${achievement.name}":`, error.message);
    }
  }

  console.log('Quiz and lab seeding completed successfully!');
}

seedQuizzesAndLabsSimple()
  .catch((e) => {
    console.error('Error seeding quizzes and labs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
