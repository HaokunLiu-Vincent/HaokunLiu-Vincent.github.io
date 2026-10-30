export type Locale = 'en' | 'zh';
export type ProjectId = 'agentic-commerce' | 'recommendation-pipeline';
export type ProjectPage = 'caseStudy' | 'pipelineStudy';
export type Page = 'home' | 'projects' | 'about' | 'contact' | ProjectPage;
export interface FocusArea { title: string; description: string; tags: string[] }
export interface EducationEntry {
  degree: string; university: string; location: string; specialization?: string; status?: string;
}
export interface ProjectContent {
  id: ProjectId; page: ProjectPage; number: string;
  name: string; summary: string; category: string; status: string; tags: string[];
  overview: string; overviewText: string; description: string[]; scopeLabel: string; scope: string[];
  evidenceNote: string; architecture: string; architectureNote: string;
  diagramLabel: string; input: string; output: string; feedback: string;
  labels: { architecture: string; methods: string; evaluation: string; deployment: string; systemDesign: string; proposed: string };
  stages: { title: string; detail: string }[];
  methods: string; methodsIntro: string;
  methodItems: { title: string; description: string; detail: string }[];
  evaluation: string; evaluationIntro: string; metric: string; purpose: string; result: string; pending: string;
  metrics: { name: string; purpose: string; result: string }[];
  protocolTitle: string; protocol: string;
  deployment: string; deploymentText: string; deploymentItems: string[];
  nextTitle: string; nextText: string; nextItems: string[];
}
export interface Copy {
  language: string;
  nav: Record<'home' | 'projects' | 'about' | 'contact', string>;
  common: {
    skip: string; language: string; mainNav: string; footerNav: string;
    viewProjects: string; aboutMe: string; viewCase: string; allProjects: string;
    contact: string; github: string; repositoryPending: string; backProjects: string;
    builtWith: string; footerNote: string; top: string; missing: string; socialImageAlt: string;
  };
  seo: Record<Page, { title: string; description: string }>;
  home: {
    eyebrow: string; title: string[]; intro: string; focusLabel: string;
    featured: string; featuredNote: string; approach: string; approachTitle: string;
    focus: FocusArea[]; ctaTitle: string; ctaText: string;
  };
  project: { eyebrow: string; title: string; intro: string; moreTitle: string; moreText: string };
  projects: ProjectContent[];
  about: {
    eyebrow: string; title: string; intro: string; education: string; educationItems: EducationEntry[];
    interests: string; interestItems: FocusArea[]; experience: string; experienceTitle: string;
    experienceText: string; experienceFields: string[]; direction: string;
    directionText: string; roles: string[];
  };
  contact: {
    eyebrow: string; title: string; intro: string; availability: string;
    links: { key: 'email' | 'github' | 'linkedin'; title: string; description: string; placeholder: string }[];
    note: string;
  };
  notFound: { title: string; text: string; link: string };
}
