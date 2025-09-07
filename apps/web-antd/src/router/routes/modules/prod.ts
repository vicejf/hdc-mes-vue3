import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      badgeVariants: 'destructive',
      icon: 'streamline-flex-color:production-belt-time-flat',
      order: 10,
      title: $t('page.prod.title'),
      ignoreAccess: true,
    },
    name: 'Prod',
    path: '/Prod',
    redirect: '/prod/ierec',
    children: [
      {
        name: 'IeRec',
        path: '/prod/ierec',
        component: () => import('#/views/prod/ierec/index.vue'),
        meta: {
          badgeType: 'dot',
          badgeVariants: 'destructive',
          icon: 'lucide:file-check-2',
          title: $t('page.prod.ierec'),
          ignoreAccess: true,
        },
      },
    ],
  },
];

export default routes;
