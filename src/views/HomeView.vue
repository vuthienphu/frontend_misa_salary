<script setup>
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import MsTable from '@/components/MsTable.vue'
import MsPagination from '@/components/MsPagination.vue'
import MsDropdown from '@/components/MsDropdown.vue'
import MsButton from '@/components/MsButton.vue'
import MsTree from '@/components/MsTree.vue'
import { ref, onMounted, watch } from 'vue'
import { SalaryCompositionService } from '@/services/SalaryComposition.js'
const fields = [
  { key: 'selected', label: '', class: 'col-checkbox' },
  { key: 'salaryCompositionCode', label: 'Mã thành phần', class: 'col__code' },
  { key: 'name', label: 'Tên thành phần', class: '' },
  { key: 'unit', label: 'Đơn vị áp dụng', class: '' },
  { key: 'type', label: 'Loại thành phần', class: '' },
  { key: 'nature', label: 'Tính chất', class: '' },
  { key: 'tax', label: 'Chịu thuế', class: '' },
  { key: 'tax_deduction', label: 'Giảm trừ thuế', class: '' },
  { key: 'norm', label: 'Định mức', class: '' },
  { key: 'value_type', label: 'Kiểu giá trị', class: '' },
  { key: 'value', label: 'Giá trị', class: '' },
  { key: 'describe', label: 'Mô tả', class: '' },
  { key: 'display', label: 'Hiển thị trên phiếu lương', class: '' },
  { key: 'source', label: 'Nguồn tạo', class: '' },
  { key: 'status', label: 'Trạng thái', class: '' },
  { key: 'action', label: '', class: 'col__sticky col__action' },
]

// Quản lý trạng thái dữ liệu hiển thị trên bảng
const rows = ref([])
const isLoading = ref(false)

// Các state quản lý phân trang đồng bộ với Props của MsPagination
const totalRecords = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)

// --- QUẢN LÝ TRẠNG THÁI TÌM KIẾM ---
const searchQuery = ref('') // Từ khóa nhập vào ô input
const isDropdownOpen = ref(false) // Trạng thái ẩn/hiện dropdown gợi ý
const searchResults = ref([]) // Danh sách kết quả hiển thị ở dropdown
const isSelectedFromDropdown = ref(false) // Đánh dấu nếu vừa click chọn từ dropdown



// Hàm map dữ liệu dùng chung tránh lặp code
const mapResponseData = (dataArray) => {
  return (dataArray || []).map((item) => ({
    ...item,
    salaryCompositionCode: item.salaryCompositionCode,
    name: item.salaryCompositionName,
    unit: item.organizationNames,
    type: item.compositionType,
    nature: item.natureType,
    tax: item.taxType,
    tax_deduction: item.isTaxReduction,
    norm: item.quotaFormula,
    value_type: item.dataType,
    value: item.aggregationScope,
    describe: item.description,
    display: item.isVisibleOnPayslip,
    source: item.sourceType,
    status: item.isActive,
  }))
}

// Hàm gọi API load dữ liệu
const loadSalaryData = async () => {
  isLoading.value = true
  try {
    let response

    // Nếu đang thực hiện tìm kiếm
    if (searchQuery.value.trim()) {
      response = await SalaryCompositionService.getSearchPaging(
        currentPage.value,
        pageSize.value,
        searchQuery.value,
      )
    }
    // Nếu không tìm kiếm, quay về bộ lọc trạng thái hoặc lấy toàn bộ
    else if (!status.value || status.value === 'all') {
      response = await SalaryCompositionService.getPaging(currentPage.value, pageSize.value)
    } else {
      response = await SalaryCompositionService.getFilterPaging(
        currentPage.value,
        pageSize.value,
        status.value,
      )
    }

    if (response && response.isSuccess) {
      const resultData = response.data || {}
      rows.value = mapResponseData(resultData.data)
      totalRecords.value = resultData.total || 0
    }
  } catch (error) {
    console.error('Lỗi kết nối API:', error)
  } finally {
    isLoading.value = false
  }
}

// Xử lý sự kiện khi người dùng gõ vào ô tìm kiếm
let debounceTimer = null
const handleSearchInput = () => {
  // Khi người dùng thay đổi text sau khi chọn, hủy trạng thái "đã chọn" đi để mở lại dropdown
  isSelectedFromDropdown.value = false

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    isDropdownOpen.value = false
    currentPage.value = 1
    loadSalaryData()
    return
  }

  isDropdownOpen.value = true

  // Debounce tránh spam API khi gõ liên tục
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      // Gọi API search cố định pageSize = 10 và pageIndex = 1 để lấy danh sách gợi ý nhanh
      const response = await SalaryCompositionService.getSearchPaging(1, 10, searchQuery.value)
      if (response && response.isSuccess) {
        const resultData = response.data || {}
        searchResults.value = mapResponseData(resultData.data)
      }
    } catch (error) {
      console.error('Lỗi gọi API tìm kiếm gợi ý:', error)
    }
  }, 350)
}

