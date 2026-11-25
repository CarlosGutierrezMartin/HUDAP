import type { OrganKey } from './groups';

/**
 * Editorial rules for this file (checked on every change):
 * 1. Every figure has a source that was opened and read, linked in `sources`.
 * 2. Manufacturer-reported figures are labelled as such.
 * 3. "Notification", "screening" and "triage" are never called "diagnosis".
 * 4. Regulatory status is stated as the regulator states it, with the year.
 */

export const LAST_REVIEWED = '2026-11-25';

export type Origin = 'consumer' | 'authorised-wearable' | 'clinical';

export const ORIGIN_LABEL: Record<Origin, string> = {
  consumer: 'Wellness wearable',
  'authorised-wearable': 'Authorised wearable',
  clinical: 'Clinical device',
};

export const ORIGIN_HELP: Record<Origin, string> = {
  consumer: 'Wellness data from everyday devices. Not authorised to screen, diagnose or monitor disease.',
  'authorised-wearable': 'A wearable device, or a function on one, that a regulator has authorised for a defined medical purpose.',
  clinical: 'Measured with a medical device in a clinical setting and interpreted by a professional.',
};

export type SourceKind = 'Peer-reviewed' | 'Regulator' | 'Manufacturer' | 'Medical society' | 'Trade press' | 'Legal analysis';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  kind: SourceKind;
  url: string;
}

export interface Signal {
  name: string;
  detail: string;
  origin: Origin;
}

export interface Stat {
  value: string;
  label: string;
  source: string;
}

export interface UseCase {
  title: string;
  product: string;
  status: string;
  body: string;
  stats: Stat[];
}

export interface Limit {
  text: string;
  source?: string;
}

export interface Organ {
  key: OrganKey;
  name: string;
  kicker: string;
  lede: string;
  signals: Signal[];
  uses: UseCase[];
  limits: Limit[];
  sources: Source[];
}

