<script setup>
import { computed } from 'vue'
import MsDropdown from './MsDropdown.vue'

const props = defineProps({
  totalRecords: {
    type: Number,
    default: 0,
  },

  currentPage: {
    type: Number,
    default: 1,
  },

  pageSize: {
    type: Number,
    default: 15,
  },

  pageSizeOptions: {
    type: Array,
    default: () => [15, 25, 50, 100],
  },
})

const emit = defineEmits(['update:currentPage', 'update:pageSize'])

// Chuyển đổi mảng số [15, 20, ...] thành dạng [{ value: 15, label: '15' }, ...] để Dropdown hiểu được
const dropdownOptions = computed(() => {
  return props.pageSizeOptions.map(size => ({
    value: size,
    label: String(size)
  }))
})

const startRecord = computed(() => {
  if (props.totalRecords === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endRecord = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalRecords)
})

const totalPages = computed(() => {
  return Math.ceil(props.totalRecords / props.pageSize)
})

const isPrevDisabled = computed(() => {
  return props.currentPage <= 1
})

const isNextDisabled = computed(() => {
  return props.currentPage >= totalPages.value
})

const handlePrev = () => {
  if (isPrevDisabled.value) return

  emit('update:currentPage', props.currentPage - 1)
}

const handleNext = () => {
  if (isNextDisabled.value) return

  emit('update:currentPage', props.currentPage + 1)
}

const handleChangePageSize = (newValue) => {
  emit('update:pageSize', Number(newValue))
  // reset về trang 1
  emit('update:currentPage', 1)
}

const isFirstDisabled = computed(() => {
  return props.currentPage <= 1
})

const isLastDisabled = computed(() => {
  return props.currentPage >= totalPages.value
})

const handleFirst = () => {
  if (isFirstDisabled.value) return

  emit('update:currentPage', 1)
}

const handleLast = () => {
  if (isLastDisabled.value) return

  emit('update:currentPage', totalPages.value)
}
</script>

<template>
  <div class="paging">
    <div class="number__record">
      Tổng:
      <b class="total__record">{{ totalRecords }}</b>
      bản ghi
    </div>

    <div class="text__record">
      Số dòng/trang

      <MsDropdown
        variant="pagination"
        :options="dropdownOptions"
        :value="pageSize"
        @update:value="handleChangePageSize"
      />

      <b class="paging_range"> {{ startRecord }} - {{ endRecord }} </b>

      <div class="paging_icon__group">
        <!-- Trang đầu -->
        <span title="Trang đầu">
          <svg
            data-v-9a904cb9=""
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="ms-icon paging-icon"
            :class="{ paging__disabled: isFirstDisabled }"
            @click="handleFirst"
          >
            <path
              data-v-9a904cb9=""
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              data-v-9a904cb9=""
              d="M4 4V12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            ></path>
          </svg>
        </span>

        <!-- Trang trước -->

        <span title="Trang trước">
          <svg
            data-v-9a904cb9=""
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="ms-icon paging-icon"
            :class="{ paging__disabled: isPrevDisabled }"
            @click="handlePrev"
          >
            <path
              data-v-9a904cb9=""
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </span>

        <!-- Trang sau -->
        <span title="Trang sau">
          <svg
            data-v-9a904cb9=""
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="ms-icon paging-icon"
            :class="{ paging__disabled: isNextDisabled }"
            @click="handleNext"
          >
            <path
              data-v-9a904cb9=""
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </span>
        <!-- Trang cuối -->
        <span title="Trang cuối">
          <svg
            data-v-9a904cb9=""
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="ms-icon paging-icon"
            :class="{ paging__disabled: isLastDisabled }"
            @click="handleLast"
          >
            <path
              data-v-9a904cb9=""
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              data-v-9a904cb9=""
              d="M12 4V12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            ></path>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paging {
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
}

.text__record {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.paging_icon__group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.paging-icon {
  cursor: pointer;
  color: #7a8188;
  flex-shrink: 0;
}

.paging-icon:hover:not(.paging__disabled) {
  color: #50b83c;
}

.paging__disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
