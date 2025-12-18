import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, Calendar, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';

const education = [
  {
    degree: 'M.Sc. International Master in Bioacoustics (MoBi)',
    institution: 'Jean Monnet University',
    location: 'Saint-Etienne, France',
    period: '2023 - 2024',
  },
  {
    degree: 'M.Sc. Ecophysiology, Ecology, and Ethology (EEE)',
    institution: 'Strasbourg University',
    location: 'Strasbourg, France',
    period: '2021 - 2024',
    note: 'Double Degree with AISD M.Sc.',
  },
  {
    degree: 'M.Sc. Interdisciplinary Approach in Data Science (AISD)',
    institution: 'Strasbourg University',
    location: 'Strasbourg, France',
    period: '2021 - 2024',
    note: 'Double Degree with EEE M.Sc.',
  },
  {
    degree: 'University Degree in Bioacoustics',
    institution: 'Jean Monnet University',
    location: 'Saint-Etienne, France',
    period: '2023',
  },
  {
    degree: 'B.Sc. in Life Sciences, specializing in Ecology',
    institution: 'Savoie Mont-Blanc University',
    location: 'Chambery, France',
    period: '2020 - 2021',
  },
  {
    degree: 'Preparatory class BCPST',
    institution: 'Champollion High School',
    location: 'Grenoble, France',
    period: '2018 - 2020',
  },
];

const research = [
  {
    title: 'AI-Driven Statistical Methods for Clustering Animal Vocalizations',
    institution: 'University of California at Berkeley',
    supervisors: 'F. Theunissen & N. Mathevon',
    location: 'Berkeley, USA',
    period: '2024',
    details: [
      'Comparison of vocal characteristics across morphotypes and populations of two bird species',
      'Clustering bonobo vocalizations with AI, exploring acoustic diversity',
      'PCA, UMAP, t-SNE, Random Forests, SVM, Variational Autoencoders',
    ],
  },
  {
    title: 'Can chimpanzees flexibly combine calls to create new meanings?',
    institution: 'ENES Lab, Jean Monnet University',
    supervisors: 'F. Levrero, C. Crockford & C. Girard-Buttoz',
    location: 'Saint-Etienne, France',
    period: '2023 - 2024',
    details: [
      'Investigation of the hoo+grunt call sequence with potential for compositional meaning',
      'PerMANOVAs, LDAs classification and HDBSCAN clustering',
    ],
  },
  {
    title: 'An AI based approach for planarian behavior analysis',
    institution: 'Institute of Cellular and Integrative Neuroscience (CNRS)',
    supervisors: 'H. Cadiou',
    location: 'Strasbourg, France',
    period: '2023',
    details: [
      'Development of software for automatic planarian tracking using AI',
      'Behavioral experiments on magnetic sense in planarians',
    ],
  },
  {
    title: 'Passive Acoustic Monitoring of wild bottlenose dolphins',
    institution: 'Bottlenose Research Institute (BDRI)',
    supervisors: 'S. Methion & B. Diaz Lopez',
    location: 'Ria de Arousa, Spain',
    period: '2022',
    details: [
      'PAM to discover the hidden nightlife of wild bottlenose dolphins',
      'Acoustic data extraction and cetacean click train identification',
    ],
  },
];

const presentations = [
  {
    title: 'An AI based approach for planarian behavior analysis',
    event: 'NeuroFrance 2023',
    location: 'Lyon, France',
  },
  {
    title: 'Passive Acoustic Monitoring to discover the hidden nightlife of wild bottlenose dolphins',
    event: '34th European Cetacean Society Conference',
    location: 'O Grove, Spain',
  },
];

const skills = {
  'Statistics & Visualization': ['R', 'Python', 'Tidyverse', 'ggplot2', 'numpy', 'pandas', 'matplotlib', 'plotly'],
  'Machine Learning': ['Scikit-Learn', 'Keras', 'PyTorch', 'Classification', 'Clustering', 'Dimensionality Reduction'],
  'Bioacoustics': ['Seewave', 'Soundgen', 'WarbleR', 'Librosa', 'Praat', 'Raven', 'PAMGuard'],
};

const SectionHeading = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-20%" }}
    id={id}
    className="flex items-end gap-4 mb-12 mt-24 scroll-mt-32"
  >
    <h2 className="font-serif text-4xl md:text-5xl text-sand italic">{children}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-acid/50 to-transparent mb-2" />
  </motion.div>
);

const GlowCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="relative h-full bg-charcoal/40 backdrop-blur-xl border border-sage/10 p-6 md:p-8 rounded-xl hover:border-sage/20 hover:bg-charcoal/60 transition-all duration-300">
        {children}
      </div>
    </div>
  );
};

export default function CV() {
  const [activeSection, setActiveSection] = useState('education');
  const sections = ['education', 'research', 'presentations', 'skills'];
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Spy on scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300; // Offset
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-sand selection:bg-acid/30 selection:text-sand relative">
      <Navbar />
      {/* Background Noise & Gradient */}
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-acid/5 to-transparent pointer-events-none z-0" />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-acid/50 to-surf/50 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 lg:gap-24">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block pt-32 pb-12 sticky top-0 h-screen overflow-y-auto no-scrollbar">

          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="font-serif text-4xl text-sand">Quentin<br /><span className="italic text-acid">Bacquelé</span></h1>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollTo(section)}
                  className={`block w-full text-left font-mono text-xs uppercase tracking-widest py-3 border-l-2 pl-4 transition-all duration-300 ${
                    activeSection === section
                      ? 'border-acid text-acid'
                      : 'border-sage/10 text-sage/40 hover:text-sand hover:border-sage/30'
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>

            <div className="pt-8 border-t border-sage/10">
              <a
                href="#"
                className="group flex items-center gap-3 font-mono text-xs text-sand/80 hover:text-acid transition-colors"
              >
                <span className="p-2 rounded-full bg-charcoal group-hover:bg-acid/10 transition-colors">
                  <Download className="w-4 h-4" />
                </span>
                Download PDF
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pb-32 pt-24 lg:pt-32">
          
          {/* Mobile Title */}
          <div className="lg:hidden mb-16 mt-8">
            <h1 className="font-serif text-5xl text-sand mb-4">Quentin<br /><span className="italic text-acid">Bacquelé</span></h1>
            <p className="font-sans text-sage/60 text-lg">
              PhD Candidate in Acoustic Biogeography.
            </p>
          </div>

          {/* Education */}
          <SectionHeading id="education">Education</SectionHeading>
          <div className="space-y-8 relative border-l border-sage/10 ml-3 md:ml-4 pl-8 md:pl-12">
            {education.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] md:-left-[57px] top-6 w-5 h-5 rounded-full bg-obsidian border border-sage/30 flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage/50" />
                </div>

                <GlowCard>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <h3 className="font-sans text-xl text-sand font-medium leading-snug">
                      {item.degree}
                    </h3>
                    <span className="font-mono text-xs text-acid bg-acid/10 px-2 py-1 rounded">
                      {item.period}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-x-6 gap-y-1 text-sm text-sage/60 font-mono mb-3">
                    <span className="flex items-center gap-2">
                      <Award className="w-3 h-3" />
                      {item.institution}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                  </div>
                  {item.note && (
                    <p className="font-sans text-sm text-surf/80 italic border-l-2 border-surf/30 pl-3">
                      {item.note}
                    </p>
                  )}
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {/* Research */}
          <SectionHeading id="research">Research</SectionHeading>
          <div className="space-y-12">
            {research.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="group relative pl-6 border-l-2 border-sage/10 hover:border-sage/30 transition-colors duration-500">
                  <div className="mb-4">
                    <h3 className="font-sans text-2xl text-sand font-medium transition-colors duration-300">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-sage/50">
                      <span className="text-acid">{item.period}</span>
                      <span>{item.institution}</span>
                      <span>{item.location}</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-sage/30">
                      Supervisors: {item.supervisors}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 text-sage/70 font-sans leading-relaxed text-base transition-colors">
                        <span className="mt-2 w-1 h-1 rounded-full bg-surf/50 shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Presentations */}
          <SectionHeading id="presentations">Presentations</SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            {presentations.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <GlowCard className="h-full flex flex-col justify-between">
                  <div>
                    <Calendar className="w-5 h-5 text-acid mb-4 opacity-80" />
                    <h3 className="font-sans text-lg text-sand font-medium mb-3 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="mt-4 pt-4 border-t border-sage/5 flex justify-between items-end font-mono text-xs">
                    <span className="text-surf">{item.event}</span>
                    <span className="text-sage/40">{item.location}</span>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {/* Skills */}
          <SectionHeading id="skills">Skills</SectionHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(skills).map(([category, items], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h3 className="font-mono text-xs text-acid uppercase tracking-widest mb-6 pb-2 border-b border-sage/10">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, i) => (
                    <span
                      key={skill}
                      className="cursor-default font-mono text-xs text-sage/70 bg-charcoal/50 border border-sage/10 px-3 py-1.5 rounded-md hover:border-sage/30 hover:bg-charcoal/70 hover:text-sand/90 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Languages */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 pt-12 border-t border-sage/10 flex flex-wrap gap-12"
          >
            <div>
              <span className="font-sans text-sand text-lg font-medium block mb-1">French</span>
              <span className="font-mono text-xs text-acid uppercase tracking-wider">Native</span>
            </div>
            <div>
              <span className="font-sans text-sand text-lg font-medium block mb-1">English</span>
              <span className="font-mono text-xs text-surf uppercase tracking-wider">Fluent</span>
            </div>
            <div>
              <span className="font-sans text-sand text-lg font-medium block mb-1">German</span>
              <span className="font-mono text-xs text-sage/40 uppercase tracking-wider">Elementary</span>
            </div>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
