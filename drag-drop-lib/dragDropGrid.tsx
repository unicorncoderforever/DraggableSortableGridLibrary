import * as React from 'react';
import { StyleSheet, Animated, PanResponder, Image, View } from 'react-native';

import Tile from './Tile';
import _ from 'lodash';

import { throttle } from 'lodash';

// import block from './block';

// Default values
const ITEMS_PER_ROW = 4;
const DRAG_ACTIVATION_THRESHOLD = 200; // Milliseconds
const BLOCK_TRANSITION_DURATION = 300; // Milliseconds
const ACTIVE_BLOCK_CENTERING_DURATION = 200; // Milliseconds
const DOUBLE_TAP_THRESHOLD = 150; // Milliseconds
const NULL_FN = () => {};

interface props {
  blockTransitionDuration?: any;
  activeBlockCenteringDuration?: any;
  itemsPerRow?: any;
  items?: any;
  doubleTapTreshold ? : any;
  dragActivationTreshold?: any;
  doubleTapThreshold?: any;
  onDragRelease?: any;
  onDragStart?: any;
  onDeleteItem?: any;
  dragStartAnimation?: any;
  itemWidth?: any;
  itemHeight?: any;
  style?: any;
  onMerge?:any
  merge?: any;
}

interface state{
  gridLayout: any,
  random: any,
  startDragWiggle: any,
  activeBlock: any,
  mergeBlock: number,
  blockWidth: any,
  blockHeight: any,
  gridHeight: any,
  deleteModeOn: boolean,
  deletionSwipePercent: number,
  deleteBlock: any,
  deleteBlockOpacity: any,
  deletedItems: Array<any>
}

export class DragDropGrid extends React.Component<props, state> {
  rows: any;
  dragPosition: any;
  activeBlockOffset: any;
  blockWidth: any;
  blockHeight: any;
  gridHeightTarget: any;
  ghostBlocks: Array<any>;
  itemOrder: any;
  orderItem: Array<any>;
  merge: boolean;
  panCapture: boolean;
  items: any;
  initialLayoutDone: boolean;
  initialDragDone: boolean;
  config: any;
  tapTimer: any;
  tapIgnore: boolean;
  doubleTapWait: boolean;
  itemsPerRow: any;
  _panResponder: any;
  dragActivationThreshold: number;
  dragStartAnimation: any;
  blockPositionsSetCount: number;
  key: any;
  showAddNew?: boolean;
  release: boolean;
  doubleTapTreshold:number;

  blockPositions: Array<any>;
  constructor(props) {
    super(props);
    this.state = {
      gridLayout: null,
      random: null,
      startDragWiggle: new Animated.Value(0),
      activeBlock: null,
      mergeBlock: null,
      blockWidth: null,
      blockHeight: null,
      gridHeight: new Animated.Value(0),
      deleteModeOn: false,
      deletionSwipePercent: 0,
      deleteBlock: null,
      deleteBlockOpacity: new Animated.Value(1),
      deletedItems: []
    };
    this.itemsPerRow = this.props.itemsPerRow;
    this.dragActivationThreshold = this.props.dragActivationTreshold;
    this.dragStartAnimation = this.props.dragStartAnimation;
    this.doubleTapTreshold = DOUBLE_TAP_THRESHOLD
    this._panResponder = null;
    this.rows = null;
    this.dragPosition = null;
    this.activeBlockOffset = null;
    this.blockWidth = null;
    this.blockPositionsSetCount = 0;
    this.blockHeight = null;
    this.blockPositions = [];
    this.toggleDeleteMode= this.toggleDeleteMode.bind(this);
    this.gridHeightTarget = null;
    this.ghostBlocks = [];
    this.itemOrder = [];
    this.showAddNew = false;
    this.orderItem = [];
    this.merge = false;
    this.panCapture = false;
    this.items = [];
    this.initialLayoutDone = false;
    this.initialDragDone = false;
    this.config = { tension: 40, friction: 3 };
    this.tapTimer = null;
    this.tapIgnore = false;
    this.doubleTapWait = false;
    this.assessGridSize = this.assessGridSize.bind(this);
    this.release = false;
    this.key = null;
    this._getGridStyle = this._getGridStyle.bind(this);
    this._getBlockStyle = this._getBlockStyle.bind(this);
    this.saveBlockPositions = this.saveBlockPositions.bind(this);
    this.activateDrag = this.activateDrag.bind(this);
    this.handleTap = this.handleTap.bind(this);
    this.onBlockPress = this.onBlockPress.bind(this);
    this._getItemWrapperStyle = this._getItemWrapperStyle.bind(this);
    this.deleteBlockList = this.deleteBlockList.bind(this);
  }
   render() {
    return (
      <Animated.View
        style={this._getGridStyle()}
        onLayout={this.assessGridSize}
        key={this.blockPositions}
      >
        {this.state.gridLayout &&
          this.blockPositions &&
          this.items.map((item, key) => (
            <Tile
            key={key}
            style={this._getBlockStyle(key)}
            onLayout={this.saveBlockPositions(key)}
            panHandlers={this._panResponder && this._panResponder.panHandlers}
            delayLongPress={this.dragActivationThreshold}
            onLongPress={this.activateDrag(key)}
            onPress={this.handleTap(item.props, key)}
            itemWrapperStyle={this._getItemWrapperStyle(key)}
            inactive={false}
          >
            {item}
          </Tile>
          ))}
      </Animated.View>
    );
  }

