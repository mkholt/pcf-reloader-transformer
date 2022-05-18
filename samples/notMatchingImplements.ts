interface StandardControl {
	init(): void
}

export class SampleComponent implements StandardControl {
	public init() {
		console.log("Hello, world!")
	}
}