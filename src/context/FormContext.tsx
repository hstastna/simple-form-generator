'use client';

import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { z } from 'zod';
import { formConfigSchema } from '@/schemas/formConfigSchema';
import { DEFAULT_FORM_CONFIG } from '@/constants';

type FormConfig = z.infer<typeof formConfigSchema>;

type FormContextType = {
  jsonConfig: string;
  setJsonConfig: (config: string) => void;
  formConfig: FormConfig | null;
  parseError: string | null;
};

type FormProviderProps = {
  children: ReactNode;
};

const FormContext = createContext<FormContextType | null>(null);

export const FormProvider: FC<FormProviderProps> = ({ children }) => {
  const [jsonConfig, setJsonConfig] = useState<string>(DEFAULT_FORM_CONFIG); // string representation of the form config
  const [formConfig, setFormConfig] = useState<FormConfig | null>(() =>
    formConfigSchema.parse(JSON.parse(DEFAULT_FORM_CONFIG))
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const updateJsonConfig = (newConfig: string) => {
    setJsonConfig(newConfig);

    try {
      const parsedConfig = formConfigSchema.parse(JSON.parse(newConfig));
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

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context;
};