   onBlockPress = key => {
    if (this.tapIgnore) this._resetTapIgnoreTime();
  };
   toggleDeleteMode = () => {
    let deleteModeOn = !this.state.deleteModeOn;
    this.setState({ deleteModeOn });
    return { deleteModeOn };
  };

   componentDidMount() {
    this.createTouchHandlers();
    this.handleNewProps(this.props);
  }

   componentWillUnmount() {
    if (this.tapTimer) clearTimeout(this.tapTimer);
  }

   componentDidUpdate(prevProps) {
   if(prevProps != this.props){
     this.handleNewProps(this.props);
    }
  }
 
  handleNewPropsWithoutDelete = properties => {
    this.itemsPerRow = this.props.itemsPerRow;
    this.dragActivationThreshold = this.props.dragActivationTreshold;
    this.dragStartAnimation = this.props.dragStartAnimation;
    this._assignReceivedPropertiesIntoThis(properties);
    this._saveItemOrder(properties.children);
  };

    handleNewProps = properties => {
    this.itemsPerRow = this.props.itemsPerRow;
    this.dragActivationThreshold = this.props.dragActivationTreshold;
    this.dragStartAnimation = this.props.dragStartAnimation;
    this._assignReceivedPropertiesIntoThis(properties);
    this._saveItemOrder(properties.children);
    this._removeDisappearedChildren(properties.children);

  };

  onStartDrag = (evt, gestureState) => {
     if (this.state.activeBlock != null) {
        let activeBlockPosition = this._getActiveBlock().origin;
        let x = activeBlockPosition.x - gestureState.x0;
        let y = activeBlockPosition.y - gestureState.y0;
        this.activeBlockOffset = { x, y };
        this.initialDragDone = true
        this._getActiveBlock().currentPosition.setOffset({ x, y });
        this._getActiveBlock().currentPosition.setValue({
          x: gestureState.moveX,
          y: gestureState.moveY
        });
      }
  };

