<script setup>
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import MsInput from '@/components/MsInput.vue'
import MsDropdown from '@/components/MsDropdown.vue'
import { SalaryCompositionService } from '@/services/SalaryComposition'
import { ref, watch, onMounted } from 'vue'
import MsDropdownSearch from '@/components/MsDropdownSearch.vue'

// --- KHAI BÁO DỮ LIỆU FORM ---
const formData = ref({
  tenThanhPhan: '',
  maThanhPhan: '',
  donViApDung: ['Misa Test pdthien 2024'],
  loaiThanhPhan: 'Thông tin nhân viên',
  tinhChat: 'Thu nhập',
  loaiThue: 'chiu-thue',
  dinhMuc: '',
  vuotDinhMuc: false,
  isTaxReduction: '',
  kieuGiaTri: 'Tiền tệ',
  loaiGiaTri: 'cong-thuc',
  phamViCongTong: 'Trong cùng đơn vị công tác',
  thanhPhanCongTongId: '',
  congThucTuDat: '',
  moTa: '',
  hienThiPhieuLuong: 'co',
  nguonTao: 'Tự thêm',
})

const salaryCompositionOptions = ref([])
const salaryValue = ref('')

const loaiThanhPhanOptions = [
  { value: 'Thông tin nhân viên', label: 'Thông tin nhân viên' },
  { value: 'Chấm công', label: 'Chấm công' },
  { value: 'Doanh số', label: 'Doanh số' },
  { value: 'KPI', label: 'KPI' },
  { value: 'Sản phẩm', label: 'Sản phẩm' },
  { value: 'Lương', label: 'Lương' },
  { value: 'Thuế TNCN', label: 'Thuế TNCN' },
  { value: 'Bảo hiểm - công đoàn', label: 'Bảo hiểm - công đoàn' },
  { value: 'Khác', label: 'Khác' },
]

const tinhChatOptions = [
  { value: 'Thu nhập', label: 'Thu nhập' },
  { value: 'Khấu trừ', label: 'Khấu trừ' },
  { value: 'Khác', label: 'Khác' },
]

const kieuGiaTriOptions = [
  { value: 'Tiền tệ', label: 'Tiền tệ' },
  { value: 'Số', label: 'Số' },
  { value: 'Phần trăm', label: 'Phần trăm' },
  { value: 'Chữ', label: 'Chữ' },
  { value: 'Ngày', label: 'Ngày' },
]

const phamViOptions = [
  { value: 'Trong cùng đơn vị công tác', label: 'Trong cùng đơn vị công tác' },
  { value: 'Dưới quyền', label: 'Dưới quyền' },
  { value: 'Thuộc cơ cấu tổ chức', label: 'Thuộc cơ cấu tổ chức' },
]

