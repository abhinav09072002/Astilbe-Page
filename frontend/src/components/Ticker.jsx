import React from 'react'

const ITEMS1 = ['Curated Intelligence','—','Weekly Deep Insights','—','Zero Noise Policy','—','Exclusive Access','—','Signal Over Noise','—','Think Ahead','—']
const ITEMS2 = ['Premium Editorial','—','Sharp Analysis','—','No Filler','—','Human Curation','—','Weekly Edition','—','Invite Only','—']

function Track({ items, reverse = false }) {
  const all = [...items, ...items]
  return (
    <div style={{ borderTop: '0.5px solid rgba(255,255,255,.06)', borderBottom: '0.5px solid rgba(255,255,255,.06)', padding: '11px 0', overflow: 'hidden', background: '#000' }}>
      <div className={`marquee-track${reverse ? ' rev' : ''}`}>
        {all.map((item, i) => (
          <span key={i} style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.14)', marginRight: 44, flexShrink: 0 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Ticker1() { return <Track items={ITEMS1} /> }
export function Ticker2() { return <Track items={ITEMS2} reverse /> }
