'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Moon, Wind, Droplets, Flame, Sparkles } from 'lucide-react';
import BottomNav from '@/app/h5/_components/BottomNav';

/**
 * 道之光 · H5 每日运势页面
 * 基于八字排盘 + 当日干支的运势分析
 */

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const SHI_CHEN = [
  { name: '子时', start: '23:00', end: '00:59', index: 0 },
  { name: '丑时', start: '01:00', end: '02:59', index: 1 },
  { name: '寅时', start: '03:00', end: '04:59', index: 2 },
  { name: '卯时', start: '05:00', end: '06:59', index: 3 },
  { name: '辰时', start: '07:00', end: '08:59', index: 4 },
  { name: '巳时', start: '09:00', end: '10:59', index: 5 },
  { name: '午时', start: '11:00', end: '12:59', index: 6 },
  { name: '未时', start: '13:00', end: '14:59', index: 7 },
  { name: '申时', start: '15:00', end: '16:59', index: 8 },
  { name: '酉时', start: '17:00', end: '18:59', index: 9 },
  { name: '戌时', start: '19:00', end: '20:59', index: 10 },
  { name: '亥时', start: '21:00', end: '22:59', index: 11 },
];

function getDayGanzhi(date: Date): { heavenly: string; earthly: string; full: string } {
  const ref = new Date(2000, 0, 1);
  const diff = Math.round((date.getTime() - ref.getTime()) / 86400000);
  return {
    heavenly: TIAN_GAN[((diff % 10) + 10) % 10],
    earthly: DI_ZHI[((diff % 12) + 12) % 12],
    full: `${TIAN_GAN[((diff % 10) + 10) % 10]}${DI_ZHI[((diff % 12) + 12) % 12]}`,
  };
}

function getCurrentShichen(): { name: string; start: string; end: string; index: number } {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const totalMinutes = h * 60 + m;
  for (const sc of SHI_CHEN) {
    const [sh, sm] = sc.start.split(':').map(Number);
    const [eh, em] = sc.end.split(':').map(Number);
    let startMins = sh * 60 + sm;
    let endMins = eh * 60 + em;
    if (endMins < startMins) endMins += 1440;
    if (totalMinutes >= startMins && totalMinutes < endMins) return sc;
  }
  return SHI_CHEN[0];
}

const LUNAR_ZH_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

function getLunarDate(date: Date): string {
  const ref = new Date(2024, 0, 1);
  const diff = Math.round((date.getTime() - ref.getTime()) / 86400000);
  const lunarDay = (20 + diff) % 30 || 30;
  return LUNAR_ZH_DAYS[lunarDay - 1] || `${lunarDay}日`;
}

type FortuneCategory = 'overall' | 'career' | 'wealth' | 'love' | 'health';

const FORTUNE_DESCRIPTIONS: Record<string, { emoji: string; text: string }> = {
  overall: { emoji: '⭐', text: '总运' },
  career: { emoji: '💼', text: '事业' },
  wealth: { emoji: '💰', text: '财运' },
  love: { emoji: '💕', text: '感情' },
  health: { emoji: '💪', text: '健康' },
};

