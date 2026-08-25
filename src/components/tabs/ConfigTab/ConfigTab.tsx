'use client';

import { FC, useSyncExternalStore } from 'react';
import { useFormContext } from '@/context/FormContext';
import { ErrorDisplay } from './components/ErrorDisplay';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

const editorInstructionsId = 'form-config-editor-instructions';
const editorHintId = 'form-config-editor-hint';
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
    <div id="panel-config" role="tabpanel" aria-labelledby="tab-config">
      <h2 className="text-xl font-semibold">Form Configuration</h2>

      <div className="mb-6">
        <p
          id={editorInstructionsId}
          className="text-xs mb-2 text-gray-600 dark:text-gray-400"
        >
          Enter your form configuration in JSON format below:
        </p>
      </div>

      <div className="relative">
        <CodeMirror
          value={jsonConfig}
          // an aria-label prop would land on the wrapper div, which is never focused
          extensions={[
            json(),
            EditorView.contentAttributes.of({
              'aria-label': 'JSON Form Configuration Editor',
              'aria-describedby': `${editorInstructionsId} ${editorHintId}`,
              'aria-invalid': parseError ? 'true' : 'false',
            }),
          ]}
          className="h-128 border border-gray-500 rounded-md overflow-auto focus-within:[outline-style:auto] focus-within:outline-offset-2 [&_.cm-editor.cm-focused]:outline-none! dark:border-gray-400"
          theme={isDarkMode ? 'dark' : 'light'}
          onChange={setJsonConfig}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              (event.target as HTMLElement).blur();
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

        <div
          id={editorHintId}
          className="mt-2 text-xs text-gray-600 dark:text-gray-400"
        >
          <kbd className="px-1.5 py-0.5 bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
            Tab
          </kbd>{' '}
          to indent,{' '}
          <kbd className="ml-1 px-1.5 py-0.5 bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
            Shift+Tab
          </kbd>{' '}
          to unindent,{' '}
          <kbd className="ml-1 px-1.5 py-0.5 bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
            Esc
          </kbd>{' '}
          to exit the editor
        </div>
      </div>

      <ErrorDisplay error={parseError} />
    </div>
  );
};
