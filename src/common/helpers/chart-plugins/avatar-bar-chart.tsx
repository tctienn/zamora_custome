import type { Chart, ChartData, Plugin } from 'chart.js';
import Avatar from 'primevue/avatar';
import { type App, createApp } from 'vue';

import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';

export const useAvatarBarChart = () => {
  let avatars: App[] = [];
  const plugin: Plugin = {
    id: 'avatarBarChart',
    afterDatasetsDraw: (chart: Chart, args, options: {
      idFieldName: string,
      containerId: string
    }) => {
      const customId = chart.data[options.idFieldName as keyof ChartData] as Array<string>;
      const meta = chart.getDatasetMeta(0);
      const container = document.getElementById(options.containerId);
      meta.data.forEach((bar, index) => {
        const position = bar.getProps(['x', 'y', 'base'], true);
        let div = document.getElementById(customId[index]);
        if (!div) {
          div = document.createElement('div');
          div.id = customId[index];
          const app = createApp(AppUser, {
            userId: customId[index],
            overlayVisible: true,
          });
          app.component('AppUser', AppUser);
          app.component('AppAvatar', AppAvatar);
          // eslint-disable-next-line vue/multi-word-component-names
          app.component('Avatar', Avatar);
          app.mount(div);
          div.style.position = 'absolute';
          div.style.left = `${position.x}px`;
          div.style.top = `${position.y - 10}px`;
          container?.appendChild(div);
          avatars.push(app);
        }
      });
    },
    beforeDestroy() {
      avatars.forEach(a => a.unmount());
      avatars = [];
    },
  };
  return { plugin };
};