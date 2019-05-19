# DragDropLibrary
A Sample React Native Library for Draggable Sortable Grid , Performs operations like 

 - re-ordering grid items, 
 - deleting animation grid items 
 -  merge animation for grid items


<p align="center">
  <img alt="Issue Stats" width="400" src="https://github.com/unicorncoderforever/DragDropLibrary/blob/master/demo.gif?raw=true">
</p>


## Library Installation

> npm i react-native-drag-drop-grid-library --save

## Sample Implementation
Suppose alphabets is an array of objects

 ```javascript
 
  this.alphabets = ['1','2','3','4','5','6',
    '7','8','9','10','11','12',
    '13','14','15','16','17','18',
    '19','20','21','22','23','24'];
 ```

# Features:
- Sortable(Draggable) Grid feature:
 ```javascript
render(){
 <View style={{ flex: 1 }}>
 <DragDropGrid
      ref={sortGrid => {
        this.sortGrid = sortGrid;
      }}
      blockTransitionDuration={400}
      activeBlockCenteringDuration={200}
      itemsPerRow={4}
      dragActivationTreshold={200}
      merge={true}
      onDragRelease   = { (itemOrder) => console.log("Drag was released, the blocks are in the following order: ", itemOrder)       }   
      onDragStart = { (key)          => console.log("Some block is being dragged now!",key) }>
        {
          this.alphabets.map( (letter, index) =>
            <View key={letter} style={[styles.block, { backgroundColor: this.getColor() }]}
            >
            <Text
             style={{color: 'white', fontSize: 50}}>{letter}</Text>
            </View>
          )
        }
     </DragDropGrid>
     </View>
 }
     

```
- Merge on Grid Item Overlap
```javascript

render(){
 <View style={{ flex: 1 }}>
     <DragDropGrid
      ref={sortGrid => {
        this.sortGrid = sortGrid;
      }}
      blockTransitionDuration={400}
      activeBlockCenteringDuration={200}
      itemsPerRow={4}
      dragActivationTreshold={200}
      onDragRelease   = { (itemOrder) => console.log("Drag was released, the blocks are in the following order: ", itemOrder)       }   
      onDragStart = { (key)          => console.log("Some block is being dragged now!",key) }   
      onMerge = {(itemKey,mergeBlockKey) => console.log("item and merge item",itemKey,mergeBlockKey)}
      merge={true}>
        {
          this.alphabets.map( (letter, index) =>
            <View key={letter} style={[styles.block, { backgroundColor: this.getColor() }]}
            >
            <Text
             style={{color: 'white', fontSize: 50}}>{letter}</Text>
            </View>
          )
        }
      </DragDropGrid>
    </View>
  }

```
- Delete Grid Items
```javascript

onRemove(letter){
this.sortGrid.deleteBlockList(letter);
}


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
      onDragRelease   = { (itemOrder) => console.log("Drag was released, the blocks are in the following order: ",itemOrder)}       onDragStart = { (key)          => console.log("Some block is being dragged now!",key) }   
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
  
  ```
