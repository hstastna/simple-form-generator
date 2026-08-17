import { SyntheticEvent } from 'react';
import {
  EventHandlerName,
  eventHandlerNames,
} from '@/schemas/shared/eventHandlerAttributes';

export const formActionNames = ['reset', 'clear'] as const;

export type FormActionName = (typeof formActionNames)[number];

export type FormAction = (event: SyntheticEvent) => void;

export type FormActions = Record<FormActionName, FormAction>;

type WithResolvedHandlers<T> = T extends object
  ? Omit<T, EventHandlerName> & Partial<Record<EventHandlerName, FormAction>>
  : never;

const isEventHandlerName = (key: string): key is EventHandlerName =>
  (eventHandlerNames as string[]).includes(key);

const isFormActionName = (value: unknown): value is FormActionName =>
  typeof value === 'string' &&
  (formActionNames as readonly string[]).includes(value);

export const withResolvedHandlers = <T extends object>(
  config: T,
  actions: FormActions
): WithResolvedHandlers<T> => {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (!isEventHandlerName(key)) {
      resolved[key] = value;
      continue;
    }

    // names outside formActionNames belong to the generated code, not the preview
    if (isFormActionName(value)) {
      resolved[key] = actions[value];
    }
  }

  return resolved as WithResolvedHandlers<T>;
};
