# PCF Reloader Transformation
[![npm](https://img.shields.io/npm/v/pcf-reloader-transformer)](https://www.npmjs.com/package/pcf-reloader-transformer)
[![build](https://github.com/mkholt/pcf-reloader-transformer/actions/workflows/ci.yml/badge.svg)](https://github.com/mkholt/pcf-reloader-transformer/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/mkholt/pcf-reloader-transformer/badge.svg?branch=main)](https://coveralls.io/github/mkholt/pcf-reloader-transformer?branch=main)
[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/pcf-reloader-transformer)](https://libraries.io/npm/pcf-reloader-transformer)
![npm](https://img.shields.io/npm/dw/pcf-reloader-transformer)
![NPM](https://img.shields.io/npm/l/pcf-reloader-transformer)

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


## Motivation
The PowerApps Component Framework includes a test-harness which automatically reloads the component whenever it changes on disk.

However, the test harness has a couple of downsides
1. It does not have access to the environment
2. It does not show you the actual interaction with the surrounding system

In order to test fully, it is neccessary to include the actual component on a form.

However, having to fully reload the form on each change quickly gets annoying. Thus the transformer was born.

## Installation
```sh
$ npm install -D pcf-reloader-transformer
$ npx ts-patch i
```

## Usage
![PCF Reloader in action](./public/demo.gif)

The generated code can be found in [./samples/patched.ts](./samples/patched.ts) and the corresponding compiled javascript can be found in [./tests/samples](./tests/samples)

### Running the transformer
The easiest way of running the transformer is through [ts-patch](https://www.npmjs.com/package/ts-patch).

TS Patch is automatically installed and enabled when installing this package.

To run the transformer, add it to _plugins_ in your _tsconfig.json_
```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "pcf-reloader-transformer",
        "type": "config",
      }
    ]
  }
}
```

For a list of available settings see [Settings](#settings)

### Integrating
The transformation injects code in any class that implements `ComponentFramework.StandardControl<IInputs, IOutputs>`.

The code will listen for messages passed to the [PCF Test Harness](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/debugging-custom-controls#debugging-using-the-browser-test-harness), unload the PCF, reload the `bundle.js`, and re-initialize the PCF with the current context.

The code expects the [PCF test harness](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/debugging-custom-controls#debugging-using-the-browser-test-harness) to be running in watch-mode. Start in watch mode by calling `npm start watch`.

#### Fiddler
The easiest way to get the updated bundle on the form is to inject it using Fiddler.

After publishing the component for the first time, an AutoResponder rule on the following format:

| If request matches...                                                     | then respond with...                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| REGEX:(?insx).+\/WebResources\/cc_(?'namespace'[^.]+)\.([^/]+)\/bundle.js | __sourcedir__\${namespace}\out\controls\${namespace}\bundle.js |

For details on setting up Fiddler for PCF debugging, see [Microsoft Docs](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/debugging-custom-controls#using-fiddler).

## Settings
The transformer supports the following configuration settings.

The settings are specified as part of the plugin specification in _tsconfig.json_

The following settings are available:
- [Debug](#debug)
- [Print Generated](#print-generated)
- [Show Force Reload](#show-force-reload)
- [Use Browser Sync](#use-browser-sync)
- [Verbose](#verbose)
- [WS Address](#ws-address)

## Debug
**Setting**: `debug`<br>
**Type**: boolean<br>
**Default**: `false`<br>
**Description**:<br>
  If `true`, inject calls to the debugger to allow stepping into the dynamically loaded code.

### Print Generated
**Setting**: `printGenerated`<br>
**Type**: boolean<br>
**Default**: `false`<br>
**Description**:<br>
  If `true`, the generated typescript code will be output to a file alongside the detected file. If the file is named `index.ts`, the generated file will be `index.generated.ts`

### Show Force Reload
**Setting**: `showForceReload`<br>
**Type**: boolean<br>
**Default**: `true`<br>
**Description**:<br>
	If `true` show a reload button in the corner of the component

### Use Browser Sync
**Setting**: `useBrowserSync` <br>
**Type**: boolean <br>
**Default**: `true` when PCF Start version >= 1.11.3, `false` otherwise <br>
**Description**:<br>
	If `true` force use of the BrowserSync.io / Socket.io based integration,<br> If `false`, force use of the WebSocket,<br> If not specified, detect the protocol based on the [PCF Start](https://www.npmjs.com/package/pcf-start) version

### Verbose
**Setting**: `verbose`<br>
**Type**: boolean<br>
**Default**: `false`<br>
**Description**:<br>
	If `true`, status messages will be printed during the transformation<br>

### WS Address
**Setting**: `wsAddress`<br>
**Type**: string<br>
**Default**: For websocket: `ws://127.0.0.1:8181/ws`<br> For BrowserSync: `http://localhost:8181`<br>
**Description**:<br>
	The address to use when listening for update messages.
