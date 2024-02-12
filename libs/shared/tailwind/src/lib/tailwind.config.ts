import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      colors: {
        test: 'green',
      },
    },
  },
  plugins: [forms],
} satisfies Omit<Config, 'content'>;
