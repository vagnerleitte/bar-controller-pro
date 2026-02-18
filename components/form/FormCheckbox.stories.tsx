import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import FormCheckbox from './FormCheckbox';

const meta: Meta<typeof FormCheckbox> = {
  title: 'Form/FormCheckbox',
  component: FormCheckbox,
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
type Story = StoryObj<typeof FormCheckbox>;

export const Unchecked: Story = {
  args: {
    label: 'Receber notificações'
  }
};

export const Checked: Story = {
  args: {
    label: 'Receber notificações',
    defaultChecked: true
  }
};

export const Disabled: Story = {
  args: {
    label: 'Receber notificações',
    disabled: true
  }
};
