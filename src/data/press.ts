export type PressItem = {
  outlet: string;
  title: string;
  kind: string;
  date: string;
  /** Empty until the public URL is known; the item then renders without a link. */
  link: string;
  /** The outlet's own share image. */
  image?: string;
  imageAlt?: string;
  /** Show the whole image (square tiles, magazine covers) rather than cropping it to the card. */
  imageFit?: 'contain';
  /** The outlet's logo, shown when there is no share image or it fails to load. */
  logo?: string;
  language?: 'fr' | 'nl' | 'de' | 'es' | 'it' | 'ru';
  note?: string;
  also?: { label: string; href: string }[];
};

// Outlets without a usable share image fall back to their logo, then to their name set in type.
// Only coverage that interviewed Quentin is listed under interviews; the rest is commentary and news.

const bbc: PressItem = {
  outlet: 'BBC News',
  title: 'Scientists find the secret of birdsong’s “spectacular diversity”',
  kind: 'News',
  date: 'July 2026',
  // Victoria Gill's BBC story as republished by AOL. Swap in the bbc.com URL when available.
  link: 'https://www.aol.com/articles/scientists-building-blocks-birdsongs-spectacular-235534000.html',
  image: 'https://hermes.media.static.aol.com/media/2026/07/24/acebf132-48bc-34dd-8ebd-370cb8e436d9/52e10272-98a3-4b66-a9b1-a3625f9f7538.jpg',
  imageAlt: 'A wren singing on a tree stump',
};

const npr: PressItem = {
  outlet: 'NPR',
  title: 'Egyptian warrior princesses, ancient avocados, and more science news',
  kind: 'Radio, All Things Considered',
  date: 'July 2026',
  link: 'https://www.npr.org/2026/07/23/nx-s1-5897598/egyptian-warrior-princesses-ancient-avocados-and-more-science-news',
  image: 'https://media.npr.org/assets/img/2022/09/23/short-wave_tile_npr-network-01_sq-c268cdb6be92867b01c6ef7e65aed8d605525779.jpg?s=600&c=85&f=webp',
  imageAlt: 'Short Wave podcast artwork',
  imageFit: 'contain',
  logo: '/press/npr.svg',
};

const leMonde: PressItem = {
  outlet: 'Le Monde',
  title: 'Derrière les chants d’oiseaux, huit motifs « élémentaires »',
  kind: 'Newspaper',
  date: 'July 2026',
  link: 'https://www.lemonde.fr/sciences/article/2026/07/29/derriere-les-chants-d-oiseaux-huit-motifs-elementaires_6736011_1650684.html',
  image: 'https://img.lemde.fr/2026/07/28/0/0/3630/2420/1112/0/75/0/85c7c2b_upload-1-afus9ddh8ezv-gettyimages-157881322.jpg',
  imageAlt: 'A wren on a grassy bank',
  logo: '/press/le-monde.svg',
  language: 'fr',
};

const audubon: PressItem = {
  outlet: 'Audubon Magazine',
  title: 'Birds build their songs using just eight musical elements, study finds',
  kind: 'Magazine',
  date: 'July 2026',
  link: 'https://www.audubon.org/magazine/birds-build-their-songs-using-just-eight-musical-elements-study-finds',
  image: 'https://media.audubon.org/2026-07/s_Aud_Northern-Cardinal_200616-05_NAPE_Photo-Mick-Thompson.jpg?width=1200&height=630&auto=webp&quality=90&fit=bounds&enable=upscale',
  imageAlt: 'A Northern Cardinal singing against a blue sky',
};

const nos: PressItem = {
  outlet: 'NOS',
  title: 'Studie naar waarom vogels zo verschillend zingen: ‘Verscheidenheid is enorm’',
  kind: 'Public broadcaster, Netherlands',
  date: 'July 2026',
  link: 'https://nos.nl/artikel/2624292-studie-naar-waarom-vogels-zo-verschillend-zingen-verscheidenheid-is-enorm',
  image: 'https://images.cdn.nos.nl/7/3/3/D/d/T/nYFV5TgGA3QRtzPUq3twPbVnEHmtTLb9YYHGMRb/7x217x2032x1143-1280x720.webp',
  imageAlt: 'A towhee singing on a bare branch',
  language: 'nl',
};

