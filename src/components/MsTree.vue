<template>
  <DxDropDownBox
    class="ms-tree"
    v-model:value="treeBoxValue"
    :show-clear-button="true"
    :data-source="flatList"
    :value-expr="keyExpr"
    :display-expr="displayExpr"
    placeholder="Tất cả đơn vị"
    field-template="field"
  >
    <template #field="{ value }">
      <span v-if="selectedNames.length === 0" class="placeholder">Tất cả đơn vị</span>
      <div class="custom-item" style="padding: 4px">
        <DxTextBox :value="value" :read-only="true" />
        <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 100%">
          <template v-for="(name, index) in visibleFilterItems" :key="index">
            <div class="filter-item">
              {{ name }}
              <button class="filter-item-close" @click="removeFilterItem(index)">x</button>
            </div>
          </template>
          <div v-if="hiddenFilterCount > 0" class="filter-item">+{{ hiddenFilterCount }}</div>
        </div>
      </div>
    </template>
    <template #content>
      <!-- Search above level-1 nodes -->
      <div class="ms-tree-search">
        <i class="icon icon-search"></i>
        <MsInput v-model="searchText" class="ms-tree-search-input" placeholder="Tìm kiếm" />
      </div>
      <DxTreeView
        ref="treeViewRef"
        :data-source="treeData"
        :key-expr="keyExpr"
        :display-expr="displayExpr"
        :items-expr="itemsExpr"
        :selection-mode="'multiple'"
        show-check-boxes-mode="normal"
        :select-nodes-recursive="true"
        :select-by-click="true"
        :search-enabled="true"
        :search-mode="'contains'"
        :search-expr="displayExpr"
        :search-value="searchText"
        expand-all-enabled
        @content-ready="treeViewContentReady"
        @item-selection-changed="treeViewItemSelectionChanged"
      >
      </DxTreeView>
    </template>
  </DxDropDownBox>
</template>

<script setup lang="ts">
import { ref, onMounted, computed,watch } from 'vue'
import DxDropDownBox from 'devextreme-vue/drop-down-box'
import DxTreeView, { type DxTreeViewTypes } from 'devextreme-vue/tree-view'
import DxTextBox from 'devextreme-vue/text-box'
import MsInput from '@/components/MsInput.vue'


