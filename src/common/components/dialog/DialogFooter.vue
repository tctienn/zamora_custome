<template>
  <Button
    v-if='closeButton'
    class='p-button-p-sm p-button-plain'
    severity='danger'
    v-bind='closeButton'
    @click='closeButton.command'/>

  <template v-if='otherButtons && otherButtons.length'>
    <ButtonIcon
      v-for='(button, index) in otherButtons'
      :key='index'
      class='p-button-p-sm'
      v-bind='button'
      @click='button.command'/>
  </template>

  <Button
    v-if='actionButton'
    v-bind='actionButton'
    class='p-button-p-sm'
    @click='actionButton.command'>
    <template
      v-if='actionButton.materialIcon'
      #icon>
      <AppIcon
        :name='actionButton.materialIcon'
        size='1.3'>
      </AppIcon>
    </template>
  </Button>
</template>

<script setup lang='ts'>
import { inject } from 'vue';

const {
  closeButton,
  otherButtons,
  actionButton
} = inject('dialogFooterButtons', {
  closeButton: {
    command: Function,
    icon: 'pi pi-times',
    materialIcon: undefined
  },
  otherButtons: [{
    command: Function,
    icon: '',
    materialIcon: undefined
  }],
  actionButton: {
    command: Function,
    icon: 'pi pi-save',
    materialIcon: undefined
  }
});
</script>

<script lang='ts'>
export default { name: 'DialogFooter' };
</script>
