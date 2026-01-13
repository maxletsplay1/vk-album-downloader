<template>
  <UCard
    :id="'album-card'+album.id"
    class="flex gap-4"
  >
    <img
      :src="album.cover"
      alt="Обложка альбома"
      class="w-full aspect-[4/3] flex-shrink-0 rounded-lg object-cover"
    >

    <div class="flex flex-1 flex-col justify-between">
      <div>
        <h3 class="text-base font-semibold">
          {{ album.title }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          📸 {{ album.size }} фото
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="album.status !== 'downloading'"
          :icon="album.status == 'completed'? 'i-lucide-check' : 'i-lucide-download'"
          :color="album.status == 'completed'? 'success' : 'primary'"
          class="mt-3 self-start"
          :loading="album.status === 'loading'"
          @click="albumsStore.getPhotos(album.id, album.size, album.title)"
        >
          {{ album.status == 'completed'? 'Альбом скачан' : 'Скачать альбом' }}
        </UButton>
        <UProgress
          v-else
          v-model="album.progress"
          color="success"
          status
          :max="album.size"
        />
        <Info
          v-if="album.errors.length > 0"
          class="-mb-3"
          text="Не все файлы были скачаны"
          color="warning"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import launchConfettiOnCard from '~/composables/confetti'

const toastStore = useToastStore()

interface Album {
  id: number
  title: string
  size: number
  cover: string
  status: string
  progress: number
  errors: string[]
}

const props = defineProps<{
  album: Album
}>()

const albumsStore = useAlbumsStore()

watch(
  () => props.album.status,
  async (newValue, oldValue) => {
    if (newValue === 'completed') {
      await nextTick()
      launchConfettiOnCard('album-card' + props.album.id)
      toastStore.addSuccess('Успех!', `Альбом '${props.album.title}' скачан`)
    }
  }
)
</script>
