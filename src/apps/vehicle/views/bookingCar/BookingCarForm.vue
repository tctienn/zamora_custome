<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    :style="isDetail ? { width: '68vw' } : {}"
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click="emits('hide-dialog')"/>
          {{
            isDetail
              ? t('vehicle.bookingCar.titleForm')
              : t(`vehicle.common.${id ? 'update' : 'create'}`) +
                ' ' +
                t('vehicle.bookingCar.titleForm')
          }}
        </div>
      </div>
    </template>
    <div class='flex relative'>
      <div style='width: 48vw'>
        <form
          ref='form'
          @submit.prevent='submitBookingCar'>
          <div
            v-if='isDetail'
            class='font-bold text-blue-600 text-lg'>
            Thông tin phiếu đặt xe
          </div>
          <div :class='isDetail && "border-1 border-blue-300 border-dashed col-12 mt-2 w-full"'>
            <div
              class='formgrid grid mb-3'>
              <div class='col-6 field'>
                <label
                  v-required
                  class='font-bold'>{{
                    t(`vehicle.bookingCar.numTicket`)
                  }}</label>
                <div v-if='!isDetail'>
                  <InputText
                    v-model='bookingCar.numTicket'
                    class='p-component p-inputtext w-full'
                    maxlength='255'
                    name='numTicket'/>
                  <ValidateErrorMessage :errors='v$.numTicket.$errors'/>
                </div>
                <div
                  v-else
                  class='bg-blue-50 border-1 border-dashed border-round flex font-bold p-2 text-blue-700 w-fit'>
                  {{ bookingCar.numTicket }}
                </div>
              </div>
              <div class='col-6 field'>
                <label
                  v-required>{{
                    t(`vehicle.bookingCar.createdDate`)
                  }}</label>
                <div v-if='!isDetail'>
                  <Calendar
                    v-model='bookingCar.createdDate'
                    class='w-full'
                    icon-display='input'
                    show-icon/>
                  <ValidateErrorMessage :errors='v$.createdDate.$errors'/>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{ moment(bookingCar.createdDate).format('DD/MM/YYYY') }}
                </div>
              </div>
              <div class='col-6 field'>
                <label>{{
                  t(`vehicle.bookingCar.userBooking`)
                }}</label>
                <div v-if='!isDetail'>
                  <NamedSelectUser
                    v-model='bookingCar.userBooking'
                    :button-select-user='false'
                    class='w-full'
                    name='userBooking'
                    style='height: 40px'/>
                </div>
                <div
                  v-else
                  class=''>
                  <AppUser
                    avatar-size='2.5'
                    info-visible
                    :infos="['positionName', 'departments']"
                    name-visible
                    :user-id='bookingCar.userBooking'></AppUser>
                </div>
              </div>
              <div class='col-6 field'>
                <label
                  v-required
                  class='font-bold'>{{ t(`vehicle.bookingCar.users`) }}</label>
                <div v-if='!isDetail'>
                  <NamedSelectUser
                    v-model='bookingCar.userId'
                    :button-select-user='false'
                    class='w-full'
                    name='userId'
                    style='height: 40px'/>
                </div>
                <div
                  v-else
                  class=''>
                  <AppUser
                    avatar-size='2.5'
                    info-visible
                    :infos="['positionName', 'departments']"
                    name-visible
                    :user-id='bookingCar.userId'></AppUser>
                </div>
              </div>
              <div
                v-if='!isDetail'
                class='col-6 field'>
                <label>{{
                  t(`vehicle.bookingCar.position`)
                }}</label>
                <InputText
                  v-model='positionUserBooking'
                  class='p-component p-inputtext w-full'
                  disabled
                  maxlength='255'
                  name='position'/>
              </div>
              <div
                v-if='!isDetail'
                class='col-6 field'>
                <label>{{
                  t(`vehicle.bookingCar.position`)
                }}</label>
                <InputText
                  v-model='position'
                  class='p-component p-inputtext w-full'
                  disabled
                  maxlength='255'
                  name='position'/>
              </div>
              <div
                v-if='!isDetail'
                class='col-6 field'>
                <label>{{ t(`vehicle.bookingCar.dept`) }}</label>
                <InputText
                  v-model='deptUserBooking'
                  class='p-component p-inputtext w-full'
                  disabled
                  maxlength='255'
                  name='departurePoint'/>
              </div>
              <div
                v-if='!isDetail'
                class='col-6 field'>
                <label>{{ t(`vehicle.bookingCar.dept`) }}</label>
                <InputText
                  v-model='dept'
                  class='p-component p-inputtext w-full'
                  disabled
                  maxlength='255'
                  name='departurePoint'/>
              </div>
              <div class='col-6 field'>
                <label v-required>{{
                  t(`vehicle.bookingCar.numberUsers`)
                }}</label>
                <InputNumber
                  v-if='!isDetail'
                  v-model='bookingCar.numberUsers'
                  class='w-full'
                  input-id='integeronly'/>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.numberUsers }}
                </div>
                <input
                  v-model='bookingCar.numberUsers'
                  hidden
                  name='numberUsers'/>
              </div>
              <div
                v-if='isDetail'
                class='col-6 field'>
                <label>SĐT Người sử dụng xe</label>
                <div>{{ bookingCar.userPhone }}</div>
              </div>
              <div class='col-6 field'>
                <label>{{ t('Mức độ ưu tiên') }}</label>
                <Dropdown
                  v-if='!isDetail'
                  v-model='bookingCar.priority'
                  class='p-component w-full'
                  name='priority'
                  option-label='label'
                  option-value='value'
                  :options='TASK_PRIORITY_OPTIONS'>
                </Dropdown>
                <div
                  v-else
                  class='font-bold'>
                  {{ t(`work.task.priority.${camelCase(bookingCar.priority)}`) }}
                </div>
              </div>
              <div class='col-6 field'>
                <label
                  v-required>{{
                    t(`vehicle.bookingCar.departureDate`)
                  }}</label>
                <div v-if='!isDetail'>
                  <Calendar
                    id='calendar-24h'
                    v-model='bookingCar.departureDate'
                    class='w-full'
                    :class="
                      bookingCar.expectedReturnDate < bookingCar.departureDate
                        ? 'p-invalid'
                        : ''
                    "
                    hour-format='24'
                    icon-display='input'
                    show-icon
                    show-time/>
                  <ValidateErrorMessage :errors='v$.departureDate.$errors'/>
                  <small
                    v-if='!id ? (bookingCar.departureDate < new Date()) : (bookingCar.departureDate < bookingCar.createdDate)'
                    class='p-error'>
                    {{ t(`vehicle.bookingCar.validDateSmallThanNow`) }}
                  </small>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{
                    moment(bookingCar.departureDate)
                      .format('dddd, HH:mm DD/MM/YYYY')
                      .replace(/^\w/, (c) => c.toUpperCase())
                  }}
                </div>
              </div>
              <div class='col-6 field'>
                <label>{{
                  t(`vehicle.bookingCar.expectedReturnDate`)
                }}</label>
                <div v-if='!isDetail'>
                  <Calendar
                    id='calendar-24h'
                    v-model='bookingCar.expectedReturnDate'
                    class='w-full'
                    :class="
                      bookingCar.expectedReturnDate < bookingCar.departureDate
                        ? 'p-invalid'
                        : ''
                    "
                    hour-format='24'
                    icon-display='input'
                    show-icon
                    show-time/>
                  <small
                    v-if='bookingCar.expectedReturnDate < bookingCar.departureDate'
                    class='p-error'>
                    {{ t(`vehicle.bookingCar.validData`) }}
                  </small>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{
                    bookingCar.expectedReturnDate && moment(bookingCar.expectedReturnDate)
                      .format('dddd, HH:mm DD/MM/YYYY')
                      .replace(/^\w/, (c) => c.toUpperCase())
                  }}
                </div>
              </div>
              <div class='col-12 field'>
                <label
                  v-required>{{
                    t(`vehicle.bookingCar.onSitePlace`)
                  }}</label>
                <div v-if='!isDetail'>
                  <InputText
                    v-model='bookingCar.onSitePlace'
                    class='p-component p-inputtext w-full'
                    maxlength='255'
                    name='onSitePlace'/>
                  <ValidateErrorMessage :errors='v$.onSitePlace.$errors'/>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.onSitePlace }}
                </div>
              </div>
              <div class='col-6 field'>
                <label>{{
                  t(`vehicle.bookingCar.departurePoint`)
                }}</label>
                <div v-if='!isDetail'>
                  <AutoComplete
                    v-model='bookingCar.departurePoint'
                    class='w-full'
                    dropdown
                    maxlength='255'
                    name='departurePoint'
                    :suggestions='locationFiltered'
                    @complete='search'/>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.departurePoint !== 'undefined' ? bookingCar.departurePoint : '' }}
                </div>
              </div>
              <div class='col-6 field'>
                <label>{{
                  t(`vehicle.bookingCar.destination`)
                }}</label>
                <div v-if='!isDetail'>
                  <AutoComplete
                    v-model='bookingCar.destination'
                    class='w-full'
                    dropdown
                    maxlength='255'
                    name='destination'
                    :suggestions='locationFiltered'
                    @complete='search'/>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.destination !== 'undefined' ? bookingCar.destination : '' }}
                </div>
              </div>
              <div class='col-12 p-4'>
                <div
                  class='grid w-full'
                  :class='isDetail ? "bg-red-50 border-1 border-dashed border-red-700 border-round grid p-2 w-full" : ""'>
                  <div class='col-12 font-bold mb-3'>
                    Thông tin dự kiến:
                  </div>

                  <div class='col-3 field'>
                    <label>{{ t(`vehicle.bookingCar.numKm`) }}</label>
                    <InputNumber
                      v-if='!isDetail'
                      v-model='bookingCar.numKm'
                      class='w-full'
                      input-id='integeronly'/>
                    <div
                      v-else
                      class='font-bold'>
                      {{ bookingCar.numKm }}
                    </div>
                    <input
                      v-model='bookingCar.numKm'
                      hidden
                      name='numKm'/>
                  </div>

                  <div class='col-3 field'>
                    <label>{{
                      t(`vehicle.bookingCar.fuelCost`)
                    }}</label>
                    <InputNumber
                      v-if='!isDetail'
                      v-model='bookingCar.fuelCost'
                      class='w-full'
                      input-id='integeronly'/>
                    <div
                      v-else
                      class='font-bold'>
                      {{ formatNumberVN(bookingCar.fuelCost) }}
                    </div>
                    <input
                      v-model='bookingCar.fuelCost'
                      hidden
                      name='fuelCost'/>
                  </div>

                  <div class='col-3 field'>
                    <label>{{
                      t(`vehicle.bookingCar.roadCost`)
                    }}</label>
                    <InputNumber
                      v-if='!isDetail'
                      v-model='bookingCar.roadCost'
                      class='w-full'
                      input-id='integeronly'/>
                    <div
                      v-else
                      class='font-bold'>
                      {{ formatNumberVN(bookingCar.roadCost) }}
                    </div>
                    <input
                      v-model='bookingCar.roadCost'
                      hidden
                      name='roadCost'/>
                  </div>

                  <div class='col-3 field'>
                    <label>{{
                      t(`vehicle.bookingCar.otherCost`)
                    }}</label>
                    <InputNumber
                      v-if='!isDetail'
                      v-model='bookingCar.otherCost'
                      class='w-full'
                      input-id='integeronly'/>
                    <div
                      v-else
                      class='font-bold'>
                      {{ formatNumberVN(bookingCar.otherCost) }}
                    </div>
                    <input
                      v-model='bookingCar.otherCost'
                      hidden
                      name='otherCost'/>
                  </div>
                </div>
              </div>
              <div class='col-12 field'>
                <label>{{ t(`vehicle.bookingCar.reson`) }}</label>
                <Textarea
                  v-if='!isDetail'
                  v-model='bookingCar.reson'
                  class='w-full'
                  cols='30'
                  name='reson'
                  rows='3'/>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.reson }}
                </div>
              </div>
              <div
                v-if='!isDetail'
                class='col-12 field'>
                <label
                  v-required
                  for='flow'>{{ t('work-flow.process.flow') }}</label>
                <div class='flex w-full'>
                  <SelectFlowExisted
                    v-model='bookingCar.flowId'
                    :options='flows'/>
                </div>
                <ValidateErrorMessage :errors='v$.flowId.$errors'/>
              </div>
              <div class='col-12 field font-bold'>
                <label>Danh sách phòng ban đi cùng</label>
                <TreeSelect
                  v-if='!isDetail'
                  v-model='deptIds'
                  class='w-full'
                  display='chip'
                  v-bind='$attrs'
                  :options='organizations'
                  :pt="{
                    labelContainer: {
                      style: 'width: 0vw',
                    },
                  }"
                  selection-mode='multiple'>
                  <template #value='{ value }'>
                    <Chip
                      v-for='node in computeLabelDepartment(value)'
                      :key='node.id'
                      class='mx-1'
                      :label='node.label'
                      removable
                      @remove.stop='removeChip($event,node)'>
                      <span
                        v-text-scroll='{maxWidth: "200px"}'
                        class='py-2'>
                        {{ node.label }}
                      </span>
                    </Chip>
                  </template>
                </TreeSelect>
                <div v-else>{{ bookingCar.accompanyingDepartmentName?.join(', ') }}</div>
              </div>
              <div class='col-12 field font-bold'>
                <div class='align-items-center flex justify-content-between mb-2'>
                  <label>{{ t(`vehicle.bookingCar.companion`) }}</label>
                  <ButtonIcon
                    v-if='!isDetail'
                    icon='add_circle'
                    icon-size='1.5'
                    rounded
                    text
                    @click='showDialog = true'/>
                </div>

                <DataTable
                  class='overflow-auto'
                  row-hover
                  scroll-height='30vh'
                  scrollable
                  show-gridlines
                  :value='[...Object.keys(deptIds),...companion]'>
                  <Column
                    class='text-center'
                    header='TT'
                    style='width: 5%'>
                    <template #body='slotProps'>
                      <div
                        class='align-items-center flex items-center justify-content-center'>
                        {{ slotProps.index + 1 }}
                      </div>
                    </template>
                  </Column>
                  <Column
                    header='Tên'
                    style='width: 7vw'>
                    <template #body='{data}'>
                      {{ usersMoreInfo[data]?.fullName || getOrganizationById(data).name }}
                    </template>
                  </Column>
                  <Column
                    :header='t(`vehicle.bookingCar.position`)'
                    style='width: 6vw'>
                    <template #body='{data}'>
                      {{ usersMoreInfo[data]?.positionName || '' }}
                    </template>
                  </Column>
                  <Column
                    :header='t(`vehicle.bookingCar.dept`)'
                    style='width: 15vw'>
                    <template #body='{data}'>
                      {{
                        usersMoreInfo[data]?.departments
                          ?.map((department: any) => department.name)
                          .join(', ') || ''
                      }}
                    </template>
                  </Column>
                  <Column
                    v-if='!isDetail'
                    class='text-center'
                    style='width: 5%'>
                    <template #body='{data}'>
                      <ButtonIcon
                        v-tooltip.top="t('common.action')"
                        class='text-color'
                        icon='more_vert'
                        icon-size='1.4'
                        rounded
                        text
                        @click='toggleActionMenuUser($event, data)'/>
                    </template>
                  </Column>
                </DataTable>
              </div>
              <div class='col-12 field font-bold'>
                <div class='align-items-center flex justify-content-between mb-2'>
                  <label>Tệp đính kèm</label>
                  <ButtonIcon
                    v-if='!isDetail'
                    icon='add_circle'
                    icon-size='1.5'
                    rounded
                    text
                    @click='showAttachmentDialog = true'/>
                </div>

                <DataTable
                  v-model:selection='selectedRow'
                  row-hover
                  show-gridlines
                  :value='listAttachment'>
                  <Column
                    class='text-center'
                    header='TT'
                    style='width: 5%'>
                    <template #body='slotProps'>
                      <div
                        class='align-items-center flex items-center justify-content-center'>
                        {{ slotProps.index + 1 }}
                      </div>
                    </template>
                  </Column>
                  <Column
                    field='quote'
                    header='Trích yếu'>
                  </Column>
                  <Column
                    header='Tên tệp'>
                    <template #body='{data:{attachment}}'>
                      <div
                        class='align-items-center flex gap-2'>
                        <img
                          v-if='attachment.name'
                          alt=''
                          class='file-extension-icon h-2rem w-2rem'
                          draggable='false'
                          :src="
                            getFileIcon(
                              attachment.name.split('.')[attachment.name.split('.').length - 1],
                            )
                          "
                          @error='handleFileImageError'/>
                        {{ attachment.name || attachment.fileName }}
                      </div>
                    </template>
                  </Column>
                  <Column
                    class='text-center'
                    header='Kích thước'>
                    <template #body='{data:{attachment}}'>
                      {{ attachment.size }} KB
                    </template>
                  </Column>
                  <Column
                    class='text-center'>
                    <template #body='{data}'>
                      <ButtonIcon
                        v-tooltip.top="t('common.action')"
                        class='text-color'
                        icon='more_vert'
                        icon-size='1.4'
                        rounded
                        text
                        @click='toggleActionMenu($event, data)'/>
                    </template>
                  </Column>
                </DataTable>
              </div>
              <div class='col-12 field'>
                <label>{{ t(`vehicle.bookingCar.note`) }}</label>
                <Textarea
                  v-if='!isDetail'
                  v-model='bookingCar.note'
                  class='w-full'
                  cols='30'
                  name='note'
                  rows='3'/>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.note }}
                </div>
              </div>
              <div
                v-if='!isDetail'
                class='col-4 field mb-4'>
                <label>{{
                  t(`vehicle.bookingCar.norder`)
                }}</label>
                <InputNumber
                  v-model='bookingCar.norder'
                  class='w-full'
                  input-id='integeronly'/>
                <input
                  v-model='bookingCar.norder'
                  hidden
                  name='norder'/>
              </div>
            </div>
          </div>

          <div
            v-if='bookingCar.numDispatchOrder'
            class='font-bold my-2 text-blue-600 text-lg'>
            Thông tin điều xe
          </div>
          <div
            v-if='bookingCar.numDispatchOrder'
            class='border-1 border-dashed border-orange-300 col-12 mt-2 w-full'>

            <div class='formgrid grid'>
              <div class='col-6 field'>
                <label>Số lệnh</label>
                <div
                  class='bg-red-50 border-1 border-dashed border-round flex font-bold p-2 text-red-700 w-fit'>
                  {{ bookingCar.numDispatchOrder }}
                </div>
              </div>
              <div class='col-6 field'>
                <label>Ngày lập</label>
                <div
                  class='font-bold'>
                  {{ moment(bookingCar.numDispatchOrderCreatedDate).format('DD/MM/YYYY') }}
                </div>
              </div>
              <div class='col-3 field'>
                <label>Xe nhận lệnh</label>
                <div
                  class='font-bold'>
                  {{ bookingCar.licensePlate }}
                </div>
              </div>
              <div class='col-3 field'>
                <label>Hãng xe</label>
                <div>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.vehicleBranch }}
                </div>
              </div>
              <div class='col-3 field'>
                <label>Dòng xe</label>
                <div>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.vehicleType }}
                </div>
              </div>
              <div class='col-3 field'>
                <label>Chỗ ngồi</label>
                <div>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.numberOfSeats }}
                </div>
              </div>
              <div class='col-4 field'>
                <div class='flex'>
                  <AppUser
                    avatar-size='2.5'
                    :user-id='bookingCar.driver'/>
                  <div class='ml-3'>
                    <div>Lái xe nhận lệnh</div>
                    <div class='font-bold mt-1'>{{ usersMoreInfo[bookingCar.driver]?.fullName }}</div>
                  </div>
                </div>
              </div>
              <div class='col-6 field'>
                <label>Điện thoại</label>
                <div>
                  {{ bookingCar.driverPhone }}
                </div>
              </div>
              <div class='col-12 field'>
                <label>Ghi chú</label>
                <div>
                  {{ bookingCar.noteDispatchOrder }}
                </div>
              </div>
            </div>
          </div>

          <div style='margin-bottom: 30px'></div>
          <div
            class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
            style='width: 100%; left: 0; z-index: 1000'>
            <Button
              class='p-button-plain'
              icon='pi pi-times'
              :label="t('common.close')"
              severity='danger'
              @click="emits('hide-dialog')"/>
            <div
              v-if='task && bookingCar.status !== "DU_THAO"'
              class='flex gap-2'>
              <Button
                v-for='outcome in task?.outcomes'
                :key='outcome?.name'
                class='border-none'
                :disabled='outcome?.disable'
                :style='{background: outcome?.color, color: (outcome?.color ? calculateColorBasedOnBackgroundColor(outcome?.color || ""): undefined) }'
                @click='openCompleteTaskDialog(outcome)'>
                {{ outcome.label }}
              </Button>
            </div>
            <Button
              v-if='!isDetail'
              :disabled='isDisable'
              icon='pi pi-save'
              :label="t('common.save')"
              type='submit'/>
            <Button
              v-if='bookingCar.numDispatchOrder'
              icon='pi pi-print'
              label='In Lệnh'
              @click='printBookingCar'/>
          </div>
        </form>
      </div>
      <div
        v-if='isDetail'
        class='fixed ml-2'
        style='right: 10px'>
        <div class='align-items-center border-1 border-gray-300 flex font-bold justify-content-between p-2'>
          <div class='align-items-center flex gap-2'>
            <i class='pi pi-clock'></i> Bảng theo dõi quy trình xử lý
          </div>
          <AppIcon
            class='cursor-pointer'
            name='lan'
            size='1.5'
            @click='isShowFlowDialog = true'/>
        </div>
        <div
          class='border-1 border-gray-300 border-top-none p-3'
          style='width: 18vw; height: 83.5vh'>
          <ViewFlowStep
            v-if='task'
            :id='task?.workId'
            ref='viewFlowStepRef'/>
        </div>
      </div>
    </div>
  </Sidebar>

  <SelectParticipantsDialog
    v-model='companion'
    v-model:visible='showDialog'
    :multiple='true'
    :show-select-all='false'>
  </SelectParticipantsDialog>

  <BookingCarAttachmentDialog
    v-if='showAttachmentDialog'
    :visible-dialog='showAttachmentDialog'
    @hide-dialog='showAttachmentDialog = false'
    @submit-attachment='getFile($event)'/>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <Menu
    ref='menuRefUser'
    :model='menuUserActions'
    :popup='true'>
  </Menu>

  <DialogPreviewFile
    v-if='visiblePreviewFile'
    :name='selectedRow.quote'
    :url='selectedRow.attachment.path'
    :visible='visiblePreviewFile'
    @hide-dialog='visiblePreviewFile = false'/>

  <CompletedTaskForm
    v-if='visibleCompleteTask'
    v-model:visible='visibleCompleteTask'
    :created-by='bookingCar?.userBooking'
    :current-node-id='task?.nodeId'
    :outcome='currentOutcome'
    :status='bookingCar?.status'
    :task-id='task?.id'
    :work-id='task?.workId'
    @hide-dialog='reloadTask'/>

  <Dialog
    v-model:visible='isShowFlowDialog'
    :block-scroll='true'
    content-class='overflow-hidden'
    :dismissable-mask='true'
    :header="t('work-flow.process.flow')"
    modal>
    <div style='height: 80vh; width: 80vw'>
      <WorkFlowView
        :flow-id='bookingCar.flowId'
        style='height: 80vh; width: 80vw'>
      </WorkFlowView>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { camelCase, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { currentUser } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import SelectFlowExisted from '@/apps/document/views/doc/doc-out/component/flow/SelectFlowExisted.vue';
import SelectParticipantsDialog from '@/apps/media/views/survey/components/SelectParticipantsDialog.vue';
import {
  deleteBookingCarAttachment,
  getBookingCarAttachments,
  getBookingCarById,
  maxNOrder,
} from '@/apps/vehicle/api/graphql/booking-car';
import { getAllLocationPoint } from '@/apps/vehicle/api/graphql/location-point';
import {
  findParameterConfig,
  getBookingCarCode,
  increaseBookingCarStartValue,
} from '@/apps/vehicle/api/graphql/parameter-config';
import { getAllVehicle } from '@/apps/vehicle/api/graphql/vehicle';
import {
  createBookingCar,
  exportWordVehicleDispatchOrderVCB,
  updateBookingCar
} from '@/apps/vehicle/api/rest/booking-car';
import { type IBookingCar } from '@/apps/vehicle/model/bookingCar';
import BookingCarAttachmentDialog from '@/apps/vehicle/views/bookingCar/component/BookingCarAttachmentDialog.vue';
import CompletedTaskForm from '@/apps/vehicle/views/bookingCar/component/CompletedTaskForm.vue';
import ViewFlowStep from '@/apps/vehicle/views/bookingCar/component/ViewFlowStep.vue';
import { TaskPriority } from '@/apps/work/model/work';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import { flowsByType } from '@/apps/work-flow/api/graphql/flow-api';
import { getTaskByObjectId } from '@/apps/work-flow/api/graphql/task';
import { FlowTypePredefined } from '@/apps/work-flow/components/start-flow';
import type { Outcome } from '@/apps/work-flow/model/flow';
import type { Task } from '@/apps/work-flow/model/process/work';
import WorkFlowView from '@/apps/work-flow/views/config/sidebar/component/WorkFlowView.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DateTimeFormat, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { downloadFile, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { computeLabelDepartment } from '@/common/helpers/tree-node-utils';
import { createOptions, listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  isSidebar: {
    type: Boolean,
    default: true,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const isDisable = ref(false);
const { t } = useI18n();
const menuRef = ref();
const menuRefUser = ref();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const bookingCar = ref<IBookingCar>({} as IBookingCar);
const { user } = useUserStore();
const userBookingId = computed((): string => bookingCar.value.userBooking);
const positionUserBooking = ref();
const deptUserBooking = ref();
const userId = computed((): string => bookingCar.value.userId);
const position = ref();
const dept = ref();
const showAttachmentDialog = ref(false);
const companion = ref<string[]>([]);
const showDialog = ref(false);
const visiblePreviewFile = ref(false);
const organizations = ref([]);
const deptIds = ref<Record<string, boolean>>({});
const viewFlowStepRef = ref();
const isShowFlowDialog = ref(false);
const validateRules = {
  numTicket: {
    required: helpers.withMessage(
      t('vehicle.bookingCar.error.requiredNumTicket'),
      required,
    ),
  },
  createdDate: {
    required: helpers.withMessage(
      t('vehicle.bookingCar.error.requiredCreatedDate'),
      required,
    ),
  },
  departureDate: {
    required: helpers.withMessage(
      t('vehicle.bookingCar.error.requiredDepartureDate'),
      required,
    ),
  },
  onSitePlace: {
    required: helpers.withMessage(
      t('vehicle.bookingCar.error.requiredOnSitePlace'),
      required,
    ),
  },
  userId: {
    required: helpers.withMessage(
      t('vehicle.bookingCar.error.requiredUser'),
      required,
    ),
  },
  flowId: {
    required: helpers.withMessage(
      t('vehicle.bookingCar.error.requiredFlow'),
      required,
    ),
  },
};
const TASK_PRIORITY_OPTIONS = createOptions(TaskPriority, (key) =>
  t(`work.task.priority.${camelCase(key)}`),
);
const v$ = useVuelidate(validateRules, bookingCar);

const deleteUser = (userId: string) => {
  companion.value = companion.value.filter((id) => id !== userId);
};

watch(userId, (newUserId) => {
  if (newUserId && companion.value.includes(newUserId)) {
    companion.value = companion.value.filter(id => id !== newUserId);
  }
});

watch(companion, (newVal) => {
  if (userId.value && newVal.includes(userId.value)) {
    companion.value = newVal.filter(id => id !== userId.value);
  }
}, { deep: true });

const task = ref<Task>({} as Task);

const reloadTask = () => {
  emits('hide-dialog');
  /*visibleCompleteTask.value = false;
  viewFlowStepRef.value?.reloadTask();
  const {
    onResult,
    refetch
  } = getTaskByObjectId(bookingCar.value.id);
  onResult((res) => {
    task.value = res.data?.getTaskByObjectId as Task;
  });
  refetch();*/
};

const printBookingCar = () => {
  exportWordVehicleDispatchOrderVCB(props.id)
    .then((value: any) => {
      if (value) {
        downloadFile(value.data, 'Lệnh điều xe.docx');
      }
    });
};

if (!props.id) {
  const { onResult } = maxNOrder();
  onResult((res) => {
    bookingCar.value.norder = res.data.maxNOrderBookingCar;
  });
  bookingCar.value.createdDate = new Date();
  bookingCar.value.userBooking = user.id || '';
  bookingCar.value.priority = TaskPriority.NORMAL;
  getInfoUserBooking(user.id || '');

  const { onResult: findParameterConfigResult } = findParameterConfig();
  findParameterConfigResult((res) => {
    if (res.data.findParameterConfig.value.bookingCar.enabled) {
      const { onResult } = getBookingCarCode();
      onResult((res) => {
        bookingCar.value.numTicket = res.data.getBookingCarCode;
      });
    }
  });
}

const listAttachment = ref<any>([]);
const getFile = (data: any) => {
  listAttachment.value.push(data);
};

const roles = ref();
const { onResult: currentUserResult } =
  currentUser();
currentUserResult((res) => {
  roles.value = get(res, 'data.currentUser.roles', []);
});

if (props.id) {
  const { onResult: bookingCarOnResult } = getBookingCarById(props.id);
  bookingCarOnResult((res) => {
    bookingCar.value = {
      ...res.data.getBookingCarById,
      createdDate: new Date(res.data.getBookingCarById.createdDate),
      departureDate: new Date(res.data.getBookingCarById.departureDate),
    };
    if (res.data.getBookingCarById.expectedReturnDate) {
      bookingCar.value.expectedReturnDate = new Date(
        res.data.getBookingCarById.expectedReturnDate,
      );
    }
    position.value =
      usersMoreInfo.value[bookingCar.value.userBooking]?.positionName;
    dept.value = usersMoreInfo.value[bookingCar.value.userBooking]?.departments
      ?.map((department: any) => department.name)
      .join(', ');
    companion.value = bookingCar.value.companion;
    deptIds.value = Object.fromEntries(bookingCar.value.accompanyingDepartment.map((id: string) => [id, true]));
    const { onResult } = getTaskByObjectId(props.id);

    onResult((res) => {
      const fetchedTask = res.data?.getTaskByObjectId as Task;
      if (bookingCar.value.status === 'DA_PHE_DUYET') {
        task.value = {
          ...fetchedTask,
          outcomes: fetchedTask?.outcomes?.filter(
            (outcome: any) => outcome.name !== 'APPROVE'
          ) || []
        };
      } else {
        task.value = fetchedTask;
      }
    });
  });
  getBookingCarAttachments(props.id).onResult((res) => {
    listAttachment.value = res.data.getBookingCarAttachments.map((item: any) => ({
      ...item,
      attachment: {
        name: item.attachment.name,
        fileName: item.attachment.fileName,
        size: item.attachment.size,
      },
    }));
  });
  v$.value.$reset();
}

const location = ref<any[]>([]);
const locationFiltered = ref<any[]>([]);

const {
  result,
  load: loadFlows,
  refetch,
  variables
} = flowsByType();

const flows = computed(() => result.value?.flowsByType || []);

const { onResult: getAllLocationPointResult } = getAllLocationPoint();
getAllLocationPointResult((res) => {
  location.value = res.data.getAllLocationPoint.map((item: any) => item.name);
});

const search = (event: any) => {
  setTimeout(() => {
    const query = event.query.trim().toLowerCase();
    if (!query.length) {
      locationFiltered.value = [...location.value];
    } else {
      locationFiltered.value = location.value.filter((item) => {
        return item.trim().toLowerCase().includes(query);
      });
    }
  }, 100);
};

const { moment } = useMoment();

function submitBookingCar() {
  const errorFields = document.querySelectorAll('.p-invalid');
  if (errorFields.length > 0) {
    return;
  }
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && bookingCar.value) {
        const formData = new FormData(form.value);
        formData.append('flowId', bookingCar.value.flowId);
        formData.append('accompanyingDepartment', Object.keys(deptIds.value).toString());
        formData.append('userPhone', usersMoreInfo.value[bookingCar.value.userId]?.phone);
        formData.append('companion', companion.value.toString());
        !bookingCar.value.id && formData.append('organizationId', usersMoreInfo.value[bookingCar.value.userId]?.departments[0].id);
        formData.append('createdDate', moment(bookingCar.value.createdDate).format(
          DateTimeFormat.ISO_LOCAL_DATE,
        ));
        formData.append('departureDate', moment(bookingCar.value.departureDate).format(
          DateTimeFormat.ISO_LOCAL_DATE_TIME,
        ));
        bookingCar.value.expectedReturnDate && formData.append('expectedReturnDate', moment(
          bookingCar.value.expectedReturnDate,
        ).format(DateTimeFormat.ISO_LOCAL_DATE_TIME));
        formData.append('departurePoint', bookingCar.value.departurePoint || '');
        formData.append('destination', bookingCar.value.destination || '');
        listAttachment.value.filter(
          (attachment: any) => !attachment.id
        )?.forEach((a: any, i: number) => {
          formData.append(`attachments[${i}].quote`, a.quote || '');
          formData.append(`attachments[${i}].attachment`, a.attachment);
        });
        if (props.id) {
          formData.append('id', props.id);
          updateBookingCar(formData)
            .then(() => {
              toastSuccess({ message: t('Lưu thành công.') });
              emits('hide-dialog');
            })
            .catch((reson) =>
              toastError({ message: t(`vehicle.common.${reson?.code.toString()}`), }),
            );
        } else {
          createBookingCar(formData)
            .then(() => {
              toastSuccess({ message: t('Lưu thành công.') });
              emits('hide-dialog');
              increaseBookingCarStartValueMutate({});
            })
            .catch((reson) =>
              toastError({ message: t(`vehicle.common.${reson?.code.toString()}`), }),
            );
        }
      }
    })
    .then(() => isDisable.value = false);
}

