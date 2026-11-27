import { z } from 'zod';
import { commonHtmlAttributes } from './shared/commonHtmlAttributes';
import { eventHandlerAttributes } from './shared/eventHandlerAttributes';
import { formOwnerAttributes } from './shared/formOwnerAttributes';

export const formFieldTypes = [
  'number',
  'text',
  'textarea',
  'checkbox',
  'date',
  'radio',
  'email',
  'password',
  'search',
  'tel',
  'url',
  'time',
  'datetime-local',
  'month',
  'week',
  'color',
  'range',
  'file',
  'hidden',
  'button',
  'submit',
  'reset',
  'image',
] as const;

const inputAndTextAreaAttributes = {
  ...eventHandlerAttributes,
  autoComplete: z.string().optional(),
  dirname: z.string().optional(),
  label: z.string().optional(), // custom: FormLabel renders it
  maxLength: z.number().optional(),
  minLength: z.number().optional(),
  placeholder: z.string().optional(),
  readOnly: z.boolean().optional(),
  required: z.boolean().optional(),
};

const inputAttributes = {
  ...commonHtmlAttributes,
  ...inputAndTextAreaAttributes,
  accept: z.string().optional(),
  alt: z.string().optional(),
  capture: z.union([z.boolean(), z.enum(['user', 'environment'])]).optional(),
  checked: z.boolean().optional(),
  defaultChecked: z.boolean().optional(), // custom: React's editable preset; "checked" pins the box
  defaultValue: z.union([z.string(), z.number()]).optional(), // custom: React's editable preset; "value" pins the input
  ...formOwnerAttributes,
  height: z.union([z.string(), z.number()]).optional(),
  list: z.string().optional(),
  max: z.union([z.string(), z.number()]).optional(),
  min: z.union([z.string(), z.number()]).optional(),
  multiple: z.boolean().optional(),
  pattern: z.string().optional(),
  size: z.number().optional(),
  src: z.string().optional(),
  step: z.union([z.string(), z.number()]).optional(),
  value: z.union([z.string(), z.number()]).optional(),
  width: z.union([z.string(), z.number()]).optional(),
};

export const radioOptionSchema = z
  .object({
    ...commonHtmlAttributes,
    label: z.string().optional(), // custom: FormLabel renders it
    value: z.union([z.string(), z.number()]).optional(),
    checked: z.boolean().optional(),
    defaultChecked: z.boolean().optional(), // custom: React's editable preset; "checked" pins the radio
    required: z.boolean().optional(),
  })
  .strict();

export type RadioOption = z.infer<typeof radioOptionSchema>;

const textareaAttributes = {
  ...commonHtmlAttributes,
  ...inputAndTextAreaAttributes,
  cols: z.number().optional(),
  rows: z.number().optional(),
  wrap: z.enum(['hard', 'soft']).optional(),
  text: z.string().optional(), // custom: the textarea child text
};

const formFieldVariants = z.discriminatedUnion('type', [
  // Textarea schema
  z
    .object({
      type: z.literal('textarea'),
      ...textareaAttributes,
    })
    .strict(),

  z
    .object({
      type: z.literal('radio'),
      options: z.array(radioOptionSchema).optional(), // custom: one radio per entry, with its own attributes
      ...inputAttributes,
    })
    .strict(),

  // a hidden input has no label
  z
    .object({
      type: z.literal('hidden'),
      ...inputAttributes,
    })
    .omit({ label: true })
    .strict(),

  // a button input is named by its value or alt, not by a label
  z
    .object({
      type: z.enum(['button', 'submit', 'reset', 'image']),
      ...inputAttributes,
    })
    .omit({ label: true })
    .strict(),

  // All other input types schema
  z
    .object({
      type: z
        .enum(formFieldTypes)
        .exclude([
          'radio',
          'textarea',
          'hidden',
          'button',
          'submit',
          'reset',
          'image',
        ]),
      ...inputAttributes,
    })
    .strict(),
]);

export const formFieldSchema = formFieldVariants
  .superRefine((field, ctx) => {
    for (const key of ['value', 'defaultValue'] as const) {
      if (field.type === 'file' && field[key] !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'A file input cannot have a value or defaultValue',
          path: [key],
        });
      }
    }
  })
  .superRefine((field, ctx) => {
    const hasAriaName = Boolean(
      field['aria-label'] || field['aria-labelledby']
    );
    const addNameIssue = (name: string, key: string) =>
      ctx.addIssue({
        code: 'custom',
        message: `Add ${name}, aria-label or aria-labelledby so the field has an accessible name`,
        path: [key],
      });

    switch (field.type) {
      case 'hidden':
      case 'submit':
      case 'reset':
        return;

      case 'button':
        if ((field.value === undefined || field.value === '') && !hasAriaName) {
          addNameIssue('a value', 'value');
        }
        return;

      case 'image':
        if (!field.alt && !hasAriaName) {
          addNameIssue('alt', 'alt');
        }
        return;

      default:
        if (!field.label && !hasAriaName) {
          addNameIssue('a label', 'label');
        }
    }
  });
