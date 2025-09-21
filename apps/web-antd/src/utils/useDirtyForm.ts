import { ref } from 'vue';

import isEqual from 'lodash.isequal';

/**
 * 通用脏表单字段检测 Composable
 * @param initialForm 初始表单数据（通常在表单初始化时传入，比如首次打开弹窗、加载数据时）
 * @returns {
 *   setInitialForm: (form: T) => void,     // 手动设置初始表单（可选，一般自动在 use 时设置）
 *   initialForm: Ref<T | null>,             // 当前保存的初始表单（只读）
 *   form: Ref<T>,                           // 当前表单数据（需由外部传入或绑定）
 *   getDirtyFields: () => Partial<T>,       // 获取当前修改过的字段（脏字段）
 *   isDirty: () => boolean,                 // 是否有字段被修改
 * }
 */
export function useDirtyForm<T extends Record<string, any>>(initialForm: T) {
  // 保存初始表单数据（深拷贝一份，避免引用污染）
  const initialFormRef = ref<null | T>(null);

  // 当前表单数据（由调用方传入或绑定，比如你的 formState）
  const formRef = ref<T>({ ...initialForm });

  // 初始化：设置初始表单
  const setInitialForm = (form: T) => {
    initialFormRef.value = { ...form };
    formRef.value = { ...form };
  };

  // 如果初始化时已经传入了 initialForm，则直接设置
  setInitialForm(initialForm);

  /**
   * 获取所有被修改的字段（脏字段）
   * 只有当当前值与初始值不相等时（使用 isEqual 深度比较），才认为是脏字段
   */
  const getDirtyFields = (): Partial<T> => {
    const dirty: Partial<T> = {};
    const initial = initialFormRef.value;
    const current = formRef.value;

    if (!initial) return dirty;

    for (const key in initial) {
      const currentValue = current[key as keyof T];
      const initialValue = initial[key as keyof T];

      if (!isEqual(currentValue, initialValue)) {
        dirty[key as keyof T] = currentValue;
      }
    }

    return dirty;
  };

  /**
   * 判断表单是否有任何字段被修改
   */
  const isDirty = (): boolean => {
    return Object.keys(getDirtyFields()).length > 0;
  };

  return {
    // 初始表单（只读，用于调试或对比）
    initialForm: initialFormRef,
    // 当前表单数据（你需要绑定你的 formState 到这个 ref 上，或者直接操作 formRef）
    form: formRef,
    // 设置初始表单（一般在数据加载后手动调用，如果构造函数传入了 initialForm 则已自动设置）
    setInitialForm,
    // 获取脏字段（推荐在提交时调用）
    getDirtyFields,
    // 是否有修改（方便按钮是否启用等场景）
    isDirty,
  };
}
