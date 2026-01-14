import express from 'express'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'

export function createExpressApp() {
  const app = express()

  app.use(express.json())

  app.post('/vk/albums', async (req, res) => {
    const { owner_id, access_token } = req.body
    if (!owner_id || !access_token) {
      return res.status(400).json({ error: 'owner_id and access_token required' })
    }

    try {
      const response = await axios.get(
        'https://api.vk.com/method/photos.getAlbums',
        {
          params: {
            owner_id,
            need_system: 1,
            photo_sizes: 1,
            need_covers: 1,
            v: '5.199',
            access_token
          }
        }
      )

      res.json(response.data)
    } catch (err: any) {
      console.error(err.response?.data || err.message)
      res.status(500).json({ error: 'VK API request failed' })
    }
  })

  app.post('/vk/photos', async (req, res) => {
    const { owner_id, access_token, album_id, album_size } = req.body

    if (!owner_id || !access_token || !album_id || album_size == null) {
      return res.status(400).json({
        error: 'owner_id, access_token, album_id, album_size required'
      })
    }

    const limit = 1000
    let offset = 0
    const allPhotos: any[] = []

    try {
      while (offset < album_size) {
        const response = await axios.get(
          'https://api.vk.com/method/photos.get',
          {
            params: {
              owner_id,
              album_id,
              photo_sizes: 1,
              count: Math.min(limit, album_size - offset),
              offset,
              access_token,
              v: '5.199'
            }
          }
        )

        const items = response.data.response.items
        allPhotos.push(...items)
        offset += items.length
      }

      res.json({ items: allPhotos })
    } catch (err: any) {
      console.error(err.response?.data || err.message)
      res.status(500).json({ error: 'VK API request failed' })
    }
  })

  app.post('/vk/download', async (req, res) => {
    const { id, url, folder } = req.body

    if (!id || !url || !folder) {
      return res.status(400).json({
        success: false,
        id,
        message: 'id, url, folder required'
      })
    }

    try {
      const downloadsDir = path.join(os.homedir(), 'Downloads')
      const destFolder = path.join(downloadsDir, 'vk_albums', folder)

      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true })
      }

      const filePath = path.join(destFolder, `${id}.jpg`)

      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      })

      fs.writeFileSync(filePath, response.data)

      res.json({ success: true, id })
    } catch (err: any) {
      console.error(err)
      res.status(500).json({
        success: false,
        id,
        message: err.message
      })
    }
  })

  app.get('/test', (_, res) => {
    res.json({ ok: true })
  })

  return app
}
