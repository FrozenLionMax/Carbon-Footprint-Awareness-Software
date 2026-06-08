"use client"

class AudioEngine {
  private ctx: AudioContext | null = null

  private init() {
    if (typeof window !== "undefined" && !this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()
      }
    }
  }

  public playTick() {
    this.init()
    if (!this.ctx) return

    try {
      // Resume context if suspended (browser autoplay policy)
      if (this.ctx.state === "suspended") this.ctx.resume()

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      // High frequency click for mechanical tick
      osc.type = "triangle"
      osc.frequency.setValueAtTime(800, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.02)

      // Extremely fast decay for a "tick" sound
      gain.gain.setValueAtTime(0, this.ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.02)
    } catch (e) {
      // Ignore audio errors
    }
  }

  public playToggle(on: boolean) {
    this.init()
    if (!this.ctx) return

    try {
      if (this.ctx.state === "suspended") this.ctx.resume()

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      // Lower frequency "thud/click" for a toggle button
      osc.type = "sine"
      const freq = on ? 400 : 300
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq / 2, this.ctx.currentTime + 0.05)

      gain.gain.setValueAtTime(0, this.ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.05)
    } catch (e) {
      // Ignore
    }
  }
}

class DroneEngine {
  private ctx: AudioContext | null = null
  private osc: OscillatorNode | null = null
  private gain: GainNode | null = null
  public isPlaying = false

  private init() {
    if (typeof window !== "undefined" && !this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()
      }
    }
  }

  public toggle() {
    this.init()
    if (!this.ctx) return

    if (this.isPlaying) {
      this.stop()
    } else {
      this.start()
    }
  }

  private start() {
    if (!this.ctx || this.isPlaying) return
    if (this.ctx.state === "suspended") this.ctx.resume()

    this.osc = this.ctx.createOscillator()
    this.gain = this.ctx.createGain()

    // Smooth deep sine wave
    this.osc.type = "sine"
    this.osc.frequency.setValueAtTime(80, this.ctx.currentTime)

    // Very low volume ambient drone
    this.gain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2)

    this.osc.connect(this.gain)
    this.gain.connect(this.ctx.destination)

    this.osc.start()
    this.isPlaying = true
  }

  private stop() {
    if (!this.osc || !this.gain || !this.ctx) return
    this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1)
    setTimeout(() => {
      if (this.osc) {
        this.osc.stop()
        this.osc.disconnect()
        this.osc = null
      }
      this.isPlaying = false
    }, 1000)
  }

  public updateTension(overshootRatio: number) {
    if (!this.isPlaying || !this.osc || !this.ctx) return

    // Baseline (1.0x) = 80Hz calm drone
    // Critical (8.0x+) = 160Hz tense drone
    const targetFreq = Math.max(60, Math.min(200, 80 + ((overshootRatio - 1) * 10)))
    
    // Smoothly glide to the new frequency over 1 second
    this.osc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 1)
  }
}

export const hapticAudio = new AudioEngine()
export const ambientDrone = new DroneEngine()
