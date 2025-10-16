<template>
  <ul
    v-if='items'
    class='layout-menu'
    role='menu'>
    <template v-for='(item, i) of items'>
      <li
        v-if='visible(item) && !item.separator'
        :key='item.label || i'
        :class='[{ "layout-root-menuitem": root, "active-menuitem": activeIndex === i && !item.disabled }]'
        role='none'>
        <router-link
          v-if='item.to'
          v-ripple
          v-tooltip.right='{ value: item.label, class: "layout-tooltip", disabled: !(root && isSlim() && !isMobile() && !menuActive) }'
          :class='[item.class, "p-ripple", { "p-disabled": item.disabled }, {"active-route": !item.items && startsWith(currentRoutePath, `${item.to}/`)}]'
          exact
          exact-active-class='active-route'
          role='menuitem'
          :style='item.style'
          :target='item.target'
          :to='item.to'
          @click='onMenuItemClick($event, item, i)'
          @mouseenter='onMenuItemMouseEnter(i)'>
          <AppIcon
            :class='menuMode === "static" || !root ? "mr-2" : ""'
            :name='item.icon'
            size='2'/>
          <span class='layout-menuitem-text'>{{ item.label }}</span>
          <i
            v-if='item.items'
            class='layout-submenu-toggler pi pi-angle-down pi-fw py-3 w-1rem'
            @click='toggleSubmenu($event, item, i)'></i>
        </router-link>
        <a
          v-if='!item.to'
          v-ripple
          v-tooltip.right='{ value: item.label, class: "layout-tooltip", disabled: !(root && isSlim() && !isMobile() && !menuActive) }'
          :class='[item.class, "p-ripple", { "p-disabled": item.disabled }]'
          :href='item.url || "#"'
          :style='item.style'
          :target='item.target'
          @click='onMenuItemClick($event, item, i)'
          @mouseenter='onMenuItemMouseEnter(i)'>
          <AppIcon
            :class='menuMode === "static" || !root ? "mr-2" : ""'
            :name='item.icon'
            size='2'/>
          <span class='layout-menuitem-text'>{{ item.label }}</span>
          <i
            v-if='item.items'
            class='layout-submenu-toggler pi pi-angle-down pi-fw py-3 w-1rem'
            @click='toggleSubmenu($event, item, i)'></i>
        </a>

        <transition name='layout-menu'>
          <AppSubMenu
            v-show='item.items && ((root && (!isSlim() || (isSlim() && (mobileMenuActive || activeIndex !== null))) ? true : activeIndex === i))'
            :items='visible(item) ? item.items : []'
            :menu-active='menuActive'
            :menu-mode='menuMode'
            :parent-menu-item-active='activeIndex === i'
            @menuitem-click='$emit("menuitem-click", $event)'></AppSubMenu>
        </transition>
      </li>
    </template>
  </ul>
</template>

<script>
import { startsWith } from 'lodash';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppIcon from '@/common/components/app/AppIcon.vue';
import EventBus from '@/common/helpers/event-bus';

export default {
  name: 'AppSubMenu',
  components: { AppIcon },

  props: {
    items: {
      type: Array,
      default: () => []
    },

    menuActive: Boolean,
    menuMode: {
      type: String,
      default: ''
    },

    mobileMenuActive: Boolean,
    parentMenuItemActive: {
      default: false,
      type: Boolean
    },

    root: {
      default: false,
      type: Boolean
    }
  },

  emits: ['root-menuitem-click', 'menuitem-click'],

  setup() {
    const route = useRoute();
    const currentRoutePath = computed(() => route.path);
    return { currentRoutePath };
  },

  data() {
    return { activeIndex: null };
  },

  mounted() {
    EventBus.on('reset-active-index', () => {
      if (this.menuMode === 'slim') {
        this.activeIndex = null;
      }
    });

    if (this.items && this.items.length) {
      const matchedIndex = this.items.findIndex(item => item.items && item.items.length && item.items.some(it => this.currentRoutePath === it.to));
      this.activeIndex = matchedIndex >= 0 ? matchedIndex : null;
    }
  },

  methods: {
    startsWith,
    getInk(el) {
      for (const children of el.children) {
        if (typeof children.className === 'string' && children.className.indexOf('p-ink') !== -1) {
          return children;
        }
      }
      return null;
    },

    isMobile() {
      return window.innerWidth < 1025;
    },

    isSlim() {
      return this.menuMode === 'slim';
    },

    isTablet() {
      const width = window.innerWidth;
      return width <= 1024 && width > 640;
    },

    onMenuItemClick(event, item, index) {
      if (item.disabled) {
        event.preventDefault();
        return;
      }

      //execute command
      if (item.command) {
        item.command({
          item: item,
          originalEvent: event
        });
        event.preventDefault();
      }

      if (item.items) {
        event.preventDefault();
      }

      if (this.root) {
        this.$emit('root-menuitem-click', { originalEvent: event });
      }

      if (item.items) {
        this.activeIndex = index === this.activeIndex ? null : index;
      } else {
        if (this.menuMode !== 'static') {
          const ink = this.getInk(event.currentTarget);
          if (ink) {
            this.removeClass(ink, 'p-ink-active');
          }
        }
      }

      this.$emit('menuitem-click', {
        item: item,
        originalEvent: event
      });
    },

    onMenuItemMouseEnter(index) {
      if (this.root && this.menuActive && this.menuMode === 'slim' && !this.isMobile()) {
        this.activeIndex = index;
      }
    },

    removeClass(element, className) {
      if (element.classList) {
        element.classList.remove(className);
      } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    },

    visible(item) {
      return typeof item.visible === 'function' ? item.visible() : item.visible !== false;
    },

    toggleSubmenu(e, item, index) {
      e.preventDefault();
      e.stopPropagation();

      if (item.items) {
        this.activeIndex = index === this.activeIndex ? null : index;
      }
    }
  }
};
</script>
