import { z } from 'zod';
import { commonHtmlAttributes } from './shared/commonHtmlAttributes';

const buttonAttributes = {
  type: z.enum(['button', 'submit', 'reset']).optional(),
  form: z.string().optional(),
  formAction: z.string().optional(),
  formEncType: z
    .enum([
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain',
    ])
    .optional(),
  formMethod: z.enum(['get', 'post', 'dialog']).optional(),
  formNoValidate: z.boolean().optional(),
  formTarget: z.string().optional(),
  name: z.string().optional(),
  value: z.string().optional(),
  autoFocus: z.boolean().optional(),
  onClick: z.any().optional(),
};

export const formButtonSchema = z
  .object({
    text: z.string().optional(),
    ...commonHtmlAttributes,
    ...buttonAttributes,
  })
  .strict();
