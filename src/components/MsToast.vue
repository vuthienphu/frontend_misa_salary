<template>
  <div class="toast-container">
    <transition-group tag="div" name="toast">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <span class="icon">
          <i v-if="toast.type === 'success'">✔</i>
          <i v-if="toast.type === 'error'">✖</i>
        </span>
        <span class="message">{{ toast.message }}</span>
        <button class="close" @click="removeToast(toast.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from "vue";

let id = 0;
const toasts = ref([]);

function showToast(message, type = "success", duration = 1000) {
  const toast = {
    id: id++,
    message,
    type,
  };

  toasts.value.push(toast);

  setTimeout(() => {
    removeToast(toast.id);
  }, duration);
}

function removeToast(toastId) {
  const index = toasts.value.findIndex(t => t.id === toastId);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

// expose để gọi từ bên ngoài
defineExpose({
  showToast,
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

.toast {
  display: flex;
  align-items: center;
  min-width: 220px;
  max-width: 350px;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background-color: #4caf50;
}

.toast.error {
  background-color: #f44336;
}

.icon {
  margin-right: 8px;
  font-size: 14px;
}

.message {
  flex: 1;
}

.close {
  margin-left: 8px;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
}

/* animation */
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.toast-leave-from {
  opacity: 1;
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
</style>