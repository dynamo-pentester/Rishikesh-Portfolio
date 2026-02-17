import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ProfileMode = 'backend' | 'security';

interface SkillItem {
  name: string;
  level: number;
}

interface SkillCategory {
  category: string;
  items: SkillItem[];
}

interface ProfileData {
  heroTitle: string;
  heroSubtitle: string;
  roles: string[];
  about: string[];
  techTags: string[];
  skills: SkillCategory[];
}

interface ProfileContextType {
  mode: ProfileMode;
  toggleMode: () => void;
  profile: ProfileData;
}

const profileData: Record<ProfileMode, ProfileData> = {
  backend: {
    heroTitle: 'Rishikesh R',
    heroSubtitle: 'Building systems that scale',
    roles: [
      'Backend Engineer',
      'Systems Developer',
      'Infrastructure Builder',
      'Full-Stack Developer',
    ],
    about: [
      "I design and build backend systems, infrastructure tooling, and performance-critical applications. My focus includes distributed systems, log analysis pipelines, kernel-level integrations, and scalable architectures.",
      "With hands-on experience at Alcatel-Lucent Enterprise building production tools for log analysis and diagnostics, I take ownership of features end to end — focusing on scalable, reliable systems with security and correctness baked into the design.",
    ],
    techTags: ['Python', 'FastAPI', 'C++', 'PostgreSQL', 'Docker', 'Linux'],
    skills: [
      {
        category: 'Backend',
        items: [
          { name: 'Python', level: 92 },
          { name: 'FastAPI', level: 90 },
          { name: 'Node.js', level: 85 },
          { name: 'PostgreSQL', level: 82 },
        ],
      },
      {
        category: 'Systems',
        items: [
          { name: 'Linux', level: 95 },
          { name: 'C/C++', level: 88 },
          { name: 'Socket Programming', level: 85 },
          { name: 'Log Analysis', level: 90 },
        ],
      },
      {
        category: 'DevOps',
        items: [
          { name: 'Docker', level: 85 },
          { name: 'AWS', level: 75 },
          { name: 'CI/CD', level: 80 },
          { name: 'Git/GitHub', level: 90 },
        ],
      },
      {
        category: 'Languages',
        items: [
          { name: 'Java', level: 80 },
          { name: 'Rust', level: 65 },
          { name: 'SQL', level: 85 },
          { name: 'Bash', level: 82 },
        ],
      },
    ],
  },
  security: {
    heroTitle: 'Rishikesh R',
    heroSubtitle: 'Entering the red zone',
    roles: [
      'Purple Team Engineer',
      'Penetration Tester',
      'Exploit Researcher',
      'Red Team Operator',
    ],
    about: [
      "I specialize in offensive security, kernel integrity monitoring, and protocol-level analysis. My work includes rootkit detection, syscall monitoring, exploit research, and building tools that bridge offensive and defensive security.",
      "With hands-on VAPT experience, bug bounty earnings on HackerOne, and IndiaSkills State Winner in Cyber Security, I focus on practical testing, clear reporting, and understanding real-world attack paths.",
    ],
    techTags: ['Burp Suite', 'Metasploit', 'Wireshark', 'Nmap', 'Kali Linux', 'Ghidra'],
    skills: [
      {
        category: 'Offensive Security',
        items: [
          { name: 'Penetration Testing', level: 90 },
          { name: 'Privilege Escalation', level: 85 },
          { name: 'Exploit Analysis', level: 80 },
          { name: 'OWASP Top 10', level: 92 },
        ],
      },
      {
        category: 'Kernel & Systems',
        items: [
          { name: 'Kernel Programming', level: 88 },
          { name: 'Syscall Analysis', level: 85 },
          { name: 'Rootkit Detection', level: 90 },
          { name: 'Digital Forensics', level: 80 },
        ],
      },
      {
        category: 'Tools',
        items: [
          { name: 'Burp Suite', level: 88 },
          { name: 'Nmap', level: 90 },
          { name: 'Wireshark', level: 85 },
          { name: 'Metasploit', level: 82 },
        ],
      },
      {
        category: 'Networking',
        items: [
          { name: 'Network Security', level: 88 },
          { name: 'Packet Analysis', level: 85 },
          { name: 'Aircrack-ng', level: 75 },
          { name: 'SQLmap', level: 80 },
        ],
      },
    ],
  },
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ProfileMode>('backend');

  const toggleMode = () => {
    setMode((prev) => (prev === 'backend' ? 'security' : 'backend'));
  };

useEffect(() => {
  const root = document.documentElement;

  if (mode === 'security') {
    root.setAttribute('data-theme', 'security');
    root.classList.add('security');
  } else {
    root.setAttribute('data-theme', 'default');
    root.classList.remove('security');
  }
}, [mode]);


  const profile = profileData[mode];

  return (
    <ProfileContext.Provider value={{ mode, toggleMode, profile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
