<template>
  <div class="home">
    <div v-for="item in num" :key="item">
      <canvas-view :shapeList="shapeList"></canvas-view>
    </div>
    <button @click="addCanvas">+</button>
    <div class="menu">
      <div class="rect" @click="clickRect">사각형</div>
      <div class="rect" @click="clickTriAngle">삼각형</div>
      <div class="rect" @click="clickCircle">원형</div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import CanvasView from '@/components/Canvas.vue'

export default {
  name: 'Home',
  components: {
    CanvasView
  },
  data(){
    return {
      num: 1,
      shapeList: [
        {rect:0},
        {triangle:0},
        {circle:0},
      ]
    }
  },
  methods:{
    addCanvas(){
      this.num++;
      console.log('num', this.num);
    },
    clickRect(){
      console.log('클릭');
      // this.shapeList.push('rect')
      this.shapeList[0].rect++;
      this.$set(this.shapeList);
      
    },
    clickTriAngle(){
      console.log('클릭');
      // this.shapeList.push('rect')
      this.shapeList[1].triangle++;
      this.$set(this.shapeList);
    },
    clickCircle(){
      console.log('클릭');
      // this.shapeList.push('rect')
      this.shapeList[2].circle++;
      this.$set(this.shapeList);
    }
  }
}
</script>
<style lang="scss" scoped>
.home{
    border: 1px solid blue;

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
}
</style>