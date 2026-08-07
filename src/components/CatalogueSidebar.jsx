import { FileText, Image as ImageIcon, Search, X } from 'lucide-react'

function getImageUrl(image) {
  return image ? `${import.meta.env.BASE_URL}${image}` : null
}

export default function CatalogueSidebar({
  subjects,
  visibleSubjects,
  selectedId,
  query,
  classFilter,
  searchRef,
  onQueryChange,
  onClassFilterChange,
  onSelect,
  onKeyDown,
  isMobileOpen,
  onCloseMobile,
}) {
  const classes = ['All', ...new Set(subjects.map((subject) => subject.objectClass))]

  return (
    <aside className={`catalogue-sidebar${isMobileOpen ? ' catalogue-sidebar--open' : ''}`} aria-label="SCP catalogue">
      <div className="catalogue-heading">
        <div>
          <p className="eyebrow">DIRECTORY</p>
          <h2>Subject records</h2>
        </div>
        <button className="icon-button sidebar-close" type="button" onClick={onCloseMobile} aria-label="Close catalogue">
          <X size={19} />
        </button>
      </div>

      <label className="search-field">
        <span className="sr-only">Search SCP records</span>
        <Search size={18} aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search records..."
          autoComplete="off"
        />
        <kbd>/</kbd>
      </label>

      <div className="filter-group" aria-label="Filter by object class">
        {classes.map((name) => (
          <button
            key={name}
            className={classFilter === name ? 'filter-button filter-button--active' : 'filter-button'}
            type="button"
            aria-pressed={classFilter === name}
            onClick={() => onClassFilterChange(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="results-count" aria-live="polite">
        {visibleSubjects.length} {visibleSubjects.length === 1 ? 'record' : 'records'} available
      </p>

      <div className="record-list" role="listbox" aria-label="Available subject records" onKeyDown={onKeyDown}>
        {visibleSubjects.map((subject) => {
          const imageUrl = getImageUrl(subject.image)
          const isSelected = selectedId === subject.id
          return (
            <button
              key={subject.id}
              className={`record-card${isSelected ? ' record-card--active' : ''}`}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(subject.id)}
            >
              <span className="record-thumb">
                {imageUrl ? <img src={imageUrl} alt="" /> : <FileText size={20} aria-hidden="true" />}
              </span>
              <span className="record-card__body">
                <span className="record-card__topline">
                  <strong>{subject.id}</strong>
                  <span className={`class-dot class-dot--${subject.objectClass.toLowerCase()}`} />
                </span>
                <span className="record-class">{subject.objectClass} class</span>
                <span className="record-summary">{subject.summary}</span>
                <span className="record-meta">
                  {subject.image && <><ImageIcon size={12} aria-hidden="true" /> Visual file</>}
                  {!subject.image && <><FileText size={12} aria-hidden="true" /> Text file</>}
                </span>
              </span>
            </button>
          )
        })}

        {visibleSubjects.length === 0 && (
          <div className="empty-state">
            <Search size={22} aria-hidden="true" />
            <strong>No matching records</strong>
            <span>Try another subject number or clear the filter.</span>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <span>NODE 07</span>
        <span>5 FILES INDEXED</span>
      </div>
    </aside>
  )
}
