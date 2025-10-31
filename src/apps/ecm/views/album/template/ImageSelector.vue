<template>
    <Dialog 
        v-model:visible="internalVisible" 
        modal 
        header="Chọn ảnh" 
        :style="{ width: '50rem', maxWidth: '90vw' }"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        @hide="handleClose"
    >
        <TabView v-model:activeIndex="activeTabIndex" class="image-selector-tabs">
            <!-- Tab Upload -->
            <TabPanel header="Upload Ảnh">
                <div class="upload-tab-content">
                    <div class="upload-section">
                        <FileUpload 
                            ref="fileUpload" 
                            mode="basic" 
                            name="fileUpload" 
                            accept="image/*" 
                            :maxFileSize="10000000"
                            :customUpload="true" 
                            :multiple="false"
                            @select="onFileSelect"
                            chooseLabel="Chọn ảnh"
                        />
                        <p class="upload-hint">Chỉ chấp nhận file ảnh, tối đa 10MB</p>
                    </div>

                    <!-- Preview section -->
                    <div v-if="selectedUploadFile" class="preview-section">
                        <label class="preview-label">Xem trước ảnh đã chọn:</label>
                        <div class="preview-image-wrapper">
                            <img :src="uploadPreviewUrl" alt="Preview" class="preview-image" />
                            <div class="preview-info">
                                <span class="file-name">{{ selectedUploadFile.name }}</span>
                                <span class="file-size">{{ formatFileSize(selectedUploadFile.size) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <!-- Tab Từ Album -->
            <TabPanel header="Từ Album">
                <div class="album-tab-content">
                    <!-- Breadcrumb và navigation -->
                    <div class="album-navigation">
                        <button 
                            v-if="canGoBack" 
                            @click="goBack" 
                            class="back-btn"
                            :disabled="!canGoBack"
                        >
                            <i class="pi pi-chevron-left"></i>
                            <span>Quay lại</span>
                        </button>
                        <div class="breadcrumb" v-if="breadcrumbSegments.length > 0">
                            <span 
                                v-for="(segment, index) in breadcrumbSegments" 
                                :key="index" 
                                class="breadcrumb-item"
                            >
                                <span class="breadcrumb-segment">{{ segment }}</span>
                                <i 
                                    v-if="index < breadcrumbSegments.length - 1"
                                    class="pi pi-chevron-right breadcrumb-separator"
                                ></i>
                            </span>
                        </div>
                        <div class="current-folder-name">
                            <i class="pi pi-folder"></i>
                            <span>{{ currentFolder?.name || 'Album' }}</span>
                        </div>
                    </div>

                    <!-- Loading state -->
                    <div v-if="loading" class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
                        <p>Đang tải...</p>
                    </div>

                    <!-- Grid albums and photos -->
                    <div v-else class="album-grid">
                        <!-- Folders/Albums -->
                        <div 
                            v-for="album in albums" 
                            :key="album.id" 
                            class="album-item"
                            @click="openFolder(album.id)"
                        >
                            <div class="album-item-icon">
                                <i class="pi pi-folder" style="font-size: 2.5rem;"></i>
                            </div>
                            <div class="album-item-name">{{ album.name }}</div>
                            <div class="album-item-count" v-if="album.countImage">
                                <i class="pi pi-image"></i>
                                <span>{{ album.countImage }}</span>
                            </div>
                        </div>

                        <!-- Photos -->
                        <div 
                            v-for="photo in photos" 
                            :key="photo.id" 
                            class="photo-item"
                            :class="{ 'selected': selectedAlbumPhoto?.id === photo.id }"
                            @click="selectAlbumPhoto(photo)"
                        >
                            <img 
                                :src="urlImage + photo?.treePath" 
                                :alt="photo?.filename"
                                class="photo-thumbnail"
                            />
                            <div class="photo-overlay" v-if="selectedAlbumPhoto?.id === photo.id">
                                <i class="pi pi-check-circle selected-icon"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <div v-if="!loading && albums.length === 0 && photos.length === 0" class="empty-state">
                        <i class="pi pi-image" style="font-size: 3rem; color: #ccc;"></i>
                        <p>Không có album hoặc ảnh nào</p>
                    </div>
                </div>
            </TabPanel>
        </TabView>

        <template #footer>
            <Button label="Hủy" severity="secondary" @click="handleClose" />
            <Button 
                label="Chọn" 
                @click="handleConfirmSelect" 
                :disabled="!hasSelection"
            />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'

import {
    getFolderRoot,
    getFoldersByFolder,
    getPhotosByFolder,
    getFolderDetail,
    urlImage
} from '../api/Album.js'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    activeTab: {
        type: String,
        default: 'upload', // 'upload' or 'album'
        validator: (value) => ['upload', 'album'].includes(value)
    }
})

