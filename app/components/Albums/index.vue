<template>
  <div class="flex flex-col gap-3">
    <div class="flex  items-center gap-2">
      <p class="text-lg">
        Ваши альбомы
      </p>
      <UButton
        class="w-fit"
        :loading="albumStore.loadingAlbums"
        :disabled="!isAuthorized"
        label="Обновить"
        color="neutral"
        @click="getAlbums"
      />
    </div>
    <div
      v-if="albumStore.albums.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Card
        v-for="album in albumStore.albums"
        :key="album.id"
        :album="album"
      />
    </div>
    <div
      v-else
      class="flex flex-col items-center gap-4 opacity-20"
    >
      <Icon name="i-lucide-camera-off" size="60" />
      <p class="text-4xl">
        Нет доступных альбомов
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAlbumsStore } from '~/stores/albums'
import Card from '~/components/Albums/Card.vue'

const authStore = useAuthStore()
const albumStore = useAlbumsStore()

const isAuthorized = computed(() => {
  return authStore.id !== null && authStore.token !== null
})

const getAlbums = async () => {
  await albumStore.getAlbums()
}
</script>