const franceCulture: PressItem = {
  outlet: 'France Culture',
  title: 'Tous les oiseaux chantent-ils la même mélodie ?',
  kind: 'Radio interview, Les Enjeux',
  date: 'July 2026',
  link: 'https://www.radiofrance.fr/franceculture/podcasts/les-enjeux/tous-les-oiseaux-chantent-ils-la-meme-melodie-2480340',
  image: 'https://www.radiofrance.fr/pikapi/images/a6fc5f07-b000-4fca-8c24-38aca2bbaee8/1280',
  imageAlt: 'A Green Oropendola perched between two tree trunks',
  logo: '/press/france-culture.svg',
  language: 'fr',
};

const physOrg: PressItem = {
  outlet: 'Phys.org',
  title: 'Why and how birdsong differs across the world, and the eight motifs that tie them together',
  kind: 'Science news',
  date: 'July 2026',
  link: 'https://phys.org/news/2026-07-birdsong-differs-world-motifs.html',
  image: 'https://scx1.b-cdn.net/csz/news/800a/2025/a-colorful-mosaic-of-b.jpg',
  imageAlt: 'A colourful mosaic of birds and musical notes (AI-generated image, credited by Phys.org)',
};

/** Shown on the home page and in the CV. */
export const pressExamples: PressItem[] = [bbc, audubon, nos];

/** The three highlights, shown first and larger on the press page. */
export const featuredInterviews: PressItem[] = [bbc, audubon, franceCulture];

