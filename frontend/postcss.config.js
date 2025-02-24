import tailwind from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import purgecssModule from '@fullhuman/postcss-purgecss';

const purgecss = purgecssModule.default;

export default {
  plugins: [
    tailwind,
    autoprefixer({ grid: false }),
    process.env.NODE_ENV === 'production' &&
      purgecss({
        content: ['./index.html', './src/**/*.{vue,jsx,tsx,html}'],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      })
  ]
};
