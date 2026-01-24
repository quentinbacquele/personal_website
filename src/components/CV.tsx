import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';

const currentPosition = {
  role: 'PhD Candidate in Acoustic Biogeography',
  institution: 'EPHE/ENES/CEFE',
  location: 'Saint-Étienne / Montpellier, France',
  period: '2024 - Present',
  supervisors: 'Supervised by N. Mathevon and J-Y. Barnagaud',
  details: "This thesis aims to map, explain, and predict the global diversity of bird vocalizations. It establishes a novel synergy between bioacoustics and biogeography, leveraging artificial intelligence and eco-informatics. The project develops a macroecological approach to acoustic communication strategies in birds, examining responses to environmental and anthropogenic constraints at a supra-continental scale.",
  logos: [
    { name: 'EPHE', src: '/logos/ephe.jpg', wide: false },
    { name: 'ENES', src: '/logos/enes.jpg', wide: true },
    { name: 'CEFE', src: '/logos/cefe.png', wide: true },
  ],
};

const education = [
  {
    degree: 'PhD Candidate in Acoustic Communication of Birds, Biogeography & Artificial Intelligence',
    institution: 'EPHE/ENES/CEFE',
    location: 'Saint-Étienne, France',
    period: '2024 - 2027',
  },
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

const publications = [
  {
    year: '2025',
    title: 'HAC-Net: Learning Natural Units from Acoustic Change',
    authors: 'Quentin Bacquelé, Jean-Yves Barnagaud, Frederic Theunissen, Nicolas Mathevon',
    journal: 'NeurIPS 2025',
    tags: ['Acoustic Segmentation', 'Pattern Discovery'],
    link: 'https://openreview.net/pdf?id=VWLd8irCtH'
  },
  {
    year: '2025',
    title: 'AI Decodes Chimpanzee Vocabulary Items',
    authors: 'Antoine Valet, Quentin Bacquelé, Cédric Girard-Buttoz, Roman M Wittig, Catherine Crockford',
    journal: 'NeurIPS 2025',
    tags: ['Contextual Classification'],
    link: '#'
  },
  {
    year: 'N/A',
    title: 'A novel contour-based approach for quantifying cryptic vocal dialects in songbirds',
    authors: 'Quentin Bacquelé, Barbara Freitas, Borja Milá, Christophe Thébaud, Nicolas Mathevon, Frédéric Theunissen',
    journal: 'In Preparation',
    tags: ['Frequency Contour', 'Dialects'],
    link: '#'
  },
  {
    year: 'N/A',
    title: 'The global biogeography of passerine songs',
    authors: 'Quentin Bacquelé, Jean-Yves Barnagaud, Cyrille Violle, Frédéric Theunissen, Nicolas Mathevon',
    journal: 'In Preparation',
    tags: ['Birdsong Evolution', 'Acoustic Motifs'],
    link: '#'
  }
];

const research = [
  {
    title: 'A novel contour-based approach for quantifying cryptic vocal dialects in songbirds',
    institution: 'University of California at Berkeley',
    supervisors: 'F. Theunissen & N. Mathevon',
    location: 'Berkeley, USA',
    period: '2024',
    logo: { name: 'UC Berkeley', src: '/logos/berkeley.svg', wide: false },
    details: [
      'Revealing subtle acoustic differences between the 4 parapatric forms of La Réunion Island Grey White-Eye',
      'A new method: the pitch contour method',
      'PCA, UMAP, t-SNE, Random Forests, SVM, Variational Autoencoders',
    ],
  },
  {
    title: 'Can chimpanzees flexibly combine calls to create new meanings?',
    institution: 'ENES Lab, Jean Monnet University',
    supervisors: 'F. Levrero, C. Crockford & C. Girard-Buttoz',
    location: 'Saint-Etienne, France',
    period: '2023',
    logo: { name: 'ENES Lab', src: '/logos/enes.jpg', wide: true },
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
    logo: { name: 'INCI', src: '/logos/inci.png', wide: true },
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
    logo: { name: 'BDRI', src: '/logos/bdri.jpg', wide: false },
    details: [
      'PAM to discover the hidden nightlife of wild bottlenose dolphins',
      'Acoustic data extraction and cetacean click train identification',
    ],
  },
];

const freelance = [
  {
    company: 'FauNet (Founder)',
    projects: [
      {
        title: 'Facial recognition of rhesus monkeys',
        client: 'SILABE (Simian Laboratory Europe)',
        period: '2022 - 2024',
        location: 'Strasbourg, France',
        details: [
          'Developed CNN-based systems (SSD & YOLOv7/8) for automated primate identification from video',
          'Goal: To map social networks based on automated proximity detection',
        ]
      }
    ]
  }
];

const competitions = [
  {
    title: "Automatic Detection of Odontocetes' Clicks",
    organizer: 'Toulon University (H. Glotin)',
    period: 'Mar 2023 – Apr 2023',
    details: [
      'Bioacoustic challenge to distinguish dolphin biosonars from transient environmental noise',
      'Implemented classification models using XGBoost, LSTMs, and CNNs',
    ]
  }
];

const fundings = [
  {
    title: 'PhD Stipend (PSL-EPHE EABIS Grant)',
    source: 'University Paris-Sciences-Lettres',
    year: '2024 - 2027',
    amount: '€80,400'
  },
  {
    title: 'Mobility Grant',
    source: 'EPHE',
    year: '2024',
    amount: '€500'
  }
];

const teaching = [
  {
    course: 'Sound Resynthesis',
    period: '2025 (4h)',
    level: 'M.Sc. Bioacoustics',
    institution: 'Jean Monnet University',
  },
  {
    course: 'Statistics',
    period: '2024 - 2025 (16h)',
    level: 'Master 2 Ecology',
    institution: 'Jean Monnet University',
  },
  {
    course: 'Ecology (Practical Work)',
    period: '2024 (28h)',
    level: 'B.Sc. Life Sciences (L2 & L3)',
    institution: 'Jean Monnet University',
  }
];

const supervision = [
  {
    title: 'Python for Bioacoustics',
    role: 'Mentorship (2 students)',
    institution: 'UC Berkeley',
    details: [],
  },
  {
    title: 'M.Sc. Project Supervision',
    role: 'Supervisor/Co-supervisor',
    institution: 'M.Sc. in Bioacoustics (MoBi), Jean Monnet University',
    details: [
      'Biogeography of rhythm in passerine birds',
      'Phylogeny of non-linear phenomena in mammals',
    ],
  }
];

const presentations = [
  {
    title: 'HAC-Net: Learning Natural Units from Acoustic Change',
    event: 'NeurIPS 2025',
    location: 'San Diego, USA',
    type: 'Poster',
  },
  {
    title: 'An AI based approach for planarian behavior analysis',
    event: 'NeuroFrance 2023',
    location: 'Lyon, France',
    type: 'Poster',
  },
  {
    title: 'Passive Acoustic Monitoring to discover the hidden nightlife of wild bottlenose dolphins',
    event: '34th European Cetacean Society Conference',
    location: 'O Grove, Spain',
    type: 'Poster',
  },
];

const SectionHeading = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-20%" }}
    id={id}
    className="flex items-end gap-4 mb-12 mt-24 scroll-mt-32"
  >
    <h2 className="font-serif text-4xl md:text-5xl text-sand italic">{children}</h2>
    <div className="flex-1 h-px bg-sage/20 mb-2" />
  </motion.div>
);

