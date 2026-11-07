import { FormTheme, tailwindFormTheme } from '@/formThemes';

export const tabs = ['config', 'result', 'code'] as const;

type CodeVariant = {
  id: string;
  label: string;
  theme?: FormTheme;
  requirement?: string;
};

export const codeVariants: readonly CodeVariant[] = [
  { id: 'unstyled', label: 'Unstyled' },
  {
    id: 'tailwind',
    label: 'Tailwind CSS',
    theme: tailwindFormTheme,
    requirement: 'Tailwind CSS v4.1 or later',
  },
];

export const RESET_CONFIRM_MESSAGE =
  'Are you sure you want to reset the form? All data will be lost.';

export const DEFAULT_FORM_CONFIG = JSON.stringify(
  {
    title: 'Sample Form',
    items: [
      {
        id: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
      },
      {
        id: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to the newsletter',
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        type: 'reset',
        onClick: 'reset',
      },
      {
        text: 'Save',
        type: 'submit',
      },
    ],
  },
  null,
  2
);
