<template>
  <div class="home">
     
    <div class="menu">
      <div class="inputWrapper backImg">
        <span>배경이미지 선택</span>
        <input type="file" class="fileInput" ref="uploadImageFile" @change="onBackImgSelected" />
      </div>
      <div class="inputWrapper backImg">
        <button type="button" @click="onBackImgDeleted">배경이미지 삭제</button>
      </div>
      <div class="inputWrapper object">
        <span>이미지 객체 선택</span>
        <input type="file" class="fileInput" ref="uploadImageFile" @change="onFileSelected" />
      </div>
      <div class="inputWrapper object">
        <button type="button" @click="onObjectCreate('rect')">사각형 생성</button>
      </div>
      <div class="inputWrapper object">
        <button type="button" @click="onObjectCreate('circle')">동그라미 생성</button>
      </div>
      <div class="inputWrapper object">
        <button type="button" @click="onObjectCreate('text')">텍스트 생성</button>
      </div>
      <hr />
      <ul>
        <li v-for="(stage, idx) in $store.getters.getStageList" :key="stage.stage" @click="getCanvas(idx)">
          {{ idx }}
        </li>
      </ul>
    </div>
    <div>
      <wrapper-canvas 
        :NumberOfCanvas="NumberOfCanvas"
        :addShape="addShape"
        :backgroundImage="backgroundImage"
        :colorPicker="colorPicker"
        :images="images"
        :download="download"
        :currCanvas="currCanvas"
        />
    </div>
  
  </div>
</template>

<script>
// @ is an alias to /src
import WrapperCanvas from '@/components/WrapperCanvas.vue';

export default {
  name: 'Home',
  components: {
    WrapperCanvas,
  },
  data(){
    return {
      NumberOfCanvas: 1,
      addShape:'',
      backgroundImage: {},
      colorPicker: true,
      images: [],
      download: false,
      currCanvas: {},
    }
  },
  mounted(){
    console.log(this.$refs.pc);
  },
  methods:{
    addCanvas(){
      this.NumberOfCanvas++;
    },
    onBackImgSelected(event) {
      const image = event.target.files[0];

      this.backgroundImage = { 'image': URL.createObjectURL(image)};
      window.sessionStorage.setItem('testImg', JSON.stringify(this.backgroundImage));
      event.target.value ='';
      this.colorPicker = false;
      
    },
    onBackImgDeleted() {
      this.backgroundImage = {};
      this.colorPicker = true;
    },
    onFileSelected(event) {
      const image = event.target.files[0];

      this.images.push(image);
      event.target.value ='';
    },
    onObjectCreate(shape) {
      this.addShape = shape;
      setTimeout(() => this.addShape = '', 100);
    },
    exportToPng() {
      this.download = !this.download;
    },
    getCanvas(idx) {
      const currentCanvas = this.$store.getters.getStage(idx);
      this.currCanvas = currentCanvas;
    }
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

  .inputWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 200px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background-color: #DDF;
    border-bottom: 1px solid black;
  }

  .object {
    background-color: lightpink;
  }

  .text {
    background-color: lightgrey;
  }

  .fileInput {
    cursor: pointer;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 99;
    font-size: 50px;
    opacity: 0;
    -moz-opacity: 0;
    filter:progid:DXImageTransform.Microsoft.Alpha(opacity= 0);
  }

  // .preview{
  //   border:1px solid black;
  //   width: 100px;
  //   height: 100px;
  // }

  .pc1{
    width: 100px;
    height: 100px;
    border: 1px solid black;
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