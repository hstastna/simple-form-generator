import { z } from 'zod';

export const formOwnerAttributes = {
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
};
