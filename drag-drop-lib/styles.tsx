/**
 * Global App Styles
 **/
'use strict';

import { Dimensions, PixelRatio, StyleSheet, Platform } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';

// Precalculate Device Dimensions for better performance

const SOFT_MENU_BAR_HEIGHT =
  Platform.OS === 'ios' ? 0 : ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : ExtraDimensions.get('STATUS_BAR_HEIGHT');
const x: number =
  Platform.OS === 'ios' ? Dimensions.get('window').width : ExtraDimensions.get('REAL_WINDOW_WIDTH');
const y: number =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : ExtraDimensions.get('REAL_WINDOW_HEIGHT') - SOFT_MENU_BAR_HEIGHT;
const BASE_WIDTH: number = 375;
const BASE_HEIGHT: number = 667;

export const Style  = {
  DEVICE_WIDTH: x,
  DEVICE_HEIGHT: y,
  getWidth: getWidth,
  getHeight: getHeight
}
  export function getWidth(value: number): number {
    return x * (value / BASE_WIDTH);
  }
  
  export function getHeight(value: number): number {
    return Math.round(y * (value / BASE_HEIGHT));
  }
  

