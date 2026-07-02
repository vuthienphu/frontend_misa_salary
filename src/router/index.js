import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SalaryCompositionForm from '@/views/SalaryCompositionForm.vue'
import SalaryCompositionUpdateForm from '@/views/SalaryCompositionUpdateForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/form',
      name: 'form',
      component: SalaryCompositionForm,
    },

    {
      path: '/form/:id',
      name: 'editSalaryComposition',
      component: SalaryCompositionUpdateForm,
    },
  ],
})

export default router
