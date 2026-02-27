// 语音输入工具
class VoiceInput {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.onResult = null
    this.onError = null
    this.onEnd = null
    
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.lang = 'zh-CN'
      this.recognition.interimResults = true
      this.recognition.continuous = false
      
      this.recognition.onresult = (event) => {
        const results = event.results
        const lastResult = results[results.length - 1]
        const transcript = lastResult[0].transcript
        
        if (lastResult.isFinal) {
          if (this.onResult) {
            this.onResult(transcript)
          }
        }
      }
      
      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        if (this.onError) {
          this.onError(event.error)
        }
      }
      
      this.recognition.onend = () => {
        this.isListening = false
        if (this.onEnd) {
          this.onEnd()
        }
      }
    }
  }
  
  // 开始监听
  start() {
    if (!this.recognition) {
      if (this.onError) {
        this.onError('browser-not-supported')
      }
      return false
    }
    
    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch (e) {
      console.error('启动语音识别失败:', e)
      return false
    }
  }
  
  // 停止监听
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }
  
  // 是否支持语音识别
  isSupported() {
    return !!this.recognition
  }
}

export const voiceInput = new VoiceInput()
