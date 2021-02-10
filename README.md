![Spotify Voice Banner](https://raw.githubusercontent.com/vrevolverrr/SpotifyVoice/main/docs/banner.png)
### still under very early stages of development and no release is available yet

## About

Spotify Voice is a non-contextual voice activated assistant powered by natural language understanding (NLU) for the Spotify Desktop client. It leverages the power of the Chromium Embedded Framework of the Spotify Client to introduce a new way of interaction with the client.

## Features

- Realtime "Spotify" hotword detection and speech to text
- Search and play albums and tracks
- Control playback and volume
- Query information on tracks and albums (TODO)
- Keep track of your preferences (TODO)
- Theme engine based on CSS (TODO)

## Performance

Spotify Voice uses Web Audio API for audio recording and Tensorflow.js for hotword inference and natural language understanding. Resource heavy tasks such as inferencing and audio encoding are done in service workers away from the main thread. This prevents blocking of the main thread to maintain the responsiveness of the Spotify user interface.

