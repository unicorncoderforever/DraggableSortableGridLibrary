/**
 * Global App Styles
 **/
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var react_native_extra_dimensions_android_1 = __importDefault(require("react-native-extra-dimensions-android"));
// Precalculate Device Dimensions for better performance
var SOFT_MENU_BAR_HEIGHT = react_native_1.Platform.OS === 'ios' ? 0 : react_native_extra_dimensions_android_1.default.get('SOFT_MENU_BAR_HEIGHT');
var STATUS_BAR_HEIGHT = react_native_1.Platform.OS === 'ios' ? 20 : react_native_extra_dimensions_android_1.default.get('STATUS_BAR_HEIGHT');
var x = react_native_1.Platform.OS === 'ios' ? react_native_1.Dimensions.get('window').width : react_native_extra_dimensions_android_1.default.get('REAL_WINDOW_WIDTH');
var y = react_native_1.Platform.OS === 'ios'
    ? react_native_1.Dimensions.get('window').height
    : react_native_extra_dimensions_android_1.default.get('REAL_WINDOW_HEIGHT') - SOFT_MENU_BAR_HEIGHT;
var BASE_WIDTH = 375;
var BASE_HEIGHT = 667;
exports.Style = {
    DEVICE_WIDTH: x,
    DEVICE_HEIGHT: y,
    getWidth: getWidth,
    getHeight: getHeight
};
function getWidth(value) {
    return x * (value / BASE_WIDTH);
}
exports.getWidth = getWidth;
function getHeight(value) {
    return Math.round(y * (value / BASE_HEIGHT));
}
exports.getHeight = getHeight;
//# sourceMappingURL=styles.js.map