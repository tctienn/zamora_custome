<template>
    <Button class="butotn" label="Upload Ảnh" icon="pi pi-upload" outlined @click="showDialogUploadImage = true" />

    <Dialog v-model:visible="showDialogUploadImage" modal header="Tải ảnh lên album" :style="{ width: '35rem' }">
        <template #header>
            <div class="dialog-header-custom">
                <i class="pi pi-cloud-upload" style="font-size: 1.5rem; margin-right: 0.5rem;"></i>
                <span>Tải ảnh lên album</span>
            </div>
        </template>

        <div class="container">
            <!-- Upload area -->
            <div class="upload-area" @click="triggerFileSelect">
                <div class="upload-content">
                    <i class="pi pi-image" :class="{ 'pulse': !previewUrl.length }"></i>
                    <p class="upload-text">Click để chọn ảnh hoặc kéo thả ảnh vào đây</p>
                    <small class="upload-hint">Chấp nhận: JPG, PNG, GIF (tối đa 10MB)</small>
                </div>
                <FileUpload 
                    ref="fileUpload" 
                    mode="basic" 
                    name="fileUpload" 
                    accept="image/*" 
                    :maxFileSize="10000000"
                    :customUpload="true" 
                    :multiple="true" 
                    @select="onSelect"
                    :hidden="true"
                />
            </div>

            <!-- Preview images -->
            <div v-if="previewUrl.length" class="preview-section">
                <div class="preview-header">
                    <i class="pi pi-eye"></i>
                    <label class="label">Ảnh đã chọn ({{ previewUrl.length }})</label>
                </div>
                <div class="preview-scroll">
                    <div v-for="(src, idx) in previewUrl" :key="idx" class="thumb">
                        <img :src="src" :alt="`preview-${idx}`" />
                        <button class="remove-btn" @click="removePreview(idx)">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Progress bar -->
            <div v-if="isUploading" class="progress-section">
                <div class="progress-container">
                    <div class="progress-bar" :style="{ width: progress + '%' }">
                        <span class="progress-text">{{ Math.round(progress) }}%</span>
                    </div>
                </div>
                <div class="status-info">
                    <i class="pi pi-spin pi-spinner" style="margin-right: 8px;"></i>
                    <span class="status-text">{{ statusText }}</span>
                </div>
            </div>

           
        </div>
         <template #footer>
                <Button 
                    label="Hủy" 
                    severity="secondary" 
                    :disabled="isUploading" 
                    @click="handleClose"
                ></Button>
                <Button 
                    label="Tải lên" 
                    :loading="isUploading"
                    :disabled="!previewUrl.length || isUploading" 
                    @click="handleUpload"
                >
                    <template v-if="!isUploading">
                        <i class="pi pi-upload" style="margin-right: 6px;"></i>
                        Tải lên
                    </template>
                    <template v-else>
                        <i class="pi pi-spin pi-spinner" style="margin-right: 6px;"></i>
                        Đang tải...
                    </template>
                </Button>
            </template>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Dialog from 'primevue/dialog'
import { toastSuccess, toastError } from '@/common/helpers/custom-toast-service'
import { api } from '../../api/Album'

// ---- component main state & logic ----
const emit = defineEmits(['updateData'])
const props = defineProps({
    album: { type: Object, required: false }
})

// reactive state
const showDialogUploadImage = ref(false)
const previewUrl = ref([])
const rawFiles = ref([])
const fileUpload = ref(null)

// progress
const isUploading = ref(false)
const progress = ref(0) // 0 - 100
const statusText = ref('')

// convert file -> base64 (chỉ dùng để preview)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
    })
}

// Trigger file select manually
const triggerFileSelect = () => {
    if (fileUpload.value) {
        fileUpload.value.$el.querySelector('input[type="file"]')?.click()
    }
}

// Remove preview image
const removePreview = (index) => {
    previewUrl.value.splice(index, 1)
    rawFiles.value.splice(index, 1)
}

