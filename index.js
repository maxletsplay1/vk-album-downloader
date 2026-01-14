import {app, BrowserWindow, shell} from 'electron'
import { spawn } from 'child_process'
import http from 'node:http'
import path from 'node:path'

let nuxtProcess

function getMainPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, '.output-nuxt/server/index.mjs')
  }
  return path.join(__dirname, '../.output-nuxt/server/index.mjs')
}

function waitForServer(url, timeout = 10000, interval = 100) {
  return new Promise((resolve, reject) => {
    const start = Date.now()

    const check = () => {
      const req = http.request(url, (res) => {
        resolve(true)
      })
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for server'))
        } else {
          setTimeout(check, interval)
        }
      })
      req.end()
    }

    check()
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  const nuxtServerPath = path.join(process.resourcesPath, '.output', 'server', 'index.mjs')

  nuxtProcess = spawn('node', [nuxtServerPath], { shell: true, stdio: 'inherit' })

  waitForServer('http://localhost:3000', 10000)
    .then(() => {
      win.loadURL('http://localhost:3000')
    })
    .catch(err => console.error('Server did not start in time:', err))

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  win.on('closed', () => {
    if (nuxtProcess) nuxtProcess.kill()
    nuxtProcess = null
  })
}

app.whenReady().then(() => {
  nuxtProcess = spawn('node', ['.output/server/index.mjs'], { shell: true, stdio: 'inherit' })
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
