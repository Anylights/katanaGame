/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private volume: number = 0.5;
  private isBgmPlaying: boolean = false;
  private bgmTimeoutId: number | null = null;
  private currentBeats: number = 0;
  private isSlowMo: boolean = false;
  private distortionCurve: Float32Array | null = null;

  constructor() {
    // Initialized lazily to comply with browser standards (user interaction required)
  }

  private makeDistortionCurve(amount: number = 30): Float32Array {
    if (this.distortionCurve) return this.distortionCurve;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    this.distortionCurve = curve;
    return curve;
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.value = 20000; // default fully open

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      // Chain: Node -> Lowpass -> Master -> Destination
      this.lowpassFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx?.currentTime || 0);
    }
  }

  setSlowMotion(slow: boolean) {
    this.isSlowMo = slow;
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;
    
    // Smoothly transition filter frequency during slow-motion
    if (slow) {
      // Muffle the highs, boost lows slightly for a dramatic slow-mo effect
      this.lowpassFilter.frequency.setTargetAtTime(350, now, 0.1);
    } else {
      // Instantly open the filter back up
      this.lowpassFilter.frequency.setTargetAtTime(20000, now, 0.05);
    }
  }

  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playSlash() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;

    const duration = this.isSlowMo ? 0.42 : 0.20;

    // 1. Blade Body - Solid Low-Mid Sweep
    const osc1 = this.ctx.createOscillator();
    const gainOsc1 = this.ctx.createGain();
    osc1.type = 'triangle';
    const startFreq1 = this.isSlowMo ? 400 : 950;
    const endFreq1 = this.isSlowMo ? 45 : 75;
    osc1.frequency.setValueAtTime(startFreq1, now);
    osc1.frequency.exponentialRampToValueAtTime(endFreq1, now + duration);

    gainOsc1.gain.setValueAtTime(0.35, now);
    gainOsc1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gainOsc1);
    gainOsc1.connect(this.lowpassFilter);

    // 2. Metallic Blade Edge - Sawtooth Sweep for Grit
    const osc2 = this.ctx.createOscillator();
    const gainOsc2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    const startFreq2 = this.isSlowMo ? 700 : 1600;
    const endFreq2 = this.isSlowMo ? 80 : 120;
    osc2.frequency.setValueAtTime(startFreq2, now);
    osc2.frequency.exponentialRampToValueAtTime(endFreq2, now + duration);

    gainOsc2.gain.setValueAtTime(0.08, now);
    gainOsc2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc2.connect(gainOsc2);
    gainOsc2.connect(this.lowpassFilter);

    // 3. Shrill Air Tear - Bandpass filtered noise with swift frequency slide
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(this.isSlowMo ? 900 : 2200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 120 : 250, now + duration);
    noiseFilter.Q.value = 4.0; // tight resonance for "schwing" steel whistle

    const gainNoise = this.ctx.createGain();
    gainNoise.gain.setValueAtTime(0.48, now);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Distort the wind shear slightly for a razor-edge slice sensation
    const distort = this.ctx.createWaveShaper();
    distort.curve = this.makeDistortionCurve(15);
    distort.oversample = '4x';

    noise.connect(noiseFilter);
    noiseFilter.connect(distort);
    distort.connect(gainNoise);
    gainNoise.connect(this.lowpassFilter);

    // Start
    osc1.start(now);
    osc2.start(now);
    noise.start(now);

    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
    noise.stop(now + duration + 0.05);
  }

  playDeflect() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;
    
    // High metal crystalline strike (3 Harmonious chimes + pitch lasers)
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const o3 = this.ctx.createOscillator();
    
    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    const g3 = this.ctx.createGain();

    const d1 = this.isSlowMo ? 0.9 : 0.55;

    // Chime 1 (Vibrant core ring)
    o1.type = 'sine';
    o1.frequency.setValueAtTime(this.isSlowMo ? 1250 : 2800, now);
    o1.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 700 : 1500, now + d1);
    g1.gain.setValueAtTime(0.45, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + d1);

    // Chime 2 (Brilliant harmonic octave)
    o2.type = 'sine';
    o2.frequency.setValueAtTime(this.isSlowMo ? 1800 : 3900, now);
    o2.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 1100 : 2100, now + d1 * 0.85);
    g2.gain.setValueAtTime(0.35, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + d1 * 0.85);

    // Chime 3 (Rising laser energy reflection beam)
    o3.type = 'triangle';
    o3.frequency.setValueAtTime(this.isSlowMo ? 900 : 1800, now);
    o3.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 3500 : 6500, now + 0.12 * (this.isSlowMo ? 2.0 : 1.0));
    g3.gain.setValueAtTime(0.20, now);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.12 * (this.isSlowMo ? 2.0 : 1.0));

    o1.connect(g1);
    o2.connect(g2);
    o3.connect(g3);
    
    g1.connect(this.lowpassFilter);
    g2.connect(this.lowpassFilter);
    g3.connect(this.lowpassFilter);

    // Sparkling metallic friction splash (white noise highpassed)
    const sparks = this.ctx.createBufferSource();
    sparks.buffer = this.createNoiseBuffer();
    
    const sparksFilter = this.ctx.createBiquadFilter();
    sparksFilter.type = 'highpass';
    sparksFilter.frequency.setValueAtTime(this.isSlowMo ? 2500 : 6000, now);
    
    const sparksGain = this.ctx.createGain();
    sparksGain.gain.setValueAtTime(0.42, now);
    sparksGain.gain.exponentialRampToValueAtTime(0.001, now + (this.isSlowMo ? 0.32 : 0.15));

    sparks.connect(sparksFilter);
    sparksFilter.connect(sparksGain);
    sparksGain.connect(this.lowpassFilter);

    o1.start(now);
    o2.start(now);
    o3.start(now);
    sparks.start(now);

    o1.stop(now + d1 + 0.05);
    o2.stop(now + d1 + 0.05);
    o3.stop(now + d1 + 0.05);
    sparks.stop(now + d1);
  }

  playKill() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;

    const d = this.isSlowMo ? 0.85 : 0.45;

    // 1. Extreme sub/low bass drop (Heavy impact bone structural crush)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(this.isSlowMo ? 110 : 250, now);
    subOsc.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 12 : 28, now + d);
    
    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + d);
    
    subOsc.connect(subGain);
    subGain.connect(this.lowpassFilter);

    // 2. Shock metal burst pop at initial strike frame (10ms)
    const highPop = this.ctx.createOscillator();
    const highPopGain = this.ctx.createGain();
    highPop.type = 'sine';
    highPop.frequency.setValueAtTime(4200, now);
    highPop.frequency.linearRampToValueAtTime(400, now + 0.04);
    highPopGain.gain.setValueAtTime(0.35, now);
    highPopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    highPop.connect(highPopGain);
    highPopGain.connect(this.lowpassFilter);

    // 3. Brutal Distorted Flesh Splat (White noise -> severe distortion wave shaper)
    const splatNoise = this.ctx.createBufferSource();
    splatNoise.buffer = this.createNoiseBuffer();

    const splatFilter = this.ctx.createBiquadFilter();
    splatFilter.type = 'lowpass';
    splatFilter.frequency.setValueAtTime(this.isSlowMo ? 450 : 950, now);
    splatFilter.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 60 : 120, now + d);

    const distort = this.ctx.createWaveShaper();
    distort.curve = this.makeDistortionCurve(65); // High overdrive amount for messy, crunching split
    distort.oversample = '4x';

    const splatGain = this.ctx.createGain();
    splatGain.gain.setValueAtTime(0.62, now);
    splatGain.gain.exponentialRampToValueAtTime(0.001, now + d);

    splatNoise.connect(splatFilter);
    splatFilter.connect(distort);
    distort.connect(splatGain);
    splatGain.connect(this.lowpassFilter);

    // Trigger oscillations
    subOsc.start(now);
    highPop.start(now);
    splatNoise.start(now);

    subOsc.stop(now + d + 0.05);
    highPop.stop(now + 0.05);
    splatNoise.stop(now + d + 0.05);
  }

  playDash() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;
    const dur = 0.22;

    // Jet propulsion roar noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1000, now);
    bp.frequency.exponentialRampToValueAtTime(4500, now + dur);
    bp.Q.value = 1.5;

    const gNoise = this.ctx.createGain();
    gNoise.gain.setValueAtTime(0.35, now);
    gNoise.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(bp);
    bp.connect(gNoise);
    gNoise.connect(this.lowpassFilter);

    // Cyber thruster synthetic booster sweep
    const sweep = this.ctx.createOscillator();
    const gSweep = this.ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(75, now);
    sweep.frequency.exponentialRampToValueAtTime(580, now + dur);

    gSweep.gain.setValueAtTime(0.12, now);
    gSweep.gain.exponentialRampToValueAtTime(0.001, now + dur);

    sweep.connect(gSweep);
    gSweep.connect(this.lowpassFilter);

    noise.start(now);
    sweep.start(now);

    noise.stop(now + dur + 0.05);
    sweep.stop(now + dur + 0.05);
  }

  playJump() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;
    const dur = 0.12;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + dur);

    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g);
    g.connect(this.lowpassFilter);

    osc.start(now);
    osc.stop(now + dur + 0.1);
  }

  playBulletFired() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;
    const d = this.isSlowMo ? 0.35 : 0.15;

    // Cyber laser weapon sound
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.isSlowMo ? 300 : 900, now);
    osc.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 50 : 180, now + d);

    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + d);

    osc.connect(g);
    g.connect(this.lowpassFilter);

    osc.start(now);
    osc.stop(now + d + 0.1);
  }

  playSlowMoActivate() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    g.gain.setValueAtTime(0.25, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.4);

    osc.connect(g);
    g.connect(this.lowpassFilter);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playSlowMoDeactivate() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);

    g.gain.setValueAtTime(0.18, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.25);

    osc.connect(g);
    g.connect(this.lowpassFilter);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playRewind() {
    this.init();
    if (!this.ctx || !this.lowpassFilter) return;
    // Just a quick synthetic glitch
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3000, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.08);

    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(g);
    g.connect(this.lowpassFilter);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  startBGM() {
    this.init();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.currentBeats = 0;
    this.playBgmStep();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId) {
      clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  private playBgmStep() {
    if (!this.isBgmPlaying || !this.ctx || !this.lowpassFilter) return;

    const now = this.ctx.currentTime;
    
    // A nostalgic driving 4/4 cyberpunk drone synth line
    // Every beat is 125 BPM -> 0.48s per beat, 0.12s per 16th note step
    const tempo = this.isSlowMo ? 1.8 : 1.0; 
    const beatTime = 0.12 * tempo;

    // Pattern length = 16 steps
    const step = this.currentBeats % 16;
    
    // 1. Kick Drum on step 0, 4, 8, 12 (Heavier weight and pitch slide)
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(this.isSlowMo ? 70 : 160, now);
      kickOsc.frequency.exponentialRampToValueAtTime(this.isSlowMo ? 25 : 45, now + 0.14 * tempo);
      
      kickGain.gain.setValueAtTime(0.35, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14 * tempo);
      
      kickOsc.connect(kickGain);
      kickGain.connect(this.lowpassFilter);
      kickOsc.start(now);
      kickOsc.stop(now + 0.16 * tempo);
    }

    // 2. Snare drum on 4 and 12 (Cybernetic retro snare punch!)
    if (step === 4 || step === 12) {
      // Snare high-passed noise burst
      const snareNoise = this.ctx.createBufferSource();
      snareNoise.buffer = this.createNoiseBuffer();
      
      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.setValueAtTime(this.isSlowMo ? 600 : 1300, now);
      snareFilter.Q.value = 1.0;

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.12, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 * tempo);

      snareNoise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(this.lowpassFilter);
      
      // Snare low-mid body pop
      const snareBody = this.ctx.createOscillator();
      const snareBodyGain = this.ctx.createGain();
      snareBody.type = 'triangle';
      snareBody.frequency.setValueAtTime(this.isSlowMo ? 95 : 190, now);
      snareBodyGain.gain.setValueAtTime(0.18, now);
      snareBodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 * tempo);
      
      snareBody.connect(snareBodyGain);
      snareBodyGain.connect(this.lowpassFilter);

      snareNoise.start(now);
      snareBody.start(now);
      
      snareNoise.stop(now + 0.16 * tempo);
      snareBody.stop(now + 0.16 * tempo);
    }

    // 3. Cybernetic Hi-hats with bounce on odd steps (1, 3, 5, 7, 9, 11, 13, 15)
    if (step % 2 === 1) {
      const hat = this.ctx.createBufferSource();
      hat.buffer = this.createNoiseBuffer();
      const hatFilter = this.ctx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(this.isSlowMo ? 4000 : 8500, now);

      // Bounce volume slightly check for nice syncopation flow!
      const volMultiplier = (step % 4 === 3) ? 0.05 : 0.03;
      const hatGain = this.ctx.createGain();
      hatGain.gain.setValueAtTime(volMultiplier, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04 * tempo);

      hat.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(this.lowpassFilter);
      hat.start(now);
      hat.stop(now + 0.05 * tempo);
    }

    // 4. Heavy Unison Growling Cyber Bass on steps
    const notes = [55, 55, 65.41, 65.41, 58.27, 58.27, 48.99, 48.99, 51.91, 51.91, 55, 55, 61.74, 61.74, 55, 65.41];
    const baseFreq = notes[step];
    
    if (step % 2 === 0) {
      // Bass Oscillator 1 (Main fat Sawtooth)
      const bassOsc1 = this.ctx.createOscillator();
      const bassGain1 = this.ctx.createGain();
      bassOsc1.type = 'sawtooth';
      
      const octaveMultiplier = this.isSlowMo ? 0.5 : 1.0;
      bassOsc1.frequency.setValueAtTime(baseFreq * octaveMultiplier, now);
      
      // Bass Oscillator 2 (Slightly detuned fat unison widen)
      const bassOsc2 = this.ctx.createOscillator();
      const bassGain2 = this.ctx.createGain();
      bassOsc2.type = 'sawtooth';
      bassOsc2.frequency.setValueAtTime((baseFreq * octaveMultiplier) + 0.8, now); // 0.8 Hz detuned unison
      
      const bassDur = (step % 4 === 0 ? 0.16 : 0.09) * tempo;
      
      bassGain1.gain.setValueAtTime(0.12, now);
      bassGain1.gain.exponentialRampToValueAtTime(0.001, now + bassDur);

      bassGain2.gain.setValueAtTime(0.07, now);
      bassGain2.gain.exponentialRampToValueAtTime(0.001, now + bassDur * 0.95);

      bassOsc1.connect(bassGain1);
      bassOsc2.connect(bassGain2);
      
      bassGain1.connect(this.lowpassFilter);
      bassGain2.connect(this.lowpassFilter);
      
      bassOsc1.start(now);
      bassOsc2.start(now);
      
      bassOsc1.stop(now + bassDur + 0.03);
      bassOsc2.stop(now + bassDur + 0.03);
    }

    this.currentBeats++;
    
    // Schedule next beat
    this.bgmTimeoutId = window.setTimeout(() => {
      this.playBgmStep();
    }, beatTime * 1000);
  }
}

export const AudioSynth = new AudioSynthEngine();
