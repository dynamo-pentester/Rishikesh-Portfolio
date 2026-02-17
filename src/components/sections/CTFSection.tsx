import { motion } from 'framer-motion';
import { Shield, Trophy, Flag, Bug, Target } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TiltCard from '@/components/ui/TiltCard';
const ctfEvents = [
{
  id: 1,
  title: 'TryHackMe Platform',
  type: 'Cybersecurity Training Platform',
  date: 'Ongoing',
  placement: 'Top 5% Global Rank',
  description:
    'Ranked in the top 5% globally, completing advanced labs in exploitation, privilege escalation, and post-exploitation.',
  icon: Flag,
},

{
  id: 2,
  title: 'IndiaSkills Cyber Security',
  type: 'National Skill Competition',
  date: '2024',
  placement: 'State Winner',
  description:
    'Won Tamil Nadu state championship, demonstrating expertise in offensive security, system exploitation, and incident response.',
  icon: Trophy,
},

{
  id: 3,
  title: 'Ignis\'23 Bug Bounty',
  type: 'Bug Bounty Competition',
  date: '2023',
  placement: '1st Place',
  description:
    'Discovered and exploited critical vulnerabilities including authentication bypass and application logic flaws.',
  icon: Bug,
},

{
  id: 4,
  title: 'Operation Trinetra',
  type: 'National Security Hackathon',
  date: '2024',
  placement: 'Finalist',
  description:
    'Developed initial MILBASTER prototype for kernel threat detection and tamper-proof forensic evidence generation.',
  icon: Shield,
},

{
  id: 5,
  title: 'PEC Hacks 2.0',
  type: 'Security Hackathon',
  date: '2024',
  placement: 'Finalist',
  description:
    'Built security tooling under time-constrained environment, focusing on system threat detection and analysis.',
  icon: Shield,
},

{
  id: 6,
  title: 'Pentathon 2025',
  type: 'National CTF Competition',
  date: '2025',
  placement: 'Top 75 Team',
  description:
    'Solved infrastructure-level exploitation, forensics, and incident response challenges in national CTF.',
  icon: Flag,
},

{
  id: 7,
  title: 'KJSCE CTF',
  type: 'Capture The Flag',
  date: '2024',
  placement: 'Finalist',
  description:
    'Solved challenges across web exploitation, reverse engineering, cryptography, and digital forensics.',
  icon: Flag,
},

{
  id: 8,
  title: 'VNR Cyber Warzone',
  type: 'Capture The Flag',
  date: '2024',
  placement: 'Semi-Finalist',
  description:
    'Competed in multi-stage offensive security competition involving binary exploitation and forensic analysis.',
  icon: Shield,
},

{
  id: 9,
  title: 'BlockHack 2024',
  type: 'Hackathon By Kerala Blockchain Academy',
  date: '2024',
  placement: 'Participant',
  description:
    'Explored smart contract security, blockchain threat models, and decentralized application vulnerabilities.',
  icon: Target,
},
];


export default function CTFSection() {
  return (
    <section id="ctf" className="relative py-32 lg:py-48 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-glow-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-glow-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container">
        <ScrollReveal className="text-center mb-16 lg:mb-24">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">
            Competitions & Events
          </p>
          <h2 className="section-heading">
            CTF & <span className="gradient-text">Security Events</span>
          </h2>
          <p className="section-subheading mx-auto mt-6">
            Hackathons, CTFs, bug bounties, and security competitions
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ctfEvents.map((event, index) => (
            <ScrollReveal key={event.id} delay={index * 0.06}>
              <TiltCard
                className="h-full"
                glowColor={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <event.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{event.date}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-[10px] uppercase tracking-wider">
                        {event.type}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-mono text-xs text-primary font-medium">
                      {event.placement}
                    </span>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
