import { ChevronLeft, ChevronRight, Clipboard, Files, Menu, ShieldAlert, Wifi } from 'lucide-react'
import { useState } from 'react'

function getImageUrl(image) {
  return image ? `${import.meta.env.BASE_URL}${image}` : null
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function SubjectRecord({ subject, onOpenCatalogue, previousSubject, nextSubject, onSelect }) {
  const [copyLabel, setCopyLabel] = useState('Copy record link')
  const imageUrl = getImageUrl(subject.image)

  const copyRecordLink = async () => {
    const link = `${window.location.href.split('#')[0]}#${subject.slug}`
    try {
      await navigator.clipboard.writeText(link)
      setCopyLabel('Link copied')
    } catch {
      setCopyLabel('Record selected')
    }
    window.setTimeout(() => setCopyLabel('Copy record link'), 1800)
  }

  return (
    <main className="record-pane" id="record-content" tabIndex="-1">
      <div className="mobile-record-bar">
        <button type="button" className="catalogue-toggle" onClick={onOpenCatalogue}>
          <Menu size={18} aria-hidden="true" /> Catalogue
        </button>
        <span>{subject.id}</span>
      </div>

      <div className="classification-banner" role="note">
        <span><ShieldAlert size={15} aria-hidden="true" /> CLASSIFIED MATERIAL</span>
        <span>UNAUTHORISED ACCESS IS PROHIBITED</span>
      </div>

      <article className="record-document">
        <header className="record-hero">
          <div className="record-hero__content">
            <p className="record-index">SECURE FILE / {subject.id.replace('SCP-', '')}</p>
            <h1>{subject.id}</h1>
            <p className="record-subtitle">Anomalous subject containment record</p>

            <div className="record-badges">
              <span className={`object-badge object-badge--${subject.objectClass.toLowerCase()}`}>
                <span className="badge-label">OBJECT CLASS</span>
                {subject.objectClass.toUpperCase()}
              </span>
              <span className="object-badge object-badge--status">
                <span className="badge-label">STATUS</span>
                <Wifi size={14} aria-hidden="true" /> {subject.status}
              </span>
            </div>

            <button className="copy-button" type="button" onClick={copyRecordLink}>
              <Clipboard size={15} aria-hidden="true" /> {copyLabel}
            </button>
          </div>

          <div className={`subject-visual${imageUrl ? '' : ' subject-visual--generated'}`}>
            {imageUrl ? (
              <img src={imageUrl} alt={`Archive image for ${subject.id}`} />
            ) : (
              <div className="generated-visual" aria-label={`No archive image available for ${subject.id}`}>
                <span className="generated-visual__ring" />
                <span className="generated-visual__code">{subject.id.replace('SCP-', '')}</span>
                <span className="generated-visual__label">VISUAL DATA REDACTED</span>
              </div>
            )}
            <span className="visual-caption">ARCHIVE VISUAL // {subject.image ? 'VERIFIED' : 'REDACTED'}</span>
          </div>
        </header>

        <div className="record-stat-strip" aria-label="Record statistics">
          <div><span>SECTIONS</span><strong>{subject.sectionCount.toString().padStart(2, '0')}</strong></div>
          <div><span>WORD COUNT</span><strong>{subject.recordLength.toLocaleString()}</strong></div>
          <div><span>ACCESS</span><strong>LEVEL 4</strong></div>
          <div><span>INTEGRITY</span><strong>100%</strong></div>
        </div>

        <nav className="section-index" aria-label="Sections in this record">
          <span className="section-index__label"><Files size={15} aria-hidden="true" /> FILE INDEX</span>
          <div className="section-index__links">
            {subject.sections.map((section, index) => (
              <a key={`${section.title}-${index}`} href={`#section-${slugify(section.title)}-${index}`}>
                {String(index + 1).padStart(2, '0')} {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="record-sections">
          {subject.sections.map((section, sectionIndex) => (
            <section key={`${section.title}-${sectionIndex}`} id={`section-${slugify(section.title)}-${sectionIndex}`}>
              <div className="section-heading">
                <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
                <div>
                  <p>DOCUMENT SECTION</p>
                  <h2>{section.title}</h2>
                </div>
              </div>
              <div className="section-copy">
                {section.content.map((paragraph, paragraphIndex) => {
                  const isNumberedList = /^1\. /.test(paragraph) && paragraph.includes('\n2. ')
                  if (isNumberedList) {
                    const items = paragraph.split('\n').map((item) => item.replace(/^\d+\.\s*/, ''))
                    return (
                      <ol key={paragraphIndex}>
                        {items.map((item) => <li key={item}>{item}</li>)}
                      </ol>
                    )
                  }
                  const isRedacted = paragraph === '[DATA EXPUNGED]'
                  return <p key={paragraphIndex} className={isRedacted ? 'redacted-line' : ''}>{paragraph}</p>
                })}
              </div>
            </section>
          ))}
        </div>

        <nav className="record-navigation" aria-label="Move between subject records">
          <button type="button" onClick={() => onSelect(previousSubject.id)}>
            <ChevronLeft size={18} aria-hidden="true" />
            <span><small>PREVIOUS FILE</small>{previousSubject.id}</span>
          </button>
          <span className="record-navigation__counter">{subject.id.replace('SCP-', '')} / 006</span>
          <button type="button" onClick={() => onSelect(nextSubject.id)}>
            <span><small>NEXT FILE</small>{nextSubject.id}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </nav>

        <footer className="document-footer">
          <span>SCP FOUNDATION SECURE ARCHIVE</span>
          <span>COMP.6210 · USER INTERFACE DESIGN</span>
        </footer>
      </article>
    </main>
  )
}
