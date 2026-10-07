import { describe, it, expect } from '@jest/globals';
import { formConfigSchema } from '@/schemas/formConfigSchema';

const button = { text: 'Save', type: 'submit' };

describe('unique field ids', () => {
  it('accepts a config where every id is used once', () => {
    const result = formConfigSchema.safeParse({
      items: [
        { id: 'name', type: 'text', label: 'Name' },
        { id: 'agree', type: 'checkbox', label: 'Agree' },
      ],
      buttons: [button],
    });

    expect(result.success).toBe(true);
  });

  it('rejects two fields sharing an id', () => {
    const result = formConfigSchema.safeParse({
      items: [
        { id: 'name', type: 'text', label: 'Name' },
        { id: 'name', type: 'text', label: 'Nickname' },
      ],
      buttons: [button],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['items', 1, 'id']);
  });

  it('rejects an id that repeats a field-<index> fallback', () => {
    const result = formConfigSchema.safeParse({
      items: [
        { type: 'text', label: 'Name' },
        { id: 'field-0', type: 'text', label: 'Nickname' },
      ],
      buttons: [button],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['items', 1, 'id']);
  });

  it('rejects a field id that repeats a radio option id', () => {
    const result = formConfigSchema.safeParse({
      items: [
        {
          id: 'plan',
          type: 'radio',
          label: 'Plan',
          options: [{ value: 'pro' }],
        },
        { id: 'plan-0', type: 'text', label: 'Pro details' },
      ],
      buttons: [button],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['items', 1, 'id']);
  });

  it('rejects an option id that repeats a field id', () => {
    const result = formConfigSchema.safeParse({
      items: [
        { id: 'nick', type: 'text', label: 'Nick' },
        {
          id: 'plan',
          type: 'radio',
          label: 'Plan',
          options: [{ id: 'nick', value: 'pro' }],
        },
      ],
      buttons: [button],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual([
      'items',
      1,
      'options',
      0,
      'id',
    ]);
  });

  it("rejects a field id that repeats another field's error id", () => {
    const result = formConfigSchema.safeParse({
      items: [
        { id: 'nick', type: 'text', label: 'Nick' },
        { id: 'nick-error', type: 'text', label: 'Error' },
      ],
      buttons: [button],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['items', 1, 'id']);
  });

  it('rejects an id with whitespace', () => {
    const result = formConfigSchema.safeParse({
      items: [{ id: 'full name', type: 'text', label: 'Name' }],
      buttons: [button],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['items', 0, 'id']);
  });
});
