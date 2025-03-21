'use client';

import React, { FC, MouseEvent } from 'react';
import { useFormContext } from '@/context/FormContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { v4 } from 'uuid';
import { FormField } from './components/FormField';
import { FormButton } from './components/FormButton';
import { FormData } from './components/FormData';

export type ResultFormData = Record<string, string | number | boolean>;

export const ResultTab: FC = () => {
  const { formConfig, parseError } = useFormContext();
  const [formData, setFormData] = useState<ResultFormData>({});
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<ResultFormData>();

  const onSubmit = (data: ResultFormData) => {
    setFormData(data);
  };

  const resetFormWithConfirmation = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (
      window.confirm(
        'Are you sure you want to reset the form? All data will be lost.'
      )
    ) {
      setFormData({});
      reset();
    }
  };

  if (parseError) {
    return (
      <div
        className="p-6 bg-red-200 rounded-md"
        aria-live="assertive"
        role="alert"
      >
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          Cannot render form
        </h2>
        <p className="text-red-600">
          Please fix the JSON errors in the Config tab.
        </p>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div
        className="p-6 bg-yellow-200 rounded-md"
        aria-live="polite"
        role="alert"
      >
        <p className="text-yellow-700">No valid form configuration found</p>
      </div>
    );
  }

  return (
    <div id="panel-result" role="tabpanel" aria-labelledby="tab-result">
      <a
        href="#form-buttons"
        className="sr-only focus:not-sr-only focus:block focus:p-6 focus:mb-4 focus:bg-blue-100 focus:text-blue-700 focus:font-medium focus:rounded-md focus:shadow-sm focus:outline-none"
      >
        Skip to form controls
      </a>

      <h2 id="form-title" className="text-xl font-bold mb-5">
        {formConfig.title}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        title={formConfig.title}
        aria-busy={isSubmitting}
        aria-labelledby="form-title"
      >
        {formConfig.items.map((field) => {
          const fieldId = field.id || v4();

          return (
            <FormField
              key={fieldId}
              field={field}
              register={register}
              error={errors[fieldId]}
            />
          );
        })}

        <div
          id="form-buttons"
          tabIndex={0}
          className="flex justify-end space-x-3 pt-4"
        >
          {formConfig.buttons.map((button) => {
            const buttonId = button.id || v4();

            return (
              <FormButton
                key={buttonId}
                isSubmitting={isSubmitting}
                resetForm={resetFormWithConfirmation}
                {...button}
              >
                {button?.text}
              </FormButton>
            );
          })}
        </div>
      </form>

      {isSubmitSuccessful && (
        <div
          className="mt-8 p-6 bg-lime-200 rounded-md"
          role="status"
          aria-live="polite"
        >
          <h3 className="text-lg font-bold text-green-700">
            Form submitted successfully!
          </h3>
        </div>
      )}

      {Object.keys(formData).length > 0 && <FormData formData={formData} />}
    </div>
  );
};
