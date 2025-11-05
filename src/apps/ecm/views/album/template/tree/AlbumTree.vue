<template>
    <div class='flex flex-column flex-shrink-0 h-full w-full'>
        <Tree class='border-noround-bottom border-noround-right album-tree flex-grow-1 overflow-y-auto'
            :expanded-keys='expands' :value='tree'>
            <template #default='{ node }'>
                <router-link class='align-items-center flex gap-2 text-color'
                    :class='{ "font-bold text-primary current-folder": isCurrentFolder(node) }' :to='node.to'>
                    <AppIcon class='text-orange-400' fill :name='getFolderIcon(node)' size='1.5' />
                    {{ node.label }}
                </router-link>
            </template>
        </Tree>
    </div>
</template>

<script setup lang='ts'>
import type { TreeExpandedKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import EventBus from '@/common/helpers/event-bus';
import { getTreeAlbumFolder } from '../../api/Album.js';

const route = useRoute();

// Local state management
const tree = ref<TreeNode[]>();
const expands = ref<TreeExpandedKeys>();

// Type for Album Folder Tree (similar to FolderTree)
type AlbumFolderTree = {
    id: string;
    name: string;
    parentId: string;
    treePath?: string;
    children?: AlbumFolderTree[];
};

/**
 * Transform Album Folder Tree data to PrimeVue TreeNode format
 */
function mapToTreeNode(folder: AlbumFolderTree): TreeNode {
    const node: TreeNode = {
        key: folder.id,
        label: folder.name,
        to: {
            name: 'EcmAlbumDetail',
            params: { idFolder: folder.id }
        },
        children: undefined
    };

    // Recursively map children if they exist
    if (folder.children && folder.children.length > 0) {
        node.children = folder.children.map(child => mapToTreeNode(child));
    }

    return node;
}

/**
 * Set default expanded keys (expand first node by default)
 */
function defaultExpanded(): TreeExpandedKeys {
    return tree.value?.length ? { [tree.value[0].key ?? '']: true } : {};
}

/**
 * Update tree folder from API
 */
async function updateTreeFolder() {
    try {
        const response = await getTreeAlbumFolder();
        // Handle both direct data and response.data
        const folderData = (response.data || response) as AlbumFolderTree | AlbumFolderTree[];

        if (folderData) {
            // Handle both single object and array of folders
            if (Array.isArray(folderData)) {
                // If it's an array, map each folder to TreeNode
                tree.value = folderData.map(folder => mapToTreeNode(folder));
            } else {
                // Single folder object (root folder)
                const menu = mapToTreeNode(folderData);
                // Root node also uses EcmAlbumDetail with root folder id
                tree.value = [menu];
            }
        }
    } catch (error) {
        console.error('Error fetching album tree folder:', error);
    }
}

/**
 * Get folder icon based on current route
 */
function getFolderIcon(node: TreeNode) {
    const folderId = node.to.params?.idFolder as string | undefined;

    if (!folderId) {
        return 'folder';
    }

    // Check if current route matches this folder id
    return route.params.idFolder === folderId ? 'folder_open' : 'folder';
}

/**
 * Check if folder is currently selected
 */
function isCurrentFolder(node: TreeNode) {
    const folderId = node.to.params?.idFolder as string | undefined;

    if (!folderId) {
        return false;
    }

    // Check if current route matches this folder id
    return route.params.idFolder === folderId;
}

// Watch tree changes to update expanded keys
watch(tree, () => {
    expands.value = defaultExpanded();
    console.log('theo dõi biến tree', tree)
    console.log('defaultExpanded', expands.value)
});

// Lifecycle hooks
onMounted(() => {
    nextTick(() => {
        if (!tree.value) {
            updateTreeFolder();
        }
    });
    // Listen for tree update events
    EventBus.on('updateAlbumTree', updateTreeFolder);
});

onUnmounted(() => {
    EventBus.off('updateAlbumTree', updateTreeFolder);
});
</script>

<script lang='ts'>
export default { name: 'AlbumTree' };
</script>

<style scoped lang='scss'>
.album-tree {
    background-color: var(--surface-c);
}

:deep(.p-tree) {
    padding: 0;
    border: 0;

    .p-tree-container {
        overflow-x: hidden;

        .p-treenode-content {
            width: 100%;

            .p-treenode-label {
                width: 100%;

                .current-folder {
                    background-color: var(--surface-border);
                    margin: 0 -0.5rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.5rem;
                }
            }
        }
    }
}
</style>
