'use client';

import React, { FC } from 'react';
import {
  ButtonHTMLAttributes,
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';
import { FormField } from '@/components/tabs/ResultTab/components/FormField';
import { formConfigSchema } from '@/schemas/formConfigSchema';
import { DEFAULT_FORM_CONFIG } from '@/constants';

type FormConfig = {
  title: string;
  items: FormField[];
  buttons: (ButtonHTMLAttributes<HTMLButtonElement> & { text: string })[];
};

type FormContextType = {
  jsonConfig: string;
  setJsonConfig: (config: string) => void;
  formConfig: FormConfig | null;
  parseError: string | null;
};

type FormProviderProps = {
  children: ReactNode;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: FC<FormProviderProps> = ({ children }) => {
  const [jsonConfig, setJsonConfig] = useState<string>(DEFAULT_FORM_CONFIG); // string representation of the form config
  const [formConfig, setFormConfig] = useState<FormConfig | null>( // parsed form config object
    JSON.parse(DEFAULT_FORM_CONFIG)
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const updateJsonConfig = (newConfig: string) => {
    setJsonConfig(newConfig);

    try {
      const parsedConfig = JSON.parse(newConfig);
      formConfigSchema.parse(parsedConfig); // Validate the JSON using Zod
      setFormConfig(parsedConfig);
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  return (
    <FormContext.Provider
      value={{
        jsonConfig,
        setJsonConfig: updateJsonConfig,
        formConfig,
        parseError,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);

  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context;
};