const emit = defineEmits(['update:visible', 'select'])

// Internal visible state
const internalVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

// Tab state
const activeTabIndex = ref(0)

// Watch activeTab prop to switch tabs
watch(() => props.activeTab, (newTab) => {
    activeTabIndex.value = newTab === 'album' ? 1 : 0
}, { immediate: true })

// Watch visible to reset when opened
watch(() => props.visible, (newVisible) => {
    if (newVisible) {
        // Set initial tab based on activeTab prop
        activeTabIndex.value = props.activeTab === 'album' ? 1 : 0
        // Reset selections
        selectedUploadFile.value = null
        uploadPreviewUrl.value = null
        selectedAlbumPhoto.value = null
        folderHistory.value = []
        currentFolderId.value = null
        // the tab when opening album tab
        if (props.activeTab === 'album') {
            loadRootFolder()
        }
    }
}, { immediate: true })

// Watch tab changes to load album data when switching to album tab
watch(activeTabIndex, (newIndex) => {
    if (newIndex === 1 && props.visible) {
        // User switched to album tab, load data if not already loaded
        if (albums.value.length === 0 && photos.value.length === 0 && !currentFolder.value) {
            loadRootFolder()
        }
    }
})

// ========== Upload Tab State ==========
const fileUpload = ref(null)
const selectedUploadFile = ref(null)
const uploadPreviewUrl = ref(null)

// ========== Album Tab State ==========
const loading = ref(false)
const rootFolder = ref(null)
const currentFolder = ref(null)
const albums = ref([])
const photos = ref([])
const selectedAlbumPhoto = ref(null)
const folderHistory = ref([]) // Stack to track navigation
const currentFolderId = ref(null)

// Computed properties
const canGoBack = computed(() => {
    return folderHistory.value.length > 0
})

const breadcrumbSegments = computed(() => {
    if (!currentFolder.value?.path) return []
    const path = currentFolder.value.path
    // Normalize path: remove first 4 segments if pattern matches "/.../Album/User/{id}/..."
    const parts = path.split('/').filter(p => p.length > 0)
    if (parts.length <= 4) return []
    return parts.slice(4)
})

const hasSelection = computed(() => {
    return selectedUploadFile.value !== null || selectedAlbumPhoto.value !== null
})

// ========== Upload Tab Methods ==========
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
    })
}

