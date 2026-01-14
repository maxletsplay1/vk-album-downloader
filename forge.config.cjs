const path = require('path')
const fs = require('fs')

const outputPath = path.resolve(__dirname, '.output')
const iconPath = path.resolve(__dirname, 'logo/logo')

if (!fs.existsSync(outputPath)) {
  console.warn('.output folder does not exist! Run `nuxt build` first.')
}

module.exports = {
  packagerConfig: {
    name: 'VKAlbum',
    executableName: 'VKAlbum',
    icon: iconPath,
    appBundleId: 'com.mlpoffff.vkalbum',
    appCategoryType: 'public.app-category.productivity',
    overwrite: true,
    prune: true,
    extraResources: [
      {
        from: outputPath,
        to: '.output',
        filter: ['**/*']
      }
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {}
    }
  ]
}
