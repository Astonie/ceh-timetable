import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVirtualLabsAndQuizzes() {
  try {
    console.log('🧪 Seeding Virtual Labs and Quizzes...');

    // First, get facilitators for assignment
    const facilitators = await prisma.facilitator.findMany();
    
    if (facilitators.length === 0) {
      console.log('❌ No facilitators found. Please seed facilitators first.');
      return;
    }

    // Seed Virtual Labs
    const virtualLabs = [
      {
        title: 'Footprinting and Reconnaissance Lab',
        description: 'Learn passive and active information gathering techniques using various tools and methods.',
        difficulty: 'beginner',
        category: 'footprinting',
        estimatedTime: 90,
        instructions: `# Footprinting and Reconnaissance Lab

## Objective
Learn to gather information about target systems using passive and active reconnaissance techniques.

## Lab Environment Setup
1. Ensure you have Kali Linux VM running
2. Target websites: testphp.vulnweb.com, scanme.nmap.org
3. Tools required: Nmap, Whois, Google Dorks, Maltego

## Lab Steps

### Phase 1: Passive Reconnaissance
1. **WHOIS Lookup**
   - Use online whois tools to gather domain information
   - Command: \`whois testphp.vulnweb.com\`
   - Document: Registrar, creation date, contact information

2. **Google Dorking**
   - Use Google search operators to find sensitive information
   - Try: site:testphp.vulnweb.com filetype:pdf
   - Try: intitle:"index of" site:testphp.vulnweb.com

3. **Social Media Intelligence**
   - Search for company profiles on LinkedIn, Twitter
   - Look for employee information and technology stack

### Phase 2: Active Reconnaissance
1. **DNS Enumeration**
   - Use nslookup and dig commands
   - \`nslookup testphp.vulnweb.com\`
   - \`dig testphp.vulnweb.com ANY\`

2. **Network Scanning**
   - Basic Nmap scan: \`nmap -sV scanme.nmap.org\`
   - Service detection: \`nmap -sV -O scanme.nmap.org\`

### Phase 3: Documentation
1. Create a comprehensive report of findings
2. Include screenshots of tools and results
3. Analyze the information gathered for potential attack vectors

## Expected Outcomes
- Understanding of passive vs active reconnaissance
- Familiarity with common reconnaissance tools
- Ability to create professional penetration testing reports`,
        objectives: [
          'Understand passive and active reconnaissance techniques',
          'Learn to use WHOIS and DNS enumeration tools',
          'Practice Google dorking for information gathering',
          'Create comprehensive reconnaissance reports'
        ],
        prerequisites: [
          'Basic understanding of networking concepts',
          'Familiarity with Linux command line',
          'Knowledge of DNS and web technologies'
        ],
        resources: {
          'Target Websites': 'testphp.vulnweb.com, scanme.nmap.org',
          'Tools Required': 'Nmap, Whois, Google, Maltego CE',
          'Documentation Template': 'Available in lab resources folder'
        },
        weekReference: 'Week 2 (June 16–22)',
        createdBy: facilitators[0].id
      },
      {
        title: 'Network Scanning with Nmap',
        description: 'Master network discovery and port scanning techniques using Nmap.',
        difficulty: 'intermediate',
        category: 'scanning',
        estimatedTime: 120,
        instructions: `# Network Scanning with Nmap Lab

## Objective
Master various Nmap scanning techniques for network discovery and service enumeration.

## Lab Environment
- Kali Linux VM
- Target: scanme.nmap.org (legal scanning target)
- Additional targets: Metasploitable VM (if available)

## Lab Exercises

### Exercise 1: Host Discovery
1. **Ping Sweep**
   - \`nmap -sn 192.168.1.0/24\` (adjust to your network)
   - \`nmap -sn scanme.nmap.org\`

2. **ARP Discovery** (local network only)
   - \`nmap -PR 192.168.1.0/24\`

### Exercise 2: Port Scanning Techniques
1. **TCP Connect Scan**
   - \`nmap -sT scanme.nmap.org\`

2. **SYN Stealth Scan**
   - \`sudo nmap -sS scanme.nmap.org\`

3. **UDP Scan**
   - \`sudo nmap -sU scanme.nmap.org\`

4. **Comprehensive Scan**
   - \`nmap -sS -sV -O -A scanme.nmap.org\`

### Exercise 3: Advanced Techniques
1. **Script Scanning**
   - \`nmap --script vuln scanme.nmap.org\`
   - \`nmap --script http-enum scanme.nmap.org\`

2. **Timing and Detection Evasion**
   - \`nmap -T2 scanme.nmap.org\` (slower scan)
   - \`nmap -f scanme.nmap.org\` (fragmented packets)

### Exercise 4: Output and Reporting
1. **Save Results**
   - \`nmap -oA scan_results scanme.nmap.org\`
   - \`nmap -oX scan.xml scanme.nmap.org\`

2. **Analyze Results**
   - Review open ports and services
   - Identify potential vulnerabilities
   - Document findings

## Deliverables
- Screenshots of different scan types
- Analysis of scan results
- Recommendations for security improvements`,
        objectives: [
          'Master various Nmap scanning techniques',
          'Understand different scan types and their use cases',
          'Learn stealth and evasion techniques',
          'Practice result analysis and reporting'
        ],
        prerequisites: [
          'Completion of Footprinting lab',
          'Understanding of TCP/IP and ports',
          'Basic Linux command line skills'
        ],
        resources: {
          'Legal Target': 'scanme.nmap.org',
          'Nmap Documentation': 'https://nmap.org/docs.html',
          'Cheat Sheet': 'Nmap commands reference guide'
        },
        weekReference: 'Week 3 (June 23–29)',
        createdBy: facilitators[1].id
      },
      {
        title: 'Web Application Security Testing',
        description: 'Learn to identify and exploit common web application vulnerabilities.',
        difficulty: 'advanced',
        category: 'web-hacking',
        estimatedTime: 180,
        instructions: `# Web Application Security Testing Lab

## Objective
Identify and exploit common web application vulnerabilities including SQL injection, XSS, and authentication bypass.

## Lab Environment
- Kali Linux with Burp Suite
- Target: DVWA (Damn Vulnerable Web Application)
- Alternative: WebGoat or bWAPP

## Pre-Lab Setup
1. Download and setup DVWA
2. Configure Burp Suite proxy
3. Set security level to "Low" initially

## Lab Modules

### Module 1: SQL Injection
1. **Identify Injection Points**
   - Test login forms and search fields
   - Use single quotes to trigger errors

2. **Extract Database Information**
   - Use UNION-based injection
   - Extract table names and structure
   - Retrieve sensitive data

3. **Automated Testing**
   - Use SQLMap for automated exploitation
   - \`sqlmap -u "http://target/page?id=1" --dbs\`

### Module 2: Cross-Site Scripting (XSS)
1. **Reflected XSS**
   - Inject \`<script>alert('XSS')</script>\`
   - Test different payloads and filters

2. **Stored XSS**
   - Submit persistent payloads
   - Test comment sections and user profiles

3. **DOM-based XSS**
   - Analyze client-side JavaScript
   - Test URL fragments and parameters

### Module 3: Authentication Bypass
1. **Brute Force Attacks**
   - Use Burp Suite Intruder
   - Test common password lists
   - Implement rate limiting bypass

2. **Session Management**
   - Analyze session tokens
   - Test for session fixation
   - Check for proper logout

### Module 4: File Upload Vulnerabilities
1. **Malicious File Upload**
   - Upload PHP webshells
   - Bypass file type restrictions
   - Test double extensions

## Advanced Challenges
- Chain multiple vulnerabilities
- Perform complete application compromise
- Write proof-of-concept exploits

## Report Requirements
- Executive summary
- Technical vulnerability details
- Risk ratings and remediation steps
- Screenshots and proof-of-concepts`,
        objectives: [
          'Identify common web application vulnerabilities',
          'Learn manual and automated testing techniques',
          'Practice exploitation and proof-of-concept development',
          'Write professional security assessment reports'
        ],
        prerequisites: [
          'Understanding of web technologies (HTML, JavaScript, SQL)',
          'Basic knowledge of HTTP protocol',
          'Familiarity with Burp Suite',
          'Completion of earlier labs'
        ],
        resources: {
          'DVWA Setup': 'Download from dvwa.co.uk',
          'Burp Suite': 'Pre-installed in Kali Linux',
          'PayloadsAllTheThings': 'XSS and SQLi payload repository',
          'OWASP Top 10': 'Latest vulnerability guide'
        },
        weekReference: 'Week 12 (August 25–31)',
        createdBy: facilitators[2].id
      }
    ];

    // Create virtual labs
    for (const lab of virtualLabs) {
      await prisma.virtualLab.create({ data: lab });
    }

    console.log('✅ Virtual Labs seeded successfully!');

    // Seed Quizzes
    const quizzes = [
      {
        title: 'CEH Domain 1: Introduction to Ethical Hacking',
        description: 'Test your knowledge of information security fundamentals and ethical hacking concepts.',
        category: 'domain_1',
        difficulty: 'beginner',
        timeLimit: 30,
        passingScore: 70.0,
        maxAttempts: 3,
        randomizeQuestions: true,
        showCorrectAnswers: true,
        weekReference: 'Week 1 (June 10–15)',
        createdBy: facilitators[0].id,
        questions: {
          create: [
            {
              questionText: 'What is the primary difference between a white hat and black hat hacker?',
              questionType: 'multiple_choice',
              options: {
                A: 'White hat hackers use legal methods, black hat hackers use illegal methods',
                B: 'White hat hackers are certified, black hat hackers are not',
                C: 'White hat hackers work for companies, black hat hackers work independently',
                D: 'There is no difference between them'
              },
              correctAnswer: 'A',
              explanation: 'White hat hackers perform authorized security testing with permission, while black hat hackers engage in unauthorized and illegal activities.',
              points: 1,
              orderIndex: 0
            },
            {
              questionText: 'Which phase comes first in the ethical hacking methodology?',
              questionType: 'multiple_choice',
              options: {
                A: 'Scanning',
                B: 'Reconnaissance',
                C: 'Enumeration',
                D: 'Gaining Access'
              },
              correctAnswer: 'B',
              explanation: 'Reconnaissance (footprinting) is the first phase where information is gathered about the target.',
              points: 1,
              orderIndex: 1
            },
            {
              questionText: 'True or False: Penetration testing and ethical hacking are exactly the same thing.',
              questionType: 'true_false',
              options: {
                True: 'True',
                False: 'False'
              },
              correctAnswer: 'False',
              explanation: 'While related, penetration testing is typically more limited in scope and follows specific methodologies, while ethical hacking can be broader and more exploratory.',
              points: 1,
              orderIndex: 2
            },
            {
              questionText: 'What does CIA stand for in information security?',
              questionType: 'multiple_choice',
              options: {
                A: 'Central Intelligence Agency',
                B: 'Confidentiality, Integrity, Availability',
                C: 'Computer Information Access',
                D: 'Certified Information Auditor'
              },
              correctAnswer: 'B',
              explanation: 'The CIA triad represents the three fundamental principles of information security: Confidentiality, Integrity, and Availability.',
              points: 1,
              orderIndex: 3
            },
            {
              questionText: 'Which of the following is NOT typically included in a penetration testing agreement?',
              questionType: 'multiple_choice',
              options: {
                A: 'Scope of testing',
                B: 'Timeline and deliverables',
                C: 'System passwords',
                D: 'Rules of engagement'
              },
              correctAnswer: 'C',
              explanation: 'System passwords are discovered during testing, not provided beforehand, as this would compromise the test validity.',
              points: 1,
              orderIndex: 4
            }
          ]
        }
      },
      {
        title: 'Network Scanning and Enumeration Quiz',
        description: 'Assess your understanding of network discovery techniques and tools.',
        category: 'domain_3',
        difficulty: 'intermediate',
        timeLimit: 25,
        passingScore: 75.0,
        maxAttempts: 2,
        randomizeQuestions: true,
        showCorrectAnswers: false,
        weekReference: 'Week 3 (June 23–29)',
        createdBy: facilitators[1].id,
        questions: {
          create: [
            {
              questionText: 'Which Nmap scan type is considered the most stealthy?',
              questionType: 'multiple_choice',
              options: {
                A: 'TCP Connect (-sT)',
                B: 'SYN Stealth (-sS)',
                C: 'FIN Scan (-sF)',
                D: 'UDP Scan (-sU)'
              },
              correctAnswer: 'C',
              explanation: 'FIN scans are stealthy because they send unexpected FIN packets that many firewalls and IDS systems don\'t log.',
              points: 2,
              orderIndex: 0
            },
            {
              questionText: 'What port does HTTPS typically run on?',
              questionType: 'multiple_choice',
              options: {
                A: '80',
                B: '443',
                C: '8080',
                D: '8443'
              },
              correctAnswer: 'B',
              explanation: 'HTTPS (HTTP Secure) typically runs on port 443.',
              points: 1,
              orderIndex: 1
            },
            {
              questionText: 'True or False: A closed port will respond with a RST packet to a SYN scan.',
              questionType: 'true_false',
              options: {
                True: 'True',
                False: 'False'
              },
              correctAnswer: 'True',
              explanation: 'When a SYN packet is sent to a closed port, the target responds with a RST (reset) packet.',
              points: 1,
              orderIndex: 2
            },
            {
              questionText: 'Which protocol does NetBIOS typically use for name resolution?',
              questionType: 'multiple_choice',
              options: {
                A: 'TCP',
                B: 'UDP',
                C: 'Both TCP and UDP',
                D: 'ICMP'
              },
              correctAnswer: 'C',
              explanation: 'NetBIOS uses both TCP (for session services) and UDP (for name services and datagrams).',
              points: 2,
              orderIndex: 3
            }
          ]
        }
      },
      {
        title: 'Web Application Security Assessment',
        description: 'Advanced quiz covering web application vulnerabilities and exploitation techniques.',
        category: 'domain_13',
        difficulty: 'advanced',
        timeLimit: 45,
        passingScore: 80.0,
        maxAttempts: 1,
        randomizeQuestions: false,
        showCorrectAnswers: true,
        weekReference: 'Week 12 (August 25–31)',
        createdBy: facilitators[2].id,
        questions: {
          create: [
            {
              questionText: 'Which SQL injection technique is used when error messages are not displayed?',
              questionType: 'multiple_choice',
              options: {
                A: 'Error-based injection',
                B: 'Union-based injection',
                C: 'Blind SQL injection',
                D: 'Time-based injection'
              },
              correctAnswer: 'C',
              explanation: 'Blind SQL injection is used when the application doesn\'t return database errors or results directly to the attacker.',
              points: 3,
              orderIndex: 0
            },
            {
              questionText: 'What is the primary purpose of Content Security Policy (CSP)?',
              questionType: 'multiple_choice',
              options: {
                A: 'Prevent SQL injection attacks',
                B: 'Mitigate Cross-Site Scripting (XSS) attacks',
                C: 'Protect against CSRF attacks',
                D: 'Secure file uploads'
              },
              correctAnswer: 'B',
              explanation: 'CSP is primarily designed to mitigate XSS attacks by controlling which resources can be loaded and executed.',
              points: 2,
              orderIndex: 1
            },
            {
              questionText: 'True or False: Stored XSS is generally more dangerous than reflected XSS.',
              questionType: 'true_false',
              options: {
                True: 'True',
                False: 'False'
              },
              correctAnswer: 'True',
              explanation: 'Stored XSS is typically more dangerous because the malicious script is permanently stored and executed whenever users visit the affected page.',
              points: 2,
              orderIndex: 2
            },
            {
              questionText: 'Which HTTP header helps prevent clickjacking attacks?',
              questionType: 'multiple_choice',
              options: {
                A: 'X-Content-Type-Options',
                B: 'X-Frame-Options',
                C: 'X-XSS-Protection',
                D: 'Strict-Transport-Security'
              },
              correctAnswer: 'B',
              explanation: 'X-Frame-Options header prevents clickjacking by controlling whether a page can be embedded in frames or iframes.',
              points: 2,
              orderIndex: 3
            },
            {
              questionText: 'In a CSRF attack, what does the attacker primarily exploit?',
              questionType: 'multiple_choice',
              options: {
                A: 'Session management flaws',
                B: 'Input validation errors',
                C: 'The user\'s authenticated session',
                D: 'Database connection strings'
              },
              correctAnswer: 'C',
              explanation: 'CSRF attacks exploit the trust that a website has in the user\'s authenticated session to perform unauthorized actions.',
              points: 3,
              orderIndex: 4
            }
          ]
        }
      }
    ];

    // Create quizzes
    for (const quiz of quizzes) {
      await prisma.quiz.create({ data: quiz });
    }

    console.log('✅ Quizzes seeded successfully!');

    // Create some sample achievements
    const achievements = [
      {
        name: 'First Steps',
        description: 'Complete your first virtual lab',
        category: 'labs',
        icon: '🎯',
        criteria: { labs_completed: 1 },
        points: 50
      },
      {
        name: 'Lab Master',
        description: 'Complete 5 virtual labs',
        category: 'labs',
        icon: '🧪',
        criteria: { labs_completed: 5 },
        points: 200
      },
      {
        name: 'Quiz Ace',
        description: 'Pass 3 quizzes with 90%+ score',
        category: 'quizzes',
        icon: '🎓',
        criteria: { quizzes_passed_with_90_percent: 3 },
        points: 150
      },
      {
        name: 'Perfect Score',
        description: 'Achieve 100% on any quiz',
        category: 'quizzes',
        icon: '💯',
        criteria: { perfect_quiz_score: 1 },
        points: 100
      },
      {
        name: 'Consistent Learner',
        description: 'Complete activities for 7 consecutive days',
        category: 'participation',
        icon: '🔥',
        criteria: { consecutive_days: 7 },
        points: 75
      }
    ];

    for (const achievement of achievements) {
      await prisma.achievement.create({ data: achievement });
    }

    console.log('✅ Achievements seeded successfully!');
    console.log('🎉 Virtual Labs and Quizzes system fully seeded!');

  } catch (error) {
    console.error('❌ Error seeding virtual labs and quizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedVirtualLabsAndQuizzes();
