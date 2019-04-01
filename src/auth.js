import { parseQueryString } from './utils'
const { Dropbox } = require('dropbox')
import Cookies from 'js-cookie'

class Auth {
	constructor() {
		this.CLIENT_ID = 'kp2273iqykx8esz'
	}
	showPageSection(id) {
		document.getElementById(id).style.display = 'block'
	}
	getAccessToken() {
		return parseQueryString(window.location.hash).access_token || Cookies.get('accessToken')
	}
	askForAuthorization() {
		this.showPageSection('pre-auth-section')
		const authUrl = new Dropbox({ clientId: this.CLIENT_ID }).getAuthenticationUrl('http://localhost:8080/auth')
		document.getElementById('authlink').href = authUrl
	}
	async testAuthentication() {
		const dbx = new Dropbox({ accessToken: this.getAccessToken() })
		let authenticated = false
		const test = new Promise((resolve, reject) => {
			dbx
				.filesListFolder({ path: '' })
				.then(() => {
					// MUST ENCRYPT COOKIES BEFORE ANYONE USES THIS FOR IMPORTANT STUFF!!!
					Cookies.set('accessToken', this.getAccessToken())
					resolve()
				})
				.catch((err) => {
					console.log(err)
					reject('rejected')
				})
		})
			.then(() => (authenticated = true))
			.catch((err) => {})
		await test
		return authenticated ? dbx : null
	}
}

const auth = new Auth()

export default auth