function generateDailyFortune(baziData: any, dayGanzhi: string): {
  scores: Record<FortuneCategory, { score: number; level: string; desc: string }>;
  yiList: string[];
  jiList: string[];
  advice: string;
} {
  const now = new Date();
  const h = now.getHours();
  const isEvening = h >= 17 || h < 5;

  const baseScore = baziData?.strength?.strengthScore || 50;
  const yongShen = baziData?.usefulGod?.yongShen || [];
  const percentages = baziData?.elementBalance?.percentage || {};

  const gan = dayGanzhi[0];
  const ganWuxing: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  const todayWuxing = ganWuxing[gan] || '土';
  const dayMaster = baziData?.dayMaster || '甲';
  const isLucky = yongShen.includes(todayWuxing);

  const scores: Record<FortuneCategory, { score: number; level: string; desc: string }> = {
    overall: { score: 0, level: '', desc: '' },
    career: { score: 0, level: '', desc: '' },
    wealth: { score: 0, level: '', desc: '' },
    love: { score: 0, level: '', desc: '' },
    health: { score: 0, level: '', desc: '' },
  };

  const getLevel = (s: number) => s >= 80 ? '大吉' : s >= 65 ? '吉' : s >= 50 ? '中平' : s >= 35 ? '小凶' : '大凶';

  scores.overall = {
    score: isLucky ? 65 + Math.min(20, baseScore / 5) : 45 + Math.min(15, baseScore / 8),
    level: '',
    desc: `日主${dayMaster}${isLucky ? `，今日${todayWuxing}为用神日，运势偏好` : `，今日${todayWuxing}非用神，宜静不宜动`}`,
  };
  scores.overall.level = getLevel(scores.overall.score);

  scores.career = { score: Math.min(95, 50 + (isLucky ? 20 : 0) + (percentages['金'] || 0) / 5), level: '', desc: isLucky ? '事业运佳，利决策、谈判' : '宜守不宜攻，稳扎稳打' };
  scores.career.level = getLevel(scores.career.score);

  scores.wealth = { score: Math.min(95, 45 + (percentages['金'] || 0) / 4 + (percentages['水'] || 0) / 6), level: '', desc: isEvening ? '晚间财运较旺' : '正财稳健，偏财谨慎' };
  scores.wealth.level = getLevel(scores.wealth.score);

  scores.love = { score: Math.min(95, 50 + (percentages['木'] || 0) / 5 + (percentages['火'] || 0) / 6), level: '', desc: '感情需沟通，多倾听少争执' };
  scores.love.level = getLevel(scores.love.score);

  scores.health = { score: Math.min(95, 55 + (percentages['木'] || 0) / 6), level: '', desc: `注意${todayWuxing === '火' ? '心脑血管' : todayWuxing === '水' ? '肾脏泌尿' : todayWuxing === '木' ? '肝胆' : todayWuxing === '金' ? '呼吸系统' : '脾胃'}保养` };
  scores.health.level = getLevel(scores.health.score);

  const allYi: string[] = [];
  const allJi: string[] = [];

  if (isLucky) {
    allYi.push('决策签约', '拜访贵人', '学习进修', '开张启市');
  } else {
    allYi.push('整理内务', '静心修养', '梳理计划');
  }
  allYi.push(isEvening ? '酉时（17-19点）行重要事宜' : '午时（11-13点）行重要事宜');
  allYi.push(`面向${yongShen.length ? ['东', '南', '西', '北', '中'][['木', '火', '金', '水', '土'].indexOf(yongShen[0])] || '中' : '南'}方工作`);

  if (!isLucky) allJi.push('重大投资', '与人争执', '远行', '频繁社交');
  else allJi.push('过度消费', '轻信他人', '熬夜');

  const advicePiece = `今日为${gan}${dayGanzhi[1]}日，五行${todayWuxing}${isLucky ? '，与您日主相合，诸事可行。' : '，与您日主略有冲克，宜守不宜攻。'}当前${getCurrentShichen().name}，建议${isEvening ? '回顾今日、规划明日' : '集中精力处理要务'}。`;

  return { scores, yiList: allYi.slice(0, 5), jiList: allJi.slice(0, 4), advice: advicePiece };
}

