export interface ElectrolyteTest {
  form_number: string;
  id: string;
  test_date: string;
  inspector: string;
  electrolyte_type: string;
  remarks: string;
  temperature: number;
  conductivity: number;
  water_data1: number;
  water_data2: number;
  water_id1: string;
  water_id2: string;
  ph: number;
  flash_voltage: number;
  measurement: string;
  verifier: string;
  overall_result: boolean;
  retest_new_solution: boolean;
  created_at: string;
  ts: string;
  equipment_no: string;
  dr: string;
}

export type FormState = Omit<ElectrolyteTest, 'id' | 'remarks'>;

// 类型定义
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

// 字段类型枚举
export enum FieldType {
  BOOLEAN = 'boolean',
  DATE = 'date',
  ENUM = 'enum',
  NUMBER = 'number',
  STRING = 'string',
}
