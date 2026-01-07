import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttributeMultiSelect from '../../components/AttributeMultiSelect';

describe('AttributeMultiSelect', () => {
  it('removing a chip calls onChange without that attribute', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <AttributeMultiSelect
        value={['Barks', 'Blind']}
        onChange={onChange}
        availableAttributes={['Barks', 'Blind', 'Escaper']}
      />
    );

    const chipText = screen.getByText('Barks');
    const chip = chipText.closest('span') as HTMLElement;
    const removeButton = within(chip).getByRole('button');
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['Blind']);
  });

  it('adding from dropdown calls onChange with new attribute', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <AttributeMultiSelect
        value={[]}
        onChange={onChange}
        availableAttributes={['Barks', 'Escaper']}
      />
    );

    await user.click(screen.getByRole('button', { name: /▼/i }));
    const optionCheckbox = screen.getByLabelText('Barks');
    await user.click(optionCheckbox);

    expect(onChange).toHaveBeenCalledWith(['Barks']);
  });
});