// 💡 CẬP NHẬT HÀM GỌI API THEO ĐÚNG CẤU TRÚC JSON
const fetchSalaryCompositions = async () => {
  try {
    const response = await SalaryCompositionService.getSalaryCompositionAll()

    // Log hẳn response ra xem API trả về hình thù thế nào
    console.log('Response từ API:', response)

    // Lấy mảng dữ liệu (đề phòng API trả về thẳng response.data hoặc bọc trong response.data.data)
    const rawData = response.data?.data || response.data

    if (Array.isArray(rawData)) {
      salaryCompositionOptions.value = rawData.map((item) => ({
        value: item.salaryCompositionID,
        label: `${item.salaryCompositionName} (${item.salaryCompositionCode})`,
      }))
      console.log('Dữ liệu sau khi map thành công:', salaryCompositionOptions.value)
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thành phần lương từ API:', error)
  }
}

onMounted(() => {
  fetchSalaryCompositions()
})

watch(
  () => formData.value.loaiThanhPhan,
  (newVal) => {
    const specialTypes = ['Chấm công', 'KPI', 'Sản phẩm']
    if (specialTypes.includes(newVal)) {
      formData.value.tinhChat = 'Khác'
    } else {
      formData.value.tinhChat = 'Thu nhập'
    }
  },
)

watch(
  () => formData.value.tinhChat,
  (newTinhChat) => {
    if (newTinhChat === 'Thu nhập' || newTinhChat === 'Khấu trừ') {
      formData.value.kieuGiaTri = 'Tiền tệ'
    } else {
      formData.value.kieuGiaTri = 'Số'
    }
  },
)

const handleRemoveDonVi = () => {
  formData.value.donViApDung = []
}
</script>

<template>
  <main class="main-layout">
    <Navbar />
    <Sidebar />
    <div class="content">
      <div class="content__title__header">
        <div class="content__title_left">Thêm thành phần</div>
      </div>

      <!-- Thêm class form-scrollable để kích hoạt cuộn nội dung form độc lập nếu màn hình quá nhỏ -->
      <div class="candidate__wrapper form-scrollable">
        <form class="misa-form" @submit.prevent>
          <!-- Tên thành phần -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Tên thành phần <span class="required">*</span></label>
            </div>
            <div class="form-input-cell">
              <!-- Vì MsInput bên trong có sẵn thẻ label mặc định, ta chỉ lấy phần input bằng cách bỏ qua prop label -->
              <MsInput v-model="formData.tenThanhPhan" />
            </div>
          </div>

          <!-- Mã thành phần -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Mã thành phần <span class="required">*</span></label>
            </div>
            <div class="form-input-cell">
              <MsInput v-model="formData.maThanhPhan" placeholder="Nhập mã viết liền" />
            </div>
          </div>

          <!-- Đơn vị áp dụng -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Đơn vị áp dụng <span class="required">*</span></label>
            </div>
            <div class="form-input-cell">
              <MsInput
                :tags="formData.donViApDung"
                :removable-tags="true"
                readonly
                @remove-tag="handleRemoveDonVi"
              />
            </div>
          </div>

          <!-- Loại thành phần -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Loại thành phần <span class="required">*</span></label>
            </div>
            <div class="form-input-cell w-full-dropdown">
              <div class="dropdown-part w-full-dropdown">
                <MsDropdown
                  v-model:value="formData.loaiThanhPhan"
                  :options="loaiThanhPhanOptions"
                  variant="filter"
                />
              </div>
            </div>
          </div>

          <div class="form-row alignment-top">
            <div class="form-label-cell pt-2">
              <label class="form-label">Tính chất <span class="required">*</span></label>
            </div>
            <div class="form-input-cell complex-row">
              <div class="dropdown-part w-full-dropdown">
                <MsDropdown
                  v-model:value="formData.tinhChat"
                  :options="tinhChatOptions"
                  variant="filter"
                />
              </div>

              <!-- TH1: Tính chất là Thu nhập -> Hiện nhóm radio thuế -->
              <div class="radio-part" v-if="formData.tinhChat === 'Thu nhập'">
                <label class="misa-radio">
                  <input type="radio" value="chiu-thue" v-model="formData.loaiThue" />
                  <span class="radio-mark"></span>Chịu thuế
                </label>
                <label class="misa-radio">
                  <input type="radio" value="mien-toan-phan" v-model="formData.loaiThue" />
                  <span class="radio-mark"></span>Miễn thuế toàn phần
                </label>
                <label class="misa-radio">
                  <input type="radio" value="mien-mot-phan" v-model="formData.loaiThue" />
                  <span class="radio-mark"></span>Miễn thuế một phần
                </label>
              </div>

              <!-- TH2: Tính chất là Khấu trừ -> Hiện checkbox giảm trừ thuế (image_6bfcff.png) -->
              <div class="checkbox-part pl-4 pt-1" v-else-if="formData.tinhChat === 'Khấu trừ'">
                <label class="misa-checkbox">
                  <input type="checkbox" v-model="formData.giamTruKhiTinhThue" />
                  <span class="checkbox-mark"></span>
                  Giảm trừ khi tính thuế
                </label>
              </div>
            </div>
          </div>

          <!-- Định mức (Sẽ ẩn hoàn toàn khi Tính chất là 'Khác') -->
          <div class="form-row alignment-top" v-if="formData.tinhChat !== 'Khác'">
            <div class="form-label-cell pt-2">
              <label class="form-label">Định mức</label>
            </div>
            <div class="form-input-cell">
              <textarea
                v-model="formData.dinhMuc"
                class="misa-textarea"
                placeholder="Tự động gợi ý công thức và tham số khi gõ"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Cho phép vượt định mức (Sẽ ẩn hoàn toàn khi Tính chất là 'Khác') -->
          <div class="form-row" v-if="formData.tinhChat !== 'Khác'">
            <div class="form-label-cell"></div>
            <div class="form-input-cell">
              <label class="misa-checkbox">
                <input type="checkbox" v-model="formData.vuotDinhMuc" />
                <span class="checkbox-mark"></span>
                Cho phép giá trị tính vượt quá định mức
                <span class="info-icon" title="Thông tin thêm">i</span>
              </label>
            </div>
          </div>

          <!-- Kiểu giá trị (Disable khi là Thu nhập/Khấu trừ, chọn bình thường khi là Khác - image_6c5602.png) -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Kiểu giá trị</label>
            </div>
            <div class="form-input-cell w-full-dropdown">
              <div class="dropdown-part w-full-dropdown">
                <MsDropdown
                  v-model:value="formData.kieuGiaTri"
                  :options="kieuGiaTriOptions"
                  variant="filter"
                  :disabled="formData.tinhChat !== 'Khác'"
                />
              </div>
            </div>
          </div>

          <!-- Giá trị -->
          <div class="form-row alignment-top">
            <div class="form-label-cell pt-1">
              <label class="form-label">Giá trị</label>
            </div>
            <div class="form-input-cell block-cell">
              <div class="radio-sub-block">
                <label class="misa-radio">
                  <input type="radio" value="tu-dong-cong" v-model="formData.loaiGiaTri" />
                  <span class="radio-mark"></span>
                  Tự động cộng tổng giá trị của các nhân viên
                </label>

                <div class="full-width-group">
                  <div class="dropdown-group">
                    <MsDropdown
                      v-model:value="formData.phamViCongTong"
                      :options="phamViOptions"
                      variant="filter"
                      class="dropdown-fixed-width"
                      :disabled="formData.loaiGiaTri !== 'tu-dong-cong'"
                    />

                    <template v-if="formData.loaiGiaTri === 'tu-dong-cong'">
                      <MsDropdownSearch
                        v-if="salaryCompositionOptions.length > 0"
                        v-model:value="salaryValue"
                        :options="salaryCompositionOptions"
                        placeholder="Chọn thành phần lương để cộng giá trị"
                        class="dropdown-flex-fill"
                      />
                      <div
                        v-else
                        style="color: #9ca3af; font-size: 13px; padding-top: 4px"
                        class="dropdown-flex-fill"
                      >
                        Quá trình tải thành phần lương...
                      </div>
                    </template>

                    <div v-else class="dropdown-flex-fill"></div>
                  </div>
                </div>
              </div>

              <div class="radio-sub-block mt-3">
                <label class="misa-radio">
                  <input type="radio" value="cong-thuc" v-model="formData.loaiGiaTri" />
                  <span class="radio-mark"></span>
                  Tính theo công thức tự đặt
                </label>

                <div class="formula-container" v-if="formData.loaiGiaTri === 'cong-thuc'">
                  <textarea
                    v-model="formData.congThucTuDat"
                    class="misa-textarea formula-textarea"
                    placeholder="Tự động gợi ý công thức và tham số khi gõ"
                    rows="3"
                  ></textarea>
                  <div class="robot-icon-wrapper">
                    <div class="robot-avatar">🤖</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mô tả -->
          <div class="form-row alignment-top">
            <div class="form-label-cell pt-2">
              <label class="form-label">Mô tả</label>
            </div>
            <div class="form-input-cell">
              <textarea v-model="formData.moTa" class="misa-textarea" rows="3"></textarea>
            </div>
          </div>

          <!-- Hiển thị trên phiếu lương -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Hiển thị trên phiếu lương</label>
            </div>
            <div class="form-input-cell">
              <div class="radio-part">
                <label class="misa-radio">
                  <input type="radio" value="co" v-model="formData.hienThiPhieuLuong" />
                  <span class="radio-mark"></span>Có
                </label>
                <label class="misa-radio">
                  <input type="radio" value="khong" v-model="formData.hienThiPhieuLuong" />
                  <span class="radio-mark"></span>Không
                </label>
                <label class="misa-radio">
                  <input type="radio" value="khac-0" v-model="formData.hienThiPhieuLuong" />
                  <span class="radio-mark"></span>Chỉ hiển thị nếu giá trị khác 0
                </label>
              </div>
            </div>
          </div>

          <!-- Nguồn tạo -->
          <div class="form-row">
            <div class="form-label-cell">
              <label class="form-label">Nguồn tạo</label>
            </div>
            <div class="form-input-cell input-short-width">
              <MsInput v-model="formData.nguonTao" disabled />
            </div>
          </div>
        </form>
      </div>

      <div class="form-footer">
        <button type="button" class="btn-secondary">Hủy bỏ</button>
        <div class="form-footer__right">
          <button type="button" class="btn-outline">Lưu và thêm</button>
          <button type="button" class="btn-primary">Lưu</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* --- GIẢI QUYẾT VẤN ĐỀ CUỘN (SCROLL) --- */
.main-layout {
  display: flex;
  height: 100vh; /* Giới hạn chiều cao bằng màn hình */
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Không cho content chính bị tràn vỡ layout */
}

.form-scrollable {
  flex: 1;
  overflow-y: auto; /* Tự động xuất hiện thanh cuộn dọc khi form dài hơn màn hình */
  padding-right: 16px; /* Chừa khoảng trống cho thanh cuộn */
}

/* --- ĐỔI LAYOUT SANG DẠNG HÀNG NGANG (ROW) --- */
.candidate__wrapper {
  background: #ffffff;
  padding: 24px;
  border-radius: 4px;
  box-sizing: border-box;
}

.misa-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* Cấu trúc hàng ngang */
.form-row {
  display: flex;
  align-items: center; /* Căn giữa label và input theo chiều dọc */
  width: 100%;
}

/* Dành riêng cho Textarea hoặc vùng chọn phức tạp cần đẩy nhãn lên trên một chút */
.form-row.alignment-top {
  align-items: flex-start;
}

/* Độ rộng cố định cho cột chứa nhãn phía bên trái */
.form-label-cell {
  width: 180px;
  min-width: 180px;
  padding-right: 16px;
  box-sizing: border-box;
}

/* Ô nhập liệu bên phải tự động chiếm trọn phần còn lại */
.form-input-cell {
  flex: 1;
  display: flex;
  align-items: center;
}

.form-input-cell.block-cell {
  flex-direction: column;
  align-items: flex-start;
}

/* Phục vụ hàng hỗn hợp (Dropdown Tính chất + Radio Thuế) */
.complex-row {
  gap: 24px;
}

.dropdown-part,
.input-short-width :deep(.ms-input) {
  width: 280px !important; /* Định kích thước vừa vặn cho dropdown tính chất */
}

.form-label {
  color: #1f2937;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
}

/* Căn chỉnh khoảng cách bổ sung cho văn bản đi kèm nhãn */
.pt-1 {
  padding-top: 4px;
}
.pt-2 {
  padding-top: 8px;
}

/* Ép các component MsInput, MsDropdown chiếm full chiều rộng của ô chứa */
:deep(.ms-input),
.w-full-dropdown :deep(.custom-dropdown),
.w-full-dropdown :deep(.dropdown-trigger) {
  width: 100% !important;
}

/* Căn chỉnh hàng Radio */
.radio-part {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap; /* Tự xuống hàng nếu màn hình thu nhỏ */
  min-height: 36px;
}

/* Style cho Textarea */
.misa-textarea {
  width: 100%;
  border: 1px solid #dddde4;
  border-radius: 4px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.12s ease;
}

.misa-textarea:hover,
.misa-textarea:focus {
  border-color: #50b878;
}

.misa-textarea::placeholder {
  color: #9ca3af;
  font-style: italic;
}

/* Khối logic Giá trị */
.radio-sub-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.sub-dropdown {
  padding-left: 26px;
  width: 300px;
}

.mt-3 {
  margin-top: 12px;
}

/* Khung công thức kèm Robot AI */
.formula-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.formula-textarea {
  padding-right: 46px;
}

.robot-icon-wrapper {
  position: absolute;
  right: 12px;
  bottom: 12px;
}

.robot-avatar {
  width: 28px;
  height: 28px;
  background: #e6f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 1px solid #1890ff;
}

/* --- CUSTOM RADIO BUTTONS --- */
.misa-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  user-select: none;
}

