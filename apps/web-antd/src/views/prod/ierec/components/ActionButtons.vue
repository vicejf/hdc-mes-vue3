<script lang="ts" setup>
import { Button, Space } from 'ant-design-vue';

interface ActionButtonsProps {
  onAdd: () => void;
}

const props = defineProps<ActionButtonsProps>();

const handleAdd = () => {
  props.onAdd();
};
</script>

<template>
  <div class="action-area" style="margin-top: 16px; margin-bottom: 16px">
    <Space>
      <Button type="primary" @click="handleAdd">新增</Button>
    </Space>
  </div>
</template>

<style scoped>
.action-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
