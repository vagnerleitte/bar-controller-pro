import type { Meta, StoryObj } from '@storybook/react';
import FormInput from './FormInput';

const meta: Meta<typeof FormInput> = {
  title: 'Form/FormInput',
  component: FormInput,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="max-w-sm p-6 bg-background-dark text-white rounded-2xl">
        <Story />
      </div>
    )
  ],
  args: {
    placeholder: 'Digite aqui...'
  }
};

export default meta;
type Story = StoryObj<typeof FormInput>;

export const Text: Story = {
  args: {
    type: 'text'
  }
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '••••••'
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Campo desabilitado',
    onChange: () => undefined
  }
};
