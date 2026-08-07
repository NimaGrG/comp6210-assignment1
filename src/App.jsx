import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from './components/AppHeader'
import CatalogueSidebar from './components/CatalogueSidebar'
import SubjectRecord from './components/SubjectRecord'

const DATA_URL = `${import.meta.env.BASE_URL}data/scp-subjects.json`

function LoadingState() {
  return (
    <main className="system-state" aria-live="polite">
      <LoaderCircle className="spin" size={28} aria-hidden="true" />
      <strong>Decrypting subject archive</strong>
      <span>Validating catalogue records...</span>
    </main>
  )
}

function ErrorState({ onRetry }) {
  return (
    <main className="system-state system-state--error" role="alert">
      <AlertTriangle size={30} aria-hidden="true" />
      <strong>Archive connection failed</strong>
      <span>The subject data could not be loaded.</span>
      <button type="button" onClick={onRetry}>Retry connection</button>
    </main>
  )
}

export default function App() {
  const [subjects, setSubjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [status, setStatus] = useState('loading')
  const [mobileCatalogueOpen, setMobileCatalogueOpen] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
  const searchRef = useRef(null)

  useEffect(() => {
    let active = true
    setStatus('loading')
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((records) => {
        if (!active) return
        const hashId = window.location.hash.replace('#scp-', 'SCP-')
        const initial = records.find((record) => record.id === hashId)?.id || records[0]?.id || ''
        setSubjects(records)
        setSelectedId(initial)
        setStatus('ready')
      })
      .catch(() => active && setStatus('error'))
    return () => { active = false }
  }, [retryToken])

  const visibleSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return subjects.filter((subject) => {
      const matchesClass = classFilter === 'All' || subject.objectClass === classFilter
      if (!matchesClass) return false
      if (!normalizedQuery) return true
      const searchableText = [
        subject.id,
        subject.objectClass,
        subject.summary,
        ...subject.sections.flatMap((section) => [section.title, ...section.content]),
      ].join(' ').toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [subjects, query, classFilter])

  useEffect(() => {
    if (visibleSubjects.length && !visibleSubjects.some((subject) => subject.id === selectedId)) {
      setSelectedId(visibleSubjects[0].id)
    }
  }, [visibleSubjects, selectedId])

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') setMobileCatalogueOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const selectSubject = (id) => {
    setSelectedId(id)
    setMobileCatalogueOpen(false)
    const subject = subjects.find((item) => item.id === id)
    if (subject) window.history.replaceState(null, '', `#${subject.slug}`)
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  const handleListKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !visibleSubjects.length) return
    event.preventDefault()
    const currentIndex = Math.max(0, visibleSubjects.findIndex((subject) => subject.id === selectedId))
    let nextIndex = currentIndex
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % visibleSubjects.length
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + visibleSubjects.length) % visibleSubjects.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = visibleSubjects.length - 1
    selectSubject(visibleSubjects[nextIndex].id)
  }

  if (status === 'loading') return <><AppHeader /><LoadingState /></>
  if (status === 'error') return <><AppHeader /><ErrorState onRetry={() => setRetryToken((value) => value + 1)} /></>

  const selectedSubject = subjects.find((subject) => subject.id === selectedId) || subjects[0]
  const selectedIndex = subjects.findIndex((subject) => subject.id === selectedSubject.id)
  const previousSubject = subjects[(selectedIndex - 1 + subjects.length) % subjects.length]
  const nextSubject = subjects[(selectedIndex + 1) % subjects.length]

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="workspace">
        <CatalogueSidebar
          subjects={subjects}
          visibleSubjects={visibleSubjects}
          selectedId={selectedSubject.id}
          query={query}
          classFilter={classFilter}
          searchRef={searchRef}
          onQueryChange={setQuery}
          onClassFilterChange={setClassFilter}
          onSelect={selectSubject}
          onKeyDown={handleListKeyDown}
          isMobileOpen={mobileCatalogueOpen}
          onCloseMobile={() => setMobileCatalogueOpen(false)}
        />
        {mobileCatalogueOpen && <button className="mobile-overlay" type="button" aria-label="Close catalogue" onClick={() => setMobileCatalogueOpen(false)} />}
        <SubjectRecord
          subject={selectedSubject}
          previousSubject={previousSubject}
          nextSubject={nextSubject}
          onSelect={selectSubject}
          onOpenCatalogue={() => setMobileCatalogueOpen(true)}
        />
      </div>
    </div>
  )
}
