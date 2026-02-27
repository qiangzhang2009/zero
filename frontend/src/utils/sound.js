// 音效工具
class SoundManager {
  constructor() {
    this.enabled = true
    this.audioContext = null
  }
  
  // 初始化音频上下文
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }
  
  // 播放提示音
  playTone(frequency = 440, duration = 0.1, type = 'sine') {
    if (!this.enabled) return
    
    this.init()
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }
  
  // 消息发送音效
  playSend() {
    this.playTone(600, 0.08, 'sine')
    setTimeout(() => this.playTone(800, 0.06, 'sine'), 50)
  }
  
  // 消息接收音效
  playReceive() {
    this.playTone(400, 0.1, 'sine')
    setTimeout(() => this.playTone(500, 0.08, 'sine'), 80)
    setTimeout(() => this.playTone(600, 0.06, 'sine'), 160)
  }
  
  // 切换音效
  playClick() {
    this.playTone(300, 0.05, 'sine')
  }
  
  // 启用/禁用
  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }
}

export const soundManager = new SoundManager()
