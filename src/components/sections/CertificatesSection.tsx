import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, X } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TiltCard from '@/components/ui/TiltCard';
import { BranchRight, RedGlowOrb } from '@/components/decorations/SectionDecorations';
const certificates = [
  {
    id: 1,
    title: 'Software Engineering Professional Certificate',
    issuer: 'HackerRank',
    date: '2026',
    credential: 'HR-SEPC',
    description: 'Comprehensive software engineering training covering data structures, algorithms, system design, and coding best practices with a focus on backend development and performance optimization.',
    link: 'https://www.hackerrank.com/certificates/77c2d129eacd',
  },
  {
    id: 2,
    title: 'Software Architecture & Technology of Large-Scale Systems Certificate',
    issuer: 'Udemy',
    date: '2026',
    credential: 'UD-ARCH',
    description: 'In-depth training on software architecture principles, design patterns, and technologies for building scalable, maintainable, and high-performance large-scale systems.',
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
    description: 'Comprehensive Linux training covering system administration, security hardening, and performance optimization on Ubuntu systems.',
    link: 'https://www.linkedin.com/learning/certificates/45c1ec0e4f37a703f8517b0ec788ed1b87179a15384da2daf780aaaa1ca3cf68',
  },
  {
    id: 6,
    title: 'Microsoft Security Essentials Professional Certificate (MSEP)',
    issuer: 'Microsoft',
    date: '2025',
    credential: 'MS-MSEP',
    description: 'Comprehensive security training covering identity and access management, threat protection, information protection, and security management using Microsoft technologies.',
    link: 'https://www.linkedin.com/learning/certificates/a6c6d0917aad8b6dadc1614193f27abf09918abac95ecb4df0d2308ea7e881a0',
  },
  {
    id: 7,
    title: 'Certified Ethical Hacker (CEH)',
    issuer: 'LinkedIn Learning',
    date: '2025',
    credential: 'LI-PT',
    description: 'Ethical hacking methodologies, penetration testing techniques, and vulnerability assessment strategies.',
    link: 'https://www.linkedin.com/learning/certificates/9b5035c94b3299566b02124a751d0804382bf4c3e52f88caa31a46183ed1de55',
  },
  {
    id: 8,
    title: 'Penetration Testing Professional Certificate',
    issuer: 'Cybrary',
    date: '2025',
    credential: 'CYBR-PT',
    description: 'Professional penetration testing workflows, reporting, and remediation strategies.',
    link: 'https://www.linkedin.com/learning/certificates/738417bdb06577da09b3edbe9d90d07a86f173244970cd954f98b9dfd99433cc',
  },
  {
    id: 9,
    title: 'Pre-Security pathway Certificate',
    issuer: 'TryHackMe',
    date: '2025',
    credential: 'THM-PS',
    description: 'Pre-Security pathway training covering fundamental security concepts, network basics, and hands-on labs.',
    link: 'https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-JTL8EBLS6U.pdf',
  },
];

function CertificateModal({ cert, onClose }: { cert: typeof certificates[0]; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 space-y-4">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 w-fit">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <div>
            <p className="font-mono text-sm text-primary mb-1">{cert.issuer}</p>
            <h3 className="text-2xl font-display font-bold">{cert.title}</h3>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Issued: {cert.date}</span>
            <span>•</span>
            <span>ID: {cert.credential}</span>
          </div>
          <p className="text-muted-foreground">{cert.description}</p>
          <a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            Verify Certificate <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CertificatesSection() {
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);

  return (
    <section id="certificates" className="relative py-32 lg:py-48 overflow-hidden">
      <BranchRight className="-top-4 right-0" />
      <RedGlowOrb className="bottom-[20%] -right-16" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-glow-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-glow-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container">
        <ScrollReveal className="text-center mb-16 lg:mb-24">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">Credentials</p>
          <h2 className="section-heading">
            Certificates & <span className="gradient-text">Achievements</span>
          </h2>
          <p className="section-subheading mx-auto mt-6">
            Industry-recognized certifications validating expertise and continuous learning
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <ScrollReveal key={cert.id} delay={index * 0.08}>
              <TiltCard className="cursor-pointer h-full" glowColor={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'}>
                <div className="p-6 h-full flex flex-col" onClick={() => setSelectedCert(cert)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{cert.date}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-mono text-xs text-primary">{cert.issuer}</p>
                    <h3 className="font-display font-semibold text-lg">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{cert.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="font-mono text-xs text-muted-foreground">ID: {cert.credential}</span>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCert && <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />}
      </AnimatePresence>
    </section>
  );
}
