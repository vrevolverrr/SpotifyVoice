"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function predictHotword(freqDataQueue) {
    return __awaiter(this, void 0, void 0, function* () {
        const freqData = flattenQueue(freqDataQueue);
        const freqDataTensor = getInputTensorFromFrequencyData(freqData, [1, numFrames, columnTruncateLength, 1]);
        const normalizedFreqDataTensor = normalize(freqDataTensor);
        const y = yield model.predict(normalizedFreqDataTensor);
        const data = yield y.data();
        tf.dispose(freqDataTensor);
        return !(data[0] > data[1]);
    });
}
function detectSilence(buffer) {
    /**
     * Calculates the Root Mean Square of a float32 array buffer to approximate volume
     */
    // TODO ADJUST FOR AMBIENT NOISE
    const rms = Math.sqrt(buffer.reduce((acc, value) => { return acc + (Math.pow(value, 2)); })) || 0;
    return rms < 1;
}
self.addEventListener("message", (e) => __awaiter(void 0, void 0, void 0, function* () {
    switch (e.data.action) {
        case "init":
            numFrames = e.data.numFrames;
            columnTruncateLength = e.data.columnTruncateLength;
            model = yield tf.loadLayersModel("https://storage.googleapis.com/tm-model/X_-E2y_Mo/model.json");
            self.postMessage("ready");
            break;
        case "predict":
            const hotwordDetected = yield predictHotword(e.data.freqDataQueue);
            if (hotwordDetected)
                self.postMessage("hotword");
            break;
        case "silence":
            const silenceDetected = detectSilence(e.data.buf);
            if (silenceDetected) {
                self.postMessage("silence");
            }
            else {
                self.postMessage("nosilence");
            }
            break;
    }
}));
