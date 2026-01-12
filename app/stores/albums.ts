import { defineStore } from 'pinia'

const config = useRuntimeConfig()

export const useAlbumsStore = defineStore('albums', {
  state: () => ({
    albums: [],
    loadingAlbums: false
  }),
  getters: {
    auth: () => useAuthStore()
  },
  actions: {
    async getAlbums() {
      this.loadingAlbums = true
      const res = await fetch(`${config.public.backendUrl}api/vk/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: this.auth.id,
          access_token: this.auth.token
        })
      })
      const albums = await res.json()
      this.albums = albums.response.items.map(item => ({
        id: item.id,
        size: item.size,
        title: item.title,
        cover: item.sizes[item.sizes.length - 1].src,
        progress: 0,
        status: 'none',
        errors: []
      }))
      this.loadingAlbums = false
    },
    async getPhotos(albumId: number, albumSize: number) {
      const album = this.albums[this.albums.findIndex(album => album.id === albumId)]
      album.progress = 0
      album.errors = []
      album.status = 'loading'
      const res = await fetch(`${config.public.backendUrl}api/vk/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: this.auth.id,
          access_token: this.auth.token,
          album_id: albumId,
          album_size: albumSize
        })
      })
      // const albums = await res.json()
      //фейк загрузки
      album.status = 'downloading'
      for (let n = 0; n < album.size; n++) {
        const delay = Math.floor(Math.random() * (1000 - 200 + 1)) + 200
        await new Promise(resolve => setTimeout(resolve, delay))
        album.progress++
      }
      album.errors = ['23451223452']
      album.status = 'completed'
    }
  }
})
