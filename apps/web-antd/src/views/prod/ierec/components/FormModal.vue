<script lang="ts" setup>
/**
 * @displayName 电解液检测记录模态框
 * @version 2.0.0
 * @description 此组件用于编辑新增电解液检测记录
 */

import type { ElectrolyteTest, FormState } from '../types';

import { computed, reactive, ref, watch } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  Button,
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
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useDirtyForm } from '#/utils/useDirtyForm';

interface FormModalProps {
  visible: boolean;
  editMode: boolean; // true  编辑| false 新增
  record: ElectrolyteTest | null;
}

const props = defineProps<FormModalProps>();

// 定义emit事件
const emit = defineEmits<{
  (e: 'save', formData: { item: Partial<ElectrolyteTest> }): void;
  (e: 'cancel'): void;
}>();

const userStore = useUserStore();

// 默认值
const initialFormData: ElectrolyteTest = {
  equipment_no: '',
  form_number: 'MDR44A3',
  test_date: dayjs().format('YYYY-MM-DD'),
  inspector: userStore.userInfo?.realName || userStore.userInfo?.username || '',
  electrolyte_type: '',
  temperature: 0,
  conductivity: 0,
  water_data1: 0,
  water_data2: 0,
  ph: 0,
  flash_voltage: 0,
  measurement: '',
  verifier: '',
  retest_new_solution: false,
  water_id1: '',
  water_id2: '',
  overall_result: false,
  created_at: '',
  ts: '',
  dr: '0',
  id: '',
  remarks: '',
};

// 状态管理
const localvisible = ref(false);
const saving = ref(false);
const overallResult = ref<boolean>(false);
// === 使用脏表单逻辑 ===
const {
  form, // 当前表单数据（v-model 绑定用）
  setInitialForm,
  getDirtyFields,
  isDirty,
} = useDirtyForm<ElectrolyteTest>(initialFormData);

// 当 record 变化时，初始化表单
watch(
  () => props.record,
  (newVal) => {
    if (newVal) {
      setInitialForm(newVal);
    } else {
      setInitialForm(initialFormData); // 新增时重置
    }
  },
  { immediate: true },
);

// 验证规则定义
const validationRules = reactive<
  Record<
    keyof Pick<FormState, 'conductivity' | 'flash_voltage' | 'ph' | 'water_data1' | 'water_data2'>,
    { label: string; max: number; min: number; unit: string; warning: number }
  >
>({
  // 电导率标准：1.2%±0.12%ms/cm
  conductivity: { min: 1.08, max: 1.32, label: '电导率', unit: 'ms/cm', warning: 9999 },
  // 水份标准：2.3%±0.5% 警戒线2.6%
  water_data1: { min: 1.8, max: 2.8, label: '水份', unit: '%', warning: 2.6 },
  water_data2: { min: 1.8, max: 2.8, label: '水份', unit: '%', warning: 2.6 },
  // PH标准：6.8±0.3
  ph: { min: 6.5, max: 7.1, label: 'PH', unit: '', warning: 9999 },
  // 闪火电压标准：≥499V
  flash_voltage: { min: 499, max: 9999, label: '闪火电压', unit: 'V', warning: 9999 },
});

// 各个字段的验证状态
const fieldValidity = reactive<Record<keyof typeof validationRules, boolean | null>>({
  conductivity: true,
  water_data1: true,
  water_data2: true,
  ph: true,
  flash_voltage: true,
});

// 验证单个字段
const validateField = (fieldName: keyof typeof validationRules, value: number) => {
  const rule = validationRules[fieldName];
  if (!rule) return;

  // 检查值是否在范围内
  const isValid = value >= rule.min && value <= rule.max;
  fieldValidity[fieldName] = isValid;

  // 检查是否超过预警值
  if (rule.warning && value > rule.warning) {
    fieldValidity[fieldName] = false;
  }
  return isValid;
};

// 初始化时验证所有字段
const validateAllFields = () => {
  Object.keys(validationRules).forEach((field) => {
    const fieldName = field as keyof typeof validationRules;
    validateField(fieldName, form.value[fieldName]);
  });
};

// 计算总体是否合格
const isOverallValid = computed(() => {
  return Object.values(fieldValidity).every((isValid) => isValid === null || isValid === true);
});

// 监听props.visible变化，保持localvisible与props同步
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      localvisible.value = newVisible;
      if (props.editMode && props.record) {
        // 编辑
        Object.assign(form, props.record);
        // formCache.value = form;
        validateAllFields();
      }
    }
  },
);
// 点击保存
const handleOk = () => {
  if (isDirty()) {
    if (props.editMode) {
      // 编辑模式：只提交脏字段
      emit('save', { item: getDirtyFields() });
    } else {
      // 新增模式：提交整个表单（form.value）
      emit('save', { item: form.value });
    }
  } else {
    message.info('内容没有变化！');
    emit('cancel');
  }
};

