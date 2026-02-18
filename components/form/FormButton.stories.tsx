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

export const ContainedPrimary: Story = {
  args: { variant: 'contained', tone: 'primary' }
};

export const ContainedDanger: Story = {
  args: { variant: 'contained', tone: 'danger', children: 'Excluir' }
};

export const ContainedSuccess: Story = {
  args: { variant: 'contained', tone: 'success' }
};

export const ContainedInfo: Story = {
  args: { variant: 'contained', tone: 'info' }
};

export const ContainedNeutral: Story = {
  args: { variant: 'contained', tone: 'neutral' }
};

export const OutlinedPrimary: Story = {
  args: { variant: 'outlined', tone: 'primary' }
};

export const OutlinedDanger: Story = {
  args: { variant: 'outlined', tone: 'danger', children: 'Excluir' }
};

export const OutlinedSuccess: Story = {
  args: { variant: 'outlined', tone: 'success' }
};

export const OutlinedInfo: Story = {
  args: { variant: 'outlined', tone: 'info' }
};

export const OutlinedNeutral: Story = {
  args: { variant: 'outlined', tone: 'neutral' }
};

export const LinkPrimary: Story = {
  args: { variant: 'link', tone: 'primary' }
};

export const LinkDanger: Story = {
  args: { variant: 'link', tone: 'danger', children: 'Excluir' }
};

export const LinkSuccess: Story = {
  args: { variant: 'link', tone: 'success' }
};

export const LinkInfo: Story = {
  args: { variant: 'link', tone: 'info' }
};

export const LinkNeutral: Story = {
  args: { variant: 'link', tone: 'neutral' }
};
