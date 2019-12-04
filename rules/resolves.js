const lintResolves = (config, name, { resolved }) => {
  const server = config.server || 'https://registry.npmjs.org';
  const autoFixFrom = config.autoFixFrom || 'https://registry.npmjs.org';
  const autoFix = config.autoFix;

  if (resolved && !resolved.startsWith(server)) {
    if (autoFix && resolved.startsWith(autoFixFrom)) {
      return {
        error: null,
        updatedValue: resolved.replace(autoFixFrom, server)
      }
    }
    return {
      error: `Illegal resolve: ${resolved}`
    }
  }

  return {
    error: null
  };
};

module.exports = lintResolves;
