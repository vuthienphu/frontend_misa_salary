<template>
  <div class="ms-input">
    <label v-if="label" class="ms-input__label" :for="inputId">
      {{ label }} <span v-if="required" class="ms-input__required">*</span>
    </label>

    <div class="ms-input__control" :class="controlClass" @click="focusInput">
      <div v-if="tags.length" class="ms-input__tags">
        <span v-for="tag in tags" :key="tag" class="ms-input__tag">
          {{ tag }}
          <button
            v-if="removableTags && !readonly && !disabled"
            type="button"
            class="ms-input__tag-remove"
            @click.stop="$emit('remove-tag', tag)"
          >
            x
          </button>
        </span>
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        class="ms-input__field base-input__field"
        :class="{ 'no-border': noBorder }"
        :type="type"
        :placeholder="placeholder"
        :value="tags.length ? '' : modelValue"
        :readonly="readonly"
        :disabled="disabled"
        @input="onInput"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />

      <span v-if="loading" class="ms-input__loading" aria-hidden="true"></span>
      <span v-else-if="valid && !error" class="ms-input__valid" aria-hidden="true"></span>
      <span v-else-if="error" class="ms-input__error-icon" aria-hidden="true">!</span>

      <button
        v-if="searchable"
        type="button"
        class="ms-input__search"
        :disabled="disabled || readonly"
        @click.stop="$emit('search')"
      >
        <span aria-hidden="true"></span>
      </button>
    </div>

    <p v-if="error" class="ms-input__error base-input__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  error: String,
  noBorder: Boolean,
  required: Boolean,
  readonly: Boolean,
  disabled: Boolean,
  loading: Boolean,
  valid: Boolean,
  searchable: Boolean,
  tags: {
    type: Array,
    default: () => []
  },
  removableTags: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'blur',
  'focus',
  'input',
  'search',
  'remove-tag'
])

const inputRef = ref(null)
const inputId = `ms-input-${Math.random().toString(36).slice(2, 9)}`

const controlClass = computed(() => ({
  'ms-input__control--error': props.error,
  'ms-input__control--readonly': props.readonly,
  'ms-input__control--disabled': props.disabled,
  'ms-input__control--valid': props.valid && !props.error,
  'ms-input__control--search': props.searchable,
  'ms-input__control--tags': props.tags.length,
  'ms-input__control--no-border': props.noBorder
}))

const focusInput = () => {
  if (!props.disabled && !props.readonly) inputRef.value?.focus()
}

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event.target.value)
}
</script>

<style scoped>
.ms-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.ms-input__label {
  color: #1f2937;
  font-weight: 600;
  line-height: 20px;
}

.ms-input__required {
  color: #ff4d4f;
}

.ms-input__control {
  align-items: center;
  background: #fff;
  border: 1px solid #dddde4;
  border-radius: 4px;
  display: flex;
  min-height: 36px;
  overflow: hidden;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
  width: 100%;
}

.ms-input__control:hover,
.ms-input__control:focus-within {
  border-color: #50b878;
}

.ms-input__control:focus-within {
  box-shadow: 0 0 0 1px rgba(80, 184, 120, 0.18);
}

.ms-input__control--error,
.ms-input__control--error:hover,
.ms-input__control--error:focus-within {
  border-color: #ff4d4f;
  box-shadow: none;
}

.ms-input__control--readonly,
.ms-input__control--disabled {
  background: #ebebeb;
  border-color: #e0e0e0;
}

.ms-input__control--readonly:hover,
.ms-input__control--disabled:hover {
  border-color: #e0e0e0;
}

.ms-input__control--valid {
  border-color: #36c76f;
}

.ms-input__control--no-border,
.ms-input__control--no-border:hover,
.ms-input__control--no-border:focus-within {
  border-color: transparent;
  box-shadow: none;
}

.ms-input__field {
  background: transparent;
  border: 0;
  color: #1f2937;
  flex: 1;
  height: 34px;
  min-width: 0;
  outline: none;
  padding: 0 12px;
  width: 100%;
}

.ms-input__field::placeholder {
  color: #9ca3af;
}

.ms-input__field:disabled {
  color: #6b7280;
  cursor: default;
  opacity: 1;
}

.ms-input__tags {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 8px;
}

.ms-input__tag {
  align-items: center;
  background: #f0f0f0;
  border-radius: 4px;
  color: #1f2937;
  display: inline-flex;
  gap: 6px;
  height: 26px;
  padding: 0 8px;
}

.ms-input__control--readonly .ms-input__tag,
.ms-input__control--disabled .ms-input__tag {
  background: #e0e0e0;
  color: #6b7280;
}

.ms-input__tag-remove {
  background: transparent;
  border: 0;
  color: rgba(107, 114, 128, 0.56);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}

.ms-input__loading,
.ms-input__valid,
.ms-input__error-icon {
  flex: 0 0 auto;
  margin-right: 12px;
}

.ms-input__loading {
  animation: ms-input-spin 0.8s linear infinite;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  border-right-color: #36c76f;
  height: 22px;
  width: 22px;
}

.ms-input__valid {
  border: 2px solid #36c76f;
  border-radius: 50%;
  height: 22px;
  position: relative;
  width: 22px;
}

.ms-input__valid::after {
  border: solid #36c76f;
  border-width: 0 2px 2px 0;
  content: '';
  height: 9px;
  left: 7px;
  position: absolute;
  top: 3px;
  transform: rotate(45deg);
  width: 5px;
}

.ms-input__error-icon {
  align-items: center;
  border: 2px solid #ff4d4f;
  border-radius: 50%;
  color: #ff4d4f;
  display: inline-flex;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  width: 22px;
}

.ms-input__search {
  align-self: stretch;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  flex: 0 0 36px;
  justify-content: center;
  padding: 0;
}

.ms-input__search:hover {
  background: #f2f2f2;
}

.ms-input__search:active {
  background: #e0e0e0;
}

.ms-input__search span {
  border: 3px solid #6b7280;
  border-radius: 50%;
  height: 18px;
  margin-top: 8px;
  position: relative;
  width: 18px;
}

.ms-input__search span::after {
  background: #6b7280;
  content: '';
  height: 9px;
  position: absolute;
  right: -5px;
  top: 11px;
  transform: rotate(-45deg);
  width: 3px;
}

.ms-input__error {
  color: #ff4d4f;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
}

.no-border {
  border: none !important;
}

@keyframes ms-input-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
