import type { PageResult, SearchParams, UpdateParams } from '#/utils/query';
import type { ElectrolyteTest } from '#/views/prod/ierec/components/ierec';

import { requestClient } from '#/api/request';
import buildWhere from '#/utils/query';

/**
 * 查询电解液检测记录（使用QueryBaseVO）
 * @param params 查询参数
 * @returns 查询结果
 */
export const getIerecByQueryBase = (params: SearchParams) => {
  params.where = buildWhere(params.where); // 默认 dr=0，可被覆盖
  return requestClient.post<PageResult<ElectrolyteTest>>('/prod/ierec', params);
};

// 更新电解液检测记录
export const updateIerec = (data: UpdateParams<ElectrolyteTest>) => {
  return requestClient.post<string>('/prod/ierec/update', data);
};
