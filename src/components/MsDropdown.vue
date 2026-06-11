<template>
  <div ref="dropdownRef" :class="['custom-dropdown', `variant-${variant}`, { 'is-error': error }]">
    <button type="button" class="dropdown-trigger" :disabled="disabled" @click="toggleDropdown">
      <span class="trigger-content">
        <span v-if="variant === 'filter' && placeholder" class="placeholder-text">
          {{ placeholder }}:
        </span>

        <span class="selected-label">
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
      </span>

      <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="isOpen" class="dropdown-menu">
      <div class="menu-inner">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :class="['menu-item', { 'is-selected': option.value === value }]"
          @click="selectOption(option.value)"
        >
          <span>{{ option.label }}</span>

          <svg
            v-if="option.value === value && variant === 'filter'"
            class="check-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
  <p v-if="error && errorMessage" class="error-message">
    {{ errorMessage }}
  </p>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  options: {
    type: Array,

    required: true,
  },

  value: {
    type: [String, Number],

    required: true,
  },

  variant: {
    type: String,

    default: 'filter', // 'filter' (đổ xuống) hoặc 'pagination' (đổ lên)
  },

  placeholder: {
    type: String,

    default: '',
  },

  disabled: {
    type: Boolean,

    default: false,
  },

  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const isOpen = ref(false)

const emit = defineEmits(['update:value'])

const dropdownRef = ref(null)

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.value)
})

const toggleDropdown = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
}

const selectOption = (val) => {
  if (props.disabled) return

  emit('update:value', val)

  isOpen.value = false
}
</script>

<style scoped>
/* Toàn bộ cấu trúc của Dropdown */

.custom-dropdown {
  position: relative;

  display: inline-block;

  font-family:
    system-ui,
    -apple-system,
    sans-serif;

  text-align: left;
}

/* Kiểu dáng nút kích hoạt (Trigger Button) */

.dropdown-trigger {
  display: flex;

  align-items: center;

  justify-content: space-between;

  background-color: #ffffff;

  border: 1px solid #d1d5db;

  border-radius: 8px;

  color: #374151;

  font-size: 14px;

  cursor: pointer;

  transition: all 0.2s ease;

  outline: none;
}

/* Tùy biến kích thước theo từng hình */

.variant-filter .dropdown-trigger {
  padding: 8px 16px;

  min-w: 160px;
}

.variant-pagination .dropdown-trigger {
  padding: 6px 12px;

  min-w: 70px;
}

.dropdown-trigger:focus-within {
  border-color: #10b981; /* Màu xanh emerald khi click */
}

.trigger-content {
  display: inline-flex;
}

.placeholder-text {
  color: #6b7280;

  margin-right: 4px;
}

.selected-label {
  font-weight: 500;

  color: #111827;
}

/* Icon mũi tên */

.arrow-icon {
  width: 16px;

  height: 16px;

  margin-left: 8px;

  color: #6b7280;

  transition: transform 0.2s ease;
}

/* Menu hộp xổ */

.dropdown-menu {
  position: absolute;

  left: 0;

  z-index: 50;

  min-width: 130px;

  padding: 4px 0;
}

/* Vùng chứa item bên trong có bo góc và đổ bóng */

.menu-inner {
  background-color: #ffffff;

  border: 1px solid #f3f4f6;

  border-radius: 12px;

  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);

  max-height: 240px;

  overflow-y: auto;

  padding: 4px 0;
}

/* Từng dòng lựa chọn */

.menu-item {
  width: 100%;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 10px 16px;

  font-size: 14px;

  color: #374151;

  background: none;

  border: none;

  text-align: left;

  cursor: pointer;

  transition: background-color 0.15s ease;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

/* Trạng thái được lựa chọn tích xanh */

.menu-item.is-selected {
  background-color: #ecfdf5;

  color: #059669;

  font-weight: 500;
}

.check-icon {
  width: 16px;

  height: 16px;

  color: #059669;
}

/* --- TRỌNG TÂM: ĐIỀU CHỈNH HƯỚNG BẰNG CSS THUẦN --- */

/* Hình 1: Bộ lọc (variant-filter) -> Đổ xuống dưới */

.variant-filter .dropdown-menu {
  top: 100%;

  margin-top: 4px;
}

/* Hình 2: Phân trang (variant-pagination) -> Tự đẩy ngược lên trên */

.variant-pagination .dropdown-menu {
  bottom: 100%;

  margin-bottom: 4px;
}

.custom-dropdown:hover .dropdown-trigger {
  border-color: #10b981;

  background-color: #f5f5f5;
}

.dropdown-trigger:disabled {
  cursor: not-allowed;

  opacity: 0.6;

  background: #f3f4f6;

  border-color: #d1d5db;
}

.dropdown-trigger:disabled:hover {
  border-color: #d1d5db;

  background: #f3f4f6;
}

.is-error .dropdown-trigger {
  border-color: #ef4444;
}

.is-error .dropdown-trigger:focus-within {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
}
</style>
