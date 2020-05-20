<template>
  <div>
    <input
      type="range"
      min="20"
      max="150"
      v-model="fontSize"
      @change="setFontSize"
    />
    <canvas ref="can" width="1080" height="1080" class="canvas1" id="canvas" ></canvas>
    <button @click="saveObjects">Save</button>
    <button @click="history('undo')">Undo</button>
    <button @click="history('redo')">Redo</button>
    <button @click="loadObjects">이미지 불러오기</button>
    <button @click="copyObject">이미지 복사</button>
    <button @click="setIndex('forward')">한 단계 앞으로</button>
    <button @click="setIndex('backward')">한 단계 뒤로</button>
    <!-- <button @click="setGroup">그룹으로 묶기</button>
    <button @click="setUngroup">그룹 해제</button> -->
    <sketch-picker v-if="colorPicker" v-model="colors" @input="setBackgroundColor" />
  </div>
</template>

<script>
import { fabric } from 'fabric';
import { Sketch } from 'vue-color';
import axios from 'axios';// eslint-disable-line no-unused-vars

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
      count: 0,
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
      console.log('첨부한 파일 정보', this.$props.images[this.$props.images.length - 1]);
      const fileType = this.$props.images[this.$props.images.length - 1].type;
      const url = URL.createObjectURL(this.$props.images[this.$props.images.length - 1]);
      console.log('파일 타입 체크', fileType);

      fabric.Image.fromURL(url, img => {
        console.log('이미지 정보', img);
        // img.set({
        //     width: 300,
        //     height: 300,
        //  });
         this.canvas.add(img);
        // const canvas = document.getElementById('canvas');
        // this.canvas.height = img.height;
        // this.canvas.setHeight(img.height);
        
        // this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
        //     scaleX: this.canvas.width / img.width,
        //     scaleY: this.canvas.height / img.height
        // });
      })

      this.canvas.renderAll();
      this.bringToFront();
    },
    download() {
      // console.log('이게 오브젝트화', this.canvas.toObject());
      // const test = JSON.stringify(this.canvas);
      // console.log('canvas to JSON', test)

      let canvasJSON = {
        "objects": this.canvas.toObject().objects,
      }

      console.log(canvasJSON);

      canvasJSON = JSON.stringify(canvasJSON);
      window.sessionStorage.setItem('testCanvas', canvasJSON);
      // if(this.$props.download) {
        // const canvas = document.getElementById('canvas');
        // const dataURL = canvas.toDataURL({ multiplier: 3 });

        // const blobFile = this.dataURItoBlob(dataURL);
        // const imageURL = URL.createObjectURL(blobFile);

        // console.log('이미지 url', imageURL);
        // console.log('blobFile', blobFile);

        // var link = document.createElement('a');
        // console.log('canvas Image', dataURL);

        // link.addEventListener('click', function() {
        //   link.href = dataURL;
        //   link.download = "mypainting.png";
        // }, false);
        // document.body.appendChild(link);

        // link.click();
      // }
    },
    currCanvas() {
      if(this.$props.currCanvas) {
        const json = JSON.stringify(this.$props.currCanvas);

        // this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas))
        this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas));
        this.count = this.$props.currCanvas.stage.slice(2);
      }
    }
  },
  created() {
    fabric.Object.prototype.getZIndex = function() {
      return this.canvas.getObjects().indexOf(this);
    }

    fabric.Canvas.prototype.historyInit = function () {
      this.historyUndo = [];
      this.historyRedo = [];
      this.undoCount = 0;
      this.historyNextState = this.historyNext();

      // vue watch? 혹은 어딘가에서 canvas.on 이벤트 밑에 3개 감시하고 있다가
      // 그대로 실행? this.historySaveAction(this.canvas); this를 줘야 undefined 안 나올테니

      this.on({
        "object:added": this.historySaveAction,
        "object:removed": this.historySaveAction,
        "object:modified": this.historySaveAction,
      })
    }

    // fabric.Canvas.prototype.getSelectedObject = function(evt) {
    //   console.log('오브젝트 선택', evt.target.type);
    //   if(evt.target.type === 'i-text') {
    //     console.log('폰트 사이즈', evt.target.fontSize);
    //     this.fontSize = evt.target.fontSize
    //   }
    // }

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

      if(this.undoCount > 50) {
        alert('최대 되돌리기 횟수 50회 초과');
        return;
      }

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

    const objectSelectHandler = function (evt) {
      if(evt.target.type === 'i-text') {
        this.fontSize = evt.target.fontSize
      }
    };

    this.canvas.historyInit();
    this.canvas.on("object:selected", objectSelectHandler)
    this.data = this.canvas;

    let items = window.sessionStorage.getItem('testImg');
    // items = JSON.parse(items);

    if(items) {
      // this.canvas.loadFromJSON(items, function(o, object) {
      //   fabric.log(o, object);
      // });
    //  this.canvas.loadFromJSON(JSON.parse(items), this.canvas.renderAll.bind(this.canvas), function(o, object) {
    //     if (object.type == 'image') {
    //       object.setSrc(items.url, this.canvas.renderAll.bind(this.canvas))
    //     }
    //  });
    }
  },
  methods:{
    bringToFront() {
      var activeObj = this.canvas.getActiveObject();
      activeObj && this.canvas.bringToFront(activeObj).discardActiveObject(activeObj).renderAll();
    },
    async saveObjects() {
      // window.localStorage.setItem('_tempItems', JSON.stringify({objects: this.canvas._objects, backgroundImage: this.canvas.backgroundImage}));
      const canvas = document.getElementById('canvas');
      const dataURL = canvas.toDataURL({ multiplier: 3 });

      const blobFile = this.dataURItoBlob(dataURL);
      const imageURL = URL.createObjectURL(blobFile);

      console.log('blobFile', blobFile);
      console.log('이미지 url', imageURL);
      console.log('캔버스 배경색', this.canvas.backgroundColor);

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
        })

        this.count += 1;
      // window.sessionStorage.setItem('canvas_1', JSON.stringify({objects: this.canvas._objects, backgroundImage: this.canvas.backgroundImage, backgroundColor: this.canvas.backgroundColor}));

      /*
      {
        stage: 1-1,
        stageImage: '이미지 파일 (URL ? Blob?)',
        stageInfo : {
          backgroundImage: 'dsadsa.jpg',
          objects: [
            {
                type: 'image',
                src: 'blob:http://localhost:8080/a862a43d-d1ab-4f3c-8209-c1e104fbe48b',
                기타 등등 정보...
            }
        }
      }
      */

      // const res = await axios.post('http://localhost:80/stage', imgObject);
      // console.log('요청 결과', res);

      // if(res.status === 200) {
      //   window.localStorage.setItem('_tempItems', JSON.stringify(res.data.returnData.stageInfo));
      //   setTimeout(this.loadObjects, 2000)
      // }
    },
    loadObjects() {
      const json = window.localStorage.getItem('_tempItems');
      const parsedJSON = JSON.parse(json)  // JSON을 load 할땐 파싱하면 인식못하기에 파싱된 데이터는 따로 저장
      
      if(json) {
        this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas), (o, object) => {// eslint-disable-line no-unused-vars
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
      // activeObj.setFontSize(e.target.value);
      activeObj.fontSize = e.target.value;
      this.fontSize = e.target.value;

      this.canvas.renderAll();
    },
    setBackgroundColor (value) {
      this.canvas.setBackgroundColor(value.hex8, this.canvas.renderAll.bind(this.canvas));
      this.canvas.renderAll();
    },
    history(state) {
      
      if(state === 'undo') {
        this.canvas.undo()
      } else {
        this.canvas.redo()
      }
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], {type: mimeString});
      return blob;
    },
    loadImageFromURL() {
      let can_img = window.localStorage.getItem('_tempItems');

      fabric.Image.fromURL(can_img, img => {
        this.canvas.add(img);
        this.canvas.renderAll();
      })
    },
    // setGroup() {
    //   const activeObj = this.canvas.getActiveObject();
    //   console.log('여러개?', activeObj);

    //   if(!activeObj) {
    //     return;
    //   }

    //   const activegroup = activeObj.toGroup();
    //   console.log('그룹화?', activegroup);

    //   const objectsInGroup = activegroup.getObjects();

    //   activegroup.clone(newgroup => {
    //       this.canvas.remove(activegroup);

    //       objectsInGroup.forEach(object => {
    //         this.canvas.remove(object);  
    //       });
    //       this.canvas.add(newgroup);
    //   });
    // },
    // setUngroup() {
    //   const activeObject = this.canvas.getActiveObject();

    //   if(!activeObject) {
    //     return;
    //   }

    //   if(activeObject.type=="group"){
    //       const items = activeObject._objects;
    //       activeObject._restoreObjectsState();
    //       this.canvas.remove(activeObject);

    //       for(let i = 0; i < items.length; i++) {
    //         this.canvas.add(items[i]);
    //         this.canvas.item(this.canvas.size()-1).hasControls = true;
    //       }
    //       this.canvas.renderAll();
    //   }
    // },
    copyObject() {
      this.canvas.getActiveObject().clone(cloned => {
        console.log('cloned', cloned)
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
      } else {
        activeObj.moveTo(zIndex - 1);
      }
    },
    getSelectedObject(evt) {
      console.log('오브젝트 선택', evt.target.type);
      if(evt.target.type === 'i-text') {
        console.log('폰트 사이즈', evt.target.fontSize);
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