'use client';

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
  useSyncExternalStore,
} from 'react';
import { FormConfig, formConfigSchema } from '@/schemas/formConfigSchema';
import { CONFIG_STORAGE_KEY, DEFAULT_FORM_CONFIG } from '@/constants';

type FormContextType = {
  jsonConfig: string;
  setJsonConfig: (config: string) => void;
  savedConfig: string | null;
  saveConfig: () => void;
  removeSavedConfig: () => void;
  formConfig: FormConfig | null;
  parseError: string | null;
};

type FormProviderProps = {
  children: ReactNode;
};

const FormContext = createContext<FormContextType | null>(null);

const savedConfigListeners = new Set<() => void>();

const subscribeToSavedConfig = (listener: () => void) => {
  savedConfigListeners.add(listener);

  return () => {
    savedConfigListeners.delete(listener);
  };
};

// localStorage throws when the browser blocks site data
const readSavedConfig = () => {
  try {
    return localStorage.getItem(CONFIG_STORAGE_KEY);
  } catch {
    return null;
  }
};

const parseJsonConfig = (jsonConfig: string) => {
  try {
    return {
      formConfig: formConfigSchema.parse(JSON.parse(jsonConfig)),
      parseError: null,
    };
  } catch (error) {
    return {
      formConfig: null,
      parseError: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
};

export const FormProvider: FC<FormProviderProps> = ({ children }) => {
  const savedConfig = useSyncExternalStore(
    subscribeToSavedConfig,
    readSavedConfig,
    () => null
  );
  const [editedConfig, setEditedConfig] = useState<string | null>(null);
  const jsonConfig = editedConfig ?? savedConfig ?? DEFAULT_FORM_CONFIG;
  const { formConfig, parseError } = parseJsonConfig(jsonConfig);

  const saveConfig = () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, jsonConfig);
    savedConfigListeners.forEach((listener) => listener());
  };

  const removeSavedConfig = () => {
    setEditedConfig(jsonConfig);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    savedConfigListeners.forEach((listener) => listener());
  };

  return (
    <FormContext.Provider
      value={{
        jsonConfig,
        setJsonConfig: setEditedConfig,
        savedConfig,
        saveConfig,
        removeSavedConfig,
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
