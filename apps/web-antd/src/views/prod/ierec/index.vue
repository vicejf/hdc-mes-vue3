<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';

import type { ElectrolyteTest, SearchParams } from './types';

import { onMounted, reactive, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { mockData } from './types';

const loading = ref(false);
const dataSource = ref<ElectrolyteTest[]>([]);
const searchParams = reactive<SearchParams>({});
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

const visible = ref(false);
const editMode = ref(false);
const currentRecord = ref<ElectrolyteTest | null>(null);
const formState = reactive({
  deviceNumber: '',
  formNumber: 'MDR44A3',
  testDate: dayjs(),
  inspector: '',
  electrolyteType: '',
  waterContent: 0,
  remarks: '',
  temperature: undefined,
  conductivity: undefined,
  waterData1: { id: '', value: undefined },
  waterData2: { id: '', value: undefined },
  ph: undefined,
  flashVoltage: undefined,
  acidAmount: undefined,
  measurement: '',
  operator: '',
  verifier: '',
  retestWithNewSolution: false,
});

const overallResult = ref<'不合格' | '合格'>('合格');

const resultOptions = [
  { value: '', label: '全部' },
  { value: '合格', label: '合格' },
  { value: '警戒', label: '警戒' },
  { value: '不合格', label: '不合格' },
];

const columns: ColumnsType<ElectrolyteTest> = [
  {
    title: '检测ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '检测日期',
    dataIndex: 'testDate',
    key: 'testDate',
    width: 120,
    customRender: ({ text }) => (text ? text.format('YYYY-MM-DD') : ''),
  },
  {
    title: '检测人员',
    dataIndex: 'inspector',
    key: 'inspector',
    width: 100,
  },
  {
    title: '电解液型号',
    dataIndex: 'electrolyteType',
    key: 'electrolyteType',
    width: 100,
  },
  {
    title: '水份含量(%)',
    dataIndex: 'waterContent',
    key: 'waterContent',
    width: 120,
  },
  {
    title: '检测结果',
    dataIndex: 'result',
    key: 'result',
    width: 100,
  },
  {
    title: '水份数据1 (编号)',
    dataIndex: ['waterData1', 'id'],
    key: 'waterData1Id',
    width: 120,
  },
  {
    title: '水份数据1 (数值%)',
    dataIndex: ['waterData1', 'value'],
    key: 'waterData1Value',
    width: 120,
  },
  {
    title: '水份数据2 (编号)',
    dataIndex: ['waterData2', 'id'],
    key: 'waterData2Id',
    width: 120,
  },
  {
    title: '水份数据2 (数值%)',
    dataIndex: ['waterData2', 'value'],
    key: 'waterData2Value',
    width: 120,
  },
  {
    title: '加新液重测',
    dataIndex: 'retestWithNewSolution',
    key: 'retestWithNewSolution',
    width: 100,
  },
  {
    title: '操作者',
    dataIndex: 'operator',
    key: 'operator',
    width: 100,
  },
  {
    title: '核实人',
    dataIndex: 'verifier',
    key: 'verifier',
    width: 100,
  },
  {
    title: '操作记录',
    dataIndex: 'remarks',
    key: 'remarks',
    ellipsis: true,
  },
  {
    title: '温度',
    dataIndex: 'temperature',
    key: 'temperature',
    width: 80,
  },
  {
    title: '电导率',
    dataIndex: 'conductivity',
    key: 'conductivity',
    width: 100,
  },
  {
    title: 'PH值',
    dataIndex: 'ph',
    key: 'ph',
    width: 80,
  },
  {
    title: '闪火电压',
    dataIndex: 'flashVoltage',
    key: 'flashVoltage',
    width: 100,
  },
  {
    title: '总体结果',
    dataIndex: 'overallResult',
    key: 'overallResult',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// 计算检测结果
const calculateResult = (waterContent: number): '不合格' | '合格' | '警戒' => {
  if (waterContent < 0.015) return '合格';
  if (waterContent <= 0.02) return '警戒';
  return '不合格';
};

// 计算总体判定结果
const calculateOverallResult = () => {
  const { conductivity, waterContent, ph, flashVoltage } = formState;

  // 电导率标准：1.24±0.12ms/cm
  const conductivityMin = 1.12;
  const conductivityMax = 1.36;

  // 水份标准：2.3%±0.5%
  const waterMin = 1.8;
  const waterMax = 2.8;

  // PH标准：6.8±0.3
  const phMin = 6.5;
  const phMax = 7.1;

  // 闪火电压标准：≥499V
  const flashVoltageMin = 499;

  // 检查所有字段是否符合标准
  const isConductivityValid =
    conductivity === undefined ||
    (conductivity >= conductivityMin && conductivity <= conductivityMax);

  const isWaterValid =
    waterContent === undefined || (waterContent >= waterMin && waterContent <= waterMax);

  const isPhValid = ph === undefined || (ph >= phMin && ph <= phMax);

  const isFlashVoltageValid = flashVoltage === undefined || flashVoltage >= flashVoltageMin;

  // 所有必填字段都符合标准时判定为合格
  overallResult.value =
    isConductivityValid && isWaterValid && isPhValid && isFlashVoltageValid ? '合格' : '不合格';
};

// 监听表单字段变化，实时计算总体结果
watch(
  formState,
  () => {
    calculateOverallResult();
  },
  { deep: true },
);

// 加载数据
const loadData = () => {
  loading.value = true;
  // 模拟API调用
  setTimeout(() => {
    let filteredData = [...mockData];

    // 应用筛选条件
    if (searchParams.dateRange && searchParams.dateRange[0] && searchParams.dateRange[1]) {
      const [start, end] = searchParams.dateRange;
      filteredData = filteredData.filter((item) => item.testDate >= start && item.testDate <= end);
    }

    if (searchParams.electrolyteType) {
      filteredData = filteredData.filter(
        (item) => item.electrolyteType === searchParams.electrolyteType,
      );
    }

    if (searchParams.inspector) {
      filteredData = filteredData.filter((item) =>
        item.inspector.includes(searchParams.inspector!),
      );
    }

    if (searchParams.result) {
      filteredData = filteredData.filter((item) => item.result === searchParams.result);
    }

    dataSource.value = filteredData;
    pagination.total = filteredData.length;
    loading.value = false;
  }, 500);
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchParams, {});
  handleSearch();
};

// 新增记录
const handleAdd = () => {
  editMode.value = false;
  currentRecord.value = null;
  Object.assign(formState, {
    testDate: dayjs(),
    inspector: '',
    electrolyteType: '',
    waterContent: 0,
    remarks: '',
    temperature: undefined,
    conductivity: undefined,
    waterData1: { id: '', value: undefined },
    waterData2: { id: '', value: undefined },
    ph: undefined,
    flashVoltage: undefined,
    acidAmount: undefined,
    measurement: '',
    operator: '',
    verifier: '',
  });
  overallResult.value = '合格';
  visible.value = true;
};

// 编辑记录
const handleEdit = (record: ElectrolyteTest) => {
  editMode.value = true;
  currentRecord.value = record;
  Object.assign(formState, {
    testDate: record.testDate,
    inspector: record.inspector,
    electrolyteType: record.electrolyteType,
    waterContent: record.waterContent,
    remarks: record.remarks || '',
    temperature: record.temperature,
    conductivity: record.conductivity,
    waterData1: record.waterData1 || { id: '', value: undefined },
    waterData2: record.waterData2 || { id: '', value: undefined },
    ph: record.ph,
    flashVoltage: record.flashVoltage,
    acidAmount: record.acidAmount,
    measurement: record.measurement || '',
    operator: record.operator || '',
    verifier: record.verifier || '',
    retestWithNewSolution: record.retestWithNewSolution || false,
  });
  overallResult.value = record.overallResult || '合格';
  visible.value = true;
};

// 删除记录
const handleDelete = (record: ElectrolyteTest) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 ${record.testDate} 检测记录吗？`,
    onOk() {
      const index = mockData.findIndex((item) => item.id === record.id);
      if (index !== -1) {
        mockData.splice(index, 1);
        loadData();
        message.success('删除成功');
      }
    },
  });
};

// 保存记录
const handleSave = () => {
  const result = calculateResult(formState.waterContent);
  const now = new Date().toISOString();

  if (editMode.value && currentRecord.value) {
    // 更新记录
    const index = mockData.findIndex((item) => item.id === currentRecord.value!.id);
    if (index !== -1) {
      mockData[index] = {
        id: mockData[index]?.id ?? '',
        createdAt: mockData[index]?.createdAt ?? '',
        ...formState,
        // 确保 waterData1 和 waterData2 的 value 不为 undefined
        waterData1: {
          id: formState.waterData1.id,
          value: formState.waterData1.value ?? 0,
        },
        waterData2: {
          id: formState.waterData2.id,
          value: formState.waterData2.value ?? 0,
        },
        result: calculateResult(formState.waterContent),
        overallResult: overallResult.value,
        updatedAt: now,
      };
    }
  } else {
    // 新增记录
    const newRecord: ElectrolyteTest = {
      id: Date.now(),
      testDate: formState.testDate,
      inspector: formState.inspector,
      electrolyteType: formState.electrolyteType,
      waterContent: formState.waterContent,
      result,
      remarks: formState.remarks,
      temperature: formState.temperature,
      conductivity: formState.conductivity,
      waterData1: {
        id: formState.waterData1.id,
        value: formState.waterData1.value ?? 0,
      },
      waterData2: {
        id: formState.waterData2.id,
        value: formState.waterData2.value ?? 0,
      },
      ph: formState.ph,
      flashVoltage: formState.flashVoltage,
      acidAmount: formState.acidAmount,
      measurement: formState.measurement,
      operator: formState.operator,
      verifier: formState.verifier,
      retestWithNewSolution: formState.retestWithNewSolution,
      overallResult: overallResult.value,
      createdAt: now,
      updatedAt: now,
    };
    mockData.unshift(newRecord);
    message.success('新增成功');
  }

  visible.value = false;
  loadData();
};

// 导出CSV
const handleExport = () => {
  const headers = [
    '检测ID',
    '检测日期',
    '检测人员',
    '电解液型号',
    '水份含量',
    '检测结果',
    '温度',
    '电导率',
    {
      title: '水份数据1 (编号)',
      dataIndex: ['waterData1', 'id'],
      key: 'waterData1Id',
      width: 120,
    },
    {
      title: '水份数据1 (数值%)',
      dataIndex: ['waterData1', 'value'],
      key: 'waterData1Value',
      width: 120,
    },
    {
      title: '水份数据2 (编号)',
      dataIndex: ['waterData2', 'id'],
      key: 'waterData2Id',
      width: 120,
    },
    {
      title: '水份数据2 (数值%)',
      dataIndex: ['waterData2', 'value'],
      key: 'waterData2Value',
      width: 120,
    },
    {
      title: '加新液重测',
      dataIndex: 'retestWithNewSolution',
      key: 'retestWithNewSolution',
      width: 100,
    },
    {
      title: '操作者',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '核实人',
      dataIndex: 'verifier',
      key: 'verifier',
      width: 100,
    },
    'PH值',
    '闪火电压',
    '加酸量',
    '测量',
    '操作者',
    '核实人',
    '总体结果',
    '操作记录',
    '创建时间',
  ];
  const csvContent = [
    headers.join(','),
    ...dataSource.value.map((item) =>
      [
        item.id,
        item.testDate.format('YYYY-MM-DD'),
        item.inspector,
        item.electrolyteType,
        item.waterContent,
        item.result,
        item.temperature || '',
        item.conductivity || '',
        item.waterData1?.id || '',
        item.waterData1?.value || '',
        item.waterData2?.id || '',
        item.waterData2?.value || '',
        item.ph || '',
        item.flashVoltage || '',
        item.acidAmount || '',
        item.measurement || '',
        item.operator || '',
        item.verifier || '',
        item.overallResult || '',
        item.remarks || '',
        item.createdAt,
      ].join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `电解液检测记录_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page
    description="水份超过警戒线时添加同型号新液，重测水份小于警戒线，超过标准线时填写内部质量信息联络单。"
    title="注意"
  >
    <Card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <Row :gutter="16">
          <Col :span="6">
            <div class="search-item">
              <div class="label">检测日期：</div>
              <DatePicker.RangePicker
                v-model:value="searchParams.dateRange"
                style="width: 100%"
                :placeholder="['选择开始日期', '选择结束日期']"
              />
            </div>
          </Col>
          <Col :span="4">
            <div class="search-item">
              <div class="label">电解液型号：</div>
              <Input
                v-model:value="searchParams.electrolyteType"
                placeholder="请输入型号"
                allow-clear
              />
            </div>
          </Col>
          <Col :span="4">
            <div class="search-item">
              <div class="label">检测人员：</div>
              <Input
                v-model:value="searchParams.inspector"
                placeholder="请输入人员姓名"
                allow-clear
              />
            </div>
          </Col>
          <Col :span="4">
            <div class="search-item">
              <div class="label">检测结果：</div>
              <Select
                v-model:value="searchParams.result"
                placeholder="请选择结果"
                :options="resultOptions"
                allow-clear
              />
            </div>
          </Col>
          <Col :span="6">
            <Space style="margin-top: 29px">
              <Button type="primary" @click="handleSearch">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </Space>
          </Col>
        </Row>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-area" style="margin-top: 16px; margin-bottom: 16px">
        <Space>
          <Button type="primary" @click="handleAdd">新增</Button>
          <Button @click="handleExport">导出CSV</Button>
        </Space>
      </div>

      <!-- 表格区域 -->
      <Table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :row-key="(record) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click="handleEdit(record as ElectrolyteTest)" style="margin-right: 8px"> Edit</a>
            <a @click="handleDelete(record as ElectrolyteTest)">Delete</a>
          </template>
        </template>
      </Table>

      <!-- 表单模态框 -->
      <Modal
        v-model:visible="visible"
        :title="editMode ? '编辑检测记录' : '新增检测记录'"
        width="880px"
        :footer="null"
      >
        <Form :model="formState" layout="vertical" @finish="handleSave">
          <Row :gutter="16">
            <!-- 新增设备号字段 -->
            <Col :span="6">
              <FormItem
                label="设备号"
                name="deviceNumber"
                :rules="[{ required: true, message: '请输入设备号' }]"
              >
                <Input v-model:value="formState.deviceNumber" placeholder="请输入设备号" />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem
                label="电解液型号"
                name="electrolyteType"
                :rules="[{ required: true, message: '请选择电解液型号' }]"
              >
                <Input v-model:value="formState.electrolyteType" placeholder="请输入电解液型号" />
              </FormItem>
            </Col>
            <!-- 原检测日期字段 -->
            <Col :span="6">
              <FormItem
                label="检测日期"
                name="testDate"
                :rules="[{ required: true, message: '请选择检测日期' }]"
              >
                <DatePicker
                  v-model:value="formState.testDate"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  placeholder="选择检测日期"
                />
              </FormItem>
            </Col>

            <Col :span="6">
              <FormItem label="表单号" name="formNumber">
                <Input v-model:value="formState.formNumber" style="width: 100%" />
              </FormItem>
            </Col>
          </Row>

          <!-- 新增字段区域 -->
          <Row :gutter="16">
            <Col :span="6">
              <FormItem label="温度" name="temperature">
                <InputNumber
                  v-model:value="formState.temperature"
                  placeholder="请输入温度"
                  :min="0"
                  :step="0.1"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="电导率 (ms/cm)" name="conductivity" help="标准值: 1.2%±0.12% ms/cm">
                <InputNumber
                  v-model:value="formState.conductivity"
                  placeholder="请输入电导率"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="PH值" name="ph" help="标准值: 6.8±0.3">
                <InputNumber
                  v-model:value="formState.ph"
                  placeholder="请输入PH值"
                  :min="0"
                  :step="0.1"
                  :precision="1"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="闪火电压 (V)" name="flashVoltage" help="标准值: ≥499V">
                <InputNumber
                  v-model:value="formState.flashVoltage"
                  placeholder="请输入闪火电压"
                  :min="0"
                  :step="1"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
          </Row>

          <!-- 水分数据字段 -->
          <Row :gutter="16">
            <Col :span="6">
              <FormItem label="水份数据1 (编号)" name="waterData1Id">
                <Input v-model:value="formState.waterData1.id" placeholder="请输入编号" />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem
                label="水份数据1 (数值%)"
                name="waterData1Value"
                help="标准：2.3%±0.5% 警戒线2.6%"
              >
                <InputNumber
                  v-model:value="formState.waterData1.value"
                  placeholder="请输入数值"
                  :min="0"
                  :step="0.001"
                  :precision="3"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="水份数据2 (编号)" name="waterData2Id">
                <Input v-model:value="formState.waterData2.id" placeholder="请输入编号" />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem
                label="水份数据2 (数值%)"
                name="waterData2Value"
                help="标准：2.3%±0.5% 警戒线2.6%"
              >
                <InputNumber
                  v-model:value="formState.waterData2.value"
                  placeholder="请输入数值"
                  :min="0"
                  :step="0.001"
                  :precision="3"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
          </Row>

          <Row :gutter="16">
            <Col :span="6">
              <FormItem label="  " name="retestWithNewSolution">
                <Checkbox v-model:checked="formState.retestWithNewSolution"> 加新液重测 </Checkbox>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="操作者" name="operator">
                <Input v-model:value="formState.operator" placeholder="请输入操作者" />
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="核实人" name="verifier">
                <Input v-model:value="formState.verifier" placeholder="请输入核实人" />
              </FormItem>
            </Col>
          </Row>

          <!-- 总体判定结果 -->
          <FormItem label="总体判定结果">
            <Tag :color="overallResult === '合格' ? 'green' : 'red'" size="large">
              {{ overallResult }}
            </Tag>
            <div v-if="overallResult === '不合格'" style="margin-top: 8px; color: #ff4d4f">
              提示：请检查各项指标是否符合标准要求
            </div>
          </FormItem>

          <FormItem>
            <Space>
              <Button type="primary" html-type="submit">保存</Button>
              <Button @click="visible = false">取消</Button>
            </Space>
          </FormItem>
        </Form>
      </Modal>
    </Card>
  </Page>
</template>

<style scoped>
.search-area {
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.search-item {
  display: flex;
  flex-direction: column;
}

.label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #262626;
}

.action-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

// 在template中使用columns变量
<Table
  :dataSource="dataSource"
  :columns="columns"
  :loading="loading"
  :pagination="pagination"
  bordered
  size="middle"
  rowKey="id"
/>
