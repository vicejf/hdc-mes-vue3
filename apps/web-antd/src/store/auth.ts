import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(params: Recordable<any>, onSuccess?: () => Promise<void> | void) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(userInfo?.homePath || preferences.app.defaultHomePath);
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } catch (error) {
      // 捕获错误并从错误对象中提取具体错误信息
      const errorData = (error as any)?.msg || {};
      // 尝试获取后端返回的具体错误消息

      notification.error({
        description: errorData,
        duration: 3,
        message: $t('authentication.loginFailure'),
      });
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    try {
      userInfo = await getUserInfoApi();
    } catch {
      // 捕获异常，重定向到登录页
      await logout();
      return null;
    }
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /**
   * 通过URL参数自动登录
   * @param token 从URL获取的token
   * @param redirectPath 登录后重定向的路径
   */
  async function autoLoginByUrlParams(token: string, redirectPath?: string) {
    try {
      if (!token) return false;

      // 设置accessToken
      accessStore.setAccessToken(token);

      // 获取用户信息和权限码
      const [userInfo, accessCodes] = await Promise.all([fetchUserInfo(), getAccessCodesApi()]);

      if (!userInfo) return false;

      accessStore.setAccessCodes(accessCodes);
      accessStore.setLoginExpired(false);

      // 跳转到指定路径或默认首页
      const targetPath = redirectPath || userInfo.homePath || preferences.app.defaultHomePath;
      await router.push(targetPath);

      if (userInfo.realName) {
        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo.realName}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }

      return true;
    } catch (error) {
      console.error('Auto login by URL params failed:', error);
      notification.error({
        description: $t('authentication.autoLoginFailed'),
        duration: 3,
        message: $t('authentication.loginFailure'),
      });
      return false;
    }
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    autoLoginByUrlParams,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
