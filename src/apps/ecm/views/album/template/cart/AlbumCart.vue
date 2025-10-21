<template>
    <!-- Album card -->
    <div class="album-card">
        <!-- Card title -->
        <div class="card-title">
            <div class="title-left">
                <div class="album-title">{{ album.name }}</div>
                <div class="album-meta">{{ album.countImage }} ảnh</div>
            </div>

            <div class="menu-wrap" @click.stop v-if="album.permissionStatus">
                <button class="icon-btn" @click.stop="toggleMenu" title="Tùy chọn album">
                    •••
                </button>

                <div v-if="openMenu" class="album-menu" @click.stop>
                    <ul>
                        <li @click="openEdit">Sửa</li>
                        <li @click="openShare">Chia sẻ</li>
                        <li class="danger" @click="">Xóa</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Card body -->
        <div class="card-body">
            <div class="cover-wrap">
                <img class="album-cover"
                    :src="'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'"
                    alt="cover" />

                <div v-if="album.isShared" class="badge shared">Đã chia sẻ</div>

                <div class="permission-text"
                    :style="{ color: album.permissionStatus === 'EDIT' ? 'green' : (album.permissionStatus === 'VIEW' ? 'goldenrod' : 'red') }"
                    v-if="album.permissionStatus">
                    {{ album.permissionStatus }}
                </div>

                <div class="album-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18"
                        height="18">
                        <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 
                        2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Folder Dialog -->
    <Dialog v-model:visible="showEditDialog" modal header="Đổi tên Folder" :style="{ width: '25rem' }">
        <div class="modal" role="dialog" aria-modal="true">
            <h3>Đổi tên Folder</h3>
            <InputText name="foldeName" type="text" v-model="nameFolder" placeholder="Nhập tên folder vào đây" />
            <div class="flex justify-end gap-2 mt-4">
                <button class="btn-secondary" @click="showEditDialog = false">Thoát</button>
                <button @click="handleEditFolder">Xác nhận</button>
            </div>
        </div>
    </Dialog>

    <!-- Share Dialog -->
    <Dialog v-model:visible="showShareDialog" modal header="Chia sẻ Album" :style="{ width: '25rem' }">
        <div class="modal" role="dialog" aria-modal="true">
            <div class="dialog-header">
                <div class="info">
                    <h3 class="album-name">{{ selectedAlbum?.name }}</h3>
                </div>
            </div>

            <div class="dialog-body">
                <h4>Chọn người dùng để chia sẻ</h4>
                <hr class="thin-sep" />
                <div style="margin: 10px;">
                    public:
                    <Checkbox v-model="role" binary />
                </div>

                <!-- {{ role }} -->
                <ul v-if="!role" class="folder-list">
                    <li v-for="(user, i) in users" :key="i" class="album-item">
                        <i class="pi pi-user"></i>
                        <div class="user-info">
                            <div class="user-name">{{ user.name }}</div>
                            <div class="user-email muted">{{ user.email }}</div>
                        </div>

                        <div class="action">
                            <select v-model="user.permission" style="border: none;" class="w-full">
                                <option selected :value="'NONE'">
                                    NONE
                                </option>
                                <option v-for="opt in permissionOptions" :key="opt.code" :value="opt.code">
                                    {{ opt.name }}
                                </option>
                            </select>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="dialog-footer flex justify-end gap-2">
                <Button type="button" label="Đóng" severity="secondary" @click="showShareDialog = false"></Button>
                <Button type="button" label="Chia chia sẻ" severity="secondary"
                    @click="handleConfirmPermission"></Button>
            </div>
        </div>
    </Dialog>

    <!-- Permission Dialog -->
    <!-- <Dialog v-model:visible="showPermissionDialog" modal header="Phân quyền người dùng" :style="{ width: '22rem' }">
        <div class="modal" role="dialog" aria-modal="true">
            <h3 class="mb-2">Phân quyền cho:</h3>
            <div class="font-semibold mb-4">{{ selectedUser?.name }} ({{ selectedUser?.email }})</div>

            <select v-model="selectedPermission" class="w-full">
                <option v-for="opt in permissionOptions" :key="opt.code" :value="opt.code">
                    {{ opt.name }}
                </option>
            </select>

            <div class="flex justify-end gap-2 mt-4">
                <button class="btn-secondary" @click="showPermissionDialog = false">Thoát</button>
                <button @click="handleConfirmPermission">Xác nhận</button>
            </div>
        </div>
    </Dialog> -->
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { getAllUser, postChangeNameFolder, postCreateAndUpadateShare } from '@/apps/ecm/views/album/api/Album.js'
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service'

