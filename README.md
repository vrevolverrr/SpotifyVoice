![Spotify Voice Banner](https://raw.githubusercontent.com/vrevolverrr/SpotifyVoice/main/docs/banner.png)
### still under very early stages of development and no release is available yet

## About

Spotify Voice is a non-contextual private by design voice activated assistant powered by natural language understanding (NLU) for the Spotify Desktop client. It leverages the power of the Chromium Embedded Framework of the Spotify Client to introduce a new way of interaction with the client.

## Features

- "Spotify" hotword detection and speech to text
- Search and play albums and tracks (WIP)

## Performance

Spotify Voice uses Web Audio API of the CEF for audio recording and Tensorflow.js for hotword inference and natural language understanding (NLU to be implemented). Resource heavy tasks such as inferencing and audio encoding are done in service workers away from the main thread. This prevents blocking of the main thread to maintain the responsiveness of the Spotify user interface.

## TODO
- Add playback and volume control
- Add simple information querying
- Add CSS based theme engine
- Add documentation
- Include the helper classes for training new intents
- Implement Tensorflow.js model for hotword detection (currently using teachable machine model)
- Reimplement Snips NLU library in Tensorflow.js natively OR compile to WASM from the rust library
- Update deprecated ScriptProcessorNode to newer AudioWorkletProcessor node for better performance
- Expose SpotifyJS internal API and provide wrappers in other languages which will communicate via websockets
- Rewrite parts of the code in WASM