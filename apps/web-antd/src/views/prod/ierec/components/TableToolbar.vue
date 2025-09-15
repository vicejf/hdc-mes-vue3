<script lang="ts" setup>
import { Button, Space } from 'ant-design-vue';

interface TableToolbarProps {
  onAdd: () => void;
  onRefresh: () => void;
  onReload: () => void;
}

const props = defineProps<TableToolbarProps>();

const handleAdd = () => {
  props.onAdd();
};

const handleRefresh = () => {
  props.onRefresh();
};

const handleReload = () => {
  props.onReload();
};
</script>

<template>
  <Space>
    <Button type="primary" @click="handleAdd" class="mr-2">新增</Button>
    <Button @click="handleRefresh" class="mr-2">刷新当前页面</Button>
    <Button @click="handleReload">刷新并返回第一页</Button>
  </Space>
</template>
