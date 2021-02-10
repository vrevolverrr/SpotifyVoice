export class AudioManager {
    isRecording: boolean;
    isInitialized: boolean;

    audioContext: AudioContext | undefined;
    analyser: AnalyserNode | undefined;
    stream: MediaStream | undefined;
    input: MediaStreamAudioSourceNode | undefined;
    processor: ScriptProcessorNode | undefined;
    
    encoder: Worker | undefined;  // PCMf32 to FLAC encoder web worker
    worker: Worker | undefined; // Tensorflow inference web worker

    suppressionTimeMillis: number;  // Time to wait after each succesful detection
    fftSize: number;  // Size of window for browser Fast Fourier Transform (FFT)
    numFrames: number;  // Number of spectrogram columns
    columnTruncateLength: number;  // Maximum width of each spectrogram column
    sampleRate: number;  // Audio sampling rate
    overlapFactor: number;  // Period of recognition for a column window (eg: 0.5 will be twice per second )

    freqData: Float32Array;  // The float32 array to store the FFT data (spectrogram column)
    freqDataQueue: Float32Array[];  // The array to store the spectrogram columns
    
    timer: Timer | undefined;
    frameIntervalTask: number | undefined;

    silenceCounter: number;

    constructor() {
        // Options
        this.suppressionTimeMillis = 100 ;
        this.overlapFactor = 0.5;
        
        // Model non batch inference input shape 
        // (1, 43, 232, 1)
        this.fftSize = 1024;
        this.numFrames = 43;
        this.columnTruncateLength = 232;

        // Will beoverridden by audioContext.sampleRate
        this.sampleRate = 44100
        
        // States
        this.isInitialized = false;
        this.isRecording = false;

        // Data containers
        this.freqDataQueue = [];
        this.freqData = new Float32Array(this.fftSize);

        this.silenceCounter = 0;
    }

    async init(): Promise<void> {
        /**
         * Initialize web workers and Web Audio API
         * then start hotword detecion
         * 
         * @returns {Promise}
         */
        if (this.isInitialized) throw Error("Already initialized");

        // Initialize web workers
        await this.initWorkers();
        
        // Initialize Web Audio API
        this.audioContext = new AudioContext();
        this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
        this.input = this.audioContext.createMediaStreamSource(this.stream);
        this.sampleRate = this.audioContext.sampleRate;
        this.analyser = this.input.context.createAnalyser();
        this.analyser.fftSize = 2 * this.fftSize;
        this.analyser.smoothingTimeConstant = 0.0;
        
        this.input.connect(this.analyser);

        // Initialize Timer
        const period = Math.max(1, Math.round(this.numFrames * (1 - this.overlapFactor)));
        this.timer = new Timer(period, Math.round(this.suppressionTimeMillis / ((this.fftSize / this.sampleRate) * 1e3)));
        this.frameIntervalTask = setInterval(this.onAudioFrame.bind(this), ((this.fftSize / this.sampleRate) * 1e3));

        // Finished initialization
        this.isInitialized = true;

        return Promise.resolve();
    }

    async initWorkers(): Promise<void> {
        /**
         * Initialize web workers
         * 
         * @returns {Promise}
         */
        this.encoder = new Worker("encoder.js");
        this.worker = new Worker("worker.js");
        this.worker.postMessage({
            action: "init",
            numFrames: this.numFrames,
            columnTruncateLength: this.columnTruncateLength,
        });

        return new Promise((resolve, reject) => {
            this.worker?.addEventListener("message", e => {
                switch (e.data) {
                    case "ready": resolve(); break;
                    case "error": reject(); break;
                    case "hotword":
                        if (!this.isRecording)
                            this.hotwordCallback();
                        // Suppress the following callbacks for `suppressionTimeMillis` ms
                        this.timer?.suppress();   
                        break;
                    case "silence":
                        if (this.isRecording)
                            this.silenceCallback();
                        break;
                    case "nosilence":
                        if (this.isRecording)
                            this.noSilenceCallback();
                        break;
                }
            });
        });
    }

    hotwordCallback() {
        this.silenceCounter = 0;
        this.startRecord();
        console.log("started recording"); // DEBUG
    }

    silenceCallback() {
        this.silenceCounter = this.silenceCounter + 1;
        if (this.silenceCounter > 15) {
            console.log("stopped recording"); // DEBUG
            this.stopRecord().then(audioBlob => {
                const xhttprequest = new XMLHttpRequest();
                xhttprequest.onreadystatechange = function() {
                    if (xhttprequest.readyState == 4) {
                        console.log(xhttprequest.responseText);
                    }
                }
                // TODO CREATE A PROXY
                xhttprequest.open("POST", "http://127.0.0.1:5000/submit", true)
                xhttprequest.send(audioBlob);
            });
        }
    }

    noSilenceCallback() {
        this.silenceCounter = 0;
    }

    startRecord(): void {
        /**
         * Starts the recording
         *
         * @remarks - Called by hotword callback 
         */
        if (!this.isInitialized) throw Error("not initialized");
                
        if (!(this.analyser && this.audioContext && this.encoder && this.input)) 
            throw Error("some components are undefined, was init() completed?");
        
        // Ignore if already recording
        if (this.isRecording) return;

        // Start recording
        this.isRecording = true;
        this.processor = this.input.context.createScriptProcessor(4096, 1, 1);
        
        // Initialize encoder
        this.encoder.postMessage({
            cmd: 'init',
                config:
                    {
                        samplerate: 44100,
                        bps: 16,
                        channels: 1,
                        compression: 5  
                    }
                });

        if (!(this.processor)) throw Error();

        // Callback fn to pass buffer to encoder web worker
        this.processor.onaudioprocess = (e) => {
            if (!this.isRecording) return;
            const buffer = e.inputBuffer.getChannelData(0);

            // Send buffer data to audio worker to detect silence
            this.worker?.postMessage({action: 'silence', buf: buffer});

            // Send buffer data to FLAC encoder to be encoded
			this.encoder?.postMessage({cmd: 'encode', buf: buffer});
        }

        // Connect analyser to script processor node
        this.analyser.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
    }

    onAudioFrame() {
        /**
         * Audio frame callback
         */

        // Get browser FFT data (spectrogram column) and set the data into `freqData`
        this.analyser?.getFloatFrequencyData(this.freqData);
        
        if (this.freqData[0] === -Infinity) {
          return;
        }

        // Push the trimmed spectrogram column into `freqDataQueue`
        this.freqDataQueue.push(this.freqData.slice(0, this.columnTruncateLength));
        
        // Discard the oldest column if the number of columns exceeds the maximum number of columns per input
        if (this.freqDataQueue.length > this.numFrames) {
          (this.freqDataQueue as Float32Array[]).shift();
        }

        const shouldFire = this.timer?.tick();
        if (shouldFire) {
            // Sends array of spectrogram columns for inference
            this.worker?.postMessage({
                action: "predict",
                freqDataQueue: this.freqDataQueue
            });
        }
      }

    stopRecord(): Promise<Blob> {
        /**
         * Stops the recording
         * 
         * @remarks - Called automatically by silence callback
         */
        if (!this.isRecording) throw Error("Not recording");
        if (!(this.processor && this.analyser && this.encoder && this.stream && this.audioContext))
            throw Error("some components are undefined, was init() completed?");

        // Stops the recording
        this.isRecording = false;

        // Request encoded file from encoder web worker
        this.encoder.postMessage({cmd: 'finish'});

        // Disconnect recording nodes
        this.processor.disconnect(this.audioContext.destination);
        this.analyser.disconnect(this.processor);

        return new Promise((resolve, reject) => {
            if (!(this.encoder)) throw Error("some components are undefined, was init() completed?");
            this.encoder.onmessage = (e) => {
                switch (e.data.cmd) {
                    case 'end':
                        resolve(e.data.buf);
                        break;
                    case 'error':
                        reject();
                }
            }
        });
    }

    close() {
        if (!this.isInitialized) if (!this.isInitialized) throw Error("not initialized");
        if (!(this.stream && this.encoder && this.worker && this.audioContext && this.analyser && this.processor))
            throw Error("some components are undefined, was init() completed?");

        if (this.isRecording) this.stopRecord();
        
        // Clean up
        clearInterval(this.frameIntervalTask);
        const tracks = this.stream.getAudioTracks()
        tracks.forEach(track => track.stop());
        this.audioContext.close();
        this.analyser.disconnect();
        this.processor.disconnect();

        this.encoder.terminate();
        this.worker.terminate();

        this.isInitialized = false;
    }
}

class Timer {
    period: number;
    suppressionTime: number;
    counter: number;
    suppressionOnset: number | undefined;
  
    constructor(period: number, suppressionPeriod: number) {
      this.period = period;
      this.suppressionTime = suppressionPeriod == null ? 0 : suppressionPeriod;
      this.counter = 0;
    }
  
    tick() {
      this.counter++;
      const shouldFire = (this.counter % this.period === 0) &&
          (this.suppressionOnset == undefined ||
           this.counter - this.suppressionOnset > this.suppressionTime);
      return shouldFire;
    }

    suppress() {
      this.suppressionOnset = this.counter;
    }
}