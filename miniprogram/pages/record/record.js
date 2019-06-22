// pages/record/record.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    imgSrcList: [],
    content: '',
    cloudFileIDList: [],
    app: getApp()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChooseImage() {
      const _this = this;
      wx.chooseImage({
        count: 3,
        success: function(res) {
          _this.setData({
            imgSrcList: [...res.tempFilePaths]
          })
        },
      })
    },
    onDeleteImg(event) {
      const url = event.currentTarget.dataset.url;
      const resList = this.data.imgSrcList.filter(item => (item !== url));
      this.setData({
        imgSrcList: resList
      })
    },
    onSubmitRecord() {
      wx.showLoading({
        title: '正在记录...',
        mask: true
      })
      const _this = this;
      const db = wx.cloud.database();
      const proArr = []
      this.data.imgSrcList.forEach(item => {
        proArr[proArr.length] = wx.cloud.uploadFile({
          cloudPath: Date.now() + '.png',
          filePath: item
        })
      })
      Promise.all(proArr)
        .then(res => {
          const fileIdList = []
          res.forEach(item => {
            fileIdList.push(item.fileID)
          })
          db.collection('t_record').add({
              data: {
                content: _this.data.content,
                imgFileIdList: fileIdList,
                openid: _this.data.app.globalData.openid,
                time: this.formatTime(new Date())
              }
            })
            .then(res => {
              wx.hideLoading();
              _this.clearRecordData();
            })
            .catch(err => {
              console.log("collection add error")
            })
        })


    },
    clearRecordData() {
      this.setData({
        imgSrcList: [],
        cloudFileIDList: [],
        content: ''
      })
      wx.switchTab({
        url: '/pages/index/index',
      })
    },
    onInput(e){
      const elm = e.currentTarget;
      this.setData({
        content: e.detail.value
      })
    },
    onPreviewImg(e){
      const index = e.currentTarget.dataset.index;
      wx.previewImage({
        urls: this.data.imgSrcList,
        current: this.data.imgSrcList[index]
      })
    },
    formatTime(date) {
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var hour = date.getHours()
      var minute = date.getMinutes()
      var second = date.getSeconds()
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }
      return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
    }
  }
})