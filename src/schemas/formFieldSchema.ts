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
  // add more types here for more input types
] as const;

const inputAndTextAreaAttributes = {
  ...eventHandlerAttributes,
  autoComplete: z.string().optional(),
  dirname: z.string().optional(),
  label: z.string().optional(), // custom attribute
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

const textareaAttributes = {
  ...commonHtmlAttributes,
  ...inputAndTextAreaAttributes,
  cols: z.number().optional(),
  rows: z.number().optional(),
  wrap: z.enum(['hard', 'soft']).optional(),
  value: z.string().optional(),
  defaultValue: z.string().optional(),
};

export const formFieldSchema = z.discriminatedUnion('type', [
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
      options: z.array(z.string()).optional(), // custom attributes
      labels: z.array(z.string()).optional(),
      ...inputAttributes,
    })
    .strict(),

  // All other input types schema
  z
    .object({
      type: z.enum(formFieldTypes).exclude(['radio', 'textarea']),
      ...inputAttributes,
    })
    .strict(),
]);
