'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import BottomNav from '@/app/h5/_components/BottomNav';

/**
 * 道之光 · H5 九宫飞星页面
 * 洛书九宫 + 流年/流月/日飞星展示
 */

const PALACE_NAMES: Record<number, string> = {
  1: '坎宫', 2: '坤宫', 3: '震宫', 4: '巽宫',
  5: '中宫', 6: '乾宫', 7: '兑宫', 8: '艮宫', 9: '离宫',
};

const STAR_NAMES: Record<number, string> = {
  1: '贪狼', 2: '巨门', 3: '禄存', 4: '文曲',
  5: '廉贞', 6: '武曲', 7: '破军', 8: '左辅', 9: '右弼',
};

const STAR_TYPES: Record<number, string> = {
  1: '吉', 2: '凶', 3: '凶', 4: '吉',
  5: '大凶', 6: '吉', 7: '凶', 8: '吉', 9: '吉',
};

const STAR_WUXING: Record<number, string> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
};

const STAR_COLORS: Record<string, string> = {
  '吉': '#2ECC71', '凶': '#E74C3C', '大凶': '#C0392B',
};

function getNinePalace(year: number, month: number, day: number) {
  // 流年飞星入中：后天八卦数 = (年数) mod 9
  const yearBase = ((year + 6) % 9 + 9) % 9 || 9;
  // 流月飞星入中：子年起正月8，丑年起正月5，寅年2
  const monthOffsets: Record<number, number> = { 0: 8, 1: 5, 2: 2 };
  const yearGanzhi = (year - 4) % 12;
  const monthBase = (((monthOffsets[yearGanzhi % 3] || 8) + month - 1) % 9 + 9) % 9 || 9;
  // 日飞星：九星
  const dayBase = ((day + 3) % 9 + 9) % 9 || 9;

  // 飞星顺序：入中后按洛书轨迹飞布
  const luoshu = [5, 1, 3, 4, 9, 2, 6, 7, 8]; // 从5宫开始的经典顺序
  const positions = [
    { pos: 4, idx: 0 }, { pos: 9, idx: 1 }, { pos: 2, idx: 2 },
    { pos: 3, idx: 3 }, { pos: 5, idx: 4 }, { pos: 7, idx: 5 },
    { pos: 8, idx: 6 }, { pos: 1, idx: 7 }, { pos: 6, idx: 8 },
  ];

  function flyStar(base: number): Array<{ pos: number; star: number; name: string; type: string; wuxing: string }> {
    return positions.map(({ pos, idx }) => {
      const starNum = ((base - 1 + luoshu[idx] - 1) % 9 + 9) % 9 + 1;
      return {
        pos,
        star: starNum,
        name: STAR_NAMES[starNum] || '',
        type: STAR_TYPES[starNum] || '',
        wuxing: STAR_WUXING[starNum] || '',
      };
    });
  }

  return {
    year: flyStar(yearBase),
    month: flyStar(monthBase),
    day: flyStar(dayBase),
  };
}

