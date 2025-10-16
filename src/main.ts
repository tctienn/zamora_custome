import 'material-symbols/outlined.scss';
import 'quill/dist/quill.core.css';
import '@/common/assets/styles.scss';
import '@/common/assets/sass/overrides/_custom_style.scss';
import 'vue3-tree-org/lib/vue3-tree-org.css';

import FullCalendar from '@fullcalendar/vue3';
import { ApolloClients } from '@vue/apollo-composable';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import AutoComplete from 'primevue/autocomplete';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import BlockUI from 'primevue/blockui';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import ButtonGroup from 'primevue/buttongroup';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Carousel from 'primevue/carousel';
import CascadeSelect from 'primevue/cascadeselect';
import Chart from 'primevue/chart';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import Chips from 'primevue/chips';
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmPopup from 'primevue/confirmpopup';
import ContextMenu from 'primevue/contextmenu';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions'; // optional
import DeferredContent from 'primevue/deferredcontent';
import Dialog from 'primevue/dialog';
import DialogService from 'primevue/dialogservice';
import Divider from 'primevue/divider';
import Dock from 'primevue/dock';
import Dropdown from 'primevue/dropdown';
import DynamicDialog from 'primevue/dynamicdialog';
import Editor from 'primevue/editor';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import FloatLabel from 'primevue/floatlabel';
import Galleria from 'primevue/galleria';
import IconField from 'primevue/iconfield';
import Image from 'primevue/image';
import InlineMessage from 'primevue/inlinemessage';
import Inplace from 'primevue/inplace';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputIcon from 'primevue/inputicon';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Knob from 'primevue/knob';
import Listbox from 'primevue/listbox';
import MegaMenu from 'primevue/megamenu';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import OrderList from 'primevue/orderlist';
import OrganizationChart from 'primevue/organizationchart';
import OverlayPanel from 'primevue/overlaypanel';
import Paginator from 'primevue/paginator';
import Panel from 'primevue/panel';
import PanelMenu from 'primevue/panelmenu';
import Password from 'primevue/password';
import PickList from 'primevue/picklist';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import RadioButton from 'primevue/radiobutton';
import Rating from 'primevue/rating';
import Ripple from 'primevue/ripple';
import Row from 'primevue/row';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import SelectButton from 'primevue/selectbutton';
import Sidebar from 'primevue/sidebar';
import Skeleton from 'primevue/skeleton';
import Slider from 'primevue/slider';
import SpeedDial from 'primevue/speeddial';
import SplitButton from 'primevue/splitbutton';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Steps from 'primevue/steps';
import StyleClass from 'primevue/styleclass';
import TabMenu from 'primevue/tabmenu';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import Terminal from 'primevue/terminal';
import Textarea from 'primevue/textarea';
import TieredMenu from 'primevue/tieredmenu';
import Timeline from 'primevue/timeline';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ToggleButton from 'primevue/togglebutton';
import Toolbar from 'primevue/toolbar';
import Tooltip from 'primevue/tooltip';
import Tree from 'primevue/tree';
import TreeSelect from 'primevue/treeselect';
import TreeTable from 'primevue/treetable';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import VirtualScroller from 'primevue/virtualscroller';
import { createApp } from 'vue';
import vue3TreeOrg from 'vue3-tree-org';

import App from '@/App.vue';
import SaveToEcmDialog from '@/apps/ecm/views/components/dialog/save/SaveToEcmDialog.vue';
import apolloClients from '@/common/api/graphql/apollo-clients';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppBreadcrumb from '@/common/components/app/AppBreadcrumb.vue';
import AppConfirmDialog from '@/common/components/app/AppConfirmDialog.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { useLayout } from '@/common/components/app/composables/layout';
import AppUpload from '@/common/components/app/upload/AppUpload.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import NamedMultiSelect from '@/common/components/custom/NamedMultiSelect.vue';
import ValidateErrorMessage from '@/common/components/custom/ValidateErrorMessage.vue';
import AppLoader from '@/common/components/loader/AppLoader.vue';
import DisabledAll from '@/common/helpers/directives/DisabledAll';
import InputCode from '@/common/helpers/directives/InputCode';
import InputFileFolderName from '@/common/helpers/directives/InputFileFolderName';
import InputTrim from '@/common/helpers/directives/InputTrim';
import LabelRequired from '@/common/helpers/directives/LabelRequired';
import SanitizeHtml from '@/common/helpers/directives/sanitize-html';
import textScroll from '@/common/helpers/directives/textScroll';
import i18n from '@/common/i18n';
import localeVi from '@/common/i18n/primeLocales/localeVi.json';
import router from '@/common/router';
import { useThemeStore } from '@/common/store/theme';

