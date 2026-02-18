import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ParallaxSection from '@/components/ui/ParallaxSection';
import { useProfile } from '@/contexts/ProfileContext';
import { BranchRight, RedGlowOrb, SectionDivider } from '@/components/decorations/SectionDecorations';

export default function AboutSection() {
  const { profile, mode } = useProfile();

const stats =
  mode === 'backend'
    ? [
        { value: '3+', label: 'Years Experience' },
        { value: '10+', label: 'Systems & Tools Built' },
        { value: 'FastAPI', label: 'Backend System Built' },
        { value: '2+ GB', label: 'Log Archives Analyzed' },
      ]
    : [
        { value: 'Top 5%', label: 'TryHackMe Ranking' },
        { value: '10+', label: 'Security Assessments' },
        { value: 'IndiaSkills', label: 'State Winner' },
        { value: '0x01', label: 'Rootkit Researchers Member' },
      ];

  return (
    <section id="about" className="relative py-32 lg:py-48 overflow-hidden">
      {/* Decorative scenery */}
      <BranchRight className="top-0 right-0" />
      <RedGlowOrb className="top-[20%] -right-20" />

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-glow-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-glow-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <ScrollReveal>
              <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">
                About Me
              </p>
              <h2 className="section-heading">
                Engineering systems that{' '}
                <span className="gradient-text">matter</span>
              </h2>
            </ScrollReveal>

            {profile.about.map((paragraph, index) => (
              <ScrollReveal key={index} delay={0.1 * (index + 1)}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              </ScrollReveal>
            ))}

            <ScrollReveal delay={0.3}>
              <div className="flex flex-wrap gap-3 pt-4">
                {profile.techTags.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-mono text-sm border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Stats */}
          <ParallaxSection speed={0.3}>
            <div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  gap-5
  sm:gap-6
  items-stretch
">

              {stats.map((stat, index) => (
                <ScrollReveal key={stat.label} delay={0.1 * index} direction="up">
                  <motion.div
  className="
    relative
    h-full
    min-h-[160px]
    p-6 sm:p-8
    rounded-2xl
    bg-card
    border border-border
    group
    hover:border-primary/30
    transition-all duration-500
    flex flex-col justify-center
  "
  whileHover={{ scale: 1.02 }}
>
  {/* glow */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-glow-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

  <div className="relative z-10 flex flex-col justify-center h-full">

    {/* VALUE */}
    <motion.span
      className="
        block
        text-3xl sm:text-4xl md:text-5xl
        font-display font-bold
        gradient-text
        mb-2
        leading-tight
        whitespace-nowrap
      "
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
    >
      {stat.value}
    </motion.span>

    {/* LABEL */}
    <span
      className="
        text-sm
        text-muted-foreground
        font-medium
        leading-relaxed
        whitespace-normal
        break-normal
      "
    >
      {stat.label}
    </span>

  </div>
</motion.div>

                </ScrollReveal>
              ))}
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>
  );
}
