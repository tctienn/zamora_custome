<template>
  <Button
    v-for='ac in node?.data?.optionActions'
    :key='ac.name'
    :class='classNameCustom'
    :disabled='isDisabled(ac.name)'
    :label='ac.label'
    :size='size'
    style='font-size: 14px'
    @click='doAction(ac.name)'>
    <template #icon>
      <AppIcon
        class='pr-1'
        :class="['pr-1', ac.name === OutgoingDocAdditionalAction.SIGN_CA ? 'touch_app_icon' : ac.name === OutgoingDocAdditionalAction.SIGN_APPROVE ? 'draw_icon' : '']"
        :name='getIconByCode(ac.name)'
        :size='sizeIcon'>
      </AppIcon>
    </template>
  </Button>
  <PdfSign
    v-if='signCaVisible'
    v-model:visible='signCaVisible'
    :header="'signCa'"
    :is-signing='isSigningCa'
    sign-ca
    :sign-urls='signatureCaUrls'
    :url='signFileUrl'
    @sign-ca='signCa'
    @update:visible='closeSignCa'/>
  <PdfSign
    v-if='pdfSignVisible'
    v-model:visible='pdfSignVisible'
    :header="'signApprove'"
    :sign-urls='signatures'
    :url='signFileUrl'
    @put-signed-file='saveSignedFile'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, type PropType, type Ref, ref, watch } from 'vue';

import { getSignConfig } from '@/apps/admin/api/rest/sign-config';
import { getSignProvideConfig } from '@/apps/admin/api/rest/sign-provide-config';
import { getVtSignConfig } from '@/apps/admin/api/rest/vt-sign-config';
import type { ISignConfig } from '@/apps/admin/model/sign-config';
import { isSigned } from '@/apps/document/api/graphql/attachment';
import { signApprove, signCaProvide } from '@/apps/document/api/rest/sign';
import { AttachmentSignType, type DocumentAttachment } from '@/apps/document/model/attachment';
import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { type DocOutInput, OutgoingDocAdditionalAction } from '@/apps/document/model/doc/doc-out';
import type { SignatureConfig } from '@/apps/document/model/sign';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useSignaturesStore } from '@/apps/document/store/sgin';
import PdfSign from '@/apps/document/views/doc/doc-out/component/sign/PdfSign.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import { DOCUMENT_URL } from '@/common/api/configService';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { generateDownloadUrl, generatePreviewFileUrl } from '@/common/helpers/file-utils';
import { AttachType } from '@/common/model/attachment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined,
  },
  size: {
    type: String as PropType<'small' | 'large' | undefined>,
    default: 'small'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  classNameCustom: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['isSignedCA', 'isSignedApprove']);
const { authentication } = useUserStore();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { signatures } = storeToRefs(useSignaturesStore());
const doc = inject<Ref<DocOutInput> | undefined>('doc', undefined);
const signCaVisible = ref(false);
const pdfSignVisible = ref(false);

const signConfig = ref<ISignConfig>();
const signatureCaUrls = computed((): string[] | undefined => signConfig.value?.signature
  ? [generateDownloadUrl(signConfig.value?.signature) || ''] : undefined);

const isSigningCa = ref(false);
let timeoutCheckStatus: NodeJS.Timeout | undefined;

