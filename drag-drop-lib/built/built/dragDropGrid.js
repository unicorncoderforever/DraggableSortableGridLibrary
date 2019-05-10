"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule)
        return mod;
    var result = {};
    if (mod != null)
        for (var k in mod)
            if (Object.hasOwnProperty.call(mod, k))
                result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var react_native_1 = require("react-native");
var Tile_1 = __importDefault(require("./Tile"));
var lodash_1 = __importDefault(require("lodash"));
var styles_1 = require("./styles");
var lodash_2 = require("lodash");
// import block from './block';
// Default values
var ITEMS_PER_ROW = 4;
var DRAG_ACTIVATION_THRESHOLD = 200; // Milliseconds
var BLOCK_TRANSITION_DURATION = 300; // Milliseconds
var ACTIVE_BLOCK_CENTERING_DURATION = 200; // Milliseconds
var DOUBLE_TAP_THRESHOLD = 150; // Milliseconds
var NULL_FN = function () { };
var DragDropGrid = /** @class */ (function (_super) {
    __extends(DragDropGrid, _super);
    function DragDropGrid(props) {
        var _this = _super.call(this, props) || this;
        _this.onBlockPress = function (key) {
            if (_this.tapIgnore)
                _this._resetTapIgnoreTime();
        };
        _this.toggleDeleteMode = function () {
            var deleteModeOn = !_this.state.deleteModeOn;
            _this.setState({ deleteModeOn: deleteModeOn });
            return { deleteModeOn: deleteModeOn };
        };
        _this.handleNewPropsWithoutDelete = function (properties) {
            _this.itemsPerRow = _this.props.itemsPerRow;
            _this.dragActivationThreshold = _this.props.dragActivationTreshold;
            _this.dragStartAnimation = _this.props.dragStartAnimation;
            _this._assignReceivedPropertiesIntoThis(properties);
            _this._saveItemOrder(properties.children);
        };
        _this.handleNewProps = function (properties) {
            _this.itemsPerRow = _this.props.itemsPerRow;
            _this.dragActivationThreshold = _this.props.dragActivationTreshold;
            _this.dragStartAnimation = _this.props.dragStartAnimation;
            _this._assignReceivedPropertiesIntoThis(properties);
            _this._saveItemOrder(properties.children);
            _this._removeDisappearedChildren(properties.children);
        };
        _this.onStartDrag = function (evt, gestureState) {
            if (_this.state.activeBlock != null) {
                var activeBlockPosition = _this._getActiveBlock().origin;
                var x = activeBlockPosition.x - gestureState.x0;
                var y = activeBlockPosition.y - gestureState.y0;
                _this.activeBlockOffset = { x: x, y: y };
                _this.initialDragDone = true;
                _this._getActiveBlock().currentPosition.setOffset({ x: x, y: y });
                _this._getActiveBlock().currentPosition.setValue({
                    x: gestureState.moveX,
                    y: gestureState.moveY
                });
            }
        };
        _this.onMoveBlock = function (evt, _a) {
            var moveX = _a.moveX, moveY = _a.moveY, dx = _a.dx, dy = _a.dy;
            if (_this.state.activeBlock != null && _this._blockPositionsSet()) {
                if (_this.state.deleteModeOn)
                    return _this.deleteModeMove({ x: moveX, y: moveY });
                if (dx != 0 || dy != 0)
                    _this.initialDragDone = true;
                var yChokeAmount = Math.max(0, _this.activeBlockOffset.y + moveY - (_this.state.gridLayout.height - _this.blockHeight));
                var xChokeAmount = Math.max(0, _this.activeBlockOffset.x + moveX - (_this.state.gridLayout.width - _this.blockWidth));
                var yMinChokeAmount = Math.min(0, _this.activeBlockOffset.y + moveY);
                var xMinChokeAmount = Math.min(0, _this.activeBlockOffset.x + moveX);
                var dragPosition = {
                    x: moveX - xChokeAmount - xMinChokeAmount,
                    y: moveY - yChokeAmount - yMinChokeAmount
                };
                _this.dragPosition = dragPosition;
                _this._getActiveBlock().currentPosition.setValue(dragPosition);
                if (dx != 0 || dy != 0)
                    _this.initialDragDone = true;
                _this.moveAnim(_this.state.activeBlock, _this.blockPositions, _this.itemOrder, _this.state.mergeBlock);
            }
        };
        _this.moveAnim = lodash_2.throttle(function (activeBlock, bp, itemOrder, mergeBlock) {
            if (!_this.release) {
                var closest_1 = activeBlock;
                var originalPosition = _this._getActiveBlock().origin;
                var distanceToOrigin = _this._getDistanceTo(originalPosition);
                var closestDistance_1 = distanceToOrigin;
                var merge_1 = false;
                _this.blockPositions &&
                    _this.blockPositions.forEach(function (block, index) {
                        if (index !== activeBlock && block.origin) {
                            var blockPosition = block.origin;
                            var distance = _this._getDistanceTo(blockPosition);
                            //condition to avoid "+" block
                            //condition to check whether block has come close to any other block
                            if (distance < closestDistance_1 && distance < _this.state.blockWidth) {
                                closest_1 = index;
                                closestDistance_1 = distance;
                                //this is the condition for group creation(mergeblock)
                                if (_this.props.merge) {
                                    if (distance < _this.state.blockWidth / 3) {
                                        var arr1 = [];
                                        if (closest_1 != mergeBlock) {
                                            //if already an mergeblock exist get it to actual size
                                            if (mergeBlock != null) {
                                                react_native_1.Animated.spring(bp[mergeBlock].pop, {
                                                    toValue: 0,
                                                    tension: 40,
                                                    friction: 3
                                                }).start();
                                            }
                                            arr1.push(react_native_1.Animated.spring(bp[activeBlock].hoverPop, {
                                                toValue: -1,
                                                tension: 40,
                                                friction: 3
                                            }));
                                            arr1.push(react_native_1.Animated.spring(bp[closest_1].pop, {
                                                toValue: -1,
                                                tension: 40,
                                                friction: 3
                                            }));
                                            react_native_1.Animated.parallel(arr1).start();
                                        }
                                        merge_1 = true;
                                    }
                                }
                            }
                        }
                    });
                _this.merge = merge_1;
                if (!merge_1) {
                    var arr = [];
                    //if there no mergegroup gesture the reposition  already existing mergeblock
                    //create empty blocks (for remaing space)
                    _this.ghostBlocks &&
                        _this.ghostBlocks.forEach(function (ghostBlockPosition) {
                            var distance = _this._getDistanceTo(ghostBlockPosition);
                            if (distance < closestDistance_1) {
                                closest_1 = activeBlock;
                                closestDistance_1 = distance;
                            }
                        });
                    //this is for reposition animation
                    if (closest_1 !== activeBlock) {
                        var date = new Date();
                        var timestamp = date.getTime();
                        var increment_1 = _this.itemOrder[closest_1].order < _this.itemOrder[activeBlock].order ? -1 : 1;
                        var arr = [];
                        var toPos, pos;
                        var closetOrder = _this.itemOrder[closest_1].order;
                        var activeOrder = _this.itemOrder[activeBlock].order;
                        var blockPositions = bp;
                        var _loop_1 = function (k) {
                            itemOrder &&
                                itemOrder.forEach(function (item, index) {
                                    if (item.order == k) {
                                        toPos = index;
                                    }
                                    if (item.order == k + increment_1) {
                                        pos = index;
                                    }
                                });
                            arr.push(react_native_1.Animated.timing(bp[pos].currentPosition, {
                                toValue: bp[toPos].origin,
                                duration: _this.props.blockTransitionDuration
                            }));
                        };
                        //repostion animation for the blocks which are supposed to be repositioned (zig zag animation)
                        for (var k = activeOrder; k != closetOrder; k += increment_1) {
                            _loop_1(k);
                        }
                        if (mergeBlock != null) {
                            arr.push(react_native_1.Animated.spring(bp[mergeBlock].pop, {
                                toValue: 0,
                                tension: 40,
                                friction: 3
                            }));
                            arr.push(react_native_1.Animated.spring(bp[activeBlock].hoverPop, {
                                toValue: 1,
                                tension: 40,
                                friction: 3
                            }));
                        }
                        //this part repositions all the blocks saves their respected positions and offesets
                        var dup_array = _this.deepCopy(_this.orderItem);
                        var currPos = blockPositions[closest_1].origin;
                        var tempOrderIndex = _this.itemOrder[closest_1].order;
                        for (var k = closetOrder; k != activeOrder; k -= increment_1) {
                            toPos = _this.orderItem[k].order;
                            pos = _this.orderItem[k - increment_1].order;
                            blockPositions[toPos].origin = blockPositions[pos].origin;
                            _this.itemOrder[toPos].order = _this.itemOrder[pos].order;
                            dup_array[k - increment_1].order = toPos;
                        }
                        blockPositions[activeBlock].origin = currPos;
                        dup_array[closetOrder].order = activeBlock;
                        _this.orderItem = dup_array;
                        _this.itemOrder[activeBlock].order = tempOrderIndex;
                        _this.blockPositions = blockPositions;
                        react_native_1.Animated.parallel(arr).start();
                    }
                }
                else if (closest_1 != mergeBlock) {
                    _this.setState({ mergeBlock: closest_1 });
                }
            }
        }, 400);
        _this.onReleaseBlock = function (evt, gestureState) {
            _this.release = true;
            _this.moveAnim.cancel();
            _this.returnBlockToOriginalPosition();
            _this.afterDragRelease();
            _this.merge = false;
        };
        _this.deleteBlockList = function (key) {
            _this.key = key;
            var activeKey = lodash_1.default.findKey(_this.itemOrder, function (oldItem) { return oldItem.key == key; });
            var activeBlock = activeKey;
            _this.deleteBlocks([activeBlock]);
            _this.afterDragRelease();
        };
        _this.blockAnimateFadeOut = function () {
            _this.state.deleteBlockOpacity.setValue(1);
            return new Promise(function (resolve, reject) {
                react_native_1.Animated.timing(_this.state.deleteBlockOpacity, {
                    toValue: 0,
                    duration: 2 * _this.props.activeBlockCenteringDuration
                }).start(resolve);
            });
        };
        _this.animateBlockMove = function (blockIndex, position) {
            return react_native_1.Animated.timing(_this._getBlock(blockIndex).currentPosition, {
                toValue: position,
                duration: _this.props.blockTransitionDuration
            });
        };
        _this.returnBlockToOriginalPosition = function () {
            _this.repositionMergeBlockAndUpdate();
            if (_this.state.mergeBlock != null) {
                react_native_1.Animated.spring(_this.blockPositions[_this.state.mergeBlock].pop, {
                    toValue: 0,
                    tension: 40,
                    friction: 3
                }).start();
            }
            _this.repostionBlocks();
            _this.repositionActiveBlock();
            _this.merge = false;
        };
        _this.afterDragRelease = function () {
            var itemOrder = lodash_1.default.sortBy(_this.itemOrder, function (item) { return item.order; });
            var orderItem = lodash_1.default.sortBy(_this.orderItem, function (item) { return item.order; });
            _this.props.onDragRelease && _this.props.onDragRelease({ itemOrder: itemOrder });
            _this.setState({ activeBlock: null });
            _this.setState({ mergeBlock: null });
            _this.panCapture = false;
        };
        _this.deleteModeMove = function (_a) {
            var x = _a.x, y = _a.y;
            var slideDistance = 50;
            var moveY = y + _this.activeBlockOffset.y - _this._getActiveBlock().origin.y;
            var adjustY = 0;
            if (moveY < 0)
                adjustY = moveY;
            else if (moveY > slideDistance)
                adjustY = moveY - slideDistance;
            var deletionSwipePercent = ((moveY - adjustY) / slideDistance) * 100;
            _this._getActiveBlock().currentPosition.y.setValue(y - adjustY);
            _this.setState({ deletionSwipePercent: deletionSwipePercent });
        };
        _this.reAssessGridRows = function () {
            var oldRows = _this.rows;
            _this.rows = Math.ceil(_this.items.length / _this.itemsPerRow);
            if (_this.state.blockWidth && oldRows != _this.rows)
                _this._animateGridHeight();
        };
        _this.saveBlockPositions = function (key) {
            return function (_a) {
                var nativeEvent = _a.nativeEvent;
                var blockPositions = _this.blockPositions;
                if (!blockPositions[key]) {
                    var blockPositionsSetCount = blockPositions[key]
                        ? _this.blockPositionsSetCount
                        : ++_this.blockPositionsSetCount;
                    var thisPosition = {
                        x: nativeEvent.layout.x,
                        y: nativeEvent.layout.y
                    };
                    blockPositions[key] = {
                        currentPosition: new react_native_1.Animated.ValueXY(thisPosition),
                        origin: thisPosition,
                        pop: new react_native_1.Animated.Value(0),
                        hoverPop: new react_native_1.Animated.Value(0)
                    };
                    if (_this._blockPositionsSet()) {
                        _this.blockPositions = blockPositions;
                        _this.setGhostPositions();
                        _this.initialLayoutDone = true;
                    }
                }
            };
        };
        _this.getNextBlockCoordinates = function () {
            var blockWidth = _this.state.blockWidth;
            var blockHeight = _this.state.blockHeight;
            var placeOnRow = _this.items.length % _this.itemsPerRow;
            var y = blockHeight * Math.floor(_this.items.length / _this.itemsPerRow) + styles_1.Style.getHeight(20);
            var x = placeOnRow * blockWidth;
            return { x: x, y: y };
        };
        _this.setGhostPositions = function () {
            _this.ghostBlocks = [];
            _this.reAssessGridRows();
            var blockWidth = _this.state.blockWidth;
            var blockHeight = _this.state.blockHeight;
            var fullGridItemCount = _this.rows * _this.itemsPerRow;
            var ghostBlockCount = fullGridItemCount - _this.items.length;
            var y = blockHeight * (_this.rows - 1);
            var initialX = blockWidth * (_this.itemsPerRow - ghostBlockCount);
            for (var i = 0; i < ghostBlockCount; ++i) {
                var x = initialX + blockWidth * i;
                _this.ghostBlocks.push({ x: x, y: y });
            }
        };
        _this.activateDrag = function (key) {
            return function () {
                _this.release = false;
                _this.props.onDragStart(key);
                var favKey = _this.items[key].key;
                _this.panCapture = true;
                _this.setState({ activeBlock: key });
                _this._defaultDragActivationWiggle();
            };
        };
        _this.handleTap = function (_a, key) {
            var _b = _a.onTap, onTap = _b === void 0 ? NULL_FN : _b, _c = _a.onDoubleTap, onDoubleTap = _c === void 0 ? NULL_FN : _c;
            return function () {
                if (_this.tapIgnore)
                    _this._resetTapIgnoreTime();
                else if (onDoubleTap != null) {
                    _this.doubleTapWait ? _this._onDoubleTap(onDoubleTap) : _this._onSingleTap(onTap);
                }
                else
                    onTap();
            };
        };
        // Helpers & other boring stuff
        _this._getActiveBlock = function () { return _this.blockPositions[_this.state.activeBlock]; };
        _this._getBlock = function (blockIndex) { return _this.blockPositions[blockIndex]; };
        _this._blockPositionsSet = function () { return _this.blockPositionsSetCount == _this.items.length; };
        //when the items added or deleted from the backend we maitain it
        _this._saveItemOrder = function (items) {
            items &&
                items.forEach(function (item, index) {
                    var foundKey = lodash_1.default.findKey(_this.itemOrder, function (oldItem) { return oldItem.key == item.key; });
                    if (foundKey) {
                        _this.items[foundKey] = item;
                    }
                    else {
                        _this.itemOrder.push({ key: item.key, ref: item.ref, order: _this.items.length });
                        _this.orderItem.push({
                            key: item.key,
                            ref: item.ref,
                            order: _this.items.length,
                            originKey: _this.items.length
                        });
                        if (!_this.initialLayoutDone) {
                            _this.items.push(item);
                        }
                        else {
                            var blockPositionsSetCount = ++_this.blockPositionsSetCount;
                            var thisPosition = _this.getNextBlockCoordinates();
                            _this.blockPositions.push({
                                currentPosition: new react_native_1.Animated.ValueXY(thisPosition),
                                origin: thisPosition,
                                pop: new react_native_1.Animated.Value(0),
                                hoverPop: new react_native_1.Animated.Value(0)
                            });
                            _this.items.push(item);
                            _this.setGhostPositions();
                        }
                    }
                });
        };
        _this._removeDisappearedChildren = function (items) {
            var deleteBlockIndices = [];
            _this.itemOrder &&
                lodash_1.default.cloneDeep(_this.itemOrder).forEach(function (item, index) {
                    if (!lodash_1.default.findKey(items, function (oldItem) { return oldItem.key == item.key; })) {
                        deleteBlockIndices.push(index);
                    }
                });
            if (deleteBlockIndices.length > 0) {
                _this.deleteBlocks(deleteBlockIndices);
            }
        };
        _this.deleteBlocks = function (deleteBlockIndices) {
            var blockPositionsSetCount = _this.blockPositionsSetCount;
            lodash_1.default.sortBy(deleteBlockIndices, function (index) { return -index; }).forEach(function (index) {
                --blockPositionsSetCount;
                var order = _this.itemOrder[index].order;
                _this.blockPositions.splice(index, 1);
                var indexOrder = _this.findIndex(_this.orderItem, index);
                _this._fixItemOrderOnDeletion(_this.itemOrder[index]);
                _this.orderItem.splice(indexOrder, 1);
                _this.itemOrder.splice(index, 1);
                _this._fixOrderItemOnDeletion(_this.itemOrder);
                _this.items.splice(index, 1);
            });
            var arr = [];
            _this.blockPositionsSetCount = blockPositionsSetCount;
            _this.items &&
                _this.items.forEach(function (item, order) {
                    var blockIndex = lodash_1.default.findKey(_this.itemOrder, function (item) { return item.order == order; });
                    var x = (order * _this.state.blockWidth) % (_this.itemsPerRow * _this.state.blockWidth);
                    var y = Math.floor(order / _this.itemsPerRow) * _this.state.blockHeight + styles_1.Style.getHeight(20);
                    _this.blockPositions[blockIndex].origin = { x: x, y: y };
                    if (_this.key == null) {
                        _this.blockPositions[blockIndex].currentPosition = new react_native_1.Animated.ValueXY({ x: x, y: y });
                    }
                    else
                        arr.push(_this.animateBlockMove(blockIndex, { x: x, y: y }));
                });
            if (arr.length > 0) {
                react_native_1.Animated.parallel(arr).start(function () {
                    if (_this.key != null)
                        _this.props.onDeleteItem(_this.key);
                    _this.key = null;
                    _this.setGhostPositions();
                });
            }
            else {
                _this.setGhostPositions();
            }
        };
        _this._fixItemOrderOnDeletion = function (orderItem) {
            if (!orderItem)
                return false;
            orderItem.order--;
            _this._fixItemOrderOnDeletion(lodash_1.default.find(_this.itemOrder, function (item) { return item.order == orderItem.order + 2; }));
        };
        _this._fixOrderItemOnDeletion = function (itemOrder) {
            var orderItem = _this.orderItem;
            for (var i = 0; i < itemOrder.length; i++) {
                orderItem[itemOrder[i].order].order = i;
            }
            _this.orderItem = orderItem;
        };
        _this._animateGridHeight = function () {
            _this.gridHeightTarget = _this.rows * _this.state.blockHeight;
            if (_this.gridHeightTarget == _this.state.gridLayout.height || _this.state.gridLayout.height == 0)
                _this.state.gridHeight.setValue(_this.gridHeightTarget);
            else if (_this.state.gridHeight._value !== _this.gridHeightTarget) {
                react_native_1.Animated.timing(_this.state.gridHeight, {
                    toValue: _this.gridHeightTarget,
                    duration: _this.props.blockTransitionDuration
                }).start();
            }
        };
        _this._getDistanceTo = function (point) {
            var xDistance = _this.dragPosition.x + _this.activeBlockOffset.x - point.x;
            var yDistance = _this.dragPosition.y + _this.activeBlockOffset.y - point.y;
            return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        };
        _this._defaultDragActivationWiggle = function () {
            if (!_this.props.dragStartAnimation) {
                var activeBlock = _this._getActiveBlock();
                react_native_1.Animated.spring(activeBlock.hoverPop, {
                    toValue: 1,
                    friction: 3,
                    tension: 40
                }).start(function () { });
            }
        };
        _this._blockActivationWiggle = function (key) {
            return (_this.props.dragStartAnimation || {
                transform: [
                    {
                        scale: _this._getBlock(key).hoverPop.interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: [0.8, 1, 1.3]
                        })
                    }
                ]
            });
        };
        _this._onSingleTap = function (onTap) {
            _this.doubleTapWait = true;
            _this.tapTimer = setTimeout(function () {
                _this.doubleTapWait = false;
                onTap();
            }, _this.doubleTapTreshold);
        };
        _this._onDoubleTap = function (onDoubleTap) {
            _this._resetTapIgnoreTime();
            _this.doubleTapWait = false;
            _this.tapIgnore = true;
            onDoubleTap();
        };
        _this._resetTapIgnoreTime = function () {
            clearTimeout(_this.tapTimer);
            _this.tapTimer = setTimeout(function () { return (_this.tapIgnore = false); }, _this.props.doubleTapThreshold);
        };
        _this.onActiveBlockIsSet = function (fn) {
            return function (evt, gestureState) {
                if (_this.state.activeBlock != null)
                    fn(evt, gestureState);
            };
        };
        _this._getImageDeleteIconStyle = function (key) {
            return [
                {
                    position: 'absolute',
                    top: _this.state.blockHeight / 2 - 15,
                    left: _this.state.blockWidth / 2 - 15,
                    width: 30,
                    height: 30,
                    opacity: .5
                },
                _this.state.activeBlock == key
                    && _this._getBlock(key).origin &&
                    { opacity: .5 + _this._getDynamicOpacity(key) }
            ];
        };
        _this._getGridStyle = function () {
            return [
                styles.sortableGrid,
                _this.props.style,
                _this._blockPositionsSet() && { height: _this.state.gridHeight }
            ];
        };
        _this._getItemWrapperStyle = function (key) {
            return [
                { flex: 1 },
                _this.state.activeBlock == key &&
                    _this.state.deleteModeOn &&
                    _this._getBlock(key).origin && { opacity: 1.5 - _this._getDynamicOpacity(key) }
            ];
        };
        _this._getDynamicOpacity = function (key) {
            return (_this._getBlock(key).currentPosition.y._value +
                _this._getBlock(key).currentPosition.y._offset -
                _this._getBlock(key).origin.y) /
                50;
        };
        _this._getBlockStyle = function (key) {
            return [
                {
                    width: _this.state.blockWidth,
                    height: _this.state.blockHeight,
                    justifyContent: 'center'
                },
                _this._blockPositionsSet() && {
                    position: 'absolute',
                    top: _this._getBlock(key).currentPosition.getLayout().top,
                    left: _this._getBlock(key).currentPosition.getLayout().left,
                    transform: [
                        {
                            scale: _this._getBlock(key).pop.interpolate({
                                inputRange: [-1, 0, 1],
                                outputRange: [0.5, 1, 1]
                            })
                        },
                        {
                            translateY: _this._getBlock(key).pop.interpolate({
                                inputRange: [-1, 0, 1],
                                outputRange: [-1 * 50, 0, 0]
                            })
                        }
                    ]
                },
                _this.state.activeBlock == key && _this._blockActivationWiggle(key),
                _this.state.activeBlock == key && { zIndex: 1 },
                _this.state.deleteBlock != null && { zIndex: 2 },
                _this.state.deleteBlock == key && { opacity: _this.state.deleteBlockOpacity },
            ];
        };
        _this.state = {
            gridLayout: null,
            random: null,
            startDragWiggle: new react_native_1.Animated.Value(0),
            activeBlock: null,
            mergeBlock: null,
            blockWidth: null,
            blockHeight: null,
            gridHeight: new react_native_1.Animated.Value(0),
            deleteModeOn: false,
            deletionSwipePercent: 0,
            deleteBlock: null,
            deleteBlockOpacity: new react_native_1.Animated.Value(1),
            deletedItems: []
        };
        _this.itemsPerRow = _this.props.itemsPerRow;
        _this.dragActivationThreshold = _this.props.dragActivationTreshold;
        _this.dragStartAnimation = _this.props.dragStartAnimation;
        _this.doubleTapTreshold = DOUBLE_TAP_THRESHOLD;
        _this._panResponder = null;
        _this.rows = null;
        _this.dragPosition = null;
        _this.activeBlockOffset = null;
        _this.blockWidth = null;
        _this.blockPositionsSetCount = 0;
        _this.blockHeight = null;
        _this.blockPositions = [];
        _this.toggleDeleteMode = _this.toggleDeleteMode.bind(_this);
        _this.gridHeightTarget = null;
        _this.ghostBlocks = [];
        _this.itemOrder = [];
        _this.showAddNew = false;
        _this.orderItem = [];
        _this.merge = false;
        _this.panCapture = false;
        _this.items = [];
        _this.initialLayoutDone = false;
        _this.initialDragDone = false;
        _this.config = { tension: 40, friction: 3 };
        _this.tapTimer = null;
        _this.tapIgnore = false;
        _this.doubleTapWait = false;
        _this.assessGridSize = _this.assessGridSize.bind(_this);
        _this.release = false;
        _this.key = null;
        _this._getGridStyle = _this._getGridStyle.bind(_this);
        _this._getBlockStyle = _this._getBlockStyle.bind(_this);
        _this.saveBlockPositions = _this.saveBlockPositions.bind(_this);
        _this.activateDrag = _this.activateDrag.bind(_this);
        _this.handleTap = _this.handleTap.bind(_this);
        _this.onBlockPress = _this.onBlockPress.bind(_this);
        _this._getItemWrapperStyle = _this._getItemWrapperStyle.bind(_this);
        _this.deleteBlockList = _this.deleteBlockList.bind(_this);
        return _this;
    }
    DragDropGrid.prototype.render = function () {
        var _this = this;
        return (<react_native_1.Animated.View style={this._getGridStyle()} onLayout={this.assessGridSize} key={this.blockPositions}>
        {this.state.gridLayout &&
            this.blockPositions &&
            this.items.map(function (item, key) {
                return (<Tile_1.default key={key} style={_this._getBlockStyle(key)} onLayout={_this.saveBlockPositions(key)} panHandlers={_this._panResponder && _this._panResponder.panHandlers} delayLongPress={_this.dragActivationThreshold} onLongPress={_this.activateDrag(key)} onPress={_this.handleTap(item.props, key)} itemWrapperStyle={_this._getItemWrapperStyle(key)} inactive={false}>
            {item}
          </Tile_1.default>);
            })}
      </react_native_1.Animated.View>);
    };
    DragDropGrid.prototype.componentDidMount = function () {
        this.createTouchHandlers();
        this.handleNewProps(this.props);
    };
    DragDropGrid.prototype.componentWillUnmount = function () {
        if (this.tapTimer)
            clearTimeout(this.tapTimer);
    };
    DragDropGrid.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps != this.props) {
            this.handleNewProps(this.props);
        }
    };
    DragDropGrid.prototype.repostionBlocks = function () {
        var arr = [];
        var bp = this.blockPositions;
        for (var i = 0; i < bp.length; i++) {
            react_native_1.Animated.timing(bp[i].currentPosition, {
                toValue: bp[i].origin,
                duration: this.props.activeBlockCenteringDuration
            }).start();
        }
    };
    DragDropGrid.prototype.repositionMergeBlockAndUpdate = function () {
        if (this.props.merge) {
            var closest = this.state.activeBlock;
            var originalPosition = this._getActiveBlock().origin;
            var distanceToOrigin = this._getDistanceTo(originalPosition);
            var closestDistance = distanceToOrigin;
            var bp = this.blockPositions;
            var mergeBlock = this.state.mergeBlock;
            var activeBlock = this.state.activeBlock;
            if (mergeBlock != null) {
                var blockPosition = this._getBlock(mergeBlock).origin;
                var distance = this._getDistanceTo(blockPosition);
                if (distance < closestDistance && distance < this.state.blockWidth / 4) {
                    this.props.onMerge(this.items[activeBlock].key, this.items[mergeBlock].key);
                }
                react_native_1.Animated.spring(bp[mergeBlock].pop, {
                    toValue: 0,
                    tension: 40,
                    friction: 3
                }).start();
            }
        }
    };
    DragDropGrid.prototype.repositionActiveBlock = function () {
        var activeBlockCurrentPosition = this._getActiveBlock().currentPosition;
        activeBlockCurrentPosition.flattenOffset();
        var toValueAnim = this._getActiveBlock().origin;
        var hoverPopOfItem = this._getActiveBlock().hoverPop;
        hoverPopOfItem.stopAnimation();
        react_native_1.Animated.timing(activeBlockCurrentPosition, {
            toValue: toValueAnim,
            duration: this.props.activeBlockCenteringDuration
        }).start();
        react_native_1.Animated.spring(hoverPopOfItem, {
            toValue: 0,
            tension: 40,
            friction: 3
        }).start();
    };
    DragDropGrid.prototype.assessGridSize = function (_a) {
        var nativeEvent = _a.nativeEvent;
        if (this.props.itemWidth < nativeEvent.layout.width) {
            this.itemsPerRow = Math.floor(nativeEvent.layout.width / this.props.itemWidth);
            this.blockWidth = nativeEvent.layout.width / this.itemsPerRow;
            this.blockHeight = this.props.itemHeight || this.blockWidth;
        }
        else {
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
    };
    DragDropGrid.prototype.deepCopy = function (arr) {
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
    };
    DragDropGrid.prototype.deleteDisapearedItems = function (items) {
        var _this = this;
        var deleteBlockIndices = [];
        var blockPositions = this.blockPositions;
        var blockPositionsSetCount = this.blockPositionsSetCount;
        this.itemOrder &&
            lodash_1.default.cloneDeep(this.itemOrder).forEach(function (item, index) {
                if (!lodash_1.default.findKey(items, function (oldItem) { return oldItem.key == item.key; })) {
                    deleteBlockIndices.push(index);
                }
            });
        if (deleteBlockIndices.length > 0) {
            deleteBlockIndices &&
                lodash_1.default.sortBy(deleteBlockIndices, function (index) { return -index; }).forEach(function (index) {
                    --blockPositionsSetCount;
                    var order = _this.itemOrder[index].order;
                    blockPositions.splice(index, 1);
                    var indexOrder = _this.findIndex(_this.orderItem, index);
                    _this._fixItemOrderOnDeletion(_this.itemOrder[index]);
                    _this.orderItem.splice(indexOrder, 1);
                    _this.itemOrder.splice(index, 1);
                    _this._fixOrderItemOnDeletion(_this.itemOrder);
                    _this.items.splice(index, 1);
                });
            this.blockPositionsSetCount = blockPositionsSetCount;
            return blockPositions;
        }
    };
    DragDropGrid.prototype.isNotEqual = function (items, currentItems) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].key != currentItems[i].key) {
                return true;
            }
        }
        return false;
    };
    DragDropGrid.prototype.unloadLastTile = function () {
        if (this.blockPositions.length > 0) {
            this.itemOrder.splice(this.itemOrder.length - 1, 1);
            this.orderItem.splice(this.orderItem.length - 1, 1);
            this.items.splice(this.items.length - 1, 1);
            this.blockPositions.splice(this.blockPositions.length - 1, 1);
            this.blockPositionsSetCount = this.blockPositionsSetCount - 1;
        }
    };
    DragDropGrid.prototype.findIndex = function (orderItem, key) {
        for (var i = 0; i < orderItem.length; i++) {
            if (orderItem[i].order == key) {
                return i;
            }
        }
        return -1;
    };
    DragDropGrid.prototype._assignReceivedPropertiesIntoThis = function (properties) {
        var _this = this;
        properties &&
            Object.keys(properties).forEach(function (property) {
                if (_this[property])
                    _this[property] = properties[property];
            });
        this.dragStartAnimation = properties.dragStartAnimation;
    };
    DragDropGrid.prototype.createTouchHandlers = function () {
        var _this = this;
        this._panResponder = react_native_1.PanResponder.create({
            onPanResponderTerminate: function (evt, gestureState) { },
            onStartShouldSetPanResponder: function (evt, gestureState) { return true; },
            onStartShouldSetPanResponderCapture: function (evt, gestureState) { return false; },
            onMoveShouldSetPanResponder: function (evt, gestureState) { return _this.panCapture; },
            onMoveShouldSetPanResponderCapture: function (evt, gestureState) { return _this.panCapture; },
            onShouldBlockNativeResponder: function (evt, gestureState) { return false; },
            onPanResponderTerminationRequest: function (evt, gestureState) { return false; },
            onPanResponderGrant: this.onActiveBlockIsSet(this.onStartDrag),
            onPanResponderMove: this.onActiveBlockIsSet(this.onMoveBlock),
            onPanResponderRelease: this.onActiveBlockIsSet(this.onReleaseBlock)
        });
    };
    return DragDropGrid;
}(React.Component));
exports.DragDropGrid = DragDropGrid;
var styles = react_native_1.StyleSheet.create({
    sortableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1
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
//# sourceMappingURL=dragDropGrid.js.map