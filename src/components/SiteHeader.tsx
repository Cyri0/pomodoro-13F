type SiteHeaderProps = {
  onHelp: () => void
}

export function SiteHeader({ onHelp }: SiteHeaderProps) {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="Little Timer – főoldal">
        <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
        <span>little<span className="brand-light">timer</span></span>
      </a>
      <span className="topbar-note"><span className="status-dot" /> Egy kis segítség az elmélyült munkához</span>
      <button className="help-button" onClick={onHelp}>
        Használat <span aria-hidden="true">?</span>
      </button>
    </header>
  )
}