type DocOutActionConfig = {
  code: string
  icon: string
  command?: () => void
  disabled?: boolean
  getDisabledFn?: () => Promise<undefined | boolean> | undefined;
}
const docOutAdditionalActions = ref<DocOutActionConfig[]>([
  {
    code: OutgoingDocAdditionalAction.SIGN_CA,
    icon: 'touch_app',
    command: prepareSignCa,
    getDisabledFn() {
      const {
        load,
        refetch
      } = isSigned(mainAttachment.value?.id || '', userDeptRole.value, AttachmentSignType.KY_SO);
      return (load() || refetch({
        attachmentId: mainAttachment.value?.id || '',
        userDeptRole: userDeptRole.value,
        signType: AttachmentSignType.KY_SO
      }))?.then(
        (res) => {
          emits('isSignedCA', (res?.isSigned as boolean) || false);
          return (res?.isSigned as boolean) || false;
        },
      );
    },
  },
  {
    code: OutgoingDocAdditionalAction.SIGN_APPROVE,
    icon: 'draw',
    command: () => pdfSignVisible.value = true,
    getDisabledFn() {
      const {
        load,
        refetch
      } = isSigned(mainAttachment.value?.id || '', userDeptRole.value, AttachmentSignType.KY_DIEN_TU);
      return (load() || refetch({
        attachmentId: mainAttachment.value?.id || '',
        userDeptRole: userDeptRole.value,
        signType: AttachmentSignType.KY_DIEN_TU
      }))?.then(
        (res) => {
          emits('isSignedApprove', (res?.isSigned as boolean) || false);
          return (res?.isSigned as boolean) || false;
        },
      );
    },
  }
]);

function isDisabled(code: string): boolean {
  const action = docOutAdditionalActions.value.find(a => a.code === code);
  return action?.disabled || false;
}

function getIconByCode(code: string): string {
  const action = docOutAdditionalActions.value.find(a => a.code === code);
  return action?.icon || '';
}

function doAction(code: string) {
  const action = docOutAdditionalActions.value.find(a => a.code === code);
  action?.command?.();
}

const reloadDoc = inject('reloadDoc', () => void 0);

function prepareSignCa() {
  getSignProvideConfig().then((res) => {
    if (res) {
      getSignConfigFuncByProvider(res)?.().then((config) => {
        if (config) {
          signConfig.value = config;
          signCaVisible.value = true;
        }
      });
    }
  });
}

function getSignConfigFuncByProvider(provider: string) {
  let func;
  switch (provider) {
  case 'E_SIGN':
    func = getSignConfig;
    break;
  case 'VIETTEL_CA':
    func = getVtSignConfig;
    break;
  }
  return func;
}

function signCa(data: Uint8Array, config: SignatureConfig) {
  isSigningCa.value = true;
  const attachment = mainAttachment.value;
  if (attachment) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const form = new FormData();
    form.append('docId', doc?.value?.id || '');
    form.append('file', blob, attachment.fullName.replace(`.${attachment.fileExtension}`, '.pdf'));
    form.append('objectType', ObjectTypeEnum.VB_DI);
    form.append('signatureConfig.page', config.page.toString());
    form.append('signatureConfig.x', config.x.toString());
    form.append('signatureConfig.y', config.y.toString());
    form.append('signatureConfig.width', config.width.toString());
    form.append('signatureConfig.height', config.height.toString());
    form.append('userDeptRole.userId', userDeptRole.value.userId);
    form.append('userDeptRole.userName', userDeptRole.value.userName);
    form.append('userDeptRole.deptId', userDeptRole.value.deptId);
    form.append('userDeptRole.deptName', userDeptRole.value.deptName);
    form.append('userDeptRole.roleId', userDeptRole.value.roleId);
    form.append('userDeptRole.roleName', userDeptRole.value.roleName);
    form.append('userDeptRole.type', userDeptRole.value.type);
    signCaProvide(form).then(() => {
      toastSuccess();
      reloadDoc();
      getButtonsDisabled();
      EventBus.emit('reload-preview');
    })
      .catch(() => {
        toastError();
      })
      .finally(() => {
        isSigningCa.value = false;
        signCaVisible.value = false;
      });
  }
}

function closeSignCa(value: boolean) {
  if (!value) {
    isSigningCa.value = false;
    if (timeoutCheckStatus) {
      clearTimeout(timeoutCheckStatus);
    }
  }
}

