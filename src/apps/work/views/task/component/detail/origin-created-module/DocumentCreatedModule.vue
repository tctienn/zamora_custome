<template>
  <span
    v-tooltip='"Đi đến văn bản"'
    class='cursor-pointer hover:text-blue-400 text-overflow-ellipsis text-sm'
    @click='goToOrigin'>
    {{ data?.title }}
  </span>

</template>

<script lang="ts" setup>
import { computed, type PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getDocInById } from '@/apps/document/api/rest/docIn';
import { getDocOutById } from '@/apps/document/api/rest/docOut';
import { getDocSubmitById } from '@/apps/document/api/rest/docSubmit';
import type { OriginModule } from '@/apps/work/model/task';

const props = defineProps({
  originCreatedType: {
    type: String as PropType<OriginModule>,
    default: undefined
  },
  originCreatedId: {
    type: String,
    default: undefined,
  },
  originData: {
    type: Object,
    default: undefined
  }
});
const emits = defineEmits<{
  (e: 'goToOrigin', fetchedData: unknown): void
}>();

const router = useRouter();
const type = ref<'DOC_IN' | 'DOC_OUT' | 'DOC_SUBMIT'>();
const routeName = computed(() => {
  switch (type.value) {
  case 'DOC_IN':
    return 'DocumentDocIn';
  case 'DOC_OUT':
    return 'DocumentDocOut';
  case 'DOC_SUBMIT':
    return 'DocumentSubmit';
  }
  return 'DocumentDocIn';
});

function goToOrigin() {
  // const routeData = router.resolve({ name: routeName.value });
  // window.open(routeData.href);
  router.push({ name: routeName.value });

  emits('goToOrigin', data.value);
}

type DocData = {
  //Quote / about / ....
  title?: string,
  [key: string]: unknown
}
const data = ref<DocData>();

function fetchData(): DocData | undefined {
  if (!props.originCreatedId) {
    return;
  }
  switch (props.originData?.docType) {
  case 'DOC_IN': {
    type.value = 'DOC_IN';
    getDocInById(props.originCreatedId).then(value => {
      if (value) {
        data.value = {
          ...value,
          title: value.quote
        };
      }
    });
    break;
  }
  case 'DOC_OUT': {
    type.value = 'DOC_OUT';
    getDocOutById(props.originCreatedId).then(value => {
      if (value) {
        data.value = {
          ...value,
          title: value.quote
        };
      }
    });
    break;
  }
  case 'DOC_SUBMIT': {
    type.value = 'DOC_SUBMIT';
    getDocSubmitById(props.originCreatedId).then(value => {
      if (value) {
        data.value = {
          ...value,
          title: value.about
        };
      }
    });
    break;
  }
  }
}

fetchData();
</script>

<style scoped>

</style>