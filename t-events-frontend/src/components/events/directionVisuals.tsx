import clsx from "clsx";
import { ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";
import type { DirectionTheme, DirectionVisualType } from "./directionTheme";

type DirectionVisualProps = {
  className?: string;
  selected: boolean;
  theme: DirectionTheme;
};

type VisualSceneProps = {
  selected: boolean;
};

const surface = "absolute rounded-[var(--radius-md)] bg-white shadow-[var(--shadow-card)]";
const lineMuted = "rounded-full bg-[#e4e9f0]";
const lineBlue = "rounded-full bg-[#4d8dff]";
const lineYellow = "rounded-full bg-[var(--color-brand-yellow)]";
const lineInk = "rounded-full bg-[var(--color-brand-ink)]";

function CodeScene() {
  return (
    <>
      <div className="absolute left-20 right-5 top-5 rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] p-3 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-brand-yellow)]" />
          <span className="h-2 w-2 rounded-full bg-[#4d8dff]" />
          <span className="h-2 w-2 rounded-full bg-white/55" />
        </div>
        <div className="grid gap-1.5">
          <span className="h-2 w-2/3 rounded-full bg-white/70" />
          <span className="h-2 w-4/5 rounded-full bg-[var(--color-brand-yellow)]" />
          <span className="h-2 w-1/2 rounded-full bg-[#4d8dff]" />
          <span className="h-2 w-3/5 rounded-full bg-white/45" />
        </div>
      </div>
      <div className={`${surface} bottom-5 left-7 h-8 w-24`} />
      <div className="absolute bottom-5 right-8 h-8 w-16 rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] shadow-[var(--shadow-card)]" />
    </>
  );
}

function MathScene() {
  return (
    <>
      <div className={`${surface} left-20 top-6 h-24 w-36 p-4`}>
        <span className="block text-[30px] font-bold leading-8 text-[var(--color-brand-ink)]">x + y</span>
        <span className={`mt-3 block h-2 w-24 ${lineYellow}`} />
        <span className={`mt-2 block h-2 w-16 ${lineBlue}`} />
      </div>
      <div className={`${surface} bottom-6 right-7 h-20 w-28 p-3`}>
        <span className="absolute bottom-4 left-4 h-12 w-0.5 rounded-full bg-[var(--color-brand-ink)]" />
        <span className="absolute bottom-4 left-4 h-0.5 w-20 rounded-full bg-[var(--color-brand-ink)]" />
        <span className="absolute bottom-8 left-7 h-10 w-16 rotate-[-18deg] rounded-[50%] border-2 border-[#4d8dff] border-b-transparent border-l-transparent" />
        <span className="absolute right-4 top-3 rounded-full bg-[var(--color-brand-yellow)] px-2 py-0.5 text-[12px] font-bold leading-4 text-[var(--color-brand-ink)]">
          =
        </span>
      </div>
    </>
  );
}

function DesignScene() {
  return (
    <>
      <div className={`${surface} left-20 top-6 grid h-24 w-36 grid-cols-2 gap-2 p-3`}>
        <span className="rounded-full bg-[#4d8dff]" />
        <span className="rounded-full bg-[var(--color-brand-yellow)]" />
        <span className="rounded-full bg-[var(--color-brand-ink)]" />
        <span className="rounded-full bg-[#f0d5ff]" />
      </div>
      <div className={`${surface} bottom-6 right-7 h-20 w-28 p-3`}>
        <span className={`block h-4 w-16 ${lineYellow}`} />
        <span className={`mt-3 block h-3 ${lineMuted}`} />
        <span className={`mt-2 block h-3 w-3/4 ${lineBlue}`} />
      </div>
    </>
  );
}

function SecurityScene() {
  return (
    <>
      <div className="absolute left-24 top-5 flex h-24 w-24 items-center justify-center rounded-[24px] bg-[var(--color-brand-yellow)] shadow-[var(--shadow-card)]">
        <ShieldCheck className="h-12 w-12 text-[var(--color-brand-ink)]" aria-hidden />
      </div>
      <span className="absolute bottom-8 left-20 h-3 w-3 rounded-full bg-[#4d8dff]" />
      <span className="absolute right-12 top-9 h-3 w-3 rounded-full bg-[var(--color-brand-ink)]" />
      <span className="absolute bottom-9 right-20 h-3 w-3 rounded-full bg-[#4d8dff]" />
      <span className="absolute bottom-12 left-24 h-0.5 w-28 rotate-[-16deg] rounded-full bg-[var(--color-brand-line)]" />
      <span className="absolute right-16 top-14 h-0.5 w-24 rotate-[28deg] rounded-full bg-[var(--color-brand-line)]" />
    </>
  );
}

function DataScene() {
  return (
    <>
      <div className={`${surface} left-20 top-7 flex h-24 w-24 flex-col justify-end gap-2 p-3`}>
        <span className="h-6 rounded-t-[var(--radius-md)] bg-[#4d8dff]" />
        <span className="h-11 rounded-t-[var(--radius-md)] bg-[var(--color-brand-yellow)]" />
        <span className="h-8 rounded-t-[var(--radius-md)] bg-[var(--color-brand-ink)]" />
      </div>
      <div className="absolute bottom-7 right-8 h-20 w-28 rounded-[50%/18%] bg-[var(--color-brand-ink)] shadow-[var(--shadow-card)]">
        <span className="absolute left-0 top-0 h-7 w-full rounded-[50%] bg-[#4d8dff]" />
        <span className="absolute left-0 top-6 h-7 w-full rounded-[50%] bg-[var(--color-brand-yellow)]" />
        <span className="absolute left-0 top-12 h-7 w-full rounded-[50%] bg-white" />
      </div>
    </>
  );
}

function MobileScene() {
  return (
    <>
      <div className="absolute left-[92px] top-5 h-28 w-16 rotate-[-7deg] rounded-[18px] bg-[var(--color-brand-ink)] p-2 shadow-[var(--shadow-card)]">
        <div className="h-full rounded-[12px] bg-white p-2">
          <span className={`block h-3 w-7 ${lineBlue}`} />
          <span className="mt-3 block h-8 rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)]" />
          <span className={`mt-2 block h-3 ${lineMuted}`} />
          <span className={`mt-1.5 block h-3 w-2/3 ${lineMuted}`} />
        </div>
      </div>
      <div className={`${surface} bottom-7 right-8 h-16 w-28 p-3`}>
        <span className={`block h-3 ${lineYellow}`} />
        <span className={`mt-2 block h-3 w-4/5 ${lineBlue}`} />
        <span className={`mt-2 block h-3 w-2/3 ${lineMuted}`} />
      </div>
    </>
  );
}

function AiScene() {
  return (
    <>
      <div className={`${surface} left-24 top-7 h-24 w-28 rounded-[32px]`} />
      <span className="absolute left-[122px] top-12 h-5 w-5 rounded-full bg-[var(--color-brand-yellow)]" />
      <span className="absolute left-[168px] top-10 h-4 w-4 rounded-full bg-[#4d8dff]" />
      <span className="absolute left-[150px] top-[86px] h-5 w-5 rounded-full bg-[var(--color-brand-ink)]" />
      <span className="absolute left-[134px] top-[62px] h-0.5 w-12 rotate-[-18deg] rounded-full bg-[var(--color-brand-line)]" />
      <span className="absolute left-[142px] top-[82px] h-0.5 w-11 rotate-[36deg] rounded-full bg-[var(--color-brand-line)]" />
      <div className={`${surface} bottom-7 right-7 grid h-16 w-24 grid-cols-3 gap-2 p-3`}>
        <span className="rounded-full bg-[#4d8dff]" />
        <span className="rounded-full bg-[var(--color-brand-yellow)]" />
        <span className="rounded-full bg-[var(--color-brand-ink)]" />
      </div>
    </>
  );
}

function PhysicsScene() {
  return (
    <>
      <div className={`${surface} left-24 top-7 flex h-24 w-24 items-center justify-center rounded-full`}>
        <span className="h-5 w-5 rounded-full bg-[var(--color-brand-yellow)]" />
        <span className="absolute h-16 w-28 rotate-12 rounded-full border-2 border-[#4d8dff]" />
        <span className="absolute h-16 w-28 rotate-[72deg] rounded-full border-2 border-[var(--color-brand-ink)] opacity-85" />
        <span className="absolute h-16 w-28 rotate-[-42deg] rounded-full border-2 border-[var(--color-brand-yellow)]" />
      </div>
      <span className="absolute bottom-8 left-20 h-3 w-3 rounded-full bg-[#4d8dff] shadow-[var(--shadow-card)]" />
      <span className="absolute right-12 top-11 h-4 w-4 rounded-full bg-[var(--color-brand-yellow)] shadow-[var(--shadow-card)]" />
      <div className={`${surface} bottom-7 right-8 h-16 w-28 p-3`}>
        <span className={`block h-2 w-10 ${lineInk}`} />
        <span className={`mt-3 block h-2 w-16 ${lineBlue}`} />
        <span className={`mt-3 block h-2 w-12 ${lineYellow}`} />
      </div>
    </>
  );
}

function GameScene() {
  return (
    <>
      <div className="absolute left-20 top-8 h-20 w-36 rounded-[26px] bg-[var(--color-brand-ink)] shadow-[var(--shadow-card)]">
        <span className="absolute left-5 top-8 h-3 w-10 rounded-full bg-white" />
        <span className="absolute left-8 top-5 h-10 w-3 rounded-full bg-white" />
        <span className="absolute right-9 top-7 h-4 w-4 rounded-full bg-[var(--color-brand-yellow)]" />
        <span className="absolute right-5 top-10 h-4 w-4 rounded-full bg-[#4d8dff]" />
      </div>
      <span className="absolute bottom-6 left-24 h-7 w-7 rotate-12 rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] shadow-[var(--shadow-card)]" />
      <span className="absolute bottom-8 right-16 h-8 w-8 rounded-full bg-white shadow-[var(--shadow-card)]" />
    </>
  );
}

function DefaultScene() {
  return (
    <>
      <div className={`${surface} left-20 top-7 h-24 w-32 p-4`}>
        <span className={`block h-4 w-16 ${lineYellow}`} />
        <span className={`mt-4 block h-3 ${lineMuted}`} />
        <span className={`mt-2 block h-3 w-2/3 ${lineBlue}`} />
      </div>
      <span className="absolute bottom-7 right-10 h-12 w-12 rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] shadow-[var(--shadow-card)]" />
    </>
  );
}

const visualScenes: Record<DirectionVisualType, ComponentType<VisualSceneProps>> = {
  ai: AiScene,
  code: CodeScene,
  data: DataScene,
  default: DefaultScene,
  design: DesignScene,
  game: GameScene,
  math: MathScene,
  mobile: MobileScene,
  physics: PhysicsScene,
  security: SecurityScene,
};

export function DirectionVisual({ className, theme, selected }: DirectionVisualProps) {
  const Icon = theme.Icon;
  const Scene = visualScenes[theme.visual];

  return (
    <div
      className={clsx(
        "relative h-40 overflow-hidden rounded-t-[var(--radius-lg)] bg-[var(--color-brand-panel)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(254,221,46,0.5),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(18,109,247,0.14),transparent_25%),linear-gradient(135deg,#ffffff_0%,#f6f7f8_100%)]" />
      <div className="absolute left-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] text-white shadow-[var(--shadow-card)]">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <Scene selected={selected} />
      {selected && <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-brand-yellow)]" />}
    </div>
  );
}
