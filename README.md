# @dynafer/build-toolkit
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
   *     Task
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