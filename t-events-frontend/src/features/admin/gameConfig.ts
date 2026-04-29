import { z } from "zod";
import type { EventGameConfigDTO, GameTemplateDTO, TemplateQuestionStatsDTO } from "@/lib/api/types";
import { difficulties, difficultyLabels } from "./labels";

const configFormSchema = z.object({
  easy_pick: z.string(),
  medium_pick: z.string(),
  hard_pick: z.string(),
  easy_score: z.string(),
  medium_score: z.string(),
  hard_score: z.string(),
});

export type AdminGameConfigForm = z.infer<typeof configFormSchema>;

export const defaultConfigForm: AdminGameConfigForm = {
  easy_pick: "0",
  medium_pick: "0",
  hard_pick: "0",
  easy_score: "1",
  medium_score: "2",
  hard_score: "3",
};

export function toConfig(form: AdminGameConfigForm): EventGameConfigDTO {
  return {
    questions_to_pick: {
      easy: Number(form.easy_pick),
      medium: Number(form.medium_pick),
      hard: Number(form.hard_pick),
    },
    score_by_level: {
      easy: Number(form.easy_score),
      medium: Number(form.medium_score),
      hard: Number(form.hard_score),
    },
  };
}

export function configToForm(config: EventGameConfigDTO): AdminGameConfigForm {
  return {
    easy_pick: String(config.questions_to_pick.easy),
    medium_pick: String(config.questions_to_pick.medium),
    hard_pick: String(config.questions_to_pick.hard),
    easy_score: String(config.score_by_level.easy),
    medium_score: String(config.score_by_level.medium),
    hard_score: String(config.score_by_level.hard),
  };
}

export function getTemplateDefaultConfigForm(template: GameTemplateDTO): AdminGameConfigForm {
  if (template.recommended_config) return configToForm(template.recommended_config);

  return {
    easy_pick: template.question_stats.easy > 0 ? "1" : "0",
    medium_pick: template.question_stats.medium > 0 ? "1" : "0",
    hard_pick: template.question_stats.hard > 0 ? "1" : "0",
    easy_score: "1",
    medium_score: "2",
    hard_score: "3",
  };
}

export function validateConfigForm(form: AdminGameConfigForm, questionStats?: TemplateQuestionStatsDTO): string | null {
  const result = createConfigFormSchema(questionStats).safeParse(form);
  return result.success ? null : (result.error.issues[0]?.message ?? "Проверьте правила игры.");
}

function createConfigFormSchema(questionStats?: TemplateQuestionStatsDTO) {
  return configFormSchema.superRefine((form, context) => {
    for (const difficulty of difficulties) {
      const pickKey = `${difficulty}_pick` as keyof AdminGameConfigForm;
      const scoreKey = `${difficulty}_score` as keyof AdminGameConfigForm;
      const label = difficultyLabels[difficulty];
      const pick = parseRequiredNumber(form[pickKey], `Количество вопросов (${label})`, context, pickKey);
      const score = parseRequiredNumber(form[scoreKey], `Баллы за уровень (${label})`, context, scoreKey);
      const available = questionStats?.[difficulty];

      if (pick === undefined || score === undefined) continue;

      if (pick < 0) {
        addIssue(context, pickKey, `Количество вопросов (${label}) не может быть отрицательным.`);
      }
      if (score < 0) {
        addIssue(context, scoreKey, `Баллы за уровень (${label}) не могут быть отрицательными.`);
      }
      if (available !== undefined && pick > available) {
        addIssue(
          context,
          pickKey,
          `В шаблоне доступно вопросов (${label}): ${available}. Уменьшите количество вопросов.`,
        );
      }
      if (pick > 0 && score <= 0) {
        addIssue(
          context,
          scoreKey,
          `Баллы за уровень (${label}) должны быть положительными, если выбраны вопросы.`,
        );
      }
    }
  });
}

function parseRequiredNumber(
  value: string,
  label: string,
  context: z.RefinementCtx,
  path: keyof AdminGameConfigForm,
): number | undefined {
  if (value.trim() === "") {
    addIssue(context, path, `${label} обязательно.`);
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    addIssue(context, path, `${label} должно быть числом.`);
    return undefined;
  }
  return number;
}

function addIssue(context: z.RefinementCtx, path: keyof AdminGameConfigForm, message: string) {
  context.addIssue({
    code: "custom",
    path: [path],
    message,
  });
}
