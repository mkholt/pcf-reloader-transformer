module ComponentFramework {
	export interface StandardControl<TInput, TOutput> {
		init(parm: TInput): TOutput
	}
}

export class SampleComponent implements ComponentFramework.StandardControl<string, {input: string}> {
	public init(parm: string) {
		return {
			input: parm
		}
	}
}