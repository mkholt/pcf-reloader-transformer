# PCF Reloader Transformation
[![npm](https://img.shields.io/npm/v/pcf-reloader-transformer)](https://www.npmjs.com/package/pcf-reloader-transformer)

Typescript transformation that enabled automatic reloading of PCF Components when embedded on Model-Driven forms in Dynamics 365.

**Table of Contents**
- [PCF Reloader Transformation](#pcf-reloader-transformation)
 - [Motivation](#motivation)
 - [Installation](#installation)
 - [Usage](#usage)
	- [Running the transformer](#running-the-transformer)
	- [Integrating](#integrating)
		- [Fiddler](#fiddler)
 	- [Settings](#settings)
 - [Example](#example)

## Motivation
The PowerApps Component Framework includes a test-harness which automatically reloads the component whenever it changes on disk.

However, the test harness has a couple of downsides
1. It does not have access to the environment
2. It does not show you the actual interaction with the surrounding system

In order to test fully, it is neccessary to include the actual component on a form.

However, having to fully reload the form on each change quickly gets annoying. Thus the transformer was born.

## Installation
```sh
$ npm i -D pcf-reloader-transformer
```

## Usage
![PCF Reloader in action](./public/demo.gif)

The generated code can be found in [./samples/patched.ts](./samples/patched.ts) and the corresponding compiled javascript can be found in [./tests/samples](./tests/samples)

### Running the transformer
The easiest way of running the transformer is through [ts-patch](https://www.npmjs.com/package/ts-patch).

To run the transformer, add it to _plugins_ in your _tsconfig.json_
```json
{
	"compilerOptions": {
		"plugins": [
			{
				"transform": "pcf-reloader-transformer",
				"type": "config",
				"printGenerated": true
			}
		]
	}
}
```

### Integrating
The transformation injects code in any class that implements `ComponentFramework.StandardControl<IInputs, IOutputs>`.

The code will set up a listener to a websocket, and when receiving a message on the socket, will unload the PCF, reload the `bundle.js`, and re-initialize the PCF.

The code expects the PCF test harness to be running, as such, to use the transformation, after compiling, start the PCF test harness in watch-mode.

#### Fiddler
The easiest way to get the updated bundle on the form is to inject it using Fiddler.

After publishing the component for the first time, add two AutoResponder rules on the following format:

| If request matches...	| then respond with...
|----------------------	|---------------------
| REGEX:(?insx).+\/WebResources\/cc_(?'namespace'[^.]+)\.([^/]+)\/bundle.js	| __sourcedir__\${namespace}\out\controls\${namespace}\bundle.js
| REGEX:(?insx).+\/WebResources\/cc_(?'namespace'[^.]+)\.([^/]+)\/bundle.js | *header:Cache-Control: must-revalidate

### Settings
The transformer supports the following configuration settings.

The settings are specified as part of the plugin specification in _tsconfig.json_

| Option			| Type		| Description	| Default
|--------			|------		|-------------	|---------
| printGenerated	| boolean	| If `true`, the generated typescript code will be output to a file alongside the detected file. If the file is named `index.ts`, the generated file will be `index.generated.ts`	| `false`
| verbose			| boolean	| If `true`, status messages will be printed during the transformation	| `false`
| wsAddress			| string	| The address to use when listening for update messages.				| `ws://127.0.0.1:8181/ws`
