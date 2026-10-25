export type Publication = {
  year: string;
  title: string;
  authors: string;
  journal: string;
  tags: string[];
  link?: string;
};

// Shared by the home page and the CV, most recent first.
export const publications: Publication[] = [
  {
    year: '2026',
    title: 'The global biogeography of passerine songs',
    authors: 'Quentin Bacquelé, Jean-Yves Barnagaud, Cyrille Violle, Frédéric Theunissen, Nicolas Mathevon',
    journal: 'Science',
    tags: ['Birdsong Evolution', 'Acoustic Motifs'],
    link: 'https://www.science.org/doi/10.1126/science.aee6239',
  },
  {
    year: '2025',
    title: 'HAC-Net: Learning Natural Units from Acoustic Change',
    authors: 'Quentin Bacquelé, Jean-Yves Barnagaud, Frederic Theunissen, Nicolas Mathevon',
    journal: 'NeurIPS 2025',
    tags: ['Acoustic Segmentation', 'Pattern Discovery'],
    link: 'https://openreview.net/pdf?id=VWLd8irCtH',
  },
  {
    year: '2025',
    title: 'AI Decodes Chimpanzee Vocabulary Items',
    authors: 'Antoine Valet, Quentin Bacquelé, Cédric Girard-Buttoz, Roman M Wittig, Catherine Crockford',
    journal: 'NeurIPS 2025',
    tags: ['Contextual Classification'],
  },
];
