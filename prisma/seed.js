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

  // Seed timetable entries with the original CEH study group format
  const timetableEntries = [
    { 
      week: 'Week 1 (June 10–15)', 
      title: 'Introduction + Domain 1: Information Security and Ethical Hacking Overview', 
      details: [
        "Concepts: InfoSec fundamentals, hacking phases, attack vectors, threat categories",
        "Tools: Terminology, hacker types",
        "Task: Set up lab environment (Kali Linux, vulnerable VMs)"
      ],
      facilitatorId: facilitator1.id 
    },
    { 
      week: 'Week 2 (June 16–22)', 
      title: 'Domain 2: Footprinting and Reconnaissance', 
      details: [
        "Techniques: Active/passive footprinting, Whois, Google hacking",
        "Tools: Maltego, Recon-ng",
        "Lab: Perform footprinting"
      ],
      facilitatorId: facilitator2.id 
    },
    { 
      week: 'Week 3 (June 23–29)', 
      title: 'Domain 3: Scanning Networks', 
      details: [
        "Techniques: Ping sweep, port scanning",
        "Tools: Nmap, Zenmap",
        "Lab: Scan a test"
      ],
      facilitatorId: facilitator3.id 
    },
    { 
      week: 'Week 4 (June 30–July 6)', 
      title: 'Domain 4: Enumeration', 
      details: [
        "Techniques: NetBIOS, SNMP, SMTP",
        "Tools: enum4linux",
        "Lab: Enumerate a target"
      ],
      facilitatorId: facilitator1.id 
    },
    { 
      week: 'Week 5 (July 7–13)', 
      title: 'Domain 5: Vulnerability Analysis', 
      details: [
        "Techniques: Vulnerability assessment",
        "Tools: Nessus, OpenVAS",
        "Lab: Scan vulnerabilities"
      ],
      facilitatorId: facilitator2.id 
    },
    { 
      week: 'Week 6 (July 14–20)', 
      title: 'Domain 6: System Hacking', 
      details: [
        "Topics: Password cracking, escalation",
        "Tools: John the Ripper",
        "Lab: Crack shell"
      ],
      facilitatorId: facilitator3.id 
    },
    { 
      week: 'Week 7 (July 21–27)', 
      title: 'Domain 7: Malware Threats', 
      details: [
        "Types: Trojans, worms",
        "Tools: Maltego, PEiD",
        "Lab: Analyze malware"
      ],
      facilitatorId: facilitator1.id 
    },
    { 
      week: 'Week 8 (July 28–August 3)', 
      title: 'Domain 8: Sniffing', 
      details: [
        "Techniques: Packet sniffing, MITM",
        "Tools: Wireshark",
        "Lab: Sniff traffic"
      ],
      facilitatorId: facilitator2.id 
    },
    { 
      week: 'Week 9 (August 4–10)', 
      title: 'Domain 9: Social Engineering', 
      details: [
        "Techniques: Phishing, tailgating",
        "Tools: SET",
        "Activity: Simulate phishing"
      ],
      facilitatorId: facilitator3.id 
    },
    { 
      week: 'Week 10 (August 11–17)', 
      title: 'Domain 10: Denial-of-Service', 
      details: [
        "Attacks: Volumetric, protocol",
        "Tools: LOIC, Hping",
        "Lab: DoS simulation"
      ],
      facilitatorId: facilitator1.id 
    },
    { 
      week: 'Week 11 (August 18–24)', 
      title: 'Domains 11–12: Session Hijacking, IDS Evasion', 
      details: [
        "Topics: Session interception, evasion",
        "Tools: Burp Suite",
        "Lab: Simulate hijacking"
      ],
      facilitatorId: facilitator2.id 
    },
    { 
      week: 'Week 12 (August 25–31)', 
      title: 'Domains 13–14: Web and Wireless Hacking', 
      details: [
        "Attacks: SQLi, XSS, WPA",
        "Tools: SQLMap, Aircrack",
        "Lab: Exploit web app"
      ],
      facilitatorId: facilitator3.id 
    },
    { 
      week: 'Week 13 (September 1–6)', 
      title: 'Domains 15–20: Mobile, Cloud, Crypto', 
      details: [
        "Topics: Encryption, mobile",
        "Tools: OpenSSL",
        "Lab: Secure mobile"
      ],
      facilitatorId: facilitator1.id 
    },
    { 
      week: 'Final Review (September 7–10)', 
      title: 'Final Review', 
      details: [
        "Tasks: Take 2 practice exams",
        "Review: Weak areas",
        "Lab: Revisit labs"
      ],
      facilitatorId: facilitator2.id 
    },
  ];

  // Clear existing timetable entries
  await prisma.timetableEntry.deleteMany();

  // Insert all timetable entries
  for (const entry of timetableEntries) {
    await prisma.timetableEntry.create({
      data: entry
    });
  }

  console.log('Timetable entries seeded successfully!');

  // Seed default settings
  const defaultSettings = [
    {
      key: 'meeting_link',
      value: 'https://meet.google.com/your-meeting-room',
      description: 'Google Meet link for weekly study sessions'
    },
    {
      key: 'meeting_time',
      value: '20:00',
      description: 'Default meeting time in 24-hour format'
    },
    {
      key: 'meeting_timezone',
      value: 'CAT',
      description: 'Timezone for meeting schedule (CAT = Central Africa Time)'
    },
    {
      key: 'meeting_day',
      value: 'Saturday',
      description: 'Day of the week for regular meetings'
    },
    {
      key: 'study_group_name',
      value: 'CEH v13 Study Group',
      description: 'Name of the study group'
    },
    {
      key: 'contact_email',
      value: 'admin@cehstudygroup.com',
      description: 'Contact email for study group inquiries'
    },
    {
      key: 'backup_meeting_link',
      value: 'https://zoom.us/j/your-backup-room',
      description: 'Backup meeting link in case primary link fails'
    },
    {
      key: 'group_size_limit',
      value: '50',
      description: 'Maximum number of participants in the study group'
    },
    {
      key: 'course_duration_weeks',
      value: '20',
      description: 'Total duration of the CEH course in weeks'
    },
    {
      key: 'lab_environment_guide',
      value: 'https://docs.google.com/document/d/your-lab-setup-guide',
      description: 'Link to lab environment setup instructions'
    }
  ];

  // Upsert settings (create or update if exists)
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { 
        value: setting.value,
        description: setting.description
      },
      create: setting
    });
  }

  console.log('Default settings seeded successfully!');

  // Seed quiz data with comprehensive coverage for all study weeks
  const quizzes = [
    {
      title: "CEH Domain 1: Information Security and Ethical Hacking Overview",
      description: "Test your knowledge of information security fundamentals, hacking phases, and attack vectors.",
      category: "Information Security",
      timeLimit: 20, // 20 minutes
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
        }
      ]
    },
    {
      title: "CEH Domain 2: Footprinting and Reconnaissance",
      description: "Assess your understanding of information gathering techniques and reconnaissance methods.",
      category: "Reconnaissance",
      timeLimit: 25,
      passingScore: 75,
      isActive: true,
      showCorrectAnswers: true,
      weekReference: "Week 2 (June 16–22)",
      createdBy: facilitator2.id,
      questions: [
        {
          questionText: "What is the difference between active and passive footprinting?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Active uses tools, passive uses manual methods",
            "Active directly interacts with target, passive gathers information without direct interaction",
            "Active is legal, passive is illegal",
            "Active is faster, passive is more accurate"
          ]),
          correctAnswer: "1",
          explanation: "Active footprinting involves direct interaction with the target system (like port scanning), while passive footprinting gathers information without direct contact (like searching public records).",
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
          explanation: "Black Hat hackers are malicious hackers who break into systems for personal gain, financial profit, or to cause damage. They violate computer security for malicious purposes."
        },
        {
          questionText: "What is the primary difference between a vulnerability and an exploit?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Vulnerability is software, exploit is hardware",
            "Vulnerability is a weakness, exploit is code that takes advantage of it",
            "Vulnerability is external, exploit is internal",
            "There is no difference between them"
          ]),
          correctAnswer: "1",
          explanation: "A vulnerability is a weakness or flaw in a system that could be exploited. An exploit is the actual code, technique, or method used to take advantage of that vulnerability."
        },
        {
          questionText: "Which of the following is NOT a category of security threats?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Network Threats",
            "Host Threats", 
            "Application Threats",
            "Encryption Threats"
          ]),
          correctAnswer: "3",
          explanation: "The main categories of security threats are Network Threats (attacks on network infrastructure), Host Threats (attacks on individual systems), and Application Threats (attacks on software applications). Encryption is a security control, not a threat category."
        },
        {
          questionText: "What does CIA stand for in information security?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Central Intelligence Agency",
            "Confidentiality, Integrity, Availability",
            "Computer Information Analysis",
            "Cyber Intelligence Assessment"
          ]),
          correctAnswer: "1",
          explanation: "In information security, CIA stands for Confidentiality (protecting data from unauthorized access), Integrity (ensuring data hasn't been tampered with), and Availability (ensuring systems and data are accessible when needed)."
        }
      ]
    },
    {
      title: "CEH Domain 2: Footprinting and Reconnaissance",
      description: "Assess your understanding of information gathering techniques and reconnaissance methods.",
      category: "Reconnaissance",
      timeLimit: 20,
      passingScore: 75,
      isActive: true,
      showCorrectAnswers: true,
      createdBy: facilitator2.id,
      questions: [
        {
          questionText: "What is the difference between active and passive footprinting?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Active uses tools, passive uses manual methods",
            "Active directly interacts with target, passive gathers information without direct interaction",
            "Active is legal, passive is illegal",
            "Active is faster, passive is more accurate"
          ]),
          correctAnswer: "1",
          explanation: "Active footprinting involves directly interacting with the target system (like port scanning), while passive footprinting gathers information without directly contacting the target (like using search engines or social media)."
        },
        {
          questionText: "Which Google dork would you use to find PDF files on a specific domain?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "site:example.com filetype:pdf",
            "domain:example.com type:pdf",
            "url:example.com ext:pdf",
            "host:example.com format:pdf"
          ]),
          correctAnswer: "0",
          explanation: "The correct Google dork is 'site:example.com filetype:pdf' which searches for PDF files specifically on the example.com domain."
        },
        {
          questionText: "What information can typically be gathered from a WHOIS lookup?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Only IP address and domain name",
            "Domain registrant details, DNS servers, registration dates",
            "Website content and structure",
            "Employee email addresses and phone numbers"
          ]),
          correctAnswer: "1",
          explanation: "WHOIS lookups provide domain registration information including registrant contact details, administrative and technical contacts, DNS server information, registration and expiration dates."
        },
        {
          questionText: "Which tool is primarily used for DNS enumeration and subdomain discovery?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Nmap",
            "Wireshark",
            "DNSrecon",
            "Metasploit"
          ]),
          correctAnswer: "2",
          explanation: "DNSrecon is specifically designed for DNS enumeration, including subdomain discovery, DNS record enumeration, and zone transfers. While other tools may have DNS capabilities, DNSrecon is purpose-built for this task."
        },
        {
          questionText: "What type of information can be gathered through social media reconnaissance?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Only public posts and photos",
            "Employee names, relationships, locations, interests, and potentially sensitive information",
            "Just company information",
            "Only technical system details"
          ]),
          correctAnswer: "1",
          explanation: "Social media reconnaissance can reveal extensive information including employee names, job roles, relationships, locations, personal interests, travel plans, and sometimes inadvertently shared sensitive company information."
        }
      ]
    },
    {
      title: "CEH Domain 3: Scanning Networks",
      description: "Test your knowledge of network scanning techniques, tools, and methodologies.",
      category: "Network Scanning",
      timeLimit: 25,
      passingScore: 80,
      isActive: true,
      showCorrectAnswers: true,
      createdBy: facilitator3.id,
      questions: [
        {
          questionText: "What is the purpose of a ping sweep?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To determine which hosts are alive on a network",
            "To identify open ports on a system",
            "To enumerate services running on a host",
            "To perform vulnerability scanning"
          ]),
          correctAnswer: "0",
          explanation: "A ping sweep (or ping scan) is used to determine which IP addresses are active/alive on a network by sending ICMP echo requests to a range of IP addresses."
        },
        {
          questionText: "Which Nmap scan type is considered the most stealthy?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "TCP Connect scan (-sT)",
            "SYN scan (-sS)",
            "FIN scan (-sF)",
            "UDP scan (-sU)"
          ]),
          correctAnswer: "2",
          explanation: "FIN scan (-sF) is considered more stealthy than SYN scans because it sends only FIN packets, which are less likely to be logged by firewalls and intrusion detection systems."
        },
        {
          questionText: "What does a closed port typically respond with during a TCP SYN scan?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "SYN/ACK packet",
            "RST packet",
            "FIN packet",
            "No response"
          ]),
          correctAnswer: "1",
          explanation: "During a TCP SYN scan, a closed port typically responds with an RST (Reset) packet, indicating that no service is listening on that port."
        },
        {
          questionText: "Which of the following is NOT a common port scanning technique?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "TCP Connect Scan",
            "UDP Scan",
            "ICMP Scan",
            "Christmas Tree Scan"
          ]),
          correctAnswer: "2",
          explanation: "ICMP Scan is not a port scanning technique - ICMP is used for network diagnostics and host discovery (ping sweeps). The other options are legitimate port scanning techniques."
        },
        {
          questionText: "What information does banner grabbing typically provide?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Network topology information",
            "Service version and sometimes operating system information",
            "User account information",
            "Firewall configuration details"
          ]),
          correctAnswer: "1",
          explanation: "Banner grabbing reveals service version information, software details, and sometimes operating system information by capturing the banner or header information that services display when connected to."
        }
      ]
    },
    {
      title: "CEH Domain 4: Vulnerability Assessment",
      description: "Understanding vulnerability assessment methodologies and tools.",
      category: "Vulnerability Assessment",
      timeLimit: 25,
      passingScore: 70,
      isActive: true,
      showCorrectAnswers: true,
      weekReference: "Week 4 (June 30–July 6)",
      createdBy: facilitator1.id,
      questions: [
        {
          questionText: "What is the primary goal of vulnerability assessment?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To exploit vulnerabilities",
            "To identify and classify security weaknesses",
            "To install backdoors",
            "To steal sensitive data"
          ]),
          correctAnswer: "1",
          explanation: "Vulnerability assessment aims to systematically identify, classify, and prioritize security vulnerabilities in systems and applications.",
          points: 2
        },
        {
          questionText: "Which vulnerability scoring system is most widely used?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "OWASP Risk Rating",
            "CVSS (Common Vulnerability Scoring System)",
            "NIST Framework",
            "ISO 27001"
          ]),
          correctAnswer: "1",
          explanation: "CVSS (Common Vulnerability Scoring System) is the industry standard for rating the severity of security vulnerabilities.",
          points: 2
        },
        {
          questionText: "What does CVE stand for?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Common Vulnerability Enumeration",
            "Central Vulnerability Exchange",
            "Common Vulnerabilities and Exposures",
            "Critical Vulnerability Evaluation"
          ]),
          correctAnswer: "2",
          explanation: "CVE stands for Common Vulnerabilities and Exposures, a standardized identifier for known security vulnerabilities.",
          points: 1
        },
        {
          questionText: "Which tool is commonly used for automated vulnerability scanning?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Wireshark",
            "Nessus",
            "Metasploit",
            "Hashcat"
          ]),
          correctAnswer: "1",
          explanation: "Nessus is one of the most popular automated vulnerability scanners used for identifying security weaknesses in systems.",
          points: 1
        },
        {
          questionText: "What is a false positive in vulnerability scanning?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "A vulnerability that doesn't exist but is reported",
            "A vulnerability that exists but isn't reported",
            "A correctly identified vulnerability",
            "A critical vulnerability"
          ]),
          correctAnswer: "0",
          explanation: "A false positive occurs when a vulnerability scanner reports a vulnerability that doesn't actually exist in the system.",
          points: 2
        },
        {
          questionText: "Which phase comes after vulnerability identification?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Exploitation",
            "Risk assessment and prioritization",
            "Remediation implementation",
            "Documentation"
          ]),
          correctAnswer: "1",
          explanation: "After identifying vulnerabilities, the next step is to assess and prioritize risks based on factors like exploitability and business impact.",
          points: 2
        },
        {
          questionText: "What is the difference between authenticated and unauthenticated scans?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Authenticated scans use credentials to access systems",
            "Unauthenticated scans are more thorough",
            "Authenticated scans are less accurate",
            "There is no difference"
          ]),
          correctAnswer: "0",
          explanation: "Authenticated scans use valid credentials to log into systems, providing deeper access and more comprehensive vulnerability detection.",
          points: 2
        },
        {
          questionText: "Which type of vulnerability assessment focuses on web applications?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Network assessment",
            "Database assessment",
            "Application assessment",
            "Wireless assessment"
          ]),
          correctAnswer: "2",
          explanation: "Application assessment specifically focuses on identifying vulnerabilities in web applications and software.",
          points: 1
        },
        {
          questionText: "What is vulnerability remediation?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Finding new vulnerabilities",
            "The process of fixing identified vulnerabilities",
            "Exploiting vulnerabilities",
            "Ignoring vulnerabilities"
          ]),
          correctAnswer: "1",
          explanation: "Vulnerability remediation is the process of addressing and fixing identified security vulnerabilities through patches, configuration changes, or other corrective actions.",
          points: 2
        },
        {
          questionText: "Which factor is most important when prioritizing vulnerabilities for remediation?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Alphabetical order",
            "Date discovered",
            "Risk level and business impact",
            "System location"
          ]),
          correctAnswer: "2",
          explanation: "Vulnerabilities should be prioritized based on their risk level (likelihood and impact) and potential business impact if exploited.",
          points: 2
        }
      ]
    },
    {
      title: "CEH Domain 5: System Hacking and Password Attacks",
      description: "Explore system hacking techniques and password attack methods.",
      category: "System Security",
      timeLimit: 30,
      passingScore: 75,
      isActive: true,
      showCorrectAnswers: true,
      weekReference: "Week 5 (July 7–13)",
      createdBy: facilitator2.id,
      questions: [
        {
          questionText: "What is the primary goal of privilege escalation?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To gain higher-level access rights",
            "To steal user passwords",
            "To crash the system",
            "To install antivirus software"
          ]),
          correctAnswer: "0",
          explanation: "Privilege escalation aims to gain higher-level access rights than initially obtained, often seeking administrative or root privileges.",
          points: 2
        },
        {
          questionText: "Which password attack tries all possible combinations?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Dictionary attack",
            "Brute force attack",
            "Rainbow table attack",
            "Social engineering"
          ]),
          correctAnswer: "1",
          explanation: "A brute force attack systematically tries all possible combinations of characters until the correct password is found.",
          points: 2
        },
        {
          questionText: "What are rainbow tables used for?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Network mapping",
            "Password cracking using precomputed hashes",
            "Vulnerability scanning",
            "Packet analysis"
          ]),
          correctAnswer: "1",
          explanation: "Rainbow tables contain precomputed hash values for common passwords, allowing for faster password cracking by hash lookup.",
          points: 2
        },
        {
          questionText: "Which tool is commonly used for Windows password cracking?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Nmap",
            "John the Ripper",
            "Wireshark",
            "Metasploit"
          ]),
          correctAnswer: "1",
          explanation: "John the Ripper is a popular password cracking tool that supports various hash formats including Windows passwords.",
          points: 1
        },
        {
          questionText: "What is a rootkit?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "A legitimate administrative tool",
            "Malicious software designed to hide its presence",
            "A type of firewall",
            "A password cracking technique"
          ]),
          correctAnswer: "1",
          explanation: "A rootkit is malicious software designed to hide its presence and maintain persistent access while concealing its activities from system administrators.",
          points: 2
        },
        {
          questionText: "Which Windows file stores password hashes?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "boot.ini",
            "SAM (Security Account Manager)",
            "registry.dat",
            "system.log"
          ]),
          correctAnswer: "1",
          explanation: "The SAM (Security Account Manager) file stores Windows user account information including password hashes.",
          points: 2
        },
        {
          questionText: "What is the purpose of keyloggers?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To improve typing speed",
            "To record keystrokes for credential theft",
            "To encrypt communications",
            "To backup system files"
          ]),
          correctAnswer: "1",
          explanation: "Keyloggers record keystrokes to capture sensitive information like passwords, credit card numbers, and other confidential data.",
          points: 2
        },
        {
          questionText: "Which attack technique involves buffer overflow exploitation?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Social engineering",
            "Memory corruption attack",
            "Password spraying",
            "DNS poisoning"
          ]),
          correctAnswer: "1",
          explanation: "Buffer overflow is a type of memory corruption attack that can lead to system compromise by overwriting memory locations.",
          points: 2
        },
        {
          questionText: "What is pass-the-hash attack?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Using stolen password hashes for authentication",
            "Cracking password hashes",
            "Storing password hashes",
            "Generating password hashes"
          ]),
          correctAnswer: "0",
          explanation: "Pass-the-hash attack uses stolen NTLM or LanMan password hashes to authenticate to remote systems without knowing the actual password.",
          points: 2
        },
        {
          questionText: "Which technique helps prevent password attacks?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Using simple passwords",
            "Account lockout policies",
            "Disabling encryption",
            "Sharing passwords"
          ]),
          correctAnswer: "1",
          explanation: "Account lockout policies help prevent brute force attacks by locking accounts after a specified number of failed login attempts.",
          points: 2
        }
      ]
    },
    {
      title: "CEH Domain 6: Malware Analysis and Threats",
      description: "Learn about malware types, analysis techniques, and countermeasures.",
      category: "Malware Analysis",
      timeLimit: 25,
      passingScore: 70,
      isActive: true,
      showCorrectAnswers: true,
      weekReference: "Week 6 (July 14–20)",
      createdBy: facilitator3.id,
      questions: [
        {
          questionText: "What is the main difference between a virus and a worm?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Viruses are faster than worms",
            "Viruses require a host program, worms are self-replicating",
            "Viruses spread through email, worms spread through USB",
            "There is no difference"
          ]),
          correctAnswer: "1",
          explanation: "Viruses need a host program to attach to and spread, while worms are self-replicating malware that can spread independently across networks.",
          points: 2
        },
        {
          questionText: "Which type of malware appears to be legitimate software?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Virus",
            "Worm",
            "Trojan Horse",
            "Rootkit"
          ]),
          correctAnswer: "2",
          explanation: "A Trojan Horse (or Trojan) is malware that disguises itself as legitimate software to trick users into installing it.",
          points: 2
        },
        {
          questionText: "What is the primary purpose of a botnet?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To improve network performance",
            "To control multiple compromised computers remotely",
            "To provide network security",
            "To backup data automatically"
          ]),
          correctAnswer: "1",
          explanation: "A botnet is a network of compromised computers controlled remotely by cybercriminals for malicious activities like DDoS attacks or cryptocurrency mining.",
          points: 2
        },
        {
          questionText: "Which analysis technique involves examining malware without executing it?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Dynamic analysis",
            "Static analysis",
            "Behavioral analysis",
            "Runtime analysis"
          ]),
          correctAnswer: "1",
          explanation: "Static analysis examines malware code, structure, and properties without executing it, using tools like disassemblers and hex editors.",
          points: 2
        },
        {
          questionText: "What is ransomware designed to do?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Steal user credentials",
            "Monitor user activities",
            "Encrypt files and demand payment for decryption",
            "Create backdoors for future access"
          ]),
          correctAnswer: "2",
          explanation: "Ransomware encrypts victim's files and demands payment (usually in cryptocurrency) for the decryption key.",
          points: 2
        },
        {
          questionText: "Which tool is commonly used for malware analysis?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Nmap",
            "OllyDbg",
            "Wireshark",
            "John the Ripper"
          ]),
          correctAnswer: "1",
          explanation: "OllyDbg is a debugger commonly used for malware analysis to examine program execution and reverse engineer malicious code.",
          points: 1
        },
        {
          questionText: "What is a polymorphic virus?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "A virus that affects multiple file types",
            "A virus that changes its code to avoid detection",
            "A virus that spreads across multiple platforms",
            "A virus that has multiple payloads"
          ]),
          correctAnswer: "1",
          explanation: "A polymorphic virus changes its code structure while maintaining the same functionality to evade signature-based antivirus detection.",
          points: 2
        },
        {
          questionText: "Which malware persistence technique involves modifying system startup processes?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "File infection",
            "Registry modification",
            "Memory injection",
            "Network communication"
          ]),
          correctAnswer: "1",
          explanation: "Registry modification allows malware to persist by adding entries to Windows registry keys that execute during system startup.",
          points: 2
        },
        {
          questionText: "What is the purpose of packing in malware?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "To compress the file size",
            "To obfuscate the code and evade detection",
            "To improve performance",
            "To add new features"
          ]),
          correctAnswer: "1",
          explanation: "Packing obfuscates malware code to make analysis more difficult and helps evade signature-based detection systems.",
          points: 2
        },
        {
          questionText: "Which countermeasure is most effective against zero-day malware?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Signature-based antivirus",
            "Behavioral analysis and sandboxing",
            "Firewall rules",
            "Regular updates"
          ]),
          correctAnswer: "1",
          explanation: "Behavioral analysis and sandboxing can detect unknown malware by analyzing suspicious behavior patterns rather than relying on known signatures.",
          points: 2
        }
      ]
    }
  ];

  // Clear existing quiz data
  await prisma.quizResponse.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();

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
