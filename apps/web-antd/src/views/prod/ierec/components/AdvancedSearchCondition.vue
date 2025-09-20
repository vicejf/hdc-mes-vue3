<script setup lang="ts">
import type { DefaultOptionType } from 'ant-design-vue/es/select';

import { onMounted, ref } from 'vue';

import { MinusBox } from '@vben/icons';

import { Button, Col, DatePicker, Input, InputNumber, Row, Select, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { FieldType, QueryOperator } from '../types';

//
// 类型定义
//
export interface FieldConfig {
  label?: string; // 分组名
  title: string; // 显示名
  field: string;
  type: FieldType;
  enumOptions?: DefaultOptionType[];
  init?: boolean; // 是否固定展示
}

export interface SearchCondition {
  field: string;
  operator: QueryOperator;
  value: any;
}

//
// Props & Emits
//
const props = defineProps<{
  fields: FieldConfig[];
}>();

const emit = defineEmits<{
  (e: 'search', conditions: SearchCondition[]): void;
  (e: 'reset'): void;
}>();

//
// 常量配置
//
const OPERATOR_LABELS: Record<QueryOperator, string> = {
  [QueryOperator.EQ]: '等于',
  [QueryOperator.NE]: '不等于',
  [QueryOperator.GT]: '大于',
  [QueryOperator.LT]: '小于',
  [QueryOperator.GE]: '大于等于',
  [QueryOperator.LE]: '小于等于',
  [QueryOperator.LIKE]: '包含',
  [QueryOperator.NOT_LIKE]: '不包含',
  [QueryOperator.BETWEEN]: '介于',
  [QueryOperator.IN]: '在列表中',
  [QueryOperator.NOT_IN]: '不在列表中',
};

const DEFAULT_OPERATORS: Record<FieldType, QueryOperator[]> = {
  [FieldType.STRING]: [
    QueryOperator.EQ,
    QueryOperator.NE,
    QueryOperator.LIKE,
    QueryOperator.NOT_LIKE,
  ],
  [FieldType.NUMBER]: [
    QueryOperator.EQ,
    QueryOperator.NE,
    QueryOperator.GT,
    QueryOperator.LT,
    QueryOperator.GE,
    QueryOperator.LE,
    QueryOperator.BETWEEN,
  ],
  [FieldType.DATE]: [QueryOperator.BETWEEN],
  [FieldType.BOOLEAN]: [QueryOperator.EQ, QueryOperator.NE],
  [FieldType.ENUM]: [QueryOperator.EQ, QueryOperator.NE, QueryOperator.IN, QueryOperator.NOT_IN],
};

// const operatorOptions: SelectProps['options'] = Object.entries(OPERATOR_LABELS).map(
//   ([value, label]) => ({
//     value,
//     label,
//   }),
// );

const PLACEHOLDERS: Partial<Record<FieldType, string>> = {
  [FieldType.STRING]: '输入值',
  [FieldType.NUMBER]: '输入数值',
  [FieldType.DATE]: '选择日期',
  [FieldType.BOOLEAN]: '选择状态',
  [FieldType.ENUM]: '选择选项',
};

//
// 状态管理
//
const loading = ref(false);
const conditions = ref<SearchCondition[]>([]);

onMounted(() => {
  resetConditions();
});

//
// 工具函数
//
function resetConditions() {
  conditions.value = props.fields
    .filter((f) => f.init)
    .map((f) => ({
      field: f.field,
      operator: DEFAULT_OPERATORS[f.type]?.[0] ?? QueryOperator.EQ,
      value: null,
    }));
}

function getFieldConfig(field: string): FieldConfig | undefined {
  return props.fields.find((f) => f.field === field);
}

function getOperatorsForField(fieldConfig: FieldConfig): QueryOperator[] {
  return DEFAULT_OPERATORS[fieldConfig.type] || [];
}

function getOperatorOptions(fieldConfig: FieldConfig): DefaultOptionType[] {
  const ops = getOperatorsForField(fieldConfig);
  return ops.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }));
}

function getInputType(cond: SearchCondition, field: FieldConfig): string {
  if (
    field.type === FieldType.ENUM &&
    [QueryOperator.IN, QueryOperator.NOT_IN].includes(cond.operator)
  ) {
    return 'multi-enum';
  }
  switch (field.type) {
    case FieldType.BOOLEAN: {
      return 'boolean';
    }
    case FieldType.DATE: {
      return 'date-range';
    }
    case FieldType.ENUM: {
      return 'enum';
    }
    case FieldType.NUMBER: {
      return 'number';
    }
    case FieldType.STRING: {
      return 'text';
    }
    default: {
      return 'text';
    }
  }
}

function getPlaceholder(cond: SearchCondition, field: FieldConfig): string {
  if ([QueryOperator.LIKE, QueryOperator.NOT_LIKE].includes(cond.operator)) {
    return '输入关键词';
  }
  return PLACEHOLDERS[field.type] || '输入值';
}

