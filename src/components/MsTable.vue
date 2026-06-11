<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  fields: Array,
  rows: Array,
})

const headerCheckbox = ref(null)

const isAllSelected = computed(() => {
  return props.rows.length > 0 && props.rows.every((row) => row.selected)
})

const isPartialSelected = computed(() => {
  const selectedCount = props.rows.filter((row) => row.selected).length

  return selectedCount > 0 && selectedCount < props.rows.length
})

watch(
  [isAllSelected, isPartialSelected],
  () => {
    if (headerCheckbox.value) {
      headerCheckbox.value.indeterminate = isPartialSelected.value
    }
  },
  { immediate: true },
)

const toggleAll = (e) => {
  props.rows.forEach((row) => {
    row.selected = e.target.checked
  })
}
</script>

<template>
  <div class="table__wrap">
    <table>
      <!-- HEADER -->
      <thead>
        <tr>
          <th v-for="field in fields" :key="field.key" :class="field.class">
            <template v-if="field.key === 'selected'">
              <input
                ref="headerCheckbox"
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleAll"
                class="custom-checkbox"
              />
            </template>

            <template v-else>
              {{ field.label }}
            </template>
          </th>
        </tr>
      </thead>

      <!-- BODY -->
      <tbody class="table__content">
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          :class="{ 'row-selected': row.selected }"
        >
          <td v-for="field in fields" :key="field.key" :class="field.class">
            <template v-if="field.key === 'selected'">
              <input v-model="row.selected" type="checkbox" class="custom-checkbox" />
            </template>

            <slot v-else-if="$slots[field.key]" :name="field.key" :row="row" />

            <template v-else>
              <span :title="row[field.key]">
                {{ row[field.key] }}
              </span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

table td,
table th {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

tbody tr:hover {
  background-color: #eaf7ee !important;
  cursor: pointer;
}

tbody tr:hover .col__checkbox.col__sticky {
  background-color: #eaf7ee;
}

tbody tr:hover .col__action.col__sticky {
  background-color: #eaf7ee;
}

td {
  padding: 8px;
  border-bottom: 1px solid #e3e1e1;
  min-width: 202px;
  max-width: 202px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table__wrap {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: white;
}

.table__wrap table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}

.table__wrap thead th {
  top: 0;
  z-index: 0;
  background: #f6f6f6;
}

thead {
  background-color: #f6f6f6;
  font-size: 14px;
  height: 36px;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

thead th {
  padding: 0 12px;
  text-align: left;
  border-right: 1px solid #e0e0e0 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 13px;
}

thead th:last-child {
  border-right: 1px solid #e0e0e0 !important;
}

.col-checkbox {
  width: 48px;
  min-width: 48px;
  text-align: center;
  cursor: pointer;
}

.col-checkbox input[type='checkbox'] {
  width: 13px;
  height: 13px;
  cursor: pointer;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2ca01c;
}

.row-selected {
  background-color: #d8ebe2;
}

</style>
