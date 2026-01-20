import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MonitorTarget, MonitorRule, MonitorSchedule, MonitorRun, Alert } from '@/types/monitor';
import { apiService } from '@/services/api';

export const useMonitorStore = defineStore('monitor', () => {
  const targets = ref<MonitorTarget[]>([]);
  const rules = ref<MonitorRule[]>([]);
  const schedules = ref<MonitorSchedule[]>([]);
  const runs = ref<MonitorRun[]>([]);
  const alerts = ref<Alert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activeTargets = computed(() => targets.value.filter(t => t.active));
  const recentRuns = computed(() => runs.value.slice(0, 50));
  const openAlerts = computed(() => alerts.value.filter(a => a.state === 'open'));

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  // Load data from API
  const loadTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      targets.value = await apiService.getTargets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      rules.value = await apiService.getRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      schedules.value = await apiService.getSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      runs.value = await apiService.getRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runs');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      alerts.value = await apiService.getAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations
  const addTarget = async (target: Omit<MonitorTarget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newTarget = await apiService.createTarget(target);
      targets.value.push(newTarget);
      return newTarget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create target');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTarget = async (id: string, updates: Partial<MonitorTarget>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTarget = await apiService.updateTarget(id, updates);
      const index = targets.value.findIndex(t => t.id === id);
      if (index !== -1) {
        targets.value[index] = updatedTarget;
      }
      return updatedTarget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update target');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTarget = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteTarget(id);
      targets.value = targets.value.filter(t => t.id !== id);
      rules.value = rules.value.filter(r => r.targetId !== id);
      schedules.value = schedules.value.filter(s => s.targetId !== id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete target');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRule = async (rule: Omit<MonitorRule, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newRule = await apiService.createRule(rule);
      rules.value.push(newRule);
      return newRule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (id: string, updates: Partial<MonitorRule>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRule = await apiService.updateRule(id, updates);
      const index = rules.value.findIndex(r => r.id === id);
      if (index !== -1) {
        rules.value[index] = updatedRule;
      }
      return updatedRule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteRule(id);
      rules.value = rules.value.filter(r => r.id !== id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (schedule: Omit<MonitorSchedule, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newSchedule = await apiService.createSchedule(schedule);
      schedules.value.push(newSchedule);
      return newSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<MonitorSchedule>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSchedule = await apiService.updateSchedule(id, updates);
      const index = schedules.value.findIndex(s => s.id === id);
      if (index !== -1) {
        schedules.value[index] = updatedSchedule;
      }
      return updatedSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteSchedule(id);
      schedules.value = schedules.value.filter(s => s.id !== id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const triggerRun = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const newRun = await apiService.triggerRun(targetId);
      runs.value.unshift(newRun);
      return newRun;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger run');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAlert = await apiService.updateAlert(id, updates);
      const index = alerts.value.findIndex(a => a.id === id);
      if (index !== -1) {
        alerts.value[index] = updatedAlert;
      }
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    targets,
    rules,
    schedules,
    runs,
    alerts,
    loading,
    error,
    
    // Computed
    activeTargets,
    recentRuns,
    openAlerts,
    
    // Actions
    setLoading,
    setError,
    loadTargets,
    loadRules,
    loadSchedules,
    loadRuns,
    loadAlerts,
    addTarget,
    updateTarget,
    deleteTarget,
    addRule,
    updateRule,
    deleteRule,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    triggerRun,
    updateAlert,
  };
});