import { MetadataStore } from './metadata-store';
import { BusinessConceptStore } from './business-concept-store';
import { metrics } from '../metrics';
import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/community/search', // 修正 URL 以匹配 community.ts 中的 request 前缀
    method: 'get',
    response: ({ query }) => {
      const { keyword } = query;
      // 初始化空结果结构，确保前端不会报错
      const emptyResult = {
        tables: [],
        concepts: { domains: [], entities: [], elements: [] },
        metrics: [],
        total: 0
      };

      if (!keyword) return { code: 200, message: 'success', data: emptyResult };

      const lowerKeyword = keyword.toLowerCase();

      // 1. 搜索物理表 (MetadataStore) —— 数据资源
      const allTables = MetadataStore.getTables();
      const matchedTables = allTables.filter(t =>
        t.name.toLowerCase().includes(lowerKeyword) ||
        (t.description && t.description.toLowerCase().includes(lowerKeyword)) ||
        (t.domain && t.domain.toLowerCase().includes(lowerKeyword)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
      );

      // 2. 搜索业务概念 (BusinessConceptStore) —— 业务要素
      const domains = BusinessConceptStore.getDomains();
      const matchedDomains = domains.filter(d => d.name.includes(keyword) || d.description.includes(keyword));

      const entities = BusinessConceptStore.getEntities();
      const matchedEntities = entities.filter(e => e.name.includes(keyword) || e.description.includes(keyword));

      const elements = BusinessConceptStore.getElements();
      const matchedElements = elements.filter(e => e.name.includes(keyword));

      // 3. 搜索指标 (metrics) —— 数据资产
      const matchedMetrics = metrics.filter(m =>
        m.name.toLowerCase().includes(lowerKeyword) ||
        (m.businessDefinition && m.businessDefinition.toLowerCase().includes(lowerKeyword)) ||
        (m.category && m.category.toLowerCase().includes(lowerKeyword)) ||
        (m.businessDomain && m.businessDomain.toLowerCase().includes(lowerKeyword))
      );

      // 4. 关联查询：通过命中的概念反查物理表
      let relatedTableNames = new Set<string>();

      matchedEntities.forEach(e => {
        const tables = BusinessConceptStore.getEntityRelatedTables(e.code);
        tables.forEach(t => relatedTableNames.add(t.name));
      });

      matchedElements.forEach(e => {
        if (e.relatedResource?.table) {
          relatedTableNames.add(e.relatedResource.table);
        }
      });

      // 合并物理表结果（直接命中 + 概念关联命中）
      const finalTables = [...matchedTables];
      const allTablesMap = new Map(allTables.map(t => [t.name, t]));

      relatedTableNames.forEach(tableName => {
        if (!finalTables.find(ft => ft.name === tableName)) {
          const table = allTablesMap.get(tableName);
          if (table) finalTables.push(table);
        }
      });

      return {
        code: 200,
        message: 'success',
        data: {
          tables: finalTables,
          concepts: {
            domains: matchedDomains,
            entities: matchedEntities,
            elements: matchedElements
          },
          metrics: matchedMetrics,
          total: finalTables.length + matchedDomains.length + matchedEntities.length + matchedElements.length + matchedMetrics.length
        }
      };
    }
  }
] as MockMethod[];
