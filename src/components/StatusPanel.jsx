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
            <Row k="魔法能力" v={state.magicAbility} />
            <Row k="战斗能力" v={state.combatAbility} />
            <Row k="魔药/治疗" v={state.potionHealing} />
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
                <div key={i} className="chapter-item">
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
