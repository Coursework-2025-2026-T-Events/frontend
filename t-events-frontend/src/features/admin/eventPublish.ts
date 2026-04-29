import { ApiError } from "@/lib/api/client";
import type { PublishReadinessIssueDTO, PublishValidationErrorDTO } from "@/lib/api/types";
import type { AdminEventSettingsTab } from "./SettingsTabButton";

export type PublishIssuesBySection = Record<AdminEventSettingsTab, PublishReadinessIssueDTO[]>;

export const emptyPublishIssuesBySection = (): PublishIssuesBySection => ({
  details: [],
  directions: [],
  games: [],
  publish: [],
});

export function getPublishValidationDetails(error: unknown): PublishValidationErrorDTO[] {
  if (!(error instanceof ApiError)) return [];
  if (!Array.isArray(error.details)) return [];
  return error.details.filter(isPublishValidationError);
}

export function toPublishReadinessIssues(details: PublishValidationErrorDTO[]): PublishReadinessIssueDTO[] {
  return details.map((detail) => ({
    code: detail.code,
    message: detail.message,
    section: "publish",
    field: detail.field,
  }));
}

export function getEffectivePublishIssues(
  readinessIssues: PublishReadinessIssueDTO[],
  validationDetails: PublishValidationErrorDTO[],
): PublishReadinessIssueDTO[] {
  return readinessIssues.length > 0 ? readinessIssues : toPublishReadinessIssues(validationDetails);
}

export function groupPublishIssuesBySection(issues: PublishReadinessIssueDTO[]): PublishIssuesBySection {
  return issues.reduce<PublishIssuesBySection>((groups, issue) => {
    groups[issue.section].push(issue);
    return groups;
  }, emptyPublishIssuesBySection());
}

function isPublishValidationError(value: unknown): value is PublishValidationErrorDTO {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.code === "string" &&
    (item.field === undefined || typeof item.field === "string") &&
    typeof item.message === "string"
  );
}
