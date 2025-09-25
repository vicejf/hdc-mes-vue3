<script lang="ts" setup>
import type { FieldConfig } from './components/AdvancedSearchCondition.vue';
import type { ElectrolyteTest } from './components/ierec';

import type { VxeGridProps, VxeGridPropTypes } from '#/adapter/vxe-table';
import type { SearchParams, UpdateParams } from '#/utils/query';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, message, Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getIerecByQueryBase, updateIerec } from '#/api/mes/prod';
import { FieldType, QueryOperator } from '#/utils/query';

import AdvancedSearchCondition from './components/AdvancedSearchCondition.vue';
import FormModal from './components/FormModal.vue';

const { Compact: SpaceCompact } = Space;

const modelValue = ref(false);
const editMode = ref(false);
const currentRecord = ref<ElectrolyteTest | null>(null);
const searchParams = ref<SearchParams>({
  where: [],
});

// 搜索字段配置
const searchFields: FieldConfig[] = [
  {
    title: '检测日期',
    field: 'test_date',
    type: FieldType.DATE,
    init: true,
  },
  {
    title: '设备编号',
    field: 'equipment_no',
    init: true,
    type: FieldType.STRING,
  },
  {
    title: '电解液型号',
    field: 'electrolyte_type',
    type: FieldType.STRING,
    init: true,
  },
  {
    title: '判定',
    field: 'overall_result',
    type: FieldType.ENUM,
    enumOptions: [
      { label: '全部', value: undefined },
      { label: '合格', value: 1 },
      { label: '不合格', value: 0 },
    ],
    init: true,
  },
  {
    title: '加新液重测',
    field: 'retest_new_solution',
    type: FieldType.BOOLEAN,
    init: false,
  },
  {
    title: '电导率',
    field: 'conductivity',
    type: FieldType.NUMBER,
    init: false,
  },
  {
    title: 'PH值',
    field: 'ph',
    type: FieldType.NUMBER,
    init: false,
  },
  {
    title: '闪火电压',
    field: 'flash_voltage',
    type: FieldType.NUMBER,
    init: false,
  },
];

