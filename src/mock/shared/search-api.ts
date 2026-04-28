import { MetadataStore } from './metadata-store';
import { BusinessConceptStore } from './business-concept-store';
import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/community/search',
    method: 'get',
    response: ({ query }) => {
      const { keyword, include, exclude, module, type, domain, favorites } = query;
      const emptyResult = { 
        documents: [], 
        notifications: [], 
        total: 0,
        tables: [],
        concepts: { domains: [], entities: [], elements: [] }
      };

      let allTables = MetadataStore.getTables();
      let domains = BusinessConceptStore.getDomains();
      let entities = BusinessConceptStore.getEntities();
      let elements = BusinessConceptStore.getElements();

      const lowerKeyword = keyword?.toLowerCase() || '';

      // 1. 按模块筛选
      const moduleFilter = module ? module.toLowerCase() : 'all';
      const shouldSearchTables = moduleFilter === 'all' || moduleFilter === 'table';
      const shouldSearchConcepts = moduleFilter === 'all' || moduleFilter === 'concept';
      const shouldSearchMetrics = moduleFilter === 'all' || moduleFilter === 'metric';

      // 2. 基础关键词搜索
      if (lowerKeyword) {
        if (shouldSearchTables) {
          allTables = allTables.filter(t => 
            t.name.toLowerCase().includes(lowerKeyword) || 
            (t.description && t.description.toLowerCase().includes(lowerKeyword)) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
          );
        }
        if (shouldSearchConcepts) {
          domains = domains.filter(d => 
            d.name.includes(keyword) || (d.description && d.description.includes(keyword)));
          entities = entities.filter(e => 
            e.name.includes(keyword) || (e.description && e.description.includes(keyword)));
          elements = elements.filter(e => e.name.includes(keyword));
        }
      }

      // 3. 按数据类型（type）筛选
      if (type) {
        const typeLower = type.toLowerCase();
        if (typeLower === 'table' || typeLower === 'external') {
          allTables = allTables.filter(t => t.type === typeLower);
        }
      }

      // 4. 按业务域筛选
      if (domain) {
        allTables = allTables.filter(t => t.domain === domain);
        domains = domains.filter(d => d.name === domain);
      }

      // 5. 包含（include）筛选 - 结果必须包含指定的值
      if (include) {
        const includeTerms = Array.isArray(include) ? include : [include];
        includeTerms.forEach(term => {
          const lowerTerm = term.toLowerCase();
          allTables = allTables.filter(t => 
            t.name.toLowerCase().includes(lowerTerm) ||
            (t.description && t.description.toLowerCase().includes(lowerTerm)) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerTerm)))
          );
          entities = entities.filter(e =>
            e.name.includes(term) || (e.description && e.description.includes(term))
          );
        });
      }

      // 6. 剔除（exclude）筛选 - 结果不能包含指定的值
      if (exclude) {
        const excludeTerms = Array.isArray(exclude) ? exclude : [exclude];
        excludeTerms.forEach(term => {
          const lowerTerm = term.toLowerCase();
          allTables = allTables.filter(t => 
            !t.name.toLowerCase().includes(lowerTerm) &&
            !(t.description && t.description.toLowerCase().includes(lowerTerm)) &&
            !(t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerTerm)))
          );
          entities = entities.filter(e =>
            !e.name.includes(term) && !(e.description && e.description.includes(term))
          );
        });
      }

      // 7. 关注的资产筛选
      if (favorites === 'true') {
        // 从 localStorage 获取关注的资产列表
        let favoriteAssets: string[] = [];
        try {
          const stored = ''; // 在实际环境中会从 localStorage 获取
          if (stored) {
            favoriteAssets = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Failed to parse favorite assets:', e);
        }
        
        // 如果有关注的资产，则筛选出这些资产
        if (favoriteAssets.length > 0) {
          const favoriteSet = new Set(favoriteAssets);
          allTables = allTables.filter(t => favoriteSet.has(t.name));
          entities = entities.filter(e => favoriteSet.has(e.code));
          domains = domains.filter(d => favoriteSet.has(d.code));
        } else {
          // 如果没有关注的资产，返回空结果
          allTables = [];
          entities = [];
          domains = [];
          elements = [];
        }
      }

      // 8. 关联查询：通过命中的概念反查物理表
      let relatedTableNames = new Set<string>();
      
      if (shouldSearchTables) {
        entities.forEach(e => {
          const tables = BusinessConceptStore.getEntityRelatedTables(e.code);
          tables.forEach(t => relatedTableNames.add(t.name));
        });
        
        elements.forEach(e => {
          if (e.relatedResource?.table) {
            relatedTableNames.add(e.relatedResource.table);
          }
        });

        // 合并物理表结果（直接命中 + 概念关联命中）
        const finalTables: any[] = [...allTables];
        const allTablesMap = new Map(MetadataStore.getTables().map(t => [t.name, t]));
        
        relatedTableNames.forEach(tableName => {
          if (!finalTables.find(ft => ft.name === tableName)) {
            const table = allTablesMap.get(tableName);
            if (table) finalTables.push(table);
          }
        });
        allTables = finalTables;
      }

      return {
        code: 200,
        message: 'success',
        data: {
          ...emptyResult,
          tables: allTables,
          concepts: {
            domains,
            entities,
            elements
          },
          total: allTables.length + domains.length + entities.length + elements.length
        }
      };
    }
  }
] as MockMethod[];
