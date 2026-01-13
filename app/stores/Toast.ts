import { defineStore } from 'pinia'
import errorAudio from '../assets/audio/error.mp3'
import warnAudio from '../assets/audio/warn.mp3'
import successAudio from '../assets/audio/success.mp3'

const toast = useToast()

const createAudio = (src: string) => {
  if (typeof window === 'undefined') return null
  return new Audio(src)
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    errorSound: null as HTMLAudioElement | null,
    successSound: null as HTMLAudioElement | null,
    warnSound: null as HTMLAudioElement | null
  }),
  actions: {
    initSounds() {
      if (typeof window === 'undefined') return
      if (!this.errorSound) this.errorSound = createAudio(errorAudio)
      if (!this.successSound) this.successSound = createAudio(successAudio)
      if (!this.warnSound) this.warnSound = createAudio(warnAudio)
    },

    addError(title: string, description: string) {
      this.initSounds()
      if (this.errorSound) {
        this.errorSound.volume = 0.7
        this.errorSound.play()
      }
      toast.add({
        title: title,
        description: description,
        color: 'error'
      })
    },

    addSuccess(title: string, description: string) {
      this.initSounds()
      if (this.successSound) {
        this.successSound.volume = 0.7
        this.successSound.play()
      }
      toast.add({
        title: title,
        description: description,
        color: 'success'
      })
    },

    addWarning(title: string, description: string) {
      this.initSounds()
      if (this.warnSound) {
        this.warnSound.volume = 0.7
        this.warnSound.play()
      }
      toast.add({
        title: title,
        description: description,
        color: 'warning'
      })
    }
  }
})
