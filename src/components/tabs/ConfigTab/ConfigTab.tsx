'use client';

import React, { FC, useEffect, useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { ErrorDisplay } from './components/ErrorDisplay';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

const editorId = 'form-config-editor';

export const ConfigTab: FC = () => {
  const { jsonConfig, setJsonConfig, parseError } = useFormContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window) {
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );
      setIsDarkMode(Boolean(darkModeMediaQuery.matches));

      const handleChange = (event: MediaQueryListEvent) => {
        setIsDarkMode(Boolean(event.matches));
      };

      darkModeMediaQuery.addEventListener('change', handleChange);

      return () => {
        darkModeMediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  const handleChange = React.useCallback(
    (value: string) => {
      setJsonConfig(value);
    },
    [setJsonConfig]
  );

  return (
    <>
      <div
        id="panel-config"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="tab-config"
      >
        <h2 className="text-xl font-semibold mb-4">Form Configuration</h2>

        <div className="mb-4">
          <label htmlFor={editorId} className="text-sm mb-2 text-gray-600">
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
            onChange={handleChange}
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

          <div className="mt-2 text-sm text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">
              Tab
            </kbd>{' '}
            to indent,
            <kbd className="ml-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded">
              Shift+Tab
            </kbd>{' '}
            to unindent,
            <kbd className="ml-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded">
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
