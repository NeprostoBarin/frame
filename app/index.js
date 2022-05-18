import * as Sentry from '@sentry/electron'
import React from 'react'
import ReactDOM from 'react-dom'
import Restore from 'react-restore'

import App from './App'

import link from '../resources/link'
import _store from './store'

import './flex'

Sentry.init({ dsn: 'https://7b09a85b26924609bef5882387e2c4dc@o1204372.ingest.sentry.io/6331069' })

// window.removeAllAccountsAndSigners = () => link.send('tray:removeAllAccountsAndSigners')

document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => e.preventDefault())
window.eval = global.eval = () => { throw new Error(`This app does not support window.eval()`) } // eslint-disable-line

link.rpc('getState', (err, state) => {
  if (err) return console.error('Could not get initial state from main.')
  const store = _store(state)
  if (!store('main.mute.betaDisclosure')) store.notify('betaDisclosure')
  store.observer(() => {
    document.body.className = 'clip ' + store('main.colorway')
    setTimeout(() => {
      document.body.className = store('main.colorway')
    }, 100)
  })
  const Frame = Restore.connect(App, store)
  ReactDOM.render(<Frame />, document.getElementById('frame'))
})
// document.addEventListener('mouseover', e => link.send('tray:focus'))
document.addEventListener('mouseout', e => { if (e.clientX < 0) link.send('tray:mouseout') })
document.addEventListener('contextmenu', e => link.send('*:contextmenu', e.clientX, e.clientY))
