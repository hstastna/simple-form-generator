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

const hasValue = <T extends MinMaxValue>(value?: T): value is T =>
  value !== undefined && value !== '';

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
    ...(hasValue(minLength) && {
      minLength: {
        value: minLength,
        message: `Minimum length is ${minLength} characters`,
      },
    }),
    ...(hasValue(maxLength) && {
      maxLength: {
        value: maxLength,
        message: `Maximum length is ${maxLength} characters`,
      },
    }),
  };

  const numberRules = {
    ...(hasValue(min) && {
      min: { value: Number(min), message: `Minimum value is ${min}` },
    }),
    ...(hasValue(max) && {
      max: { value: Number(max), message: `Maximum value is ${max}` },
    }),
  };

  const dateRules = {
    ...(hasValue(min) && {
      min: { value: String(min), message: `Minimum date is ${min}` },
    }),
    ...(hasValue(max) && {
      max: { value: String(max), message: `Maximum date is ${max}` },
    }),
  };

  switch (type) {
    case 'text':
    case 'textarea':
      return {
        ...requiredRule,
        ...textRules,
      };
    case 'number':
      return {
        ...requiredRule,
        ...numberRules,
      };
    case 'date':
      return {
        ...requiredRule,
        ...dateRules,
      };
    default:
      return requiredRule;
  }
};
