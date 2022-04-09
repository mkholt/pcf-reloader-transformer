import fs from 'fs';
import path from 'path';

import * as logger from '../src/injected/logger';
import printFile from '../src/lib/filePrinter';
import {
	buildClass,
	extractMethod,
} from './utils/codeGeneration';

describe("File Printer", () => {
	let writeFileSpy: jest.SpyInstance<void, [file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions]>
	let logSpy: jest.SpyInstance<void, string[]>

	beforeAll(() => {
		writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation().mockName("writeFileSync")
		logSpy = jest.spyOn(logger, 'log').mockImplementation().mockName("log")
	})

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
		const expectedPath = path.resolve(path.dirname("./"), to)

		// When
		printFile(sourceProps.sourceFile, sourceProps.sourceFile, { verbose: true })

		// Then
		expect(writeFileSpy).toBeCalledWith(expectedPath, expect.any(String))
		expect(logSpy).toBeCalledWith(`Generated file written to: ${expectedPath}`)
	})
})