<template>
  <div class="wapper-canvas">
    <div v-for="(item, index) in NumberOfCanvas" :key="item" @click="selectCanvas(index+1)">
      <canvas-view ref="foo" :backgroundImage="backgroundImage" :colorPicker="colorPicker" :images="images" :download="download" :currCanvas="currCanvas" ></canvas-view>
    </div>
  
  </div>
</template>

<script>
import CanvasView from '@/components/Canvas.vue'

//저장하는 순간에 get
export default {
  name: 'WrapperCanvas',
  components: {
    CanvasView,
  },
  props:{
    NumberOfCanvas:{
      type: Number,
      required: false,
    },
    backgroundImage: {
      type: Object,
      required: false
    },
    images: {
      type: Array,
      required: true
    },
    addShape: {
      type: String,
      required: false,
    },
    download: {
      type: Boolean,
      required: true
    },
    colorPicker: {
      type: Boolean,
      required: true
    },
    currCanvas: {
      type: Object,
      required: false,
    }
  },
  watch:{
    addShape(){
      console.log('das', this.$refs.foo[0]);
      switch(this.$props.addShape){
        case'rect':
          return this.$refs.foo[0].addRect();
        case'circle':
          return this.$refs.foo[0].addCircle();
        case'text':
          return this.$refs.foo[0].addText();
      }
    }
  },
  
  created(){
  
  },
  mounted(){
    console.log('wrapper',this.$props.addShape);
  },
  methods:{
    loadRef(){
      console.log('ref클릭', this.$refs.foo[0].addRect());
    },
    selectCanvas(index){// eslint-disable-line no-unused-vars
      // console.log('클릭',index);
    },
  }
}
</script>

<style lang="scss" scoped>
.wapper-canvas{
  // border: 1px solid red;
}

.wx-01{
  border: 10px solid blue;
  width: 100px;
  height: 100px;
}
</style>