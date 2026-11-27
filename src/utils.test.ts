import { describe, it, expect } from '@jest/globals';
import { getNextTabIndex, getValidationRules } from '@/utils';

const noRequired = { required: { value: false, message: '' } };

describe('getValidationRules', () => {
  it('reports a required field', () => {
    expect(getValidationRules({ type: 'text', required: true })).toEqual({
      required: { value: true, message: 'This field is required' },
    });
  });

  it('skips every rule on a read-only text control, as HTML does', () => {
    expect(
      getValidationRules({
        type: 'text',
        required: true,
        minLength: 2,
        readOnly: true,
      })
    ).toEqual(noRequired);
  });

  it('keeps the required rule on a read-only checkbox, as HTML does', () => {
    expect(
      getValidationRules({ type: 'checkbox', required: true, readOnly: true })
    ).toEqual({
      required: { value: true, message: 'This field is required' },
    });
  });

  it('skips every rule on a hidden input, as HTML does', () => {
    expect(getValidationRules({ type: 'hidden', required: true })).toEqual(
      noRequired
    );
  });

  it('skips every rule on a disabled control and passes disabled on', () => {
    expect(
      getValidationRules({
        type: 'text',
        required: true,
        minLength: 2,
        disabled: true,
      })
    ).toEqual({ ...noRequired, disabled: true });
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

  it('anchors a text pattern the way HTML does', () => {
    const { pattern } = getValidationRules({ type: 'text', pattern: '[a-z]+' });

    expect(pattern?.message).toBe('Please match the requested format');
    expect(pattern?.value.test('abc')).toBe(true);
    expect(pattern?.value.test('123abc')).toBe(false);
  });

  it('appends the title to the pattern message, as browsers do', () => {
    const { pattern } = getValidationRules({
      type: 'text',
      pattern: '[0-9]{5}',
      title: 'Five digits',
    });

    expect(pattern?.message).toBe(
      'Please match the requested format: Five digits'
    );
  });

  it('keeps an alternation inside the anchors', () => {
    const { pattern } = getValidationRules({ type: 'text', pattern: 'a|b' });

    expect(pattern?.value.test('ab')).toBe(false);
  });

  it('reads a pattern with the v RegExp flag, as browsers do', () => {
    const { pattern } = getValidationRules({
      type: 'text',
      pattern: '[\\p{L}--[a-z]]',
    });

    expect(pattern?.value.test('A')).toBe(true);
    expect(pattern?.value.test('a')).toBe(false);
  });

  it('drops a pattern that is invalid on its own, as browsers do', () => {
    expect(
      getValidationRules({ type: 'text', pattern: '[' }).pattern
    ).toBeUndefined();
    expect(
      getValidationRules({ type: 'text', pattern: 'a)|(b' }).pattern
    ).toBeUndefined();
  });

  it('leaves a pattern off number and date fields, as HTML does', () => {
    expect(
      getValidationRules({ type: 'number', pattern: '[0-9]+' }).pattern
    ).toBeUndefined();
    expect(
      getValidationRules({ type: 'date', pattern: '[0-9]+' }).pattern
    ).toBeUndefined();
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

  it('applies text rules to the other text input types, as HTML does', () => {
    for (const type of ['password', 'search', 'tel', 'email', 'url']) {
      expect(getValidationRules({ type, minLength: 2 }).minLength).toEqual({
        value: 2,
        message: 'Minimum length is 2 characters',
      });
    }
  });

  it('checks the email format the way HTML defines it', () => {
    const { validate } = getValidationRules({ type: 'email' });

    expect(validate?.('')).toBe(true);
    expect(validate?.('jane.doe@example.com')).toBe(true);
    expect(validate?.('jane.doe')).toBe('Please enter an email address');
    expect(validate?.('jane@doe.com,john@doe.com')).toBe(
      'Please enter an email address'
    );
  });

  it('checks every address of an email field with multiple', () => {
    const { validate } = getValidationRules({ type: 'email', multiple: true });

    expect(validate?.('jane@doe.com,john@doe.com')).toBe(true);
    expect(validate?.('jane@doe.com,john')).toBe(
      'Please enter an email address'
    );
  });

  it('checks the URL format with the URL parser', () => {
    const { validate } = getValidationRules({ type: 'url' });

    expect(validate?.('https://example.com')).toBe(true);
    expect(validate?.('example.com')).toBe('Please enter a URL');
  });

  it('matches a pattern against each address of a multiple email field', () => {
    const { pattern, validate } = getValidationRules({
      type: 'email',
      multiple: true,
      pattern: '.+@x\\.cz',
    });

    expect(pattern).toBeUndefined();
    expect(validate?.('a@x.cz,b@x.cz')).toBe(true);
    expect(validate?.('a@y.cz,b@x.cz')).toBe(
      'Please match the requested format'
    );
    expect(validate?.('a@x.cz,b')).toBe('Please enter an email address');
  });

  it('wraps a reversed time range around midnight, as HTML does', () => {
    const { min, max, validate } = getValidationRules({
      type: 'time',
      min: '22:00',
      max: '06:00',
    });

    expect(min ?? max).toBeUndefined();
    expect(validate?.('23:00')).toBe(true);
    expect(validate?.('05:30')).toBe(true);
    expect(validate?.('12:00')).toBe(
      'Time must be 22:00 or later, or 06:00 or earlier'
    );
  });

  it('names the type in the bound messages of time fields', () => {
    expect(getValidationRules({ type: 'time', min: '09:00' }).min).toEqual({
      value: '09:00',
      message: 'Minimum time is 09:00',
    });
    expect(
      getValidationRules({ type: 'datetime-local', max: '2026-12-31T18:00' })
        .max
    ).toEqual({
      value: '2026-12-31T18:00',
      message: 'Maximum date and time is 2026-12-31T18:00',
    });
  });

  it('returns only the required rule for other types', () => {
    expect(getValidationRules({ type: 'checkbox', min: 5 })).toEqual(
      noRequired
    );
  });
});

describe('getNextTabIndex', () => {
  it('moves to the neighbouring tab with the arrow keys', () => {
    expect(getNextTabIndex('ArrowRight', 0, 3)).toBe(1);
    expect(getNextTabIndex('ArrowLeft', 2, 3)).toBe(1);
  });

  it('wraps around at both ends', () => {
    expect(getNextTabIndex('ArrowRight', 2, 3)).toBe(0);
    expect(getNextTabIndex('ArrowLeft', 0, 3)).toBe(2);
  });

  it('jumps to the first tab on Home and the last on End', () => {
    expect(getNextTabIndex('Home', 1, 3)).toBe(0);
    expect(getNextTabIndex('End', 1, 3)).toBe(2);
  });

  it('returns undefined for any other key', () => {
    expect(getNextTabIndex('Enter', 1, 3)).toBeUndefined();
  });
});
