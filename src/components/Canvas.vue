<template>
  <div>
    <input
      type="range"
      min="20"
      max="72"
      v-model="fontSize"
      @change="setFontSize"
    />
    <canvas ref="can" width="1080" height="1080" class="canvas1" id="canvas" ></canvas>
    <button @click="saveObjects">Save</button>
    <button @click="history('undo')">Undo</button>
    <button @click="history('redo')">Redo</button>
    <button @click="loadObjects">이미지 불러오기</button>
    <button @click="copyObject">이미지 복사</button>
    <button @click="changeAlign(0)">텍스트 왼쪽정렬</button>
    <button @click="changeAlign(1)">텍스트 가운데정렬</button>
    <button @click="changeAlign(2)">텍스트 오른쪽정렬</button>
    <button @click="setIndex('forward')">한 단계 앞으로</button>
    <button @click="setIndex('backward')">한 단계 뒤로</button>
    <button @click="removeObject">선택한 객체 삭제</button>
    <button @click="clearCanvas">전체 삭제</button>
    <sketch-picker v-if="colorPicker" v-model="colors" @input="setBackgroundColor" />
  </div>
</template>

<script>
import { fabric } from 'fabric';
import { Sketch } from 'vue-color';
import CanvasMixin from '@/mixin/canvasMixin';

