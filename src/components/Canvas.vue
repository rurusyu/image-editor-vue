<template>
  <div>
    <canvas ref="can" width="400" height="400" id="canvas1"></canvas>
     <button @click="loadRef">ref불러오기</button>
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
    addShape:{
      type: String,
      required: false,
    }
  },
  watch:{
    addShape(){
    this.shapeList.push(this.$props.addShape);
       this.shapeList.map((item)=>{
         if(item === 'rect'){
           this.addRect();
           this.shapeList = [];
         }else{
           this.addTriAngle();
           this.shapeList = [];
         }
       });   
    }
  },
  created(){

  },
  mounted(){
    this.ref = this.$refs.can;
    this.canvas = new fabric.Canvas(this.ref);
    this.data = this.canvas;
  },
 beforeUpdate(){
   console.log('update');
 },

  methods:{
    addRect(){
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
     loadRef(){
      console.log('ref클릭',this.$refs.can);
    }
  }
}
</script>
<style scoped lang="scss">
#canvas1 {
  border: 1px solid red;
  left: 0px;
  top: 0px;
  width: 552px;
  height: 312px;
  transform: rotate(0deg);
}
</style>