async function onFileSelect(event) {
    const files = event.files || []
    if (files.length === 0) return

    // Only take first file since we allow single selection
    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh')
        return
    }

    selectedUploadFile.value = file
    
    try {
        uploadPreviewUrl.value = await fileToBase64(file)
    } catch (err) {
        console.error('Error reading file:', err)
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// ========== Album Tab Methods ==========
function normalizePathForTree(path = '') {
    const parts = path.split('/').filter(p => p.length > 0)
    if (parts.length <= 4) return path
    return '/' + parts.slice(4).join('/')
}

async function loadRootFolder() {
    loading.value = true
    try {
        const res = await getFolderRoot()
        rootFolder.value = res.data
        currentFolder.value = res.data || {}
        currentFolderId.value = res.data?.id
        
        await loadChildren(res.data?.id)
    } catch (err) {
        console.error('Error loading root folder:', err)
    } finally {
        loading.value = false
    }
}

async function loadFolder(id) {
    loading.value = true
    try {
        const res = await getFolderDetail(id)
        currentFolder.value = res.data || {}
        currentFolderId.value = id
        
        await loadChildren(id)
    } catch (err) {
        console.error('Error loading folder:', err)
    } finally {
        loading.value = false
    }
}

async function loadChildren(folderId) {
    if (!folderId) return
    
    try {
        const [foldersRes, photosRes] = await Promise.all([
            getFoldersByFolder('ALL', folderId),
            getPhotosByFolder('ALL', folderId)
        ])
        
        albums.value = foldersRes.data || []
        photos.value = photosRes.data || []
    } catch (err) {
        console.error('Error loading children:', err)
    }
}

function openFolder(folderId) {
    if (currentFolderId.value) {
        folderHistory.value.push(currentFolderId.value)
    }
    loadFolder(folderId)
}

function goBack() {
    if (folderHistory.value.length === 0) {
        // Go back to root
        loadRootFolder()
        return
    }
    
    const previousFolderId = folderHistory.value.pop()
    if (previousFolderId) {
        loadFolder(previousFolderId)
    } else {
        loadRootFolder()
    }
}

function selectAlbumPhoto(photo) {
    selectedAlbumPhoto.value = photo
}

// ========== Dialog Methods ==========
function handleClose() {
    // Reset state
    selectedUploadFile.value = null
    uploadPreviewUrl.value = null
    selectedAlbumPhoto.value = null
    folderHistory.value = []
    currentFolderId.value = null
    
    // Clear file upload
    if (fileUpload.value) {
        fileUpload.value.clear()
    }
    
    emit('update:visible', false)
}

function handleConfirmSelect() {
    if (!hasSelection.value) return
    
    let selectedImage = null
    
    if (selectedUploadFile.value) {
        // Emit File object for upload
        selectedImage = {
            type: 'upload',
            file: selectedUploadFile.value,
            preview: uploadPreviewUrl.value
        }
    } else if (selectedAlbumPhoto.value) {
        // Emit photo object from album
        selectedImage = {
            type: 'album',
            photo: selectedAlbumPhoto.value,
            url: urlImage + selectedAlbumPhoto.value.treePath
        }
    }
    
    if (selectedImage) {
        emit('select', selectedImage)
        handleClose()
    }
}
</script>

<style scoped>
.image-selector-tabs {
    min-height: 400px;
}

/* Upload Tab Styles */
.upload-tab-content {
    padding: 1rem 0;
}

.upload-section {
    margin-bottom: 1.5rem;
}

.upload-hint {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.preview-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.preview-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #374151;
}

.preview-image-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
}

.preview-image {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    object-fit: contain;
}

.preview-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
}

.file-name {
    font-weight: 600;
    color: #111827;
}

.file-size {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Album Tab Styles */
.album-tab-content {
    min-height: 400px;
    padding: 0.5rem 0;
}

.album-navigation {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
    transition: all 0.2s ease;
}

.back-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
}

.back-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.breadcrumb-segment {
    color: #6b7280;
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: #f3f4f6;
}

.breadcrumb-separator {
    font-size: 0.75rem;
    color: #9ca3af;
}

.current-folder-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: #6b7280;
}

.album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    max-height: 450px;
    overflow-y: auto;
    padding: 0.5rem 0;
}

.album-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.album-item:hover {
    border-color: #6c5ce7;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.album-item-icon {
    color: #fbbf24;
    display: flex;
    align-items: center;
    justify-content: center;
}

.album-item-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.album-item-count {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
}

.photo-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.photo-item:hover {
    border-color: #6c5ce7;
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2);
}

.photo-item.selected {
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
}

.photo-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-overlay {
    position: absolute;
    inset: 0;
    background: rgba(108, 92, 231, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
}

.selected-icon {
    font-size: 2rem;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Scrollbar styling */
.album-grid::-webkit-scrollbar {
    width: 8px;
}

.album-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.album-grid::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.album-grid::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

@media (max-width: 640px) {
    .album-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
    }
}
</style>

