import { defineStore } from 'pinia'
import { useToastStore } from '~/stores/Toast';

const config = useRuntimeConfig()

export const useAlbumsStore = defineStore('albums', {
  state: () => ({
    albums: [],
    loadingAlbums: false,
    authError: false
  }),
  getters: {
    auth: () => useAuthStore(),
    toast: () => useToastStore()
  },
  actions: {
    async getAlbums() {
      this.loadingAlbums = true
      try {
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
      } catch (err) {
        console.error(err)
        this.toast.addError('Ошибка авторизации', 'Пожалуйста, создайте новый токен')
      }
      this.loadingAlbums = false
    },
    async getPhotos(albumId: number, albumSize: number, albumName: string) {
      const album = this.albums[this.albums.findIndex(album => album.id === albumId)]
      album.progress = 0
      album.errors = []
      album.status = 'loading'
      try {
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
        let photos = await res.json()
        photos = photos.items.map(item => ({
          id: item.id,
          src: item?.orig_photo?.url || ''
        }))
        album.status = 'downloading'
        await this.downloadPhotos(photos, albumId, albumName)
        album.status = 'completed'
      } catch (err) {
        console.error(err)
        album.status = 'none'
        this.toast.addError('Ошибка API', `Не удалось получить данные об альбоме`)
      }
    },
    async downloadPhotos(photos, albumId, albumName) {
      const album = this.albums[this.albums.findIndex(album => album.id === albumId)]
      for (const photo of photos) {
        try {
          const res = await fetch(`${config.public.backendUrl}api/vk/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: photo.id,
              url: photo.src,
              folder: albumName
            })
          })
          if (!res.ok) {
            const text = await res.text()
            throw new Error(`HTTP ${res.status}: ${text}`)
          }
        } catch (err) {
          console.error(err)
          this.toast.addWarning('Ошибка скачивания', `Файл ${photo.id}.jpg не был скачан`)
          album.errors.push(photo.id)
        } finally {
          album.progress++
        }
      }
    }
  }
})
