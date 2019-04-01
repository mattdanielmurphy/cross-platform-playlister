import './style/main.scss'
import 'normalize.css'
import './server'

import Cookies from 'js-cookie'
const { Dropbox } = require('dropbox')
import auth from './auth'

const showPageSection = (id) => (document.getElementById(id).style.display = 'block')

function handleSongEnd() {
	if (currentlyPlayingSong === songs.length - 1) currentlyPlayingSong = 0
	else currentlyPlayingSong++
	playSong(currentlyPlayingSong)
}

async function playSong(n) {
	let songId = Object.keys(playlist)[n]
	console.log(songId)
	let song = songs.find((s) => s.id === songId)
	console.log(song)
	getTempLink(song).then((link) => (audioEl.src = link))
}

async function getTempLink(song) {
	const songPath = song.path_lower
	return await dbx.filesGetTemporaryLink({ path: songPath }).then(({ link }) => link)
}

async function getSongs(dbx) {
	await dbx
		.filesListFolder({ path: '' })
		.then((response) => {
			// get just songs... getting all files right now
			for (let i in response.entries) songs.push(response.entries[i])
		})
		.catch((error) => {
			console.error(error)
		})
	return songs
}

async function playPlaylist() {
	showPageSection('player')
	currentlyPlayingSong = 0
	playSong(0)
	audioEl.addEventListener('ended', handleSongEnd)
	audioEl.addEventListener('canplaythrough', audioEl.play)
}

function removeFromPlaylist(e) {
	let id = e.target.id
	delete playlist[id]
	e.srcElement.className = ''
}
function addToPlaylist(e) {
	let id = e.target.id
	e.srcElement.className = 'selected'
	songs.forEach((song) => {
		if (song.id === id) playlist[id] = song.name
	})
}

function addOrRemoveFromPlaylist(e) {
	let id = e.target.id
	if (playlist[id]) removeFromPlaylist(e)
	else addToPlaylist(e)
}

function handleClickSong(e) {
	addOrRemoveFromPlaylist(e)
}

function handleSubmitPlaylist(e) {
	e.preventDefault()
	if (Object.keys(playlist).length > 0) playPlaylist(playlist)
}

function showSongs() {
	let container = document.getElementById('songs')
	songs.forEach((song) => {
		let tr = document.createElement('tr')
		let td = document.createElement('td')
		td.innerText = `${song.name} - ${song.id}`
		td.setAttribute('id', song.id)
		tr.appendChild(td)
		tr.onclick = (e) => handleClickSong(e)
		tr.className = 'song'
		container.appendChild(tr)
	})
	let createPlaylist = document.getElementById('create-playlist')
	createPlaylist.onsubmit = (e) => handleSubmitPlaylist(e)
}

let dbx
let songs = []
let currentlyPlayingSong
const audioEl = document.getElementById('player')
const playlist = {}

function startApp(providedDbx) {
	dbx = providedDbx
	// MUST ENCRYPT COOKIES BEFORE ANYONE USES THIS FOR IMPORTANT STUFF!!!
	showPageSection('authed-section')
	getSongs(dbx).then((songs) => showSongs())
	showSongs()
}

auth.testAuthentication().then((dbx) => {
	if (dbx) startApp(dbx)
	else auth.askForAuthorization()
})
