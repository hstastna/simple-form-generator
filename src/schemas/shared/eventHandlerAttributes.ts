import { z } from 'zod';

const handlerName = z
  .string()
  .regex(/^[A-Za-z_$][\w$]*$/, 'Must be a handler name, such as "reset"')
  .optional();

export const eventHandlerAttributes = {
  onClick: handlerName,
  onChange: handlerName,
  onFocus: handlerName,
  onBlur: handlerName,
  onMouseDown: handlerName,
  onMouseUp: handlerName,
  onKeyDown: handlerName,
  onKeyUp: handlerName,
};

export type EventHandlerName = keyof typeof eventHandlerAttributes;

export const eventHandlerNames = Object.keys(
  eventHandlerAttributes
) as EventHandlerName[];
