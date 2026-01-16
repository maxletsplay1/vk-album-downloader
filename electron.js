import { app, BrowserWindow, shell, utilityProcess } from 'electron'
import path from 'node:path'
import waitOn from 'wait-on'
import getPort from 'get-port'
import { spawn } from 'node:child_process'

let nuxtProcess
let nuxtServerPath

async function createWindow(port) {

  if (app.isPackaged) {
    nuxtServerPath = path.join(process.resourcesPath, 'app', '.output', 'server', 'index.mjs')
    nuxtProcess = utilityProcess.fork(nuxtServerPath, [], {
      windowsHide: true,
      env: {
        ...process.env,
        PORT: `${port}`
      }
    })
  } else {
    nuxtServerPath = path.join(process.cwd(), '.output', 'server', 'index.mjs')
    nuxtProcess = spawn('node', [nuxtServerPath], {
      windowsHide: false,
      stdio: 'ignore',
      env: {
        ...process.env,
        PORT: `${port}`
      }
    })
  }

  await waitOn({ resources: [`http://localhost:${port}`] })

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadURL(`http://localhost:${port}`)

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

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  win.on('closed', () => {
    if (nuxtProcess) nuxtProcess.kill()
    nuxtProcess = null
  })
}

app.on('ready', async () => {
  const port = await getPort()
  await createWindow(port)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  nuxtProcess?.kill()
})
