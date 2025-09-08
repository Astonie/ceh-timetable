import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed facilitators
  const facilitator1 = await prisma.facilitator.upsert({
    where: { email: 'lucius.malizani@example.com' },
    update: {},
    create: {
      name: 'Lucius Malizani',
      email: 'lucius.malizani@example.com',
    },
  });

  const facilitator2 = await prisma.facilitator.upsert({
    where: { email: 'astonie.mukiwa@example.com' },
    update: {},
    create: {
      name: 'Astonie Mukiwa',
      email: 'astonie.mukiwa@example.com',
    },
  });

  const facilitator3 = await prisma.facilitator.upsert({
    where: { email: 'hopkins.ceaser@example.com' },
    update: {},
    create: {
      name: 'Hopkins Ceaser',
      email: 'hopkins.ceaser@example.com',
    },
  });

  console.log('Facilitators seeded:', { facilitator1, facilitator2, facilitator3 });

  // Clear existing quiz data
  await prisma.quizResponse.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();

  // Comprehensive quiz data for all study weeks
  const quizzes = [
    {
      title: "CEH Domain 1: Information Security and Ethical Hacking Overview",
      description: "Test your knowledge of information security fundamentals, hacking phases, and attack vectors.",
      category: "Information Security",
      timeLimit: 25,
      passingScore: 70,
      isActive: true,
      showCorrectAnswers: true,
      weekReference: "Week 1 (June 10–15)",
      createdBy: facilitator1.id,
      questions: [
        {
          questionText: "What are the five phases of ethical hacking?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Reconnaissance, Scanning, Gaining Access, Maintaining Access, Covering Tracks",
            "Planning, Reconnaissance, Exploitation, Post-Exploitation, Reporting",
            "Information Gathering, Vulnerability Assessment, Exploitation, Privilege Escalation, Cleanup",
            "Footprinting, Scanning, Enumeration, System Hacking, Maintaining Access"
          ]),
          correctAnswer: "0",
          explanation: "The five phases of ethical hacking are: 1) Reconnaissance (information gathering), 2) Scanning (identifying live systems and services), 3) Gaining Access (exploiting vulnerabilities), 4) Maintaining Access (establishing persistence), and 5) Covering Tracks (removing evidence).",
          points: 2
        },
        {
          questionText: "Which type of hacker is motivated primarily by financial gain?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "White Hat Hacker",
            "Black Hat Hacker", 
            "Gray Hat Hacker",
            "Script Kiddie"
          ]),
          correctAnswer: "1",
          explanation: "Black Hat hackers are malicious hackers who break into computer systems for personal gain, financial profit, or other malicious reasons.",
          points: 1
        },
        {
          questionText: "What is the CIA triad in information security?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Central Intelligence Agency framework",
            "Confidentiality, Integrity, Availability",
            "Computer, Internet, Application security", 
            "Critical, Important, Auxiliary data classification"
          ]),
          correctAnswer: "1",
          explanation: "The CIA triad represents the three core principles of information security: Confidentiality (data privacy), Integrity (data accuracy), and Availability (data accessibility).",
          points: 1
        },
        {
          questionText: "What is the primary difference between a vulnerability and an exploit?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Vulnerabilities are software bugs, exploits are hardware issues",
            "A vulnerability is a weakness, an exploit is code that takes advantage of that weakness",
            "Vulnerabilities are found by attackers, exploits are found by defenders",
            "There is no difference between them"
          ]),
          correctAnswer: "1",
          explanation: "A vulnerability is a weakness or flaw in a system that could potentially be exploited, while an exploit is actual code or technique that takes advantage of that vulnerability.",
          points: 2
        },
        {
          questionText: "Which attack vector involves manipulating people to divulge confidential information?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Technical attack",
            "Physical attack",
            "Social engineering",
            "Network attack"
          ]),
          correctAnswer: "2",
          explanation: "Social engineering attacks manipulate human psychology to trick people into revealing sensitive information or performing actions that compromise security.",
          points: 2
        },
        {
          questionText: "What is the purpose of a penetration test?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To damage the target system",
            "To evaluate the security of a system by simulating an attack",
            "To install backdoors for future access",
            "To collect sensitive data"
          ]),
          correctAnswer: "1",
          explanation: "Penetration testing is a legitimate security assessment method that simulates cyberattacks to evaluate system security and identify vulnerabilities.",
          points: 2
        },
        {
          questionText: "Which law primarily governs ethical hacking activities in the United States?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Computer Fraud and Abuse Act (CFAA)",
            "Digital Millennium Copyright Act (DMCA)",
            "Sarbanes-Oxley Act",
            "Health Insurance Portability and Accountability Act (HIPAA)"
          ]),
          correctAnswer: "0",
          explanation: "The Computer Fraud and Abuse Act (CFAA) is the primary federal law that criminalizes certain computer-related activities and is relevant to ethical hacking.",
          points: 2
        },
        {
          questionText: "What is the difference between a risk and a threat?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Risk is potential damage, threat is actual damage",
            "Risk is the likelihood of threat exploitation, threat is potential danger",
            "Risk and threat are the same thing",
            "Risk is internal, threat is external"
          ]),
          correctAnswer: "1",
          explanation: "A threat is a potential danger that could exploit a vulnerability, while risk is the likelihood of that threat being realized and causing damage.",
          points: 2
        },
        {
          questionText: "Which type of testing is performed without any prior knowledge of the target system?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "White box testing",
            "Gray box testing",
            "Black box testing",
            "Clear box testing"
          ]),
          correctAnswer: "2",
          explanation: "Black box testing is performed without any prior knowledge of the target system's internal structure, simulating an external attacker's perspective.",
          points: 1
        },
        {
          questionText: "Which of the following best describes 'threat modeling'?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Creating malware signatures",
            "Systematic approach to identifying and analyzing potential threats",
            "Penetration testing methodology",
            "Network monitoring technique"
          ]),
          correctAnswer: "1",
          explanation: "Threat modeling is a systematic approach used to identify, understand, and analyze potential threats to a system or application.",
          points: 2
        }
      ]
    }
  ];

  // Create quizzes with questions
  for (const quizData of quizzes) {
    const { questions, ...quizInfo } = quizData;
    
    const quiz = await prisma.quiz.create({
      data: {
        ...quizInfo,
        questions: {
          create: questions
        }
      }
    });

    console.log(`Created quiz: ${quiz.title} with ${questions.length} questions`);
  }

  console.log('Quiz data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
