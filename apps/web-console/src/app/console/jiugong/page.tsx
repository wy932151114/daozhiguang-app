'use client';

import { useEffect, useState, useRef } from 'react';
import { useJiugongStore } from '@/store';
import { calculateNinePalaceApi } from '@/lib/api';
import { cn, WUXING_COLORS, getRatingColor } from '@/lib/utils';
import { RefreshCw, Info, Clock } from 'lucide-react';

const PALACE_INFO: Record<number, { name: string; direction: string; wuxing: string }> = {
  1: { name: '坎', direction: '北', wuxing: '水' },
  2: { name: '坤', direction: '西南', wuxing: '土' },
  3: { name: '震', direction: '东', wuxing: '木' },
  4: { name: '巽', direction: '东南', wuxing: '木' },
  5: { name: '中', direction: '中', wuxing: '土' },
  6: { name: '乾', direction: '西北', wuxing: '金' },
  7: { name: '兑', direction: '西', wuxing: '金' },
  8: { name: '艮', direction: '东北', wuxing: '土' },
  9: { name: '离', direction: '南', wuxing: '火' },
};

// 洛书九宫位置 [row, col] 0-2
const LO_SHU_POSITIONS: Record<number, [number, number]> = {
  1: [1, 0], 2: [0, 2], 3: [0, 1], 4: [0, 0],
  5: [1, 1],
  6: [2, 0], 7: [2, 1], 8: [2, 2], 9: [1, 2],
};

