import type { FieldType } from '#/views/prod/ierec/types';

// 查询操作符枚举
export enum QueryOperator {
  BETWEEN = 'BETWEEN', // 介于
  EQ = 'EQ', // 等于
  GE = 'GE', // 大于等于
  GT = 'GT', // 大于
  IN = 'IN', // 在列表中
  LE = 'LE', // 小于等于
  LIKE = 'LIKE', // 包含
  LT = 'LT', // 小于
  NE = 'NE', // 不等于
  NOT_IN = 'NOT_IN', // 不在列表中
  NOT_LIKE = 'NOT_LIKE', // 不包含
}

/**
 * 搜索条件接口
 */
export interface SearchCondition {
  label?: string;
  field: string;
  type?: FieldType;
  operator: QueryOperator;
  value?: any;
  value2?: any[]; // 用于 BETWEEN
}

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

  where?: SearchCondition[];
}

export type UpdateParams<T> = { item: Partial<T>; where?: SearchParams['where'] };

export interface PageResult<T> {
  currentPage: number;
  totalPage: number;
  pageNum: number;
  nextPage: boolean;
  prePage: boolean;
  totalNum: number;
  datas: T[];
}
