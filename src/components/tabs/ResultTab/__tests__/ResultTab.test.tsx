import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { FormProvider, useFormContext } from '@/context/FormContext';
import { ResultTab } from '../ResultTab';

const config = JSON.stringify({
  title: 'Handler form',
  items: [{ id: 'name', type: 'text', label: 'Name' }],
  buttons: [{ text: 'Clear', onClick: 'clear' }],
});

const ConfigLoader: FC = () => {
  const { setJsonConfig } = useFormContext();

  return <button onClick={() => setJsonConfig(config)}>load config</button>;
};

describe('ResultTab handler names', () => {
  it('runs the built-in action named in the JSON config', async () => {
    render(
      <FormProvider>
        <ConfigLoader />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const input = await screen.findByLabelText<HTMLInputElement>('Name');
    fireEvent.change(input, { target: { value: 'Hilda' } });
    expect(input.value).toBe('Hilda');

    fireEvent.click(screen.getByText('Clear'));

    await waitFor(() => expect(input.value).toBe(''));
  });
});
