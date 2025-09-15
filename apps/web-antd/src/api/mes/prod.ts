import type { SearchParams, UpdateParams } from './type';

import type { ElectrolyteTest } from '#/views/prod/ierec/types';

import { requestClient } from '#/api/request';

export namespace ProdApi {
  /**
   * 分页结果接口，与后端PageResult类对应
   */
  export interface PageResult<T> {
    currentPage: number;
    totalPage: number;
    pageNum: number;
    nextPage: boolean;
    prePage: boolean;
    totalNum: number;
    datas: T[];
  }

  export interface GetIerecParams {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: string;
    [key: string]: any;
  }

  export type updateParams = Partial<PageResult<ElectrolyteTest>>;
}

/**
 * 查询电解液检测记录（使用QueryBaseVO）
 * @param params 查询参数
 * @returns 查询结果
 */
export const getIerecByQueryBase = (params: SearchParams) => {
  return requestClient.get<ProdApi.PageResult<ElectrolyteTest>>('/prod/ierec', {
    params,
  });
};

// 更新电解液检测记录
export const updateIerec = (data: UpdateParams) => {
  return requestClient.post<string>('/prod/ierec/update', data);
};
