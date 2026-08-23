import { useState } from 'react'
import { useGame } from '../store/gameStore.js'

function fmtWealth(w) {
  if (!w) return '—'
  return `${w.galleons ?? 0}加隆 ${w.sickles ?? 0}西可 ${w.knuts ?? 0}纳特`
}

function Row({ k, v }) {
  return (
    <div className="srow">
      <span className="skey">{k}</span>
      <span className="sval">{v ?? '—'}</span>
    </div>
  )
}

function toRating(v) {
  if (typeof v === 'number') return v
  if (v == null || v === '') return 0
  const n = Number(v)
  if (!Number.isNaN(n)) return n
  // 兼容旧文字存档
  const s = String(v)
  if (/无|不会|未|没有/.test(s)) return 0
  if (/入门|新手|初学|基础/.test(s)) return 1
  if (/普通|一般|尚可/.test(s)) return 2
  if (/良好|熟练|不错|中等/.test(s)) return 3
  if (/优秀|精通|高手|出色/.test(s)) return 4
  if (/大师|顶尖|传奇|神话|宗师/.test(s)) return 5
  return 2
}

function StarRating({ value }) {
  const v = Math.max(0, Math.min(5, toRating(value)))
  // 每 0.2 分 = 1 个菱形（1 分 = 5 个菱形 = 一颗完整五角星）
  const filled = Math.round(v * 5)
  const groups = []
  for (let g = 0; g < 5; g++) {
    const diamonds = []
    for (let d = 0; d < 5; d++) {
      const idx = g * 5 + d
      diamonds.push(
        <span key={d} className={idx < filled ? 'diamond-filled' : 'diamond-empty'}>
          ◆
        </span>,
      )
    }
    groups.push(
      <span key={g} className="diamond-group">
        {diamonds}
      </span>,
    )
  }
  return <span className="star-rating">{groups}</span>
}

function AbilityRow({ k, v }) {
  return (
    <div className="srow">
      <span className="skey">{k}</span>
      <span className="sval">
        <StarRating value={v} />
      </span>
    </div>
  )
}

const TABS = [
  { id: 'life', label: '人生' },
  { id: 'magic', label: '魔法' },
  { id: 'social', label: '社会' },
  { id: 'chapters', label: '目录' },
  { id: 'world', label: '世界' },
]

export default function StatusPanel() {
  const state = useGame((s) => s.state)
  const character = useGame((s) => s.character)
  const scrollToMessage = useGame((s) => s.scrollToMessage)
  const [tab, setTab] = useState('life')

  if (!state) return null

  const renderTab = () => {
    switch (tab) {
      case 'life':
        return (
          <>
            <Row k="时间" v={state.time} />
            <Row k="年龄" v={state.age} />
            <Row k="姓名" v={state.name} />
            <Row k="血统" v={state.bloodline} />
            <Row k="身份" v={state.identity} />
            <Row k="所在地" v={state.location} />
            <Row k="职业" v={state.profession} />
            <Row k="财富" v={fmtWealth(state.wealth)} />
            <Row k="家庭" v={state.family} />
            <Row k="社会地位" v={state.socialStatus} />
            <Row k="声望" v={state.reputation} />
            <AbilityRow k="魔法能力" v={state.magicAbility} />
            <AbilityRow k="战斗能力" v={state.combatAbility} />
            <AbilityRow k="魔药/治疗" v={state.potionHealing} />
            <Row k="当前目标" v={state.goal} />
          </>
        )
      case 'magic':
        return (
          <>
            <Row k="魔杖" v={state.wand} />
            <Row k="魔力容量" v={state.magicCapacity} />
            <Row k="控制精度" v={state.control} />
            <Row k="魔法亲和" v={state.affinity} />
            <Row k="主修科目" v={state.mainSubjects} />
            <Row k="魔药水平" v={state.potionLevel} />
            <Row k="大脑封闭术" v={state.occlumency} />
            <Row k="幻影移形" v={state.apparition} />
            <Row k="守护神形态" v={state.patronus} />
            <div className="srow srow-col">
              <span className="skey">已掌握魔咒</span>
              <span className="sval">
                {Array.isArray(state.spells) && state.spells.length
                  ? state.spells.join('、')
                  : '—'}
              </span>
            </div>
          </>
        )
      case 'social':
        return (
          <>
            <Row k="所属势力" v={state.faction} />
            <div className="srow srow-col">
              <span className="skey">技能</span>
              <span className="sval">
                {Array.isArray(state.skills) && state.skills.length ? state.skills.join('、') : '—'}
              </span>
            </div>
            <div className="sdivider">关键人物</div>
            {Array.isArray(state.relations) && state.relations.length ? (
              state.relations.map((r, i) => (
                <div key={i} className="srow srow-col relation">
                  <span className="skey">{r.name}</span>
                  <span className="sval">
                    关系：{r.relation || '—'} · 信任：{r.trust || '—'}
                  </span>
                </div>
              ))
            ) : (
              <div className="sval">暂无</div>
            )}
          </>
        )
      case 'world':
        return (
          <>
            <div className="sdivider">重大事件</div>
            {Array.isArray(state.worldEvents) && state.worldEvents.length ? (
              state.worldEvents.map((e, i) => (
                <div key={i} className="srow srow-col">
                  <span className="sval">· {e}</span>
                </div>
              ))
            ) : (
              <div className="sval">暂无</div>
            )}
            <div className="sdivider">传闻</div>
            {Array.isArray(state.rumors) && state.rumors.length ? (
              state.rumors.map((r, i) => (
                <div key={i} className="srow srow-col">
                  <span className="sval">· {r}</span>
                </div>
              ))
            ) : (
              <div className="sval">暂无</div>
            )}
            <div className="sdivider">性格内核</div>
            <Row k="关键词" v={character?.traits} />
            <Row k="模拟风格" v={character?.styleLabel} />
          </>
        )
      case 'chapters':
        return (
          <>
            {Array.isArray(state.chapters) && state.chapters.length ? (
              state.chapters.map((c, i) => (
                <div
                  key={i}
                  className={'chapter-item' + (c.msgIndex != null ? ' chapter-clickable' : '')}
                  onClick={() => {
                    if (c.msgIndex != null) scrollToMessage(c.msgIndex)
                  }}
                >
                  <div className="chapter-title">
                    {c.time && <span className="chapter-time">{c.time}</span>}
                    <span>{c.title}</span>
                  </div>
                  {c.summary && <div className="chapter-summary">{c.summary}</div>}
                </div>
              ))
            ) : (
              <div className="sval">暂无节点。重要的人生转折会被记录在这里。</div>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="statuspanel">
      <div className="stabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={'stab' + (tab === t.id ? ' stab-active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="sbody">{renderTab()}</div>
    </div>
  )
}
