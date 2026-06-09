'use client';

import { useEffect, useState } from 'react';
import { useWuxingStore, useBaziStore } from '@/store';
import { analyzeEnergy } from '@/lib/api';
import { cn, WUXING_COLORS, WUXING_NAMES } from '@/lib/utils';
import ReactEChartsCore from 'echarts-for-react';
import { RefreshCw, Activity, Wind, AlertTriangle } from 'lucide-react';

export default function WuxingPage() {
  const { result, loading, setResult, setLoading, setError } = useWuxingStore();
  const baziResult = useBaziStore((s) => s.result);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadEnergy();
  }, []);

  const loadEnergy = async () => {
    setLoading(true);
    try {
      const mockEnergy = {
        energyField: {
          wood: { base: 58, seasonalBoost: 12, finalScore: 71, finalPercent: 18 },
          fire: { base: 105, seasonalBoost: 52, finalScore: 158, finalPercent: 38 },
          earth: { base: 93, seasonalBoost: 19, finalScore: 112, finalPercent: 27 },
          metal: { base: 40, seasonalBoost: -8, finalScore: 32, finalPercent: 8 },
          water: { base: 47, seasonalBoost: -10, finalScore: 37, finalPercent: 9 },
        },
        totalEnergy: 410,
        dominantElement: 'fire',
        balanceState: '偏旺' as const,
        stability: 61,
      };
      setResult(mockEnergy as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setIsRefreshing(true);
    loadEnergy().finally(() => setTimeout(() => setIsRefreshing(false), 800));
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '木 （East）', max: 200 },
        { name: '火 （South）', max: 200 },
        { name: '土 （Center）', max: 200 },
        { name: '金 （West）', max: 200 },
        { name: '水 （North）', max: 200 },
      ],
      shape: 'circle',
      radius: '65%',
      axisName: { color: '#94a3b8', fontSize: 11 },
      splitArea: { areaStyle: { color: ['rgba(245,158,11,0.02)', 'rgba(245,158,11,0.05)'] } },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [result?.energyField?.wood?.finalScore || 0, result?.energyField?.fire?.finalScore || 0, result?.energyField?.earth?.finalScore || 0, result?.energyField?.metal?.finalScore || 0, result?.energyField?.water?.finalScore || 0],
            name: '动态能量',
            areaStyle: { color: 'rgba(245,158,11,0.25)' },
            lineStyle: { color: '#f59e0b', width: 2 },
            itemStyle: { color: '#f59e0b' },
          },
          {
            value: [58, 105, 93, 40, 47],
            name: '基础能量',
            areaStyle: { color: 'rgba(148,163,184,0.1)' },
            lineStyle: { color: '#64748b', width: 1, type: 'dashed' },
            itemStyle: { color: '#64748b' },
          },
        ],
      },
    ],
  };

  const barOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category' as const,
      data: ['木', '火', '土', '金', '水'],
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)' } },
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: result?.energyField?.wood?.finalScore || 0, itemStyle: { color: WUXING_COLORS.wood } },
          { value: result?.energyField?.fire?.finalScore || 0, itemStyle: { color: WUXING_COLORS.fire } },
          { value: result?.energyField?.earth?.finalScore || 0, itemStyle: { color: WUXING_COLORS.earth } },
          { value: result?.energyField?.metal?.finalScore || 0, itemStyle: { color: WUXING_COLORS.metal } },
          { value: result?.energyField?.water?.finalScore || 0, itemStyle: { color: WUXING_COLORS.water } },
        ],
        barWidth: '50%',
        label: { show: true, position: 'top', color: '#94a3b8', fontSize: 11, formatter: (p: any) => p.value },
      },
    ],
  };

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">五行能量</h1>
          <p className="text-sm text-[#64748b] mt-1">动态五行动能系统 · 月令加权 · 能量场分析</p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] text-sm hover:bg-[rgba(245,158,11,0.2)] transition-all">
          <RefreshCw size={14} className={cn(isRefreshing && 'animate-spin')} />
          刷新
        </button>
      </div>

      {/* 状态卡 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="dzg-card p-4">
          <div className="text-xs text-[#64748b]">总能量</div>
          <div className="text-2xl font-bold text-[#f59e0b] mt-1">{result?.totalEnergy || 0}</div>
        </div>
        <div className="dzg-card p-4">
          <div className="text-xs text-[#64748b]">主导五行</div>
          <div className="text-2xl font-bold mt-1" style={{ color: WUXING_COLORS[result?.dominantElement as keyof typeof WUXING_COLORS] || '#f59e0b' }}>
            {WUXING_NAMES[result?.dominantElement || ''] || '--'}
          </div>
        </div>
        <div className="dzg-card p-4">
          <div className="text-xs text-[#64748b]">平衡状态</div>
          <div className="text-xl font-bold mt-1 text-[#F39C12]">{result?.balanceState || '--'}</div>
        </div>
        <div className="dzg-card p-4">
          <div className="text-xs text-[#64748b]">能量稳定度</div>
          <div className="text-2xl font-bold mt-1" style={{ color: (result?.stability || 0) > 60 ? '#2ECC71' : '#F39C12' }}>
            {result?.stability || 0}%
          </div>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="dzg-card p-4">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">五行能量雷达</h3>
          <ReactEChartsCore option={radarOption} style={{ height: 320 }} notMerge />
        </div>
        <div className="dzg-card p-4">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">能量柱状比较</h3>
          <ReactEChartsCore option={barOption} style={{ height: 320 }} notMerge />
        </div>
      </div>

      {/* 各五行明细 */}
      <div className="dzg-card p-4">
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">能量明细</h3>
        <div className="grid grid-cols-5 gap-3">
          {elements.map((el) => {
            const e = result?.energyField?.[el];
            const name = WUXING_NAMES[el];
            const color = WUXING_COLORS[el as keyof typeof WUXING_COLORS];
            return (
              <div key={el} className="text-center p-3 rounded-lg border" style={{ borderColor: `${color}30` }}>
                <div className="text-lg font-bold font-mono" style={{ color }}>{name}</div>
                <div className="text-sm text-[#e2e8f0] mt-1 font-mono">{e?.finalScore || 0}</div>
                <div className="text-[10px] text-[#64748b] mt-2 space-y-0.5">
                  <div>基础 {e?.base || 0}</div>
                  <div>月令 {e?.seasonalBoost !== undefined && e.seasonalBoost >= 0 ? `+${e.seasonalBoost}` : e?.seasonalBoost || 0}</div>
                  <div>占比 {e?.finalPercent || 0}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
