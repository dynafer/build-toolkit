#!/usr/bin/env node
const project = require('../package.json');

console.clear();
console.log(`\n${project.name} version ${project.version}`);
console.log(`${'='.repeat(50)}\n`);

const { BuildToolkitCLI } = require('../build/lib/BuildToolkitCLI');

BuildToolkitCLI();