import type { ReactNode } from 'react'

interface StudioLayoutProps {
  topBar: ReactNode
  main: ReactNode
  bottom: ReactNode
  sidebar: ReactNode
}

export function StudioLayout({ topBar, main, bottom, sidebar }: StudioLayoutProps) {
  return (
    <section className="studio-rack studio-rack-dark" aria-labelledby="studio-rack-heading">
      <div className="studio-rack-title">
        <p className="eyebrow">Prototype</p>
        <h2 id="studio-rack-heading">Studio Rack Redesign</h2>
        <p>Modular controls around the keyboard, shaped like a clean software instrument rather than a form.</p>
      </div>
      <div className="studio-rack-grid">
        <div className="studio-top-bar" aria-label="Studio control bar">{topBar}</div>
        <div className="studio-main-display">{main}</div>
        <aside className="studio-sidebar" aria-label="Studio context sidebar">{sidebar}</aside>
        <div className="studio-bottom-bar">{bottom}</div>
      </div>
    </section>
  )
}
