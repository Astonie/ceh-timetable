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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
