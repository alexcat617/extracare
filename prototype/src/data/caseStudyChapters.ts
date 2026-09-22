/** GitHub blob base for in-story doc links. Use polish until this work is on main. */
export const CASE_STUDY_REPO_BASE = 'https://github.com/alexcat617/extracare/blob/polish/'

export const CASE_STUDY_REPO_ROOT = 'https://github.com/alexcat617/extracare'

export const CASE_STUDY_AUTHOR = 'UX case study by Alex Farrell'

export type CaseStudyLink = {
  label: string
  /** Path appended to CASE_STUDY_REPO_BASE, or full URL if absolute. */
  path: string
}

export type CaseStudySection = {
  title: string
  bullets: string[]
}

export type CaseStudyChapter = {
  id: string
  eyebrow: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  sections?: CaseStudySection[]
  callout?: { title: string; body: string }
  links?: CaseStudyLink[]
}

export const CASE_STUDY_CHAPTERS: CaseStudyChapter[] = [
  {
    id: 'about',
    eyebrow: 'Portfolio',
    title: 'About this prototype',
    paragraphs: [
      'CVS Marketplace is an independent case-study feature imagined inside the CVS Health app: members buy, sell, and trade personalized coupons with official transfer—not a CVS product or legal submission.',
      'The markdown in this git repo is the source of truth. The clickable React prototype is an executable rendering of those docs. If it is not in the docs, it is not in the product.',
      'The prototype was implemented entirely in Cursor. Product design lives in documentation; Cursor built the UI against that contract—not a Figma-to-engineering handoff.',
    ],
    callout: {
      title: 'Human in the loop',
      body: 'I’m the last step: after Cursor implements a FEAT, I click through the prototype and apply UX judgment—refining UI, copy, and flow until it feels right and meets usability standards.',
    },
    links: [
      { label: 'Project README', path: 'README.md' },
      { label: 'Project wiki', path: 'docs/WIKI.md' },
    ],
  },
  {
    id: 'problem',
    eyebrow: 'Problem',
    title: "Deals that don't fit",
    paragraphs: [
      "ExtraCare members get flooded with personalized offers, but most go unused. Either the deal doesn't match what they're buying, the rules are too complicated, or they've already bought the item cheaper elsewhere.",
    ],
    callout: {
      title: 'The gap at checkout',
      body: 'Informal sharing at the register—using someone else’s ExtraCare—is awkward and does not scale. The job is to get the right offer to the person who will actually redeem it, with CVS still in control of the transfer.',
    },
    links: [{ label: 'Concept', path: 'CONCEPT.md' }],
  },
  {
    id: 'solution',
    eyebrow: 'Solution',
    title: 'CVS Marketplace',
    paragraphs: [
      'Members buy, sell, and trade coupons in Savings—with CVS handling every transfer.',
    ],
    sections: [
      {
        title: 'What members can do',
        bullets: [
          'Browse — Shop listings from other members, alongside your own coupons.',
          'Buy — Claim a listed offer; paid deals stay protected until the handoff finishes.',
          'Sell — Post unused On card coupons with a suggested price.',
          'Trade — Swap offers when another member has what you need.',
        ],
      },
      {
        title: 'What CVS gets',
        bullets: [
          'Coupons reach shoppers who will use them instead of expiring in the wallet.',
          'Increased basket size per user equals more sales volume.',
          'Competitive pricing helps CVS keep sales that might otherwise go to larger stores.',
          'Builds ExtraCare loyalty—members see real value in the program, not coupons they will never use.',
        ],
      },
    ],
    links: [
      { label: 'Concept', path: 'CONCEPT.md' },
      { label: 'PRD', path: 'PRD-cvs-coupon-marketplace.md' },
    ],
  },
  {
    id: 'maps',
    eyebrow: 'Method',
    title: 'Flow maps, not screen lists',
    paragraphs: [
      'The prototype is built from flow maps—each one is the blueprint for a feature. A screen list only asks how many pages to ship; a map asks what must happen at every step, including declines and errors, so build stays on-spec and nothing important gets skipped.',
    ],
    callout: {
      title: 'Personas shaped the maps',
      body: 'Jordan and Sam are the human lens—maps and requirements stay aligned with real members, not abstract screens.',
    },
    links: [
      { label: 'Maps index', path: 'features/maps/README.md' },
      { label: 'Buy & browse map', path: 'features/maps/FEAT-01-map.md' },
      { label: 'App design (maps, not inventory)', path: 'APP.md' },
    ],
  },
  {
    id: 'azure-git',
    eyebrow: 'Process',
    title: 'Structured features, protected code',
    paragraphs: [
      'Features are structured like Azure DevOps work items, but written directly into the repo as Markdown files instead of using an external tracker. Every feature package is self-contained—including target outcomes, user personas, acceptance criteria, and handoff maps—allowing me to review project scope without sifting through code or Figma designs.',
      'The project rolls out in staged releases—each phase adds capability without rewriting what shipped before.',
    ],
    callout: {
      title: 'Protected main',
      body: 'To keep the project safe, documentation and code stay in one place. Each feature gets its own Git branch so automated AI agents cannot silently alter the product. Branches are only merged into main when acceptance criteria are met, ensuring the primary working demo remains stable and any bad generation can be quickly reverted instead of breaking the prototype.',
    },
    links: [
      { label: 'Work item template', path: 'docs/work-item-template.md' },
      { label: 'Features index', path: 'FEATURES.md' },
      { label: 'Git workflow', path: 'docs/GIT-WORKFLOW.md' },
    ],
  },
  {
    id: 'explore',
    eyebrow: 'Your turn',
    title: 'Step into the prototype',
    paragraphs: [],
    callout: {
      title: 'Ready to jump in?',
      body: 'Thanks so much for exploring! If you ever want a clean slate during the demo, just tap the purple Reset button at the bottom-left. From there, you can jump back Home, refresh your sample coupons, or head straight to the Marketplace.',
    },
    links: [
      { label: 'Demo controls', path: 'docs/DEMO-CONTROLS.md' },
      { label: 'View repository', path: CASE_STUDY_REPO_ROOT },
    ],
  },
]
