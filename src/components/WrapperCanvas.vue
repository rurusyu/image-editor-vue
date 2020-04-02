<template>
  <div class="wapper-canvas">
    <div v-for="item in NumberOfCanvas" :key="item">
      <canvas-view :addShape="addShape" ref="foo"></canvas-view>
    </div>
     <button @click="loadRef">ref불러오기111</button>
  </div>
</template>

<script>
import CanvasView from '@/components/Canvas.vue'

//저장하는 순간에 get
export default {
  name: 'WrapperCanvas',
  components: {
    CanvasView
  },
  props:{
    NumberOfCanvas:{
      type: Number,
      required: false,
    },
    addShape:{
      type: String,
      required: false,
    }
  },
 
  mounted(){
    console.log('wrapper',this.$props.addShape);
  },
  methods:{
    loadRef(){
      console.log('ref클릭', this.$refs.foo[1].addRect());
    }
  }
}
</script>

<style>
.wapper-canvas{
  border: 1px solid red;
 
}
</style>