const props = defineProps({
  dataSource: { type: Array as any, default: null },
  keyExpr: { type: String, default: 'organizationID' },
  displayExpr: { type: String, default: 'organizationName' },
  itemsExpr: { type: String, default: 'items' },
  selectionMode: { type: String as any, default: 'multiple' },
  inline: { type: Boolean, default: false },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const treeBoxValue =  ref<any[]>([...props.modelValue])// chứa danh sách ID đã chọn (đa lựa chọn)
const organizationData = ref<any[]>([]) // dữ liệu dạng cây
const treeViewRef = ref()
const isSyncing = ref(false)
const didFirstExpand = ref(false)
const searchText = ref('')

const treeData = computed<any[]>(() =>
  props.dataSource ? (props.dataSource as any[]) : organizationData.value,
)
const flatList = computed<any[]>(() => flattenTree(treeData.value, [], props.itemsExpr))

// Đệ quy để chuyển đổi dữ liệu cây thành danh sách phẳng
function flattenTree(
  nodes: any[],
  result: any[] = [],
  itemsKey: string = 'items',
  parentId: string | null = null,
) {
  for (const node of nodes) {
    const id = node[props.keyExpr]
    const name = node[props.displayExpr]
    result.push({
      [props.keyExpr]: id,
      [props.displayExpr]: name,
      parentId,
    })
    const children = node[itemsKey]
    if (children && children.length) {
      flattenTree(children, result, itemsKey, id)
    }
  }
  return result
}

// Đồng bộ trạng thái TreeView khi mở dropdown
function treeViewContentReady() {
  syncTreeViewSelection()
  expandRootNodesOnce() // Mở rộng các node cấp 1 lần đầu tiên
}

// Đồng bộ trạng thái chọn của TreeView
function syncTreeViewSelection() {
  const treeView = treeViewRef.value?.instance
  if (!treeView) return
  if (isSyncing.value) return
  isSyncing.value = true
  try {
    treeView.unselectAll()
    treeBoxValue.value?.forEach((val: string) => {
      treeView.selectItem(val)
    })
  } finally {
    isSyncing.value = false
  }
}

// Xử lý khi tick/untick checkbox
function treeViewItemSelectionChanged(e: DxTreeViewTypes.ItemSelectionChangedEvent) {
  if (isSyncing.value) return
  const treeView = e.component
  const node: any = (e as any).node
  if (node) {
    toggleChildrenSelection(treeView, node, node.selected) // Chọn/bỏ chọn toàn bộ con
  }
  const keys = treeView.getSelectedNodeKeys() // Cập nhật danh sách ID đã chọn
  treeBoxValue.value = keys
  emit('update:modelValue', keys)
}

// Mở rộng các node cấp 1 (cha) chỉ một lần khi mở dropdown
function expandRootNodesOnce() {
  if (didFirstExpand.value) return
  const treeView = treeViewRef.value?.instance
  if (!treeView) return
  const idKey = props.keyExpr as string
  try {
    const roots = (flatList.value || [])
      .filter((n: any) => n.parentId == null)
      .map((n: any) => n[idKey])
    roots.forEach((id: any) => treeView.expandItem(id))
    didFirstExpand.value = true
  } catch (err) {
    didFirstExpand.value = true // Bỏ qua lỗi để không chặn tương tác người dùng
  }
}

// Đệ quy chọn/bỏ chọn các node con
function toggleChildrenSelection(treeView: any, node: any, selected: boolean) {
  if (!node || !node.children || !node.children.length) return
  isSyncing.value = true
  try {
    node.children.forEach((child: any) => {
      if (selected) treeView.selectItem(child.key)
      else treeView.unselectItem(child.key)
      toggleChildrenSelection(treeView, child, selected) // Tiếp tục đệ quy
    })
  } finally {
    isSyncing.value = false
  }
}

// Hiển thị tên các node đã chọn
const selectedNames = computed(() => {
  const idKey = props.keyExpr as string
  const nameKey = props.displayExpr as string
  const ids = new Set<string>(
    Array.isArray(treeBoxValue.value) ? (treeBoxValue.value as any[]).map((x) => String(x)) : [],
  )
  if (!flatList.value?.length || ids.size === 0) return []

  type NodeInfo = { id: string; name: string; parentId: string | null }
  const byId = new Map<string, NodeInfo>()
  const childrenByParent = new Map<string | null, string[]>()
  for (const raw of flatList.value as any[]) {
    const idStr = String(raw[idKey])
    const parentIdStr = raw.parentId == null ? null : String(raw.parentId)
    const nameStr = String(raw[nameKey] ?? '')
    byId.set(idStr, { id: idStr, name: nameStr, parentId: parentIdStr })
    if (!childrenByParent.has(parentIdStr)) childrenByParent.set(parentIdStr, [])
    childrenByParent.get(parentIdStr)!.push(idStr)
  }

  const parentsToDisplay = new Set<string>()
  childrenByParent.forEach((childIds, parentId) => {
    if (parentId == null) return
    if (!childIds || childIds.length === 0) return
    const parentSelected = ids.has(parentId)
    const allChildrenSelected = childIds.every((cid) => ids.has(cid))
    if (parentSelected || allChildrenSelected) parentsToDisplay.add(parentId)
  })

  function hasAncestorInSet(nodeId: string, set: Set<string>): boolean {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (set.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }
  const effectiveParents = new Set<string>()
  parentsToDisplay.forEach((pid) => {
    if (!hasAncestorInSet(pid, parentsToDisplay)) effectiveParents.add(pid)
  })

  function isCoveredByDisplayedParent(nodeId: string): boolean {
    let cur = byId.get(nodeId)
    while (cur && cur.parentId != null) {
      if (effectiveParents.has(cur.parentId)) return true
      cur = byId.get(cur.parentId)
    }
    return false
  }

  const displayIds = new Set<string>()
  effectiveParents.forEach((pid) => displayIds.add(pid))
  ids.forEach((sid) => {
    if (!isCoveredByDisplayedParent(sid) && !displayIds.has(sid)) displayIds.add(sid)
  })

  const result: string[] = []
  for (const raw of flatList.value as any[]) {
    const idStr = String(raw[idKey])
    if (displayIds.has(idStr)) result.push(String(raw[nameKey] ?? ''))
  }
  return result
})

const MAX_VISIBLE_ITEMS = 1 // Số lượng tối đa các mục hiển thị

const visibleFilterItems = computed(() => {
  return selectedNames.value.slice(0, MAX_VISIBLE_ITEMS)
})

const hiddenFilterCount = computed(() => {
  return selectedNames.value.length > MAX_VISIBLE_ITEMS
    ? selectedNames.value.length - MAX_VISIBLE_ITEMS
    : 0
})

function removeFilterItem(index: number) {
  const idToRemove = treeBoxValue.value[index]
  treeBoxValue.value.splice(index, 1)

  emit('update:modelValue', [...treeBoxValue.value])

  const treeView = treeViewRef.value?.instance
  if (treeView) {
    treeView.unselectItem(idToRemove)
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    treeBoxValue.value = [...(newValue || [])]

    syncTreeViewSelection()
  },
  { deep: true },
)

watch(
  treeBoxValue,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true },
)
</script>

<style>
.dx-treeview-toggle-item-visibility {
  background-image: url('../assets/icons/download2.svg');
  background-repeat: no-repeat;
  background-position: -53px -336px !important;
  width: 14px !important;
  height: 8px !important;
}
.dx-treeview-toggle-item-visibility.dx-treeview-toggle-item-visibility-opened {
  mask-position: -102px -42px;
  width: 16px;
  height: 16px;
}
.dx-dropdowneditor-icon {
  background-image: url('../assets/icons/download2.svg');
  background-repeat: no-repeat;
  background-position: -53px -336px !important;
  width: 14px !important;
  height: 8px !important;
}
.dx-texteditor-input-container {
  display: none !important;
}
.custom-item .dx-texteditor-input-container {
  display: none;
}
.dx-texteditor.dx-editor-outlined {
  border-radius: 8px !important;
}
</style>

<style scoped>
.placeholder {
  color: #9e9e9e;
  padding: 8px;
}
.ms-tree {
  width: var(--ms-tree-width, 350px);
  white-space: nowrap; /* Ngăn không cho xuống dòng */
  overflow: hidden; /* Ẩn nội dung tràn */
  text-overflow: ellipsis; /* Thêm dấu "..." khi nội dung tràn */
}

/* Thanh tìm kiếm phía trên cây */
.ms-tree-search {
  position: relative;
  padding: 6px 8px 4px 8px;
  border-bottom: 1px solid #eee;
}
.ms-tree-search .icon-search {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
  pointer-events: none;
}
.ms-tree-search-input {
  width: 100%;
}
:deep(.ms-tree-search-input input) {
  height: 28px;
  line-height: 28px;
  padding-left: 40px; /* Chừa khoảng trống cho icon tìm kiếm bên trong input */
  box-sizing: border-box;
}
/* Hỗ trợ thêm class input của PrimeVue nếu MsInput bao bọc nó */
:deep(.ms-tree-search-input .p-inputtext) {
  padding-left: 40px;
  box-sizing: border-box;
}
/* Hiệu ứng hover/focus: viền input chuyển sang màu xanh lá */
:deep(.ms-tree-search-input .p-inputtext:hover),
:deep(.ms-tree-search-input .p-inputtext:focus),
:deep(.ms-tree-search-input input:hover),
:deep(.ms-tree-search-input input:focus) {
  border-color: #34b057 !important;
}
/* Ẩn trình tìm kiếm mặc định của DevExtreme TreeView; sử dụng MsInput thay thế */
:deep(.dx-treeview-search) {
  display: none !important;
}

.custom-item-label {
  margin: 8px;
  padding-right: 32px;
  border-radius: 4px;
}

/* Đảm bảo chiều rộng phản hồi – thu nhỏ trên các màn hình nhỏ hơn */
@media (max-width: 1200px) {
  :deep(.ms-tree-dd) {
    width: clamp(260px, 28vw, 340px);
  }
}
@media (max-width: 992px) {
  :deep(.ms-tree-dd) {
    width: clamp(220px, 26vw, 320px);
  }
}
@media (max-width: 576px) {
  :deep(.ms-tree-dd) {
    width: clamp(180px, 48vw, 280px);
  }
}

/* Tuỳ chỉnh checkbox của DevExtreme TreeView thành nền xanh lá và dấu tick trắng */
:deep(.dx-treeview .dx-checkbox .dx-checkbox-icon) {
  border-color: #d1d5db; /* Màu xám nhạt mặc định */
}

:deep(.dx-checkbox .dx-checkbox-icon) {
  background-color: #fff; /* Nền khi chưa chọn */
  border-color: #d1d5db; /* Viền khi chưa chọn */
  background-image: none !important;
}
/* Hiệu ứng hover: viền checkbox chuyển sang màu xanh lá */
:deep(.dx-checkbox.dx-state-hover .dx-checkbox-icon),
:deep(.dx-treeview .dx-checkbox.dx-state-hover .dx-checkbox-icon),
:deep(.dx-treeview .dx-checkbox:hover .dx-checkbox-icon) {
  border-color: #34b057 !important;
}
/* Trạng thái đã chọn: nền xanh lá + viền xanh lá, dấu tick trắng */
:deep(.dx-checkbox-checked .dx-checkbox-icon) {
  background-color: #34b057;
  border-color: #34b057 !important;
  color: #fff !important;
  font: 16px / 1 DXIcons !important;
}
/* Trạng thái trung gian (chọn một phần): giữ checkbox trắng, không có thanh màu */
:deep(.dx-checkbox-indeterminate .dx-checkbox-icon) {
  background-color: #fff;
  border-color: #d1d5db;
}
:deep(.dx-checkbox-indeterminate .dx-checkbox-icon::before) {
  background-color: transparent !important;
  border-color: transparent !important;
}

:deep(.dx-checkbox-container .dx-checkbox-icon) {
  width: 16px !important;
  height: 16px !important;
  border: 1px solid #666666;
}
/* Dấu tick trắng khi đã chọn */
:deep(.dx-treeview .dx-checkbox-checked .dx-checkbox-icon::before) {
  border-color: #fff; /* DevExtreme vẽ dấu tick qua viền */
}
/* Thanh trắng cho trạng thái trung gian */
:deep(.dx-treeview .dx-checkbox-indeterminate .dx-checkbox-icon::before) {
  background-color: #fff;
}

/* Tuỳ chỉnh các mục filter */
.filter-item {
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-flex; /* Đảm bảo các mục nằm trên cùng một dòng */
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* Ngăn không cho xuống dòng */
  overflow: hidden; /* Ẩn nội dung tràn */
  text-overflow: ellipsis; /* Thêm dấu "..." khi nội dung tràn */
}

.filter-item-close {
  background: none;
  border: none;
  color: #212121;
  cursor: pointer;
  font-size: 12px;
}

.filter-item-close:hover {
  color: #212121;
}
</style>
