<template>
  <Dialog
    v-if='visible'
    v-model:visible='visible'
    append-to='self'
    :header='t(`document.sign.${props.header}`)'
    modal
    :pt='{
      content: {
        class: "py-0 surface-ground"
      }
    }'>
    <div class='flex gap-4'>
      <div class='flex flex-column gap-2 py-4 text-center'>
        <div class='font-semibold'>{{ t('common.signature') }}</div>
        <div v-if='!signUrls || !signUrls.length'>
          <div class='font-italic'>{{ t('common.noSignature') }}</div>
        </div>
        <template v-else>
          <div
            v-for='sign in signUrls'
            :key='sign'
            class='border-2'
            :class='sign === currentSign ? "border-primary" : "border-transparent"'>
            <div
              v-if='error.includes(sign)'
              class='align-items-center bg-black-alpha-20 flex h-6rem justify-content-center w-12rem'
              style='cursor: not-allowed'>
              {{ t('document.sign.errorSignature') }}
            </div>
            <img
              v-else-if='isSupportedSignature(sign)'
              alt='signature'
              class='w-12rem'
              :class='{"p-disabled": hasSign && signCa}'
              :disabled='hasSign && signCa'
              :src='sign'
              @click='prepareSign($event, sign)'
              @error='error = [...error, sign]'/>
            <div
              v-else
              class='align-items-center bg-black-alpha-20 flex h-6rem justify-content-center w-12rem'
              style='cursor: not-allowed'>
              {{ t('document.sign.notSupportSignature') }}
            </div>
          </div>

        </template>
      </div>
      <div
        ref='pdfRef'
        class='flex flex-column gap-4 overflow-x-hidden overflow-y-auto relative transparent-scrollbar'
        style='max-height: 74vh'></div>
    </div>
    <template #footer>
      <Button
        icon='pi pi-ban'
        :label='t("common.close")'
        severity='danger'
        @click='visible = false'></Button>
      <Button
        :disabled='!hasSign || isSigning'
        icon='pi pi-check'
        :label='t("common.confirm")'
        :loading='isSigning'
        @click='savePdf'></Button>
    </template>
  </Dialog>

</template>

<script lang='ts' setup>
import interact from 'interactjs';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { onMounted, onUnmounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SignatureConfig } from '@/apps/document/model/sign';

const props = defineProps({
  header: {
    type: String,
    default: 'signApprove'
  },
  url: {
    type: String,
    default: ''
  },
  signUrls: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  scale: {
    type: Number,
    default: 1.5
  },
  isSigning: {
    type: Boolean,
    default: false
  },
  signCa: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits<{
  putSignedFile: [Uint8Array],
  signCa: [Uint8Array, SignatureConfig]
}>();
const visible = defineModel<boolean>('visible', { default: false });
const pdfRef = ref<HTMLDivElement>();
const pdfDoc = ref<PDFDocument>();
const { t } = useI18n();
const currentSign = ref<string>();

const error = ref<string[]>([]);

async function renderPdf(url: string, scale: number) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const totalPages = pdf.numPages;

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const container = document.createElement('div');
    container.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.classList.add('display-canvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      container.appendChild(canvas);
      await page.render(renderContext).promise;
      pdfRef.value?.appendChild(container);
    }
  }
}

async function loadPdfDocument(url: string) {
  const pdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  pdfDoc.value = await PDFDocument.load(pdfBytes);
}

function prepareSign(event: MouseEvent, url: string) {
  if (hasSign.value && props.signCa) {
    return;
  }
  currentSign.value = url;
  const sign = event.target as HTMLImageElement;
  const container = pdfRef.value;
  if (container) {
    const cloneNode = sign.cloneNode(true) as HTMLImageElement;
    cloneNode.className = 'sign-img border-2 border-transparent hover:border-blue-500 absolute';
    cloneNode.classList.add('sign-img');
    cloneNode.classList.add('border-2');
    cloneNode.classList.add('border-transparent');
    cloneNode.classList.add('hover:border-blue-500');
    cloneNode.style.position = 'absolute';
    cloneNode.style.top = pdfRef.value?.scrollTop + 'px';
    cloneNode.style.left = '0';

    pdfRef.value?.append(cloneNode);

    hasSign.value = true;
  }
}

async function savePdf() {
  if (props.signCa) {
    await emitSignCa();
  } else {
    await putSignedFile();
  }
}

