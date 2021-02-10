importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js");

tf.setBackend('cpu');
const EPSILON = tf.backend().epsilon();

var numFrames;
var columnTruncateLength;
var model;

function flattenQueue(queue) {
    const frameSize = queue[0].length;
    const freqData = new Float32Array(queue.length * frameSize);
    queue.forEach((data, i) => freqData.set(data, i * frameSize));
    return freqData;
}

function normalize(x) {
    return tf.tidy(() => {
        const { mean, variance } = tf.moments(x);
        return tf.div(tf.sub(x, mean), tf.add(tf.sqrt(variance), EPSILON));
    });
}

function getInputTensorFromFrequencyData(freqData, shape) {
  const vals = new Float32Array(tf.util.sizeFromShape(shape));
  vals.set(freqData, vals.length - freqData.length);
  return tf.tensor(vals, shape);
}

async function predictHotword(freqDataQueue) {
    const freqData = flattenQueue(freqDataQueue);
    const freqDataTensor = getInputTensorFromFrequencyData(freqData, [1, numFrames, columnTruncateLength, 1]);
    const normalizedFreqDataTensor = normalize(freqDataTensor);
    
    const y = await model.predict(normalizedFreqDataTensor);
    const data = await y.data();

    tf.dispose(freqDataTensor);

    return !(data[0] > data[1]);
}

function detectSilence(buffer) {
    /**
     * Calculates the Root Mean Square of a float32 array buffer to approximate volume
     */
    // TODO ADJUST FOR AMBIENT NOISE
    const rms = Math.sqrt(buffer.reduce((acc, value) => {return acc + (value ** 2)})) || 0;
    return rms < 1;
}

self.addEventListener("message", async e => {
    switch (e.data.action) {
        case "init":
            numFrames = e.data.numFrames;
            columnTruncateLength = e.data.columnTruncateLength;
            model = await tf.loadLayersModel("https://storage.googleapis.com/tm-model/X_-E2y_Mo/model.json");
            self.postMessage("ready");
            break;
        case "predict":
            const hotwordDetected = await predictHotword(e.data.freqDataQueue);
            if (hotwordDetected)
                self.postMessage("hotword");
            break;
        case "silence":
            const silenceDetected = detectSilence(e.data.buf);
            if (silenceDetected) {
                self.postMessage("silence");
            } else {
                self.postMessage("nosilence");
            }
            break;
    }
});
