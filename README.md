# @dynafer/build-toolkit
## Change Logs
* ### [1.0.2 (18-11-2022)](https://github.com/dynafer/build-toolkit/blob/main/logs/change_log_1.0.2.md)
* ### [1.0.3 (12-01-2023)](https://github.com/dynafer/build-toolkit/blob/main/logs/change_log_1.0.3.md)
* ### [1.0.4 (04-03-2023)](https://github.com/dynafer/build-toolkit/blob/main/logs/change_log_1.0.4.md)
## Installation
```bash
$ npm i --save-dev @dynafer/build-toolkit
or
$ yarn add -D @dynafer/build-toolkit
```
## How to use it
### 1. Create __build.config.js__ in your working directory
```javascript
module.exports = async(runner, config) => {
  /**
   * runner: {
   *     Command,
   *     Rollup,
   *     Sass,
   *     Task,
   *     Icons,
   * }
   * config: {
   *     BasePath,
   *     WatchDir,
   *     Mode,
   * }
   */
  ...
};
```
### 2. After setting the file
* Run a command line to build
```bash
$ npm run build-toolkit
or
$ yarn run build-toolkit
```
* Specific config file name
```bash
$ npm run build-toolkit --config <filename>
$ npm run build-toolkit -c <filename>
or
$ yarn run build-toolkit --config <filename>
$ yarn run build-toolkit -c <filename>
```
* Watch option
```bash
$ npm run build-toolkit --watch <directory>
$ npm run build-toolkit -w <directory>
or
$ yarn run build-toolkit --watch <directory>
$ yarn run build-toolkit -w <directory>
```
## Runners
### 1. Command
```javascript
module.exports = async(runner, config) => {
  ...
  // Run setting must include 'command'
  await runner.Command.Run({
    command: 'yarn run eslint'
  });

  // If you want to move to working directory
  await runner.Command.Run({
    cd: '<directory path>'
    command: '<command>'
  });

  // If you don't want to run the command on watching
  await runner.Command.Run({
    watch: false,
    command: '<command>'
  });
  ...
};
```
### 2. Rollup (Using **Rollup.js** module)
```javascript
module.exports = async(runner, config) => {
  ...
  const singleConfig = {
    // Rollup.js Configuration
  };

  const multipleConfigs = [
    {
      // Rollup.js Configuration
    },
    ...
  ];

  const createUglifyRollup = {
    ...
    output: {
      ...
      createUglified: true,
      ...
    },
    ...
  }

  runner.Rollup.Register(singleConfig);
  runner.Rollup.Register(multipleConfigs);
  runner.Rollup.Register(createUglifyRollup);

  await runner.Rollup.Run();
  ...
};
```
### 3. Sass (Using **sass** module)
```javascript
module.exports = async(runner, config) => {
  ...
  const singleConfig = {
    input: '<scss file path>',
    output: '<output file path>',
    compressed: false
  };

  const multipleConfigs = [
    {
      input: '<scss file path>',
      output: '<output file path>',
      compressed: true
    },
    {
      input: '<scss file path>',
      output: '<output file path>',
      compressed: false
    },
    ...
  ];

  await runner.Sass.Run(singleConfig);
  await runner.Sass.Run(multipleConfigs);
  ...
};
```
### 4. Task
```javascript
module.exports = async(runner, config) => {
  ...
  const taskRunner = async(config) => {
    // any task...
  };

  await runner.Task.Run(taskRunner);

  // If you don't want to run the task on watching
  await runner.Task.Run(taskRunner, false);
  ...
};
```
### 5. Icons
```javascript
module.exports = async(runner, config) => {
  ...
  const iconSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'json' | 'const' | 'argument',
    naming: 'const or argument naming',
  };

  await runner.Icons.Build(iconSetting);

  // JSON type setting
  // Output would be .json file
  const jsonSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'json'
  };

  await runner.Icons.Build(jsonSetting);

  // Constant type setting
  // Output would be .js file
  const constSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'const'
    naming: 'icons' // It will be const icons = { ... };
  };

  await runner.Icons.Build(constSetting);

  // Argument type setting
  // Output would be .js file
  const argSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'argument'
    naming: 'icons.add' // It will be icons.add({ ... });
  };

  await runner.Icons.Build(argSetting);
  ...
};
```