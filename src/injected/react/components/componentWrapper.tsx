import * as React from 'react';

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

const styles: React.CSSProperties = {
	position: "absolute",
	top: "1px",
	background: "none",
	color: "#CCC",
	border: "none",
}

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
			<div data-testid="ComponentWrapper">
				{this.props.showForceReload && (
					<IconButton style={styles} iconProps={{iconName: 'refresh'}} onClick={this.props.onReload} />
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
				}>
				An error occurred loading the component {this.props.componentName} - see console for details
			</MessageBar>
		}
	}
}

export default ComponentWrapper