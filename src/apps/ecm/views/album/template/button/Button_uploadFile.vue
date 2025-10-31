<template>
    <button class="create-album-btn" @click="showDialogUploadImage = true">+ Upload Ảnh</button>

    <Dialog v-model:visible="showDialogUploadImage" modal header="Đẩy ảnh lên đây" :style="{ width: '26rem' }">
        <div class="container">
            <!-- upload : button cố định + danh sách tên file cuộn ngang -->
            <div class="row">
                <div class="btn-wrap">
                    <FileUpload ref="fileUpload" mode="basic" name="fileUpload" accept="image/*" :maxFileSize="10000000"
                        :customUpload="true" :multiple="true" @select="onSelect" />
                </div>
            </div>

            <!-- preview -->
            <div v-if="previewUrl.length" class="preview-section">
                <label class="label">Xem trước</label>
                <div class="preview-scroll">
                    <div v-for="(src, idx) in previewUrl" :key="idx" class="thumb">
                        <img :src="src" :alt="`preview-${idx}`" />
                    </div>
                </div>
            </div>

            <!-- actions -->
            <div class="actions">
                <button class="btn" @click="showDialogUploadImage = false">Thoát</button>
                <button class="btn primary" @click="handleUpload">Tạo</button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { toastSuccess, toastError } from '@/common/helpers/custom-toast-service'
import { createPhotos } from '../../api/Album'
import router from '@/common/router'

const emit = defineEmits(['updateData'])

const showDialogUploadImage = ref(false)
const previewUrl = ref([])
const rawFiles = ref([])

const props = defineProps({
    album: { type: Object, required: true }
})

// convert file -> base64 (chỉ dùng để preview)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
    })
}

// event khi user chọn file
const onSelect = async (e) => {
    try {
        const files = e.files || []
        rawFiles.value = files // giữ lại file thật để gửi FormData

        const base64List = await Promise.all(files.map(f => fileToBase64(f)))
        previewUrl.value = base64List
    } catch (err) {
        console.error('Lỗi khi đọc file:', err)
    }
}

// hàm upload
const handleUpload = async () => {
    if (!rawFiles.value.length) {
        toastError({ message: 'Chưa có ảnh để upload' })
        return
    }



    try {
        console.log("props album butonipload", props.album)
        await createPhotos(props.album.id, rawFiles.value).then(() => emit('updateData'))
        toastSuccess({ message: 'Upload thành công!' })
        showDialogUploadImage.value = false
        previewUrl.value = []
        rawFiles.value = []

    } catch (err) {
        console.error('Lỗi upload:', err)
        toastError({ message: 'Upload thất bại!' + err })
    }
}
</script>

<style scoped>
.create-album-btn {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: transparent;
    cursor: pointer;
}

/* container inside dialog */
.container {
    padding: 12px;
    font-family: inherit;
}

/* upload row */
.row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
}

/* keep upload button small and fixed */
.btn-wrap {
    flex: 0 0 auto;
}

/* preview */
.preview-section {
    margin-top: 6px;
}

.label {
    display: block;
    font-size: 13px;
    margin-bottom: 6px;
}

/* horizontal scroll thumbnails */
.preview-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 6px 0;
    align-items: center;
    max-height: 110px;
}

/* each thumbnail size fixed */
.thumb {
    flex: 0 0 auto;
    width: 84px;
    height: 64px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

/* actions row simple */
.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
}

.btn {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: white;
    cursor: pointer;
    min-width: 72px;
}

.btn.primary {
    background: #1f6feb;
    color: white;
    border: none;
}
</style>
