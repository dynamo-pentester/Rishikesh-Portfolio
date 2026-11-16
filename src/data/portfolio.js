// Static portfolio data — Rishikesh R, Security Engineer

export const profile = {
  name: 'Rishikesh R',
  role: 'Security Engineer',
  tagline: 'Building at the intersection of offense and architecture.',
  intro:
    'Security-focused engineer with a passion for kernel internals, offensive testing, and building detection systems — uncovering vulnerabilities before they become incidents.',
  location: 'Tamil Nadu, India',
  email: 'rishikesh091105@gmail.com',
  available: 'Open to internships & junior roles — 2025',
  social: [
    { label: 'GitHub', href: 'https://github.com/dynamo-pentester' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/rishikesh-r-196b5a290' },
    { label: 'TryHackMe', href: 'https://tryhackme.com' },
    { label: 'Portfolio', href: 'https://rishikesh-r.vercel.app' },
  ],
};

export const stats = [
  { value: 'Top 3%', label: 'TryHackMe Global' },
  { value: '#44', label: 'Apoorv CTF 2026' },
  { value: '3+', label: 'Major Projects' },
  { value: '5', label: 'Certifications' },
];

export const services = [
  {
    id: '01',
    title: 'Offensive Security',
    desc: 'VAPT, OWASP Top 10 assessments, network penetration testing, and adversary simulation across web and infrastructure layers.',
    keywords: ['VAPT', 'OWASP', 'Pentest', 'Burp Suite'],
  },
  {
    id: '02',
    title: 'Kernel & Systems',
    desc: 'Linux kernel module development, syscall internals, rootkit detection, and low-level system analysis using kprobes and Netlink.',
    keywords: ['LKM', 'kprobes', 'Netlink', 'C/C++'],
  },
  {
    id: '03',
    title: 'Backend & Security Engineering',
    desc: 'Building secure backend pipelines with FastAPI/Flask, integrating cryptographic primitives, and designing detection-first architectures.',
    keywords: ['FastAPI', 'Python', 'PostgreSQL', 'Cryptography'],
  },
  {
    id: '04',
    title: 'Digital Forensics',
    desc: 'Log analysis, network traffic inspection, memory forensics with Volatility, and post-incident investigation playbooks.',
    keywords: ['Volatility', 'Wireshark', 'Log Analysis', 'DFIR'],
  },
];

export const projects = [
  {
    id: 'sentinel',
    title: 'Sentinel-X',
    subtitle: 'Cross-Platform Kernel Integrity Monitor',
    description:
      'Built a cross-platform kernel-level rootkit detection system using Linux LKM and Windows KMDF drivers, detecting SCT/SSDT hooks, DKOM process hiding, and CR0/LSTAR manipulation. Feeds anomaly events through Ed25519 signing, AES-GCM encryption, and Solidity blockchain anchoring for tamper-proof forensic audit trails.',
    role: 'Kernel Engineer',
    year: '2025',
    tags: ['C', 'Linux LKM', 'Windows KMDF', 'kprobes', 'Netlink', 'Web3.py', 'Solidity'],
    image: '/assets/project_sentinel.png',
    cover: '/assets/covers/sentinel.svg',
    accent: '#7dffd0',
    disciplines: ['Kernel', 'Detection', 'Forensics'],
    link: 'https://github.com/dynamo-pentester',
  },
  {
    id: 'securesplit',
    title: 'SecureSplit',
    subtitle: 'Distributed Secure Media Storage',
    description:
      'Implemented a two-share visual cryptography system — original images are XOR-split into a local encrypted noise share and a key noise share uploaded to IPFS (Pinata), ensuring neither share alone reveals any information about the original.',
    role: 'Security Engineer',
    year: '2024',
    tags: ['Python', 'FastAPI', 'IPFS', 'NumPy', 'Cryptography'],
    image: '/assets/project_securesplit.png',
    cover: '/assets/covers/securesplit.svg',
    accent: '#e0b3ff',
    disciplines: ['Cryptography', 'Storage', 'Backend'],
    link: 'https://github.com/dynamo-pentester',
  },
  {
    id: 'matcare',
    title: 'MatCare',
    subtitle: 'Real-Time IoT Maternal Health Platform',
    description:
      'Built a dual-channel real-time health monitoring backend ingesting vitals from ESP32 sensors via Blynk APIs, with a Random Forest classifier for health-state prediction and Ethereum Sepolia blockchain registration of patient identities via smart contract.',
    role: 'Security Engineer',
    year: '2025',
    tags: ['Python', 'Flask', 'PostgreSQL', 'Scikit-learn', 'Web3.py', 'ESP32'],
    image: '/assets/project_matcare.png',
    cover: '/assets/covers/matcare.svg',
    accent: '#ffb199',
    disciplines: ['IoT', 'Applied ML', 'Backend'],
    link: 'https://github.com/dynamo-pentester',
  },
  {
    id: 'ale-logs',
    title: 'Log Analysis Platform',
    subtitle: 'Switch Log & Telemetry Investigation — ALE Internship',
    description:
      'Built a FastAPI-based platform at Alcatel-Lucent Enterprise to ingest, parse, and visualize AOS switch and HMON datasets — automated extraction from nested TAR archives, regex parsing of multi-file logs into structured JSON, and Plotly dashboards for CPU, memory, and fan telemetry across 10K+ log entries.',
    role: 'Software Development Intern',
    year: '2025',
    tags: ['Python', 'FastAPI', 'Regex', 'Plotly', 'JSON'],
    image: '/assets/covers/logs.svg',
    cover: '/assets/covers/logs.svg',
    accent: '#ffc46b',
    disciplines: ['Backend', 'Log Analysis', 'Dashboards'],
    link: 'https://github.com/dynamo-pentester',
  },
];

// Bento tiles for the "At a glance" section — every figure comes from the résumé.
export const highlights = [
  { id: 'thm', size: 'lg', kicker: 'TryHackMe', value: 'Top 3%', note: 'Global ranking across exploitation, privilege-escalation and post-exploitation labs.' },
  { id: 'skills', size: 'md', kicker: 'IndiaSkills Southern Regionals 2026', value: 'Medallion of Excellence', note: 'Cyber Security track.' },
  { id: 'ale', size: 'md', kicker: 'Alcatel-Lucent Enterprise', value: '10K+ log entries', note: 'Parsed and visualised by the log analysis platform built during the 2025 internship.' },
  { id: 'ctf', size: 'sm', kicker: 'Apoorv CTF 2026', value: '#44', note: 'Worldwide rank.' },
  { id: 'edu', size: 'sm', kicker: 'B.E. CSE — Ramco Institute of Technology', value: '2027', note: 'Graduating class.' },
];

// Published security research only. Reports still under coordinated disclosure are
// deliberately not described here — add them once the vendor has published.
export const research = [
  {
    id: 'getid3',
    target: 'getID3',
    title: 'Memory-exhaustion denial of service via crafted QuickTime atoms',
    severity: 'High · CVSS 7.5',
    status: 'Advisory published · CVE requested',
    date: 'Oct 2026',
    link: 'https://github.com/JamesHeinrich/getID3/security/advisories/GHSA-4pp3-6hmx-mfmg',
  },
  {
    id: 'ghost',
    target: 'Ghost',
    title: 'Disclosure of deleted and hidden comment content via Members Comments API filters',
    severity: 'Moderate · CVSS 5.3',
    status: 'Advisory published · CVE requested',
    date: 'Nov 2026',
    link: 'https://github.com/TryGhost/Ghost/security/advisories/GHSA-9c5c-w94h-xp32',
  },
  {
    id: 'typemill',
    target: 'Typemill',
    title: 'Bypass of the two-factor authentication brute-force protection',
    severity: 'Moderate · CVSS 6.8',
    status: 'Advisory published · co-reported · CVE requested',
    date: 'Jul 2026',
    link: 'https://github.com/typemill/typemill/security/advisories/GHSA-3vp6-4p8g-4hmx',
  },
  {
    id: 'langchain-postgres',
    target: 'langchain-postgres',
    title: 'Security advisory GHSA-39qm-gv6q-f43r',
    severity: 'See advisory',
    status: 'Advisory published · CVE requested',
    date: '2026',
    link: 'https://github.com/langchain-ai/langchain-postgres/security/advisories/GHSA-39qm-gv6q-f43r',
  },
  {
    id: 'tensorflow',
    target: 'TensorFlow',
    title: 'Heap out-of-bounds read in FractionalMaxPoolGrad',
    severity: 'Memory safety',
    status: 'Reported to Google · fix submitted',
    date: 'Oct 2026',
    link: 'https://github.com/tensorflow/tensorflow/pull/126911',
  },
];

export const testimonials = [
  {
    quote:
      'Rishikesh approaches security with a rare depth — equal parts adversary mindset and careful architect. His kernel-level work on Sentinel-X reflects a maturity far beyond his years.',
    name: 'Industry Mentor',
    title: 'Senior Security Engineer',
  },
  {
    quote:
      'His log analysis platform at ALE transformed how our TSEs investigate switch anomalies. Clean code, fast delivery, and zero hand-holding required.',
    name: 'Alcatel-Lucent Enterprise',
    title: 'Supervisor, ALE India',
  },
  {
    quote:
      'Top 5% globally on TryHackMe, Medallion of Excellence at IndiaSkills — the results speak for themselves. Calm, surgical, and relentlessly curious.',
    name: 'Competition Evaluator',
    title: 'IndiaSkills Cyber Security',
  },
];

export const stack = [
  'C/C++', 'Python', 'Linux LKM', 'kprobes', 'Netlink', 'FastAPI', 'Flask',
  'PostgreSQL', 'Docker', 'Burp Suite', 'Metasploit', 'Wireshark', 'Volatility',
  'Web3.py', 'Solidity', 'Scikit-learn',
];

// Skill tree — grouped exactly as on the résumé.
export const skillTree = [
  { branch: 'Kernel & Systems', skills: ['C/C++', 'Linux Kernel Modules', 'kprobes', 'Netlink', 'Syscall Internals', 'Socket Programming'] },
  { branch: 'Security', skills: ['VAPT', 'OWASP Top 10', 'Network Pentesting', 'Digital Forensics', 'Log & Traffic Analysis'] },
  { branch: 'Tools', skills: ['Burp Suite', 'Metasploit', 'Nmap', 'Wireshark', 'SQLmap', 'Volatility'] },
  { branch: 'Backend & Data', skills: ['Python', 'FastAPI', 'Flask', 'REST APIs', 'PostgreSQL', 'MongoDB'] },
];

export const navItems = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export const aboutImage = '/assets/me.jpg';

export const certificates = [
  {
    id: 1,
    title: 'Software Engineering Professional Certificate',
    issuer: 'HackerRank',
    date: '2026',
    credential: 'HR-SEPC',
    description: 'Comprehensive software engineering training covering data structures, algorithms, system design, and coding best practices.',
    link: 'https://www.hackerrank.com/certificates/77c2d129eacd',
  },
  {
    id: 2,
    title: 'Software Architecture of Large-Scale Systems',
    issuer: 'Udemy',
    date: '2026',
    credential: 'UD-ARCH',
    description: 'In-depth training on software architecture principles, design patterns, and high-performance systems.',
    link: 'https://www.udemy.com/certificate/UC-ebdf7767-b08b-4aa8-b0b4-2a143e0a6ad8/',
  },
  {
    id: 3,
    title: 'Certified AppSec Practitioner (CAP)',
    issuer: 'SecOps Group',
    date: '2024',
    credential: 'CAP',
    description: 'Application security testing, secure coding practices, and vulnerability assessment.',
    link: 'https://candidate.speedexam.net/certificate.aspx?SSTATE=am4131EniU8ntjp4bO5mXZH1/+rxs7xrfLxITGTYRqHXZ/VzR5YasgVCaeggulxjwSXkyfOicY3e13Ps1WvaTt/mCevXvSP8kDxJuM3AobU=',
  },
  {
    id: 4,
    title: 'Certified Network Security Practitioner (CNSP)',
    issuer: 'SecOps Group',
    date: '2024',
    credential: 'CNSP',
    description: 'Network security fundamentals, firewall configuration, and intrusion detection.',
    link: 'https://candidate.speedexam.net/certificate.aspx?SSTATE=am4131EniU8ntjp4bO5mXQX3geeNJBXAD4RoH1R0hde6hAOk/zNDD7VHhSuufcoUapcowcg11UCOXhHKNiayq+Diok23axsPinp8DIqbXIY=',
  },
  {
    id: 5,
    title: 'Ubuntu Linux Professional Certificate',
    issuer: 'Canonical',
    date: '2025',
    credential: 'CAN-ULPC',
    description: 'Comprehensive Linux training covering system administration, security hardening, and performance optimization.',
    link: 'https://www.linkedin.com/learning/certificates/45c1ec0e4f37a703f8517b0ec788ed1b87179a15384da2daf780aaaa1ca3cf68',
  },
  {
    id: 6,
    title: 'Microsoft Security Essentials (MSEP)',
    issuer: 'Microsoft',
    date: '2025',
    credential: 'MS-MSEP',
    description: 'Security training covering identity and access management, threat protection, and information protection.',
    link: 'https://www.linkedin.com/learning/certificates/a6c6d0917aad8b6dadc1614193f27abf09918abac95ecb4df0d2308ea7e881a0',
  },
  {
    id: 7,
    title: 'Certified Ethical Hacker (CEH) prep',
    issuer: 'LinkedIn Learning',
    date: '2025',
    credential: 'LI-PT',
    description: 'Ethical hacking methodologies, penetration testing techniques, and vulnerability assessment strategies.',
    link: 'https://www.linkedin.com/learning/certificates/9b5035c94b3299566b02124a751d0804382bf4c3e52f88caa31a46183ed1de55',
  },
  {
    id: 8,
    title: 'Penetration Testing Professional',
    issuer: 'Cybrary',
    date: '2025',
    credential: 'CYBR-PT',
    description: 'Professional penetration testing workflows, reporting, and remediation strategies.',
    link: 'https://www.linkedin.com/learning/certificates/738417bdb06577da09b3edbe9d90d07a86f173244970cd954f98b9dfd99433cc',
  },
  {
    id: 9,
    title: 'Pre-Security Pathway',
    issuer: 'TryHackMe',
    date: '2025',
    credential: 'THM-PS',
    description: 'Training covering fundamental security concepts, network basics, and hands-on labs.',
    link: 'https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-JTL8EBLS6U.pdf',
  },
];

export const ctfEvents = [
  {
    id: 1,
    title: 'TryHackMe Platform',
    type: 'Training Platform',
    date: 'Ongoing',
    placement: 'Top 3% Global Rank',
    description: 'Ranked in the top 3% globally, completing advanced labs in exploitation, privilege escalation, and post-exploitation.',
  },
  {
    id: 2,
    title: 'IndiaSkills Cyber Security',
    type: 'National Skill Competition',
    date: '2024',
    placement: 'State Winner',
    description: 'Won Tamil Nadu state championship, demonstrating expertise in offensive security, system exploitation, and incident response.',
  },
  {
    id: 3,
    title: 'Ignis\'23 Bug Bounty',
    type: 'Bug Bounty',
    date: '2023',
    placement: '1st Place',
    description: 'Discovered and exploited critical vulnerabilities including authentication bypass and application logic flaws.',
  },
  {
    id: 4,
    title: 'Operation Trinetra',
    type: 'National Hackathon',
    date: '2024',
    placement: 'Finalist',
    description: 'Developed initial MILBASTER prototype for kernel threat detection and tamper-proof forensic evidence generation.',
  },
  {
    id: 5,
    title: 'PEC Hacks 2.0',
    type: 'Security Hackathon',
    date: '2024',
    placement: 'Finalist',
    description: 'Built security tooling under time-constrained environment, focusing on system threat detection and analysis.',
  },
  {
    id: 6,
    title: 'Pentathon 2025',
    type: 'National CTF',
    date: '2025',
    placement: 'Top 75 Team',
    description: 'Solved infrastructure-level exploitation, forensics, and incident response challenges in national CTF.',
  },
  {
    id: 7,
    title: 'KJSCE CTF',
    type: 'Capture The Flag',
    date: '2024',
    placement: 'Finalist',
    description: 'Solved challenges across web exploitation, reverse engineering, cryptography, and digital forensics.',
  },
  {
    id: 8,
    title: 'VNR Cyber Warzone',
    type: 'Capture The Flag',
    date: '2024',
    placement: 'Semi-Finalist',
    description: 'Competed in multi-stage offensive security competition involving binary exploitation and forensic analysis.',
  },
  {
    id: 9,
    title: 'BlockHack 2024',
    type: 'Hackathon',
    date: '2024',
    placement: 'Participant',
    description: 'Explored smart contract security, blockchain threat models, and decentralized application vulnerabilities.',
  },
];
