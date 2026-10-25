// The spectrogram's recording, downloaded once and shared. The landing starts the download as soon as
// it renders, after the page's critical files but before the 3D plot's own code has arrived; the plot
// then decodes the same bytes.
let request: Promise<ArrayBuffer> | null = null;

export function fetchRainforestAudio() {
  request ??= fetch('/audio/rainforest.mp3')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .catch((error) => {
      request = null; // let a later visit to the page try again
      throw error;
    });
  return request;
}