function PalaceGrid({ palaces, title, colors }: { palaces: any[]; title: string; colors?: boolean }) {
  const grid = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 洛书九宫位置顺序
  return (
    <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
      <h3 className="text-xs font-semibold mb-3 text-[#94a3b8]">{title}</h3>
      <div className="grid grid-cols-3 gap-1.5 max-w-[300px] mx-auto">
        {grid.map((pos) => {
          const p = palaces.find((p: any) => p.pos === pos);
          if (!p) return <div key={pos} className="aspect-square rounded-lg bg-[#1a2332] border border-[#2a3a4e]" />;
          const typeColor = STAR_COLORS[p.type] || '#64748b';
          return (
            <div key={pos} className={`aspect-square rounded-lg bg-[#1a2332] border flex flex-col items-center justify-center p-1 ${
              colors ? `border-[${typeColor}]/20` : 'border-[#2a3a4e]'
            }`}>
              <div className="text-lg font-bold" style={colors ? { color: typeColor } : { color: '#f59e0b' }}>
                {p.star}
              </div>
              <div className="text-[9px] text-[#94a3b8] leading-tight text-center">{PALACE_NAMES[p.pos]}</div>
              {colors && (
                <div className="text-[8px] mt-0.5" style={{ color: typeColor }}>{p.type}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JiugongPage() {
  const [baziData, setBaziData] = useState<any>(null);
  const [mode, setMode] = useState<'year' | 'month' | 'day'>('day');
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const now = new Date();

  useEffect(() => {
    const stored = sessionStorage.getItem('dzs_bazi_result');
    if (stored) {
      try { setBaziData(JSON.parse(stored)); } catch {}
    }
  }, []);

  // 命宫计算：日干→后天八卦方位
  const MING_GONG: Record<string, number> = {
    '甲':3,'乙':3,'丙':9,'丁':9,'戊':5,'己':5,'庚':7,'辛':7,'壬':1,'癸':1,
  };
  const ELEMENT_DIR: Record<string, string> = {
    '木':'东','火':'南','土':'中','金':'西','水':'北',
  };
  const dm = baziData?.dayMaster || '';
  const mingGongNum = MING_GONG[dm] || 0;
  const yongShen = baziData?.usefulGod?.yongShen || [];
  const jiShen = baziData?.usefulGod?.jiShen || [];
  const yongDir = ELEMENT_DIR[yongShen[0]] || '';
  const jiDir = ELEMENT_DIR[jiShen[0]] || '';

  const palaces = getNinePalace(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const activePalaces = palaces[mode];

  const bestDirection = activePalaces?.filter((p: any) => p.type === '吉' || p.type === '大吉').slice(0, 2) || [];
  const worstDirection = activePalaces?.filter((p: any) => p.type === '凶' || p.type === '大凶').slice(0, 2) || [];

  const directionNames: Record<number, string> = {
    1: '北', 2: '西南', 3: '东', 4: '东南', 5: '中', 6: '西北', 7: '西', 8: '东北', 9: '南',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#111827] to-[#0a0e17] text-[#e2e8f0]">
      <header className="sticky top-0 z-10 bg-[#0a0e17]/80 backdrop-blur-lg border-b border-[#1e293b]">
        <div className="flex items-center gap-3 px-4 h-12">
          <a href="/" className="text-[#94a3b8] hover:text-[#f59e0b] transition-colors">
            <ArrowLeft size={20} />
          </a>
          <h1 className="text-sm font-semibold">九宫飞星</h1>
          <span className="text-[10px] text-[#64748b] ml-auto">
            {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日
          </span>
        </div>
      </header>

      <div className="px-4 pt-4 pb-8 space-y-4">
        {/* 模式切换 */}
        <div className="flex gap-2">
          {[
            { key: 'year' as const, label: '流年' },
            { key: 'month' as const, label: '流月' },
            { key: 'day' as const, label: '日飞星' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setMode(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === tab.key
                  ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
                  : 'bg-[#1a2332] text-[#64748b] border border-[#2a3a4e]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 九宫图 */}
        {activePalaces && (
          <PalaceGrid palaces={activePalaces} title={`${mode === 'year' ? '流年' : mode === 'month' ? '流月' : '今日'}九宫飞星`} colors />
        )}

        {/* 吉凶方位 */}
        {activePalaces && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
              <h3 className="text-xs font-semibold mb-2 text-[#2ECC71]">吉方</h3>
              {activePalaces.filter((p: any) => p.type === '吉' || p.type === '大吉').map((p: any) => (
                <div key={p.pos} className="flex items-center justify-between text-sm py-1">
                  <span>{PALACE_NAMES[p.pos]}（{directionNames[p.pos]}）</span>
                  <span className="text-[#2ECC71] text-xs">{p.star}白·{p.name}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
              <h3 className="text-xs font-semibold mb-2 text-[#E74C3C]">凶方</h3>
              {activePalaces.filter((p: any) => p.type === '凶' || p.type === '大凶').map((p: any) => (
                <div key={p.pos} className="flex items-center justify-between text-sm py-1">
                  <span>{PALACE_NAMES[p.pos]}（{directionNames[p.pos]}）</span>
                  <span className="text-[#E74C3C] text-xs">{p.star}·{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 方位详解 */}
        <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
          <h3 className="text-xs font-semibold mb-3 text-[#94a3b8]">九宫方位详解</h3>
          <div className="space-y-2">
            {activePalaces?.sort((a: any, b: any) => a.pos - b.pos).map((p: any) => (
              <div key={p.pos}
                onClick={() => setShowDetail(showDetail === p.pos ? null : p.pos)}
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#1a2332] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    p.type === '吉' ? 'bg-[#2ECC71]/20 text-[#2ECC71]' :
                    p.type === '凶' ? 'bg-[#E74C3C]/20 text-[#E74C3C]' :
                    'bg-[#C0392B]/20 text-[#C0392B]'
                  }`}>{p.star}</span>
                  <div>
                    <div className="text-sm">{PALACE_NAMES[p.pos]} · {p.name}</div>
                    <div className="text-[10px] text-[#64748b]">方位{directionNames[p.pos]} · 五行{p.wuxing}</div>
                  </div>
                </div>
                <Info size={14} className="text-[#4a5a6e]" />
              </div>
            ))}
          </div>
        </div>

        {/* 命主个人飞星 — 基于八字用神叠加九宫 */}
        {baziData && (
          <div className="rounded-2xl bg-gradient-to-br from-[#0f1525] to-[#1a2332] border border-[#f59e0b]/10 p-4">
            <h3 className="text-xs font-semibold mb-3 text-[#f59e0b]">命主个人飞星</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#94a3b8]">命宫：</span>
                <span className="text-[#f59e0b] font-bold">{mingGongNum ? `${PALACE_NAMES[mingGongNum]} (${['北','西南','东','东南','中','西北','西','东北','南'][mingGongNum-1]})` : '—'}</span>
                <span className="text-[#64748b] ml-1">({dm}日主)</span>
              </div>
              {yongDir && (
                <div className="flex items-center gap-2">
                  <span className="text-[#2ECC71]">用神方位：</span>
                  <span className="text-[#2ECC71] font-bold">{yongDir}方</span>
                  <span className="text-[#64748b]">（{yongShen.join('、')}）— 宜坐卧朝向</span>
                </div>
              )}
              {jiDir && (
                <div className="flex items-center gap-2">
                  <span className="text-[#E74C3C]">忌神方位：</span>
                  <span className="text-[#E74C3C] font-bold">{jiDir}方</span>
                  <span className="text-[#64748b]">（{jiShen.join('、')}）— 宜避开冲煞</span>
                </div>
              )}
              <div className="mt-2 p-2 rounded-lg bg-[#1a2332] border border-[#2a3a4e]">
                <div className="text-[10px] text-[#64748b] mb-1">当前{mode === 'year' ? '流年' : mode === 'month' ? '流月' : '今日'}吉位指向</div>
                <div className="flex gap-2 flex-wrap">
                  {activePalaces?.filter((p: any) => p.type === '吉' || p.type === '大吉').slice(0, 2).map((p: any) => (
                    <span key={p.pos} className="text-[10px] text-[#2ECC71]">· {PALACE_NAMES[p.pos]}（{directionNames[p.pos]}）</span>
                  ))}
                  {(!activePalaces || activePalaces.filter((p: any) => p.type === '吉').length === 0) && (
                    <span className="text-[10px] text-[#64748b]">当前时段无吉星</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 当日宜忌（基于日飞星） */}
        <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-4">
          <h3 className="text-xs font-semibold mb-3 text-[#94a3b8]">今日提示</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-[#2ECC71] mb-2">宜往</div>
              <div className="space-y-1">
                {palaces.day.filter((p: any) => p.type === '吉').slice(0, 3).map((p: any) => (
                  <div key={p.pos} className="text-sm text-[#e2e8f0]">
                    · {directionNames[p.pos]}方（{PALACE_NAMES[p.pos]}）
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#E74C3C] mb-2">忌往</div>
              <div className="space-y-1">
                {palaces.day.filter((p: any) => p.type === '凶' || p.type === '大凶').slice(0, 3).map((p: any) => (
                  <div key={p.pos} className="text-sm text-[#e2e8f0]">
                    · {directionNames[p.pos]}方（{PALACE_NAMES[p.pos]}）
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
