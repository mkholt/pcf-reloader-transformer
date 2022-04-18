const iconStyle = `
	/* Your use of the content in the files referenced here is subject to the terms of the license at https://aka.ms/fabric-assets-license */
	@font-face {
		font-family: 'PCFReloader-FabricMDL2Icons';
		src: url('data:application/octet-stream;base64,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') format('truetype');
	}

	.reloader-icon {
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
		display: inline-block;
		font-family: 'PCFReloader-FabricMDL2Icons';
		font-style: normal;
		font-weight: normal;
		speak: none;
	}

	.reloader-icon--Refresh:before { content: "\\E72C"; }
`

const buttonStyle = `
	.reloader-button {
		position: absolute;
		top: 1px;
		background: none;
		color: #CCC;
		border: none;
	}

	.reloader-button:hover {
		color: #000;
	}
`

const getStyle = () => {
	const styleElement = document.createElement("style")
	styleElement.innerHTML = iconStyle + "\n" + buttonStyle

	return styleElement
}

const ReloadButton = (onClick: (ev: MouseEvent) => void): HTMLElement => {
	const icon = document.createElement("i")
	icon.className = "reloader-icon reloader-icon--Refresh"
	
	const button = document.createElement("button")
	button.setAttribute("data-testid", "reload-button-button")
	button.type = "button"
	button.className = "reloader-button"
	button.title = "PCF Reloader: Reload component"
	button.addEventListener('click', onClick)
	button.append(icon)

	const container = document.createElement("div")
	container.setAttribute("data-testid", "reload-button-container")
	container.append(getStyle(), button)

	return container
}

export default ReloadButton