const app = createApp(App)
  .use(createPinia().use(piniaPluginPersistedState))
  .use(PrimeVue, {
    inputStyle: 'outlined',
    ripple: true,
    locale: localeVi,
  })
  .use(ConfirmationService)
  .use(DialogService)
  .use(ToastService)
  .use(i18n)
  .use(router)
  .use(vue3TreeOrg)

  .provide(ApolloClients, apolloClients)

  .directive('disabled', DisabledAll)
  .directive('badge', BadgeDirective)
  .directive('code', InputCode)
  .directive('file-folder-name', InputFileFolderName)
  .directive('trim', InputTrim)
  .directive('required', LabelRequired)
  .directive('ripple', Ripple)
  .directive('tooltip', Tooltip)
  .directive('sanitize-html', SanitizeHtml)
  .directive('styleclass', StyleClass)
  .directive('text-scroll', textScroll)

  .component('AppLoader', AppLoader)
  .component('AppUpload', AppUpload)
  .component('ButtonIcon', ButtonIcon)
  .component('NamedDropdown', NamedDropdown)
  .component('NamedMultiSelect', NamedMultiSelect)
  .component('NamedInputCalendar', NamedInputCalendar)
  .component('ValidateErrorMessage', ValidateErrorMessage)
  .component('AppAvatar', AppAvatar)
  .component('AppUser', AppUser)
  .component('FullCalendar', FullCalendar)
  .component('AppBreadcrumb', AppBreadcrumb)
  .component('AppIcon', AppIcon)
  .component('MenuItem', MenuItem)

  .component('Accordion', Accordion)
  .component('AccordionTab', AccordionTab)
  .component('AutoComplete', AutoComplete)
  .component('Avatar', Avatar)
  .component('AvatarGroup', AvatarGroup)
  .component('Badge', Badge)
  .component('BlockUI', BlockUI)
  .component('Breadcrumb', Breadcrumb)
  .component('Button', Button)
  .component('ButtonGroup', ButtonGroup)
  .component('Calendar', Calendar)
  .component('Card', Card)
  .component('Chart', Chart)
  .component('Carousel', Carousel)
  .component('CascadeSelect', CascadeSelect)
  .component('Checkbox', Checkbox)
  .component('Chip', Chip)
  .component('Chips', Chips)
  .component('ColorPicker', ColorPicker)
  .component('Column', Column)
  .component('ColumnGroup', ColumnGroup)
  .component('ConfirmDialog', AppConfirmDialog)
  .component('ConfirmPopup', ConfirmPopup)
  .component('ContextMenu', ContextMenu)
  .component('DataTable', DataTable)
  .component('DataView', DataView)
  .component('DataViewLayoutOptions', DataViewLayoutOptions)
  .component('DeferredContent', DeferredContent)
  .component('Dialog', Dialog)
  .component('Divider', Divider)
  .component('Dock', Dock)
  .component('Dropdown', Dropdown)
  .component('DynamicDialog', DynamicDialog)
  .component('Editor', Editor)
  .component('SaveToEcmDialog', SaveToEcmDialog)
  .component('Fieldset', Fieldset)
  .component('FileUpload', FileUpload)
  .component('FloatLabel', FloatLabel)
  .component('Galleria', Galleria)
  .component('IconField', IconField)
  .component('Image', Image)
  .component('InlineMessage', InlineMessage)
  .component('Inplace', Inplace)
  .component('InputGroup', InputGroup)
  .component('InputGroupAddon', InputGroupAddon)
  .component('InputIcon', InputIcon)
  .component('InputMask', InputMask)
  .component('InputNumber', InputNumber)
  .component('InputText', InputText)
  .component('InputSwitch', InputSwitch)
  .component('Knob', Knob)
  .component('Listbox', Listbox)
  .component('MegaMenu', MegaMenu)
  .component('Menu', Menu)
  .component('Menubar', Menubar)
  .component('Message', Message)
  .component('MultiSelect', MultiSelect)
  .component('OrderList', OrderList)
  .component('OrganizationChart', OrganizationChart)
  .component('OverlayPanel', OverlayPanel)
  .component('Paginator', Paginator)
  .component('Panel', Panel)
  .component('PanelMenu', PanelMenu)
  .component('Password', Password)
  .component('PickList', PickList)
  .component('RadioButton', RadioButton)
  .component('ProgressBar', ProgressBar)
  .component('ProgressSpinner', ProgressSpinner)
  .component('Rating', Rating)
  .component('Row', Row)
  .component('SelectButton', SelectButton)
  .component('ScrollPanel', ScrollPanel)
  .component('ScrollTop', ScrollTop)
  .component('Slider', Slider)
  .component('Sidebar', Sidebar)
  .component('Skeleton', Skeleton)
  .component('SpeedDial', SpeedDial)
  .component('SplitButton', SplitButton)
  .component('Splitter', Splitter)
  .component('SplitterPanel', SplitterPanel)
  .component('Steps', Steps)
  .component('Stepper', Stepper)
  .component('StepperPanel', StepperPanel)
  .component('TabMenu', TabMenu)
  .component('TabView', TabView)
  .component('TabPanel', TabPanel)
  .component('Tag', Tag)
  .component('Textarea', Textarea)
  .component('Terminal', Terminal)
  .component('TieredMenu', TieredMenu)
  .component('Timeline', Timeline)
  .component('Toast', Toast)
  .component('Toolbar', Toolbar)
  .component('ToggleButton', ToggleButton)
  .component('Tree', Tree)
  .component('TreeSelect', TreeSelect)
  .component('TreeTable', TreeTable)
  .component('TriStateCheckbox', TriStateCheckbox)
  .component('VirtualScroller', VirtualScroller);

app.mount('#app');

window.onerror = function () {
  return true;
};

window.addEventListener('load', changeColorScheme);

function changeColorScheme() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  useThemeStore().dark = isDark;
  useLayout().changeColorScheme(isDark ? 'dark' : 'light');
}
