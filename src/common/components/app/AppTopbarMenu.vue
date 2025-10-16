<template>
  <ul
    v-if='items && visible(items)'
    role='menu'>
    <template v-for='(item, i) of items'>
      <li
        v-if='visible(item) && !item.separator'
        :key='item.label || i'
        :class='[{ "topbar-active-menuitem": activeIndex === i && !item.disabled }]'
        role='none'>
        <router-link
          v-if='item.to'
          v-ripple
          active-class='active-route'
          :class='[item.class, "p-ripple", { "p-disabled": item.disabled }]'
          exact
          role='menuitem'
          :style='item.style'
          :target='item.target'
          :to='item.to'
          @click='onMenuItemClick($event, item, i)'>
          <i :class='["layout-topbar-menuitem-icon", item.icon]'></i>
          <span class='layout-topbar-menuitem-text'>{{ item.label }}</span>
          <i
            v-if='item.items'
            class='layout-topbar-submenu-toggler pi pi-angle-down pi-fw'></i>
        </router-link>
        <a
          v-if='!item.to'
          v-ripple
          :class='[item.class, "p-ripple", { "p-disabled": item.disabled }]'
          :href='item.url || "#"'
          :style='item.style'
          :target='item.target'
          @click='onMenuItemClick($event, item, i)'>
          <i :class='["layout-topbar-menuitem-icon", item.icon]'></i>
          <span class='layout-topbar-menuitem-text'>{{ item.label }}</span>
          <i
            v-if='item.items'
            class='layout-topbar-submenu-toggler pi pi-angle-down pi-fw'></i>
        </a>
        <transition name='layout-topbar-menu'>
          <AppTopbarSubmenu
            v-show='item.items && root && activeIndex !== null ? true : activeIndex === i'
            :items='visible(item) && item.items'
            :parent-menu-item-active='activeIndex === i'
            :topbar-menu-active='topbarMenuActive'
            @topbar-submenu-click='$emit("topbar-submenu-click", $event)'></AppTopbarSubmenu>
        </transition>
      </li>
    </template>
  </ul>
</template>

<script>
export default {
  name: 'AppTopbarSubmenu',

  props: {
    items: {
      type: Array,
      default: () => []
    },

    parentMenuItemActive: {
      default: false,
      type: Boolean
    },

    root: {
      default: false,
      type: Boolean
    },

    topbarMenuActive: {
      default: false,
      type: Boolean
    }
  },

  emits: ['topbar-submenu-click'],

  data() {
    return { activeIndex: null };
  },

  methods: {
    getInk(el) {
      for (let i = 0; i < el.children.length; i++) {
        if (typeof el.children[i].className === 'string' && el.children[i].className.indexOf('p-ink') !== -1) {
          return el.children[i];
        }
      }
      return null;
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

      if (item.items) {
        this.activeIndex = index === this.activeIndex ? null : index;
      }

      this.$emit('topbar-submenu-click', {
        item: item,
        originalEvent: event
      });
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
    }
  }
};
</script>
