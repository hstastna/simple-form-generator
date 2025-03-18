type MinMaxValue = number | string;

type ValidationProps = {
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: MinMaxValue;
  max?: MinMaxValue;
};

export type ValidationRules = {
  required: { value: boolean; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: MinMaxValue; message: string };
  max?: { value: MinMaxValue; message: string };
};

export const getValidationRules = ({
  type,
  required,
  minLength,
  maxLength,
  min,
  max,
}: ValidationProps): ValidationRules => {
  const requiredRule = {
    required: {
      value: Boolean(required),
      message: required ? 'This field is required' : '',
    },
  };

  const textRules = {
    ...(minLength && {
      minLength: {
        value: minLength,
        message: `Minimum length is ${minLength} characters`,
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `Maximum length is ${maxLength} characters`,
      },
    }),
  };

  const numberRules = {
    ...(min && {
      min: { value: Number(min), message: `Minimum value is ${min}` },
    }),
    ...(max && {
      max: { value: Number(max), message: `Maximum value is ${max}` },
    }),
  };

  const dateRules = {
    ...(min && {
      min: { value: String(min), message: `Minimum date is ${min}` },
    }),
    ...(max && {
      max: { value: String(max), message: `Maximum date is ${max}` },
    }),
  };

  switch (type) {
    case 'text':
    case 'number':
    case 'date':
      return {
        ...requiredRule,
        ...textRules,
        ...numberRules,
        ...dateRules,
      };
    case 'textarea':
      return {
        ...requiredRule,
        ...textRules,
      };
    default:
      return requiredRule;
  }
};