export default function FortunePage() {
  const [baziData, setBaziData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<FortuneCategory>('overall');

  useEffect(() => {
    const stored = sessionStorage.getItem('dzs_bazi_result');
    if (stored) {
      try { setBaziData(JSON.parse(stored)); } catch {}
    }
  }, []);

  const now = new Date();
  const dayGanzhi = getDayGanzhi(now);
  const shichen = getCurrentShichen();
  const fortune = generateDailyFortune(baziData, dayGanzhi.full);
  const currentScore = fortune.scores[activeCategory];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#111827] to-[#0a0e17] text-[#e2e8f0]">
      <header className="sticky top-0 z-10 bg-[#0a0e17]/80 backdrop-blur-lg border-b border-[#1e293b]">
        <div className="flex items-center gap-3 px-4 h-12">
          <a href="/" className="text-[#94a3b8] hover:text-[#f59e0b] transition-colors">
            <ArrowLeft size={20} />
          </a>
          <h1 className="text-sm font-semibold">每日运势</h1>
          <span className="text-[10px] text-[#64748b] ml-auto">
            {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日
          </span>
        </div>
      </header>

      <div className="px-4 pt-4 pb-24 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#0f1525] to-[#1a2332] border border-[#1e293b] p-5">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-bold text-[#f59e0b]">{dayGanzhi.full}日</div>
              <div className="text-xs text-[#64748b] mt-1">
                农历{getLunarDate(now)} · {shichen.name}
              </div>
            </div>
            <div className="text-right">
              {baziData ? (
                <div className="text-xs text-[#94a3b8]">
                  日主{baziData.dayMaster}
                  <span className={`ml-1 ${baziData.strength?.bodyStrength === '身强' ? 'text-[#2ECC71]' : 'text-[#f59e0b]'}`}>
                    · {baziData.strength?.bodyStrength || ''}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-[#64748b]">未排盘</div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-6 text-center">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" strokeWidth="6"
                strokeDasharray={`${(fortune.scores[activeCategory]?.score / 100) * 327} 327`}
                strokeLinecap="round" className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {fortune.scores[activeCategory]?.score || 0}
              </div>
              <div className="text-[10px] text-[#64748b]">{fortune.scores[activeCategory]?.level || ''}</div>
            </div>
          </div>
          <div className="text-sm font-medium text-[#e2e8f0]">
            {FORTUNE_DESCRIPTIONS[activeCategory]?.text || '总运'}
          </div>
          <div className="text-xs text-[#64748b] mt-1">
            {fortune.scores[activeCategory]?.desc || ''}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(FORTUNE_DESCRIPTIONS) as [FortuneCategory, { emoji: string; text: string }][]).map(([key, val]) => {
            const score = fortune.scores[key]?.score || 0;
            const level = fortune.scores[key]?.level || '';
            const isActive = key === activeCategory;
            const color = level === '大吉' || level === '吉' ? '#2ECC71' : level === '中平' ? '#f59e0b' : '#E74C3C';
            return (
              <button key={key} onClick={() => setActiveCategory(key)}
                className={`rounded-xl py-2 text-center border transition-all ${isActive ? 'bg-[#f59e0b]/10 border-[#f59e0b]/20' : 'bg-[#1a2332] border-[#2a3a4e]'}`}>
                <div className="text-lg">{val.emoji}</div>
                <div className="text-[10px] text-[#64748b]">{val.text}</div>
                <div className="text-xs font-bold mt-0.5" style={{ color }}>{score}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold mb-3 text-[#2ECC71]">宜</h3>
            <div className="space-y-2">
              {fortune.yiList.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[#2ECC71] shrink-0">✅</span>
                  <span className="text-[#e2e8f0]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold mb-3 text-[#E74C3C]">忌</h3>
            <div className="space-y-2">
              {fortune.jiList.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[#E74C3C] shrink-0">❌</span>
                  <span className="text-[#e2e8f0]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#0f1525] to-[#1a2332] border border-[#f59e0b]/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#f59e0b]" />
            <h3 className="text-xs font-semibold text-[#f59e0b]">AI改运建议</h3>
          </div>
          <p className="text-sm text-[#e2e8f0] leading-relaxed">{fortune.advice}</p>
          <div className="mt-2 text-xs text-[#64748b]">
            当前时辰：{shichen.name}（{shichen.start}-{shichen.end}）
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#4a5a6e]">
            {baziData ? '基于您的八字排盘结果分析' : '排盘后运势分析更精准'}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
