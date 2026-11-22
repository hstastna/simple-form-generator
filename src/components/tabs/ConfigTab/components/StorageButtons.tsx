import { FC, useRef } from 'react';
import { flushSync } from 'react-dom';
import { LuSave, LuTrash2 } from 'react-icons/lu';
import { DEFAULT_FORM_CONFIG } from '@/constants';
import { useFormContext } from '@/context/FormContext';

const buttonClassName =
  'shrink-0 flex items-center gap-1.5 px-2 py-1 text-sm rounded border border-gray-500 bg-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-neutral-700 dark:focus-visible:outline-blue-400';

export const StorageButtons: FC = () => {
  const { jsonConfig, savedConfig, saveConfig, removeSavedConfig } =
    useFormContext();
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);

  // the clicked button disappears, so focus moves to the other one
  const saveToBrowser = () => {
    flushSync(saveConfig);
    removeButtonRef.current?.focus();
  };

  const removeFromBrowser = () => {
    flushSync(removeSavedConfig);
    saveButtonRef.current?.focus();
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {jsonConfig !== (savedConfig ?? DEFAULT_FORM_CONFIG) && (
        <button
          ref={saveButtonRef}
          type="button"
          onClick={saveToBrowser}
          className={buttonClassName}
        >
          <LuSave aria-hidden="true" />
          Save to browser
        </button>
      )}
      {savedConfig !== null && (
        <button
          ref={removeButtonRef}
          type="button"
          onClick={removeFromBrowser}
          className={buttonClassName}
        >
          <LuTrash2 aria-hidden="true" />
          Remove from browser
        </button>
      )}
    </div>
  );
};