  onMoveBlock = (evt, { moveX, moveY, dx, dy }) => {
      if (this.state.activeBlock != null && this._blockPositionsSet()) {
        if (this.state.deleteModeOn) return this.deleteModeMove({ x: moveX, y: moveY });
        if (dx != 0 || dy != 0) this.initialDragDone = true;
        let yChokeAmount = Math.max(
          0,
          this.activeBlockOffset.y + moveY - (this.state.gridLayout.height - this.blockHeight)
        );
        let xChokeAmount = Math.max(
          0,
          this.activeBlockOffset.x + moveX - (this.state.gridLayout.width - this.blockWidth)
        );
        let yMinChokeAmount = Math.min(0, this.activeBlockOffset.y + moveY);
        let xMinChokeAmount = Math.min(0, this.activeBlockOffset.x + moveX);

        let dragPosition = {
          x: moveX - xChokeAmount - xMinChokeAmount,
          y: moveY - yChokeAmount - yMinChokeAmount
        };
        this.dragPosition = dragPosition;
       this._getActiveBlock().currentPosition.setValue(dragPosition);
       if (dx != 0 || dy != 0) this.initialDragDone = true
        this.moveAnim(
          this.state.activeBlock,
          this.blockPositions,
          this.itemOrder,
          this.state.mergeBlock
        );
      }
  };

  moveAnim = throttle((activeBlock, bp, itemOrder, mergeBlock) => {
    if (!this.release) {
      let closest = activeBlock;
      let originalPosition = this._getActiveBlock().origin;
      let distanceToOrigin = this._getDistanceTo(originalPosition);
      let closestDistance = distanceToOrigin;
      let merge = false;
      this.blockPositions &&
        this.blockPositions.forEach((block, index) => {
          if (index !== activeBlock && block.origin) {
            let blockPosition = block.origin;
            let distance = this._getDistanceTo(blockPosition);

            //condition to avoid "+" block
          
              //condition to check whether block has come close to any other block
              if (distance < closestDistance && distance < this.state.blockWidth) {
                closest = index;
                closestDistance = distance;
                //this is the condition for group creation(mergeblock)
                if (this.props.merge) {
                  if (distance < this.state.blockWidth / 3) {
                    var arr1 = [];
                    if (closest != mergeBlock) {
                      //if already an mergeblock exist get it to actual size
                     
                      if (mergeBlock != null) {
                        Animated.spring(bp[mergeBlock].pop, {
                          toValue: 0,
                          tension: 40,
                          friction: 3
                        }).start();
                      }
                    
                      arr1.push(
                        Animated.spring(bp[activeBlock].hoverPop, {
                          toValue: -1,
                          tension: 40,
                          friction: 3
                        })
                      );
                      arr1.push(
                        Animated.spring(bp[closest].pop, {
                          toValue: -1,
                          tension: 40,
                          friction: 3
                        })
                      );
                      Animated.parallel(arr1).start();
                    }
                    merge = true;
                   }
                }
              }
            }
        });

      this.merge = merge;
      if (!merge) {
        var arr = [];
        //if there no mergegroup gesture the reposition  already existing mergeblock
       //create empty blocks (for remaing space)
        this.ghostBlocks &&
          this.ghostBlocks.forEach(ghostBlockPosition => {
            let distance = this._getDistanceTo(ghostBlockPosition);
            if (distance < closestDistance) {
              closest = activeBlock;
              closestDistance = distance;
            }
          });

        //this is for reposition animation
        if (closest !== activeBlock) {
          var date = new Date();
          var timestamp = date.getTime();
          const increment =
            this.itemOrder[closest].order < this.itemOrder[activeBlock].order ? -1 : 1;
          var arr = [];
          var toPos, pos;
          var closetOrder = this.itemOrder[closest].order;
          var activeOrder = this.itemOrder[activeBlock].order;
          let blockPositions = bp;

          //repostion animation for the blocks which are supposed to be repositioned (zig zag animation)
          for (let k = activeOrder; k != closetOrder; k += increment) {
            itemOrder &&
              itemOrder.forEach((item, index) => {
                if (item.order == k) {
                  toPos = index;
                }
                if (item.order == k + increment) {
                  pos = index;
                }
              });

            arr.push(
              Animated.timing(bp[pos].currentPosition, {
                toValue: bp[toPos].origin,
                duration: this.props.blockTransitionDuration
              })
            );
          }

          if (mergeBlock != null) {
            arr.push(
              Animated.spring(bp[mergeBlock].pop, {
                toValue: 0,
                tension: 40,
                friction: 3
              })
            );
            arr.push(
              Animated.spring(bp[activeBlock].hoverPop, {
                toValue: 1,
                tension: 40,
                friction: 3
              })
            );
          }

          //this part repositions all the blocks saves their respected positions and offesets
          var dup_array = this.deepCopy(this.orderItem);
          let currPos = blockPositions[closest].origin;
          var tempOrderIndex = this.itemOrder[closest].order;
          for (let k = closetOrder; k != activeOrder; k -= increment) {
            toPos = this.orderItem[k].order;
            pos = this.orderItem[k - increment].order;
            blockPositions[toPos].origin = blockPositions[pos].origin;
            this.itemOrder[toPos].order = this.itemOrder[pos].order;
            dup_array[k - increment].order = toPos;
          }
          blockPositions[activeBlock].origin = currPos;
          dup_array[closetOrder].order = activeBlock;
          this.orderItem = dup_array;
          this.itemOrder[activeBlock].order = tempOrderIndex;
          this.blockPositions = blockPositions;
          Animated.parallel(arr).start();
        }
      } else if (closest != mergeBlock) {
        this.setState({ mergeBlock: closest });
      }
    }
  }, 400);

