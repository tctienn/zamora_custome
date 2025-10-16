<template>
  <button
    class='config-link layout-config-button'
    @click='onConfigSidebarToggle()'>
    <i class='pi pi-cog'></i>
  </button>
  <Sidebar
    v-model:visible='layoutState.configSidebarVisible.value'
    class='sm:w-18rem w-full'
    position='right'>
    <template v-if='!simple'>
      <h5>Menu Type</h5>
      <div class='flex flex-wrap row-gap-3'>
        <div class='align-items-center flex gap-2 w-6'>
          <RadioButton
            v-model='layoutConfig.menuMode.value'
            input-id='mode1'
            name='menuMode'
            value='static'></RadioButton>
          <label for='mode1'>Static</label>
        </div>

        <div class='align-items-center flex gap-2 pl-2 w-6'>
          <RadioButton
            v-model='layoutConfig.menuMode.value'
            input-id='mode2'
            name='menuMode'
            value='overlay'></RadioButton>
          <label for='mode2'>Overlay</label>
        </div>
        <div class='align-items-center flex gap-2 w-6'>
          <RadioButton
            v-model='layoutConfig.menuMode.value'
            input-id='mode3'
            name='menuMode'
            value='slim'></RadioButton>
          <label for='mode3'>Slim</label>
        </div>
        <div class='align-items-center flex gap-2 pl-2 w-6'>
          <RadioButton
            v-model='layoutConfig.menuMode.value'
            input-id='mode4'
            name='menuMode'
            value='slim-plus'></RadioButton>
          <label for='mode4'>Slim+</label>
        </div>
      </div>
      <hr/>
    </template>

    <h5>Color Scheme</h5>
    <div class='flex'>
      <div class='field-radiobutton flex-auto'>
        <RadioButton
          id='theme3'
          v-model='colorScheme'
          name='colorScheme'
          value='light'
          @change="changeColorScheme('light')"></RadioButton>
        <label for='theme3'>Light</label>
      </div>

      <div class='field-radiobutton flex-auto'>
        <RadioButton
          id='theme1'
          v-model='colorScheme'
          name='colorScheme'
          value='dark'
          @change="changeColorScheme('dark')"></RadioButton>
        <label for='theme1'>Dark</label>
      </div>
    </div>

    <template v-if='!simple'>
      <h5>Layout Theme</h5>
      <div class='field-radiobutton'>
        <RadioButton
          v-model='menuTheme'
          input-id='menutheme-colorscheme'
          name='menuTheme'
          value='colorScheme'
          @change="changeLayoutTheme('colorScheme')"></RadioButton>
        <label for='menutheme-colorscheme'>Color Scheme</label>
      </div>
      <div class='field-radiobutton'>
        <RadioButton
          v-model='menuTheme'
          :disabled="layoutConfig.colorScheme.value === 'dark'"
          input-id='menutheme-primarycolor'
          name='menuTheme'
          value='primaryColor'
          @change="changeLayoutTheme('primaryColor')"></RadioButton>
        <label for='menutheme-primarycolor'>Primary Color (Light Only)</label>
      </div>
    </template>

    <h5>Themes</h5>
    <div class='flex flex-wrap gap-3'>
      <div
        v-for='(theme, i) in componentThemes'
        :key='i'>
        <a
          :autoFocus='layoutConfig.theme === theme.name'
          class='align-items-center border-round cursor-pointer flex h-2rem hover:shadow-4 justify-content-center transition-duration-150 w-2rem'
          :style="{ 'background-color': theme.color }"
          @click='() => changeTheme(theme.name)'>
          <i
            v-if='theme.name === layoutConfig.theme.value'
            class='pi pi-check text-white'></i>
        </a>
      </div>
    </div>

    <h5>Scale</h5>
    <div class='align-items-center flex'>
      <Button
        class='h-2rem mr-2 p-button-rounded p-button-text w-2rem'
        :disabled='layoutConfig.scale.value === scales[0]'
        icon='pi pi-minus'
        type='button'
        @click='decrementScale()'></Button>
      <div class='align-items-center flex gap-3'>
        <i
          v-for='s in scales'
          :key='s'
          class='pi pi-circle-fill text-300'
          :class="{ 'text-primary-500': s === layoutConfig.scale.value }"></i>
      </div>
      <Button
        class='h-2rem ml-2 p-button-rounded p-button-text w-2rem'
        :disabled='layoutConfig.scale.value === scales[scales.length - 1]'
        icon='pi pi-plus'
        p-button
        type='button'
        @click='incrementScale()'></Button>
    </div>

    <h5>Input Style</h5>
    <div class='flex'>
      <div class='field-radiobutton flex-1'>
        <RadioButton
          input-id='outlined_input'
          :model-value='inputStyle'
          name='inputStyle'
          value='outlined'
          @update:model-value='onInputStyleChange'></RadioButton>
        <label for='outlined_input'>Outlined</label>
      </div>
      <div class='field-radiobutton flex-1'>
        <RadioButton
          input-id='filled_input'
          :model-value='inputStyle'
          name='inputStyle'
          value='filled'
          @update:model-value='onInputStyleChange'></RadioButton>
        <label for='filled_input'>Filled</label>
      </div>
    </div>

    <h5>Ripple Effect</h5>
    <InputSwitch
      :model-value='rippleActive'
      @update:model-value='onRippleChange'></InputSwitch>
  </Sidebar>
