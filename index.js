#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const args = require("args-parser")(process.argv);

const ruleFiles = glob.sync(path.join(__dirname, 'rules', '**', '*.js'));
const rules = ruleFiles.map(r => require(r));

const file = args.file || path.join(process.cwd(), 'package-lock.json');
const configFile = path.join(process.cwd(), args.config || '.lint-package-lock');

console.log(`Using config file ${configFile} if it exists`);

const config = fs.existsSync(configFile)
  ? JSON.parse(fs.readFileSync(configFile).toString())
  : {};

config.autoFix = args.autofix
console.log(`AutoFix mode: ${config.autoFix}`);

const lock = JSON.parse(fs.readFileSync(file).toString());

let failed = false;
let autoFixApplied = false;

console.log(`Running package-lock linting on ${file}`);

const enforceResolves = (modules) =>
  Object.entries(modules || {}).forEach(([name, module]) => {
    rules.forEach((rule) => {
      const { error, updatedValue } = rule(config, name, module);

      if (error) {
        console.error(`Error for module ${name}: ${error}`);
        failed = true;
      } else if (updatedValue) {
        debugger
        console.log(`Autofixing ${module.resolved}`);
        module.resolved = updatedValue;
        autoFixApplied = true;
      }
    });

    if (module.dependencies) {
      enforceResolves(module.dependencies);
    }
  });

enforceResolves(lock.dependencies);
enforceResolves(lock.devDependencies);
enforceResolves(lock.peerDependencies);
enforceResolves(lock.optionalDependencies);

if (failed) {
  console.error('Failed');
  process.exit(1);
} else if (autoFixApplied) {
  console.log('Writing updated file...')
  fs.writeFileSync(file, JSON.stringify(lock, null, 2) + '\n', 'utf8');
}

console.log('All dependencies passed');