export default function CV() {
  const [activeSection, setActiveSection] = useState('current-position');
  const sections = ['current-position', 'publications', 'presentations', 'internships', 'fundings', 'teaching', 'freelance', 'competitions', 'education'];
  
  // Spy on scroll to update active section
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const handleScroll = () => {
      if (window.scrollY < 150) {
        setActiveSection('current-position');
        return;
      }

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
                href="/pdfs/CV_Quentin_Bacquele.pdf"
                download
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

          {/* Current Position */}
          <SectionHeading id="current-position">Current Position</SectionHeading>
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                <h3 className="font-sans text-2xl text-sand font-medium">
                  {currentPosition.role}
                </h3>
                <span className="font-mono text-xs text-acid shrink-0">
                  {currentPosition.period}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-3 shrink-0">
                  {currentPosition.logos.map((logo) => (
                    <div
                      key={logo.name}
                      className={`${logo.wide ? 'w-36 h-16' : 'w-24 h-24'} rounded-xl bg-white overflow-hidden flex items-center justify-center`}
                      title={logo.name}
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-sage/50">
                    <span>{currentPosition.institution}</span>
                    <span className="text-sage/20">•</span>
                    <span>{currentPosition.location}</span>
                  </div>
                  <div className="font-mono text-xs text-sage/30 mt-1">
                    {currentPosition.supervisors}
                  </div>
                </div>
              </div>

              <p className="font-sans text-sage/80 text-lg leading-relaxed">
                {currentPosition.details}
              </p>
            </motion.div>
          </div>

          {/* Publications */}
          <SectionHeading id="publications">Publications</SectionHeading>
          <div className="space-y-8">
            {publications.map((pub, index) => (
              <motion.a
                key={index}
                href={pub.link}
                target={pub.link !== '#' ? "_blank" : undefined}
                rel={pub.link !== '#' ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="block group border-l-2 border-sage/10 pl-6 hover:border-acid transition-colors"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                  <h3 className="font-sans text-xl text-sand font-medium leading-snug group-hover:text-acid transition-colors">
                    {pub.title}
                  </h3>
                  <span className="font-mono text-xs text-acid shrink-0">
                    {pub.year}
                  </span>
                </div>
                
                <div className="text-sage/60 text-sm mb-2 font-sans">{pub.authors}</div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 items-center font-mono text-xs text-sage/60">
                  <span className="text-surf">{pub.journal}</span>
                  {pub.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 border border-sage/20 rounded-full text-sage/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>

          {/* Presentations */}
          <SectionHeading id="presentations">Presentations</SectionHeading>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
            {presentations.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-sans text-lg text-sand font-medium mb-2 leading-snug">
                  {item.title}
                </h3>
                <div className="flex justify-between items-baseline font-mono text-xs pt-2 border-t border-sage/10">
                  <div className="flex gap-3">
                    <span className="text-acid uppercase tracking-wider">{item.type}</span>
                    <span className="text-surf">{item.event}</span>
                  </div>
                  <span className="text-sage/40">{item.location}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Internships (formerly Research) */}
          <SectionHeading id="internships">Internships</SectionHeading>
          <div className="space-y-16">
            {research.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                    <h3 className="font-sans text-2xl text-sand font-medium">
                      {item.title}
                    </h3>
                    <span className="font-mono text-xs text-acid shrink-0">{item.period}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    {item.logo && (
                      <div
                        className={`${item.logo.wide ? 'w-32 h-14' : 'w-20 h-20'} rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0`}
                        title={item.logo.name}
                      >
                        <img
                          src={item.logo.src}
                          alt={item.logo.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-sage/50">
                        <span>{item.institution}</span>
                        <span className="text-sage/20">•</span>
                        <span>{item.location}</span>
                      </div>
                      <div className="font-mono text-xs text-sage/30 mt-1">
                        Supervisors: {item.supervisors}
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {item.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3 text-sage/70 font-sans leading-relaxed text-base">
                      <span className="mt-2.5 w-1 h-1 rounded-full bg-sage/40 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Fundings */}
          <SectionHeading id="fundings">Fundings</SectionHeading>
          <div className="space-y-8">
            {fundings.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                  <h3 className="font-sans text-xl text-sand font-medium">
                    {item.title}
                  </h3>
                  <span className="font-mono text-xs text-acid">
                    {item.year}
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-mono text-xs text-sage/60">
                  <span>{item.source}</span>
                  <span className="text-surf">{item.amount}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Teaching */}
          <SectionHeading id="teaching">Teaching</SectionHeading>
          <div className="space-y-12">
            
            {/* Courses */}
            <div className="space-y-8">
              <h3 className="font-mono text-xs text-acid uppercase tracking-widest mb-6 pb-2 border-b border-sage/10">Courses</h3>
              {teaching.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                    <h3 className="font-sans text-xl text-sand font-medium">
                      {item.course}
                    </h3>
                    <span className="font-mono text-xs text-acid">
                      {item.period}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs text-sage/60">
                    <span>{item.level}</span>
                    <span className="text-surf">{item.institution}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Supervision */}
            <div className="space-y-8">
              <h3 className="font-mono text-xs text-acid uppercase tracking-widest mb-6 pb-2 border-b border-sage/10">Supervision</h3>
              {supervision.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                    <h3 className="font-sans text-xl text-sand font-medium">
                      {item.title}
                    </h3>
                    <span className="font-mono text-xs text-acid">
                      {item.role}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-surf mb-3">
                    {item.institution}
                  </div>
                  {item.details.length > 0 && (
                    <ul className="space-y-2 pl-4 border-l-2 border-sage/10">
                      {item.details.map((detail, i) => (
                        <li key={i} className="font-mono text-xs text-sage/60">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Freelance */}
          <SectionHeading id="freelance">Freelance</SectionHeading>
          <div className="space-y-16">
            {freelance.map((group, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {/* Company Header */}
                <h3 className="font-mono text-xs text-acid uppercase tracking-widest mb-6 pb-2 border-b border-sage/10">
                  {group.company}
                </h3>

                {/* Projects */}
                <div className="space-y-12">
                  {group.projects.map((project, pIndex) => (
                    <div key={pIndex}>
                      <div className="mb-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                          <h4 className="font-sans text-xl text-sand font-medium">
                            {project.title}
                          </h4>
                          <span className="font-mono text-xs text-acid shrink-0">{project.period}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-2 gap-y-2 font-mono text-xs text-sage/50 mb-2">
                          <span>Client: {project.client}</span>
                          <span className="text-sage/20">•</span>
                          <span>{project.location}</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {project.details.map((detail, dIndex) => (
                          <li key={dIndex} className="flex items-start gap-3 text-sage/70 font-sans leading-relaxed text-base">
                            <span className="mt-2.5 w-1 h-1 rounded-full bg-sage/40 shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Competitions */}
          <SectionHeading id="competitions">Competitions</SectionHeading>
          <div className="space-y-12">
            {competitions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                    <h3 className="font-sans text-xl text-sand font-medium">
                      {item.title}
                    </h3>
                    <span className="font-mono text-xs text-acid shrink-0">{item.period}</span>
                  </div>
                  
                  <div className="font-mono text-xs text-sage/50 mb-2">
                    Organizer: {item.organizer}
                  </div>
                </div>
                <ul className="space-y-2">
                  {item.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3 text-sage/70 font-sans leading-relaxed text-base">
                      <span className="mt-2.5 w-1 h-1 rounded-full bg-sage/40 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Education */}
          <SectionHeading id="education">Education</SectionHeading>
          <div className="space-y-12 relative ml-2 md:ml-4">
            {education.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-6 border-l border-sage/10"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-obsidian border border-sage/40" />

                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                  <h3 className="font-sans text-xl text-sand font-medium leading-snug">
                    {item.degree}
                  </h3>
                  <span className="font-mono text-xs text-acid whitespace-nowrap">
                    {item.period}
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-x-2 gap-y-1 text-sm text-sage/60 font-mono mb-2">
                  <span>{item.institution}</span>
                  <span className="hidden md:inline text-sage/20">•</span>
                  <span>{item.location}</span>
                </div>
                
                {item.note && (
                  <p className="font-sans text-sm text-surf/80 italic mt-1">
                    {item.note}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-32 pt-12 border-t border-sage/10 text-center font-mono text-[10px] text-sage/30 uppercase tracking-widest">
            © 2025 Quentin Bacquelé. All Rights Reserved.
          </div>

        </main>
      </div>
    </div>
  );
}