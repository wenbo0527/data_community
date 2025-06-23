import { defineStore } from 'pinia';
import axios from 'axios';
export const useBudgetStore = defineStore('budget', {
    state: () => ({
        budgetList: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchBudgetList(params) {
            this.loading = true;
            try {
                const response = await axios.get('/api/budget/list', { params });
                const typedResponse = response.data;
                return typedResponse.data;
            }
            catch (error) {
                this.error = { message: error.message };
                throw error;
            }
            finally {
                this.loading = false;
            }
        },
        async uploadBudget(file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await axios.post('/api/budget/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            }
            catch (error) {
                this.error = { message: error.message };
                throw error;
            }
        },
        async deleteBudget(id) {
            try {
                const response = await axios.delete(`/api/budget/${id}`);
                return response.data;
            }
            catch (error) {
                this.error = { message: error.message };
                throw error;
            }
        },
        clearError() {
            this.error = null;
        }
    }
});
