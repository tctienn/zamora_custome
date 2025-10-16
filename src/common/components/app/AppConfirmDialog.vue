<template>
  <ConfirmDialogAlias
    v-bind='$attrs'>
    <!--    Ko biet lam nhu nao-->
    <template
      v-if='slots?.container'
      #container='{message,closeCallback,acceptCallback,rejectCallback}'>
      <slot
        :accept-callback='acceptCallback'
        :close-callback='closeCallback'
        :message='message'
        name='container'
        :reject-callback='rejectCallback'>
      </slot>
    </template>
    <template
      v-if='slots?.icon'
      #icon='scope'>
      <slot
        :class='scope.class'
        name='icon'>
      </slot>
    </template>
    <template
      v-if='slots?.accepticon'
      #accepticon>
      <slot name='accepticon'></slot>
    </template>
    <template
      v-if='slots?.rejecticon'
      #rejecticon>
      <slot name='rejecticon'></slot>
    </template>
    <template
      v-if='slots?.message'
      #message='{message: message}'>
      <slot
        :message='message'
        name='message'>
        <div class='align-items-center flex flex gap-3 surface-border w-full'>
          <i
            class='text-6xl text-primary-500'
            :class='message.icon'></i>
          <div v-sanitize-html='message.message'></div>
        </div>
      </slot>
    </template>
  </ConfirmDialogAlias>

</template>

<script setup lang="ts">
import { default as ConfirmDialogAlias } from 'primevue/confirmdialog';
import { useSlots } from 'vue';

const slots = useSlots();
</script>

<style scoped>

</style>