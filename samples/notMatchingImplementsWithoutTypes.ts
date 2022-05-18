module ComponentFramework {
	export interface StandardControl {
		init(): void
	}
}

export class SampleComponent implements ComponentFramework.StandardControl {
	public init() {
		console.log("Hello, world!")
	}
}