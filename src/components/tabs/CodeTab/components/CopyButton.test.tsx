import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { CopyButton } from './CopyButton';

const mockClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
};

const clickCopy = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
  });
};

describe('CopyButton', () => {
  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });

  it('copies the text and announces it', async () => {
    const writeText = jest.fn<(text: string) => Promise<void>>(() =>
      Promise.resolve()
    );
    mockClipboard(writeText);
    render(<CopyButton text="const a = 1;" />);

    await clickCopy();

    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    expect(screen.getByRole('button', { name: 'Copy' }).textContent).toBe(
      'Copied'
    );
    expect(screen.getByRole('status').textContent).toBe('Copied');
  });

  it('reports a failure when the clipboard is unavailable', async () => {
    render(<CopyButton text="const a = 1;" />);

    await clickCopy();

    expect(screen.getByRole('status').textContent).toBe('Copy failed');
  });

  it('clears the status after 2 seconds', async () => {
    jest.useFakeTimers();
    mockClipboard(() => Promise.resolve());
    render(<CopyButton text="const a = 1;" />);

    await clickCopy();
    act(() => jest.advanceTimersByTime(1999));
    expect(screen.getByRole('status').textContent).toBe('Copied');

    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByRole('button', { name: 'Copy' }).textContent).toBe(
      'Copy'
    );
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('restarts the 2 seconds on a repeated click', async () => {
    jest.useFakeTimers();
    mockClipboard(() => Promise.resolve());
    render(<CopyButton text="const a = 1;" />);

    await clickCopy();
    act(() => jest.advanceTimersByTime(1500));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    act(() => jest.advanceTimersByTime(1500));

    expect(screen.getByRole('status').textContent).toBe('Copied');
  });
});
