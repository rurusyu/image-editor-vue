<template>
  <div>
    <input
      type="range"
      min="20"
      max="150"
      v-model="fontSize"
      @change="setFontSize"
    />
    <canvas ref="can" width="1080" height="300" class="canvas1" id="canvas" ></canvas>
    <button @click="saveObjects">Save</button>
    <button @click="history('undo')">Undo</button>
    <button @click="history('redo')">Redo</button>
    <sketch-picker v-if="colorPicker" v-model="colors" @input="setBackgroundColor" />
  </div>
</template>

<script>

import { fabric } from 'fabric';
import { Sketch } from 'vue-color';

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
      }
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
     }
  },
  watch: {
    deep: true,
    backgroundImage: {
      handler() {
        // const fileType = this.$props.images[this.$props.images.length - 1].type;
        const url = this.$props.backgroundImage.image
        // console.log('파일 타입 체크', fileType);

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
      const fileType = this.$props.images[this.$props.images.length - 1].type;
      const url = this.$props.images[this.$props.images.length - 1];
      console.log('파일 타입 체크', fileType);

      fabric.Image.fromURL(url, img => {
        // img.set({
        //     width: 1080,
        //     height: 1080,
        //  });
        //  this.canvas.add(img);
        // const canvas = document.getElementById('canvas');
        // this.canvas.height = img.height;
        this.canvas.setHeight(img.height);
        
        this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
            scaleX: this.canvas.width / img.width,
            scaleY: this.canvas.height / img.height
        });
      })

      this.canvas.renderAll();
      this.bringToFront();
    },
    download() {
      if(this.$props.download) {
        const canvas = document.getElementById('canvas');
        const dataURL = canvas.toDataURL({ multiplier: 3 });

        var link = document.createElement('a');

        link.addEventListener('click', function() {
          link.href = dataURL;
          link.download = "mypainting.png";
        }, false);
        document.body.appendChild(link);

        link.click();
      }
    }
  },
  created() {
    fabric.Canvas.prototype.historyInit = function () {
      this.historyUndo = [];
      this.historyRedo = [];
      this.historyNextState = this.historyNext();

      // vue watch? 혹은 어딘가에서 canvas.on 이벤트 밑에 3개 감시하고 있다가
      // 그대로 실행? this.historySaveAction(this.canvas); this를 줘야 undefined 안 나올테니

      this.on({
        "object:added": this.historySaveAction,
        "object:removed": this.historySaveAction,
        "object:modified": this.historySaveAction
      })
    }

    fabric.Canvas.prototype.historyNext = function () {
      return JSON.stringify(this.toDatalessJSON(this.extraProps));
    }

    fabric.Canvas.prototype.historySaveAction = function () {
      if (this.historyProcessing)
        return;

      const json = this.historyNextState;
      this.historyUndo.push(json);
      this.historyNextState = this.historyNext();
    }

    // 되돌리기
    fabric.Canvas.prototype.undo = function (callback) {
      this.historyProcessing = true;

      const history = this.historyUndo.pop();
      if (history) {
        // 방금 취소한 행동을 기록하기 위해 배열에 넣음
        this.historyRedo.push(this.historyNext());
        this.historyNextState = history;
        this._loadHistory(history, 'history:undo', callback);
      } else {
        this.historyProcessing = false;
      }

      this.historyProcessing = false;
    },

    // 되돌리기 실행 취소
    fabric.Canvas.prototype.redo = function (callback) {
      this.historyProcessing = true;
      const history = this.historyRedo.pop();
      if (history) {
        this.historyUndo.push(this.historyNext());
        this.historyNextState = history;
        this._loadHistory(history, 'history:redo', callback);
      } else {
        this.historyProcessing = false;
      }
    },

    fabric.Canvas.prototype._loadHistory = function(history, event, callback) {
      let _this = this;

      this.loadFromJSON(history, function() {
        _this.renderAll();
        _this.historyProcessing = false;

      if (callback && typeof callback === 'function')
        callback();
      });
    }
  },
  mounted() {
    this.ref = this.$refs.can;
    this.canvas = new fabric.Canvas(this.ref);
    this.canvas.historyInit();
    this.data = this.canvas;

    let items = window.localStorage.getItem('_tempItems');

    if(items) {
      this.canvas.loadFromJSON(items, function(o, object) {
        fabric.log(o, object);
      });
    }
  },
  methods:{
    bringToFront() {
      var activeObj = this.canvas.getActiveObject();
      activeObj && this.canvas.bringToFront(activeObj).discardActiveObject(activeObj).renderAll();
    },
    saveObjects() {
      console.log('이거 뭐야?', this.canvas._objects);
      // window.localStorage.setItem('_tempItems', JSON.stringify({objects: this.canvas._objects}));
    },
    addRect() {
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
    addCircle() {
      const circle = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 30,
        strokeWidth: 1,
        stroke: 'black',
        fill: 'green',
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
      activeObj.setFontSize(e.target.value);
      // activeObj.fontSize = e.target.value;
      this.fontSize = e.target.value;

      this.canvas.renderAll();
    },
    setBackgroundColor (value) {
      console.log('색상', value);
      this.canvas.setBackgroundColor(value.hex8, this.canvas.renderAll.bind(this.canvas));
      this.canvas.renderAll();
    },
    history(state) {
      console.log('상태 변경', this.canvas.historyUndo);
      
      if(state === 'undo') {
        this.canvas.undo()
      } else {
        this.canvas.redo()
      }
    },
    changeText() {
      //  message,
      //  text = new fabric.IText('Type some Text', {
      //     fontFamily: 'Arial',
      //     fontSize: 25,
      //   });

      // canvas.add(text);
      // canvas.renderAll();

      // var fontControl = $('#font-control');
      // $(document.body).on('change', '#font-control', function () {
      //     text.fontFamily = fontControl.val();
      //     /* text.fontSize = 30 */
      //     text.fontSize = 25;
      //     text.stroke = '#ff0000';
      //     canvas.renderAll();
      // });
    },
    // textBoxChanged(e) {
    //     var target = e.target;
    //     message = target.value;
    //     drawScreen();
    // },
    // updateControls() {
    //     textControl.value = canvas.getActiveObject().getText();
    // }
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

