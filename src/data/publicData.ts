export interface TrackInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: 'Cpu' | 'Coins' | 'ShieldCheck' | 'Activity' | 'Sparkles';
  challenges: string[];
  ideas: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: 'General' | 'Participation' | 'Teams' | 'Logistics';
}

export const EVENT_DETAILS = {
  name: 'VERTOTHON 2026',
  tagline: '36 Hours of Engineering Excellence & Technological Innovation',
  organizer: 'Vertofi Private Limited',
  year: '2026',
  dates: 'November 14-15, 2026',
  datesStatus: 'Proposed',
  location: 'Hyderabad, India',
  locationStatus: 'Proposed',
  format: 'In-Person, 36 hours',
  capacity: 'Up to 1,000 participants',
  capacityStatus: 'Target',
  fee: 'Free of cost',
  unconfirmedNotice: 'Event dates, venue, and capacity are proposed targets and subject to confirmation.',
};

export const HACKATHON_TRACKS: TrackInfo[] = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    tagline: 'Autonomous agents, multimodal intelligence, and domain workflows',
    description:
      'Leverage modern language models, computer vision, and neural reasoning to solve real-world productivity, workflow automation, and specialized domain challenges.',
    iconName: 'Cpu',
    challenges: [
      'Autonomous multi-agent systems for enterprise automation',
      'Local/edge AI models with low latency execution',
      'Multimodal retrieval and domain-specific semantic search',
    ],
    ideas: [
      'Intelligent code review and vulnerability detection assistant',
      'Automated medical report digestion and summarization tool',
      'Real-time meeting synthesis with action-item execution agents',
    ],
  },
  {
    id: 'web3',
    name: 'Web3 & Decentralized Systems',
    tagline: 'Verifiable compute, zero-knowledge proofs, and decentralized infra',
    description:
      'Build open protocols, verifiable systems, and decentralized applications designed for high performance, cryptography-backed trust, and decentralized data integrity.',
    iconName: 'ShieldCheck',
    challenges: [
      'Zero-knowledge proof verification pipelines',
      'Decentralized identity and verifiable credential management',
      'Cross-chain interoperability with cryptographic security guarantees',
    ],
    ideas: [
      'ZK-based privacy-preserving credential verification system',
      'Decentralized event ticket escrow with anti-scalping proofs',
      'Trustless data availability verification network',
    ],
  },
  {
    id: 'fintech',
    name: 'FinTech & Payments Infrastructure',
    tagline: 'Next-generation payment rails, fraud defense, and financial telemetry',
    description:
      'Reinvent financial infrastructure, intelligent risk assessment, real-time settlement rails, and automated compliance auditing for modern markets.',
    iconName: 'Coins',
    challenges: [
      'Real-time fraud and anomaly detection algorithms',
      'Cross-border algorithmic settlement rails with audit logs',
      'Automated regulatory compliance validation pipelines',
    ],
    ideas: [
      'Predictive fraud scoring engine with low-latency streaming analytics',
      'Self-reconciling ledger pipeline with automated discrepancy detection',
      'Micro-invoicing platform with verifiable payment receipts',
    ],
  },
  {
    id: 'healthtech',
    name: 'HealthTech & Bio-Informatics',
    tagline: 'Digital diagnostics, patient telemetry, and clinical operations',
    description:
      'Tackle critical healthcare bottlenecks using secure data engineering, clinical workflow automation, preventive analytics, and accessible diagnostic tools.',
    iconName: 'Activity',
    challenges: [
      'Privacy-preserving healthcare record exchange (HIPAA/GDPR-ready)',
      'Remote vitals telemetry streaming and alert triage',
      'Clinical workflow optimization and appointment load balancing',
    ],
    ideas: [
      'AI triage assistant for rural clinics with offline-first support',
      'Synthetic patient medical records generator for secure ML training',
      'Wearable telemetry anomaly detector for elder care monitoring',
    ],
  },
  {
    id: 'open-innovation',
    name: 'Open Innovation',
    tagline: 'Moonshot breakthroughs across sustainability, robotics, and civic tech',
    description:
      'Unconstrained category for ambitious prototypes tackling sustainability, climate modeling, robotics, smart cities, and public digital goods.',
    iconName: 'Sparkles',
    challenges: [
      'Climate telemetry and resource conservation tracking',
      'Smart civic infrastructure and public transportation telemetry',
      'Educational technology for distributed and accessible learning',
    ],
    ideas: [
      'Decentralized disaster response coordination dashboard',
      'Smart grid telemetry balancer for distributed solar installations',
      'Collaborative offline mesh emergency communications portal',
    ],
  },
];

export const FAQ_LIST: FaqItem[] = [
  {
    question: 'What is VERTOTHON 2026?',
    answer:
      'VERTOTHON 2026 is an in-person, 36-hour technology hackathon organized by Vertofi Private Limited. The event brings together software engineers, product thinkers, designers, and students to build innovative solutions across 5 targeted tracks.',
    category: 'General',
  },
  {
    question: 'Who can participate in VERTOTHON 2026?',
    answer:
      'Participation is open to undergraduate and graduate students, recent alumni, working professionals, and independent builders. Applicants undergo a review process to ensure high-quality participation and venue safety.',
    category: 'Participation',
  },
  {
    question: 'Is there a registration fee or payment required?',
    answer:
      'No. Participation in VERTOTHON 2026 is completely free of cost. Payment processing is disabled across the platform. Selected participants receive access to the hacking venue, meals, high-speed connectivity, and mentor sessions.',
    category: 'Participation',
  },
  {
    question: 'How do teams work? Can I register individually?',
    answer:
      'You can register individually or with a team. Teams can consist of 1 to 4 members. If you register solo, you will have access to the platform team directory to connect with other approved participants before hacking commences.',
    category: 'Teams',
  },
  {
    question: 'Are the event dates and venue confirmed?',
    answer:
      'The proposed dates are November 14-15, 2026, in Hyderabad, India. These details are currently pending final logistical sign-off and venue clearances. All registered participants will receive timely updates once dates and venue arrangements are locked.',
    category: 'Logistics',
  },
  {
    question: 'What is the project submission and evaluation process?',
    answer:
      'Teams work throughout the 36-hour build window and submit their project repository, short demonstration video, and documentation before the code freeze deadline. Projects are reviewed against a clear 4-criteria rubric: Innovation & Originality, Technical Execution, Real-World Impact, and User Experience.',
    category: 'General',
  },
  {
    question: 'What do I need to bring to the in-person event?',
    answer:
      'Bring your laptop, charger, required hardware peripherals, valid government or institutional photo ID, and personal essentials. High-speed Wi-Fi, power outlets, meals, beverages, and rest areas will be provided on-site.',
    category: 'Logistics',
  },
  {
    question: 'Will hardware prototypes be allowed?',
    answer:
      'Yes! Hardware and IoT projects are welcome under any relevant track (such as Open Innovation or HealthTech). Please bring your own microcontroller boards, sensors, and safety equipment.',
    category: 'General',
  },
  {
    question: 'What rules and conduct guidelines apply?',
    answer:
      'All participants, mentors, judges, and organizers must adhere strictly to the VERTOTHON 2026 Code of Conduct. We maintain a zero-tolerance policy against harassment, discrimination, or intellectual property theft.',
    category: 'Participation',
  },
  {
    question: 'How will intellectual property and ownership work?',
    answer:
      'You and your team retain 100% full ownership and intellectual property rights of any software, design, or hardware created during VERTOTHON 2026.',
    category: 'General',
  },
];
