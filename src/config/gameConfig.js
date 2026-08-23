// 角色创建的全部选项数据（对应启动界面）

export const ERAS = [
  { id: 'founder', label: '霍格沃茨建校早期' },
  { id: 'witchhunt', label: '中世纪猎巫时期' },
  { id: 'grindelwald', label: '格林德沃崛起时代' },
  { id: 'first_war', label: '第一次巫师战争' },
  { id: 'second_war', label: '第二次巫师战争' },
  { id: 'postwar', label: '战后重建时代' },
  { id: 'modern', label: '现代巫师社会' },
  { id: 'custom', label: '自定义时代' },
]

export const BLOODLINES = [
  { id: 'muggleborn', label: '麻瓜出身', desc: '父母都是麻瓜，11岁才收到录取通知书。缺人脉背景，纯血主义者眼中地位低下。' },
  { id: 'halfblood', label: '混血巫师', desc: '父母一方巫师一方麻瓜。能力未必弱，社会地位因家族而异。' },
  { id: 'pure_side', label: '纯血旁支', desc: '纯血家族非核心成员。有姓氏便利，也背家族期望与偏见。' },
  { id: 'sacred28', label: '神圣二十八族', desc: '古老纯血谱系。拥有土地、财富、人脉与政治影响力。' },
  { id: 'squib', label: '哑炮', desc: '巫师家庭出身但无法施魔法。能看见魔法世界，却施展不了咒语。' },
  { id: 'obscurial', label: '默然者（高风险）', desc: '压抑魔法能力诞生的危险黑暗力量。几乎活不到成年，极高风险。' },
  { id: 'veela', label: '混血媚娃', desc: '拥有魅惑能力，也面临严重偏见。' },
  { id: 'werewolf', label: '狼人', desc: '月圆之夜变身，就业与社交受到歧视。' },
  { id: 'halfgiant', label: '半巨人', desc: '体格远超常人，常被排斥。' },
  { id: 'muggle', label: '麻瓜家庭', desc: '纯麻瓜，毫无魔法背景。' },
  { id: 'custom', label: '自定义', desc: '输入你自己的血统设定。' },
]

export const ORIGINS = [
  { id: 'wizard_family', label: '普通巫师家庭' },
  { id: 'muggle_family', label: '麻瓜家庭' },
  { id: 'orphan', label: '孤儿' },
  { id: 'fallen_pure', label: '纯血没落家族' },
  { id: 'rich_pure', label: '纯血豪门' },
  { id: 'ministry_family', label: '魔法部官员家庭' },
  { id: 'auror_family', label: '傲罗家庭' },
  { id: 'professor_family', label: '教授家庭' },
  { id: 'goblin_contract', label: '古灵阁妖精契约相关' },
  { id: 'healer_family', label: '圣芒戈治疗师家庭' },
  { id: 'custom', label: '自定义' },
]

export const TALENTS = [
  { id: 'squib', label: '哑炮无魔法天赋' },
  { id: 'normal', label: '普通' },
  { id: 'good', label: '良好' },
  { id: 'excellent', label: '优秀' },
  { id: 'special', label: '特殊资质', desc: '易容马格斯 / 蛇佬腔 / 预言天分 / 变形天赋 / 大脑封闭术天赋' },
  { id: 'random', label: '随机' },
]

export const HOUSES = [
  { id: 'auto', label: '系统判定' },
  { id: 'gryffindor', label: '格兰芬多' },
  { id: 'slytherin', label: '斯莱特林' },
  { id: 'ravenclaw', label: '拉文克劳' },
  { id: 'hufflepuff', label: '赫奇帕奇' },
  { id: 'none', label: '未入学/成年/其他学校' },
]

export const POLITICS = [
  { id: 'equality', label: '血统平等' },
  { id: 'pure_conservative', label: '纯血保守' },
  { id: 'neutral', label: '中立投机' },
  { id: 'order', label: '凤凰社支持' },
  { id: 'death_eater', label: '食死徒同情' },
  { id: 'independent', label: '自由独立' },
]

export const STYLES = [
  { id: 'realistic', label: '极度现实' },
  { id: 'adventure', label: '经典校园冒险' },
  { id: 'epic', label: '史诗巫师战争' },
  { id: 'dark', label: '黑暗奇幻' },
  { id: 'slice_of_life', label: '日常人生' },
  { id: 'mixed', label: '混合模式' },
]

export const LOCATIONS = ['伦敦', '戈德里克山谷', '霍格莫德', '对角巷附近', '蜘蛛尾巷', '国外（法国）', '国外（美国）', '国外（其他）']

export const INITIAL_SKILLS = [
  '魔药基础',
  '魔法史知识',
  '魁地奇天分',
  '社交口才',
  '黑市人脉',
  '草药识别',
  '决斗直觉',
  '古代魔文',
  '算术占卜',
  '照顾神奇生物',
  '无特别技能',
]

export const DEFAULT_WANDS = [
  '冬青木·凤凰羽毛·11英寸·柔韧',
  '紫杉木·龙心弦·12英寸·坚硬',
  '葡萄藤木·独角兽毛·10英寸·柔韧',
  '黑檀木·龙心弦·13英寸·坚硬',
  '樱桃木·独角兽毛·9英寸·柔韧',
]

export const DEFAULT_AGE = [
  { value: 11, label: '11岁·入学' },
  { value: 17, label: '17岁·成年' },
  { value: 20, label: '20岁·初入社会' },
]

// 初始状态模板（角色创建后生成，作为 state 的起点）
export function buildInitialState(character) {
  return {
    time: character.eraLabel || '未定年代',
    age: character.age,
    name: character.name,
    gender: character.gender,
    bloodline: character.bloodlineLabel || character.bloodline,
    identity: character.identityLabel || '待定',
    location: character.location,
    profession: '无',
    wealth: { galleons: 0, sickles: 0, knuts: 0 },
    family: character.family || '待定',
    socialStatus: '待定',
    magicAbility: 1,
    combatAbility: 1,
    potionHealing: 1,
    skills: character.skills || [],
    reputation: '默默无闻',
    relations: [],
    faction: '无',
    goal: character.goal || '尚未确定',
    worldEvents: [],
    rumors: [],
    chapters: [],
    summary: '',
    summarizedCount: 0,
  }
}

export function buildMagicState(character) {
  if (character.talent === 'squib') {
    return { wand: '无', magicCapacity: '无', control: '无', affinity: '无', mainSubjects: '无', spells: [], potionLevel: '无', occlumency: '无', apparition: '无', patronus: '无' }
  }
  return {
    wand: character.wand || '未获得',
    magicCapacity: '待定',
    control: '待定',
    affinity: character.talentLabel || '待定',
    mainSubjects: '待定',
    spells: [],
    potionLevel: '待定',
    occlumency: '待定',
    apparition: '待定',
    patronus: '待定',
  }
}
