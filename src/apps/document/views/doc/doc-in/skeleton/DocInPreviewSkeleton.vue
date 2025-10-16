<template>
  <div class='border-round-sm card flex gap-3 m-0 position-relative px-4 py-3 shadow-none'>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <!-- Quote skeleton -->
      <div class='font-semibold'>
        <Skeleton
          class='w-full'
          height='1.5rem'
          width='80%'/>
      </div>
      
      <!-- Content skeleton -->
      <div class='flex gap-3'>
        <div class='flex flex-column flex-grow-1 gap-1 p-0'>
          <div class='grid grid-nogutter'>
            <div class='col-6'>
              <Skeleton
                class='mb-1'
                height='1rem'
                width='60%'/>
              <Skeleton
                height='1rem'
                width='40%'/>
            </div>
            <div class='col-6'>
              <Skeleton
                class='mb-1'
                height='1rem'
                width='50%'/>
              <Skeleton
                height='1rem'
                width='30%'/>
            </div>
            <div class='col-6 py-2'>
              <Skeleton
                class='mb-1'
                height='1rem'
                width='45%'/>
              <Skeleton
                height='1rem'
                width='60%'/>
            </div>
            <div class='col-6 py-2'>
              <Skeleton
                class='mb-1'
                height='1rem'
                width='40%'/>
              <Skeleton
                height='1rem'
                width='50%'/>
            </div>
            <div class='col-6'>
              <Skeleton
                class='mb-1'
                height='1rem'
                width='35%'/>
              <Skeleton
                height='1rem'
                width='45%'/>
            </div>
            <div class='col-6'>
              <Skeleton
                class='mb-1'
                height='1rem'
                width='55%'/>
              <Skeleton
                height='1rem'
                width='35%'/>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Action buttons skeleton - top right -->
    <div class='flex flex-column flex-grow-0 gap-2'>
      <div class='action-bar-fixed position-absolute'>
        <div class='action-buttons-bar flex gap-2'>
          <Skeleton
            height='2.5rem'
            shape='circle'
            size='2.5rem'/>
          <Skeleton
            height='2.5rem'
            shape='circle'
            size='2.5rem'/>
          <Skeleton
            height='2.5rem'
            shape='circle'
            size='2.5rem'/>
        </div>
      </div>
      
      <!-- Attachment dropdown skeleton - bottom right -->
      <div class='attachment-dropdown-fixed relative'>
        <Skeleton
          class='mt-2'
          height='2rem'
          width='10rem'/>
      </div>
    </div>
  </div>
  
  <!-- File preview skeleton -->
  <div class='mt-3'>
    <Skeleton
      height='44rem'
      width='100%'/>
  </div>
</template>

<script lang="ts" setup>
// No props needed for skeleton
</script>

<style scoped>
.action-bar-fixed {
  right: 1rem;
  top: 1rem;
}

.attachment-dropdown-fixed {
  position: absolute;
  right: 1rem;
  top: 4rem;
}

.action-button {
  border: 1px solid transparent;
  border-radius: 6px;
  height: 2.5rem;
  width: 2.5rem;
}
</style>
