import { motion } from 'framer-motion';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const experiences = [

  {
    id: 1,
    role: 'Chief Security Officer',
    company: 'Folonite',
    location: 'India',
    period: '2023 – 2025',
    description:
      'Led security architecture, vulnerability assessment, and secure system design initiatives across internal platforms and infrastructure.',
    achievements: [
      'Conducted vulnerability assessments and penetration testing on internal systems',
      'Designed secure development and deployment practices',
      'Advised engineering teams on secure architecture and threat mitigation',
    ],
  },

  {
    id: 2,
    role: 'Software Development Intern',
    company: 'Alcatel-Lucent Enterprise (ALE India Pvt. Ltd.)',
    location: 'Bangalore, India',
    period: 'July 2025 – Aug 2025',
    description:
      'Developed a FastAPI-based backend platform to ingest, parse, and analyze multi-GB AOS switch log and HMON datasets for production diagnostics.',
    achievements: [
      'Built scalable backend pipelines for structured log analysis',
      'Improved debugging efficiency for Technical Support Engineers',
      'Enabled faster root cause analysis across enterprise switch systems',
    ],
  },

  {
    id: 3,
    role: 'Kernel Security Research Member',
    company: 'Rootkit Researchers (Rootrix)',
    location: 'Global',
    period: '2025 – Present',
    description:
      'Conducting research on Linux kernel integrity monitoring, syscall analysis, and rootkit detection techniques.',
    achievements: [
      'Contributed to forensic pipeline integrating kernel detection with secure evidence storage',
      'Researched syscall integrity monitoring and kernel attack detection',
      'Developed cryptographic forensic evidence handling workflows',
    ],
  },

  {
    id: 4,
    role: 'Community Lead',
    company: 'RIT Hackers Community',
    location: 'Tamil Nadu, India',
    period: '2024 – Present',
    description:
      'Leading cybersecurity learning initiatives, mentoring members, and organizing hands-on security workshops.',
    achievements: [
      'Mentored students in penetration testing and cybersecurity fundamentals',
      'Organized CTF training sessions and technical workshops',
      'Built active cybersecurity learning community',
    ],
  },

  {
    id: 5,
    role: 'Membership Chair',
    company: 'ACM Student Chapter, RIT',
    location: 'Tamil Nadu, India',
    period: '2024 – Present',
    description:
      'Managed member engagement and coordinated technical events for student computing community.',
    achievements: [
      'Organized technical workshops and student engagement programs',
      'Helped grow active participation in computing initiatives',
    ],
  },

  {
    id: 6,
    role: 'Executive Secretary',
    company: 'ARC, Ramco Institute of Technology',
    location: 'Tamil Nadu, India',
    period: '2024 – Present',
    description:
      'Coordinated technical events, documentation, and organizational operations.',
    achievements: [
      'Organized institutional technical programs and competitions',
      'Managed event logistics and coordination',
    ],
  },

 {
  id: 7,
  role: 'B.E. Computer Science Engineering',
  company: 'Ramco Institute of Technology',
  location: 'Tamil Nadu, India',
  period: 'Oct 2023 – May 2027',
  description:
    'Undergraduate student in Computer Science Engineering.',
  achievements: [
    'CGPA: 7.91',
    'IndiaSkills State Winner – Cyber Security',
    'Top 5% on TryHackMe platform',
    'Pentathon 2025 – Top 75 Team (NCIIPC)',
  ],
},


];


export default function ExperienceSection() {
  return (
    <section id="experience" className="relative py-32 lg:py-48 overflow-hidden bg-card/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-glow-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-glow-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container">
        <ScrollReveal className="text-center mb-16 lg:mb-24">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">Career Journey</p>
          <h2 className="section-heading">
            Professional <span className="gradient-text">Experience</span>
          </h2>
          <p className="section-subheading mx-auto mt-6">
            A timeline of growth, learning, and impactful contributions
          </p>
        </ScrollReveal>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent md:-translate-x-1/2" />

          {experiences.map((exp, index) => (
            <ScrollReveal key={exp.id} delay={index * 0.15} direction={index % 2 === 0 ? 'left' : 'right'}>
              <div className={`relative flex items-start gap-8 mb-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <motion.div
                  className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background md:-translate-x-1/2 z-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: 'spring' }}
                />

                <div className={`ml-8 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                  <motion.div className="p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 group" whileHover={{ y: -5 }}>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-glow-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">{exp.role}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" />{exp.company}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />{exp.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" />{exp.period}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
