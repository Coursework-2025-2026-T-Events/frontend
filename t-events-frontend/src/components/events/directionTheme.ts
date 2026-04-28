import {
  Atom,
  BrainCircuit,
  Calculator,
  Code2,
  Database,
  Gamepad2,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DirectionVisualType =
  | "code"
  | "game"
  | "security"
  | "data"
  | "design"
  | "mobile"
  | "ai"
  | "physics"
  | "math"
  | "default";

export type DirectionTheme = {
  Icon: LucideIcon;
  description: string;
  visual: DirectionVisualType;
};

type DirectionThemeRule = DirectionTheme & {
  pattern: RegExp;
};

const directionThemeRules: DirectionThemeRule[] = [
  {
    Icon: Calculator,
    visual: "math",
    pattern: /(math|матем|алгебр|геометр|тригонометр|уравнен|числ)/i,
    description: "Решайте задачи на числа, формулы и логику, где важны внимательность и точный ход решения.",
  },
  {
    Icon: Atom,
    visual: "physics",
    pattern: /(physics|физик|механик|квант|атом|электр|оптик)/i,
    description: "Решайте задачи про законы движения, энергию, поля и эксперименты, где важны логика и точность.",
  },
  {
    Icon: Palette,
    visual: "design",
    pattern: /(design|дизайн|ui|ux|интерфейс|график)/i,
    description: "Создавайте понятные интерфейсы, работайте с визуалом и собирайте решения, которые хочется открыть.",
  },
  {
    Icon: ShieldCheck,
    visual: "security",
    pattern: /(security|безопас|кибер|защит|ctf|crypto|крипто)/i,
    description: "Проверяйте внимательность, ищите уязвимости и решайте задания на цифровую безопасность.",
  },
  {
    Icon: Database,
    visual: "data",
    pattern: /(data|данн|sql|аналит|баз|database)/i,
    description: "Разбирайтесь с данными, находите закономерности и превращайте факты в решения.",
  },
  {
    Icon: Smartphone,
    visual: "mobile",
    pattern: /(mobile|мобил|android|ios|app|прилож)/i,
    description: "Собирайте идеи для приложений, проходите задания про мобильный опыт и продуктовую логику.",
  },
  {
    Icon: BrainCircuit,
    visual: "ai",
    pattern: /(ai|ml|ии|нейро|машин|интеллект)/i,
    description: "Экспериментируйте с умными алгоритмами, логикой моделей и задачами про искусственный интеллект.",
  },
  {
    Icon: Gamepad2,
    visual: "game",
    pattern: /(game|игр|гейм|quiz|квиз)/i,
    description: "Проходите игровые задания, пробуйте разные форматы и двигайтесь дальше шаг за шагом.",
  },
  {
    Icon: Code2,
    visual: "code",
    pattern: /(code|код|program|программ|разработ|web|frontend|backend|алгоритм)/i,
    description: "Решайте задачи на код, логику и разработку, разбираясь в идеях и подходах на практике.",
  },
];

const defaultDirectionTheme: DirectionTheme = {
  Icon: Sparkles,
  visual: "default",
  description: "Откройте игры направления, проходите задания и знакомьтесь с темой через практику.",
};

export function getDirectionTheme(name: string): DirectionTheme {
  return directionThemeRules.find((rule) => rule.pattern.test(name.toLowerCase())) ?? defaultDirectionTheme;
}
