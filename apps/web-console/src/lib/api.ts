// ============================================================
// DZS Web Console — API 客户端
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// 八字排盘
// ============================================================
export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: string;
  longitude?: number;
  birthPlace?: string;
  useTrueSolar?: boolean;
}

export interface BaziPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  full: string;
  nayin: string;
  hiddenStems: string[];
  kongWang: string[];
  tenGod?: string;
}

export interface BaziResult {
  pillars: {
    year: BaziPillar;
    month: BaziPillar;
    day: BaziPillar;
    hour: BaziPillar;
  };
  dayMaster: string;
  dayMasterElement: string;
  gender: string;
  elementBalance: {
    scores: Record<string, number>;
    percentage: Record<string, number>;
    totalScore: number;
  };
  strength: {
    bodyStrength: string;
    strengthScore: number;
    deLing: boolean;
    deDi: boolean;
    deShi: boolean;
    rootBranches: string[];
    supportPower: number;
    opposePower: number;
    description: string;
  };
  usefulGod: {
    yongShen: string[];
    xiShen: string[];
    jiShen: string[];
  };
  trueSolarTime?: {
    hour: number;
    minute: number;
    shichen: string;
    crossed: boolean;
    offsetMinutes: number;
  };
}

export async function calculateBazi(input: BaziInput): Promise<BaziResult> {
  const { data } = await api.post<BaziResult>('/bazi/calculate', input);
  return data;
}

// ============================================================
// 五行能量分析
// ============================================================
export interface EnergyAnalysisInput {
  baziResult: BaziResult;
  monthBranch: string;
  currentYear?: number;
}

export interface EnergyField {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface WuxingEnergyResult {
  energyField: {
    wood: { base: number; seasonalBoost: number; finalScore: number; finalPercent: number };
    fire: { base: number; seasonalBoost: number; finalScore: number; finalPercent: number };
    earth: { base: number; seasonalBoost: number; finalScore: number; finalPercent: number };
    metal: { base: number; seasonalBoost: number; finalScore: number; finalPercent: number };
    water: { base: number; seasonalBoost: number; finalScore: number; finalPercent: number };
  };
  totalEnergy: number;
  dominantElement: string;
  balanceState: string;
  stability: number;
}

export async function analyzeEnergy(input: EnergyAnalysisInput): Promise<WuxingEnergyResult> {
  const { data } = await api.post<WuxingEnergyResult>('/energy/analyze', input);
  return data;
}

// ============================================================
// 九宫飞星
// ============================================================
export interface PalaceData {
  position: number;
  name: string;
  direction: string;
  star: { number: number; name: string; type: string; wuxing: string };
  energy: number;
  rating: string;
  suitable?: string[];
  avoid?: string[];
}

export interface NinePalaceResult {
  palaces: PalaceData[];
  summary: {
    bestDirection: string;
    worstDirection: string;
    auspiciousStars: string[];
    inauspiciousStars: string[];
  };
  conflicts: Array<{ type: string; palaces: string[]; severity: string; description: string; remedy?: string }>;
}

export async function calculateNinePalaceApi(year: number, month: number, day: number): Promise<NinePalaceResult> {
  const { data } = await api.post<NinePalaceResult>('/nine-palace/calculate', { year, month, day });
  return data;
}

// ============================================================
// AI 生成
// ============================================================
export interface AiGenerateInput {
  type: 'daily' | 'bazi' | 'fengshui' | 'ritual';
  prompt: string;
  systemPrompt: string;
  baziData?: BaziResult;
  energyData?: WuxingEnergyResult;
}

export interface AiGenerateResult {
  output: string;
  validation: { passed: boolean; errors: string[]; warnings: string[] };
  tokenUsage: { prompt: number; completion: number; total: number };
  riskCheck: { passed: boolean; warnings: string[] };
}

export async function generateAI(input: AiGenerateInput): Promise<AiGenerateResult> {
  const { data } = await api.post<AiGenerateResult>('/ai/generate', input);
  return data;
}

// ============================================================
// CV 空间扫描
// ============================================================
export interface CVScanResult {
  elements: Array<{
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    wuxing: string;
  }>;
  palaceMapping: Record<string, Array<{ type: string; x: number; y: number }>>;
  conflicts: Array<{ type: string; description: string; severity: string }>;
  advice: Array<{ type: string; content: string }>;
}

export async function analyzeCVScan(formData: FormData): Promise<CVScanResult> {
  const { data } = await api.post<CVScanResult>('/cv/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ============================================================
// 验证状态
// ============================================================
export interface ValidationStatus {
  passed: boolean;
  errors: number;
  warnings: number;
  lastCheck: string;
}

export async function getValidationStatus(): Promise<ValidationStatus> {
  const { data } = await api.get<ValidationStatus>('/validation/status');
  return data;
}

export default api;
