<template>
  <div ref="dropdownRef" :class="['custom-dropdown', `variant-${variant}`, { 'is-open': isOpen }]">
    <div class="dropdown-trigger-wrapper">
      <input
        type="text"
        :disabled="disabled"
        :readonly="disableSearch"
        :placeholder="(!isOpen && variant === 'filter') || selectedOption ? '' : placeholder"
        :value="isOpen && !disableSearch ? searchQuery : selectedOption ? selectedOption.label : ''"
        class="dropdown-trigger-input"
        @input="handleInput"
        @click.stop="toggleDropdown"
        @focus="openDropdown"
      />

      <div
        v-if="!isOpen && variant === 'filter' && placeholder && !selectedOption"
        class="static-placeholder-wrapper"
        @click="toggleDropdown"
      >
        <span class="placeholder-text">{{ placeholder }}:</span>
      </div>

      <svg
        class="arrow-icon"
        :class="{ 'is-open': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        @click.stop="toggleDropdown"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-show="isOpen" class="dropdown-menu">
      <div class="menu-inner">
        <button
          v-for="option in filteredOptions"
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

        <div v-if="filteredOptions.length === 0" class="no-result">Không tìm thấy kết quả</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'

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
  // BỔ SUNG: Cho phép component cha bật/tắt tính năng tìm kiếm (Mặc định là FALSE - tức là CHO PHÉP tìm kiếm)
  disableSearch: {
    type: Boolean,
    default: false,
  },
})

const isOpen = ref(false)
const searchQuery = ref('') // BỔ SUNG: Biến lưu chuỗi tìm kiếm

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

// BỔ SUNG: Logic lọc mượt mà, giữ nguyên data gốc của bạn
// SỬA LẠI: Logic lọc chuẩn, tách biệt rõ ràng trạng thái trống chuỗi tìm kiếm
const filteredOptions = computed(() => {
  // Nếu tắt tính năng tìm kiếm HOẶC người dùng chưa gõ ký tự nào, trả về toàn bộ danh sách gốc
  if (props.disableSearch || !searchQuery.value.trim()) {
    return props.options
  }

  // Chỉ lọc khi người dùng thực sự nhập từ khóa
  const query = searchQuery.value.toLowerCase().trim()
  return props.options.filter((opt) => {
    // Đề phòng trường hợp opt.label bị null/undefined trong database
    const label = opt.label ? String(opt.label).toLowerCase() : ''
    return label.includes(query)
  })
})

// Reset lại chuỗi tìm kiếm mỗi khi đóng/mở giao diện
watch(isOpen, (newVal) => {
  if (!newVal) {
    searchQuery.value = ''
  }
})

const openDropdown = () => {
  if (props.disabled) return
  isOpen.value = true
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const handleInput = (e) => {
  if (props.disableSearch) return
  searchQuery.value = e.target.value
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

/* Khung bọc mới cho Input Trigger */
.dropdown-trigger-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

/* Kiểu dáng ô nhập tìm kiếm đóng vai trò làm trigger luôn */
.dropdown-trigger-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

/* Tùy biến kích thước theo từng hình từ class cha kế thừa */
.variant-filter .dropdown-trigger-input {
  padding: 8px 36px 8px 16px;
  min-width: 160px; /* Sửa lỗi cú pháp min-w thành min-width chuẩn CSS */
}

.variant-pagination .dropdown-trigger-input {
  padding: 6px 30px 6px 12px;
  min-width: 70px; /* Sửa lỗi cú pháp min-w thành min-width chuẩn CSS */
}

.dropdown-trigger-input:focus {
  border-color: #10b981;
}

/* Khi đang mở dropdown, bo góc dưới dính liền chuẩn Hình 1 */
.custom-dropdown.is-open .dropdown-trigger-input {
  border-color: #10b981;
}
.custom-dropdown.is-open.variant-filter .dropdown-trigger-input {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.custom-dropdown.is-open.variant-pagination .dropdown-trigger-input {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* Lớp phủ Text Placeholder tĩnh cho filter */
.static-placeholder-wrapper {
  position: absolute;
  left: 16px;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.placeholder-text {
  color: #6b7280;
  margin-right: 4px;
}

/* Icon mũi tên đặt vị trí tuyệt đối bên phải */
.arrow-icon {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  color: #6b7280;
  transition: transform 0.2s ease;
  pointer-events: none;
}

.arrow-icon.is-open {
  transform: rotate(180deg);
}

/* Menu hộp xổ */
.dropdown-menu {
  position: absolute;
  left: 0;
  right: 0; /* Ép menu rộng khít bằng chiều ngang ô input dính liền */
  z-index: 50;
  padding: 0;
}

/* Vùng chứa item bên trong dính liền không khoảng cách */
.menu-inner {
  background-color: #ffffff;
  border: 1px solid #10b981;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

/* Tùy chỉnh thanh cuộn siêu mảnh như hình 1 */
.menu-inner::-webkit-scrollbar {
  width: 6px;
}
.menu-inner::-webkit-scrollbar-track {
  background: transparent;
}
.menu-inner::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* Hướng đổ menu dính liền viền */
.variant-filter .dropdown-menu {
  top: 100%;
  margin-top: -1px; /* Triệt tiêu khe hở */
}
.variant-filter .menu-inner {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top: none;
}

.variant-pagination .dropdown-menu {
  bottom: 100%;
  margin-bottom: -1px; /* Triệt tiêu khe hở */
}
.variant-pagination .menu-inner {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: none;
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

.no-result {
  padding: 14px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* Hover & Disabled */
.dropdown-trigger-wrapper:hover .dropdown-trigger-input:not(:disabled) {
  border-color: #10b981;
}

.dropdown-trigger-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f3f4f6;
  border-color: #d1d5db;
}
</style>
