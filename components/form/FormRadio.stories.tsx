import type { Meta, StoryObj } from '@storybook/react';
import FormRadio from './FormRadio';

const meta: Meta<typeof FormRadio> = {
  title: 'Form/FormRadio',
  component: FormRadio,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="max-w-sm p-6 bg-background-dark text-white rounded-2xl space-y-2">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof FormRadio>;

export const OptionUnchecked: Story = {
  args: {
    name: 'payment',
    value: 'pix',
    label: 'PIX'
  }
};

export const OptionChecked: Story = {
  args: {
    name: 'payment',
    value: 'dinheiro',
    label: 'Dinheiro',
    defaultChecked: true
  }
};