  onReleaseBlock = (evt, gestureState) => {
      this.release = true;
      this.moveAnim.cancel();
      this.returnBlockToOriginalPosition();
      this.afterDragRelease();
      this.merge = false;
   };


  deleteBlockList = key => {
    this.key = key;
    const activeKey = _.findKey(this.itemOrder, oldItem => oldItem.key == key);
    let activeBlock = activeKey;
    this.deleteBlocks([activeBlock]);
    this.afterDragRelease();
  };

  blockAnimateFadeOut = () => {
    this.state.deleteBlockOpacity.setValue(1);
    return new Promise((resolve, reject) => {
      Animated.timing(this.state.deleteBlockOpacity, {
        toValue: 0,
        duration: 2 * this.props.activeBlockCenteringDuration
      }).start(resolve);
    });
  };

  animateBlockMove = (blockIndex, position) => {
   return Animated.timing(this._getBlock(blockIndex).currentPosition, {
      toValue: position,
      duration: this.props.blockTransitionDuration
    });
  };

  returnBlockToOriginalPosition = () => {
    this.repositionMergeBlockAndUpdate();
    if (this.state.mergeBlock != null) {
      Animated.spring(this.blockPositions[this.state.mergeBlock].pop, {
        toValue: 0,
        tension: 40,
        friction: 3
      }).start();
    }
    this.repostionBlocks();
    this.repositionActiveBlock();
    this.merge = false;
  };

  repostionBlocks() {
    var arr = [];
    let bp = this.blockPositions;
    for (let i = 0; i < bp.length; i++) {
      Animated.timing(bp[i].currentPosition, {
        toValue: bp[i].origin,
        duration: this.props.activeBlockCenteringDuration
      }).start();
    }
  }
  repositionMergeBlockAndUpdate() {
    if (this.props.merge) {
      let closest = this.state.activeBlock;
      let originalPosition = this._getActiveBlock().origin;
      let distanceToOrigin = this._getDistanceTo(originalPosition);
      let closestDistance = distanceToOrigin;
      let bp = this.blockPositions;
      let mergeBlock = this.state.mergeBlock;
      let activeBlock = this.state.activeBlock;
      if (mergeBlock != null) {
        let blockPosition = this._getBlock(mergeBlock).origin;
        let distance = this._getDistanceTo(blockPosition);
        if (distance < closestDistance && distance < this.state.blockWidth / 4) {
          this.props.onMerge(this.items[activeBlock].key, this.items[mergeBlock].key);
        }
        Animated.spring(bp[mergeBlock].pop, {
          toValue: 0,
          tension: 40,
          friction: 3
        }).start();
      }
    }
  }
  repositionActiveBlock() {
    let activeBlockCurrentPosition = this._getActiveBlock().currentPosition;
    activeBlockCurrentPosition.flattenOffset();
    let toValueAnim = this._getActiveBlock().origin;
    let hoverPopOfItem = this._getActiveBlock().hoverPop;
    hoverPopOfItem.stopAnimation();
    Animated.timing(activeBlockCurrentPosition, {
      toValue: toValueAnim,
      duration: this.props.activeBlockCenteringDuration
    }).start();
    Animated.spring(hoverPopOfItem, {
      toValue: 0,
      tension: 40,
      friction: 3
    }).start();
  }
  afterDragRelease = () => {
    let itemOrder = _.sortBy(this.itemOrder, item => item.order);
    let orderItem = _.sortBy(this.orderItem, item => item.order);
    this.props.onDragRelease && this.props.onDragRelease({ itemOrder });
    this.setState({ activeBlock: null });
    this.setState({ mergeBlock: null });
    this.panCapture = false;
  };

