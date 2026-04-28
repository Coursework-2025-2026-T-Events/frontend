export type AdminEventForm = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  timezone: string;
  small_reward_percent: string;
  big_reward_percent: string;
};

const eventFieldLabels: Record<keyof AdminEventForm, string> = {
  title: "название",
  description: "описание",
  start_time: "время начала",
  end_time: "время окончания",
  timezone: "часовой пояс",
  small_reward_percent: "процент малого приза",
  big_reward_percent: "процент большого приза",
};

const scheduleFields: Array<keyof AdminEventForm> = ["start_time", "end_time", "timezone"];
const textFields: Array<keyof AdminEventForm> = ["title", "description", "timezone", "small_reward_percent", "big_reward_percent"];

function normalizeFieldValue(field: keyof AdminEventForm, value: string): string {
  return textFields.includes(field) ? value.trim() : value;
}

export function getChangedEventFields(current: AdminEventForm, loaded: AdminEventForm): Array<keyof AdminEventForm> {
  return (Object.keys(eventFieldLabels) as Array<keyof AdminEventForm>).filter(
    (field) => normalizeFieldValue(field, current[field]) !== normalizeFieldValue(field, loaded[field])
  );
}

export function getChangedEventFieldLabels(current: AdminEventForm, loaded: AdminEventForm): string[] {
  return getChangedEventFields(current, loaded).map((field) => eventFieldLabels[field]);
}

export function hasEventFormChanges(current: AdminEventForm, loaded: AdminEventForm): boolean {
  return getChangedEventFields(current, loaded).length > 0;
}

export function hasScheduleChanges(current: AdminEventForm, loaded: AdminEventForm): boolean {
  return scheduleFields.some(
    (field) => normalizeFieldValue(field, current[field]) !== normalizeFieldValue(field, loaded[field])
  );
}
