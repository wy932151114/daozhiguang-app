'use client';

import { useEffect, useState } from 'react';
import { useSystemStore } from '@/store';
import { getValidationStatus } from '@/lib/api';
import { formatEnergy, getRiskColor, cn } from '@/lib/utils';
import {
  Activity, AlertTriangle, Cpu, Zap, Shield, Wind,
  TrendingUp, Clock, ArrowUp, ArrowDown,
} from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react';

export default function DashboardPage() {
  const { validationStatus, setValidationStatus, systemMode, setConnected } = useSystemStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    getValidationStatus().then(setValidationStatus).catch(() => {});
    setConnected(true);
  }, [setValidationStatus, setConnected]);

  // ===== 模拟数据（后端联调后替换为真实数据） =====
  const mockData = {
    energyTotal: 438,
    stability: 72,
    riskLevel: 35,
    dominantElement: '火',
    weakestElement: '水',
    todayStar: '武曲星(6)',
    bestDirection: '西',
    worstDirection: '东南',
    yongShen: '火/土',
    jiShen: '水',
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '木', max: 100 },
        { name: '火', max: 100 },
        { name: '土', max: 100 },
        { name: '金', max: 100 },
        { name: '水', max: 100 },
      ],
      shape: 'circle',
      axisName: { color: '#94a3b8', fontSize: 12 },
      splitArea: { areaStyle: { color: ['rgba(245,158,11,0.02)', 'rgba(245,158,11,0.05)'] } },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
    },
    series: [{
      type: 'radar',
      data: [{ value: [65, 85, 45, 30, 55], name: '今日能量', areaStyle: { color: 'rgba(245,158,11,0.2)' }, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' } }],
    }],
  };

  const KPI_CARDS = [
    { label: '今日能量总值', value: mockData.energyTotal, unit: '', icon: Zap, color: '#f59e0b', trend: 'up', change: '+12%' },
    { label: '能量稳定度', value: mockData.stability, unit: '%', icon: Activity, color: '#2ECC71', trend: 'up', change: '+5%' },
    { label: '风险等级', value: mockData.riskLevel, unit: '%', icon: AlertTriangle, color: getRiskColor(mockData.riskLevel), trend: 'down', change: '-3%' },
    { label: '主导五行', value: mockData.dominantElement, unit: '', icon: Wind, color: '#E74C3C', trend: 'up', change: '' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">DZS-OS Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-1">道之光命理AI操作系统 · 实时监控面板</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{time.toLocaleTimeString('zh-CN')}</span>
          </div>
          <div className={cn('flex items-center gap-2', validationStatus?.passed ? 'text-[#2ECC71]' : 'text-[#E74C3C]')}>
            <Shield size={14} />
            <span>Validation {validationStatus?.passed ? 'PASS' : '--'}</span>
          </div>
        </div>
      </div>

      {/* KPI卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className="dzg-card p-4 group hover:border-[rgba(245,158,11,0.3)] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-[#64748b] mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-[#e2e8f0]" style={{ color: kpi.color }}>
                  {typeof kpi.value === 'number' ? formatEnergy(kpi.value) : kpi.value}{kpi.unit}
                </div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: `${kpi.color}20` }}>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
            </div>
            {kpi.change && (
              <div className={cn('flex items-center gap-1 text-xs mt-2', kpi.trend === 'up' ? 'text-[#2ECC71]' : 'text-[#E74C3C]')}>
                {kpi.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{kpi.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 主区域 2列 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 五行能量雷达图 */}
        <div className="dzg-card p-4 col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#e2e8f0]">五行能量雷达</h3>
            <span className="text-[10px] text-[#64748b]">实时</span>
          </div>
          <ReactEChartsCore option={radarOption} style={{ height: 260 }} notMerge />
        </div>

        {/* 系统状态 */}
        <div className="dzg-card p-4 col-span-1">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">系统状态</h3>
          <div className="space-y-3">
            <StatusRow label="Kernel" value="运行中" color="#2ECC71" />
            <StatusRow label="Energy Bus" value="激活" color="#2ECC71" />
            <StatusRow label="Validation" value={validationStatus?.passed ? '通过' : '等待中'} color={validationStatus?.passed ? '#2ECC71' : '#F39C12'} />
            <StatusRow label="AI Runtime" value="就绪" color="#2ECC71" />
            <StatusRow label="协议版本" value="2.3" color="#94a3b8" />
            <StatusRow label="运行模式" value={systemMode} color="#f59e0b" />
          </div>
        </div>

        {/* 命理摘要 */}
        <div className="dzg-card p-4 col-span-1">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">今日命理摘要</h3>
          <div className="space-y-3">
            <DetailRow label="当值星" value={mockData.todayStar} />
            <DetailRow label="用神" value={mockData.yongShen} />
            <DetailRow label="忌神" value={mockData.jiShen} />
            <DetailRow label="最佳方位" value={mockData.bestDirection} color="#2ECC71" />
            <DetailRow label="最差方位" value={mockData.worstDirection} color="#E74C3C" />
            <DetailRow label="主导五行" value={mockData.dominantElement} />
            <DetailRow label="最弱五行" value={mockData.weakestElement} />
          </div>
        </div>
      </div>

      {/* 底部：最近活动 + 状态 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="dzg-card p-4">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">Activity Log</h3>
          <div className="space-y-2 text-xs text-[#94a3b8]">
            <ActivityLog time="12:34" event="System initialized" type="info" />
            <ActivityLog time="12:34" event="Energy Bus connected" type="success" />
            <ActivityLog time="12:35" event="Validation Center active" type="success" />
            <ActivityLog time="12:36" event="Protocol v2.3 loaded" type="info" />
            <ActivityLog time="12:38" event="7 API endpoints registered" type="success" />
          </div>
        </div>
        <div className="dzg-card p-4">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">Validation Checks</h3>
          <div className="space-y-2 text-xs">
            <CheckRow label="四柱完整性" passed />
            <CheckRow label="五行正数" passed />
            <CheckRow label="经度范围" passed />
            <CheckRow label="真太阳时修正" passed />
            <CheckRow label="用神一致性" passed />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 子组件 ==========

function StatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#64748b]">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#64748b]">{label}</span>
      <span className="font-mono text-[#e2e8f0]" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}

function ActivityLog({ time, event, type }: { time: string; event: string; type: 'info' | 'success' | 'warn' }) {
  const colors = { info: '#3498DB', success: '#2ECC71', warn: '#F39C12' };
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#64748b] w-10">{time}</span>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors[type] }} />
      <span>{event}</span>
    </div>
  );
}

function CheckRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#94a3b8]">{label}</span>
      <span className={passed ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}>
        {passed ? '✓' : '✗'}
      </span>
    </div>
  );
}
