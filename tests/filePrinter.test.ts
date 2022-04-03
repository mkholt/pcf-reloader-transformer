import fs from 'fs';
import path from 'path';

import * as logger from '../src/injected/logger';
import printFile from '../src/lib/filePrinter';
import {
	buildClass,
	extractMethod,
} from './utils/codeGeneration';

const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation().mockName("writeFileSync")
jest.spyOn(path, 'dirname').mockImplementation(() => '/').mockName("dirname")
const logSpy = jest.spyOn(logger, 'log').mockImplementation().mockName("log")

describe("File Printer", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it.each`
	from				| to
	${'index.ts'}		| ${'index.generated.ts'}
	${'index.js'}		| ${'index.generated.js'}
	${'index.test.ts'}	| ${'index.test.generated.ts'}
	${'some.file.path'}	| ${'some.file.generated.path'}
`('can generate path ($from -> $to)', ({ from, to }) => {
		// Given
		const sourceProps = extractMethod(buildClass("hello() { console.log('Hello, world!') }"), from)
		const expectedPath = path.resolve("/", to)

		// When
		printFile(sourceProps.sourceFile, sourceProps.sourceFile, { verbose: true })

		// Then
		expect(writeFileSpy).toBeCalledWith(expectedPath, expect.any(String))
		expect(logSpy).toBeCalledWith(`Generated file written to: ${expectedPath}`)
	})
})