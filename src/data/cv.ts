export type CVEntry = {
  period: string;
  title: string;
  org?: string;
  place?: string;
  note?: string;
  details?: string[];
  logos?: { src: string; alt: string }[];
};

export const education: CVEntry[] = [
  {
    period: '2024–2027',
    title: 'PhD in acoustic communication of birds, biogeography and artificial intelligence',
    org: 'EPHE–PSL, ENES Bioacoustics Research Lab and CEFE',
    place: 'Saint-Étienne and Montpellier, France',
    note: 'Supervised by Nicolas Mathevon and Jean-Yves Barnagaud.',
    logos: [
      { src: '/logos/ephe.jpg', alt: 'EPHE–PSL' },
      { src: '/logos/enes.jpg', alt: 'ENES Bioacoustics Research Lab' },
      { src: '/logos/cefe.png', alt: 'CEFE' },
    ],
    details: [
      'Mapping, explaining and predicting the global diversity of bird vocalizations by combining bioacoustics, biogeography and machine learning.',
    ],
  },
  {
    period: '2023–2024',
    title: 'M.Sc. International Master in Bioacoustics (MoBi)',
    org: 'Jean Monnet University',
    place: 'Saint-Étienne, France',
  },
  {
    period: '2021–2024',
    title: 'M.Sc. Ecophysiology, Ecology and Ethology (EEE)',
    org: 'University of Strasbourg',
    place: 'Strasbourg, France',
    note: 'Double degree with the M.Sc. in data science (AISD).',
  },
  {
    period: '2021–2024',
    title: 'M.Sc. Interdisciplinary Approach in Data Science (AISD)',
    org: 'University of Strasbourg',
    place: 'Strasbourg, France',
    note: 'Double degree with the M.Sc. EEE.',
  },
  {
    period: '2023',
    title: 'University Degree in Bioacoustics',
    org: 'Jean Monnet University',
    place: 'Saint-Étienne, France',
  },
  {
    period: '2020–2021',
    title: 'B.Sc. Life Sciences, ecology track',
    org: 'Savoie Mont-Blanc University',
    place: 'Chambéry, France',
  },
  {
    period: '2018–2020',
    title: 'Preparatory class BCPST',
    org: 'Lycée Champollion',
    place: 'Grenoble, France',
  },
];

export const researchExperience: CVEntry[] = [
  {
    period: '2024',
    title: 'A contour-based approach for quantifying cryptic vocal dialects in songbirds',
    org: 'University of California, Berkeley',
    place: 'Berkeley, USA',
    note: 'With F. Theunissen and N. Mathevon.',
    logos: [{ src: '/logos/berkeley.svg', alt: 'UC Berkeley' }],
    details: [
      'Measured subtle acoustic differences between the four parapatric forms of the Réunion Grey White-eye.',
      'Developed the pitch contour method; PCA, UMAP, t-SNE, random forests, SVM, variational autoencoders.',
    ],
  },
  {
    period: '2023',
    title: 'Can chimpanzees flexibly combine calls to create new meanings?',
    org: 'ENES Lab, Jean Monnet University',
    place: 'Saint-Étienne, France',
    note: 'With F. Levréro, C. Crockford and C. Girard-Buttoz.',
    logos: [{ src: '/logos/enes.jpg', alt: 'ENES Bioacoustics Research Lab' }],
    details: [
      'Studied the hoo+grunt call sequence and its potential for compositional meaning.',
      'PERMANOVA, LDA classification and HDBSCAN clustering.',
    ],
  },
  {
    period: '2023',
    title: 'An AI-based approach to planarian behaviour',
    org: 'Institute of Cellular and Integrative Neuroscience (CNRS)',
    place: 'Strasbourg, France',
    note: 'With H. Cadiou.',
    logos: [{ src: '/logos/inci.png', alt: 'CNRS and INCI' }],
    details: [
      'Built software for automatic planarian tracking.',
      'Ran behavioural experiments on magnetic sense in planarians.',
    ],
  },
  {
    period: '2022',
    title: 'Passive acoustic monitoring of wild bottlenose dolphins',
    org: 'Bottlenose Dolphin Research Institute (BDRI)',
    place: 'Ría de Arousa, Spain',
    note: 'With S. Methion and B. Díaz López.',
    logos: [{ src: '/logos/bdri.jpg', alt: 'Bottlenose Dolphin Research Institute' }],
    details: [
      'Used passive acoustic monitoring to study the night-time activity of wild bottlenose dolphins.',
      'Extracted acoustic data and identified cetacean click trains.',
    ],
  },
];

export const presentations: CVEntry[] = [
  {
    period: '2025',
    title: 'HAC-Net: Learning Natural Units from Acoustic Change',
    org: 'NeurIPS 2025',
    place: 'San Diego, USA',
    note: 'Poster.',
  },
  {
    period: '2023',
    title: 'An AI-based approach for planarian behaviour analysis',
    org: 'NeuroFrance 2023',
    place: 'Lyon, France',
    note: 'Poster.',
  },
  {
    period: '2023',
    title: 'Passive acoustic monitoring to discover the hidden nightlife of wild bottlenose dolphins',
    org: '34th Conference of the European Cetacean Society',
    place: 'O Grove, Spain',
    note: 'Poster.',
  },
];

export const teaching: CVEntry[] = [
  {
    period: '2026',
    title: 'Analysing human and animal sounds',
    org: 'AI PSL Week, ENS Ulm',
    note: '3 hours.',
  },
  {
    period: '2025',
    title: 'Sound resynthesis',
    org: 'M.Sc. Bioacoustics, Jean Monnet University',
    note: '4 hours.',
  },
  {
    period: '2024–2025',
    title: 'Statistics',
    org: 'Master 2 Ecology, Jean Monnet University',
    note: '16 hours.',
  },
  {
    period: '2024',
    title: 'Ecology, practical work',
    org: 'B.Sc. Life Sciences (L2 and L3), Jean Monnet University',
    note: '28 hours.',
  },
];

export const supervision: CVEntry[] = [
  {
    period: '',
    title: 'M.Sc. projects, supervisor and co-supervisor',
    org: 'M.Sc. Bioacoustics (MoBi), Jean Monnet University',
    details: [
      'Biogeography of rhythm in passerine birds.',
      'Phylogeny of non-linear phenomena in mammals.',
    ],
  },
  {
    period: '',
    title: 'Python for bioacoustics, mentoring two students',
    org: 'UC Berkeley',
  },
];

export const funding: CVEntry[] = [
  {
    period: '2024–2027',
    title: 'PhD stipend, PSL–EPHE EABIS grant',
    org: 'Université Paris Sciences et Lettres',
    note: '€80,400.',
  },
  {
    period: '2024',
    title: 'Mobility grant',
    org: 'EPHE',
    note: '€500.',
  },
];

export const otherExperience: CVEntry[] = [
  {
    period: '2022–2024',
    title: 'Founder of FauNet: facial recognition of rhesus macaques',
    org: 'For SILABE (Simian Laboratory Europe)',
    place: 'Strasbourg, France',
    details: [
      'Built CNN-based detectors (SSD, YOLOv7/8) to identify individual primates from video.',
      'Aim: map social networks from automated proximity detection.',
    ],
  },
  {
    period: '2023',
    title: 'Challenge: automatic detection of odontocete clicks',
    org: 'University of Toulon (H. Glotin)',
    details: [
      'Distinguished dolphin biosonar clicks from transient environmental noise.',
      'Classification models with XGBoost, LSTMs and CNNs.',
    ],
  },
];
