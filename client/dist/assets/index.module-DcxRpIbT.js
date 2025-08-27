import{$ as F,H as U,a as w,b as v,c as D,d as q,e as P}from"./index-ng4NMxv4.js";function z(d){return d&&d.__esModule?d.default:d}function B(d,e,t,s){Object.defineProperty(d,e,{get:t,set:s,enumerable:!0,configurable:!0})}var T={};B(T,"DailyRTVIMessageType",()=>$);B(T,"DailyTransport",()=>R);class m{static floatTo16BitPCM(e){const t=new ArrayBuffer(e.length*2),s=new DataView(t);let r=0;for(let a=0;a<e.length;a++,r+=2){let i=Math.max(-1,Math.min(1,e[a]));s.setInt16(r,i<0?i*32768:i*32767,!0)}return t}static mergeBuffers(e,t){const s=new Uint8Array(e.byteLength+t.byteLength);return s.set(new Uint8Array(e),0),s.set(new Uint8Array(t),e.byteLength),s.buffer}_packData(e,t){return[new Uint8Array([t,t>>8]),new Uint8Array([t,t>>8,t>>16,t>>24])][e]}pack(e,t){if(t!=null&&t.bitsPerSample)if(t!=null&&t.channels){if(!(t!=null&&t.data))throw new Error('Missing "data"')}else throw new Error('Missing "channels"');else throw new Error('Missing "bitsPerSample"');const{bitsPerSample:s,channels:r,data:a}=t,i=["RIFF",this._packData(1,52),"WAVE","fmt ",this._packData(1,16),this._packData(0,1),this._packData(0,r.length),this._packData(1,e),this._packData(1,e*r.length*s/8),this._packData(0,r.length*s/8),this._packData(0,s),"data",this._packData(1,r[0].length*r.length*s/8),a],n=new Blob(i,{type:"audio/mpeg"}),o=URL.createObjectURL(n);return{blob:n,url:o,channelCount:r.length,sampleRate:e,duration:a.byteLength/(r.length*e*2)}}}globalThis.WavPacker=m;const M=[4186.01,4434.92,4698.63,4978.03,5274.04,5587.65,5919.91,6271.93,6644.88,7040,7458.62,7902.13],V=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],_=[],x=[];for(let d=1;d<=8;d++)for(let e=0;e<M.length;e++){const t=M[e];_.push(t/Math.pow(2,8-d)),x.push(V[e]+d)}const E=[32,2e3],I=_.filter((d,e)=>_[e]>E[0]&&_[e]<E[1]),W=x.filter((d,e)=>_[e]>E[0]&&_[e]<E[1]);class C{static getFrequencies(e,t,s,r="frequency",a=-100,i=-30){s||(s=new Float32Array(e.frequencyBinCount),e.getFloatFrequencyData(s));const n=t/2,o=1/s.length*n;let h,c,l;if(r==="music"||r==="voice"){const p=r==="voice"?I:_,u=Array(p.length).fill(a);for(let g=0;g<s.length;g++){const A=g*o,k=s[g];for(let b=p.length-1;b>=0;b--)if(A>p[b]){u[b]=Math.max(u[b],k);break}}h=u,c=r==="voice"?I:_,l=r==="voice"?W:x}else h=Array.from(s),c=h.map((p,u)=>o*u),l=c.map(p=>`${p.toFixed(2)} Hz`);const f=h.map(p=>Math.max(0,Math.min((p-a)/(i-a),1)));return{values:new Float32Array(f),frequencies:c,labels:l}}constructor(e,t=null){if(this.fftResults=[],t){const{length:s,sampleRate:r}=t,a=new OfflineAudioContext({length:s,sampleRate:r}),i=a.createBufferSource();i.buffer=t;const n=a.createAnalyser();n.fftSize=8192,n.smoothingTimeConstant=.1,i.connect(n);const o=1/60,h=s/r,c=l=>{const f=o*l;f<h&&a.suspend(f).then(()=>{const y=new Float32Array(n.frequencyBinCount);n.getFloatFrequencyData(y),this.fftResults.push(y),c(l+1)}),l===1?a.startRendering():a.resume()};i.start(0),c(1),this.audio=e,this.context=a,this.analyser=n,this.sampleRate=r,this.audioBuffer=t}else{const s=new AudioContext,r=s.createMediaElementSource(e),a=s.createAnalyser();a.fftSize=8192,a.smoothingTimeConstant=.1,r.connect(a),a.connect(s.destination),this.audio=e,this.context=s,this.analyser=a,this.sampleRate=this.context.sampleRate,this.audioBuffer=null}}getFrequencies(e="frequency",t=-100,s=-30){let r=null;if(this.audioBuffer&&this.fftResults.length){const a=this.audio.currentTime/this.audio.duration,i=Math.min(a*this.fftResults.length|0,this.fftResults.length-1);r=this.fftResults[i]}return C.getFrequencies(this.analyser,this.sampleRate,r,e,t,s)}async resumeIfSuspended(){return this.context.state==="suspended"&&await this.context.resume(),!0}}globalThis.AudioAnalysis=C;const N=`
class StreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.hasStarted = false;
    this.hasInterrupted = false;
    this.outputBuffers = [];
    this.bufferLength = 128;
    this.write = { buffer: new Float32Array(this.bufferLength), trackId: null };
    this.writeOffset = 0;
    this.trackSampleOffsets = {};
    this.port.onmessage = (event) => {
      if (event.data) {
        const payload = event.data;
        if (payload.event === 'write') {
          const int16Array = payload.buffer;
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x8000; // Convert Int16 to Float32
          }
          this.writeData(float32Array, payload.trackId);
        } else if (
          payload.event === 'offset' ||
          payload.event === 'interrupt'
        ) {
          const requestId = payload.requestId;
          const trackId = this.write.trackId;
          const offset = this.trackSampleOffsets[trackId] || 0;
          this.port.postMessage({
            event: 'offset',
            requestId,
            trackId,
            offset,
          });
          if (payload.event === 'interrupt') {
            this.hasInterrupted = true;
          }
        } else {
          throw new Error(\`Unhandled event "\${payload.event}"\`);
        }
      }
    };
  }

  writeData(float32Array, trackId = null) {
    let { buffer } = this.write;
    let offset = this.writeOffset;
    for (let i = 0; i < float32Array.length; i++) {
      buffer[offset++] = float32Array[i];
      if (offset >= buffer.length) {
        this.outputBuffers.push(this.write);
        this.write = { buffer: new Float32Array(this.bufferLength), trackId };
        buffer = this.write.buffer;
        offset = 0;
      }
    }
    this.writeOffset = offset;
    return true;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannelData = output[0];
    const outputBuffers = this.outputBuffers;
    if (this.hasInterrupted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else if (outputBuffers.length) {
      this.hasStarted = true;
      const { buffer, trackId } = outputBuffers.shift();
      for (let i = 0; i < outputChannelData.length; i++) {
        outputChannelData[i] = buffer[i] || 0;
      }
      if (trackId) {
        this.trackSampleOffsets[trackId] =
          this.trackSampleOffsets[trackId] || 0;
        this.trackSampleOffsets[trackId] += buffer.length;
      }
      return true;
    } else if (this.hasStarted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else {
      return true;
    }
  }
}

registerProcessor('stream_processor', StreamProcessor);
`,j=new Blob([N],{type:"application/javascript"}),Q=URL.createObjectURL(j),H=Q;class G{constructor({sampleRate:e=44100}={}){this.scriptSrc=H,this.sampleRate=e,this.context=null,this.stream=null,this.analyser=null,this.trackSampleOffsets={},this.interruptedTrackIds={}}async connect(){this.context=new AudioContext({sampleRate:this.sampleRate}),this._speakerID&&this.context.setSinkId(this._speakerID),this.context.state==="suspended"&&await this.context.resume();try{await this.context.audioWorklet.addModule(this.scriptSrc)}catch(t){throw console.error(t),new Error(`Could not add audioWorklet module: ${this.scriptSrc}`)}const e=this.context.createAnalyser();return e.fftSize=8192,e.smoothingTimeConstant=.1,this.analyser=e,!0}getFrequencies(e="frequency",t=-100,s=-30){if(!this.analyser)throw new Error("Not connected, please call .connect() first");return C.getFrequencies(this.analyser,this.sampleRate,null,e,t,s)}async updateSpeaker(e){const t=this._speakerID;if(this._speakerID=e,this.context)try{e==="default"?await this.context.setSinkId():await this.context.setSinkId(e)}catch(s){console.error(`Could not set sinkId to ${e}: ${s}`),this._speakerID=t}}_start(){const e=new AudioWorkletNode(this.context,"stream_processor");return e.connect(this.context.destination),e.port.onmessage=t=>{const{event:s}=t.data;if(s==="stop")e.disconnect(),this.stream=null;else if(s==="offset"){const{requestId:r,trackId:a,offset:i}=t.data,n=i/this.sampleRate;this.trackSampleOffsets[r]={trackId:a,offset:i,currentTime:n}}},this.analyser.disconnect(),e.connect(this.analyser),this.stream=e,!0}add16BitPCM(e,t="default"){if(typeof t!="string")throw new Error("trackId must be a string");if(this.interruptedTrackIds[t])return;this.stream||this._start();let s;if(e instanceof Int16Array)s=e;else if(e instanceof ArrayBuffer)s=new Int16Array(e);else throw new Error("argument must be Int16Array or ArrayBuffer");return this.stream.port.postMessage({event:"write",buffer:s,trackId:t}),s}async getTrackSampleOffset(e=!1){if(!this.stream)return null;const t=crypto.randomUUID();this.stream.port.postMessage({event:e?"interrupt":"offset",requestId:t});let s;for(;!s;)s=this.trackSampleOffsets[t],await new Promise(a=>setTimeout(()=>a(),1));const{trackId:r}=s;return e&&r&&(this.interruptedTrackIds[r]=!0),s}async interrupt(){return this.getTrackSampleOffset(!0)}}globalThis.WavStreamPlayer=G;const J=`
class AudioProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = this.receive.bind(this);
    this.initialize();
  }

  initialize() {
    this.foundAudio = false;
    this.recording = false;
    this.chunks = [];
  }

  /**
   * Concatenates sampled chunks into channels
   * Format is chunk[Left[], Right[]]
   */
  readChannelData(chunks, channel = -1, maxChannels = 9) {
    let channelLimit;
    if (channel !== -1) {
      if (chunks[0] && chunks[0].length - 1 < channel) {
        throw new Error(
          \`Channel \${channel} out of range: max \${chunks[0].length}\`
        );
      }
      channelLimit = channel + 1;
    } else {
      channel = 0;
      channelLimit = Math.min(chunks[0] ? chunks[0].length : 1, maxChannels);
    }
    const channels = [];
    for (let n = channel; n < channelLimit; n++) {
      const length = chunks.reduce((sum, chunk) => {
        return sum + chunk[n].length;
      }, 0);
      const buffers = chunks.map((chunk) => chunk[n]);
      const result = new Float32Array(length);
      let offset = 0;
      for (let i = 0; i < buffers.length; i++) {
        result.set(buffers[i], offset);
        offset += buffers[i].length;
      }
      channels[n] = result;
    }
    return channels;
  }

  /**
   * Combines parallel audio data into correct format,
   * channels[Left[], Right[]] to float32Array[LRLRLRLR...]
   */
  formatAudioData(channels) {
    if (channels.length === 1) {
      // Simple case is only one channel
      const float32Array = channels[0].slice();
      const meanValues = channels[0].slice();
      return { float32Array, meanValues };
    } else {
      const float32Array = new Float32Array(
        channels[0].length * channels.length
      );
      const meanValues = new Float32Array(channels[0].length);
      for (let i = 0; i < channels[0].length; i++) {
        const offset = i * channels.length;
        let meanValue = 0;
        for (let n = 0; n < channels.length; n++) {
          float32Array[offset + n] = channels[n][i];
          meanValue += channels[n][i];
        }
        meanValues[i] = meanValue / channels.length;
      }
      return { float32Array, meanValues };
    }
  }

  /**
   * Converts 32-bit float data to 16-bit integers
   */
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  /**
   * Retrieves the most recent amplitude values from the audio stream
   * @param {number} channel
   */
  getValues(channel = -1) {
    const channels = this.readChannelData(this.chunks, channel);
    const { meanValues } = this.formatAudioData(channels);
    return { meanValues, channels };
  }

  /**
   * Exports chunks as an audio/wav file
   */
  export() {
    const channels = this.readChannelData(this.chunks);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const audioData = this.floatTo16BitPCM(float32Array);
    return {
      meanValues: meanValues,
      audio: {
        bitsPerSample: 16,
        channels: channels,
        data: audioData,
      },
    };
  }

  receive(e) {
    const { event, id } = e.data;
    let receiptData = {};
    switch (event) {
      case 'start':
        this.recording = true;
        break;
      case 'stop':
        this.recording = false;
        break;
      case 'clear':
        this.initialize();
        break;
      case 'export':
        receiptData = this.export();
        break;
      case 'read':
        receiptData = this.getValues();
        break;
      default:
        break;
    }
    // Always send back receipt
    this.port.postMessage({ event: 'receipt', id, data: receiptData });
  }

  sendChunk(chunk) {
    const channels = this.readChannelData([chunk]);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const rawAudioData = this.floatTo16BitPCM(float32Array);
    const monoAudioData = this.floatTo16BitPCM(meanValues);
    this.port.postMessage({
      event: 'chunk',
      data: {
        mono: monoAudioData,
        raw: rawAudioData,
      },
    });
  }

  process(inputList, outputList, parameters) {
    // Copy input to output (e.g. speakers)
    // Note that this creates choppy sounds with Mac products
    const sourceLimit = Math.min(inputList.length, outputList.length);
    for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
      const input = inputList[inputNum];
      const output = outputList[inputNum];
      const channelCount = Math.min(input.length, output.length);
      for (let channelNum = 0; channelNum < channelCount; channelNum++) {
        input[channelNum].forEach((sample, i) => {
          output[channelNum][i] = sample;
        });
      }
    }
    const inputs = inputList[0];
    // There's latency at the beginning of a stream before recording starts
    // Make sure we actually receive audio data before we start storing chunks
    let sliceIndex = 0;
    if (!this.foundAudio) {
      for (const channel of inputs) {
        sliceIndex = 0; // reset for each channel
        if (this.foundAudio) {
          break;
        }
        if (channel) {
          for (const value of channel) {
            if (value !== 0) {
              // find only one non-zero entry in any channel
              this.foundAudio = true;
              break;
            } else {
              sliceIndex++;
            }
          }
        }
      }
    }
    if (inputs && inputs[0] && this.foundAudio && this.recording) {
      // We need to copy the TypedArray, because the \`process\`
      // internals will reuse the same buffer to hold each input
      const chunk = inputs.map((input) => input.slice(sliceIndex));
      this.chunks.push(chunk);
      this.sendChunk(chunk);
    }
    return true;
  }
}

registerProcessor('audio_processor', AudioProcessor);
`,K=new Blob([J],{type:"application/javascript"}),Z=URL.createObjectURL(K),L=Z;class X{constructor({sampleRate:e=44100,outputToSpeakers:t=!1,debug:s=!1}={}){this.scriptSrc=L,this.sampleRate=e,this.outputToSpeakers=t,this.debug=!!s,this._deviceChangeCallback=null,this._deviceErrorCallback=null,this._devices=[],this.deviceSelection=null,this.stream=null,this.processor=null,this.source=null,this.node=null,this.recording=!1,this._lastEventId=0,this.eventReceipts={},this.eventTimeout=5e3,this._chunkProcessor=()=>{},this._chunkProcessorSize=void 0,this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)}}static async decode(e,t=44100,s=-1){const r=new AudioContext({sampleRate:t});let a,i;if(e instanceof Blob){if(s!==-1)throw new Error('Can not specify "fromSampleRate" when reading from Blob');i=e,a=await i.arrayBuffer()}else if(e instanceof ArrayBuffer){if(s!==-1)throw new Error('Can not specify "fromSampleRate" when reading from ArrayBuffer');a=e,i=new Blob([a],{type:"audio/wav"})}else{let c,l;if(e instanceof Int16Array){l=e,c=new Float32Array(e.length);for(let u=0;u<e.length;u++)c[u]=e[u]/32768}else if(e instanceof Float32Array)c=e;else if(e instanceof Array)c=new Float32Array(e);else throw new Error('"audioData" must be one of: Blob, Float32Arrray, Int16Array, ArrayBuffer, Array<number>');if(s===-1)throw new Error('Must specify "fromSampleRate" when reading from Float32Array, In16Array or Array');if(s<3e3)throw new Error('Minimum "fromSampleRate" is 3000 (3kHz)');l||(l=m.floatTo16BitPCM(c));const f={bitsPerSample:16,channels:[c],data:l};i=new m().pack(s,f).blob,a=await i.arrayBuffer()}const n=await r.decodeAudioData(a),o=n.getChannelData(0),h=URL.createObjectURL(i);return{blob:i,url:h,values:o,audioBuffer:n}}log(){return this.debug&&this.log(...arguments),!0}getSampleRate(){return this.sampleRate}getStatus(){return this.processor?this.recording?"recording":"paused":"ended"}async _event(e,t={},s=null){if(s=s||this.processor,!s)throw new Error("Can not send events without recording first");const r={event:e,id:this._lastEventId++,data:t};s.port.postMessage(r);const a=new Date().valueOf();for(;!this.eventReceipts[r.id];){if(new Date().valueOf()-a>this.eventTimeout)throw new Error(`Timeout waiting for "${e}" event`);await new Promise(n=>setTimeout(()=>n(!0),1))}const i=this.eventReceipts[r.id];return delete this.eventReceipts[r.id],i}listenForDeviceChange(e){if(e===null&&this._deviceChangeCallback)navigator.mediaDevices.removeEventListener("devicechange",this._deviceChangeCallback),this._deviceChangeCallback=null;else if(e!==null){let t=0,s=[];const r=i=>i.map(n=>n.deviceId).sort().join(","),a=async()=>{let i=++t;const n=await this.listDevices();i===t&&r(s)!==r(n)&&(s=n,e(n.slice()))};navigator.mediaDevices.addEventListener("devicechange",a),a(),this._deviceChangeCallback=a}return!0}listenForDeviceErrors(e){this._deviceErrorCallback=e}async requestPermission(){const e=await navigator.permissions.query({name:"microphone"});if(e.state==="denied")this._deviceErrorCallback&&this._deviceErrorCallback({devices:["mic"],type:"unknown",error:new Error("Microphone access denied")});else if(e.state==="prompt")try{(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(r=>r.stop())}catch(t){console.error("Error accessing microphone."),this._deviceErrorCallback&&this._deviceErrorCallback({devices:["mic"],type:"unknown",error:t})}return!0}async listDevices(){if(!navigator.mediaDevices||!("enumerateDevices"in navigator.mediaDevices))throw new Error("Could not request user devices");return await this.requestPermission(),(await navigator.mediaDevices.enumerateDevices()).filter(s=>s.kind==="audioinput")}async begin(e){var n;if(this.processor)throw new Error("Already connected: please call .end() to start a new session");if(!navigator.mediaDevices||!("getUserMedia"in navigator.mediaDevices))throw this._deviceErrorCallback&&this._deviceErrorCallback({devices:["mic","cam"],type:"undefined-mediadevices"}),new Error("Could not request user media");e=e??((n=this.deviceSelection)==null?void 0:n.deviceId);try{const o={audio:!0};e&&(o.audio={deviceId:{exact:e}}),this.stream=await navigator.mediaDevices.getUserMedia(o)}catch(o){throw this._deviceErrorCallback&&this._deviceErrorCallback({devices:["mic"],type:"unknown",error:o}),new Error("Could not start media stream")}this.listDevices().then(o=>{e=this.stream.getAudioTracks()[0].getSettings().deviceId,console.log("find current device",o,e,this.stream.getAudioTracks()[0].getSettings()),this.deviceSelection=o.find(h=>h.deviceId===e),console.log("current device",this.deviceSelection)});const t=new AudioContext({sampleRate:this.sampleRate}),s=t.createMediaStreamSource(this.stream);try{await t.audioWorklet.addModule(this.scriptSrc)}catch(o){throw console.error(o),new Error(`Could not add audioWorklet module: ${this.scriptSrc}`)}const r=new AudioWorkletNode(t,"audio_processor");r.port.onmessage=o=>{const{event:h,id:c,data:l}=o.data;if(h==="receipt")this.eventReceipts[c]=l;else if(h==="chunk")if(this._chunkProcessorSize){const f=this._chunkProcessorBuffer;this._chunkProcessorBuffer={raw:m.mergeBuffers(f.raw,l.raw),mono:m.mergeBuffers(f.mono,l.mono)},this._chunkProcessorBuffer.mono.byteLength>=this._chunkProcessorSize&&(this._chunkProcessor(this._chunkProcessorBuffer),this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)})}else this._chunkProcessor(l)};const a=s.connect(r),i=t.createAnalyser();return i.fftSize=8192,i.smoothingTimeConstant=.1,a.connect(i),this.outputToSpeakers&&(console.warn(`Warning: Output to speakers may affect sound quality,
especially due to system audio feedback preventative measures.
use only for debugging`),i.connect(t.destination)),this.source=s,this.node=a,this.analyser=i,this.processor=r,console.log("begin completed"),!0}getFrequencies(e="frequency",t=-100,s=-30){if(!this.processor)throw new Error("Session ended: please call .begin() first");return C.getFrequencies(this.analyser,this.sampleRate,null,e,t,s)}async pause(){if(this.processor){if(!this.recording)throw new Error("Already paused: please call .record() first")}else throw new Error("Session ended: please call .begin() first");return this._chunkProcessorBuffer.raw.byteLength&&this._chunkProcessor(this._chunkProcessorBuffer),this.log("Pausing ..."),await this._event("stop"),this.recording=!1,!0}async record(e=()=>{},t=8192){if(this.processor){if(this.recording)throw new Error("Already recording: please call .pause() first");if(typeof e!="function")throw new Error("chunkProcessor must be a function")}else throw new Error("Session ended: please call .begin() first");return this._chunkProcessor=e,this._chunkProcessorSize=t,this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)},this.log("Recording ..."),await this._event("start"),this.recording=!0,!0}async clear(){if(!this.processor)throw new Error("Session ended: please call .begin() first");return await this._event("clear"),!0}async read(){if(!this.processor)throw new Error("Session ended: please call .begin() first");return this.log("Reading ..."),await this._event("read")}async save(e=!1){if(!this.processor)throw new Error("Session ended: please call .begin() first");if(!e&&this.recording)throw new Error("Currently recording: please call .pause() first, or call .save(true) to force");this.log("Exporting ...");const t=await this._event("export");return new m().pack(this.sampleRate,t.audio)}async end(){if(!this.processor)throw new Error("Session ended: please call .begin() first");const e=this.processor;this.log("Stopping ..."),await this._event("stop"),this.recording=!1,this.stream.getTracks().forEach(i=>i.stop()),this.log("Exporting ...");const s=await this._event("export",{},e);return this.processor.disconnect(),this.source.disconnect(),this.node.disconnect(),this.analyser.disconnect(),this.stream=null,this.processor=null,this.source=null,this.node=null,new m().pack(this.sampleRate,s.audio)}async quit(){return this.listenForDeviceChange(null),this.deviceSelection=null,this.processor&&await this.end(),!0}}globalThis.WavRecorder=X;class Y{constructor({sampleRate:e=44100,outputToSpeakers:t=!1,debug:s=!1}={}){this.scriptSrc=L,this.sampleRate=e,this.outputToSpeakers=t,this.debug=!!s,this.stream=null,this.processor=null,this.source=null,this.node=null,this.recording=!1,this._lastEventId=0,this.eventReceipts={},this.eventTimeout=5e3,this._chunkProcessor=()=>{},this._chunkProcessorSize=void 0,this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)}}log(){return this.debug&&this.log(...arguments),!0}getSampleRate(){return this.sampleRate}getStatus(){return this.processor?this.recording?"recording":"paused":"ended"}async _event(e,t={},s=null){if(s=s||this.processor,!s)throw new Error("Can not send events without recording first");const r={event:e,id:this._lastEventId++,data:t};s.port.postMessage(r);const a=new Date().valueOf();for(;!this.eventReceipts[r.id];){if(new Date().valueOf()-a>this.eventTimeout)throw new Error(`Timeout waiting for "${e}" event`);await new Promise(n=>setTimeout(()=>n(!0),1))}const i=this.eventReceipts[r.id];return delete this.eventReceipts[r.id],i}async begin(e){if(this.processor)throw new Error("Already connected: please call .end() to start a new session");if(!e||e.kind!=="audio")throw new Error("No audio track provided");this.stream=new MediaStream([e]);const t=new AudioContext({sampleRate:this.sampleRate}),s=t.createMediaStreamSource(this.stream);try{await t.audioWorklet.addModule(this.scriptSrc)}catch(n){throw console.error(n),new Error(`Could not add audioWorklet module: ${this.scriptSrc}`)}const r=new AudioWorkletNode(t,"audio_processor");r.port.onmessage=n=>{const{event:o,id:h,data:c}=n.data;if(o==="receipt")this.eventReceipts[h]=c;else if(o==="chunk")if(this._chunkProcessorSize){const l=this._chunkProcessorBuffer;this._chunkProcessorBuffer={raw:m.mergeBuffers(l.raw,c.raw),mono:m.mergeBuffers(l.mono,c.mono)},this._chunkProcessorBuffer.mono.byteLength>=this._chunkProcessorSize&&(this._chunkProcessor(this._chunkProcessorBuffer),this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)})}else this._chunkProcessor(c)};const a=s.connect(r),i=t.createAnalyser();return i.fftSize=8192,i.smoothingTimeConstant=.1,a.connect(i),this.outputToSpeakers&&(console.warn(`Warning: Output to speakers may affect sound quality,
especially due to system audio feedback preventative measures.
use only for debugging`),i.connect(t.destination)),this.source=s,this.node=a,this.analyser=i,this.processor=r,!0}getFrequencies(e="frequency",t=-100,s=-30){if(!this.processor)throw new Error("Session ended: please call .begin() first");return C.getFrequencies(this.analyser,this.sampleRate,null,e,t,s)}async pause(){if(this.processor){if(!this.recording)throw new Error("Already paused: please call .record() first")}else throw new Error("Session ended: please call .begin() first");return this._chunkProcessorBuffer.raw.byteLength&&this._chunkProcessor(this._chunkProcessorBuffer),this.log("Pausing ..."),await this._event("stop"),this.recording=!1,!0}async record(e=()=>{},t=8192){if(this.processor){if(this.recording)throw new Error("Already recording: HELLO please call .pause() first");if(typeof e!="function")throw new Error("chunkProcessor must be a function")}else throw new Error("Session ended: please call .begin() first");return this._chunkProcessor=e,this._chunkProcessorSize=t,this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)},this.log("Recording ..."),await this._event("start"),this.recording=!0,!0}async clear(){if(!this.processor)throw new Error("Session ended: please call .begin() first");return await this._event("clear"),!0}async read(){if(!this.processor)throw new Error("Session ended: please call .begin() first");return this.log("Reading ..."),await this._event("read")}async save(e=!1){if(!this.processor)throw new Error("Session ended: please call .begin() first");if(!e&&this.recording)throw new Error("Currently recording: please call .pause() first, or call .save(true) to force");this.log("Exporting ...");const t=await this._event("export");return new m().pack(this.sampleRate,t.audio)}async end(){if(!this.processor)throw new Error("Session ended: please call .begin() first");const e=this.processor;this.log("Stopping ..."),await this._event("stop"),this.recording=!1,this.log("Exporting ...");const t=await this._event("export",{},e);return this.processor.disconnect(),this.source.disconnect(),this.node.disconnect(),this.analyser.disconnect(),this.stream=null,this.processor=null,this.source=null,this.node=null,new m().pack(this.sampleRate,t.audio)}async quit(){return this.listenForDeviceChange(null),this.processor&&await this.end(),!0}}globalThis.WavRecorder=WavRecorder;var O={};O=JSON.parse('{"name":"@pipecat-ai/daily-transport","version":"1.2.1","license":"BSD-2-Clause","main":"dist/index.js","module":"dist/index.module.js","types":"dist/index.d.ts","source":"src/index.ts","repository":{"type":"git","url":"git+https://github.com/pipecat-ai/pipecat-client-web-transports.git"},"files":["dist","package.json","README.md"],"scripts":{"build":"parcel build --no-cache","dev":"parcel watch","lint":"eslint . --ext ts --report-unused-disable-directives --max-warnings 0"},"devDependencies":{"@pipecat-ai/client-js":"^1.2.0","eslint":"9.11.1","eslint-config-prettier":"^9.1.0","eslint-plugin-simple-import-sort":"^12.1.1"},"peerDependencies":{"@pipecat-ai/client-js":"~1.2.0"},"dependencies":{"@daily-co/daily-js":"^0.83.1"},"description":"Pipecat Daily Transport Package","author":"Daily.co","bugs":{"url":"https://github.com/pipecat-ai/pipecat-client-web-transports/issues"},"homepage":"https://github.com/pipecat-ai/pipecat-client-web-transports/blob/main/transports/daily-webrtc/README.md"}');var $;(function(d){d.AUDIO_BUFFERING_STARTED="audio-buffering-started",d.AUDIO_BUFFERING_STOPPED="audio-buffering-stopped"})($||($={}));class ee{constructor(e){this._daily=e,this._proxy=new Proxy(this._daily,{get:(t,s,r)=>{if(typeof t[s]=="function"){let a;switch(String(s)){case"preAuth":a="Calls to preAuth() are disabled. Please use Transport.preAuth()";break;case"startCamera":a="Calls to startCamera() are disabled. Please use PipecatClient.initDevices()";break;case"join":a="Calls to join() are disabled. Please use PipecatClient.connect()";break;case"leave":a="Calls to leave() are disabled. Please use PipecatClient.disconnect()";break;case"destroy":a="Calls to destroy() are disabled.";break}return a?()=>{throw new Error(a)}:(...i)=>t[s](...i)}return Reflect.get(t,s,r)}})}get proxy(){return this._proxy}}class R extends F{constructor(e={}){super(),this._botId="",this._selectedCam={},this._selectedMic={},this._selectedSpeaker={},this._currentAudioTrack=null,this._audioQueue=[],this._callbacks={};const{bufferLocalAudioUntilBotReady:t,...s}=e;this._dailyFactoryOptions=s,this._bufferLocalAudioUntilBotReady=t||!1,this._daily=U.createCallObject({...this._dailyFactoryOptions,allowMultipleCallInstances:!0}),this._dailyWrapper=new ee(this._daily)}setupRecorder(){this._mediaStreamRecorder=new Y({sampleRate:R.RECORDER_SAMPLE_RATE})}handleUserAudioStream(e){this._audioQueue.push(e)}flushAudioQueue(){if(this._audioQueue.length!==0)for(w.debug(`Will flush audio queue: ${this._audioQueue.length}`);this._audioQueue.length>0;){const t=[];for(;t.length<10&&this._audioQueue.length>0;){const s=this._audioQueue.shift();s&&t.push(s)}t.length>0&&this._sendAudioBatch(t)}}_sendAudioBatch(e){const s={id:"raw-audio-batch",label:"rtvi-ai",type:"raw-audio-batch",data:{base64AudioBatch:e.map(r=>{const a=new Uint8Array(r);return btoa(String.fromCharCode(...a))}),sampleRate:R.RECORDER_SAMPLE_RATE,numChannels:1}};this.sendMessage(s)}initialize(e,t){this._bufferLocalAudioUntilBotReady&&this.setupRecorder(),this._callbacks=e.callbacks??{},this._onMessage=t,(this._dailyFactoryOptions.startVideoOff==null||e.enableCam!=null)&&(this._dailyFactoryOptions.startVideoOff=!(e.enableCam??!1)),(this._dailyFactoryOptions.startAudioOff==null||e.enableMic!=null)&&(this._dailyFactoryOptions.startAudioOff=!(e.enableMic??!0)),this.attachEventListeners(),this.state="disconnected",w.debug("[Daily Transport] Initialized",z(O).version)}get dailyCallClient(){return this._dailyWrapper.proxy}get state(){return this._state}set state(e){var t,s;this._state!==e&&(this._state=e,(s=(t=this._callbacks).onTransportStateChanged)==null||s.call(t,e))}getSessionInfo(){return this._daily.meetingSessionSummary()}async getAllCams(){const{devices:e}=await this._daily.enumerateDevices();return e.filter(t=>t.kind==="videoinput")}updateCam(e){this._daily.setInputDevicesAsync({videoDeviceId:e}).then(t=>{this._selectedCam=t.camera})}get selectedCam(){return this._selectedCam}async getAllMics(){const{devices:e}=await this._daily.enumerateDevices();return e.filter(t=>t.kind==="audioinput")}updateMic(e){this._daily.setInputDevicesAsync({audioDeviceId:e}).then(t=>{this._selectedMic=t.mic})}get selectedMic(){return this._selectedMic}async getAllSpeakers(){const{devices:e}=await this._daily.enumerateDevices();return e.filter(t=>t.kind==="audiooutput")}updateSpeaker(e){this._daily.setOutputDeviceAsync({outputDeviceId:e}).then(t=>{this._selectedSpeaker=t.speaker}).catch(t=>{var s,r;(r=(s=this._callbacks).onDeviceError)==null||r.call(s,new v(["speaker"],t.type??"unknown",t.message))})}get selectedSpeaker(){return this._selectedSpeaker}enableMic(e){this._daily.setLocalAudio(e)}get isMicEnabled(){return this._daily.localAudio()}enableCam(e){this._daily.setLocalVideo(e)}get isCamEnabled(){return this._daily.localVideo()}enableScreenShare(e){e?this._daily.startScreenShare():this._daily.stopScreenShare()}get isSharingScreen(){return this._daily.localScreenAudio()||this._daily.localScreenVideo()}tracks(){var r,a,i,n,o,h,c,l,f,y,p,u,g,A,k,b;const e=this._daily.participants()??{},t=e==null?void 0:e[this._botId],s={local:{audio:(i=(a=(r=e==null?void 0:e.local)==null?void 0:r.tracks)==null?void 0:a.audio)==null?void 0:i.persistentTrack,screenAudio:(h=(o=(n=e==null?void 0:e.local)==null?void 0:n.tracks)==null?void 0:o.screenAudio)==null?void 0:h.persistentTrack,screenVideo:(f=(l=(c=e==null?void 0:e.local)==null?void 0:c.tracks)==null?void 0:l.screenVideo)==null?void 0:f.persistentTrack,video:(u=(p=(y=e==null?void 0:e.local)==null?void 0:y.tracks)==null?void 0:p.video)==null?void 0:u.persistentTrack}};return t&&(s.bot={audio:(A=(g=t==null?void 0:t.tracks)==null?void 0:g.audio)==null?void 0:A.persistentTrack,video:(b=(k=t==null?void 0:t.tracks)==null?void 0:k.video)==null?void 0:b.persistentTrack}),s}async startRecording(){var e,t;try{w.info("[Daily Transport] Initializing recording"),await this._mediaStreamRecorder.record(s=>{this.handleUserAudioStream(s.mono)},R.RECORDER_CHUNK_SIZE),(t=(e=this._callbacks).onAudioBufferingStarted)==null||t.call(e),w.info("[Daily Transport] Recording Initialized")}catch(s){s.message.includes("Already recording")||w.error("Error starting recording",s)}}async preAuth(e){this._dailyFactoryOptions=e,await this._daily.preAuth(e)}async initDevices(){var i,n,o,h,c,l,f,y,p,u,g,A;if(!this._daily)throw new D("Transport instance not initialized");this.state="initializing";const e=await this._daily.startCamera(this._dailyFactoryOptions),{devices:t}=await this._daily.enumerateDevices(),s=t.filter(k=>k.kind==="videoinput"),r=t.filter(k=>k.kind==="audioinput"),a=t.filter(k=>k.kind==="audiooutput");this._selectedCam=e.camera,this._selectedMic=e.mic,this._selectedSpeaker=e.speaker,(n=(i=this._callbacks).onAvailableCamsUpdated)==null||n.call(i,s),(h=(o=this._callbacks).onAvailableMicsUpdated)==null||h.call(o,r),(l=(c=this._callbacks).onAvailableSpeakersUpdated)==null||l.call(c,a),(y=(f=this._callbacks).onCamUpdated)==null||y.call(f,e.camera),(u=(p=this._callbacks).onMicUpdated)==null||u.call(p,e.mic),(A=(g=this._callbacks).onSpeakerUpdated)==null||A.call(g,e.speaker),this._daily.isLocalAudioLevelObserverRunning()||await this._daily.startLocalAudioLevelObserver(100),this._daily.isRemoteParticipantsAudioLevelObserverRunning()||await this._daily.startRemoteParticipantsAudioLevelObserver(100),this.state="initialized"}_validateConnectionParams(e){if(e==null)return;if(typeof e!="object")throw new D("Invalid connection parameters");const t=e;return t.room_url?(t.url=t.room_url,delete t.room_url):t.dailyRoom&&(t.url=t.dailyRoom,delete t.dailyRoom),t.dailyToken&&(t.token=t.dailyToken,delete t.dailyToken),t.token||delete t.token,t}async _connect(e){var t,s,r;if(!this._daily)throw new D("Transport instance not initialized");e&&(this._dailyFactoryOptions={...this._dailyFactoryOptions,...e}),this.state="connecting";try{await this._daily.join(this._dailyFactoryOptions)}catch(a){throw w.error("Failed to join room",a),this.state="error",new q}(t=this._abortController)!=null&&t.signal.aborted||(this.state="connected",(r=(s=this._callbacks).onConnected)==null||r.call(s))}async sendReadyMessage(){return new Promise(e=>{var a,i;const t=()=>{const n=navigator.userAgent;return/iPad|iPhone|iPod/.test(n)||/Macintosh/.test(n)&&"ontouchend"in document},s=()=>{this.state="ready",this.flushAudioQueue(),this.sendMessage(P.clientReady()),this.stopRecording(),e()};for(const n in this._daily.participants()){const o=this._daily.participants()[n];if(!o.local&&((i=(a=o.tracks)==null?void 0:a.audio)!=null&&i.persistentTrack)){s(),e();return}}const r=n=>{var o;(o=n.participant)!=null&&o.local||(this._daily.off("track-started",r),t()?(w.debug("[Daily Transport] iOS device detected, adding 0.5 second delay before sending ready message"),setTimeout(s,500)):s())};this._daily.on("track-started",r)})}stopRecording(){var e,t;this._mediaStreamRecorder&&this._mediaStreamRecorder.getStatus()!=="ended"&&(this._mediaStreamRecorder.end(),(t=(e=this._callbacks).onAudioBufferingStopped)==null||t.call(e))}attachEventListeners(){this._daily.on("available-devices-updated",this.handleAvailableDevicesUpdated.bind(this)),this._daily.on("selected-devices-updated",this.handleSelectedDevicesUpdated.bind(this)),this._daily.on("camera-error",this.handleDeviceError.bind(this)),this._daily.on("track-started",this.handleTrackStarted.bind(this)),this._daily.on("track-stopped",this.handleTrackStopped.bind(this)),this._daily.on("participant-joined",this.handleParticipantJoined.bind(this)),this._daily.on("participant-left",this.handleParticipantLeft.bind(this)),this._daily.on("local-audio-level",this.handleLocalAudioLevel.bind(this)),this._daily.on("remote-participants-audio-level",this.handleRemoteAudioLevel.bind(this)),this._daily.on("app-message",this.handleAppMessage.bind(this)),this._daily.on("left-meeting",this.handleLeftMeeting.bind(this)),this._daily.on("error",this.handleFatalError.bind(this)),this._daily.on("nonfatal-error",this.handleNonFatalError.bind(this))}async _disconnect(){this.state="disconnecting",this._daily.stopLocalAudioLevelObserver(),this._daily.stopRemoteParticipantsAudioLevelObserver(),this._audioQueue=[],this._currentAudioTrack=null,this.stopRecording(),await this._daily.leave()}sendMessage(e){this._daily.sendAppMessage(e,"*")}handleAppMessage(e){e.data.label==="rtvi-ai"&&this._onMessage({id:e.data.id,type:e.data.type,data:e.data.data})}handleAvailableDevicesUpdated(e){var t,s,r,a,i,n;(s=(t=this._callbacks).onAvailableCamsUpdated)==null||s.call(t,e.availableDevices.filter(o=>o.kind==="videoinput")),(a=(r=this._callbacks).onAvailableMicsUpdated)==null||a.call(r,e.availableDevices.filter(o=>o.kind==="audioinput")),(n=(i=this._callbacks).onAvailableSpeakersUpdated)==null||n.call(i,e.availableDevices.filter(o=>o.kind==="audiooutput"))}handleSelectedDevicesUpdated(e){var t,s,r,a,i,n,o,h,c;((t=this._selectedCam)==null?void 0:t.deviceId)!==e.devices.camera&&(this._selectedCam=e.devices.camera,(r=(s=this._callbacks).onCamUpdated)==null||r.call(s,e.devices.camera)),((a=this._selectedMic)==null?void 0:a.deviceId)!==e.devices.mic&&(this._selectedMic=e.devices.mic,(n=(i=this._callbacks).onMicUpdated)==null||n.call(i,e.devices.mic)),((o=this._selectedSpeaker)==null?void 0:o.deviceId)!==e.devices.speaker&&(this._selectedSpeaker=e.devices.speaker,(c=(h=this._callbacks).onSpeakerUpdated)==null||c.call(h,e.devices.speaker))}handleDeviceError(e){var s,r;const t=a=>{const i=[];switch(a.type){case"permissions":return a.blockedMedia.forEach(n=>{i.push(n==="video"?"cam":"mic")}),new v(i,a.type,a.msg,{blockedBy:a.blockedBy});case"not-found":return a.missingMedia.forEach(n=>{i.push(n==="video"?"cam":"mic")}),new v(i,a.type,a.msg);case"constraints":return a.failedMedia.forEach(n=>{i.push(n==="video"?"cam":"mic")}),new v(i,a.type,a.msg,{reason:a.reason});case"cam-in-use":return i.push("cam"),new v(i,"in-use",a.msg);case"mic-in-use":return i.push("mic"),new v(i,"in-use",a.msg);case"cam-mic-in-use":return i.push("cam"),i.push("mic"),new v(i,"in-use",a.msg);case"undefined-mediadevices":case"unknown":default:return i.push("cam"),i.push("mic"),new v(i,a.type,a.msg)}};(r=(s=this._callbacks).onDeviceError)==null||r.call(s,t(e.error))}async handleLocalAudioTrack(e){if(this.state=="ready"||!this._bufferLocalAudioUntilBotReady)return;switch(this._mediaStreamRecorder.getStatus()){case"ended":try{await this._mediaStreamRecorder.begin(e),await this.startRecording()}catch{}break;case"paused":await this.startRecording();break;case"recording":default:if(this._currentAudioTrack!==e)try{await this._mediaStreamRecorder.end(),await this._mediaStreamRecorder.begin(e),await this.startRecording()}catch{}else w.warn("track-started event received for current track and already recording");break}this._currentAudioTrack=e}handleTrackStarted(e){var t,s,r,a,i;e.type==="screenAudio"||e.type==="screenVideo"?(s=(t=this._callbacks).onScreenTrackStarted)==null||s.call(t,e.track,e.participant?S(e.participant):void 0):((r=e.participant)!=null&&r.local&&e.track.kind==="audio"&&this.handleLocalAudioTrack(e.track),(i=(a=this._callbacks).onTrackStarted)==null||i.call(a,e.track,e.participant?S(e.participant):void 0))}handleTrackStopped(e){var t,s,r,a;e.type==="screenAudio"||e.type==="screenVideo"?(s=(t=this._callbacks).onScreenTrackStopped)==null||s.call(t,e.track,e.participant?S(e.participant):void 0):(a=(r=this._callbacks).onTrackStopped)==null||a.call(r,e.track,e.participant?S(e.participant):void 0)}handleParticipantJoined(e){var s,r,a,i;const t=S(e.participant);(r=(s=this._callbacks).onParticipantJoined)==null||r.call(s,t),!t.local&&(this._botId=e.participant.session_id,(i=(a=this._callbacks).onBotConnected)==null||i.call(a,t))}handleParticipantLeft(e){var s,r,a,i;const t=S(e.participant);(r=(s=this._callbacks).onParticipantLeft)==null||r.call(s,t),!t.local&&(this._botId="",(i=(a=this._callbacks).onBotDisconnected)==null||i.call(a,t))}handleLocalAudioLevel(e){var t,s;(s=(t=this._callbacks).onLocalAudioLevel)==null||s.call(t,e.audioLevel)}handleRemoteAudioLevel(e){var r,a;const t=this._daily.participants(),s=Object.keys(e.participantsAudioLevel);for(let i=0;i<s.length;i++){const n=s[i],o=e.participantsAudioLevel[n];(a=(r=this._callbacks).onRemoteAudioLevel)==null||a.call(r,o,S(t[n]))}}handleLeftMeeting(){var e,t;this.state="disconnected",this._botId="",(t=(e=this._callbacks).onDisconnected)==null||t.call(e)}handleFatalError(e){var t,s;w.error("Daily fatal error",e.errorMsg),this.state="error",this._botId="",(s=(t=this._callbacks).onError)==null||s.call(t,P.error(e.errorMsg,!0))}handleNonFatalError(e){var t,s;switch(e.type){case"screen-share-error":(s=(t=this._callbacks).onScreenShareError)==null||s.call(t,e.errorMsg);break}}}R.RECORDER_SAMPLE_RATE=16e3;R.RECORDER_CHUNK_SIZE=512;const S=d=>({id:d.user_id,local:d.local,name:d.user_name});export{$ as DailyRTVIMessageType,R as DailyTransport};
