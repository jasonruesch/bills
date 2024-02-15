import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        test: '#000005',
      },
    },
  },
  plugins: [forms],
} satisfies Omit<Config, 'content'>;

export default tailwindPreset;
