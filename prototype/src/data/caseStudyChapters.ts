/** GitHub blob base for in-story doc links. Use polish until this work is on main. */
export const CASE_STUDY_REPO_BASE = 'https://github.com/alexcat617/extracare/blob/polish/'

export const CASE_STUDY_REPO_ROOT = 'https://github.com/alexcat617/extracare'

export const CASE_STUDY_AUTHOR = 'Alex — Product / UX case study'

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
      'ExtraCare Marketplace is an independent case-study feature imagined inside the CVS Health app: members buy, sell, and trade personalized coupons with official transfer—not a CVS product or legal submission.',
      'The markdown in this git repo is the source of truth. The clickable React prototype is an executable rendering of those docs. If it is not in the docs, it is not in the product.',
      'The prototype was implemented entirely in Cursor (Agent mode). Product design lives in documentation; Cursor built the UI against that contract—not a Figma-to-engineering handoff.',
    ],
    callout: {
      title: 'Docs → FEATs → git → Cursor',
      body: 'Product docs frame the work. Azure-shaped feature files and git branches protect scope. Cursor Agent implements against the written contract.',
    },
    links: [
      { label: 'Project README', path: 'README.md' },
      { label: 'Project wiki', path: 'docs/WIKI.md' },
    ],
  },
  {
    id: 'problem',
    eyebrow: 'Problem',
    title: 'Coupons that do not match the trip',
    paragraphs: [
      'ExtraCare members often get many personalized coupons per visit. Plenty expire unused: the offer does not fit the cart, the rules are confusing, or the shopper already compared the category to Amazon or Walmart.',
      'Informal sharing at the register—using someone else’s ExtraCare—is awkward and does not scale. The job is to get the right offer to the person who will actually redeem it, without turning checkout into a gray market.',
    ],
    links: [{ label: 'Concept', path: 'CONCEPT.md' }],
  },
  {
    id: 'solution',
    eyebrow: 'Solution',
    title: 'A marketplace CVS could mediate',
    paragraphs: [
      'ExtraCare members can list unused coupons in the app and buy, sell, or trade with other members—with CVS mediating transfer, not informal sharing at checkout.',
    ],
    sections: [
      {
        title: 'How it works',
        bullets: [
          'Members post unused offers in the marketplace for others to buy or trade.',
          'When a deal completes, the seller’s coupon is voided and the same offer is re-issued on the buyer’s account with a new transfer ID.',
          'Paid buys use escrow until the trade finishes. Ratings, limits, and dispute paths reduce fraud; shoppers do not share phone numbers at checkout as the product mechanic.',
        ],
      },
      {
        title: 'Why it benefits everyone',
        bullets: [
          'Fewer wasted coupons—discounts that would expire reach shoppers who will use them.',
          'Stronger baskets—matched offers make it more likely members add those categories to the trip.',
          'More app usage—members check CVS for deals instead of defaulting to Amazon or Walmart.',
          'Better loyalty—ExtraCare feels useful, not like a pile of irrelevant discounts in Savings.',
        ],
      },
    ],
    links: [
      { label: 'Concept', path: 'CONCEPT.md' },
      { label: 'PRD', path: 'PRD-cvs-coupon-marketplace.md' },
    ],
  },
  {
    id: 'people',
    eyebrow: 'People',
    title: 'Jordan lists. Sam buys.',
    paragraphs: [
      'Jordan (P1) is an overwhelmed regular who wants unused coupons off the wallet, with suggested pricing and a sense that listing is safe. Sam (P2) hunts a category before expiry, buys with escrow, and needs the offer on card before shopping.',
      'The core loop lives under Savings, not a new root tab: list from the wallet, browse Marketplace, buy or trade, then the offer lands in the buyer wallet with a transfer ID.',
    ],
    links: [
      { label: 'Personas', path: 'PERSONAS.md' },
      { label: 'App IA', path: 'APP.md' },
    ],
  },
  {
    id: 'maps',
    eyebrow: 'Method',
    title: 'Flow maps, not screen lists',
    paragraphs: [
      'This prototype is built from journey maps, not a screen inventory. Nodes are steps, decisions, and error branches—not “Screen 4B.” Layout comes after behavior is specified.',
      'A screen list optimizes for page coverage. Consent decline, escrow failure, and cross-feature exits (hub → buy vs wallet → sell) get cut or bolted on. An agent without a graph invents chrome.',
    ],
    bullets: [
      'Screen inventory = what pages exist.',
      'Flow map = what must be true for the user and system at each step.',
      'AI stays on-spec when the graph is in git and linked from the FEAT.',
    ],
    callout: {
      title: 'Why maps beat screens',
      body: 'A map includes the messy paths—decline, errors, and where one feature hands off to another. A screen list usually only shows the happy pages.',
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
    title: 'Azure-shaped features. Git as protection.',
    paragraphs: [
      'Features are framed like Azure DevOps work items—adapted into markdown in this repo, not hosted as an AzDO project. Each FEAT-XX is a package: outcome, persona lens, user stories, REQ IDs with flow trace, acceptance criteria, out of scope, decisions, and a map-first build handoff.',
      'A PM can review scope without opening Figma or code. Waves A–D are release slices: core marketplace, trade, seller ops and trust, then later loops documented even when they are not fully prototyped.',
      'Git protects delivery. Docs and prototype share one repo. main stays demoable. One branch per FEAT so an Agent session cannot silently rewrite the product. Merge when map nodes and AC pass. A bad generation is a revert, not a lost prototype.',
    ],
    callout: {
      title: 'What / when / how',
      body: 'Azure process framed the what (stories, AC, waves). Git protected the when (isolated FEAT branches, reversible commits). Cursor built the how.',
    },
    links: [
      { label: 'Work item template', path: 'docs/work-item-template.md' },
      { label: 'Features index', path: 'FEATURES.md' },
      { label: 'Git workflow', path: 'docs/GIT-WORKFLOW.md' },
    ],
  },
  {
    id: 'design',
    eyebrow: 'Design',
    title: 'CVS patterns present the maps',
    paragraphs: [
      'Visual design is the presentation layer of map nodes: coupon cards, Savings segments, blue primary pills, red savings amounts, white cards on gray, bottom sheets at a fixed 90dvh so buy/sell/trade steps do not jump height.',
      'Guardrails tell agents what they must and must not invent. Marketplace stays under Savings. No new root tab. No persona switcher in chrome. When look and behavior conflict, look follows DESIGN-GUARDRAILS; behavior follows FEAT, flow, and map.',
    ],
    links: [
      { label: 'Design guardrails', path: 'docs/DESIGN-GUARDRAILS.md' },
      { label: 'CVS UI patterns', path: 'docs/cvs-app-reference/UI-PATTERNS-AND-IA.md' },
    ],
  },
  {
    id: 'logic',
    eyebrow: 'Logic',
    title: 'Shared rules, then waves',
    paragraphs: [
      'FLOWS.md holds system truths every path must honor: official transfer (void + re-issue), escrow on paid buys, one active listing per entitlement, no browse barcodes as the product mechanic, ExtraCare before transactions.',
      'FLOW-00 is the consent gate. Decline is read-only browse; transactional CTAs reopen rules. Waves A–C are in the clickable prototype. Wave D (redeem, gift) is documented for “what’s next,” not fully built—on purpose.',
    ],
    links: [
      { label: 'Shared flows', path: 'FLOWS.md' },
      { label: 'FLOW-00 entry', path: 'flows/FLOW-00-marketplace-entry.md' },
      { label: 'Feature waves', path: 'FEATURES.md' },
    ],
  },
  {
    id: 'cursor',
    eyebrow: 'Build',
    title: 'Built entirely in Cursor',
    paragraphs: [
      'Every line of the prototype was produced through Cursor Agent, directed by the documentation layers—not a traditional design-to-dev handoff. AI did not design the product. Markdown holds the design. Cursor implemented it.',
      'Stack: React, Vite, Tailwind; mobile-first ~430px. One prototype store (listings, wallet, consent, escrow mock, tab IA). Multi-step journeys are BottomSheet flow hosts; each map node is a sheet step or gated segment. Seed data powers demo paths.',
      'A typical run: author docs and Azure-shaped FEATs, branch from demoable main, paste a FEAT-scoped prompt, let the workspace rule encode MUST/MUST NOT, then QA against AC and the map. Mismatch means fix docs or revert code.',
    ],
    bullets: [
      'build FEAT-01 + FEAT-02 — read map, implement nodes.',
      'Human owns intent, structure, and QA.',
      'Cursor owns implementation velocity against the contract.',
    ],
    links: [
      { label: 'Build prompts', path: 'docs/BUILD-PROMPTS.md' },
      { label: 'Cursor guardrails rule', path: '.cursor/rules/extracare-prototype.mdc' },
      { label: 'Wiki — how we build', path: 'docs/WIKI.md' },
    ],
  },
  {
    id: 'explore',
    eyebrow: 'Demo',
    title: 'Explore the prototype',
    paragraphs: [
      'Suggested path: accept Marketplace rules, browse listings, buy with escrow or list from On card. Use the Prototype pill (bottom-left) for Fresh start, Sam browse, Jordan listings, and other presets—no persona toggle in the app chrome.',
      'Close this story anytime. Start prototype opens Savings. The repo holds the docs, maps, and git history a PM or hiring manager can audit.',
    ],
    links: [
      { label: 'Demo controls', path: 'docs/DEMO-CONTROLS.md' },
      { label: 'View repository', path: CASE_STUDY_REPO_ROOT },
    ],
  },
]
