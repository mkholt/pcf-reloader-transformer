const spinnerStyle = `
	.reloader-container {
		display: flex;
		gap: 6px;
	}

	.reloader-spinner {
		box-sizing: border-box;
		border-radius: 50%;
		border-width: 1.5px;
		border-style: solid;
		border-color: rgb(0, 120, 212) rgb(199, 224, 244) rgb(199, 224, 244);
		border-image: initial;
		animation-name: reloader-spinner;
		animation-duration: 1.3s;
		animation-iteration-count: infinite;
		animation-timing-function: cubic-bezier(0.53, 0.21, 0.29, 0.67);
		width: 16px;
		height: 16px;
	}

	@keyframes reloader-spinner {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`

const getStyle = () => {
	const style = document.createElement("style")
	style.innerHTML = spinnerStyle

	return style
}

const Spinner = () => {
	const container = document.createElement("div")
	container.className = "reloader-container"
	
	const spinner = document.createElement("div")
	spinner.className = "reloader-spinner"

	const reloading = document.createElement("div")
	reloading.setAttribute("data-testid", "reloading-container")
	reloading.textContent = "Reloading..."

	container.append(getStyle(), reloading, spinner)
	return container
}

export default Spinner