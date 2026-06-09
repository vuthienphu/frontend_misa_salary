
import api from './api';

export const SalaryCompositionService = {
  /**
   * Lấy danh sách cấu trúc lương có phân trang
   * URL sinh ra sẽ có dạng: /SalaryComposition/Paging?pageIndex=1&pageSize=10
   */
  getPaging(pageIndex = 1, pageSize = 15) {
    return api.get('/SalaryComposition/Paging', {
      params: {
        pageIndex,
        pageSize
      }
    });
  },

  getFilterPaging(pageIndex = 1, pageSize = 15,isActive='') {
    return api.get('/SalaryComposition/filter', {
      params: {
        pageIndex,
        pageSize,
        isActive
      }
    });
  },

  getSearchPaging(pageIndex = 1, pageSize = 15,searchValue='') {
    return api.get('/SalaryComposition/search', {
      params: {
        pageIndex,
        pageSize,
        searchValue
      }
    });
  },

  getSalaryCompositionAll() {
    return api.get('/SalaryComposition');
  },
  

};