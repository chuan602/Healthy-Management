//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    username: '',
    stepList: [],
    stepsNum: '',
    stepAdvise: '测试',
    logined: false,
    userInfo: {},
    takeSession: false,
    requestResult: '',
    photoUrl: '',
    src: '',
    recordData: null,
    noRecordFlag: false
  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
        wx.uploadFile({
          url: res.tempImagePath,
          filePath: 'my-record' + '.jpg',
          name: Date.now(),
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },
  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    wx.login({
      success: () => {},
      fail: err => {}
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                username: res.userInfo.nickName,
                logined: true
              })
              console.log("username-load", this.username)
              wx.cloud.callFunction({
                name: 'getOpenID',
                success: resp => {
                  app.globalData.openid = resp.result.openid;
                  this.getRecord();
                }
              })
            }
          })
        }
        if (!res.authSetting['scope.werun']) {
          wx.authorize({
            scope: 'scope.werun',
            success: () => {
              wx.getWeRunData({
                success: (res1) => {
                  const cloudID = res1.cloudID;
                  wx.cloud.callFunction({
                    name: 'getSteps',
                    data: {
                      weRunData: wx.cloud.CloudID(cloudID),
                    },
                    success: (res2) => {
                      const stepList = res2.result.event.weRunData.data.stepInfoList;
                      const stepsNum = stepList[stepList.length - 1].step;
                      this.setData({
                        stepList: stepList,
                        stepsNum
                      })
                      //初始化stepAdvise
                      this.accessStepsAdvise(stepsNum);
                    },
                    fail: err => {
                      console.log('云函数调用失败')
                    }
                  })
                }
              })
            }
          })
        } else {
          //已经授权
          wx.getWeRunData({
            success: (res1) => {
              const cloudID = res1.cloudID;
              wx.cloud.callFunction({
                name: 'getSteps',
                data: {
                  weRunData: wx.cloud.CloudID(cloudID),
                },
                success: (res2) => {
                  const stepList = res2.result.event.weRunData.data.stepInfoList;
                  const stepsNum = stepList[stepList.length - 1].step;
                  this.setData({
                    stepList: stepList,
                    stepsNum
                  })
                  //初始化stepAdvise
                  this.accessStepsAdvise(stepsNum);
                },
                fail: err => {
                  console.log('云函数调用失败')
                }
              })
            }
          })
        }
      }
    })
  },

  accessStepsAdvise(step) {
    if (step >= 0 && step <= 3000) {
      this.setData({
        stepAdvise: '太懒啦，建议多运动噢~'
      })
    } else if (step > 3000 && step < 10000) {
      this.setData({
        stepAdvise: '坚持今天的运动量，加油~'
      })
    } else {
      this.setData({
        stepAdvise: '运动达人，注意休息噢~'
      })
    }
  },

  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        username: e.detail.userInfo.nickName,
        logined: true
      })
      wx.cloud.callFunction({
        name: 'getOpenID',
        success: resp => {
          app.globalData.openid = resp.result.openid;
          wx.getSetting({
            success: res => {
              if (!res.authSetting['scope.werun']) {
                wx.authorize({
                  scope: 'scope.werun',
                  success: () => {
                    wx.getWeRunData({
                      success: (res1) => {
                        const cloudID = res1.cloudID;
                        wx.cloud.callFunction({
                          name: 'getSteps',
                          data: {
                            weRunData: wx.cloud.CloudID(cloudID),
                          },
                          success: (res2) => {
                            const stepList = res2.result.event.weRunData.data.stepInfoList;
                            const stepsNum = stepList[stepList.length - 1].step;
                            this.setData({
                              stepList: stepList,
                              stepsNum
                            })
                            //初始化stepAdvise
                            this.accessStepsAdvise(stepsNum);
                          },
                          fail: err => {
                            console.log('云函数调用失败')
                          }
                        })
                      }
                    })
                  }
                })
              } else {
                //已经授权
                wx.getWeRunData({
                  success: (res1) => {
                    const cloudID = res1.cloudID;
                    wx.cloud.callFunction({
                      name: 'getSteps',
                      data: {
                        weRunData: wx.cloud.CloudID(cloudID),
                      },
                      success: (res2) => {
                        const stepList = res2.result.event.weRunData.data.stepInfoList;
                        const stepsNum = stepList[stepList.length - 1].step;
                        this.setData({
                          stepList: stepList,
                          stepsNum
                        })
                        //初始化stepAdvise
                        this.accessStepsAdvise(stepsNum);
                      },
                      fail: err => {
                        console.log('云函数调用失败')
                      }
                    })
                  }
                })
              }
            }
          })
          this.getRecord();
        }
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  onShow() {
    this.getRecord();
  },
  getRecord(callback) {
    const openid = app.globalData.openid;
    if (openid) {
      const db = wx.cloud.database()
      db.collection('t_record').where({
          _openid: openid
        })
        .orderBy('time', 'desc')
        .get({
          success: res => {
            if(!res.data.length){
              this.setData({
                noRecordFlag: true
              })
              return;
            }
            this.setData({
              recordData: res.data,
              noRecordFlag: false
            })
          },
          fail: console.error,
          complete: callback
        })
    }
  },
  onPreviewImg(e){
    const list = e.currentTarget.dataset.imglist;
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: list,
      current: list[index]
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
  },
  onDeleteRecord(e){
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Confirm',
      content: '确定要删除？',
      showCancel: true,
      success: res => {
        if (res.confirm){
          const db = wx.cloud.database();
          db.collection('t_record').doc(id).remove()
          .then(res => {
            this.getRecord();
          })
          .catch(err => {
            wx.showToast({
              title: '删除失败'
            })
          })
        }
      }
    })
  }
})