import { z } from 'zod';
import { formFieldSchema } from './formFieldSchema';
import { formButtonSchema } from './formButtonSchema';

export const formConfigSchema = z
  .object({
    title: z.string(),
    items: z.array(formFieldSchema),
    buttons: z.array(formButtonSchema),
  })
  .strict();
