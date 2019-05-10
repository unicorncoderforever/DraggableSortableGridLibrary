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
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var react_native_1 = require("react-native");
var ITEMS_PER_ROW = 4;
var DRAG_ACTIVATION_THRESHOLD = 200; // Milliseconds
var BLOCK_TRANSITION_DURATION = 300; // Milliseconds
var ACTIVE_BLOCK_CENTERING_DURATION = 200; // Milliseconds
var DOUBLE_TAP_THRESHOLD = 150; // Milliseconds
var NULL_FN = function () { };
var Tile = /** @class */ (function (_super) {
    __extends(Tile, _super);
    function Tile(props) {
        return _super.call(this, props) || this;
    }
    Tile.prototype.render = function () {
        var _this = this;
        return (<react_native_1.Animated.View style={this.props.style} onLayout={this.props.onLayout} {...this.props.panHandlers}>
          <react_native_1.TouchableWithoutFeedback style={{ flex: 1 }} delayLongPress={this.props.delayLongPress} onLongPress={function () { return _this.props.inactive || _this.props.onLongPress(); }} onPress={function () { return _this.props.inactive || _this.props.onPress(); }}>
          <react_native_1.View style={styles.itemImageContainer}>
          <react_native_1.View style={this.props.itemWrapperStyle}>{this.props.children}</react_native_1.View>
          </react_native_1.View>
        </react_native_1.TouchableWithoutFeedback>
      </react_native_1.Animated.View>);
    };
    return Tile;
}(React.Component));
var styles = react_native_1.StyleSheet.create({
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
exports.default = Tile;
//# sourceMappingURL=Tile.js.map