async function emitSignCa() {
  const canvasElements = pdfRef.value?.querySelectorAll('canvas.display-canvas') as NodeListOf<HTMLCanvasElement>;
  const signs = pdfRef.value?.querySelectorAll('img.sign-img') as NodeListOf<HTMLImageElement>;
  if (canvasElements && signs) {
    for (const img of signs) {
      const imgRect = img.getBoundingClientRect();
      for (let index = 0; index < canvasElements.length; index++) {
        const canvasRect = canvasElements[index].getBoundingClientRect();
        if (
          imgRect.left >= canvasRect.left
            && imgRect.right <= canvasRect.right
            && imgRect.top >= canvasRect.top
            && imgRect.bottom <= canvasRect.bottom
            && pdfDoc.value
        ) {
          const page = pdfDoc.value?.getPage(index);
          const pdfBytes = await pdfDoc.value.save();
          emits('signCa',
            pdfBytes,
            {
              page: index + 1,
              x: (imgRect.x - canvasRect.x) / props.scale,
              y: (page?.getHeight() || 0) - (imgRect.y - canvasRect.y + imgRect.height) / props.scale,
              width: imgRect.width / props.scale,
              height: imgRect.height / props.scale
            });
          return;
        }
      }
    }
  }
}

async function putSignedFile() {
  if (!pdfDoc.value) {
    return;
  }
  const canvasElements = pdfRef.value?.querySelectorAll('canvas.display-canvas') as NodeListOf<HTMLCanvasElement>;
  const signs = pdfRef.value?.querySelectorAll('img.sign-img') as NodeListOf<HTMLImageElement>;
  if (canvasElements && signs) {
    for (const img of signs) {
      const imgRect = img.getBoundingClientRect();
      for (let index = 0; index < canvasElements.length; index++) {
        const canvasRect = canvasElements[index].getBoundingClientRect();
        if (
          imgRect.left >= canvasRect.left
            && imgRect.right <= canvasRect.right
            && imgRect.top >= canvasRect.top
            && imgRect.bottom <= canvasRect.bottom
        ) {
          const arrayBuffer = await fetch(img.src).then((res) => res.arrayBuffer());
          const sign = img.src.includes('.jpg') || img.src.includes('.jpeg') ? await pdfDoc.value?.embedJpg(arrayBuffer)
            : img.src.includes('.png') ? await pdfDoc.value.embedPng(arrayBuffer) : undefined;
          if (sign) {
            const page = pdfDoc.value.getPage(index);
            page.drawImage(sign, {
              x: (imgRect.x - canvasRect.x) / props.scale,
              y: page.getHeight() - (imgRect.y - canvasRect.y + imgRect.height) / props.scale,
              width: imgRect.width / props.scale,
              height: imgRect.height / props.scale
            });
          }
        }
      }
    }
  }
  const pdfBytes = await pdfDoc.value.save();
  emits('putSignedFile', pdfBytes);
}

function isSupportedSignature(url: string) {
  return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png');
}

const hasSign = ref(false);
let firstLoad = true;

const doRender = (value: boolean) => {
  if (firstLoad) {
    firstLoad = false;
    return;
  }
  
  if (value) {
    if (props.url) {
      renderPdf(props.url, props.scale);
      loadPdfDocument(props.url);
    }
  }
};
watch(visible, doRender, { immediate: true });

onMounted(async () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  doRender(true);

  interact('.sign-img')
    .resizable({
      // resize from all edges and corners
      edges: {
        left: true,
        right: true,
        bottom: true,
        top: true
      },

      listeners: {
        move(event) {
          const target = event.target;
          let x = parseFloat(target.getAttribute('data-x')) || 0;
          let y = parseFloat(target.getAttribute('data-y')) || 0;

          // update the element's style
          target.style.width = event.rect.width + 'px';
          target.style.height = event.rect.height + 'px';

          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          target.textContent =
                Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({ outer: 'parent' }),

        // minimum size
        interact.modifiers.restrictSize({
          min: {
            width: 100,
            height: 50
          }
        })
      ],

      inertia: true
    })
    .draggable({
      listeners: {
        move(event) {
          const target = event.target;
          // keep the dragged position in the data-x/data-y attributes
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          // translate the element
          target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

          // update the posiion attributes
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      },
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: false
        })
      ]
    });

  document.onclick = (event) => {
    const target = event.target as HTMLElement;
    const signImages = pdfRef.value?.querySelectorAll(
      'img.sign-img'
    ) as NodeListOf<HTMLImageElement>;
    if (signImages) {
      signImages.forEach((img) => {
        img.classList.remove('border-blue-500');
        img.classList.remove('selected-sign');
        img.classList.add('border-transparent');
      });
    }
    if (target.classList.contains('sign-img')) {
      target.classList.remove('border-transparent');
      target.classList.add('border-blue-500');
      target.classList.add('selected-sign');
    }
  };

  document.onkeyup = (event) => {
    if (event.key === 'Delete') {
      const selectedSign = pdfRef.value?.querySelector('.selected-sign');
      if (selectedSign) {
        selectedSign.remove();

        hasSign.value = (pdfRef.value?.querySelectorAll('img.sign-img')?.length || 0) > 0;
      }
    }
  };
});

onUnmounted(() => {
  interact('.sign-img').unset();
  document.onclick = null;
  document.onkeyup = null;
  pdfRef.value?.querySelectorAll('img.sign-img')?.forEach((img) => img.remove());
});
</script>

<style scoped>
.transparent-scrollbar {
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: var(--primary-color) transparent;
  }
}
</style>
