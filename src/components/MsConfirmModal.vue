<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-box" :class="type">

      <!-- Header -->
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="onCancel">x</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <slot>
          <p>{{ message }}</p>
        </slot>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="onCancel">
          {{ cancelText }}
        </button>

        <button
          class="btn"
          :class="confirmBtnClass"
          :disabled="loading"
          @click="onConfirm"
        >
          <span v-if="loading">Đang xử lý...</span>
          <span v-else>{{ confirmText }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  type: {
    type: String,
    default: 'info' // info | warning | danger
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirmBtnClass = computed(() => {
  return {
    'btn-danger': props.type === 'danger',
    'btn-warning': props.type === 'warning',
    'btn-primary': props.type === 'info'
  }
})

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  width: 420px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border-radius: 6px;
}

button{
  border-color:#d5d7da;
}

button:hover{
cursor: pointer;
}

.btn-danger { background: #e74c3c; color: white; }
.btn-warning { background: #f39c12; color: white; }
.btn-primary { background: #02b956; color: white; }
.btn-secondary { background: #ddd; }
</style>