import application from './application.json';
import authentication from './authentication.json';
import common from './common.json';
import components from './components.json';
import dashboardWidget from './dashboardWidget.json';
import menu from './menu.json';
import notification from './notification.json';

export default {
  common,
  application,
  authentication,
  components,
  dashboardWidget,
  system: { menu: menu },
  notification,
};
