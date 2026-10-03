export function startRecording() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                const leftChannel = [];

                processor.onaudioprocess = (event) => {
                    const input = event.inputBuffer.getChannelData(0);
                    leftChannel.push(new Float32Array(input));
                };

                source.connect(processor);
                processor.connect(audioContext.destination);

                const stop = () => {
                    source.disconnect();
                    processor.disconnect();
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();

                    const wavBlob = exportWAV(leftChannel, 16000);
                    return wavBlob;
                };

                resolve({ stop });
            })
            .catch(reject);
    });
}

function exportWAV(chunks, sampleRate) {
    const buffer = flattenArray(chunks);
    const dataview = encodeWAV(buffer, sampleRate);
    return new Blob([dataview], { type: 'audio/wav' });
}

function flattenArray(chunks) {
    const length = chunks.reduce((acc, curr) => acc + curr.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}
