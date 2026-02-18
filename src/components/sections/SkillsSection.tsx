import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useProfile } from '@/contexts/ProfileContext';
import { BranchLeft, RedGlowOrb } from '@/components/decorations/SectionDecorations';
function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs font-mono text-muted-foreground">{level}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-glow-primary to-glow-secondary"
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function OrbitSkill({ skill, index, total }: { skill: string; index: number; total: number }) {
  const angle = (index / total) * 360;
  const radius = 120;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <motion.div
      className="absolute px-3 py-1.5 rounded-full bg-card border border-border text-xs font-mono text-foreground whitespace-nowrap hover:border-primary hover:text-primary transition-colors duration-300"
      style={{ left: `calc(50% + ${x}px - 40px)`, top: `calc(50% + ${y}px - 12px)` }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 * index, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
    >
      {skill}
    </motion.div>
  );
}

export default function SkillsSection() {
  const { profile } = useProfile();
  const skills = profile.skills;

  const orbitSkills = profile.techTags;

  return (
    <section id="skills" className="relative py-32 lg:py-48 overflow-hidden bg-card/30">
      {/* Decorative scenery */}
      <BranchLeft className="top-10 -left-10" />
      <RedGlowOrb className="bottom-[15%] -left-20" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="section-container">
        <ScrollReveal className="text-center mb-16 lg:mb-24">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">
            Technical Expertise
          </p>
          <h2 className="section-heading">
            Skills & <span className="gradient-text">Technologies</span>
          </h2>
          <p className="section-subheading mx-auto mt-6">
            A comprehensive toolkit refined through years of building production systems
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Skill bars */}
          <div className="space-y-10">
            {skills.map((category, catIndex) => (
              <ScrollReveal key={category.category} delay={catIndex * 0.1}>
                <div className="space-y-6">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {category.category}
                  </h3>
                  <div className="space-y-4 pl-5">
                    {category.items.map((skill, index) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        delay={catIndex * 0.1 + index * 0.05}
                      />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Right: Orbital visualization */}
          <ScrollReveal delay={0.3} direction="right">
            <div className="relative h-[400px] hidden lg:block">
              {/* Center core */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-glow-primary/20 to-glow-secondary/20 border border-primary/30 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <span className="font-display font-bold text-lg gradient-text">Core</span>
              </motion.div>

              {/* Orbit rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-border/30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-border/20" />

              {/* Orbiting skills */}
              {orbitSkills.map((skill, index) => (
                <OrbitSkill key={skill} skill={skill} index={index} total={orbitSkills.length} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
