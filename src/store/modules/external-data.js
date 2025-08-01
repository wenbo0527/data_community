import { defineStore } from 'pinia';
import axios from 'axios';
import { useBudgetStore } from './budget';
export const useExternalDataStore = defineStore('externalData', {
    state: () => ({
        burndownData: [],
        warningData: [],
        targetLoanOptions: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchBurndownData(params = {}) {
            this.loading = true;
            try {
                const response = await axios.get('/api/external-data/burndown', { params });
                const typedResponse = response.data;
                this.burndownData = typedResponse.data;
            }
            catch (error) {
                this.error = { message: error.message };
            }
            finally {
                this.loading = false;
            }
        },
        async fetchWarningData(params = {}) {
            this.loading = true;
            try {
                const response = await axios.get('/api/external-data/warning', { params });
                const typedResponse = response.data;
                this.warningData = typedResponse.data;
            }
            catch (error) {
                this.error = { message: error.message };
            }
            finally {
                this.loading = false;
            }
        },
        async fetchTargetLoanOptions() {
            try {
                const budgetStore = useBudgetStore();
                const { data } = await budgetStore.fetchBudgetList({ page: 1, pageSize: 100 });
                this.targetLoanOptions = [...new Set(data.map(item => item.targetLoan))].sort((a, b) => a - b);
            }
            catch (error) {
                this.error = { message: error.message };
            }
        },
        clearError() {
            this.error = null;
        }
    }
});
