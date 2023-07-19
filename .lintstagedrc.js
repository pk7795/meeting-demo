module.exports = {
  // Type check TypeScript files
  '**/*.(ts|tsx)': () => 'pnpm tsc --noEmit',

  // Lint & Prettify TS and JS files
  '**/*.(ts|tsx|js)': () => ['pnpm eslint .', 'pnpm prettier --write .'],

  // Prettify only Markdown and JSON files
  '**/*.(md|json)': () => 'pnpm prettier --write .',
}
