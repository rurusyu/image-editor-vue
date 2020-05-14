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
      shapeList:[],
      fontSize: 20,
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
        const dataURL = canvas.toDataURL('image/png', 1.0);

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
  mounted() {
    this.ref = this.$refs.can;
    this.canvas = new fabric.Canvas(this.ref);
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
    addText() {
      const text = new fabric.IText('Type some Text', {
          fontFamily: 'Arial',
          fontSize: 150,
        });

      this.canvas.add(text);
      return text;
    },
    setFontSize(e) {
      const activeObj = this.canvas.getActiveObject();
      activeObj.fontSize = e.target.value;
      this.fontSize = e.target.value;

      this.canvas.renderAll();
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

