<template>
  <div class='flex justify-content-between'>
    <div class='flex gap-1'>
      <template
        v-for='action in filterActions'
        :key='action.code'>
        <Button
          v-if='(userDeptRole.roleId===RoleType.TRO_LY && mapSupportAction[action.code])||userDeptRole.roleId!==RoleType.TRO_LY'
          class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
          v-bind='action'>
          <template #icon>
            <i
              v-if="action.icon && action.icon.includes('pi pi-')"
              class='pr-1'
              :class='action.icon'></i>
            <AppIcon
              v-else-if='action.icon'
              class='align-items-center flex pr-1'
              :class='`btn-icon-${action.icon}`'
              :name='action.icon'
              size='20px'/>
          </template>
        </Button>
      </template>
      <SplitButton
        class='border-round-sm focus:shadow-none font-medium split-btn'
        :label='t("common.create")'
        :model='docOnlStyle'
        severity='primary'>
        <template #icon>
          <AppIcon
            class='align-items-center flex justify-content-center mr-2 mt-1'
            name='edit_square'
            size='16px'/>
        </template>
        <template #item='slotProps'>
          <div class='align-items-center flex gap-3 p-2'>
            <i
              v-if="slotProps.item.icon && slotProps.item.icon.includes('pi pi-')"
              class='text-base'
              :class='slotProps.item.icon'
              :style="{color: slotProps.item.color || '#6c757d'}"></i>
            <AppIcon
              v-else-if='slotProps.item.icon'
              class='align-items-center flex'
              :name='slotProps.item.icon'
              size='16px'
              :style="{color: slotProps.item.color || '#6c757d'}"/>
            <span class='font-medium'>{{ slotProps.item.label }}</span>
          </div>
        </template>
      </SplitButton>
    </div>
    <OutNextButtonsOutSide
      :doc='doc'
      :process='doc?.process'/>

    <!--    <OutNextButtons-->
    <!--      :current-process-id='doc?.process?.id'-->
    <!--      :doc-id='doc?.id'-->
    <!--      :flow-id='doc?.flowId'-->
    <!--      size='small'/>-->

    <PromulgateRevokeDialog
      v-if='visiblePromulgateRevoke'
      :doc-id='doc?.id'
      :visible='visiblePromulgateRevoke'
      @hide-dialog='revokeDoc'/>
  </div>

  <ReviewReceivesDialog
    v-if='visibleDialogReview'
    :doc-id='props.doc?.id'
    :visible='visibleDialogReview'
    @hide-dialog='visibleDialogReview = false'/>

  <SidebarDocumentOut
    v-if='visibleFormDocIn'
    :visible='visibleFormDocIn'
    @hide-sidebar='hideSidebar'/>

  <SidebarPromulgate
    v-if='visiblePromulgate'
    :doc-id='docId'
    :visible='visiblePromulgate'
    @hide-sidebar='hideSidebar'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { ButtonProps } from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { cancelPromulgateDoc } from '@/apps/document/api/graphql/outgoing-doc';
import { type DocOut } from '@/apps/document/model/doc/doc-out';
import { isClerk, RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import PromulgateRevokeDialog from '@/apps/document/views/doc/doc-out/action/PromulgateRevokeDialog.vue';
import OutNextButtonsOutSide
  from '@/apps/document/views/doc/doc-out/component/next-buttons-outside/OutNextButtonsOutSide.vue';
import ReviewReceivesDialog from '@/apps/document/views/doc/doc-out/detail/ReviewReceivesDialog.vue';
import SidebarDocumentOut from '@/apps/document/views/doc/doc-out/detail/SidebarDocumentOut.vue';
import SidebarPromulgate from '@/apps/document/views/doc/doc-out/detail/SidebarPromulgate.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  doc: {
    type: Object as PropType<DocOut | undefined>,
    default: undefined
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => []
  },
  nodeId: {
    type: String,
    default: ''
  }
});
const visibleDialogReview = ref(false);
const confirm = useConfirm();
const visibleFormDocIn = ref(false);
const visiblePromulgate = ref(false);
const docId = ref<string>();
const refetchDocOuts = inject('reloadDoc', () => void 0);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const visiblePromulgateRevoke = ref(false);
const router = useRouter();