export default function JiugongPage() {
  const { date, result, selectedPalace, loading, setDate, setResult, setSelectedPalace, setLoading } = useJiugongStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    loadPalace();
    return () => clearInterval(t);
  }, []);

  const loadPalace = async () => {
    setLoading(true);
    try {
      const res = await calculateNinePalaceApi(date.year, date.month, date.day);
      setResult(res);
    } catch (e) {
      // 模拟数据
      setResult({
        palaces: [
          { position: 1, name: '坎', direction: '北', star: { number: 4, name: '文曲', type: '中性', wuxing: '木' }, energy: 55, rating: '平' },
          { position: 2, name: '坤', direction: '西南', star: { number: 5, name: '廉贞', type: '凶', wuxing: '土' }, energy: 50, rating: '凶' },
          { position: 3, name: '震', direction: '东', star: { number: 6, name: '武曲', type: '吉', wuxing: '金' }, energy: 40, rating: '吉' },
          { position: 4, name: '巽', direction: '东南', star: { number: 7, name: '破军', type: '大凶', wuxing: '金' }, energy: 30, rating: '大凶' },
          { position: 5, name: '中', direction: '中', star: { number: 8, name: '左辅', type: '吉', wuxing: '土' }, energy: 45, rating: '平' },
          { position: 6, name: '乾', direction: '西北', star: { number: 9, name: '右弼', type: '中性', wuxing: '火' }, energy: 45, rating: '平' },
          { position: 7, name: '兑', direction: '西', star: { number: 1, name: '贪狼', type: '大吉', wuxing: '水' }, energy: 100, rating: '大吉' },
          { position: 8, name: '艮', direction: '东北', star: { number: 2, name: '巨门', type: '中性', wuxing: '土' }, energy: 35, rating: '平' },
          { position: 9, name: '离', direction: '南', star: { number: 3, name: '禄存', type: '凶', wuxing: '木' }, energy: 55, rating: '凶' },
        ],
        summary: { bestDirection: '西（兑宫）', worstDirection: '东南（巽宫）', auspiciousStars: ['贪狼', '武曲'], inauspiciousStars: ['破军', '廉贞'] },
        conflicts: [
          { type: '五黄', palaces: ['中宫'], severity: '严重', description: '流年五黄入中', remedy: '宜用金属化煞' },
          { type: '三煞', palaces: ['南离宫'], severity: '中等', description: '年三煞在南方', remedy: '宜静不宜动' },
        ],
      } as any);
    } finally {
      setLoading(false);
    }
  };

  const selectedData = result?.palaces?.find((p) => p.position === selectedPalace);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">九宫飞星</h1>
          <p className="text-sm text-[#64748b] mt-1">空间能量引擎 · 实时九宫飞星布局</p>
        </div>
        <button onClick={loadPalace} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] text-sm hover:bg-[rgba(245,158,11,0.2)]">
          <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 九宫格 */}
        <div className="col-span-2 dzg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-[#e2e8f0] flex items-center gap-2">
              <Clock size={14} className="text-[#64748b]" />
              {date.year}年{date.month}月{date.day}日 九宫布局
            </div>
            <div className="flex gap-2 text-xs">
              {result?.summary.bestDirection && <span className="text-[#2ECC71]">最佳：{result.summary.bestDirection}</span>}
              {result?.summary.worstDirection && <span className="text-[#E74C3C] ml-2">最差：{result.summary.worstDirection}</span>}
            </div>
          </div>

          {/* 九宫格 Canvas */}
          <div className="relative w-full aspect-square bg-[rgba(0,0,0,0.3)] rounded-lg overflow-hidden" style={{ maxHeight: '65vh' }}>
            {result?.palaces?.map((p) => {
              const pos = LO_SHU_POSITIONS[p.position];
              if (!pos) return null;
              const [row, col] = pos;
              const isSelected = selectedPalace === p.position;
              const ratingColor = getRatingColor(p.rating);
              const wuxingColor = WUXING_COLORS[p.star?.wuxing?.toLowerCase() as keyof typeof WUXING_COLORS] || '#94a3b8';

              return (
                <div
                  key={p.position}
                  onClick={() => setSelectedPalace(isSelected ? null : p.position)}
                  className={cn(
                    'absolute cursor-pointer rounded-lg border transition-all duration-300',
                    'hover:brightness-110 hover:scale-[1.02]',
                    isSelected ? 'ring-2 ring-[#f59e0b] border-[#f59e0b]' : 'border-[#334155]',
                  )}
                  style={{
                    top: `${row * 33.33}%`,
                    left: `${col * 33.33}%`,
                    width: '33.33%',
                    height: '33.33%',
                    background: `linear-gradient(135deg, ${wuxingColor}08, ${wuxingColor}15)`,
                    boxShadow: isSelected ? `0 0 20px ${wuxingColor}40` : 'none',
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <div className="text-xs text-[#64748b] absolute top-2 left-2">{p.name}</div>
                    <div className="text-lg font-bold font-mono" style={{ color: wuxingColor }}>{p.star?.number}</div>
                    <div className="text-[10px] text-[#94a3b8]">{p.star?.name}</div>
                    <div className="text-[10px]" style={{ color: ratingColor }}>{p.rating}</div>
                    <div className="text-xs mt-1" style={{ color: wuxingColor }}>{p.energy}%</div>
                  </div>
                </div>
              );
            })}

            {/* 中线 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 w-px h-full bg-[rgba(245,158,11,0.1)]" />
              <div className="absolute left-2/3 top-0 w-px h-full bg-[rgba(245,158,11,0.1)]" />
              <div className="absolute top-1/3 left-0 h-px w-full bg-[rgba(245,158,11,0.1)]" />
              <div className="absolute top-2/3 left-0 h-px w-full bg-[rgba(245,158,11,0.1)]" />
            </div>
          </div>
        </div>

        {/* 右侧详情 + 冲突 */}
        <div className="space-y-4">
          {/* 选中宫位详情 */}
          {selectedData ? (
            <div className="dzg-card p-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
                <Info size={14} className="text-[#f59e0b]" />
                {selectedData.name}宫（{selectedData.direction}方）详情
              </h3>
              <div className="space-y-2 text-sm">
                <Detail label="当值星" value={`${selectedData.star?.number}号${selectedData.star?.name}`} color={WUXING_COLORS[selectedData.star?.wuxing?.toLowerCase() as keyof typeof WUXING_COLORS]} />
                <Detail label="宫位五行" value={PALACE_INFO[selectedData.position]?.wuxing || ''} />
                <Detail label="能量值" value={`${selectedData.energy}%`} color={getRatingColor(selectedData.rating)} />
                <Detail label="吉凶评级" value={selectedData.rating} color={getRatingColor(selectedData.rating)} />
                {selectedData.suitable && <Detail label="宜" value={selectedData.suitable.slice(0, 3).join('、')} color="#2ECC71" />}
                {selectedData.avoid && <Detail label="忌" value={selectedData.avoid.slice(0, 3).join('、')} color="#E74C3C" />}
              </div>
            </div>
          ) : null}

          {/* 空间冲突 */}
          {result?.conflicts && result.conflicts.length > 0 && (
            <div className="dzg-card p-4">
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">空间冲突</h3>
              <div className="space-y-2">
                {result.conflicts.map((c, i) => (
                  <div key={i} className={cn(
                    'p-3 rounded-lg text-xs border',
                    c.severity === '严重' ? 'border-[rgba(231,76,60,0.3)] bg-[rgba(231,76,60,0.05)]' : 'border-[rgba(243,156,18,0.3)] bg-[rgba(243,156,18,0.05)]',
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#e2e8f0]">{c.type}</span>
                      <span className={c.severity === '严重' ? 'text-[#E74C3C]' : 'text-[#F39C12]'}>{c.severity}</span>
                    </div>
                    <div className="text-[#94a3b8]">{c.description}</div>
                    {c.remedy && <div className="text-[#2ECC71] mt-1">化解：{c.remedy}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 吉凶星 */}
          {result?.summary && (
            <div className="dzg-card p-4">
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">吉凶星汇总</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-[10px] text-[#64748b] mb-1">吉星</div>
                  <div className="text-[#2ECC71]">{result.summary.auspiciousStars?.join('、') || '--'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748b] mb-1">凶星</div>
                  <div className="text-[#E74C3C]">{result.summary.inauspiciousStars?.join('、') || '--'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#64748b] text-xs">{label}</span>
      <span className="font-mono text-xs text-[#e2e8f0]" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}
