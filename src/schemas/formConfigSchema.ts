import { z } from 'zod';
import { formFieldSchema } from './formFieldSchema';
import { formButtonSchema } from './formButtonSchema';

export const formConfigSchema = z
  .object({
    title: z.string().optional(), // custom: the form heading
    items: z.array(formFieldSchema), // custom: the fields to render
    buttons: z.array(formButtonSchema), // custom: the buttons to render
  })
  .strict()
  .superRefine(({ items }, ctx) => {
    const usedIds = new Set<string>();

    const checkId = (id: string, path: (string | number)[]) => {
      if (usedIds.has(id)) {
        ctx.addIssue({ code: 'custom', message: `Duplicate id "${id}"`, path });
      }

      usedIds.add(id);
    };

    items.forEach((field, index) => {
      const id = field.id || `field-${index}`;
      const path = ['items', index, 'id'];

      checkId(id, path);
      checkId(`${id}-error`, path);

      if (field.type === 'radio') {
        field.options?.forEach((option, optionIndex) => {
          const optionPath = ['items', index, 'options', optionIndex, 'id'];

          checkId(option.id || `${id}-${optionIndex}`, optionPath);
        });
      }
    });
  });

export type FormConfig = z.infer<typeof formConfigSchema>;
