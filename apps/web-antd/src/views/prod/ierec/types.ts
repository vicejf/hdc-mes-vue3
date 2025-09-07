import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

export interface ElectrolyteTest {
  id: number | string;
  testDate: Dayjs;
  inspector: string;
  electrolyteType: string;
  waterContent: number;
  result: '不合格' | '合格' | '警戒';
  remarks?: string;
  temperature?: number;
  conductivity?: number;
  waterData1?: { id: string; value: number };
  waterData2?: { id: string; value: number };
  ph?: number;
  flashVoltage?: number;
  acidAmount?: number;
  measurement?: string;
  operator?: string;
  verifier?: string;
  overallResult?: '不合格' | '合格';
  retestWithNewSolution?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SearchParams = Partial<
  Pick<ElectrolyteTest, 'electrolyteType' | 'inspector' | 'result'>
> & {
  dateRange?: [Dayjs, Dayjs];
};

export const mockData: ElectrolyteTest[] = [
  {
    id: 1,
    testDate: dayjs('2024-01-15'),
    inspector: '张三',
    electrolyteType: 'A型',
    waterContent: 2.1,
    result: '合格',
    remarks: '正常检测',
    temperature: 25.5,
    conductivity: 1.28,
    waterData1: { id: 'WD001', value: 2.1 },
    waterData2: { id: 'WD002', value: 2.2 },
    ph: 6.9,
    flashVoltage: 510,
    acidAmount: 10.5,
    measurement: '标准测量',
    operator: '王五',
    verifier: '赵六',
    overallResult: '合格',
    retestWithNewSolution: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-15 10:00:00',
  },
  {
    id: 2,
    testDate: dayjs('2024-01-16'),
    inspector: '李四',
    electrolyteType: 'B型',
    waterContent: 3,
    result: '警戒',
    remarks: '需添加同型号新液',
    temperature: 26,
    conductivity: 1.15,
    waterData1: { id: 'WD003', value: 3 },
    waterData2: { id: 'WD004', value: 2.9 },
    ph: 6.4,
    flashVoltage: 480,
    acidAmount: 12,
    measurement: '异常测量',
    operator: '孙七',
    verifier: '周八',
    overallResult: '不合格',
    retestWithNewSolution: true,
    createdAt: '2024-01-16 14:30:00',
    updatedAt: '2024-01-16 14:30:00',
  },
];
