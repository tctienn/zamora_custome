<template>
  <Dialog v-model:visible="localVisible" modal header="Chia sẻ Album" :style="{ width: '37rem' }">
    <template #header>
      <div class="font-bold text-lg">{{ itemName }}</div>
    </template>
    <div class="share-container">
      <!-- User Search -->
      <AutoComplete :inputStyle="{ width: '100%' }" v-model="userToAdd" class="w-full" option-label="label"
        placeholder="Tìm kiếm người dùng để chia sẻ..." :suggestions="suggestUsers" :min-length="3"
        @complete="searchShareUsers" @item-select="addSharedUser" />

      <!-- Selected Users -->
      <div v-if="selectedUsers.length > 0" class="selected-users mt-3">
        <div class="font-bold py-2">Người dùng được chia sẻ</div>
        <div class="border-round border-1 surface-border p-2" style="max-height: 250px; overflow-y: auto;">
          <div v-for="(user, index) in selectedUsers" :key="index" class="flex align-items-center border-bottom-1 py-2"
            :class="{ 'border-bottom-none': index === selectedUsers.length - 1 }">
            <div class="flex align-items-center gap-2 flex-1">
              <!-- <i class="pi pi-user"></i> -->
              <AppAvatar :avatar='generateAvatarUrl(user.avatar)' :label='user.fullName' shape='circle' size='2.5' />
              <div class="flex flex-column">
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-color-secondary">{{ user.email }}</div>
              </div>
            </div>

            <div class="flex align-items-center gap-2">
              <Dropdown v-model="user.permission" option-label="name" option-value="code" :options="permissionOptions"
                class="p-inputtext-sm w-full" style="min-width: 120px;" />
              <i class="pi pi-times cursor-pointer text-red-500 hover:text-red-700" @click="removeUser(index)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Public Access Toggle -->
      <div class="mt-4 pt-3 border-top-1">
        <div class="font-bold py-2 mb-2">Quyền truy cập chung</div>
        <div class="flex align-items-center gap-3">
          <i class="pi" :class="shareType === 'PUBLIC' ? 'pi-globe' : 'pi-lock'" style="font-size: 1.5rem;" />
          <Dropdown v-model="shareType" option-label="label" option-value="value" :options="shareTypeOptions"
            class="flex-1" />
          <Dropdown v-if="shareType === 'PUBLIC'" v-model="defaultPermission" option-label="name" option-value="code"
            :options="permissionOptions" class="flex-shrink-0" style="min-width: 120px;" />
        </div>
      </div>
    </div>

    <template #footer>
      <Button v-if="props.selectedAlbum.permissionUsers?.id" label="Xóa chia sẻ" severity="danger"
        @click="handleDeleteCurrentFolderShare" />

      <Button label="Đóng" severity="secondary" @click="closeDialog" />
      <Button label="Chia sẻ" @click="handleShare" :disabled="!canShare" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { getSearchShareUsers } from '@/apps/ecm/api/graphql/share'
import { DeletePermission, postCreateAndUpadateShare, postCreateAndUpadateSharePhoto } from '@/apps/ecm/views/album/api/Album.js'
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service'
import { generateAvatarUrl } from '@/common/helpers/file-utils'