// 点击取消
const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Modal
    :open="props.visible"
    :title="editMode ? '编辑检测记录' : '新增检测记录'"
    width="880px"
    height="1000px"
  >
    <Form :model="form" layout="vertical" @finish="handleOk" @cancel="handleCancel">
      <Row :gutter="16">
        <Col :span="6">
          <FormItem
            label="设备号"
            name="equipment_no"
            :rules="[{ required: true, message: '请输入设备号' }]"
          >
            <Input v-model:value="form.equipment_no" placeholder="请输入设备号" />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="电解液型号"
            name="electrolyte_type"
            :rules="[{ required: true, message: '请选择电解液型号' }]"
          >
            <Input v-model:value="form.electrolyte_type" placeholder="请输入电解液型号" />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="检测日期"
            name="test_date"
            :rules="[{ required: true, message: '请选择检测日期' }]"
          >
            <DatePicker
              v-model:value="form.test_date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              placeholder="选择检测日期"
            />
          </FormItem>
        </Col>

        <Col :span="6">
          <FormItem label="表单号" name="formNumber">
            <Input v-model:value="form.form_number" style="width: 100%" />
          </FormItem>
        </Col>
      </Row>

      <!-- 新增字段区域 -->
      <Row :gutter="16">
        <Col :span="6">
          <FormItem label="温度" name="temperature">
            <InputNumber
              v-model:value="form.temperature"
              placeholder="请输入温度"
              :min="0"
              :step="0.1"
              style="width: 100%"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="电导率 (ms/cm)"
            name="conductivity"
            help="标准值: 1.2%±0.12% ms/cm"
            :validate-status="fieldValidity.conductivity === false ? 'warning' : 'success'"
          >
            <InputNumber
              v-model:value="form.conductivity"
              placeholder="请输入电导率"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 100%"
              @change="validateField('conductivity', form.conductivity)"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="PH值"
            name="ph"
            help="标准值: 6.8±0.3"
            :validate-status="fieldValidity.ph === false ? 'warning' : 'success'"
          >
            <InputNumber
              v-model:value="form.ph"
              placeholder="请输入PH值"
              :min="0"
              :step="0.1"
              :precision="1"
              style="width: 100%"
              @change="validateField('ph', form.ph)"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="闪火电压 (V)"
            name="flashVoltage"
            help="标准值: ≥499V"
            :validate-status="fieldValidity.flash_voltage === false ? 'warning' : 'success'"
          >
            <InputNumber
              v-model:value="form.flash_voltage"
              placeholder="请输入闪火电压"
              :min="0"
              :step="1"
              style="width: 100%"
              @change="validateField('flash_voltage', form.flash_voltage)"
            />
          </FormItem>
        </Col>
      </Row>

      <!-- 水分数据字段 -->
      <Row :gutter="16">
        <Col :span="6">
          <FormItem label="编号1" name="water_id1">
            <Input v-model:value="form.water_id1" placeholder="请输入编号" />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="水份数据1 (数值%)"
            name="waterData1Value"
            help="标准：2.3%±0.5% 警戒线2.6%"
            :validate-status="fieldValidity.water_data1 === false ? 'warning' : 'success'"
          >
            <InputNumber
              v-model:value="form.water_data1"
              placeholder="请输入数值"
              :min="0"
              :step="0.001"
              :precision="3"
              style="width: 100%"
              @change="validateField('water_data1', form.water_data1)"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem label="编号2" name="water_id2">
            <Input v-model:value="form.water_id2" placeholder="请输入编号" />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            label="水份数据2 (数值%)"
            name="waterData2Value"
            help="标准：2.3%±0.5% 警戒线2.6%"
            :validate-status="fieldValidity.water_data2 === false ? 'warning' : 'success'"
          >
            <InputNumber
              v-model:value="form.water_data2"
              placeholder="请输入数值"
              :min="0"
              :step="0.001"
              :precision="3"
              style="width: 100%"
              @change="validateField('water_data2', form.water_data2)"
            />
          </FormItem>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="6">
          <FormItem label="  " name="retestWithNewSolution">
            <Checkbox v-model:checked="form.retest_new_solution"> 加新液重测 </Checkbox>
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem label="操作者" name="operator">
            <Input v-model:value="form.inspector" placeholder="请输入操作者" />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem label="核实人" name="verifier">
            <Input v-model:value="form.verifier" placeholder="请输入核实人" />
          </FormItem>
        </Col>
      </Row>
      <!-- 总体判定结果 -->
      <FormItem label="判定">
        <Tag :color="overallResult ? 'green' : 'red'" size="large">
          {{ overallResult === true ? '合格' : '不合格' }}
        </Tag>
        <div v-if="isOverallValid" style="margin-top: 8px; color: #ff4d4f">
          提示：请检查各项指标是否符合标准要求
        </div>
      </FormItem>
    </Form>
    <!-- 自定义modal footer -->
    <template #footer>
      <Button @click="handleCancel">取消</Button>
      <Button key="submit" type="primary" @click="handleOk" :loading="saving">保存</Button>
    </template>
  </Modal>
</template>
