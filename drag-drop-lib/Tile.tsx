import * as React from 'react';
import {
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  PanResponder,
  Image,
  View
} from 'react-native';
import _ from 'lodash';
import { throttle } from 'lodash';
interface props {
  key?: any;
  style?: any;
  onLayout?: any;
  panHandlers?: any;
  delayLongPress?: any;
  onLongPress?: any;
  onPress?: any;
  itemWrapperStyle?: any;
  deletionView?: any;
  inactive?: any;
}
const ITEMS_PER_ROW = 4;
const DRAG_ACTIVATION_THRESHOLD = 200; // Milliseconds
const BLOCK_TRANSITION_DURATION = 300; // Milliseconds
const ACTIVE_BLOCK_CENTERING_DURATION = 200; // Milliseconds
const DOUBLE_TAP_THRESHOLD = 150; // Milliseconds
const NULL_FN = () => {};

class Tile extends React.Component<props, any> {
  constructor(props) {
    super(props);
  }

  public render() {
    return (
          <Animated.View
            style={this.props.style}
            onLayout={this.props.onLayout}
            {...this.props.panHandlers}
          >
          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            delayLongPress={this.props.delayLongPress}
            onLongPress={() => this.props.inactive || this.props.onLongPress()}
            onPress={() => this.props.inactive || this.props.onPress()}
          >
          <View style={styles.itemImageContainer}>
          <View style={this.props.itemWrapperStyle}>{this.props.children}</View>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}
const styles = StyleSheet.create({
  sortableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  deletedBlock: {
    opacity: 0,
    position: 'absolute',
    left: 0,
    top: 0,
    height: 0,
    width: 0
  },
  itemImageContainer: {
    flex: 1,
    justifyContent: 'center'
  }
});

export default Tile;
