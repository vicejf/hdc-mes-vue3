<script lang="ts" setup>
import type { ElectrolyteTest } from './types';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { UpdateParams } from '#/api/mes/type';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, message, Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getIerecByQueryBase, updateIerec } from '#/api/mes/prod';

import ActionButtons from './components/ActionButtons.vue';
// 导入子组件
import FilterForm from './components/FilterForm.vue';
import FormModal from './components/FormModal.vue';

const modelValue = ref(false);
const editMode = ref(false);
const currentRecord = ref<ElectrolyteTest | null>(null);
const { Compact: SpaceCompact } = Space;
const searchParams = reactive<Record<string, any>>({});

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
  columns: [
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
      title: '操作记录',
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
  ],
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
          page: page.currentPage,
          pageSize: page.pageSize,
          sortField: sort.field,
          sortOrder: sort.order as 'asc' | 'desc',
          where: {
            ...searchParams,
          },
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
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});

// 搜索
const handleSearch = () => {
  gridApi.query();
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
        await updateIerec({
          where: { id: record.id },
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

// 保存记录
const handleSave = async (formData: UpdateParams) => {
  try {
    if (formData || (editMode.value && currentRecord.value)) {
      // 过滤formData.item中的空字段
      if (formData && formData.item) {
        const filteredItem: Record<string, any> = { ...formData.item };
        // 移除值为null、undefined或空字符串的字段
        Object.keys(filteredItem).forEach((key) => {
          const value = filteredItem[key];
          if (value === null || value === undefined || value === '') {
            delete filteredItem[key];
          }
        });
        // 使用过滤后的item创建新的formData
        formData = {
          where: { id: filteredItem.id },
          item: filteredItem,
        };
      }

      await updateIerec(formData);
      message.success('更新成功');
    }

    // 保存后重新加载数据，回到第一页
    gridApi.reload();
  } catch (error) {
    console.error('保存失败:', error);
    message.error('保存失败，请重试');
    throw error; // 重新抛出错误，让子组件知道保存失败
  }
};

onMounted(() => {
  gridApi.query();
});
</script>

<template>
  <Page
    description="水份超过警戒线时添加同型号新液，重测水份小于警戒线，超过标准线时填写内部质量信息联络单。"
    title="注意"
  >
    <Card>
      <!-- 搜索区域 -->
      <FilterForm :search-params="searchParams" :on-search="handleSearch" :on-reset="handleReset" />

      <!-- 操作按钮区域 -->
      <ActionButtons :on-add="handleAdd" />
    </Card>
    <div style="width: 100%; height: 500px; overflow: hidden">
      <!-- 表格区域 -->
      <Grid table-title="电解液检测记录" table-title-help="提示">
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
        :current-record="currentRecord"
        :on-save="handleSave"
      />
    </div>
  </Page>
</template>
