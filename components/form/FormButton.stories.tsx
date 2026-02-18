import type { Meta, StoryObj } from '@storybook/react';
import FormButton from './FormButton';

const meta: Meta<typeof FormButton> = {
  title: 'Form/FormButton',
  component: FormButton,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="max-w-sm p-6 bg-background-dark text-white rounded-2xl">
        <Story />
      </div>
    )
  ],
  args: {
    children: 'Salvar'
  }
};

export default meta;
type Story = StoryObj<typeof FormButton>;

export const Primary: Story = {
  args: { variant: 'primary' }
};

export const Secondary: Story = {
  args: { variant: 'secondary' }
};

export const Ghost: Story = {
  args: { variant: 'ghost' }
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Excluir' }
};