export const ORGANS: Record<OrganKey, Organ> = {
  heart: {
    key: 'heart',
    name: 'Heart',
    kicker: 'Electrical · optical · acoustic',
    lede:
      'One of the most measured organs outside the hospital. Its electrical, optical and acoustic signals feed algorithms that screen for irregular rhythms, a weak pump and valve disease.',
    signals: [
      { name: 'Single-lead ECG', detail: '30-second recording taken on demand from a watch', origin: 'authorised-wearable' },
      { name: 'Pulse rhythm (PPG)', detail: 'Optical sensor checks beat-to-beat regularity in the background', origin: 'authorised-wearable' },
      { name: 'Heart rate and HRV', detail: 'Continuous rate and variability for fitness and recovery', origin: 'consumer' },
      { name: '12-lead ECG', detail: 'Standard clinical recording of the heart’s electrical activity', origin: 'clinical' },
      { name: 'Heart sounds', detail: 'Digital stethoscope records murmurs and valve sounds', origin: 'clinical' },
    ],
    uses: [
      {
        title: 'Atrial fibrillation screening',
        product: 'Apple Watch irregular rhythm notifications and ECG app',
        status: 'FDA-authorised wearable features',
        body:
          'An optical algorithm flags repeated irregular pulse patterns and prompts the user to seek care. The ECG app classifies a 30-second trace as sinus rhythm, atrial fibrillation or inconclusive.',
        stats: [
          { value: '419,297', label: 'participants in the Apple Heart Study, recruited remotely in 8 months', source: 'perez-2019' },
          { value: '0.52%', label: 'received an irregular pulse notification', source: 'perez-2019' },
          { value: '0.84', label: 'positive predictive value of a notification against a simultaneous ECG patch', source: 'perez-2019' },
          { value: '98.3% / 99.6%', label: 'ECG app sensitivity / specificity on classifiable traces; 12.2% of traces were inconclusive (manufacturer-reported)', source: 'apple-wp' },
        ],
      },
      {
        title: 'Detecting a weak heart from a routine ECG',
        product: 'Mayo Clinic AI-ECG for low ejection fraction',
        status: 'Tested in a randomised trial',
        body:
          'A neural network reads a standard 12-lead ECG and estimates whether the left ventricle pumps poorly, a sign of heart failure that often goes unnoticed. In the EAGLE trial, primary-care teams were randomised to see the AI result or not.',
        stats: [
          { value: '22,641', label: 'adults in 120 primary-care teams', source: 'yao-2021' },
          { value: '2.1% vs 1.6%', label: 'new low-ejection-fraction diagnoses within 90 days, with vs without AI (OR 1.32)', source: 'yao-2021' },
        ],
      },
      {
        title: 'Murmurs and valve disease',
        product: 'Eko Murmur Analysis Software',
        status: 'FDA 510(k) cleared, 2022 (K213794)',
        body:
          'Recordings from a digital stethoscope are analysed to separate innocent from structural murmurs. It supports the clinician and is not intended as the sole means of diagnosis.',
        stats: [
          { value: '85.6% / 84.4%', label: 'sensitivity / specificity for structural heart murmurs (manufacturer-reported, from the 510(k) summary)', source: 'eko-2022' },
        ],
      },
      {
        title: 'Signs of high blood pressure',
        product: 'Apple Watch hypertension notifications',
        status: 'FDA cleared, September 2025',
        body:
          'Optical data from the previous 30 days is analysed for vascular patterns associated with hypertension. A notification prompts the user to measure blood pressure with a cuff.',
        stats: [],
      },
    ],
    limits: [
      { text: 'A notification is not a diagnosis. Atrial fibrillation must be confirmed on an ECG reviewed by a clinician.', source: 'perez-2019' },
      { text: 'False alarms are commoner in young, low-risk users: under 40, only 18% of notified participants had atrial fibrillation on the follow-up patch.', source: 'perez-2019' },
      { text: 'Finding more cases is not yet proof of benefit. In GUARD-AF, ECG-patch screening raised AF diagnoses by 52% but did not significantly reduce stroke hospitalisations; the trial stopped early.', source: 'guard-af' },
      { text: 'FDA states that the hypertension notification is meant to guide further testing, not to act as a final diagnostic test.', source: 'apple-htn' },
      { text: 'A single-lead trace is not a 12-lead ECG and cannot rule out other heart conditions.' },
    ],
    sources: [
      { id: 'perez-2019', title: 'Large-Scale Assessment of a Smartwatch to Identify Atrial Fibrillation (Perez et al., 2019)', publisher: 'N Engl J Med', kind: 'Peer-reviewed', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8112605' },
      { id: 'apple-wp', title: 'Using Apple Watch for Arrhythmia Detection', publisher: 'Apple', kind: 'Manufacturer', url: 'https://www.apple.com/healthcare/docs/site/Apple_Watch_Arrhythmia_Detection.pdf' },
      { id: 'yao-2021', title: 'AI-enabled ECGs for identification of patients with low ejection fraction: a pragmatic randomised trial (Yao et al., 2021)', publisher: 'Nature Medicine', kind: 'Peer-reviewed', url: 'https://www.nature.com/articles/s41591-021-01335-4' },
      { id: 'eko-2022', title: 'FDA clears Eko’s heart disease detection AI for adults and paediatrics', publisher: 'Eko Health', kind: 'Manufacturer', url: 'https://www.ekohealth.com/blogs/newsroom/fda-clears-eko-heart-disease-ai' },
      { id: 'apple-htn', title: 'FDA clears Apple Watch algorithm for detecting hypertension', publisher: 'Cardiovascular Business', kind: 'Trade press', url: 'https://cardiovascularbusiness.com/topics/clinical/hypertension/fda-clears-apple-watch-algorithm-detecting-hypertension' },
      { id: 'guard-af', title: 'GUARD-AF: wearable heart monitor increases diagnoses of atrial fibrillation', publisher: 'European Society of Cardiology', kind: 'Medical society', url: 'https://www.escardio.org/news/press/press-releases/Wearable-heart-monitor-increases-diagnoses-of-common-heart-rhythm-disorder-by-50/' },
    ],
  },

  eyes: {
    key: 'eyes',
    name: 'Eyes',
    kicker: 'Retinal imaging',
    lede:
      'The retina is the only place where blood vessels and nerve tissue can be seen directly without an incision. That makes it one of the most natural targets for image-based AI.',
    signals: [
      { name: 'Fundus photograph', detail: 'Colour image of the retina taken with a retinal camera', origin: 'clinical' },
      { name: 'Optical coherence tomography', detail: 'Cross-sectional scan of the retinal layers', origin: 'clinical' },
    ],
    uses: [
      {
        title: 'Autonomous screening for diabetic retinopathy',
        product: 'LumineticsCore (formerly IDx-DR)',
        status: 'FDA-authorised, April 2018: the first AI device to detect diabetes-related eye problems',
        body:
          'The software analyses retinal photographs taken in primary care and returns one of two results without a specialist reading the image: refer to an eye-care professional for more-than-mild diabetic retinopathy, or rescreen in 12 months.',
        stats: [
          { value: '900', label: 'patients at 10 primary-care sites in the pivotal study', source: 'acp-2018' },
          { value: '87.4% / 89.5%', label: 'sensitivity / specificity for more-than-mild diabetic retinopathy', source: 'acp-2018' },
        ],
      },
    ],
    limits: [
      { text: 'It answers one question: is more-than-mild diabetic retinopathy present? It does not screen for glaucoma, macular degeneration or other eye disease.' , source: 'acp-2018' },
      { text: 'It is not for people with prior eye laser, surgery or injections, persistent vision loss, known macular oedema or advanced retinopathy, nor in pregnancy.', source: 'acp-2018' },
      { text: 'Wearables have no validated role in retinal screening today.' },
    ],
    sources: [
      { id: 'acp-2018', title: 'First AI device approved to detect diabetes-related eye problems', publisher: 'ACP Diabetes Monthly', kind: 'Medical society', url: 'https://diabetes.acponline.org/archives/2018/05/11/6.htm' },
      { id: 'dd-pivotal', title: 'Pivotal trial of an autonomous AI-based diagnostic system for detection of diabetic retinopathy in primary care offices', publisher: 'npj Digital Medicine (via Digital Diagnostics)', kind: 'Manufacturer', url: 'https://www.digitaldiagnostics.com/resources/papers-and-trials/lumineticscore-formerly-known-as-idx-dr-pivotal-trial/' },
    ],
  },

  brain: {
    key: 'brain',
    name: 'Brain',
    kicker: 'Imaging and time',
    lede:
      'In stroke, every minute counts. The clearest role for AI today is speed: spotting a blocked artery on a scan and alerting the specialist who can remove it.',
    signals: [
      { name: 'CT and CT angiography', detail: 'Emergency imaging of the brain and its arteries', origin: 'clinical' },
      { name: 'MRI', detail: 'Detailed imaging of brain tissue', origin: 'clinical' },
      { name: 'Sleep and activity patterns', detail: 'Collected by watches and rings; research interest, little clinical use yet', origin: 'consumer' },
    ],
    uses: [
      {
        title: 'Stroke triage',
        product: 'Viz.AI Contact',
        status: 'FDA De Novo, February 2018: created the computer-aided triage category',
        body:
          'The software analyses CT images for a suspected large-vessel occlusion and sends a text alert to a neurovascular specialist. The specialist still reviews the images on a clinical workstation.',
        stats: [
          { value: '300', label: 'CT studies in the retrospective study, compared with two trained neuroradiologists', source: 'fda-viz' },
        ],
      },
    ],
    limits: [
      { text: 'Triage is not diagnosis: the software prioritises and notifies, and a specialist makes the call.', source: 'fda-viz' },
      { text: 'Wearables do not detect stroke. Sudden face drooping, arm weakness or speech difficulty needs emergency services, not an app.' },
    ],
    sources: [
      { id: 'fda-viz', title: 'FDA permits marketing of clinical decision support software for alerting providers of a potential stroke', publisher: 'U.S. Food and Drug Administration', kind: 'Regulator', url: 'https://www.fda.gov/news-events/press-announcements/fda-permits-marketing-clinical-decision-support-software-alerting-providers-potential-stroke' },
    ],
  },

  lungs: {
    key: 'lungs',
    name: 'Lungs and sleep',
    kicker: 'Oxygen · breathing · imaging',
    lede:
      'Millions of wrists measure breathing every night. In 2024 the first wearable feature to flag signs of sleep apnoea was authorised, while in hospital, imaging AI reads the chest.',
    signals: [
      { name: 'Blood oxygen (SpO2)', detail: 'Optical estimate from the wrist or finger', origin: 'consumer' },
      { name: 'Breathing disturbances in sleep', detail: 'Patterns over several nights used to flag sleep apnoea risk', origin: 'authorised-wearable' },
      { name: 'Respiratory rate', detail: 'Breaths per minute during sleep', origin: 'consumer' },
      { name: 'Pulse oximeter', detail: 'Medical-grade SpO2 used in clinics and at home', origin: 'clinical' },
      { name: 'Chest X-ray and CT', detail: 'Imaging read by radiologists, increasingly with AI support', origin: 'clinical' },
    ],
    uses: [
      {
        title: 'Signs of obstructive sleep apnoea',
        product: 'Samsung Galaxy Watch sleep apnoea feature',
        status: 'FDA De Novo, February 2024',
        body:
          'For adults aged 22 and over without a previous diagnosis. The watch looks for signs of moderate-to-severe obstructive sleep apnoea across two nights of more than four hours’ sleep within ten days.',
        stats: [],
      },
      {
        title: 'Imaging AI',
        product: 'Radiology algorithms',
        status: 'The largest category of FDA-authorised AI devices',
        body:
          'Most AI medical devices authorised by the FDA work on medical images, including chest X-ray and CT, where they help detect, measure and prioritise findings.',
        stats: [
          { value: '1,000+', label: 'imaging-specific algorithms among about 1,250 authorised clinical AI algorithms (mid-2025 count)', source: 'cvb-count' },
        ],
      },
    ],
    limits: [
      { text: 'The apnoea feature is not intended to replace diagnosis by a clinician, nor to help clinicians diagnose sleep disorders.', source: 'aasm-samsung' },
      { text: 'Optical oxygen readings can be affected by skin pigmentation, poor circulation, skin temperature, tobacco use and nail polish. FDA advises not to rely on a pulse oximeter alone.', source: 'fda-oximeter' },
    ],
    sources: [
      { id: 'aasm-samsung', title: 'Samsung Galaxy Watch sleep apnea feature receives FDA authorization', publisher: 'American Academy of Sleep Medicine', kind: 'Medical society', url: 'https://aasm.org/samsung-galaxy-watch-sleep-apnea-feature-receives-fda-authorization/' },
      { id: 'fda-oximeter', title: 'Pulse oximeters', publisher: 'U.S. Food and Drug Administration', kind: 'Regulator', url: 'https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters' },
      { id: 'cvb-count', title: 'Cardiology still No. 2 in FDA-cleared clinical AI algorithms, trailing only radiology', publisher: 'Cardiovascular Business', kind: 'Trade press', url: 'https://cardiovascularbusiness.com/topics/artificial-intelligence/cardiology-still-no-2-fda-cleared-clinical-ai-algorithms-trailing-only-radiology' },
    ],
  },

  blood: {
    key: 'blood',
    name: 'Blood and metabolism',
    kicker: 'Continuous glucose',
    lede:
      'Glucose used to be a finger-prick snapshot. Continuous sensors now stream it every few minutes, and in 2024 the first one sold without a prescription was cleared.',
    signals: [
      { name: 'Interstitial glucose (CGM)', detail: 'A sensor just under the skin reads glucose in the fluid between cells, continuously', origin: 'authorised-wearable' },
      { name: 'Laboratory panels', detail: 'HbA1c, lipids and other blood tests', origin: 'clinical' },
      { name: '“Non-invasive” glucose watches', detail: 'No smartwatch or ring is authorised to measure glucose on its own', origin: 'consumer' },
    ],
    uses: [
      {
        title: 'Over-the-counter continuous glucose monitoring',
        product: 'Dexcom Stelo',
        status: 'FDA cleared, March 2024: the first over-the-counter CGM',
        body:
          'For adults aged 18 and over who do not use insulin, including people with diabetes on oral medicines and people without diabetes who want to see how food and exercise affect their glucose. Readings reach the app every 15 minutes.',
        stats: [],
      },
    ],
    limits: [
      { text: 'Stelo is not for people with problematic hypoglycaemia: it does not alert to dangerously low glucose. FDA advises against medical decisions based on it without a healthcare professional.', source: 'fda-stelo' },
      { text: 'FDA has warned not to use smartwatches or rings that claim to measure glucose without piercing the skin. Wrong readings can lead to wrong medication doses.', source: 'fda-glucose-watch' },
      { text: 'Sensors read interstitial fluid, not blood, so values can lag behind rapid changes.' },
    ],
    sources: [
      { id: 'fda-stelo', title: 'FDA clears first over-the-counter continuous glucose monitor', publisher: 'U.S. Food and Drug Administration', kind: 'Regulator', url: 'https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor' },
      { id: 'fda-glucose-watch', title: 'Do not use smartwatches or smart rings to measure blood glucose levels', publisher: 'U.S. Food and Drug Administration', kind: 'Regulator', url: 'https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication' },
    ],
  },
};
