import type { Meta, StoryObj } from '@storybook/react';
import FormSelect from './FormSelect';

const meta: Meta<typeof FormSelect> = {
  title: 'Form/FormSelect',
  component: FormSelect,
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
type Story = StoryObj<typeof FormSelect>;

export const Default: Story = {
  render: args => (
    <FormSelect {...args}>
      <option value="">Selecione uma opção</option>
      <option value="pix">PIX</option>
      <option value="dinheiro">Dinheiro</option>
      <option value="cartao">Cartão</option>
    </FormSelect>
  )
};