const props = defineProps({
  selectedAlbum: {
    type: Object,
    required: false
  },
  itemId: {
    type: String,
    required: false
  },
  itemName: {
    type: String,
    required: false
  },
  itemType: {
    type: String,
    default: 'album',
    required: false,
    validator: (value) => ['album', 'file'].includes(value)
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'update'])

const localVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const userToAdd = ref(null)
const suggestUsers = ref([])
const selectedUsers = ref([])
const shareType = ref('LIMITED')
const defaultPermission = ref('VIEW')

const permissionOptions = [
  { name: 'Xem', code: 'VIEW' },
  { name: 'Chỉnh sửa', code: 'EDIT' },
  // { name: 'Không', code: 'NONE' }
]

const shareTypeOptions = [
  { label: 'Giới hạn', value: 'LIMITED' },
  { label: 'Công khai', value: 'PUBLIC' }
]

const canShare = computed(() => {


  return selectedUsers.value.length > 0 || shareType.value === 'PUBLIC'
})

function searchShareUsers(event) {
  if (event.query.length > 2) {
    getSearchShareUsers(event.query)
      .onResult((result) => {
        if (result.data?.searchShareUsers) {
          suggestUsers.value = result.data.searchShareUsers.map((user) => ({
            ...user,
            label: `${user.fullName} - ${user.email}`
          }))
        }
      })
  } else {
    suggestUsers.value = []
  }
}

function addSharedUser(event) {
  const user = event.value
  if (!selectedUsers.value.some((u) => u.userId === user.userId)) {
    selectedUsers.value.push({
      userId: user.userId,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      permission: 'VIEW'
    })
  }
  userToAdd.value = null
}

function removeUser(index) {
  selectedUsers.value.splice(index, 1)
}


async function handleDeleteCurrentFolderShare() {
  try {
    const permissionId = props.selectedAlbum.permissionUsers?.id;
    if (!permissionId) {
      toastError({ message: 'Không tìm thấy permission ID' });
      return;
    }
    await DeletePermission(permissionId);
    toastSuccess({ message: 'Xóa chia sẻ thành công' });
    // showUserShareButton.value = false;
    await emit('update')
  } catch (err) {
    console.error('handleDeleteCurrentFolderShare error', err);
    toastError({ message: 'Xóa chia sẻ thất bại' });
  }
}

/**
 * Load existing permission data from selectedAlbum
 */
function loadExistingPermissions() {
  if (!props.selectedAlbum?.permissionUsers) {
    // Khởi tạo mới - reset về mặc định
    selectedUsers.value = []
    shareType.value = 'LIMITED'
    defaultPermission.value = 'VIEW'
    return
  }

  const permissionUsers = props.selectedAlbum.permissionUsers

  // Load shared users nếu có
  if (permissionUsers.sharedUsers && Array.isArray(permissionUsers.sharedUsers)) {
    selectedUsers.value = permissionUsers.sharedUsers.map(user => ({
      userId: user.userId,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      permission: user.permission || 'VIEW'
    }))
  } else {
    selectedUsers.value = []
  }

  // Load shareType (visibility)
  if (permissionUsers.visibility) {
    shareType.value = permissionUsers.visibility
  } else {
    shareType.value = 'LIMITED'
  }

  // Load defaultPermission
  if (permissionUsers.permission) {
    defaultPermission.value = permissionUsers.permission
  } else {
    defaultPermission.value = 'VIEW'
  }
}

// Watch khi dialog mở hoặc selectedAlbum thay đổi để load dữ liệu
watch([() => localVisible.value, () => props.selectedAlbum], ([isVisible, album]) => {
  if (isVisible && album) {
    loadExistingPermissions()
  }
})

function handleShare() {
  const usersPermission = selectedUsers.value
    .filter((u) => u.permission && u.permission !== 'NONE')
    .map((u) => ({
      userId: u.userId,
      fullName: u.fullName,
      permission: u.permission
    }))
  // console.log("type share: ",props.itemType)
  if (props.itemType == "album") {
    postCreateAndUpadateShare(
      props.itemId,
      shareType.value,
      defaultPermission.value,
      shareType.value === 'PUBLIC' ? [] : usersPermission
    )
      .then(() => {
        toastSuccess('Chia sẻ thành công')
        emit('update')
        closeDialog()
      })
      .catch((error) => {
        toastError('Lỗi khi chia sẻ: ' + error.message)
      })
  } else {
    postCreateAndUpadateSharePhoto(
      props.itemId,
      shareType.value,
      defaultPermission.value,
      shareType.value === 'PUBLIC' ? [] : usersPermission
    )
      .then(() => {
        toastSuccess('Chia sẻ thành công')
        emit('update')
        closeDialog()
      })
      .catch((error) => {
        toastError('Lỗi khi chia sẻ: ' + error.message)
      })

  }



}

function closeDialog() {
  localVisible.value = false
  // Reset state
  selectedUsers.value = []
  userToAdd.value = null
  shareType.value = 'LIMITED'
  defaultPermission.value = 'VIEW'
  suggestUsers.value = []
}

</script>

<style scoped>
.share-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-users {
  margin-top: 1rem;
}

.border-bottom-none {
  border-bottom: none !important;
}
</style>
