import type { Source } from './organs';

export interface FrameworkItem {
  region: 'United States' | 'European Union';
  name: string;
  body: string;
  source: Source;
}

export const FRAMEWORK: FrameworkItem[] = [
  {
    region: 'United States',
    name: 'FDA: software as a medical device',
    body:
      'Software with a medical purpose reaches the market through 510(k) clearance, De Novo classification or premarket approval. The FDA keeps a public list of AI-enabled devices and notes that it is not exhaustive.',
    source: { id: 'fda-ai-list', title: 'Artificial Intelligence-Enabled Medical Devices', publisher: 'U.S. Food and Drug Administration', kind: 'Regulator', url: 'https://www.fda.gov/medical-devices/artificial-intelligence-enabled-medical-devices/list-artificial-intelligence-enabled-medical-devices' },
  },
  {
    region: 'United States',
    name: 'FDA: the wellness line',
    body:
      'Revised general-wellness guidance (6 January 2026) lets non-invasive wearables estimate values such as blood pressure for wellness, provided they do not name diseases, use clinical thresholds, claim medical-grade accuracy or prompt clinical action.',
    source: { id: 'cov-wellness', title: 'FDA issues revised guidance on general wellness products', publisher: 'Covington & Burling', kind: 'Legal analysis', url: 'https://www.cov.com/en/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products' },
  },
  {
    region: 'European Union',
    name: 'AI Act (Regulation 2024/1689)',
    body:
      'AI in medical devices is classed as high-risk. Those obligations apply from 2 August 2027 and are assessed through the medical device conformity route. The Commission’s Digital Omnibus proposal (November 2025) would allow them to move to as late as August 2028.',
    source: { id: 'dla-omnibus', title: 'Digital Omnibus and AI Act updates: key implications for medtech', publisher: 'DLA Piper', kind: 'Legal analysis', url: 'https://www.dlapiper.com/en/insights/blogs/cortex-life-sciences-insights/2025/digital-omnibus-and-ai-act-updates-key-implications-for-medtech' },
  },
  {
    region: 'European Union',
    name: 'European Health Data Space (Regulation 2025/327)',
    body:
      'In force since 26 March 2025. From March 2029 patient summaries and e-prescriptions are exchanged across the EU, and secondary use of health data for research and AI begins. Medical images, lab results and discharge reports join in March 2031, as does secondary use of genomic data.',
    source: { id: 'ec-ehds', title: 'European Health Data Space Regulation (EHDS)', publisher: 'European Commission', kind: 'Regulator', url: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en' },
  },
];

export const CONTEXT_SOURCES = {
  medica: { title: 'Medica 2026: AI’s rise in healthcare will render humans as “data platforms”', publisher: 'Medical Device Network', url: 'https://www.medicaldevice-network.com/news/medica-2026-ai-rise-in-healthcare-will-render-humans-as-data-platforms/' },
  who: { title: 'WHO releases AI ethics and governance guidance for large multi-modal models', publisher: 'World Health Organization', url: 'https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models' },
};