const { mutate: increaseBookingCarStartValueMutate } =
  increaseBookingCarStartValue();

watch(userBookingId, (id) => {
  getInfoUserBooking(id);
});

function getInfoUserBooking(id: string) {
  positionUserBooking.value = usersMoreInfo.value[id]?.positionName;
  deptUserBooking.value = usersMoreInfo.value[id]?.departments
    ?.map((department: any) => department.name)
    .join(', ');
}

watch(userId, (id) => {
  getInfo(id);
});

function getInfo(id: string) {
  position.value = usersMoreInfo.value[id]?.positionName;
  dept.value = usersMoreInfo.value[id]?.departments
    ?.map((department: any) => department.name)
    .join(', ');
}

const selectedRow = ref<any>();
const selectedRowUser = ref<any>();

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

function toggleActionMenuUser(event: Event, data: any) {
  menuRefUser.value.toggle(event);
  selectedRowUser.value = data;
}

const listOrganizations = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
  organizations.value = listToTree(
    listOrganizations.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );
});

const getOrganizationById = (id: string) => {
  return listOrganizations.value.find((org: any) => org.id === id);
};

onMounted(() => {
  variables.value = { type: FlowTypePredefined.VEHICLE_BOOKING_CAR };
  loadFlows() || refetch();
});