</template>

<script setup>
import { usePrimeVue } from 'primevue/config';
import Sidebar from 'primevue/sidebar';
import { computed, ref, watch } from 'vue';

import { useLayout } from './composables/layout';

defineProps({
  simple: {
    type: Boolean,
    default: false
  }
});

const $primevue = usePrimeVue();
const rippleActive = computed(() => $primevue.config.ripple);
const inputStyle = computed(() => $primevue.config.inputStyle || 'outlined');
const {
  setScale,
  layoutConfig,
  layoutState,
  onConfigSidebarToggle
} = useLayout();

const componentThemes = ref([
  {
    name: 'indigo',
    color: '#213C7A'
  },
  {
    name: 'blue',
    color: '#2196F3'
  },
  {
    name: 'green',
    color: '#4CAF50'
  },
  {
    name: 'deeppurple',
    color: '#673AB7'
  },
  {
    name: 'orange',
    color: '#FF9800'
  },
  {
    name: 'cyan',
    color: '#00BCD4'
  },
  {
    name: 'yellow',
    color: '#FFB340'
  },
  {
    name: 'pink',
    color: '#E91E63'
  },
  {
    name: 'purple',
    color: '#9C27B0'
  },
  {
    name: 'lime',
    color: '#CDDC39'
  }
]);

const scales = ref([12, 13, 14, 15, 16]);

watch(layoutConfig.menuMode, (newVal) => {
  if (newVal === 'static') {
    layoutState.staticMenuDesktopInactive.value = false;
  }
});

const menuTheme = ref('colorScheme');

const colorScheme = ref('light');

const changeColorScheme = (colorScheme) => {
  const themeLink = document.getElementById('theme-link');
  const themeLinkHref = themeLink.getAttribute('href');
  const currentColorScheme = 'theme-' + layoutConfig.colorScheme.value.toString();
  const newColorScheme = 'theme-' + colorScheme;
  const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

  replaceLink(themeLink, newHref, () => {
    layoutConfig.colorScheme.value = colorScheme;
  });
};
const changeLayoutTheme = (layoutTheme) => {
  const themeLink = document.getElementById('theme-link');
  const themeLinkHref = themeLink.getAttribute('href');
  const currentColorScheme = 'theme-' + layoutConfig.layoutTheme.value.toString();
  const newColorScheme = 'theme-' + layoutTheme;
  const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

  replaceLink(themeLink, newHref, () => {
    layoutConfig.layoutTheme.value = layoutTheme;
  });
};

const changeTheme = (theme) => {
  const themeLink = document.getElementById('theme-link');
  const themeHref = themeLink.getAttribute('href');
  const newHref = themeHref.replace(layoutConfig.theme.value, theme);

  replaceLink(themeLink, newHref, () => {
    layoutConfig.theme.value = theme;
  });
};

const replaceLink = (linkElement, href, onComplete) => {
  if (!linkElement || !href) {
    return;
  }

  const id = linkElement.getAttribute('id');
  const cloneLinkElement = linkElement.cloneNode(true);

  cloneLinkElement.setAttribute('href', href);
  cloneLinkElement.setAttribute('id', id + '-clone');

  linkElement.parentNode?.insertBefore(cloneLinkElement, linkElement.nextSibling);

  cloneLinkElement.addEventListener('load', () => {
    linkElement.remove();

    const element = document.getElementById(id);
    element && element.remove();

    cloneLinkElement.setAttribute('id', id);
    onComplete && onComplete();
  });
};
const decrementScale = () => {
  setScale(layoutConfig.scale.value - 1);
  applyScale();
};
const incrementScale = () => {
  setScale(layoutConfig.scale.value + 1);
  applyScale();
};

const applyScale = () => {
  document.documentElement.style.fontSize = layoutConfig.scale.value + 'px';
};

const onInputStyleChange = (value) => {
  $primevue.config.inputStyle = value;
};
const onRippleChange = (value) => {
  $primevue.config.ripple = value;
};
</script>