const emit = defineEmits(['updateData'])

const props = defineProps({
    album: { type: Object, required: true },
    defaultImage: {
        type: String,
        default:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEaYTaC-q-QWUu2g7QgVvRKkJkqXjXtjBU2w&s'
    }
})

const showEditDialog = ref(false)
const showShareDialog = ref(false)
const showPermissionDialog = ref(false)

const users = ref([])
const selectedAlbum = ref(null)
const selectedUser = ref(null)
const selectedPermission = ref('VIEW')

const permissionOptions = ref([

    { name: 'VIEW', code: 'VIEW' },
    { name: 'EDIT', code: 'EDIT' },

])
const role = ref(false) //LIMITED, PUBLIC 
const openMenu = ref(false)
const nameFolder = ref('')

// Toggle menu
const toggleMenu = () => {
    openMenu.value = !openMenu.value
    if (openMenu.value) window.addEventListener('click', onWindowClick)
    else window.removeEventListener('click', onWindowClick)
}
const onWindowClick = () => {
    openMenu.value = false
    window.removeEventListener('click', onWindowClick)
}

const openEdit = () => {
    showEditDialog.value = true
    nameFolder.value = props.album.name
}

const handleEditFolder = async () => {
    try {
        await postChangeNameFolder(props.album.id, nameFolder.value)
        toastSuccess('Sửa thành công')
        emit('updateData')
        showEditDialog.value = false
    } catch (err) {
        toastError('Lỗi sửa tên folder:', err)
    }
}

// Mở dialog chia sẻ
const openShare = async () => {
    const response = await getAllUser()
    users.value = response.data
    selectedAlbum.value = props.album
    showShareDialog.value = true
}

// Mở dialog phân quyền cho 1 user
const openPermission = (user) => {
    selectedUser.value = user
    selectedPermission.value = 'VIEW'
    showPermissionDialog.value = true
}

// Xác nhận quyền cho user
const handleConfirmPermission = async () => {
    try {

        const userspermission = users.value.filter(u => (u.permission && u.permission !== 'NONE')).map(e => ({
            ...e,
            userId: e.id,
            fullName: e.name
        }));
        console.log('confirm userspermission ', userspermission)

        await postCreateAndUpadateShare(props.album.id, (role.value ? 'PUBLIC' : 'LIMITED'), 'EDIT', (role.value ? [] : userspermission))

        toastSuccess(`Đã gán quyền thành công`)
        showPermissionDialog.value = false
        showShareDialog.value = false
        emit('updateData')
    } catch (err) {
        toastError('Lỗi khi gán quyền:', err)
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 10px;
}

.title-left {
    display: flex;
    flex-direction: column;
}

.album-title {
    font-weight: 600;
    font-size: 0.98rem;
    color: #111827;
}

.album-meta {
    font-size: 0.78rem;
    color: #6b7280;
    margin-top: 2px;
}

.menu-wrap {
    position: relative;
}

.album-menu {
    position: absolute;
    right: 0;
    top: 34px;
    background: white;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
    border-radius: 8px;
    min-width: 160px;
    z-index: 30;
}

.album-menu ul {
    list-style: none;
    margin: 0;
    padding: 6px 0;
}

.album-menu li {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.95rem;
    color: #111827;
}

.album-menu li:hover {
    background: rgba(15, 23, 42, 0.03);
}

.album-menu li.danger {
    color: #dc2626;
}

.icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icon-btn:hover {
    background: rgba(0, 0, 0, 0.04);
}

.cover-wrap {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 10px;
}

.album-cover {
    width: 100%;
    aspect-ratio: 3/2;
    object-fit: cover;
    display: block;
    transition: transform 0.2s ease;
}

.cover-wrap:hover .album-cover {
    transform: scale(1.03);
}

.badge.shared {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    display: inline-flex;
    gap: 6px;
    align-items: center;
}

.album-icon {
    position: absolute;
    background: rgba(34, 197, 94, 0.12);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    bottom: 3%;
    left: 1%;
    color: #e3d73b;
}

.permission-text {
    position: absolute;
    background: rgba(34, 197, 94, 0.12);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    top: 3%;
    right: 1%;
}

.album-card {
    box-shadow: 16px 10px 20px -16px #00000045;
}

ul {
    padding: 0;
}

.album-item {
    display: flex;
    justify-content: space-between;
    padding: 14px;
    border: solid 1px #ccc;
    border-radius: 6px;
    margin-bottom: 8px;
    align-items: center;
}
</style>