// Xử lý khi bấm chọn 1 dòng từ danh sách gợi ý
const selectSearchItem = (item) => {
  searchQuery.value = item.salaryCompositionCode // Đưa mã lên ô input
  isDropdownOpen.value = false
  isSelectedFromDropdown.value = true // Đánh dấu đã chọn thành công

  // Hiển thị trực tiếp bản ghi vừa chọn lên bảng ngay lập tức
  rows.value = [item]
  totalRecords.value = 1
  currentPage.value = 1
}

// Hàm bấm nút X xóa nhanh từ khóa để quay lại danh sách tổng ban đầu
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isDropdownOpen.value = false
  isSelectedFromDropdown.value = false
  currentPage.value = 1
  loadSalaryData()
}

// Đóng dropdown khi click ra ngoài ô input
const closeDropdown = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

// Lắng nghe sự kiện chuyển trang hoặc đổi số lượng bản ghi/trang để tải lại dữ liệu
const handlePageChange = () => {
  loadSalaryData()
}

const handlePageSizeChange = () => {
  loadSalaryData()
}

// Khởi chạy load dữ liệu lần đầu tiên khi vào trang
onMounted(() => {
  loadSalaryData()
})

const handleEditClick = (row) => {
  console.log('Sửa:', row)
}

const handleDeleteClick = (row) => {
  console.log('Xóa:', row)
}

const status = ref('all')
const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Đang theo dõi', label: 'Đang theo dõi' },
  { value: 'Ngừng theo dõi', label: 'Ngừng theo dõi' },
]

watch(status, () => {
  searchQuery.value = '' // Reset thanh tìm kiếm khi đổi bộ lọc trạng thái
  searchResults.value = []
  isSelectedFromDropdown.value = false
  currentPage.value = 1
  loadSalaryData()
})
</script>

<template>
  <main>
    <Navbar />
    <Sidebar />
    <div class="content">
      <div class="content__title__header">
        <div class="content__title_left">Thành phần lương</div>
        <div class="content__title_right">
          <ms-button variant="secondary">
            <template #icon>
              <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </template>
            Danh mục của hệ thống
          </ms-button>

          <ms-button
            variant="combo"
            @click="handleCreateClick"
            @dropdown-click="handleCreateDropdownClick"
          >
            Thêm
          </ms-button>
        </div>
      </div>
      <div class="candidate__wrapper">
        <div class="toolbar__grid">
          <div class="toolbar__left">
            <div class="toolbar__search" style="position: relative">
              <div class="mi__icon__toolbar__search"></div>
              <input
                type="text"
                class="toolbar__search-input"
                placeholder="Tìm kiếm"
                v-model="searchQuery"
                @input="handleSearchInput"
                @focus="isDropdownOpen = searchQuery.trim().length > 0 && !isSelectedFromDropdown"
                @blur="closeDropdown"
                style="padding-right: 32px"
              />

              <span v-if="searchQuery" class="search-clear-btn" @mousedown="clearSearch">✕</span>

              <div
                v-if="isDropdownOpen && searchResults.length > 0"
                class="search-autocomplete__dropdown"
              >
                <div
                  v-for="(item, index) in searchResults"
                  :key="index"
                  class="search-autocomplete__item"
                  @mousedown="selectSearchItem(item)"
                  :title="`${item.salaryCompositionCode} - ${item.name}`"
                >
                  <span class="item__code">{{ item.salaryCompositionCode }}</span>
                  <span class="item__divider">-</span>
                  <span class="item__name">{{ item.salaryCompositionName }}</span>
                </div>
              </div>
            </div>
              <MsDropdown
                v-model:value="status"
                :options="statusOptions"
                placeholder="Trạng thái"
                variant="filter"
                :disable-search="true"
              />
             <MsTree/>
            
          </div>
          <div class="toolbar__right">
            <div class="button-group">
              <div class="tooltip-container">
                <button class="icon-button">
                  <svg viewBox="0 0 24 24" class="icon">
                    <path
                      d="M4.25 5.61C4.1 5.43 4 5.2 4 4.95V4.25C4 3.56 4.56 3 5.25 3h13.5c.69 0 1.25.56 1.25 1.25v.7c0 .25-.1.48-.25.66l-5.75 6.47v6.67c0 .34-.14.67-.38.91l-2 2A1.25 1.25 0 0 1 9.5 20.8v-6.92L3.75 7.41z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <span class="tooltip-text">Bộ lọc</span>
              </div>

              <div class="tooltip-container">
                <button class="icon-button">
                  <svg viewBox="0 0 24 24" class="icon">
                    <path
                      d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3-1.07-3-3s1.07-3 3-3 3 1.07 3 3-1.07 3-3 3z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <span class="tooltip-text">Cài đặt</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="table-loading">Đang tải dữ liệu thành phần lương...</div>

        <MsTable v-else :fields="fields" :rows="rows">
          <template #selected="{ row }">
            <input type="checkbox" v-model="row.selected" />
          </template>

          <template #status="{ row }">
            <div
              class="status-badge"
              :class="
                row.status?.toLowerCase() === 'đang theo dõi' ? 'status-active' : 'status-inactive'
              "
            >
              <span class="status-dot"></span>
              {{ row.status }}
            </div>
          </template>

          <template #action="{ row }">
            <div class="action__group">
              <div class="button__wrapper">
                <div
                  class="mi__icon__tracking"
                  title="Đang theo dõi"
                  @click="handleEditClick(row)"
                ></div>
              </div>
              <div class="button__wrapper">
                <div class="mi__icon__copy" title="Nhân bản" @click="handleEditClick(row)"></div>
              </div>
              <div class="button__wrapper">
                <div class="mi__icon__edit" title="Sửa" @click="handleEditClick(row)"></div>
              </div>
              <div class="button__wrapper">
                <div class="mi__icon__delete" title="Xóa" @click="handleDeleteClick(row)"></div>
              </div>
            </div>
          </template>
        </MsTable>
        <MsPagination
          :total-records="totalRecords"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </div>
  </main>
