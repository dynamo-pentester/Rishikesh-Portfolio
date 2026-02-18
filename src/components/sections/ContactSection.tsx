import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone, Linkedin, Github } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import MagneticButton from '@/components/ui/MagneticButton';
import { BranchRight, RedGlowOrb } from '@/components/decorations/SectionDecorations';

export default function ContactSection() {

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [focused, setFocused] = useState<string | null>(null);

  // ✅ UPDATED: Opens Gmail compose with prefilled content
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const to = "rishikesh091105@gmail.com";

    const subject = encodeURIComponent(
      `Portfolio Contact from ${formState.name}`
    );

    const body = encodeURIComponent(
`Name: ${formState.name}
Email: ${formState.email}

Message:
${formState.message}`
    );

    const gmailURL =
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;

    window.open(gmailURL, "_blank");
  };

  const socials = [
    {
      icon: Github,
      href: 'https://github.com/dynamo-pentester',
      label: 'GitHub'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/in/rishikesh-r-196b5a290',
      label: 'LinkedIn'
    },
  ];

  return (
    <section
      id="contact"
      className="relative py-32 lg:py-48 overflow-hidden bg-card/30"
    >

      <BranchRight className="-top-4 right-0" />
      <RedGlowOrb className="bottom-[25%] -right-20" />

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-glow-primary/10 via-glow-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="section-container">

        {/* heading */}
        <ScrollReveal className="text-center mb-16 lg:mb-24">

          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">
            Get In Touch
          </p>

          <h2 className="section-heading">
            Let's Build Something{' '}
            <span className="gradient-text">
              Amazing
            </span>
          </h2>

          <p className="section-subheading mx-auto mt-6">
            Have a project in mind or want to collaborate? Let's connect.
          </p>

        </ScrollReveal>


        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">

          {/* left side */}
          <ScrollReveal direction="left">

            <div className="space-y-8">

              {/* contact info */}
              <div className="space-y-6">

                {/* email */}
                <div className="flex items-center gap-4 group">

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Email
                    </p>

                    <a
                      href="mailto:rishikesh091105@gmail.com"
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      rishikesh091105@gmail.com
                    </a>

                  </div>

                </div>


                {/* phone */}
                <div className="flex items-center gap-4 group">

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Phone
                    </p>

                    <p className="text-foreground font-medium">
                      +91-8870564369
                    </p>

                  </div>

                </div>


                {/* location */}
                <div className="flex items-center gap-4 group">

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Location
                    </p>

                    <p className="text-foreground font-medium">
                      Tamil Nadu, India
                    </p>

                  </div>

                </div>

              </div>


              {/* socials */}
              <div className="pt-8 border-t border-border">

                <p className="text-sm text-muted-foreground mb-4">
                  Find me online
                </p>

                <div className="flex gap-4">

                  {socials.map((social) => (

                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 transition-all duration-300"
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >

                      <social.icon className="w-5 h-5" />

                    </motion.a>

                  ))}

                </div>

              </div>

            </div>

          </ScrollReveal>


          {/* right side form */}
          <ScrollReveal direction="right">

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* name + email */}
              {(['name', 'email'] as const).map((field) => (

                <div key={field} className="relative">

                  <motion.label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      focused === field || formState[field]
                        ? 'top-2 text-xs text-primary'
                        : 'top-4 text-muted-foreground'
                    }`}
                  >
                    Your {field.charAt(0).toUpperCase() + field.slice(1)}
                  </motion.label>

                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={formState[field]}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        [field]: e.target.value
                      })
                    }
                    onFocus={() => setFocused(field)}
                    onBlur={() => setFocused(null)}
                    className="w-full pt-6 pb-3 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300"
                  />

                </div>

              ))}


              {/* message */}
              <div className="relative">

                <motion.label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focused === 'message' || formState.message
                      ? 'top-2 text-xs text-primary'
                      : 'top-4 text-muted-foreground'
                  }`}
                >
                  Your Message
                </motion.label>

                <textarea
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      message: e.target.value
                    })
                  }
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  rows={5}
                  className="w-full pt-6 pb-3 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 resize-none"
                />

              </div>


              {/* submit button */}
              <button
                type="submit"
                className="w-full"
              >
                <MagneticButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                >

                  Send Message

                </MagneticButton>
              </button>


            </form>

          </ScrollReveal>

        </div>

      </div>

    </section>
  );
}