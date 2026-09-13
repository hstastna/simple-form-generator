import { z } from 'zod';
import { formFieldSchema } from './formFieldSchema';
import { formButtonSchema } from './formButtonSchema';

export const formConfigSchema = z
  .object({
    title: z.string().optional(), // custom: the form heading
    items: z.array(formFieldSchema), // custom: the fields to render
    buttons: z.array(formButtonSchema), // custom: the buttons to render
  })
  .strict();