</template>

<style>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Đang theo dõi */
.status-active {
  color: #00a65a;
  background: #e8f8ef;
  border-color: #86d8a7;
}

.status-active .status-dot {
  background: #00a65a;
}

/* Ngừng theo dõi */
.status-inactive {
  color: #f08a00;
  background: #fff7e8;
  border-color: #f4c57a;
}

.status-inactive .status-dot {
  background: #f08a00;
}

/* Container thanh tìm kiếm */
.toolbar__search {
  position: relative;
  width: 320px;
}

/* Khung bọc danh sách dropdown đổ xuống */
.search-autocomplete__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 280px;
  background-color: #ffffff;
  border: 1px solid #babec5;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 999;
  overflow-y: auto;
}

/* Từng dòng bản ghi trong menu gợi ý */
.search-autocomplete__item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hiệu ứng hover dòng */
.search-autocomplete__item:hover {
  background-color: #ebedf0;
}

.item__code {
  font-weight: 500;
}

.item__divider {
  margin: 0 6px;
  color: #707070;
}

.item__name {
  color: #555;
}

/* Nút xóa nhanh chữ trong ô input */
.search-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #9e9e9e;
  font-size: 12px;
  padding: 4px;
  user-select: none;
}

.search-clear-btn:hover {
  color: #333;
}

/* Container chứa 2 nút bấm */
.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Base style cho button (Bo góc, viền xám nhạt) */
.icon-button {
  width: 36px;
  height: 36px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #5f6368;
  transition: all 0.2s ease;
}

/* Hiệu ứng khi hover vào nút bấm */
.icon-button:hover {
  background-color: #ebedf0;
  border-color: #ccc;
}

/* Icon định dạng size */
.icon {
  width: 20px;
  height: 20px;
}

/* --- Phần xử lý Tooltip --- */
.tooltip-container {
  position: relative;
  display: inline-block;
}

/* Style cho khung đen của tooltip giống MISA */
.tooltip-text {
  visibility: hidden;
  position: absolute;
  z-index: 10;
  top: 130%; /* Đẩy tooltip xuống dưới nút bấm */
  left: 50%;
  transform: translateX(-50%);

  /* Màu nền đen xám, text trắng */
  background-color: #212529;
  color: #ffffff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;

  /* Hiệu ứng mờ dần (Fade-in) */
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  pointer-events: none; /* Tránh cản trở chuột */
}

/* Hiển thị tooltip khi hover vào vùng container */
.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.toolbar__dropdown__group{
  display: flex;
  gap: 8px;
}
</style>
