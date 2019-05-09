/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native'

import {DragDropGrid }from "react-native-drag-drop-grid-library"
import { Style } from './styles';
export default class App extends Component<any, any> {
  alphabets:Array<any>
  sortGrid:any;
  constructor(props: any) {
    super(props);
    this.alphabets = ['1','2','3','4','5','6',
    '7','8','9','10','11','12',
    '13','14','15','16','17','18',
    '19','20','21','22','23','24'];
    this.onRemove = this.onRemove.bind(this);
  }

onRemove(letter){
this.sortGrid.deleteBlockList(letter);
}
  getColor() {
    let r = this.randomRGB()
    let g = this.randomRGB()
    let b = this.randomRGB()
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
  };
      

randomRGB = () => 160 + Math.random()*85

render() {
    return (
    <View style={{ flex: 1 }}>
    <DragDropGrid
    ref={sortGrid => {
      this.sortGrid = sortGrid;
    }}
      blockTransitionDuration={400}
      activeBlockCenteringDuration={200}
      itemsPerRow={4}
      dragActivationTreshold={200}
      onDragRelease   = { (itemOrder) => console.log("Drag was released, the blocks are in the following order: ", itemOrder) }   
      onDragStart = { (key)          => console.log("Some block is being dragged now!",key) }   
      onMerge = {(itemKey,mergeBlockKey) => console.log("item and merge item",itemKey,mergeBlockKey)}
      merge={true}
      onDeleteItem   = { (item) => console.log("Item was deleted:", item) }>
        {
          this.alphabets.map( (letter, index) =>
            <View key={letter} style={[styles.block, { backgroundColor: this.getColor() }]}
            >
            <Text
             style={{color: 'white', fontSize: 50}}>{letter}</Text>
              <View style={[styles.close]}>
              <TouchableOpacity
              activeOpacity={0.5}
              onPress={()=> this.onRemove(letter)}>
              <View
              style={[
              styles.circle,
              { width: Style.getWidth(25), height: Style.getWidth(25), backgroundColor: '#1A325E' },
              this.props.style
              ]}
              >
             <Image resizeMode="contain" style={{ height: Style.getHeight(19) }} source={require('./assets/close_white.png')} />
            </View>
            </TouchableOpacity>
            </View>
            </View>
          )
        }
      </DragDropGrid>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    margin: 8,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    borderRadius: 100 / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  close: {
    position: 'absolute',
    right: 0,
    top: 0
  }
});