.misa-radio input {
  position: absolute;
  opacity: 0;
}

.radio-mark {
  width: 18px;
  height: 18px;
  border: 1px solid #dddde4;
  border-radius: 50%;
  position: relative;
  background-color: #fff;
  box-sizing: border-box;
}

.misa-radio input:checked ~ .radio-mark {
  border-color: #50b878;
}

.misa-radio input:checked ~ .radio-mark::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #50b878;
}

/* --- CUSTOM CHECKBOX --- */
.misa-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
}

.misa-checkbox input {
  position: absolute;
  opacity: 0;
}

.checkbox-mark {
  width: 18px;
  height: 18px;
  border: 1px solid #dddde4;
  border-radius: 4px;
  position: relative;
  background-color: #fff;
}

.misa-checkbox input:checked ~ .checkbox-mark {
  border-color: #50b878;
  background-color: #50b878;
}

.misa-checkbox input:checked ~ .checkbox-mark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid #9ca3af;
  border-radius: 50%;
  font-size: 11px;
  color: #9ca3af;
  margin-left: 4px;
}

:deep(.ms-input__control) {
  border-radius: 8px !important;
}

.dropdown-group {
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
}

/* Giữ nguyên độ rộng cố định của ô phạm vi */
.dropdown-fixed-width {
  width: 280px !important;
  min-width: 280px;
  flex-shrink: 0;
}

/* Ô Search tự động dãn chiếm toàn bộ phần trống còn lại */
.dropdown-flex-fill {
  flex: 1;
  width: auto !important;
}
</style>
