import { localStorage } from '@zos/storage'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

App({
  globalData: {
    deviceId: null,
  },

  onCreate() {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = generateUUID()
      localStorage.setItem('deviceId', deviceId)
    }
    this.globalData.deviceId = deviceId
  },

  onDestroy() {},
})
