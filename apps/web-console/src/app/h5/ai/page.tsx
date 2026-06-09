'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, Sun, Wind, Compass, BookOpen } from 'lucide-react';
import BottomNav from '@/app/h5/_components/BottomNav';

/**
 * 道之光 · H5 AI改命问答页面
 * 基于八字排盘 + 道之光思维框架的AI改命建议
 */

const SUGGESTIONS = [
  { icon: '📊', text: '分析我的五行能量' },
  { icon: '🧭', text: '今日最佳方位' },
  { icon: '🎯', text: '事业财运建议' },
  { icon: '💕', text: '感情运势分析' },
  { icon: '🏠', text: '居家风水建议' },
  { icon: '⏰', text: '近期吉日时辰' },
];

function generateLocalResponse(question: string, baziData: any): string {
  const dm = baziData?.dayMaster || '未知';
  const strength = baziData?.strength?.bodyStrength || '中和';
  const yongShen = baziData?.usefulGod?.yongShen || [];
  const jiShen = baziData?.usefulGod?.jiShen || [];
  const missing = baziData?.usefulGod?.missing || [];
  const excess = baziData?.usefulGod?.excess || [];
  const percentages = (baziData?.elementBalance?.percentage || {}) as Record<string, number>;
  const dominant = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0]?.[0] || '火';
  const weakest = Object.entries(percentages).sort((a, b) => a[1] - b[1])[0]?.[0] || '水';

  if (question.includes('五行') || question.includes('能量')) {
    const missingText = missing.length ? `缺失五行：${missing.join('、')}` : '五行齐全';
    const excessText = excess.length ? `过旺五行：${excess.join('、')}` : '五行均衡';
    return `【五行能量分析】\n\n您的日主为${dm}，命格${strength}。\n\n当前五行分布：\n${Object.entries(percentages).map(([k, v]) => `- ${k}：${v}%`).join('\n')}\n主导：${dominant} | 最弱：${weakest}\n\n${missingText}\n${excessText}\n\n用神：${yongShen.join('、')} | 忌神：${jiShen.join('、')}\n\n建议：日常多接触${yongShen.map((s: string) => {
      const dirMap: Record<string, string> = { '木': '东方·绿色', '火': '南方·红色', '土': '中央·黄色', '金': '西方·白色', '水': '北方·黑色' };
      return dirMap[s] || s;
    }).join('、')}元素，有助于平衡命局能量。`;
  }

  if (question.includes('方位') || question.includes('方向')) {
    const dirMap: Record<string, string> = { '木': '东', '火': '南', '土': '中', '金': '西', '水': '北' };
    const bestDir = dirMap[yongShen[0]] || '南';
    const avoidDir = dirMap[jiShen[0]] || '东';
    return `【方位吉凶】\n\n基于您的八字命局：\n\n✅ 最佳方位：${bestDir}方（${yongShen[0] || '火'}能量）\n   - 利事业、谋事、求财\n   - 办公/卧室宜朝此方向\n\n⚠️ 避免方位：${avoidDir}方（${jiShen[0] || '木'}能量）\n   - 此方与您命局相克\n   - 重大决策避开此方\n\n当前时辰：建议在${['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][new Date().getHours() % 12]}时向${bestDir}方行重要事宜。`;
  }

  if (question.includes('事业') || question.includes('财运')) {
    return `【事业财运建议】\n\n日主${dm} · ${strength}\n\n✨ 事业方向：\n${yongShen.includes('金') ? '- 金融、法律、机械、管理等金性行业\n- 宜发挥决断力和执行力' : ''}${yongShen.includes('水') ? '- 贸易、物流、传媒、旅游等水性行业\n- 宜发挥智慧和流动性' : ''}${yongShen.includes('火') ? '- 文化、教育、餐饮、互联网等火性行业\n- 宜发挥热情和创造力' : ''}${yongShen.includes('土') ? '- 房地产、建筑、农业等土性行业\n- 宜发挥稳定和包容力' : ''}${yongShen.includes('木') ? '- 教育、医疗、环保、设计等木性行业\n- 宜发挥成长力和创新力' : ''}\n\n💰 财运提示：\n- 正财运${strength === '身强' ? '较旺，宜进取' : '稳健，宜守成'}\n- 偏财不宜强求\n- ${yongShen[0]}属性月份财运较佳`;
  }

  if (question.includes('感情') || question.includes('姻缘')) {
    return `【感情运势分析】\n\n日主${dm} · ${strength}\n\n感情特质：\n${['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].includes(dm) ? `- ${dm}日主的人通常${dm === '甲' ? '正直坦率，有担当' : dm === '乙' ? '温柔细腻，善解人意' : dm === '丙' ? '热情开朗，善于表达' : dm === '丁' ? '内敛细腻，重感情' : dm === '戊' ? '稳重可靠，重实际' : dm === '己' ? '包容体贴，善协调' : dm === '庚' ? '果断直率，有原则' : dm === '辛' ? '细腻敏感，追求完美' : dm === '壬' ? '开朗大方，不拘小节' : '智慧通透，善变通'}` : ''}\n\n建议：\n- 用神${yongShen.join('、')}对应的方位和场合更容易遇到良缘\n- 感情中多${strength === '身弱' ? '付出和表达' : '倾听和包容'}\n- 忌神${jiShen.join('、')}属性的人/事需谨慎`;
  }

  if (question.includes('风水') || question.includes('居家') || question.includes('房间')) {
    const dirMap: Record<string, string> = { '木': '东', '火': '南', '土': '中', '金': '西', '水': '北' };
    return `【居家风水建议】\n\n命主日柱${dm} · ${strength}\n\n🏠 布局建议：\n1. 床位宜朝${dirMap[yongShen[0]] || '南'}方\n2. 办公桌宜面向${dirMap[yongShen[0]] || '南'}方\n3. 家中${dirMap[yongShen[0]] || '南'}方保持整洁明亮\n\n🎨 配色建议：\n- 主色调：${yongShen.map((s: string) => { const cMap: Record<string, string> = { '木': '绿色', '火': '红色', '土': '黄色', '金': '白色/金色', '水': '蓝色/黑色' }; return cMap[s] || s; }).join('、')}\n- 避免色：${jiShen.map((s: string) => { const cMap: Record<string, string> = { '木': '绿色', '火': '红色', '土': '黄色', '金': '白色/金色', '水': '蓝色/黑色' }; return cMap[s] || s; }).join('、')}\n\n🪴 摆件建议：\n${yongShen.includes('木') ? '- 绿植（富贵竹、发财树）' : ''}${yongShen.includes('火') ? '\n- 红色饰品、灯具' : ''}${yongShen.includes('土') ? '\n- 水晶、陶瓷摆件' : ''}${yongShen.includes('金') ? '\n- 金属摆件、铜钱' : ''}${yongShen.includes('水') ? '\n- 鱼缸、流水摆件' : ''}`;
  }

  if (question.includes('吉日') || question.includes('时辰') || question.includes('日子')) {
    const now = new Date();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const today = days[now.getDay()];
    const goodHours = yongShen.includes('火') ? '巳时(9-11)、午时(11-13)' :
      yongShen.includes('木') ? '寅时(3-5)、卯时(5-7)' :
      yongShen.includes('金') ? '申时(15-17)、酉时(17-19)' :
      yongShen.includes('水') ? '亥时(21-23)、子时(23-1)' :
      yongShen.includes('土') ? '辰时(7-9)、戌时(19-21)' : '巳时(9-11)';
    return `【近期吉时参考】\n\n今日：周${today}\n\n⏰ 吉时：${goodHours}\n\n适合在当前时段安排重要事宜。\n\n📅 建议避开：与忌神${jiShen.join('、')}对应的时辰。\n\n改运效果最好的时间段通常是用神对应的时辰。`;
  }

  // 通用回答
  return `【道之光AI改命建议】\n\n您的日主为${dm}，命格${strength}。\n\n关于"${question.slice(0, 20)}..."：\n\n命理不是宿命，而是能量地图。知道自己的五行强弱、用神忌神，就能在关键节点做出更好的选择。\n\n核心建议：\n1. 善用用神（${yongShen.join('、')}）的力量\n2. 避开忌神（${jiShen.join('、')}）的干扰\n3. 平衡五行能量，顺势而为\n\n天道即是人道，修行就是修人。命运掌握在自己手中。`;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiPage() {
  const [baziData, setBaziData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('dzs_bazi_result');
    if (stored) {
      try { setBaziData(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    // 模拟AI思考延迟
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const response = generateLocalResponse(msg, baziData);
    const aiMsg: Message = { role: 'assistant', content: response, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#111827] to-[#0a0e17] text-[#e2e8f0] flex flex-col">
      <header className="sticky top-0 z-10 bg-[#0a0e17]/80 backdrop-blur-lg border-b border-[#1e293b]">
        <div className="flex items-center gap-3 px-4 h-12">
          <a href="/" className="text-[#94a3b8] hover:text-[#f59e0b] transition-colors">
            <ArrowLeft size={20} />
          </a>
          <h1 className="text-sm font-semibold">AI改命</h1>
          <span className="text-[10px] text-[#64748b] ml-auto">
            {baziData ? `日主${baziData.dayMaster}` : '未排盘'}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
        {messages.length === 0 ? (
          <>
            {/* 欢迎语 */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0f1525] to-[#1a2332] border border-[#f59e0b]/10 p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-black font-bold text-lg">
                道
              </div>
              <h2 className="text-base font-semibold text-[#f59e0b]">道之光·AI改命</h2>
              <p className="text-xs text-[#64748b] mt-2 leading-relaxed">
                知命不认命，改运先改心。{'\n'}
                基于您的八字命盘，为您提供个性化改命建议。
              </p>
            </div>

            {/* 建议按钮 */}
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s.text)}
                  className="rounded-xl bg-[#0f1525] border border-[#1e293b] p-3 text-left hover:border-[#f59e0b]/20 transition-all active:scale-[0.98]">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs text-[#e2e8f0]">{s.text}</div>
                </button>
              ))}
            </div>

            {/* 排盘提示 */}
            {!baziData && (
              <div className="rounded-2xl bg-[#1a2332] border border-[#2a3a4e] p-4 text-center">
                <p className="text-xs text-[#64748b]">建议先返回首页进行八字排盘，获取更精准的分析</p>
                <a href="/" className="inline-block mt-2 text-xs text-[#f59e0b] underline">去排盘</a>
              </div>
            )}
          </>
        ) : (
          // 消息列表
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                  msg.role === 'user'
                    ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/20'
                    : 'bg-[#0f1525] border border-[#1e293b]'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-[#f59e0b]" />
                      <span className="text-[10px] text-[#f59e0b] font-medium">道之光AI</span>
                    </div>
                  )}
                  <div className="text-sm text-[#e2e8f0] whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <div className="text-[9px] text-[#4a5a6e] mt-2 text-right">
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#0f1525] border border-[#1e293b] p-3.5">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="text-[#f59e0b] animate-spin" />
                    <span className="text-xs text-[#64748b]">正在推算...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="sticky bottom-0 bg-[#0a0e17]/90 backdrop-blur-lg border-t border-[#1e293b] px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="flex-1 bg-[#1a2332] border border-[#2a3a4e] rounded-xl px-4 py-2.5 text-sm text-[#e2e8f0] placeholder-[#4a5a6e] focus:border-[#f59e0b] focus:outline-none"
          />
          <button type="submit" disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[#f59e0b] flex items-center justify-center disabled:opacity-30 transition-all active:scale-95">
            <Send size={16} className="text-black" />
          </button>
        </form>
      </div>
    </div>
  );
}
