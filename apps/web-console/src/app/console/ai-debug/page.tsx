'use client';

import { useAiDebugStore, useBaziStore } from '@/store';
import { generateAI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Send, RefreshCw, AlertTriangle, CheckCircle, FileText, Brain, Code, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

export default function AiDebugPage() {
  const { prompt, systemPrompt, result, loading, error, setPrompt, setSystemPrompt, setResult, setLoading, setError } = useAiDebugStore();
  const baziResult = useBaziStore((s) => s.result);
  const [activeTab, setActiveTab] = useState<'output' | 'validation' | 'risk' | 'tokens'>('output');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateAI({
        type: 'daily',
        prompt,
        systemPrompt,
        baziData: baziResult || undefined,
      });
      setResult(res);
    } catch (e: any) {
      // 模拟数据
      setResult({
        output: `【今日运势报告】

日主${baziResult?.dayMaster || '己'}${baziResult?.dayMasterElement ? '土' : ''} · ${baziResult?.strength?.bodyStrength || '中和'}

今日整体运势平稳。五行中火能量偏旺（38%），土次之（27%）。

✦ 最佳时辰：午时（11:00-13:00）
✦ 最佳方位：西方
✦ 适宜活动：沟通、社交、创作
✦ 禁忌事项：东南方不宜动土、不宜冒险投资

改命建议：
① 今日宜穿黄色/红色系衣物增强土火能量
② 午时面向西方进行重要决策
③ 避免与水相关活动（北方不宜久留）
④ 可在办公桌西侧放置金属摆件

—— 道之光AI命理系统 生成`,
        validation: { passed: true, errors: [], warnings: ['时辰在子时跨日范围'] },
        tokenUsage: { prompt: 1250, completion: 380, total: 1630 },
        riskCheck: { passed: true, warnings: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">AI 运行调试</h1>
          <p className="text-sm text-[#64748b] mt-1">DZS AI Runtime · Prompt调试 · 输出验证</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧编辑区 */}
        <div className="space-y-4">
          <div className="dzg-card p-4">
            <h2 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
              <Brain size={16} className="text-[#9B59B6]" /> System Prompt
            </h2>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-40 bg-[#0a0e17] border border-[#334155] rounded-lg p-3 text-xs text-[#cbd5e1] font-mono resize-none focus:border-[#f59e0b] focus:outline-none"
            />
          </div>

          <div className="dzg-card p-4">
            <h2 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
              <FileText size={16} className="text-[#3498DB]" /> User Prompt
            </h2>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-24 bg-[#0a0e17] border border-[#334155] rounded-lg p-3 text-sm text-[#e2e8f0] resize-none focus:border-[#f59e0b] focus:outline-none"
            />
          </div>

          <div className="dzg-card p-4">
            <h2 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
              <Code size={16} className="text-[#2ECC71]" /> 注入数据预览
            </h2>
            <pre className="text-xs text-[#94a3b8] bg-[#0a0e17] rounded-lg p-3 overflow-x-auto max-h-32">
              {baziResult ? JSON.stringify({ pillars: baziResult.pillars, dayMaster: baziResult.dayMaster, usefulGod: baziResult.usefulGod }, null, 2) : '暂无八字数据'}
            </pre>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? '生成中...' : '运行 AI 生成'}
          </button>
        </div>

        {/* 右侧结果区 */}
        <div className="space-y-4">
          {/* Tab切换 */}
          <div className="flex gap-2">
            {[
              { key: 'output' as const, label: 'AI输出', icon: FileText },
              { key: 'validation' as const, label: '验证结果', icon: Shield },
              { key: 'risk' as const, label: '风控检测', icon: AlertTriangle },
              { key: 'tokens' as const, label: 'Token用量', icon: Zap },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all',
                  activeTab === tab.key
                    ? 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]'
                    : 'text-[#64748b] hover:text-[#94a3b8]',
                )}>
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="dzg-card p-4 min-h-[400px]">
            {!result ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-[#64748b]">
                  <Brain size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">设置Prompt后点击生成</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'output' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={14} className={result.validation?.passed ? 'text-[#2ECC71]' : 'text-[#E74C3C]'} />
                      <span className={cn('text-xs', result.validation?.passed ? 'text-[#2ECC71]' : 'text-[#E74C3C]')}>
                        Validation {result.validation?.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="text-sm text-[#cbd5e1] whitespace-pre-line leading-relaxed">
                      {result.output}
                    </div>
                  </div>
                )}

                {activeTab === 'validation' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', result.validation?.passed ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]')} />
                      <span className="text-sm font-semibold">{result.validation?.passed ? '验证通过' : '验证失败'}</span>
                    </div>
                    {result.validation?.errors?.length > 0 && (
                      <div>
                        <div className="text-xs text-[#E74C3C] mb-1">错误 ({result.validation.errors.length})</div>
                        {result.validation.errors.map((e, i) => <div key={i} className="text-xs text-[#94a3b8] bg-[rgba(231,76,60,0.05)] p-2 rounded mb-1">{e}</div>)}
                      </div>
                    )}
                    {result.validation?.warnings?.length > 0 && (
                      <div>
                        <div className="text-xs text-[#F39C12] mb-1">警告 ({result.validation.warnings.length})</div>
                        {result.validation.warnings.map((e, i) => <div key={i} className="text-xs text-[#94a3b8] bg-[rgba(243,156,18,0.05)] p-2 rounded mb-1">{e}</div>)}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'risk' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', result.riskCheck?.passed ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]')} />
                      <span className="text-sm font-semibold">{result.riskCheck?.passed ? '安全' : '风险拦截'}</span>
                    </div>
                    {result.riskCheck?.warnings?.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#F39C12] p-2 bg-[rgba(243,156,18,0.05)] rounded">
                        <AlertTriangle size={12} className="mt-0.5" />
                        {w}
                      </div>
                    ))}
                    {result.riskCheck?.passed && <div className="text-xs text-[#94a3b8]">所有风控检查通过</div>}
                  </div>
                )}

                {activeTab === 'tokens' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-[rgba(245,158,11,0.05)]">
                        <div className="text-[10px] text-[#64748b]">Prompt</div>
                        <div className="text-lg font-bold text-[#f59e0b]">{result.tokenUsage?.prompt || 0}</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[rgba(52,152,219,0.05)]">
                        <div className="text-[10px] text-[#64748b]">Completion</div>
                        <div className="text-lg font-bold text-[#3498DB]">{result.tokenUsage?.completion || 0}</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[rgba(46,204,113,0.05)]">
                        <div className="text-[10px] text-[#64748b]">Total</div>
                        <div className="text-lg font-bold text-[#2ECC71]">{result.tokenUsage?.total || 0}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#64748b]">
                      估算成本：${((result.tokenUsage?.total || 0) * 0.00001).toFixed(4)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-[#E74C3C] bg-[rgba(231,76,60,0.1)] rounded-lg p-3">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
