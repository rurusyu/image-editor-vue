<template>
  <div>
    <canvas ref="can" width="400" height="400" id="canvas1"></canvas>
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
      rect:0,
      triangle:0,
      circle:0,
    }
  },
  props:{
    shapeList: {
      type: Array,
      required: false,
    }
  },
   watch:{
    shapeList(){
      console.log('watch',this.$props.shapeList[1]);
    
    }
  },
  created(){
    this.rect = this.$props.shapeList[0].rect;
    this.triangle = this.$props.shapeList[1].triangle;
    this.circle = this.$props.shapeList[2].circle;
    console.log(this.rect,this.triangle,this.circle);
  },
  mounted(){
    this.ref = this.$refs.can;
    this.canvas = new fabric.Canvas(this.ref);
    console.log('mounted',this.$props.shapeList[0].rect);
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
    }
  }
}
</script>
<style scoped lang="scss">
#canvas1 {
  border : 1px solid red;
}
</style>

