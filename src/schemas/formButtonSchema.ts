import { z } from 'zod';
import { commonHtmlAttributes } from './shared/commonHtmlAttributes';
import { eventHandlerAttributes } from './shared/eventHandlerAttributes';
import { formOwnerAttributes } from './shared/formOwnerAttributes';

const buttonAttributes = {
  type: z.enum(['button', 'submit', 'reset']).optional(),
  ...formOwnerAttributes,
  value: z.string().optional(),
};

export const formButtonSchema = z
  .object({
    text: z.string().optional(),
    ...commonHtmlAttributes,
    ...eventHandlerAttributes,
    ...buttonAttributes,
  })
  .strict();
