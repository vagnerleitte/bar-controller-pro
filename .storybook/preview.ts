import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'bar-dark',
      values: [
        { name: 'bar-dark', value: '#102218' },
        { name: 'bar-surface', value: '#1a2e22' },
        { name: 'white', value: '#ffffff' }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
