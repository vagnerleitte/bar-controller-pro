import type { Meta, StoryObj } from '@storybook/react';
import FormLabel from './FormLabel';

const meta: Meta<typeof FormLabel> = {
  title: 'Form/FormLabel',
  component: FormLabel,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="max-w-sm p-6 bg-background-dark text-white rounded-2xl">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof FormLabel>;

export const Default: Story = {
  args: {
    children: 'CPF'
  }
};
