# @dynafer/build-toolkit
## Change Logs
* ### [1.0.3 (12-01-2023)](https://github.com/dynafer/build-toolkit/blob/main/logs/change_log_1.0.3.md)
* ### [1.0.4 (04-03-2023)](https://github.com/dynafer/build-toolkit/blob/main/logs/change_log_1.0.4.md)
* ### [1.0.5 (04-03-2023)](https://github.com/dynafer/build-toolkit/blob/main/logs/change_log_1.0.5.md)
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
module.exports = async (runner, config) => {
  ...
	/**
	 * Command Setting
	 *    cd: Optional<directory path>
	 *    command: <command>
	 *    watch: Optional<boolean>, Default<true>
	 */

  await runner.Command.Run({
    cd: '<directory path>',
    command: 'yarn run eslint',
    watch: false
  });
  ...
};
```
### 2. Rollup (Using **Rollup.js** dependency)
```javascript
module.exports = async (runner, config) => {
  ...
	/**
	 * Rollup Setting
	 *    Rollup.js Configuration
     *    output: {
     *      Rollup.js Output Configuration
     *      createUglified: Optional<boolean>, Default<false>
     *    }
	 */

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
### 3. SASS (Using **sass** dependency)
```javascript
module.exports = async (runner, config) => {
  ...
	/**
	 * SASS Setting
     *    input: <sass file path>
     *    output: <output file path>
     *    compressed: Optional<boolean>, Default<false>
	 */

  const singleConfig = {
    input: '<sass file path>',
    output: '<output file path>'
  };

  const multipleConfigs = [
    {
      input: '<sass file path>',
      output: '<output file path>',
      compressed: true
    },
    {
      input: '<sass file path>',
      output: '<output file path>'
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
module.exports = async (runner, config) => {
  ...
  const taskRunner = async (config) => {
    // any task...
  };

  await runner.Task.Run(taskRunner);

  // If you don't want to run the task on watching
  await runner.Task.Run(taskRunner, false);
  ...
};
```
	dir: string,
	output: string,
	type: 'json' | 'const' | 'argument' | 'module',
	naming?: string,
	uglified?: boolean,
}
### 5. Icons
```javascript
module.exports = async (runner, config) => {
  ...
	/**
	 * Icons Setting
     *    dir: <svg files directory path>
     *    output: <output file path>
     *    type: 'json' | 'const' | 'argument' | 'module'
     *    naming:
     *      If type is 'json', empty.
     *      If type is not 'json', required.
     *    uglified: Optional<boolean>, Default<false>
	 */

  const iconSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'json' | 'const' | 'argument' | 'module',
    naming: 'constant, function, or module name',
    uglified: true,
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
    naming: 'icons'
  };
  // Expected: const icons = { ... };

  await runner.Icons.Build(constSetting);

  // Argument type setting
  // Output would be .js file
  const argSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'argument'
    naming: 'icons.add'
  };
  // Expected: icons.add({ ... });

  await runner.Icons.Build(argSetting);

  // Module type setting
  // Output would be .js and .d.ts files
  const moduleSetting = {
    dir: '<svg files directory path>',
    output: '<output file path>',
    type: 'module'
    naming: 'icons'
  };
	/**
	 * Expected
     *    .js: const icons = { ... }; export default icons;
     *    .d.ts: declare const icons: Record<string, string>;
     *           export default icons;
	 */

  await runner.Icons.Build(moduleSetting);
  ...
};
```