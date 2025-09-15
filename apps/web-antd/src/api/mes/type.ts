import type { ElectrolyteTest } from '#/views/prod/ierec/types';

export interface SearchParams {
  /**
   * 当前页码(默认1)
   */
  page?: number;

  /**
   * 每页记录数(默认10,最大100)
   */
  pageSize?: number;

  /**
   * 排序字段(可选)
   */
  sortField?: string;

  /**
   * 排序方向(可选,asc/desc)
   */
  sortOrder?: 'asc' | 'desc';

  where?: {
    // 逻辑操作符
    $and?: Array<Record<string, any>>;
    // 比较操作符（可选扩展）
    $gt?: Record<string, Date | number>;
    $in?: Record<string, any[]>;
    $lt?: Record<string, Date | number>;
    $not?: Record<string, any>;
    $or?: Array<Record<string, any>>;
    // 精确匹配条件
    [key: string]: any;
  };
}

export type UpdateParams = Pick<SearchParams, 'where'> & { item: Partial<ElectrolyteTest> };
