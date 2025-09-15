<script lang="ts" setup>
import type { SearchParams } from '../types';

import { Button, Col, DatePicker, Input, Row, Select, Space } from 'ant-design-vue';

interface FilterFormProps {
  searchParams: SearchParams;
  onSearch: () => void;
  onReset: () => void;
}

const props = defineProps<FilterFormProps>();

const searchParams = props.searchParams;

const resultOptions = [
  { value: '', label: '全部' },
  { value: '合格', label: '合格' },
  { value: '不合格', label: '不合格' },
];

const handleSearch = () => {
  props.onSearch();
};

const handleReset = () => {
  props.onReset();
};
</script>

<template>
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
            v-model:value="searchParams.electrolyte_type"
            placeholder="请输入型号"
            allow-clear
          />
        </div>
      </Col>
      <Col :span="4">
        <div class="search-item">
          <div class="label">检测人员：</div>
          <Input v-model:value="searchParams.inspector" placeholder="请输入人员姓名" allow-clear />
        </div>
      </Col>
      <Col :span="4">
        <div class="search-item">
          <div class="label">检测结果：</div>
          <Select
            v-model:value="searchParams.test_result"
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
</style>
