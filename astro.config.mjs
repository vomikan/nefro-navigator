import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vomikan.github.io',
  // base: '/petrov-diet-system/',  // ← ЗАКОММЕНТИРУЙТЕ для localhost
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-light' },
  },
});
