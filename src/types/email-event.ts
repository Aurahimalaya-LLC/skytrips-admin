export enum EmailEventType {
  UserCreated = "user.created",
}

export type EmailEvent = {
  type: EmailEventType;
  data: Record<string, string>;
}