module ComponentFramework {
	export interface StandardControl<TType> {
		init(): TType
	}
}

export class SampleComponent implements ComponentFramework.StandardControl<string> {
	public init() {
		return "Hello, world!"
	}
}