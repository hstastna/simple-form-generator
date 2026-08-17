import { describe, it, expect } from '@jest/globals';
import { FormActions, withResolvedHandlers } from '@/formActions';

const actions: FormActions = {
  reset: () => {},
  clear: () => {},
};

describe('withResolvedHandlers', () => {
  it('replaces a built-in action name with the action itself', () => {
    const resolved = withResolvedHandlers({ onClick: 'clear' }, actions);

    expect(resolved.onClick).toBe(actions.clear);
  });

  it('drops a handler name that is not a built-in action', () => {
    const resolved = withResolvedHandlers({ onClick: 'saveToApi' }, actions);

    expect('onClick' in resolved).toBe(false);
  });

  it('resolves every handler key', () => {
    const resolved = withResolvedHandlers(
      { onFocus: 'clear', onKeyUp: 'reset' },
      actions
    );

    expect(resolved.onFocus).toBe(actions.clear);
    expect(resolved.onKeyUp).toBe(actions.reset);
  });

  it('leaves the other keys untouched', () => {
    const button = { text: 'Clear', type: 'button', onClick: 'clear' };

    expect(withResolvedHandlers(button, actions)).toEqual({
      text: 'Clear',
      type: 'button',
      onClick: actions.clear,
    });
  });
});
