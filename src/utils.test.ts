import { describe, it, expect } from '@jest/globals';
import { getValidationRules } from '@/utils';

const noRequired = { required: { value: false, message: '' } };

describe('getValidationRules', () => {
  it('reports a required field', () => {
    expect(getValidationRules({ type: 'text', required: true })).toEqual({
      required: { value: true, message: 'This field is required' },
    });
  });

  it('uses value messages and numeric bounds for number fields', () => {
    expect(getValidationRules({ type: 'number', min: 5, max: 10 })).toEqual({
      ...noRequired,
      min: { value: 5, message: 'Minimum value is 5' },
      max: { value: 10, message: 'Maximum value is 10' },
    });
  });

  it('uses date messages and string bounds for date fields', () => {
    expect(
      getValidationRules({ type: 'date', min: '2024-01-01', max: '2024-12-31' })
    ).toEqual({
      ...noRequired,
      min: { value: '2024-01-01', message: 'Minimum date is 2024-01-01' },
      max: { value: '2024-12-31', message: 'Maximum date is 2024-12-31' },
    });
  });

  it('keeps a zero bound', () => {
    expect(getValidationRules({ type: 'number', min: 0 })).toEqual({
      ...noRequired,
      min: { value: 0, message: 'Minimum value is 0' },
    });
  });

  it('drops an empty bound', () => {
    expect(getValidationRules({ type: 'number', min: '', max: '' })).toEqual(
      noRequired
    );
    expect(getValidationRules({ type: 'date', min: '' })).toEqual(noRequired);
  });

  it('applies length rules to text and textarea', () => {
    const lengthRules = {
      ...noRequired,
      minLength: { value: 2, message: 'Minimum length is 2 characters' },
      maxLength: { value: 8, message: 'Maximum length is 8 characters' },
    };

    expect(
      getValidationRules({ type: 'text', minLength: 2, maxLength: 8 })
    ).toEqual(lengthRules);
    expect(
      getValidationRules({ type: 'textarea', minLength: 2, maxLength: 8 })
    ).toEqual(lengthRules);
  });

  it('returns only the required rule for other types', () => {
    expect(getValidationRules({ type: 'checkbox', min: 5 })).toEqual(
      noRequired
    );
  });
});
