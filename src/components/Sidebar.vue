<script setup>
import { ref, onMounted } from 'vue'
import '@/assets/css/style.css'

const activeItem = ref('candidate');
const isCollapsed = ref(false)

// Toggle sidebar
const toggleCompact = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarActive', isCollapsed.value)
}

// Load trạng thái khi vào trang
onMounted(() => {
  const saved = localStorage.getItem('sidebarActive')
  if (saved === 'true') {
    isCollapsed.value = true
  }
})
</script>


<template>
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
        <div class="sidebar__list">
            <div class="sidebar__menu">
                <div class="sidebar__menu__item"
                    :class="{ 'sidebar__menu__item--active': activeItem === 'dashboard' }"
                    @click="activeItem = 'dashboard'">
                    <div class="mi__icon__dashboard"></div>
                    <div class="menu__item__text">Tổng quan</div>
                </div>
                <div class="sidebar__menu__item" :class="{ 'sidebar__menu__item--active': activeItem === 'candidate' }"
                    @click="activeItem = 'candidate'">
                    <div class="sidebar__menu_item__icon mi__icon__salary__composition"></div>
                    <div class="menu__item__text">Thành phần lương</div>
                </div>
                <div class="sidebar__menu__item" :class="{ 'sidebar__menu__item--active': activeItem === 'calendar' }"
                    @click="activeItem = 'calendar'">
                    <div class="sidebar__menu_item__icon mi__icon__salary__template"></div>
                    <div class="menu__item__text">Mẫu bảng lương</div>
                </div>
                <div class="sidebar__menu__item" :class="{ 'sidebar__menu__item--active': activeItem === 'talent' }"
                    @click="activeItem = 'talent'">
                    <div class="sidebar__menu_item__icon mi__icon__salary__data"></div>
                    <div class="menu__item__text">Dữ liệu tính lương</div>
                    <div class="arrow-right">></div>
                </div>
                <div class="sidebar__menu__item" :class="{ 'sidebar__menu__item--active': activeItem === 'campaign' }"
                    @click="activeItem = 'campaign'">
                    <div class="sidebar__menu_item__icon mi__icon__salary__table"></div>
                    <div class="menu__item__text">Tính lương</div>
                    <div class="arrow-right">></div>
                </div>
                <div class="sidebar__menu__item" :class="{ 'sidebar__menu__item--active': activeItem === 'task' }"
                    @click="activeItem = 'task'">
                    <div class="sidebar__menu_item__icon mi__icon__payment"></div>
                    <div class="menu__item__text">Chi trả</div>
                    <div class="arrow-right">></div>
                </div>
                <div class="sidebar__menu__item" 
                :class="{ 'sidebar__menu__item--active': activeItem === 'report' }"
                    @click="activeItem = 'report'">
                    <div class="sidebar__menu_item__icon mi__icon__report"></div>
                    <div class="menu__item__text">Báo cáo</div>
                </div>

               
            </div>
            <div class="sidebar__toggle" @click="toggleCompact">
                <div class="sidebar__toggle__icon"></div>
            </div>
        </div>

    </div>
</template>