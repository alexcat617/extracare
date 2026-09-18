import { CASE_STUDY_REPO_BASE } from '../data/caseStudyChapters'

interface CaseStudyDocLinkProps {
  label: string
  path: string
}

function hrefFor(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const relative = path.replace(/^\//, '')
  const encoded = relative
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${CASE_STUDY_REPO_BASE}${encoded}`
}

export function CaseStudyDocLink({ label, path }: CaseStudyDocLinkProps) {
  return (
    <a
      href={hrefFor(path)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-cvs-gray-border bg-white px-3 py-2.5 text-left text-sm font-semibold text-cvs-blue"
    >
      <span>{label}</span>
      <span className="shrink-0 text-xs font-medium text-cvs-gray-muted" aria-hidden>
        ↗
      </span>
    </a>
  )
}