const columns: VxeGridPropTypes.Columns<ElectrolyteTest> = [
  {
    title: '序号',
    type: 'seq',
    width: 60,
  },
  {
    title: 'ID',
    field: 'id',
    width: 80,
    visible: false,
  },
  {
    title: '检测日期',
    field: 'test_date',
    width: 120,
    sortable: true,
  },
  {
    title: '设备编号',
    field: 'equipment_no',
    width: 150,
  },
  {
    title: '电解液型号',
    field: 'electrolyte_type',
    width: 100,
    sortable: true,
  },
  {
    title: '温度',
    field: 'temperature',
    width: 80,
    sortable: true,
  },
  {
    title: '电导率',
    field: 'conductivity',
    width: 100,
    sortable: true,
  },
  {
    title: '编号1',
    field: 'water_id1',
    width: 120,
  },
  {
    title: '数据1(%)',
    field: 'water_data1',
    width: 120,
    sortable: true,
  },
  {
    title: '编号2',
    field: 'water_id2',
    width: 120,
  },
  {
    title: '数据2(%)',
    field: 'water_data2',
    width: 120,
    sortable: true,
  },
  {
    title: 'PH值',
    field: 'ph',
    width: 80,
    sortable: true,
  },
  {
    title: '闪火电压',
    field: 'flash_voltage',
    width: 100,
    sortable: true,
  },
  {
    title: '判定',
    field: 'overall_result',
    width: 100,
    formatter: ({ cellValue }) => {
      return cellValue === 1 ? '合格' : '不合格';
    },
    sortable: true,
  },
  {
    title: '加新液重测',
    field: 'retest_new_solution',
    width: 100,
    formatter: ({ cellValue }) => {
      return cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '操作者',
    field: 'test_operator',
    width: 100,
  },
  {
    title: '核实人',
    field: 'verifier',
    width: 100,
  },
  {
    title: '备注',
    field: 'remarks',
    visible: false,
  },
  {
    title: '创建时间',
    field: 'created_at',
    width: 160,
    formatter: 'formatDateTime',
    sortable: true,
  },
  {
    title: '更新时间',
    field: 'ts',
    width: 160,
    formatter: 'formatDateTime',
    sortable: true,
  },
  { title: '操作', width: 160, slots: { default: 'action' }, fixed: 'right' },
];

const gridOptions: VxeGridProps<ElectrolyteTest> = {
  border: true,
  showOverflow: true,
  editConfig: {
    trigger: 'click',
    mode: 'row',
  },
  // cellConfig: {
  //   height: 120,
  // },
  height: 'auto',
  columns,
  exportConfig: {},
  proxyConfig: {
    showLoading: true, // 关闭加载中
    response: {
      result: 'datas', // 配置响应结果列表字段
      total: 'totalNum', // 配置响应结果总页数字段
    },
    ajax: {
      query: async ({ page, sort }) => {
        return await getIerecByQueryBase({
          ...searchParams.value,
          page: page.currentPage,
          pageSize: page.pageSize,
          sortField: sort.field,
          sortOrder: sort.order as 'asc' | 'desc',
        });
      },
    },
    sort: true,
  },

  sortConfig: {
    defaultSort: { field: 'created_at', order: 'desc' },
    remote: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
    slots: {
      buttons: 'toolbarButtons',
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});

const handleSearch = (where: SearchParams['where']) => {
  searchParams.value.where = where;
  return gridApi.query();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchParams, {});
  return gridApi.query();
};

// 新增记录
const handleAdd = () => {
  editMode.value = false;
  currentRecord.value = null;
  modelValue.value = true;
};

// 编辑记录
const editRow = (row: ElectrolyteTest) => {
  editMode.value = true;
  currentRecord.value = row;
  modelValue.value = true;
};

// const selectRow = ref<ElectrolyteTest>();

// 删除记录
const handleDelete = (record: ElectrolyteTest) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 ${record.test_date} 检测记录吗？`,
    async onOk() {
      try {
        // updateIerec函数的where参数需要根据其实际类型定义来设置
        // 暂时使用符合SearchCondition数组类型的方式
        await updateIerec({
          where: [
            {
              field: 'id',
              operator: QueryOperator.EQ,
              value: record.id,
            },
          ],
          item: { dr: '1' },
        });
        message.success('删除成功');
        // 删除后重新加载当前页数据
        gridApi.query();
      } catch (error) {
        console.error('删除失败:', error);
        message.error('删除失败，请重试');
      }
    },
  });
};

// === 保存记录 ===
const handleSave = async (formData: { item: Partial<ElectrolyteTest> }) => {
  try {
    let payload: UpdateParams<ElectrolyteTest>;

    if (editMode.value && currentRecord.value) {
      // 编辑模式：只提交脏字段
      if (!formData.item || Object.keys(formData.item).length === 0) {
        message.info('没有修改内容');
        return;
      }

      payload = {
        where: [
          {
            field: 'id',
            operator: QueryOperator.EQ,
            value: currentRecord.value.id,
          },
        ],
        item: formData.item,
      };
    } else {
      // 新增模式：提交完整表单
      const filteredItem: Record<string, any> = { ...formData.item };
      Object.keys(filteredItem).forEach((key) => {
        const value = filteredItem[key];
        if (value === null || value === undefined || value === '') {
          delete filteredItem[key];
        }
      });

      payload = {
        where: [],
        item: filteredItem,
      };
    }

    await updateIerec(payload);
    message.success(editMode.value ? '更新成功' : '新增成功');
    modelValue.value = false;

    // 刷新数据
    gridApi.query();
  } catch (error) {
    console.error('保存失败:', error);
    message.error('保存失败，请重试');
    throw error;
  }
};

onMounted(() => {
  gridApi.query();
});
</script>

<template>
  <Page
    description="水份超过警戒线时添加同型号新液，重测水份小于警戒线，超过标准线时填写内部质量信息联络单。"
  >
    <Card class="mb-3">
      <!-- 搜索区域 -->
      <AdvancedSearchCondition :fields="searchFields" @search="handleSearch" @reset="handleReset" />
    </Card>
    <!-- 表格区域 -->
    <Grid style="width: 100%; height: 550px; overflow: hidden">
      <template #form></template>
      <template #toolbarButtons>
        <Button status="primary" @click="handleAdd">新增</Button>
      </template>
      <template #action="{ row }">
        <SpaceCompact>
          <Button type="primary" @click="editRow(row)"> 编辑 </Button>
          <Button type="primary" danger @click="handleDelete(row)"> 删除 </Button>
        </SpaceCompact>
      </template>
    </Grid>
    <!-- 表单模态框 -->
    <FormModal
      v-model:visible="modelValue"
      :edit-mode="editMode"
      :record="currentRecord"
      @save="handleSave"
      @cancel="() => (modelValue = false)"
    />
  </Page>
</template>
