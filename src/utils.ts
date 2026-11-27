import { z } from 'zod';

type MinMaxValue = number | string;

type ValidationProps = {
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: MinMaxValue;
  max?: MinMaxValue;
  pattern?: string;
  title?: string;
  readOnly?: boolean;
  disabled?: boolean;
  multiple?: boolean;
};

type ValidationRule<T> = { value: T; message: string };

export type ValidationRules = {
  required: ValidationRule<boolean>;
  minLength?: ValidationRule<number>;
  maxLength?: ValidationRule<number>;
  min?: ValidationRule<MinMaxValue>;
  max?: ValidationRule<MinMaxValue>;
  pattern?: ValidationRule<RegExp>;
  validate?: (value: unknown) => true | string;
  disabled?: boolean;
};

// the HTML spec's own definition of a valid email address
export const emailPattern =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const typeMismatchMessages = {
  email: 'Please enter an email address',
  url: 'Please enter a URL',
};

export const getReversedTimeRangeMessage = (
  min: MinMaxValue,
  max: MinMaxValue
) => `Time must be ${min} or later, or ${max} or earlier`;

export const dateTimeSchemas = {
  date: z.iso.date(),
  time: z.iso.time(),
  'datetime-local': z.iso.datetime({ local: true }),
  month: z.string().regex(/^\d{4,}-(0[1-9]|1[0-2])$/),
  week: z.string().regex(/^\d{4,}-W(0[1-9]|[1-4]\d|5[0-3])$/),
};

export type DateTimeType = keyof typeof dateTimeSchemas;

export const isDateTimeType = (type: string): type is DateTimeType =>
  Object.hasOwn(dateTimeSchemas, type);

const hasValue = <T extends MinMaxValue>(value?: T): value is T =>
  value !== undefined && value !== '';

// HTML drops a pattern that is invalid on its own, then matches it against the whole value
export const getPatternRule = (pattern: string, title?: string) => {
  try {
    new RegExp(pattern, 'v');
  } catch {
    return undefined;
  }

  return {
    pattern: {
      value: new RegExp(`^(?:${pattern})$`, 'v'),
      message: title
        ? `Please match the requested format: ${title}`
        : 'Please match the requested format',
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
  title,
  readOnly,
  disabled,
  multiple,
}: ValidationProps): ValidationRules => {
  const isReadOnlyText =
    readOnly && !['checkbox', 'radio', 'file'].includes(type);
  const shouldSkipValidation = disabled || isReadOnlyText || type === 'hidden';

  const requiredRule = {
    required: {
      value: Boolean(required) && !shouldSkipValidation,
      message:
        required && !shouldSkipValidation ? 'This field is required' : '',
    },
  };

  if (shouldSkipValidation) {
    return disabled ? { ...requiredRule, disabled } : requiredRule;
  }

  const textRules = {
    ...(pattern && getPatternRule(pattern, title)),
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

  const dateNoun = type === 'datetime-local' ? 'date and time' : type;
  const dateRules = {
    ...(hasValue(min) && {
      min: { value: String(min), message: `Minimum ${dateNoun} is ${min}` },
    }),
    ...(hasValue(max) && {
      max: { value: String(max), message: `Maximum ${dateNoun} is ${max}` },
    }),
  };

  switch (type) {
    case 'text':
    case 'textarea':
    case 'password':
    case 'search':
    case 'tel':
      return {
        ...requiredRule,
        ...textRules,
      };
    case 'email': {
      // HTML matches the pattern of a multiple email field against each address
      const { pattern: patternRule, ...lengthRules } = textRules;

      return {
        ...requiredRule,
        ...(multiple ? lengthRules : textRules),
        validate: (value) => {
          const emails = multiple ? String(value).split(',') : [String(value)];

          if (!value) {
            return true;
          }

          if (!emails.every((email) => emailPattern.test(email))) {
            return typeMismatchMessages.email;
          }

          return (
            !multiple ||
            !patternRule ||
            emails.every((email) => patternRule.value.test(email)) ||
            patternRule.message
          );
        },
      };
    }
    case 'url':
      return {
        ...requiredRule,
        ...textRules,
        validate: (value) =>
          !value || URL.canParse(String(value)) || typeMismatchMessages.url,
      };
    case 'number':
      return {
        ...requiredRule,
        ...numberRules,
      };
    case 'time':
      // a time range with min after max wraps around midnight
      return hasValue(min) && hasValue(max) && String(min) > String(max)
        ? {
            ...requiredRule,
            validate: (value) =>
              !value ||
              String(value) >= String(min) ||
              String(value) <= String(max) ||
              getReversedTimeRangeMessage(min, max),
          }
        : { ...requiredRule, ...dateRules };
    case 'date':
    case 'datetime-local':
    case 'month':
    case 'week':
      return {
        ...requiredRule,
        ...dateRules,
      };
    default:
      return requiredRule;
  }
};

export const getNextTabIndex = (
  key: string,
  currentIndex: number,
  tabCount: number
) => {
  const lastIndex = tabCount - 1;

  switch (key) {
    case 'ArrowLeft':
      return currentIndex === 0 ? lastIndex : currentIndex - 1;
    case 'ArrowRight':
      return currentIndex === lastIndex ? 0 : currentIndex + 1;
    case 'Home':
      return 0;
    case 'End':
      return lastIndex;
    default:
      return undefined;
  }
};
