
import api from './api';

export const OrganizationService = {

  getOrganizationAll() {
    return api.get('/Organization');
  },

};