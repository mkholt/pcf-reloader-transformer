import * as React from 'react';

export type ComponentWrapperProps = {
	component?: React.ReactElement
}

const ComponentWrapper = ({ component }: ComponentWrapperProps) => {
	return <div data-testid="ComponentWrapper">{component}</div>
}

export default ComponentWrapper