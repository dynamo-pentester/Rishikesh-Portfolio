import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, X } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TiltCard from '@/components/ui/TiltCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { BranchRight, RedGlowOrb } from '@/components/decorations/SectionDecorations';

const projects = [
  {
    id: 1,
    title: 'ALE Log Analyzer',
    category: 'Production Backend • Systems Engineering',
    description:
      'FastAPI-based internal platform for parsing, analyzing, and visualizing multi-GB enterprise switch log archives.',
    tech: ['Python', 'FastAPI', 'Log Parsing', 'Data Pipelines', 'Linux', 'Plotly'],
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    color: 'primary' as const,
    details:
      'Built at Alcatel-Lucent Enterprise to support Technical Support Engineers in diagnosing production switch failures. Designed a FastAPI backend to ingest multi-GB compressed log archives, extract structured datasets, and generate filtered and comparative analysis. Implemented automated parsing pipelines and interactive visualizations, significantly improving debugging speed and diagnostic accuracy.',
    github: 'https://github.com/dynamo-pentester/WDA-TOOL.git',
    live: '#',
  },
  {
    id: 2,
    title: 'MILBASTER',
  category: 'Kernel Security • Forensic Infrastructure',
  description:
    'Forensic evidence pipeline converting kernel rootkit detections into cryptographically verifiable blockchain records.',
  tech: [
    'C',
    'Linux Kernel',
    'Netlink',
    'Python',
    'Ed25519',
    'AES-GCM',
    'SQLite',
    'Merkle Trees',
    'Blockchain',
  ],
  image:
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
  color: 'secondary' as const,
  details:
    'Built a kernel-to-blockchain forensic pipeline integrating ksentinel syscall integrity monitor with a secure evidence handling daemon. Used Netlink for kernel-userspace communication, cryptographic signing using Ed25519, authenticated encryption using AES-GCM, and Merkle Tree batching with blockchain anchoring to create tamper-proof forensic evidence. This is a Research Prototype and not publicly released due to security implications.',
  github: '#',
  live: '#',
},
  {
    id: 3,
    title: 'MatCare',
    category: 'Backend Engineering • IoT Systems',
    description:
      'Backend platform for real-time IoT health monitoring and classification.',
    tech: [
      'Python',
      'Flask',
      'PostgreSQL',
      'MQTT',
      'Scikit-learn',
      'ESP32',
    ],
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    color: 'primary' as const,
    details:
      'Built backend infrastructure to ingest and process real-time IoT health telemetry from sensor devices. Implemented database pipelines, REST APIs, and classification models for health status prediction, enabling continuous remote monitoring.',
    github: 'https://github.com/dynamo-pentester/Matcare.git',
    live: '#',
  },

  {
    id: 4,
    title: 'SecureSplit',
    category: 'Security Engineering • Distributed Storage',
    description:
      'IPFS-based decentralized storage system with cryptographic data partitioning.',
    tech: ['Python', 'FastAPI', 'IPFS', 'Pinata', 'Encryption'],
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    color: 'accent' as const,
    details:
      'Designed a secure distributed storage system using IPFS with cryptographic partitioning for confidentiality and fault tolerance. Implemented encryption workflows separating keys from encrypted data and leveraging IPFS for decentralized storage and retrieval.',
    github: 'https://github.com/dynamo-pentester/SecureSpli.git',
    live: '#',
  },
  {
  id: 5,
  title: 'Credit Card Fraud Detection',
  category: 'Machine Learning • Security Analytics',
  description:
    'Hybrid deep learning fraud detection system combining supervised and anomaly detection models.',
  tech: [
    'Python',
    'TensorFlow',
    'MLP',
    'Autoencoder',
    'SMOTE',
    'SHAP',
    'Scikit-learn',
  ],
  image:
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
  color: 'accent' as const,
  details:
    'Built a hybrid fraud detection system combining supervised Multi-Layer Perceptron and unsupervised Autoencoder models. Implemented anomaly detection workflows, imbalance handling using SMOTE, and performance analysis using ROC and precision-recall metrics.',
  github:
    'https://github.com/dynamo-pentester/Credit_card_fraud.git',
  live: '#',
},
{
  id: 6,
  title: 'MERN Blog Platform',
  category: 'Full Stack • Backend Engineering',
  description:
  'Full-stack MERN application with JWT authentication, RESTful APIs, and MongoDB-based persistent storage for secure and scalable content management.',


  tech: [
    'MongoDB',
    'Express',
    'React',
    'Node.js',
    'JWT',
  ],
  image:
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  color: 'primary' as const,
  details:
    'Developed a full-stack blog platform with secure authentication, RESTful backend APIs, and persistent database storage. Implemented user sessions, post management, and scalable backend architecture.',
  github:
    'https://github.com/dynamo-pentester/React-blog.git',
  live: '#',
},

];

function ProjectModal({ project, onClose }: { project: typeof projects[0]; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-background/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-card rounded-3xl border border-border shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        <div className="p-8 md:p-12 space-y-6">
          <div>
            <p className="font-mono text-sm text-primary mb-2">{project.category}</p>
            <h3 className="text-3xl md:text-4xl font-display font-bold">{project.title}</h3>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">{project.details}</p>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-mono text-xs">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            {project.github !== '#' && (
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <MagneticButton variant="outline" size="md">
                  <Github className="w-4 h-4 mr-2" />
                  Source Code
                </MagneticButton>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  return (
    <section id="projects" className="relative py-32 lg:py-48 overflow-hidden">
      <BranchRight className="-top-8 right-0" />
      <RedGlowOrb className="top-[40%] -right-24" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-glow-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-glow-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container">
        <ScrollReveal className="text-center mb-16 lg:mb-24">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">Featured Work</p>
          <h2 className="section-heading">
            Selected <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subheading mx-auto mt-6">
            Systems built with security, performance, and correctness in mind
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ScrollReveal key={project.id} delay={index * 0.1} direction={index % 2 === 0 ? 'left' : 'right'}>
              <TiltCard className="cursor-pointer group">
                <div onClick={() => setSelectedProject(project)}>
                 <div className="relative h-48 md:h-56 overflow-hidden rounded-t-2xl">

  <img
    src={project.image}
    alt={project.title}
    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  />

  {/* Uniform darkening */}
  <div className="absolute inset-0 bg-black/50" />

  {/* Professional gradient */}
  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

</div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="font-mono text-xs text-primary mb-1">{project.category}</p>
                      <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono text-xs">{tech}</span>
                      ))}
                      {project.tech.length > 3 && (
                        <span className="px-2 py-1 rounded bg-secondary text-muted-foreground font-mono text-xs">+{project.tech.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </section>
  );
}
