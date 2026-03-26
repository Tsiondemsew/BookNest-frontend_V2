module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write', 'pnpm type-check --no-cache'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
