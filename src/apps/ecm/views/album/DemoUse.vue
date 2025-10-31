<template>
    <div class="demo-use-page">
        <div class="poster-form-container">
            <h2 class="form-title">Tạo Poster</h2>
            
            <form @submit.prevent="handleSubmit" class="poster-form">
                <!-- Title field -->
                <div class="form-field">
                    <label for="poster-title" class="field-label">Tiêu đề poster</label>
                    <InputText 
                        id="poster-title"
                        v-model="formData.title" 
                        placeholder="Nhập tiêu đề poster"
                        class="form-input"
                    />
                </div>

                <!-- Image selection section -->
                <div class="form-field">
                    <label class="field-label">Chọn ảnh</label>
                    <div class="image-selector-buttons">
                        <Button 
                            label="Upload ảnh" 
                            icon="pi pi-upload"
                            @click="openImageSelector('upload')"
                            severity="secondary"
                        />
                        <Button 
                            label="Chọn từ Album" 
                            icon="pi pi-images"
                            @click="openImageSelector('album')"
                            severity="secondary"
                        />
                    </div>
                    
                    <!-- Preview selected image -->
                    <div v-if="selectedImagePreview" class="image-preview-section">
                        <label class="field-label">Ảnh đã chọn:</label>
                        <div class="image-preview-wrapper">
                            <img 
                                :src="selectedImagePreview" 
                                alt="Preview"
                                class="preview-image"
                            />
                            <button 
                                type="button"
                                @click="clearImage"
                                class="remove-image-btn"
                                title="Xóa ảnh"
                            >
                                <i class="pi pi-times"></i>
                            </button>
                        </div>
                        <div v-if="selectedImageInfo" class="image-info">
                            <span class="info-text">{{ selectedImageInfo }}</span>
                        </div>
                    </div>
                </div>

                <!-- Submit button -->
                <div class="form-actions">
                    <Button 
                        type="submit" 
                        label="Tạo Poster" 
                        icon="pi pi-check"
                        :disabled="!isFormValid"
                    />
                </div>
            </form>
        </div>

        <!-- Image Selector Dialog -->
        <ImageSelector 
            v-model:visible="showImageSelector" 
            :activeTab="activeTab"
            @select="handleImageSelect" 
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

import ImageSelector from './template/ImageSelector.vue'
import { toastSuccess, toastError } from '@/common/helpers/custom-toast-service'

// Form data
const formData = ref({
    title: '',
})

// Image selector state
const showImageSelector = ref(false)
const activeTab = ref('upload')

// Selected image state
const selectedImage = ref(null)
const selectedImagePreview = ref(null)
const selectedImageInfo = ref('')

// Computed
const isFormValid = computed(() => {
    return formData.value.title.trim() !== '' && selectedImage.value !== null
})

// Methods
function openImageSelector(tab) {
    activeTab.value = tab
    showImageSelector.value = true
}

function handleImageSelect(imageData) {
    selectedImage.value = imageData
    console.log("cath seu kien emit",imageData)
    
    if (imageData.type === 'upload') {
        // For uploaded file
        selectedImagePreview.value = imageData.preview
        selectedImageInfo.value = `File: ${imageData.file.name} (${formatFileSize(imageData.file.size)})`
    } else if (imageData.type === 'album') {
        // For album photo
        selectedImagePreview.value = imageData.url
        selectedImageInfo.value = `Album: ${imageData.photo.filename}`
    }
    
    toastSuccess({ message: 'Đã chọn ảnh thành công' })
}

function clearImage() {
    selectedImage.value = null
    selectedImagePreview.value = null
    selectedImageInfo.value = ''
}

function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function handleSubmit() {
    if (!isFormValid.value) {
        toastError({ message: 'Vui lòng điền đầy đủ thông tin' })
        return
    }
    
    // Here you would typically send the data to your API
    console.log('Form submitted:', {
        title: formData.value.title,
        image: selectedImage.value
    })
    
    toastSuccess({ message: 'Tạo poster thành công!' })
    
    // Reset form
    formData.value.title = ''
    clearImage()
}
</script>

<style scoped>
.demo-use-page {
    min-height: calc(100vh - 80px);
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.poster-form-container {
    width: 100%;
    max-width: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.form-title {
    margin: 0 0 1.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
}

.poster-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
}

.form-input:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.image-selector-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.image-preview-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.image-preview-wrapper {
    position: relative;
    display: inline-block;
    margin-top: 0.5rem;
}

.preview-image {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    object-fit: contain;
    display: block;
}

.remove-image-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #dc2626;
    color: white;
    border: 2px solid white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.remove-image-btn:hover {
    background: #b91c1c;
    transform: scale(1.1);
}

.image-info {
    margin-top: 0.5rem;
}

.info-text {
    font-size: 0.875rem;
    color: #6b7280;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
}

@media (max-width: 640px) {
    .demo-use-page {
        padding: 1rem;
    }
    
    .poster-form-container {
        padding: 1.5rem;
    }
    
    .image-selector-buttons {
        flex-direction: column;
    }
    
    .image-selector-buttons button {
        width: 100%;
    }
}
</style>

