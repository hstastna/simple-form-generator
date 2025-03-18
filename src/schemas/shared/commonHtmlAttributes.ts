import { z } from 'zod';

export const commonHtmlAttributes = {
  id: z.string().optional(),
  className: z.string().optional(),
  style: z.record(z.string(), z.string()).optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  lang: z.string().optional(),
  dir: z.enum(['ltr', 'rtl', 'auto']).optional(),
  tabIndex: z.number().optional(),
  hidden: z.boolean().optional(),
  disabled: z.boolean().optional(),
  draggable: z.boolean().optional(),
  accessKey: z.string().optional(),
  contentEditable: z.boolean().optional(),
  spellCheck: z.boolean().optional(),
  translate: z.enum(['yes', 'no']).optional(),
  autoCapitalize: z
    .enum(['off', 'none', 'on', 'sentences', 'words', 'characters'])
    .optional(),
  autoFocus: z.boolean().optional(),
  form: z.string().optional(),

  // Accessibility attributes
  'aria-label': z.string().optional(),
  'aria-describedby': z.string().optional(),
  'aria-labelledby': z.string().optional(),
  'data-testid': z.string().optional(),
  role: z.string().optional(),

  // Common event handlers
  onClick: z.any().optional(),
  onFocus: z.any().optional(),
  onBlur: z.any().optional(),
  onMouseDown: z.any().optional(),
  onMouseUp: z.any().optional(),
  onKeyDown: z.any().optional(),
  onKeyUp: z.any().optional(),
};
