import { useState } from 'react'
import {
  ERAS,
  BLOODLINES,
  ORIGINS,
  TALENTS,
  HOUSES,
  POLITICS,
  STYLES,
  LOCATIONS,
  INITIAL_SKILLS,
  DEFAULT_WANDS,
  DEFAULT_AGE,
} from '../config/gameConfig.js'
import { useGame } from '../store/gameStore.js'
import LiquidGlass from './LiquidGlass.jsx'

const findLabel = (list, id) => list.find((o) => o.id === id)?.label || id

function OptionGroup({ label, options, value, onChange, hint }) {
  return (
    <div className="field">
      <div className="field-label">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </div>
      <div className="options">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            className={'opt' + (value === o.id ? ' opt-active' : '')}
            onClick={() => onChange(o.id)}
            title={o.desc || ''}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <input
        className="text-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function MultiSelect({ label, options, value, onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id))
    else onChange([...value, id])
  }
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="options">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            className={'opt' + (value.includes(o) ? ' opt-active' : '')}
            onClick={() => toggle(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function AgeField({ value, onChange }) {
  return (
    <div className="field">
      <div className="field-label">年龄</div>
      <div className="age-row">
        {DEFAULT_AGE.map((a) => (
          <button
            type="button"
            key={a.value}
            className={'opt' + (value === a.value ? ' opt-active' : '')}
            onClick={() => onChange(a.value)}
          >
            {a.label}
          </button>
        ))}
        <input
          className="text-input age-input"
          type="number"
          min="1"
          max="120"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 11)}
        />
      </div>
    </div>
  )
}

export default function StartupScreen() {
  const startGame = useGame((s) => s.startGame)

  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: 11,
    era: 'second_war',
    bloodline: 'muggleborn',
    origin: 'wizard_family',
    location: '伦敦',
    family: '',
    skills: [],
    talent: 'normal',
    wand: '',
    house: 'auto',
    politics: 'neutral',
    traits: '',
    goal: '',
    style: 'mixed',
  })

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const canStart = form.name.trim().length > 0

  const submit = () => {
    if (!canStart) return
    const character = {
      name: form.name.trim(),
      gender: form.gender.trim() || '未定',
      age: form.age,
      era: form.era,
      eraLabel: findLabel(ERAS, form.era),
      bloodline: form.bloodline,
      bloodlineLabel: findLabel(BLOODLINES, form.bloodline),
      identity: form.origin,
      identityLabel: findLabel(ORIGINS, form.origin),
      location: form.location,
      family: form.family.trim(),
      skills: form.skills,
      talent: form.talent,
      talentLabel: findLabel(TALENTS, form.talent),
      wand: form.wand.trim() || (form.talent === 'squib' ? '无' : '由系统生成'),
      house: form.house,
      houseLabel: findLabel(HOUSES, form.house),
      politics: form.politics,
      politicsLabel: findLabel(POLITICS, form.politics),
      traits: form.traits.trim(),
      goal: form.goal.trim(),
      style: form.style,
      styleLabel: findLabel(STYLES, form.style),
    }
    startGame(character)
  }

  return (
    <div className="startup">
      <header className="startup-header">
        <h1>哈利·波特 · 魔法纪元</h1>
        <p className="subtitle">魔法世界沙盘 · 超高自由度人生模拟器</p>
        <p className="note">你不是"大难不死的男孩"。你只是这个魔法世界里出生的一个人。</p>
      </header>

      <div className="startup-body">
        <div className="form-grid">
          <TextField label="姓名 *" value={form.name} onChange={set('name')} placeholder="你的名字" />
          <TextField label="性别" value={form.gender} onChange={set('gender')} placeholder="如：男 / 女 / 其他" />
          <AgeField value={form.age} onChange={set('age')} />

          <OptionGroup label="时代" options={ERAS} value={form.era} onChange={set('era')} />
          <OptionGroup label="血统 / 出身" options={BLOODLINES} value={form.bloodline} onChange={set('bloodline')} />
          <OptionGroup label="出生身份" options={ORIGINS} value={form.origin} onChange={set('origin')} />

          <div className="field">
            <div className="field-label">出生地 / 居住地</div>
            <div className="options">
              {LOCATIONS.map((l) => (
                <button
                  type="button"
                  key={l}
                  className={'opt' + (form.location === l ? ' opt-active' : '')}
                  onClick={() => set('location')(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <TextField label="家庭状况" value={form.family} onChange={set('family')} placeholder="留空则由系统生成" />

          <MultiSelect label="初始技能" options={INITIAL_SKILLS} value={form.skills} onChange={set('skills')} />

          <OptionGroup label="魔法资质" options={TALENTS} value={form.talent} onChange={set('talent')} />

          <div className="field">
            <div className="field-label">魔杖（留空由系统生成）</div>
            <div className="options">
              {DEFAULT_WANDS.map((w) => (
                <button
                  type="button"
                  key={w}
                  className={'opt' + (form.wand === w ? ' opt-active' : '')}
                  onClick={() => set('wand')(w)}
                >
                  {w}
                </button>
              ))}
            </div>
            <input
              className="text-input"
              value={form.wand}
              onChange={(e) => set('wand')(e.target.value)}
              placeholder="或手动输入：木材·杖芯·长度·弹性"
            />
          </div>

          <OptionGroup label="学院倾向" options={HOUSES} value={form.house} onChange={set('house')} />
          <OptionGroup label="初始政治倾向" options={POLITICS} value={form.politics} onChange={set('politics')} />

          <TextField
            label="性格关键词"
            value={form.traits}
            onChange={set('traits')}
            placeholder="三个词，如：好奇 · 固执 · 善良"
          />
          <TextField
            label="初始人生目标"
            value={form.goal}
            onChange={set('goal')}
            placeholder="一句话，如：成为一名魔药师"
          />

          <OptionGroup label="模拟风格" options={STYLES} value={form.style} onChange={set('style')} />
        </div>

        <div className="start-btn-wrap">
          <LiquidGlass
            onClick={canStart ? submit : undefined}
            cornerRadius={999}
            padding="14px 52px"
            style={{ position: 'absolute', top: '50%', left: '50%' }}
          >
            <span className={canStart ? 'start-btn-text' : 'start-btn-text start-btn-disabled'}>
              {canStart ? '穿过魔法世界的经纬' : '请先输入姓名'}
            </span>
          </LiquidGlass>
        </div>
      </div>
    </div>
  )
}
