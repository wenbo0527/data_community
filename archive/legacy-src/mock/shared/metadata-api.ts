import { MetadataStore } from './metadata-store';
import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/metadata/tables',
    method: 'get',
    response: ({ query }) => {
      let list = MetadataStore.getTables();
      // 这里可以根据 query 增加一些通用的过滤逻辑
      return {
        code: 200,
        message: 'success',
        data: {
          list,
          total: list.length
        }
      };
    }
  },
  {
    url: '/api/metadata/tables',
    method: 'post',
    response: ({ body }) => {
      const newTable = MetadataStore.addTable(body);
      return {
        code: 200,
        message: 'success',
        data: newTable
      };
    }
  },
  {
    url: '/api/metadata/tables/:name',
    method: 'put',
    response: ({ query, body }) => {
      const updatedTable = MetadataStore.updateTable(query.name, body);
      if (updatedTable) {
        return {
          code: 200,
          message: 'success',
          data: updatedTable
        };
      }
      return {
        code: 404,
        message: 'Table not found',
        data: null
      };
    }
  }
] as MockMethod[];