const menuUserActions = [
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      deleteUser(selectedRowUser.value);
    }
  }
];

const menuActions = [
  {
    key: 'detail',
    label: 'Xem nội dung',
    icon: 'pi pi-eye',
    command: () => {
      visiblePreviewFile.value = true;
    },
  },
  {
    key: 'download',
    label: t('common.download'),
    icon: 'pi pi-download',
    command: () => {

    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDelete();
    },
  },
];

const {
  mutate: deleteBookingCarAttachmentMutate,
  onDone: deleteBookingCarAttachmentOnDone
} =
  deleteBookingCarAttachment();
const confirm = useConfirm();
const confirmDelete = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.quote, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteBookingCar();
    },
  });
};

const handleDeleteBookingCar = () => {
  if (!selectedRow.value?.id) {
    toastSuccess({ message: t('Xóa thành công') });
    listAttachment.value = listAttachment.value.filter(
      (item: any) => item.quote !== selectedRow.value?.quote,
    );
    return;
  }
  deleteBookingCarAttachmentMutate({ id: selectedRow.value?.id });
};

deleteBookingCarAttachmentOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  getBookingCarAttachments(props.id).onResult((res) => {
    listAttachment.value = res.data.getBookingCarAttachments.map((item: any) => ({
      ...item,
      attachment: {
        name: item.attachment.name,
        fileName: item.attachment.fileName,
        size: item.attachment.size,
      },
    }));
  });
});
const currentOutcome = ref<Outcome>();
const visibleCompleteTask = ref(false);

function openCompleteTaskDialog(outcome: Outcome) {
  currentOutcome.value = outcome;
  visibleCompleteTask.value = true;
}

const vehicles = ref();
const { onResult: getAllVehicleResult } = getAllVehicle();
getAllVehicleResult((res) => {
  vehicles.value = res.data.getAllVehicle;
});
const getVehicleByLicensePlate = (licensePlate: string) => {
  return vehicles.value?.find((vehicle: any) => vehicle.licensePlate === licensePlate);
};

function removeChip(event: Event, data: TreeNode) {
  if (data.key) {
    delete deptIds.value[data.key as string];
  }
}

function formatNumberVN(value: number): string {
  return value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '';
}
</script>

<style lang='scss' scoped>
:deep(.delete-action .p-menuitem-icon) {
  color: red;
}
</style>
