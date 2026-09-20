type MinMaxValue = number | string;

type ValidationProps = {
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: MinMaxValue;
  max?: MinMaxValue;
  pattern?: string;
};

type ValidationRule<T> = { value: T; message: string };

export type ValidationRules = {
  required: ValidationRule<boolean>;
  minLength?: ValidationRule<number>;
  maxLength?: ValidationRule<number>;
  min?: ValidationRule<MinMaxValue>;
  max?: ValidationRule<MinMaxValue>;
  pattern?: ValidationRule<RegExp>;
};

const hasValue = <T extends MinMaxValue>(value?: T): value is T =>
  value !== undefined && value !== '';

// HTML drops a pattern that is invalid on its own, then matches it against the whole value
const getPatternRule = (pattern: string) => {
  try {
    new RegExp(pattern, 'v');
  } catch {
    return undefined;
  }

  return {
    pattern: {
      value: new RegExp(`^(?:${pattern})$`, 'v'),
      message: 'Please match the requested format',
    },
  };
};

export const getValidationRules = ({
  type,
  required,
  minLength,
  maxLength,
  min,
  max,
  pattern,
}: ValidationProps): ValidationRules => {
  const requiredRule = {
    required: {
      value: Boolean(required),
      message: required ? 'This field is required' : '',
    },
  };

  const textRules = {
    ...(pattern && getPatternRule(pattern)),
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
