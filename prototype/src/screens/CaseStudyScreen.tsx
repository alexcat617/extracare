import { useEffect, useRef, useState } from 'react'
import { CaseStudyDocLink } from '../components/CaseStudyDocLink'
import { OutlineButton, PrimaryButton } from '../components/BottomSheet'
import {
  CASE_STUDY_AUTHOR,
  CASE_STUDY_CHAPTERS,
  CASE_STUDY_REPO_ROOT,
} from '../data/caseStudyChapters'

interface CaseStudyScreenProps {
  onClose: () => void
  onStart: () => void
}

const CHAPTER_COUNT = CASE_STUDY_CHAPTERS.length

export function CaseStudyScreen({ onClose, onStart }: CaseStudyScreenProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastIndex = CHAPTER_COUNT - 1
  const [visibleChapter, setVisibleChapter] = useState(1)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    const sections = [...root.querySelectorAll('[data-case-study-chapter]')]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const idx = visible?.target.getAttribute('data-case-study-chapter')
        if (idx) setVisibleChapter(Number(idx))
      },
      { root, threshold: 0.45 },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex justify-center bg-black/40">
      <div
        className="flex h-full w-full max-w-[430px] flex-col bg-cvs-gray-bg shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
      >
      <header className="shrink-0 border-b border-cvs-gray-border bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-full px-2 text-sm font-semibold text-cvs-blue"
            aria-label="Close process story"
          >
            Close
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p id="case-study-title" className="text-xs font-semibold uppercase tracking-wide text-cvs-gray-muted">
              Portfolio
            </p>
            <p className="truncate text-[11px] text-cvs-gray-muted">Docs → FEATs → git → Cursor</p>
          </div>
          <p className="min-w-[3.5rem] text-right text-xs font-medium text-cvs-gray-muted" aria-live="polite">
            {visibleChapter} / {CHAPTER_COUNT}
          </p>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-cvs-gray-border" aria-hidden>
          <div
            className="h-full rounded-full bg-cvs-blue transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${(visibleChapter / CHAPTER_COUNT) * 100}%` }}
          />
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto motion-reduce:snap-none"
      >
        {CASE_STUDY_CHAPTERS.map((chapter, index) => {
          const isLast = index === lastIndex
          return (
            <section
              key={chapter.id}
              data-case-study-chapter={index + 1}
              className="flex min-h-[calc(100dvh-5.5rem)] snap-start flex-col px-4 py-5"
              aria-labelledby={`case-study-${chapter.id}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-cvs-blue">
                {index + 1} / {CHAPTER_COUNT} · {chapter.eyebrow}
              </p>
              <article className="mt-3 rounded-2xl border border-cvs-gray-border bg-white p-4 shadow-sm">
                <h2 id={`case-study-${chapter.id}`} className="text-xl font-bold leading-snug text-cvs-blue-dark">
                  {chapter.title}
                </h2>
                {index === 0 ? (
                  <p className="mt-1 text-sm font-medium text-cvs-gray-muted">{CASE_STUDY_AUTHOR}</p>
                ) : null}
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-800">
                  {chapter.paragraphs.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                {chapter.sections?.map((section) => (
                  <div key={section.title} className="mt-4">
                    <h3 className="text-sm font-semibold text-cvs-blue-dark">{section.title}</h3>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-800">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {chapter.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-800">
                    {chapter.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {chapter.callout ? (
                  <div className="mt-4 rounded-xl border border-cvs-blue/20 bg-cvs-blue/5 px-3 py-3">
                    <p className="text-sm font-semibold text-cvs-blue-dark">{chapter.callout.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-800">{chapter.callout.body}</p>
                  </div>
                ) : null}
                {chapter.links?.length ? (
                  <div className="mt-4 space-y-2">
                    {chapter.links.map((link) => (
                      <CaseStudyDocLink key={link.path} label={link.label} path={link.path} />
                    ))}
                  </div>
                ) : null}
              </article>
              {isLast ? (
                <div className="mt-auto space-y-3 pb-6 pt-6">
                  <PrimaryButton onClick={onStart}>Start prototype</PrimaryButton>
                  <OutlineButton onClick={onClose}>Close</OutlineButton>
                  <a
                    href={CASE_STUDY_REPO_ROOT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 text-center text-sm font-semibold text-cvs-blue"
                  >
                    View repository
                  </a>
                </div>
              ) : (
                <p className="mt-auto pb-4 pt-6 text-center text-xs text-cvs-gray-muted">Swipe up for next chapter</p>
              )}
            </section>
          )
        })}
      </div>
      </div>
    </div>
  )
}