const { t } = useI18n();
const allActions: (ButtonProps & { code: DocumentAction, requiredDoc?: boolean; })[] = [
  {
    code: DocumentAction.PUT_INTO_BOOK,
    requiredDoc: true,
    label: t('document.action.getNumbForBook'),
    severity: 'primary',
    icon: 'pi pi-file-edit',
    onClick: () => {
      visiblePromulgate.value = true;
    }
  },
  {
    code: DocumentAction.PROMULGATE,
    label: t('document.action.promulgate'),
    requiredDoc: true,
    severity: 'primary',
    icon: 'export_notes',
    onClick: () => promulgateDoc()
  },
  {
    code: DocumentAction.CREATE_DRAFT,
    label: t('document.action.createDraft'),
    severity: 'primary',
    icon: 'pi pi-plus-circle',
    onClick: () => {
      // router.push({name: 'DocumentDocOutFormDocument'})
      visibleFormDocIn.value = true;
    }
  },
  {
    code: DocumentAction.ENTER_BOOK,
    label: t('document.action.enterSignedText'),
    severity: 'primary',
    icon: 'post_add',
    onClick: () => visiblePromulgate.value = true
  },
  {
    code: DocumentAction.CANCEL_PROMULGATE,
    requiredDoc: true,
    label: t('Hủy ban hành'),
    severity: 'primary',
    icon: 'pi pi-times',
    onClick: () => cancel()
  },
  {
    code: DocumentAction.REVOKE_PROMULGATE,
    requiredDoc: true,
    label: t('Thu hồi ban hành'),
    severity: 'primary',
    icon: 'pi pi-sync',
    onClick: () => visiblePromulgateRevoke.value = true
  },
];

const docOnlStyle = [
  {
    label: 'Mail',
    icon: 'pi pi-envelope',
    color: '#007acc',
    command: () => {
      EventBus.emit('create-doc-out-online');
    }
  },
  {
    label: 'Event',
    icon: 'pi pi-calendar',
    color: '#0078d4',
    command: () => {
      EventBus.emit('create-event');
    }
  },
  {
    label: 'Group',
    icon: 'pi pi-users',
    color: '#8764b8',
    command: () => {
      EventBus.emit('create-group');
    }
  },
  {
    label: 'Document',
    icon: 'pi pi-file-word',
    color: '#2b579a',
    command: () => {
      EventBus.emit('create-doc-out-offline');
    }
  },
  {
    label: 'Spreadsheet',
    icon: 'pi pi-file-excel',
    color: '#217346',
    command: () => {
      EventBus.emit('create-spreadsheet');
    }
  },
  {
    label: 'Presentation',
    icon: 'pi pi-desktop',
    color: '#d24726',
    command: () => {
      EventBus.emit('create-presentation');
    }
  }
];

const filterActions = computed(() => allActions
  .filter(action => props.menuActions.includes(action.code))
  .filter(action => props.doc?.isFromOutsidePaper || props.doc?.docInBook
    ? action.code != DocumentAction.PUT_INTO_BOOK : true)
  .filter(action => !props.doc?.docInBook ? action.code != DocumentAction.PROMULGATE : true)
  .filter(action => isClerk(userDeptRole.value.roleId)
    && props.doc?.revokeType == null ? true : action.code != DocumentAction.CANCEL_PROMULGATE
        && action.code != DocumentAction.REVOKE_PROMULGATE)
  .map(action => {
    const disabled = action.requiredDoc ? !props.doc : false;
    return {
      ...action,
      disabled
    };
  })
);

watch(() => props.doc, () => {
  docId.value = props.doc?.id ?? '';
});

function promulgateDoc() {
  // Reset docId to ensure the dialog opens with a clean state
  docId.value = '';
  visibleDialogReview.value = true;
}

function hideSidebar() {
  docId.value = '';
  visibleFormDocIn.value = false;
  visiblePromulgate.value = false;
  refetchDocOuts();
}

function cancel() {
  confirm.require({
    message: t('Bạn có chắc chắn hủy ban hành văn bản này không?'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      cancelPromulgateDoc().mutate({
        model: {
          docId: props.doc?.id ?? '',
          userDeptRole: userDeptRole.value
        }
      }).then(() => {
        toastSuccess({ message: 'Đã hủy ban hành thành công.' });
        refetchDocOuts();
      }).catch((err) => {
        toastError({ message: t('document.doc.error.' + err.graphQLErrors[0].extensions.errorCode) });
      });
    },
  });
}

function revokeDoc() {
  visiblePromulgateRevoke.value = false;
  refetchDocOuts();
}

const mapSupportAction = inject('mapSupportAction', {} as Record<string, true>);
</script>

<style lang="scss" scoped>
:deep(.p-button-label) {
  font-size: 14px;
  font-weight: 400;
}
:deep(.btn-icon-post_add) {
  color: #51B7AE;
}
:deep(.btn-icon-export_notes) {
  color: #0D96FA;
}
.split-btn {
  :deep(.p-splitbutton-defaultbutton) {
    border-radius: 4px 0 0  4px;
    padding: 5px 7px;
  }
  :deep(.p-splitbutton-menubutton) {
    border-radius: 0 4px 4px 0;
    padding: 5px 7px;
  }
}
</style>