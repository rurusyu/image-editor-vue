<template>
  <div class="home">
     
    <div class="menu">
      <div class="rect" @click="clickRect">사각형</div>
      <div class="rect" @click="clickTriangle">삼각형</div>
      <button @click="addCanvas">+</button>
    </div>
    <div>
      <wrapper-canvas :NumberOfCanvas="NumberOfCanvas" :addShape="addShape"></wrapper-canvas>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import WrapperCanvas from '@/components/WrapperCanvas.vue'

export default {
  name: 'Home',
  components: {
    WrapperCanvas,
  },
  data(){
    return {
      NumberOfCanvas: 1,
      addShape:''
    }
  },
  beforeUpdate(){
    console.log('update');
  },
  methods:{
    addCanvas(){
      this.NumberOfCanvas++;
    },
    clickRect(){
      this.addShape = 'rect';
    },
    clickTriangle(){
      this.addShape = 'tri';
    },
  
  }
}
</script>
<style lang="scss" scoped>
.home{
  display: flex;
  .menu {
    border: 1px solid blue;
    width: 200px;
    height: 300px;

    .rect{
      border: 1px solid red;
      width: 200px;
      height: 50px;

    }
  }

  button{
    width: 100px;
    height: 50px;
    background-color: #007AFF;
    color: white;
    font-size: 20px;
  }
}
</style>