  deleteModeMove = ({ x, y }) => {
    let slideDistance = 50;
    let moveY = y + this.activeBlockOffset.y - this._getActiveBlock().origin.y;
    let adjustY = 0;
    if (moveY < 0) adjustY = moveY;
    else if (moveY > slideDistance) adjustY = moveY - slideDistance;
    let deletionSwipePercent = ((moveY - adjustY) / slideDistance) * 100;
    this._getActiveBlock().currentPosition.y.setValue(y - adjustY);
    this.setState({ deletionSwipePercent });
  };

  assessGridSize({ nativeEvent }) {
    if (this.props.itemWidth < nativeEvent.layout.width) {
      this.itemsPerRow = Math.floor(nativeEvent.layout.width / this.props.itemWidth);
      this.blockWidth = nativeEvent.layout.width / this.itemsPerRow;
      this.blockHeight = this.props.itemHeight || this.blockWidth;
    } else {
      this.blockWidth = nativeEvent.layout.width / this.itemsPerRow;
      this.blockHeight = this.blockWidth;
    }
    if (this.state.gridLayout != nativeEvent.layout) {
      this.setState({
        gridLayout: nativeEvent.layout,
        blockWidth: this.blockWidth,
        blockHeight: this.blockHeight
      });
    }
  }

  deepCopy(arr) {
    var out = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      var item = arr[i];
      var obj = {};
      for (var k in item) {
        obj[k] = item[k];
      }
      out.push(obj);
    }
    return out;
  }

  reAssessGridRows = () => {
    let oldRows = this.rows;
    this.rows = Math.ceil(this.items.length / this.itemsPerRow);
    if (this.state.blockWidth && oldRows != this.rows) this._animateGridHeight();
  };

  saveBlockPositions = key => ({ nativeEvent }) => {
    let blockPositions = this.blockPositions;
    if (!blockPositions[key]) {
      let blockPositionsSetCount = blockPositions[key]
        ? this.blockPositionsSetCount
        : ++this.blockPositionsSetCount;
      let thisPosition = {
        x: nativeEvent.layout.x,
        y: nativeEvent.layout.y
      };
      blockPositions[key] = {
        currentPosition: new Animated.ValueXY(thisPosition),
        origin: thisPosition,
        pop: new Animated.Value(0),
        hoverPop: new Animated.Value(0)
      };
      if (this._blockPositionsSet()) {
        this.blockPositions = blockPositions;
        this.setGhostPositions();
        this.initialLayoutDone = true;
      }
    }
  };

  getNextBlockCoordinates = () => {
    let blockWidth = this.state.blockWidth;
    let blockHeight = this.state.blockHeight;
    let placeOnRow = this.items.length % this.itemsPerRow;
    let y = blockHeight * Math.floor(this.items.length / this.itemsPerRow) + 20;
    let x = placeOnRow * blockWidth;
    return { x, y };
  };

  setGhostPositions = () => {
    this.ghostBlocks = [];
    this.reAssessGridRows();
    let blockWidth = this.state.blockWidth;
    let blockHeight = this.state.blockHeight;
    let fullGridItemCount = this.rows * this.itemsPerRow;
    let ghostBlockCount = fullGridItemCount - this.items.length;
    let y = blockHeight * (this.rows - 1);
    let initialX = blockWidth * (this.itemsPerRow - ghostBlockCount);
    for (let i = 0; i < ghostBlockCount; ++i) {
      let x = initialX + blockWidth * i;
      this.ghostBlocks.push({ x, y });
    }
  };

  activateDrag = key => () => {
    this.release = false;
    this.props.onDragStart(key);
    let favKey = this.items[key].key;
    this.panCapture = true
    this.setState({ activeBlock: key })
    this._defaultDragActivationWiggle();
  };


  handleTap = ({ onTap = NULL_FN, onDoubleTap = NULL_FN },key) => () => {
    if (this.tapIgnore) this._resetTapIgnoreTime()
    else if (onDoubleTap != null) {
      this.doubleTapWait ? this._onDoubleTap(onDoubleTap) : this._onSingleTap(onTap)
    } else onTap()
  }

  // Helpers & other boring stuff
  _getActiveBlock = () => this.blockPositions[this.state.activeBlock];

  _getBlock = blockIndex => this.blockPositions[blockIndex];

  _blockPositionsSet = () => this.blockPositionsSetCount == this.items.length;

  //when the items added or deleted from the backend we maitain it
  _saveItemOrder = items => {
    items &&
      items.forEach((item, index) => {
        const foundKey = _.findKey(this.itemOrder, oldItem => oldItem.key == item.key);
        if (foundKey) {
          this.items[foundKey] = item;
        } else {
          this.itemOrder.push({ key: item.key, ref: item.ref, order: this.items.length });
          this.orderItem.push({
            key: item.key,
            ref: item.ref,
            order: this.items.length,
            originKey: this.items.length
          });
          if (!this.initialLayoutDone) {
            this.items.push(item);
          } else {
              let  blockPositionsSetCount = ++this.blockPositionsSetCount;
              let thisPosition = this.getNextBlockCoordinates();

              this.blockPositions.push({
              currentPosition: new Animated.ValueXY(thisPosition),
              origin: thisPosition,
              pop: new Animated.Value(0),
              hoverPop: new Animated.Value(0)
            });
            this.items.push(item);
            this.setGhostPositions();
          }
        }
      });
  };

  deleteDisapearedItems(items) {
    let deleteBlockIndices = [];
    let blockPositions = this.blockPositions;
    let blockPositionsSetCount = this.blockPositionsSetCount;
    this.itemOrder &&
      _.cloneDeep(this.itemOrder).forEach((item, index) => {
        if (!_.findKey(items, oldItem => oldItem.key == item.key)) {
          deleteBlockIndices.push(index);
        }
      });
    if (deleteBlockIndices.length > 0) {
      deleteBlockIndices &&
        _.sortBy(deleteBlockIndices, index => -index).forEach(index => {
          --blockPositionsSetCount;
          let order = this.itemOrder[index].order;
          blockPositions.splice(index, 1);
          let indexOrder = this.findIndex(this.orderItem, index);
          this._fixItemOrderOnDeletion(this.itemOrder[index]);
          this.orderItem.splice(indexOrder, 1);
          this.itemOrder.splice(index, 1);
          this._fixOrderItemOnDeletion(this.itemOrder);

          this.items.splice(index, 1);
        });

      this.blockPositionsSetCount = blockPositionsSetCount;
      return blockPositions;
    }
  }

  isNotEqual(items, currentItems) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].key != currentItems[i].key) {
        return true;
      }
    }
    return false;
  }

  unloadLastTile() {
    if (this.blockPositions.length > 0) {
      this.itemOrder.splice(this.itemOrder.length - 1, 1);
      this.orderItem.splice(this.orderItem.length - 1, 1);
      this.items.splice(this.items.length - 1, 1);
      this.blockPositions.splice(this.blockPositions.length - 1, 1);
      this.blockPositionsSetCount = this.blockPositionsSetCount - 1;
    }
  }

  _removeDisappearedChildren = items => {
    let deleteBlockIndices = [];
    this.itemOrder &&
      _.cloneDeep(this.itemOrder).forEach((item, index) => {
        if (!_.findKey(items, oldItem => oldItem.key == item.key)) {
          deleteBlockIndices.push(index);
        }
      });
    if (deleteBlockIndices.length > 0) {
      this.deleteBlocks(deleteBlockIndices);
    }
  };

  deleteBlocks = deleteBlockIndices => {
    let blockPositionsSetCount = this.blockPositionsSetCount;
    _.sortBy(deleteBlockIndices, index => -index).forEach(index => {
      --blockPositionsSetCount;
      let order = this.itemOrder[index].order;
      this.blockPositions.splice(index, 1);
      let indexOrder = this.findIndex(this.orderItem, index);
      this._fixItemOrderOnDeletion(this.itemOrder[index]);
      this.orderItem.splice(indexOrder, 1);
      this.itemOrder.splice(index, 1);
      this._fixOrderItemOnDeletion(this.itemOrder);
      this.items.splice(index, 1);
    });

    var arr = [];
    this.blockPositionsSetCount = blockPositionsSetCount;
    this.items &&
      this.items.forEach((item, order) => {
        let blockIndex = _.findKey(this.itemOrder, item => item.order == order);
        let x = (order * this.state.blockWidth) % (this.itemsPerRow * this.state.blockWidth);
        let y = Math.floor(order / this.itemsPerRow) * this.state.blockHeight + 20;
        this.blockPositions[blockIndex].origin = { x, y };
        if (this.key == null) {
          this.blockPositions[blockIndex].currentPosition = new Animated.ValueXY({ x, y });
        } else arr.push(this.animateBlockMove(blockIndex, { x, y }));
      });
    if (arr.length > 0) {
      Animated.parallel(arr).start(() => {
        if (this.key != null) this.props.onDeleteItem(this.key);
        this.key = null;
        this.setGhostPositions();
      });
    } else {
      this.setGhostPositions();
    }
  };

  findIndex(orderItem, key) {
    for (let i = 0; i < orderItem.length; i++) {
      if (orderItem[i].order == key) {
        return i;
      }
    }
    return -1;
  }

  _fixItemOrderOnDeletion = orderItem => {
    if (!orderItem) return false;
    orderItem.order--;
    this._fixItemOrderOnDeletion(_.find(this.itemOrder, item => item.order == orderItem.order + 2));
  };

  _fixOrderItemOnDeletion = itemOrder => {
    let orderItem = this.orderItem;
    for (let i = 0; i < itemOrder.length; i++) {
      orderItem[itemOrder[i].order].order = i;
    }
    this.orderItem = orderItem;
  };

  _animateGridHeight = () => {
    this.gridHeightTarget = this.rows * this.state.blockHeight;
    if (this.gridHeightTarget == this.state.gridLayout.height || this.state.gridLayout.height == 0)
      this.state.gridHeight.setValue(this.gridHeightTarget);
    else if (this.state.gridHeight._value !== this.gridHeightTarget) {
      Animated.timing(this.state.gridHeight, {
        toValue: this.gridHeightTarget,
        duration: this.props.blockTransitionDuration
      }).start();
    }
  };

  _getDistanceTo = point => {
    let xDistance = this.dragPosition.x + this.activeBlockOffset.x - point.x;
    let yDistance = this.dragPosition.y + this.activeBlockOffset.y - point.y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  };

  _defaultDragActivationWiggle = () => {
    if (!this.props.dragStartAnimation) {
      let activeBlock = this._getActiveBlock();
      Animated.spring(activeBlock.hoverPop, {
        toValue: 1,
        friction: 3,
        tension: 40
      }).start(() => {});
    }
  };

  _blockActivationWiggle = key => {
    return (
      this.props.dragStartAnimation || {
        transform: [
          {
            scale: this._getBlock(key).hoverPop.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0.8, 1, 1.3]
            })
          }
        ]
      }
    );
  };

  _assignReceivedPropertiesIntoThis(properties) {
    properties &&
      Object.keys(properties).forEach(property => {
        if (this[property]) this[property] = properties[property];
      });
    this.dragStartAnimation = properties.dragStartAnimation;
  }


  _onSingleTap = (onTap) => {
    this.doubleTapWait = true
    this.tapTimer = setTimeout( () => {
      this.doubleTapWait = false
      onTap()
    }, this.doubleTapTreshold)
  }

  _onDoubleTap = onDoubleTap => {
    this._resetTapIgnoreTime();
    this.doubleTapWait = false;
    this.tapIgnore = true;
    onDoubleTap();
  };

  _resetTapIgnoreTime = () => {
    clearTimeout(this.tapTimer);
    this.tapTimer = setTimeout(() => (this.tapIgnore = false), this.props.doubleTapThreshold);
  };

  createTouchHandlers() {
    this._panResponder = PanResponder.create({
      onPanResponderTerminate:             (evt, gestureState) => {},
      onStartShouldSetPanResponder:        (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder:         (evt, gestureState) => this.panCapture,
      onMoveShouldSetPanResponderCapture:  (evt, gestureState) => this.panCapture,
      onShouldBlockNativeResponder:        (evt, gestureState) => false,
      onPanResponderTerminationRequest:    (evt, gestureState) => false,
      onPanResponderGrant:   this.onActiveBlockIsSet(this.onStartDrag),
      onPanResponderMove:    this.onActiveBlockIsSet(this.onMoveBlock),
      onPanResponderRelease: this.onActiveBlockIsSet(this.onReleaseBlock)
    });
  }

  onActiveBlockIsSet = fn => (evt, gestureState) => {
    if (this.state.activeBlock != null) fn(evt, gestureState);
  };

  _getImageDeleteIconStyle = key => [
    {
      position: 'absolute',
      top: this.state.blockHeight/2 - 15,
      left: this.state.blockWidth/2 - 15,
      width: 30,
      height: 30,
      opacity: .5
    },
    this.state.activeBlock == key
    && this._getBlock( key ).origin &&
    { opacity: .5 + this._getDynamicOpacity(key) }
  ];
  _getGridStyle = () => [
    styles.sortableGrid,
    this.props.style,
     this._blockPositionsSet() && { height: this.state.gridHeight }
  ];

  _getItemWrapperStyle = key => [
    { flex: 1 },
    this.state.activeBlock == key &&
      this.state.deleteModeOn &&
      this._getBlock(key).origin && { opacity: 1.5 - this._getDynamicOpacity(key) }
  ];

  _getDynamicOpacity = key =>
    (this._getBlock(key).currentPosition.y._value +
      this._getBlock(key).currentPosition.y._offset -
      this._getBlock(key).origin.y) /
    50;

  _getBlockStyle = key => [
    {
      width: this.state.blockWidth,
      height: this.state.blockHeight,
      justifyContent: 'center'
    },
    this._blockPositionsSet() && {
        position: 'absolute',
        top: this._getBlock(key).currentPosition.getLayout().top,
        left: this._getBlock(key).currentPosition.getLayout().left,
        transform: [
          {
              scale: this._getBlock(key).pop.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0.5, 1, 1]
            })
          },
          {
            translateY: this._getBlock(key).pop.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-1 * 50, 0, 0]
            })
          }
        ]
      },

    this.state.activeBlock == key && this._blockActivationWiggle(key),
    this.state.activeBlock == key && { zIndex: 1 },
    this.state.deleteBlock != null && { zIndex: 2 },
    this.state.deleteBlock == key && { opacity: this.state.deleteBlockOpacity },

  ];
}

const styles = StyleSheet.create({
    sortableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex:1
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

// export default DragDropGrid;
// export const Greeter = (name: string) => `Hello ${name}`; 
