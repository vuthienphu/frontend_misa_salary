<template>
  <div v-if="variant === 'combo'" class="ms-combo-btn" :class="{ 'ms-btn--disabled': disabled }">
    <button :disabled="disabled" @click="$emit('click', $event)" class="ms-combo-btn__main">
      <slot></slot>
    </button>

    <button
      :disabled="disabled"
      @click="$emit('dropdown-click', $event)"
      class="ms-combo-btn__arrow"
    >
      <svg
        class="ms-btn__icon"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  <button
    v-else
    :disabled="disabled"
    @click="$emit('click', $event)"
    :class="[
      'ms-btn',
      `ms-btn--${variant}`,
      {
        'ms-btn--has-icon-left': !!$slots.icon,
      },
    ]"
  >
    <span v-if="$slots.icon" class="ms-btn__icon ms-btn__icon--left">
      <slot name="icon"></slot>
    </span>

    <span class="ms-btn__text">
      <slot></slot>
    </span>

    <span v-if="variant === 'mixed'" class="ms-btn__icon ms-btn__icon--right">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </button>
</template>

<script setup>
// Định nghĩa các props đầu vào dựa theo bản thiết kế UI
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'link', 'combo', 'icon', 'mixed'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

// Định nghĩa các sự kiện trả về component cha khi click
defineEmits(['click', 'dropdown-click'])
</script>

<style scoped>
/* --- BIẾN DESIGN SYSTEM ĐƯỢC ĐÓNG GÓI --- */
.ms-btn,
.ms-combo-btn {
  --primary-color: #02b956;
  --pressed-color: #198f3b;
  --disabled-opacity: 0.6;
  --border-radius: 8px;
  --height: 36px;
  --font-size: 14px;
  --secondary-color: #d5d7da;
}

/* --- STYLE CƠ BẢN CỦA BUTTON --- */
.ms-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--height);
  font-size: var(--font-size);
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  background-color: transparent;
  padding: 0 16px; /* Mặc định nút chính và phụ là 16px trái/phải */
  box-sizing: border-box;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  user-select: none;
}

/* Trạng thái disabled cho các nút thông thường */
.ms-btn:disabled {
  opacity: var(--disabled-opacity);
  cursor: not-allowed;
  pointer-events: none;
}

/* --- CHI TIẾT TỪNG LOẠI NÚT (VARIANTS) --- */

/* 1. Nút chính (Primary) */
.ms-btn--primary {
  background-color: var(--primary-color);
  color: #ffffff;
}
.ms-btn--primary:hover {
  background-color: #02a64d; /* Màu hover nhẹ */
}
.ms-btn--primary:active {
  background-color: var(--pressed-color); /* Màu nhấn chuẩn thiết kế */
}

/* 2. Nút phụ (Secondary) */
.ms-btn--secondary {
  background-color: #ffffff;
  color: #101828;
  border: 1px solid var(--secondary-color);
}
.ms-btn--secondary:hover {
  background-color: rgba(2, 185, 86, 0.08);
}
.ms-btn--secondary:active {
  background-color: rgba(25, 143, 59, 0.15);
}

/* 3. Link Button */
.ms-btn--link {
  color: var(--primary-color);
  padding: 0;
  height: auto;
  border-radius: 0;
  width: auto;
}
.ms-btn--link:hover {
  text-decoration: underline;
}
.ms-btn--link:active {
  color: var(--pressed-color);
}

/* 4. Button với Icon và Mixed Button (Dùng chung nền màu như Primary) */
.ms-btn--icon,
.ms-btn--mixed {
  background-color: var(--primary-color);
  color: #ffffff;
}
.ms-btn--icon:hover,
.ms-btn--mixed:hover {
  background-color: #02a64d;
}
.ms-btn--icon:active,
.ms-btn--mixed:active {
  background-color: var(--pressed-color);
}

/* Căn chỉnh khoảng cách đỏ chính xác trên UI: Trái 12px, Phải 16px khi có icon trái */
.ms-btn--has-icon-left {
  padding-left: 12px;
  padding-right: 16px;
}

/* Định hình kích thước chuẩn cho toàn bộ Icon (20x20px) */
.ms-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
/* Icon bọc SVG */
.ms-btn__icon :deep(svg),
.ms-btn__icon svg {
  width: 20px;
  height: 20px;
}

/* Khoảng cách giữa icon bên trái và chữ: 4px */
.ms-btn__icon--left {
  margin-right: 4px;
}

/* Khoảng cách giữa chữ và mũi tên dropdown bên phải: 8px */
.ms-btn__icon--right {
  margin-left: 8px;
}

/* --- 5. COMBO BUTTON BLOCK (Khối phức hợp tách biệt) --- */
.ms-combo-btn {
  display: inline-flex;
  align-items: center;
  height: var(--height);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.ms-combo-btn__main {
  height: 100%;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-right: 1px solid rgba(25, 143, 59, 0.4); /* Đường vạch kẻ chia đôi */
  padding: 0 12px 0 16px; /* Trái 16px, phải 12px theo thiết kế */
  font-size: var(--font-size);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* Khối mũi tên rộng cố định 40px, căn giữa icon */
.ms-combo-btn__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ms-combo-btn__main:hover,
.ms-combo-btn__arrow:hover {
  background-color: #02a64d;
}

.ms-combo-btn__main:active,
.ms-combo-btn__arrow:active {
  background-color: var(--pressed-color);
}

/* Trạng thái disabled cho Combo Button */
.ms-combo-btn--disabled {
  opacity: var(--disabled-opacity);
  pointer-events: none;
  cursor: not-allowed;
}
</style>
