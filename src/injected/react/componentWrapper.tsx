import * as React from 'react';

import { initializeIcons } from '@fluentui/react';
import {
	IconButton,
	MessageBarButton,
} from '@fluentui/react/lib-commonjs/Button';
import {
	MessageBar,
	MessageBarType,
} from '@fluentui/react/lib-commonjs/MessageBar';
import { Spinner } from '@fluentui/react/lib-commonjs/Spinner';

export type ComponentWrapperProps = {
	component?: React.ReactElement
	componentName: string
	showForceReload: boolean
	onReload: () => void
}

export enum ComponentMode {
	Component,
	Spinner,
	Error
}

export type ComponentWrapperState = {
	component?: React.ReactElement
	mode: ComponentMode
}

// Initialize the icons (used for the spinner and refresh), but disable warning about already initialized
initializeIcons(undefined, { disableWarnings: true });

export class ComponentWrapper extends React.Component<ComponentWrapperProps, ComponentWrapperState> {
	constructor(props: ComponentWrapperProps) {
		super(props)

		this.state = {
			mode: ComponentMode.Component,
			component: props.component
		}
	}

	public render(): React.ReactNode {
		return (
			<div style={{ position: 'relative' }}>
				{this.props.showForceReload && (
					<IconButton
						title='Refresh component'
						style={{
							position: "absolute",
							top: "1px",
							left: "1px"
						}}
						iconProps={{iconName: 'refresh'}}
						onClick={this.props.onReload} />
				)}
				{this.getInner()}
			</div>
		)
	}

	private getInner() {
		switch (this.state.mode) {
		case ComponentMode.Component:
			return this.state.component
		case ComponentMode.Spinner:
			return <Spinner labelPosition='left' label="Reloading..." />
		case ComponentMode.Error:
			return <MessageBar
				messageBarType={MessageBarType.error}
				actions={
					<div>
						<MessageBarButton onClick={this.props.onReload}>Try again</MessageBarButton>
					</div>
				} isMultiline={false}>
				An error occurred loading the component {this.props.componentName} - see console for details
			</MessageBar>
		}
	}
}

export default ComponentWrapper