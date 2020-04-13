<template>
  <div>
    <canvas ref="can" width="400" height="400" class="canvas1" ></canvas>
    <button @click="saveObjects">Save</button>
    <!-- <canvas ref="can" width="200" height="200" class="canvas1" v-else></canvas> -->
  </div>
</template>

<script>

import { fabric } from 'fabric';

export default {
  name: 'Canvas',
 
  data(){
    return {
      canvas:'',
      ref:'',
      shapeList:[]
    }
  },
  props:{
    className:{
       type: String,
       required: true,
     },
  },
  created(){

  },
  mounted(){
    this.ref = this.$refs.can;
    this.canvas = new fabric.Canvas(this.ref);
    this.data = this.canvas;
    console.log('name11',this.$props.className);

    let items = window.localStorage.getItem('_tempItems');

    if(items) {
      this.canvas.loadFromJSON(items, function(o, object) {
        fabric.log(o, object);
      });
    }
  },
 beforeUpdate(){
   console.log('update');
 },

  methods:{
    addRect(){
      console.log('canvas', this.canvas);
      if(!this.$props.className){
        let rect = new fabric.Rect({
           left: 10,
           top: 10,
           height: 50,
           width: 50,
           fill: 'green',
           stroke:'black'
        })
        this.canvas.add(rect);
        return rect;
      }
      else {
        let rect = new fabric.Rect({
           left: 10 / 10,
           top: 10 / 10,
           height: 50 / 10,
           width: 50 / 10,
           fill: 'green',
           stroke:'black'
        })
        this.canvas.add(rect);
        return rect;
   }
    },
    addTriAngle(){
      let tri = new fabric.Triangle({
         left: 10,
         top: 10,
         height: 50,
         width: 50,
         fill: 'red',
         stroke:'black'
      })
      this.canvas.add(tri);
    },
    saveObjects() {
      window.localStorage.setItem('_tempItems', JSON.stringify({objects: this.canvas._objects}));
    }
  }
}
</script>
<style scoped lang="scss">
.canvas1 {
  border: 1px solid red;
  left: 0px;
  top: 0px;
  width: 552px;
  height: 312px;
  /* transform: rotate(0deg); */
}

</style>

