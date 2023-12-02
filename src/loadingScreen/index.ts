const app = document.getElementById('app')
const container = document.createElement('div')
container.id = 'loading-screen'
container.innerHTML = '<div class="spinner"></div>'
app!.appendChild(container)

const show = () => {
	container.style.display = 'flex'
}

const hide = () => {
	container.style.display = 'none'
}

export const loadingScreen = { show, hide }
