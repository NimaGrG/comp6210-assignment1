import { Radio, ShieldCheck } from 'lucide-react'
import FoundationMark from './FoundationMark'

export default function AppHeader() {
  return (
    <header className="app-header">
      <a className="skip-link" href="#record-content">Skip to subject record</a>
      <div className="brand-lockup">
        <FoundationMark />
        <div>
          <p className="brand-kicker">SCP FOUNDATION</p>
          <p className="brand-title">Secure Catalogue</p>
        </div>
      </div>

      <div className="header-actions" aria-label="System information">
        <span className="status-chip">
          <Radio size={14} aria-hidden="true" />
          <span className="status-dot" />
          ARCHIVE ONLINE
        </span>
        <span className="clearance-chip">
          <ShieldCheck size={14} aria-hidden="true" /> LEVEL 4
        </span>
      </div>
    </header>
  )
}
