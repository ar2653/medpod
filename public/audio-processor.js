class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      for (let channel = 0; channel < input.length; channel++) {
        output[channel].set(input[channel]);
      }
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  