// function signCa() {
//   console.log('buildDocOutHandeUrl()', buildDocOutHandeUrl());
//   if (mainAttachment.value) {
//     const message = {
//       'FileUploadHandler': buildDocOutHandeUrl(),
//       'FileName': signFileUrl.value,
//     };
//     vgcaSignApproved(JSON.stringify(message), (rs: string | undefined) => {
//       console.log('rs', rs);
//       if (rs) {
//         const parse = JSON.parse(rs);
//         if (parse?.['Status'] == 0) {
//           toastSuccess();
//           reloadDoc();
//         }
//       }
//       getButtonsDisabled();
//     }, () => {
//       toastWarn({ message: 'Lỗi kết nối với dịch vụ ký số' });
//     });
//   } else {
//     toastWarn({ message: 'Chưa có file chính' });
//   }
// }

function saveSignedFile(data: Uint8Array) {
  const attachment = mainAttachment.value;
  if (attachment) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const form = new FormData();
    form.append('file', blob, attachment.fullName.replace(`.${attachment.fileExtension}`, '.pdf'));
    form.append('userDeptRoleModel.userId', userDeptRole.value.userId);
    form.append('userDeptRoleModel.userName', userDeptRole.value.userName);
    form.append('userDeptRoleModel.deptId', userDeptRole.value.deptId);
    form.append('userDeptRoleModel.deptName', userDeptRole.value.deptName);
    form.append('userDeptRoleModel.roleId', userDeptRole.value.roleId);
    form.append('userDeptRoleModel.roleName', userDeptRole.value.roleName);
    form.append('userDeptRoleModel.type', userDeptRole.value.type);
    signApprove(doc?.value?.id || '', form).then(() => {
      pdfSignVisible.value = false;
      toastSuccess();
      reloadDoc();
    }).then(() => getButtonsDisabled());
  }

}

const mainAttachment = computed(() => doc?.value?.outGoingAttachments?.find(a => a.attachType === AttachType.FILE_CHINH));
const signFileUrl = computed(() => {
  return mainAttachment.value ? previewUrl(mainAttachment.value) : '';
});

function previewUrl(attachment: DocumentAttachment) {
  const extension = attachment.fileExtension;
  let previewUrl = attachment.filePath;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    previewUrl = attachment.filePath?.replace('/main/', '/preview/')
      .replace(`.${extension}`, '.pdf');
  }

  return generatePreviewFileUrl(previewUrl);
}

function buildDocOutHandeUrl() {
  // eslint-disable-next-line max-len
  return `${DOCUMENT_URL}/sign-ca/out-going?docId=${doc?.value?.id}&token=${encodeURIComponent(authentication)}`
      + `&userId=${encodeURIComponent(userDeptRole.value.userId)}`
      + `&userName=${encodeURIComponent(userDeptRole.value.userName)}`
      + `&deptId=${encodeURIComponent(userDeptRole.value.deptId)}`
      + `&deptName=${encodeURIComponent(userDeptRole.value.deptName)}`
      + `&roleId=${encodeURIComponent(userDeptRole.value.roleId)}`
      + `&roleName=${encodeURIComponent(userDeptRole.value.roleName)}`;
}

const sizeIcon = computed(() => {
  switch (props.size) {
  case 'small':
    return '1';
  case 'large':
    return '1.4';
  default:
    return '1.3';
  }
});

function getButtonsDisabled() {
  docOutAdditionalActions.value.forEach(action => {
    if (action.getDisabledFn) {
      action.getDisabledFn()?.then(disabled => {
        docOutAdditionalActions.value = docOutAdditionalActions.value.map(a => {
          if (a.code === action.code) {
            return {
              ...action,
              disabled: disabled || false
            };
          }
          return a;
        });
      });
    }
  });
}

watch(mainAttachment, getButtonsDisabled);

onMounted(() => {
  getButtonsDisabled();
});
</script>

<style scoped>
:deep(.touch_app_icon) {
  color: #F17AC7 !important;
}

:deep(.draw_icon) {
  color: #6CC3E0 !important;
}
</style>