export default {
  name: 'Canvas',
  components: {
    'sketch-picker': Sketch
  },
  data(){
    return {
      canvas:'',
      ref:'',
      shapeList:[],
      fontSize: 20,
      backgroundColor: '#ffffff',
      colors: {
        rgba: { r: 255, g: 255, b: 255, a: 1 },
        a: 1
      },
      clipboard: {},
      count: 0, // 로컬 작업용
    }
  },
  props:{
    backgroundImage: {
      type: Object,
      required: false,
    },
     images: {
       type: Array,
       required: true
     },
     download: {
       type: Boolean,
       required: true,
     },
     colorPicker: {
       type: Boolean,
       required: true,
     },
     currCanvas: {
       type: Object,
       required: false,
     }
  },
  watch: {
    deep: true,
    backgroundImage: {
      handler() {
        const url = this.$props.backgroundImage.image;

        if(!url) {
          this.canvas.setHeight(1080);
          this.canvas.setBackgroundImage(null, this.canvas.renderAll.bind(this.canvas))
        } else {
          fabric.Image.fromURL(url, img => {
            this.canvas.setHeight(img.height);

            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
              scaleX: this.canvas.width / img.width,
              scaleY: this.canvas.height / img.height
            });
          })
        }
        this.canvas.renderAll();
      }
    },
    images() {
      const url = URL.createObjectURL(this.$props.images[this.$props.images.length - 1]);

      fabric.Image.fromURL(url, img => {
        this.canvas.add(img);
      })

      this.canvas.renderAll();
    },
  
    currCanvas() {
      // 스테이지지1-1, 1-2 등등 클릭시 캔버스 SnapShot JSON을 받아와서 뿌림
      if(this.$props.currCanvas) {
        const json = JSON.stringify(this.$props.currCanvas);

        this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas));

        if(!this.$props.currCanvas.backgroundImage) {
          this.canvas.setHeight(1080);
          this.canvas.setBackgroundImage(null, this.canvas.renderAll.bind(this.canvas))
        } else {
          fabric.Image.fromURL(this.$props.currCanvas.backgroundImage.src, img => {
            this.canvas.setHeight(img.height);
            
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
              scaleX: this.canvas.width / img.width,
              scaleY: this.canvas.height / img.height
            });
          })
        }
        // 단순 Local 작업용. API 붙으면 삭제
        this.count = this.$props.currCanvas.stage.slice(2);
      }
    }
  },
  created() {
    new CanvasMixin().init();
  },
  mounted() {
    this.ref = this.$refs.can;
    this.canvas = new fabric.Canvas(this.ref);
    this.canvas.undoCount = 0;
    this.canvas.on("object:selected", this.getSelectedObject)
  },
  methods:{
    changeAlign(idx){
      const activeObj = this.canvas.getActiveObject();
      const align = ["left", "center", "right"];
      const positionX = align[idx];

      activeObj.set('textAlign', positionX);
      this.canvas.renderAll();
    },
    clearCanvas() {
      this.canvas.clear();
    },
    removeObject() {
      this.canvas.remove(this.canvas.getActiveObject());
    },
    bringToFront() {
      const activeObj = this.canvas.getActiveObject();
      activeObj && this.canvas.bringToFront(activeObj).discardActiveObject(activeObj).renderAll();
    },
    async saveObjects() {
      const canvas = document.getElementById('canvas');
      const dataURL = canvas.toDataURL({ multiplier: 3 });

      const blobFile = this.dataURItoBlob(dataURL);
      const imageURL = URL.createObjectURL(blobFile);

      const imgObject = {// eslint-disable-line no-unused-vars
        stageImage: imageURL,
        stageInfo: {
          backgroundImage: this.canvas.backgroundImage,
          backgroundColor: this.canvas.backgroundColor,
          objects: this.canvas._objects,
        }
      }

      this.$store.dispatch("stageList", {
          stage: `1-${this.count}`,
          backgroundImage: this.canvas.backgroundImage,
          backgroundColor: this.canvas.backgroundColor,
          objects: this.canvas._objects,
          undoCount: this.canvas.undoCount,
        })

        this.count += 1;
    },
    loadObjects() {
      const json = window.localStorage.getItem('_tempItems');
      const parsedJSON = JSON.parse(json)  // JSON을 load 할땐 파싱하면 인식못하기에 파싱된 데이터는 따로 저장
      
      if(json) {
        this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas), () => {
          if(parsedJSON.backgroundImage) {
            this.canvas.setHeight(parsedJSON.backgroundImage.height);

            this.canvas.setBackgroundImage(parsedJSON.backgroundImage.src, this.canvas.renderAll.bind(this.canvas), {
              scaleX: this.canvas.width / parsedJSON.backgroundImage.width,
              scaleY: this.canvas.height / parsedJSON.backgroundImage.height
            });
          }
        })
      }
    },
    addRect() {
      let rect = new fabric.Rect({
        left: 10,
        top: 10,
        height: 50,
        width: 50,
        // fill: 'green',
        stroke:'black'
      })
      this.canvas.add(rect);
      return rect;
    },
    addCircle() {
      const circle = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 30,
        strokeWidth: 1,
        stroke: 'black',
        // fill: 'green',
        selectable: true,
        originX: 'center', originY: 'center'
      })
      this.canvas.add(circle);
      return circle;
    },
    addText() {
      const text = new fabric.IText('Type some Text', {
          fontFamily: 'Arial',
          fontSize: 50,
        });

      this.canvas.add(text);
      return text;
    },
    setFontSize(e) {
      const activeObj = this.canvas.getActiveObject();
      activeObj.fontSize = e.target.value;
      this.fontSize = e.target.value;

      this.canvas._historySaveAction();
      this.canvas.renderAll();
    },
    setBackgroundColor (value) {
      this.canvas.setBackgroundColor(value.hex8, this.canvas.renderAll.bind(this.canvas));
      this.canvas.renderAll();
    },
    history(state) {
      if(state === 'undo') {
        this.canvas.undoCount += 1;

        if(this.canvas.undoCount > 50) {
          alert('되돌리기 50회 초과');
          return;
        } else {
          this.canvas.undo()
        }
      } else {
        this.canvas.undoCount -= 1;
        this.canvas.redo()
      }
    },
    dataURItoBlob(dataURI) {
      var byteString = atob(dataURI.split(',')[1]);

      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      var ab = new ArrayBuffer(byteString.length);

      var ia = new Uint8Array(ab);

      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      var blob = new Blob([ab], {type: mimeString});
      return blob;
    },
  
    copyObject() {
      this.canvas.getActiveObject().clone(cloned => {
        // 복사 메서드 사용하면 선택된 오브젝트가 인자로 넘어옴. 그게 바로 cloned
        // this.clipboard = cloned;
        cloned.clone(clonedObj => {
          this.canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          });
          if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = this.canvas;
            clonedObj.forEachObject(function(obj) {
              this.canvas.add(obj);
            });
            clonedObj.setCoords();
          } else {
            this.canvas.add(clonedObj);
          }

          this.clipboard.top += 10;
          this.clipboard.left += 10;
          this.canvas.setActiveObject(clonedObj);
          this.canvas.requestRenderAll();
        });
      });
    },

    setIndex(direction) {
      const activeObj = this.canvas.getActiveObject();  // 현재 선택된 오브젝트
      const zIndex = activeObj.getZIndex();  // 선택된 오브젝트의 z-index 값

      if(direction === 'forward') {
        activeObj.moveTo(zIndex + 1);
        this.canvas.renderAll();
      } else {
        activeObj.moveTo(zIndex - 1);
        this.canvas.renderAll();
      }
    },
    getSelectedObject(evt) {
      if(evt.target.type === 'i-text') {
        console.log(evt.target);
        this.fontSize = evt.target.fontSize
      }
    }
  }
}
</script>
<style scoped lang="scss">
.canvas1 {
  border: 1px solid red;
  left: 0px;
  top: 0px;
  /* transform: rotate(0deg); */
}

</style>