// event khi user chọn file (PrimeVue FileUpload emit e.files)
const onSelect = async (e) => {
    try {
        const files = e.files || []
        const newFiles = Array.from(files)
        
        // Add to existing files instead of replacing
        rawFiles.value = [...rawFiles.value, ...newFiles]
        
        const base64List = await Promise.all(newFiles.map((f) => fileToBase64(f)))
        previewUrl.value = [...previewUrl.value, ...base64List]
    } catch (err) {
        console.error('Lỗi khi đọc file:', err)
        toastError({ message: 'Không thể đọc file để xem trước' })
    }
}

const handleClose = () => {
    if (isUploading.value) {
        toastError('Đang upload — vui lòng chờ hoàn tất')
        return
    }
    showDialogUploadImage.value = false
    previewUrl.value = []
    rawFiles.value = []
    progress.value = 0
    statusText.value = ''
}

// hàm upload tích hợp (toàn bộ logic ở đây)
const handleUpload = async () => {
    if (!rawFiles.value.length) {
        toastError({ message: 'Chưa có ảnh để upload' })
        return
    }

    // prepare form data
    const form = new FormData()
    // backend bạn trước đó dùng folderId; nếu backend khác, sửa key
    form.append('folderId', props.album?.id ?? '')
    rawFiles.value.forEach((f) => {
        if (f instanceof File) {
            form.append('files', f)
        } else {
            console.warn('Không phải File:', f)
        }
    })

    // lấy token (nếu app bạn lưu token ở chỗ khác, thay chỗ này)
    const token = localStorage.getItem('token') || ''

    isUploading.value = true
    progress.value = 0
    statusText.value = 'Đang khởi tạo...'

    try {
        const resp = await api.post(`/api/photos/create-photos`, form, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            onUploadProgress: (e) => {
                if (e.total) {
                    const percent = (e.loaded / e.total) * 100
                    progress.value = Math.min(100, percent)
                    statusText.value = `Đang tải lên ${Math.round(progress.value)}%`
                }
            }
        })

        progress.value = 100
        statusText.value = 'Hoàn tất!'
        toastSuccess('Tải ảnh thành công!')

        emit('updateData')

        setTimeout(() => {
            isUploading.value = false
            showDialogUploadImage.value = false
            previewUrl.value = []
            rawFiles.value = []
            progress.value = 0
            statusText.value = ''
        }, 1000)

        return resp
    } catch (err) {
        console.error('Lỗi upload:', err)
        statusText.value = 'Lỗi tải ảnh'
        toastError('Upload thất bại! ' + (err?.message || ''))
        isUploading.value = false
        return Promise.reject(err)
    }
}
</script>

<style scoped>

.dialog-header-custom {
    display: flex;
    align-items: center;
    font-weight: 600;
}

.container {
    padding: 0;
}

.upload-area {
    border: 2px dashed #dee2e6;
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8f9fa;
    margin-bottom: 1.5rem;
}

.upload-area:hover {
    border-color: #007bff;
    background: #e7f3ff;
}

.upload-content i {
    font-size: 3rem;
    color: #6c757d;
    margin-bottom: 1rem;
}

.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.upload-text {
    font-size: 1rem;
    font-weight: 500;
    color: #495057;
    margin: 0 0 8px 0;
}

.upload-hint {
    font-size: 0.875rem;
    color: #868e96;
}

.preview-section {
    margin: 1.5rem 0;
}

.preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
}

.preview-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 0;
    max-height: 150px;
}

.thumb {
    position: relative;
    flex: 0 0 auto;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #dee2e6;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
}

.thumb:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(220, 53, 69, 0.9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.thumb:hover .remove-btn {
    opacity: 1;
}

.progress-section {
    margin: 1.5rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.progress-container {
    width: 100%;
    height: 24px;
    background: #e9ecef;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 12px;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.3) 50%, 
        transparent 100%
    );
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

.progress-text {
    color: white;
    font-size: 12px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.status-info {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    color: #495057;
}

.status-text {
    font-weight: 500;
}

/* Hide PrimeVue FileUpload default UI */
:deep(.p-fileupload) {
    display: none;
}

.butotn{
    margin:0 0 0 10px
}
</style>
