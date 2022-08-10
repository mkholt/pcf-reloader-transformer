## [1.3.0 (2022/xx/xx)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.3.0)
- Support for virtual components [#14](https://github.com/mkholt/pcf-reloader-transformer/issues/14)
- Support for Socket.io v4 communication when used ([BrowserSync >= 2.27.8](https://github.com/BrowserSync/browser-sync/releases/tag/v2.27.8))

## [1.2.0 (2022/04/18)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.2.0)
- Restructure code to wrap in class instead of injecting directly in module [#12](https://github.com/mkholt/pcf-reloader-transformer/issues/12)
- Better handling of error state when reloading
- Add button to force reload the component [#2](https://github.com/mkholt/pcf-reloader-transformer/issues/2)

## [1.1.2 (2022/02/23)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.1.2)
- Do not auto-install TS-Patch

## [1.1.1 (2022/02/16)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.1.1)
- Move TS Patch to a dependency and auto-patch on install
- Auto-detect protocol based on installed PCF Start version

## [1.1.0 (2022/02/09)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.1.0)
- Support for Browser-Sync based communication (since pcf-start 1.11.4)
- Major refactoring, move injected code to external library that gets imported into the class instead of embedding all the code.

## [1.0.1 (2021/11/05)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.0.1)
- Fix: Skip files that have the PcfParams type declared to avoid double-generating code. (Issue #1)
- Improvement: Add ability to specify the listening address
- Cleanup: Use access helper method everywhere

## [1.0.0 (2021/11/03)](https://github.com/mkholt/pcf-reloader-transformer/releases/tag/v1.0.0)
- Initial version