//
// 条件操作
//
function handleFieldChange(index: number, fieldKey: string) {
  const field = getFieldConfig(fieldKey);
  if (!field) return;
  const ops = getOperatorsForField(field);
  if (conditions.value[index]) {
    conditions.value[index].operator = ops[0] ?? QueryOperator.EQ;
    conditions.value[index].value = null;
  }
}

function addCondition() {
  if (conditions.value.length >= 9) return;
  const unused = props.fields.find((f) => !conditions.value.some((c) => c.field === f.field));
  if (unused) {
    conditions.value.push({
      field: unused.field,
      operator: DEFAULT_OPERATORS[unused.type]?.[0] ?? QueryOperator.EQ,
      value: null,
    });
  }
}

function removeCondition(index: number) {
  if (conditions.value.length > 1) {
    conditions.value.splice(index, 1);
  }
}

//
// 事件处理
//
function handleSearch() {
  loading.value = true;
  try {
    // 筛选 conditions.value 中 value 不为 null 的对象
    conditions.value = conditions.value.filter(
      (cond) => cond.value !== null && cond.value !== undefined,
    );
    const formatted = conditions.value.map((cond) => {
      const field = getFieldConfig(cond.field);
      if (!field) return cond;

      if (
        field.type === FieldType.DATE &&
        cond.operator === QueryOperator.BETWEEN &&
        Array.isArray(cond.value)
      ) {
        return {
          ...cond,
          value: dayjs(cond.value[0]).format('YYYY-MM-DD'),
          value2: dayjs(cond.value[1]).format('YYYY-MM-DD'),
        };
      }
      return cond;
    });
    emit('search', formatted);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  resetConditions();
  emit('reset');
}
</script>

<template>
  <div class="advanced-search">
    <Row>
      <Col v-for="(cond, index) in conditions" :key="index" :lg="24" :xl="12" :xxl="8">
        <Space class="site-space-compact-wrapper">
          <Space.Compact block size="middle">
            <!-- 字段选择 -->
            <Select
              v-model:value="cond.field"
              style="width: 120px"
              placeholder="选择字段"
              :options="
                props.fields.map((f) => ({
                  label: f.title,
                  value: f.field,
                  disabled: conditions.some((c) => c.field === f.field && c !== cond),
                }))
              "
              @change="(val) => handleFieldChange(index, val as string)"
            />

            <!-- 操作符选择 -->
            <Select
              v-model:value="cond.operator"
              style="width: 90px"
              placeholder="操作符"
              :options="getOperatorOptions(getFieldConfig(cond.field)!)"
            />

            <!-- 值输入区 -->
            <div style="width: 220px">
              <template v-if="getFieldConfig(cond.field)">
                <Input
                  v-if="getInputType(cond, getFieldConfig(cond.field)!) === 'text'"
                  v-model:value="cond.value"
                  :placeholder="getPlaceholder(cond, getFieldConfig(cond.field)!)"
                  allow-clear
                />

                <InputNumber
                  v-else-if="getInputType(cond, getFieldConfig(cond.field)!) === 'number'"
                  v-model:value="cond.value"
                  style="width: 100%"
                  :placeholder="getPlaceholder(cond, getFieldConfig(cond.field)!)"
                />

                <DatePicker.RangePicker
                  v-else-if="getInputType(cond, getFieldConfig(cond.field)!) === 'date-range'"
                  v-model:value="cond.value"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                />

                <Select
                  v-else-if="getInputType(cond, getFieldConfig(cond.field)!) === 'boolean'"
                  v-model:value="cond.value"
                  style="width: 100%"
                >
                  <Select-option :value="true">是</Select-option>
                  <Select-option :value="false">否</Select-option>
                </Select>

                <Select
                  v-else-if="getInputType(cond, getFieldConfig(cond.field)!) === 'enum'"
                  v-model:value="cond.value"
                  style="width: 100%"
                  :options="getFieldConfig(cond.field)?.enumOptions || []"
                />

                <Select
                  v-else-if="getInputType(cond, getFieldConfig(cond.field)!) === 'multi-enum'"
                  v-model:value="cond.value"
                  mode="multiple"
                  style="width: 100%"
                >
                  <Select-option
                    v-for="opt in getFieldConfig(cond.field)?.enumOptions || []"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </Select-option>
                </Select>
              </template>
            </div>

            <Button @click="removeCondition(index)">
              <MinusBox class="size-5" />
            </Button>
          </Space.Compact>
        </Space>
      </Col>
    </Row>

    <div class="flex mt-4 justify-between items-end gap-3">
      <Button type="primary" @click="addCondition">添加条件</Button>
      <div class="flex gap-2 self-end">
        <Button type="primary" @click="handleSearch" :loading="loading">搜索</Button>
        <Button type="primary" @click="handleReset">重置</Button>
      </div>
    </div>
  </div>
</template>
