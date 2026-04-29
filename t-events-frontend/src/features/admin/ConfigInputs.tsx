import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { difficulties, difficultyLabels } from "./labels";
import type { AdminGameConfigForm } from "./gameConfig";
import type { TemplateQuestionStatsDTO } from "@/lib/api/types";

type Props = {
  form: AdminGameConfigForm;
  setForm: (value: AdminGameConfigForm) => void;
  questionStats?: TemplateQuestionStatsDTO | undefined;
  disabled?: boolean | undefined;
};

export default function ConfigInputs({ disabled = false, form, questionStats, setForm }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {difficulties.map((difficulty) => {
        const pickKey = `${difficulty}_pick` as keyof AdminGameConfigForm;
        const scoreKey = `${difficulty}_score` as keyof AdminGameConfigForm;
        const available = questionStats?.[difficulty];
        return (
          <Card key={difficulty} className="p-3">
            <Typography as="h3" size="sm" weight="bold" className="capitalize">
              {difficultyLabels[difficulty]}
            </Typography>
            {available !== undefined && (
              <Typography className="mt-1 text-neutral-600" size="sm">
                Доступно вопросов: {available}
              </Typography>
            )}
            <div className="mt-3 space-y-3">
              <Input
                label="Вопросов в игре"
                type="number"
                min={0}
                max={available}
                value={form[pickKey]}
                onChange={(e) => setForm({ ...form, [pickKey]: e.target.value })}
                disabled={disabled}
                required
              />
              <Input
                label="Баллов за ответ"
                type="number"
                min={0}
                value={form[scoreKey]}
                onChange={(e) => setForm({ ...form, [scoreKey]: e.target.value })}
                disabled={disabled}
                required
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
