<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '../stores/chat'
import { soundManager } from '../utils/sound'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'upload'])

const chatStore = useChatStore()
const isDragging = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)
const uploading = ref(false)

// 支持的图片类型
const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

// 模块是否支持图片上传
const imageUploadModules = ['palm', 'tarot', 'dream', 'fengshui', 'zodiac']

const currentModuleSupportsImage = computed(() => {
  return imageUploadModules.includes(chatStore.currentModule)
})

// 处理拖拽
function handleDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFileSelect(files[0])
  }
}

// 处理文件选择
function handleFileSelect(file) {
  if (!file) return
  
  // 验证文件类型
  if (!acceptedTypes.includes(file.type)) {
    alert('请上传图片文件 (JPG, PNG, GIF, WebP)')
    return
  }
  
  // 验证文件大小 (最大5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }
  
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

// 触发文件选择
function triggerFileInput() {
  document.getElementById('file-input').click()
}

function handleFileInput(e) {
  const files = e.target.files
  if (files.length > 0) {
    handleFileSelect(files[0])
  }
}

// 上传图片
async function uploadImage() {
  if (!selectedFile.value || uploading.value) return
  
  uploading.value = true
  
  // 将图片转为base64
  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target.result
    
    // 发送包含图片的消息
    const moduleName = chatStore.modules.find(m => m.id === chatStore.currentModule)?.name || 'AI'
    
    // 根据不同模块生成不同的提示
    let prompt = ''
    switch (chatStore.currentModule) {
      case 'palm':
        prompt = '请帮我分析这张手掌照片中的掌纹'
        break
      case 'tarot':
        prompt = '请帮我解读这张塔罗牌'
        break
      case 'dream':
        prompt = '请帮我分析这张图片与我的梦境'
        break
      case 'fengshui':
        prompt = '请帮我分析这张图片中的风水布局'
        break
      case 'zodiac':
        prompt = '请帮我分析这张星座图片'
        break
      default:
        prompt = '请帮我分析这张图片'
    }
    
    // 添加用户消息（带图片）
    chatStore.messages.push({
      role: 'user',
      content: prompt,
      image: base64,
      timestamp: Date.now()
    })
    
    soundManager.playSend()
    
    // 发送到后端
    await chatStore.sendMessageWithImage(prompt, base64)
    
    uploading.value = false
    close()
  }
  
  reader.readAsDataURL(selectedFile.value)
}

function close() {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  emit('close')
}

// 删除选中的图片
function removeImage() {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}
</script>

<template>
  <div v-if="visible" class="upload-overlay" @click.self="close">
    <div class="upload-modal">
      <div class="modal-header">
        <h3>📸 上传图片</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>
      
      <div class="modal-body">
        <!-- 当前模块不支持时 -->
        <div v-if="!currentModuleSupportsImage" class="not-supported">
          <span class="not-supported-icon">⚠️</span>
          <p>当前模块暂不支持图片上传</p>
          <p class="supported-modules">
            支持模块：手相、塔罗、梦境、风水、星座
          </p>
        </div>
        
        <!-- 支持上传时 -->
        <template v-else>
          <!-- 拖拽区域 -->
          <div 
            class="drop-zone"
            :class="{ dragging: isDragging, 'has-file': selectedFile }"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @click="triggerFileInput"
          >
            <input 
              id="file-input" 
              type="file" 
              accept="image/*"
              @change="handleFileInput"
              hidden
            />
            
            <template v-if="!selectedFile">
              <div class="drop-icon">📁</div>
              <p class="drop-text">点击或拖拽图片到这里</p>
              <p class="drop-hint">支持 JPG, PNG, GIF, WebP (最大5MB)</p>
            </template>
            
            <!-- 预览 -->
            <div v-else class="preview-container">
              <img :src="previewUrl" alt="预览" class="preview-image" />
              <button class="remove-btn" @click.stop="removeImage">✕</button>
            </div>
          </div>
          
          <!-- 提示文字 -->
          <div class="upload-tips">
            <p v-if="chatStore.currentModule === 'palm'">
              💡 建议：上传清晰的手掌照片，掌心朝上，光线均匀
            </p>
            <p v-else-if="chatStore.currentModule === 'tarot'">
              💡 建议：确保塔罗牌图像清晰完整
            </p>
            <p v-else-if="chatStore.currentModule === 'dream'">
              💡 建议：可以上传与梦境相关的图片或符号
            </p>
            <p v-else>
              💡 建议：上传清晰的图片以获得更准确的解读
            </p>
          </div>
        </template>
      </div>
      
      <div class="modal-footer" v-if="currentModuleSupportsImage && selectedFile">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="upload-btn" @click="uploadImage" :disabled="uploading">
          <span v-if="uploading">上传中...</span>
          <span v-else>开始解读</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.upload-modal {
  width: 90%;
  max-width: 480px;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.not-supported {
  text-align: center;
  padding: 40px 20px;
}

.not-supported-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.not-supported p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px;
}

.supported-modules {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4) !important;
}

.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.05);
}

.drop-zone.has-file {
  padding: 20px;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.drop-text {
  color: #fff;
  font-size: 15px;
  margin: 0 0 8px;
}

.drop-hint {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  margin: 0;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  background: rgba(255, 59, 48, 0.9);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-tips {
  margin-top: 20px;
  padding: 16px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 12px;
}

.upload-tips p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin: 0;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.cancel-btn,
.upload-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}

.upload-btn {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
  font-weight: 600;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.upload-btn:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
