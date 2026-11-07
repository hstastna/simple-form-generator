import { FC } from 'react';
import { tailwindFormTheme } from '@/formThemes';

export const RequiredMark: FC = () => (
  <>
    <span className={tailwindFormTheme.requiredMark} aria-hidden="true">
      *
    </span>
    <span className={tailwindFormTheme.requiredText}> (required)</span>
  </>
);
