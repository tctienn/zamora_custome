<template>
  <DocInItem
    :model='model'
    :selected='selected'>
    <template #sender='{doc}'>
      <AppAvatar
        :label='doc?.publisherName'
        size='2.5'/>
      <AppIcon
        v-if='model?.sendBackType === SendBackType.TU_CHOI'
        v-tooltip='t("document.doc.returned")'
        name='reply'
        size='1.2'/>
      <AppIcon
        v-if='model?.sendBackType === SendBackType.THU_HOI'
        v-tooltip='t("document.doc.revoked")'
        name='rotate_left'
        size='1.2'/>
    </template>
    <template #date='{doc}'>
      <div class='text-sm'>
        {{ doc?.incomingDate ? moment(doc?.incomingDate).format('DD/MM/YYYY') : '' }}
      </div>
    </template>
    <template #action='{doc}'>
      <template v-if='doc'>
        <i
          v-if='model && canEdit(doc)'
          v-tooltip='t("common.edit")'
          class='pi pi-pencil text-blue-500'
          @click='edit(doc)'></i>
      </template>
    </template>
  </DocInItem>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { type Router, useRouter } from 'vue-router';

import { type DocIn, SendBackType } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocInItem from '@/apps/document/views/doc/doc-in/list/item/DocInItem.vue';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const confirm = useConfirm();

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { moment } = useMoment();
const { t } = useI18n();
const router = useRouter();

function canEdit(doc: DocIn) {
  return true;
}

const goToEditRoute = inject<(router: Router, docIn: DocIn) => void>('goToEditRoute',);

function edit(doc: DocIn) {
  goToEditRoute ? goToEditRoute(router, doc) : router.push({
    name: 'DocumentDocInUpdate',
    params: { id: doc.id }
  });
}
</script>

<style scoped>

</style>