export const interviews: PressItem[] = [
  npr,
  leMonde,
  {
    outlet: 'Deutschlandfunk',
    title: 'Vielfalt durch Variation: Singvögel nutzen nur acht Lied-Elemente',
    kind: 'Radio',
    date: 'July 2026',
    link: 'https://www.deutschlandfunk.de/vielfalt-durch-variation-singvoegel-nutzen-nur-acht-lied-elemente-100.html',
    image: 'https://bilder.deutschlandfunk.de/18/cf/ab/91/18cfab91-9e29-4897-843d-c832940b89c9/forschung-aktuell-cover-100-1920x1080.jpg',
    imageAlt: 'Forschung aktuell programme artwork: sea ice seen from above',
    logo: '/press/deutschlandfunk.svg',
    language: 'de',
  },
  nos,
  {
    outlet: 'science.ORF.at',
    title: 'Vogelgesang besteht aus acht Bausteinen',
    kind: 'Public broadcaster, Austria',
    date: 'July 2026',
    link: 'https://science.orf.at/stories/3236637/',
    image: 'https://ibs.orf.at/science?image=https%3A%2F%2Ftubestatic.orf.at%2Fmims%2F2026%2F30%2F95%2Fcrops%2Fw%3D1200%2Ch%3D627%2Cq%3D75%2F3124124_master_1210595_wren.jpg%3Fs%3Dde5ca4feeec68bd38873ef065828cf011b92bc22',
    imageAlt: 'A wren singing on a tree stump',
    language: 'de',
  },
  {
    outlet: 'Le Figaro',
    title: 'Trilles, sifflements et notes chaotiques : la règle étonnante de simplicité cachée dans le chant des oiseaux',
    kind: 'Newspaper',
    date: 'July 2026',
    link: 'https://www.lefigaro.fr/sciences/trilles-sifflements-et-notes-chaotiques-la-regle-etonnante-de-simplicite-cachee-dans-le-chant-des-oiseaux-20260727',
    image: 'https://i.f1g.fr/media/cms/704x396_cropupscale/2026/07/27/777dcf9d5858abff13913bd504d86d3a46684656e1c9784c054f291f8541f5eb.jpg',
    imageAlt: 'A European Robin perched on a branch',
    logo: '/press/le-figaro.svg',
    language: 'fr',
  },
  {
    outlet: 'Libération',
    title:
      'La diversité des chants d’oiseaux enfin décryptée : «C’est la première fois qu’une étude comparée est menée à une échelle mondiale»',
    kind: 'Newspaper',
    date: 'July 2026',
    link: 'https://www.liberation.fr/sciences/biologie/la-diversite-des-chants-doiseaux-enfin-decryptee-cest-la-premiere-fois-quune-etude-comparee-est-menee-a-une-echelle-mondiale-20260727_F7ED4BVMRFBSLCO65HXV7QW35I/',
    image: 'https://www.liberation.fr/resizer/v2/YIDZQNYH2BFURMP3OVIT7TFOVI.jpg?auth=768f50c02c6c0bc20f696649e8ab3a828b107c242cbc3331a5f73b1c62cc0872&quality=70&width=1600&focal=2064%2C1152',
    imageAlt: 'A warbler singing on a twig among leaves',
    logo: '/press/liberation.svg',
    language: 'fr',
    also: [{ label: 'print', href: 'https://www.pressreader.com/france/liberation/20260728/281715506405624' }],
  },
  {
    outlet: 'Ouest-France',
    title: 'Comment les oiseaux composent-ils leurs mélodies ? Cette ambitieuse étude française dévoile leurs secrets',
    kind: 'Newspaper',
    date: 'August 2026',
    link: 'https://www.ouest-france.fr/leditiondusoir/2026-08-05/comment-les-oiseaux-composent-ils-leurs-melodies-cette-ambitieuse-etude-francaise-devoile-leurs-secrets-26244f65-ae4d-4d4c-9cf7-d4bc3d997f18',
    image: 'https://media.ouest-france.fr/v1/pictures/08d78817a1561523383569fac3f07265-7e537fa6-8fe9-11f1-affe-b5734e615deb.jpg?width=1260&client_id=eds&sign=b46b05a22c08ac211466454d4405220fcf1e536002ba05c1e4936109207e95c3',
    imageAlt: 'A European Robin singing on a bare branch',
    logo: '/press/ouest-france.svg',
    language: 'fr',
  },
  {
    outlet: 'Québec Science',
    title: 'Le chant des oiseaux s’articule autour de huit « lettres »',
    kind: 'Magazine, Canada',
    date: 'October 2026',
    link: 'https://www.quebecscience.qc.ca/environnement/nature/chant-oiseaux-lettres/',
    image: 'https://www.quebecscience.qc.ca/wp-content/uploads/2026/09/qs202610-actulongue-1200x800-1.jpg',
    imageAlt: 'A Bluethroat singing on a twig',
    language: 'fr',
  },
  {
    outlet: 'The Hindu',
    title: 'A hidden eight-note alphabet makes up every bird song in the world',
    kind: 'Newspaper',
    date: 'September 2026',
    link: 'https://www.thehindu.com/sci-tech/energy-and-environment/a-hidden-eight-note-alphabet-makes-up-every-bird-song-in-the-world/article71414474.ece',
    image: 'https://th-i.thgim.com/public/sci-tech/science/oerug5/article71414466.ece/alternates/LANDSCAPE_1200/Red-whiskered_bulbul_%E0%A6%B8%E0%A6%BF%E0%A6%AA%E0%A6%BE%E0%A6%B9%E0%A6%BF_%E0%A6%AC%E0%A7%81%E0%A6%B2%E0%A6%AC%E0%A7%81%E0%A6%B2%E0%A6%BF.jpg',
    imageAlt: 'A Red-whiskered Bulbul perched on a flowering branch',
    logo: '/press/the-hindu.svg',
    also: [{ label: 'print', href: 'https://www.pressreader.com/india/the-hindu-international-9bn2/20260902/281964614585469' }],
  },
];

export const commentary: PressItem[] = [
  {
    outlet: 'Science',
    title: 'Birdsong diversity across the world',
    kind: 'Perspective',
    date: 'July 2026',
    link: 'https://www.science.org/doi/abs/10.1126/science.aej0087',
    image: 'https://www.science.org/cms/asset/5c06e1ea-2643-40dd-b0fc-ba8827418611/science.2026.393.issue-6809.largecover.jpg',
    imageAlt: 'Cover of the Science issue 6809, volume 393',
    imageFit: 'contain',
    logo: '/press/science.svg',
  },
  physOrg,
  {
    outlet: 'EPHE–PSL',
    title: 'Chanter sous la pluie (et la forêt) : quand les oiseaux chantent selon 8 motifs',
    kind: 'Press release',
    date: 'August 2026',
    link: 'https://www.ephe.psl.eu/chanter-sous-la-pluie-et-la-foret-quand-les-oiseaux-chantent-selon-8-motifs',
    image: 'https://www.ephe.psl.eu/sites/default/files/media/image/chanter_sous_la_pluie.jpg',
    imageAlt: 'A wren singing on a stump',
    language: 'fr',
  },
];

/** Everything, interviews first. */
export const allPress: PressItem[] = [...featuredInterviews, ...interviews, ...commentary];
