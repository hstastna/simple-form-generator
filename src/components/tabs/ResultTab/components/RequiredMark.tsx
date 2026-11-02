import { FC } from 'react';
import { defaultFormTheme } from '@/formThemes';

export const RequiredMark: FC = () => (
  <>
    <span className={defaultFormTheme.requiredMark} aria-hidden="true">
      *
    </span>
    <span className={defaultFormTheme.requiredText}> (required)</span>
  </>
);
