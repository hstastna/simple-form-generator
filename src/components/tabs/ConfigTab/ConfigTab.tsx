'use client';

import { FC, useSyncExternalStore } from 'react';
import { useFormContext } from '@/context/FormContext';
import { ErrorDisplay } from './components/ErrorDisplay';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

const editorId = 'form-config-editor';
const darkModeQuery = '(prefers-color-scheme: dark)';

const subscribeToDarkMode = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(darkModeQuery);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
};

export const ConfigTab: FC = () => {
  const { jsonConfig, setJsonConfig, parseError } = useFormContext();
  const isDarkMode = useSyncExternalStore(
    subscribeToDarkMode,
    () => window.matchMedia(darkModeQuery).matches,
    () => false
  );

  return (
    <>
      <div
        id="panel-config"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="tab-config"
      >
        <h2 className="text-xl font-semibold">Form Configuration</h2>

        <div className="-mt-1 mb-6">
          <label
            htmlFor={editorId}
            className="text-xs mb-2 text-gray-600 dark:text-gray-400"
          >
            Enter your form configuration in JSON format below:
          </label>
        </div>

        <div className="relative" aria-live="polite" aria-atomic="true">
          <CodeMirror
            id={editorId}
            value={jsonConfig}
            extensions={[json()]}
            className="h-[32rem] border border-gray-400 rounded-md overflow-auto"
            theme={isDarkMode ? 'dark' : 'light'}
            aria-label="JSON Form Configuration Editor"
            onChange={setJsonConfig}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                (event.target as HTMLTextAreaElement).blur();
              }
            }}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              tabSize: 2,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true,
            }}
          />

          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
              Tab
            </kbd>{' '}
            to indent,
            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
              Shift+Tab
            </kbd>{' '}
            to unindent,
            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
              Esc
            </kbd>{' '}
            to exit the editor
          </div>
        </div>
      </div>
      <ErrorDisplay error={parseError} />
    </>
  );
};
