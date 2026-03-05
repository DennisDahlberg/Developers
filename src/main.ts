const fileInput = document.getElementById('fileInput') as HTMLInputElement
const videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement
const emptyState = document.getElementById('emptyState') as HTMLDivElement

// Hide the native video element until a file is loaded
videoPlayer.style.display = 'none'

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (!file) return

  const url = URL.createObjectURL(file)

  // Revoke previous object URL to free memory
  if (videoPlayer.src) {
    URL.revokeObjectURL(videoPlayer.src)
  }

  videoPlayer.src = url
  videoPlayer.style.display = 'block'
  emptyState.style.display = 'none'
  videoPlayer.play()
})
