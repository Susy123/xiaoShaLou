// pages/shalou/shalou.js
Page({
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },

  /**
   * 页面的初始数据
   */
  data: {
    minuteSet: 3,
    leftTime: '00:00',
    timesNum: 100
  },
  bindKeyInput: function (e) {
    this.setData({
      minuteSet: Number(e.detail.value)
    })
  },
  bindMinuteAdd: function (e) {
    this.setData({
      minuteSet: this.data.minuteSet + 1
    })
    // console.log('minute为', this.data.minuteSet);
  },
  bindMinuteSub: function (e) {
    var minute = this.data.minuteSet;
    this.setData({
      minuteSet: (minute - 1) >= 0?minute-1:0
    })
    // console.log('minute为', this.data.minuteSet);
  },
  bindStartBtn: function () {
    clearInterval(this.showLeft);
    clearInterval(this.interval);
    this.setData({
      timesNum: 0,
      leftTime: this.secondsToHms(this.data.minuteSet * 60)
    })
    var timesTotal = this.data.minuteSet * 60 * 1000 / this.redrawTimeSlot;
    this.timeSlot = 100 / timesTotal;
    this.timesCount = 0
    this.showTimeLeft();
    this.interval = setInterval(this.drawShalou, this.redrawTimeSlot);
  },
  showTimeLeft: function () {
    var that = this;
    var timeMinute = this.data.minuteSet;
    var runTimer = (timeMinute==0);
    var secs1 = 60 * timeMinute;// 总秒数
    var secs2 = 0;
    if (runTimer) {
      clearInterval(that.showLeft)
    } else {
      that.showLeft = setInterval(function () {
        // console.log(secs1);
        // console.log(secs2);
        if (secs1 <= 1) {
          clearInterval(that.showLeft);
          runTimer = false;
          // flag = false;
        }
        secs1--;
        secs2++;
        var timeLeft = that.secondsToHms(secs1);
        var timeAdd = that.secondsToHms(secs2);
        var denom = 60 * timeMinute;
        var perc1 = (secs1 / denom * 100);
        var perc2 = (secs2 / denom * 100);
        that.setData({
          leftTime: timeLeft
        })
      }, 1000);
    }
    // runTimer = !runTimer;
  },
  secondsToHms: function (d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return (h > 0 ? h + ':' + (m < 10 ? '0' : '') : (m < 10 ? '0' : '')) + m + ':' + (s < 10 ? '0' : '') + s;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad');
    var res = wx.getSystemInfoSync();
    this.windowWidth = res.windowWidth;
    this.windowHeight = res.windowHeight;
    console.log(this.windowWidth);
    console.log(this.windowHeight);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady');
    this.redrawTimeSlot = 40;// 每40ms重画一次，比较流程
    var timesTotal = this.data.minuteSet * 60 * 1000 / this.redrawTimeSlot;
    
    this.timesCount = 0;
    this.sideLength = this.windowHeight/10;
    this.gapWidth = 25;
    this.frameWidth = 15;

    this.timeSlot = 100 / timesTotal;

    this.drawShalou();



  },

  drawShalou: function () {
    this.timesCount = this.timesCount + 1;// 第 timesCount次绘图
    //使用wx.createContext获取绘图上下文context
    var context = wx.createContext();

    context.scale(1, 1.7);
    // context.setFillStyle("#3B3B3B");
    // context.fillRect(0, 0, 350, 200);
    context.translate(this.windowWidth / 2, this.sideLength + this.gapWidth+this.frameWidth/2);
    var timesNum = this.data.timesNum;
    // console.log(timesNum);
    if (timesNum >= 100) {
      clearInterval(this.interval);
    }
    this.setData({
      timesNum: timesNum + this.timeSlot
    })
    this.drawDroping(context, this.timesCount);
    this.drawSha(context, timesNum);
    // context.restore();
    this.drawFrame(context);
    //调用wx.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为
    wx.drawCanvas({
      canvasId: "shalou-canvas",
      actions: context.getActions() //获取绘图动作数组
    });
  },
  drawDroping: function (context, timesCount) {
    var sideLenth = this.sideLength - this.frameWidth/2 +10;
    context.save();
    context.moveTo(0, timesCount % 12);
    context.lineTo(0, sideLenth);
    context.setLineDash([6, 10]);
    context.setLineWidth(3);// 可与时间关联
    context.setStrokeStyle('#e08f24');
    context.stroke();
    context.restore();
  },
  drawFrame: function (context) {
    var gapWidth = this.gapWidth;
    var sideLenth = this.sideLength + gapWidth;

    context.beginPath();
    context.setStrokeStyle("#3f6b9d");
    context.setLineWidth(this.frameWidth);
    context.setLineCap('round');
    context.setLineJoin('round');
    
    // context.translate(0, 0 - gapWidth);
    context.moveTo(gapWidth, 0)
    context.lineTo(sideLenth+gapWidth, sideLenth);
    context.lineTo(0 - sideLenth-gapWidth, sideLenth);
    context.lineTo(0 - gapWidth, 0);
    // context.translate(0, 1 * gapWidth);
    context.lineTo(0 - sideLenth-gapWidth, 0 - sideLenth);
    context.lineTo(sideLenth+gapWidth, 0 - sideLenth);
    context.lineTo(gapWidth, 0);
    context.closePath();
    context.stroke();
    // context.translate(0, 1*gapWidth);
  },
  drawSha: function (context, i) {
    console.log(i);
    var sideLenth = this.sideLength+10;
    var curSide = sideLenth*(1 - i/100);
    var dig = Math.PI / 4;
    context.moveTo(0, 0);
    context.beginPath();
    context.setLineWidth(6);
    context.setFillStyle('#e08f24');
    context.setStrokeStyle('#e08f24');
    // console.log(Math.tan(dig));
    context.lineTo(curSide, 0 - curSide / Math.tan(dig));
    context.lineTo(0 - curSide, 0 - curSide / Math.tan(dig));
    context.lineTo(0, 0);
    
    var bottomSadPadding = 0,bottomHeight = 0;
    if (i <= 50) {
      bottomHeight = sideLenth / 100 * i *1.5;
    }
    else {
      bottomHeight = sideLenth * 0.75 + sideLenth / 100 * (i-50) * 0.5;
    }
    bottomSadPadding = sideLenth - bottomHeight;
    context.moveTo(0, bottomSadPadding);
    context.lineTo(sideLenth, sideLenth);
    context.lineTo(0 - sideLenth, sideLenth);
    context.lineTo(0, bottomSadPadding);
    // context.lineTo(0, 0);
    context.closePath();
    context.fill();
    // context.stroke();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow');
    this.redrawTimeSlot = 40;// 每40ms重画一次，比较流程
    var timesTotal = this.data.minuteSet * 60 * 1000 / this.redrawTimeSlot;
    this.timeSlot = 100 / timesTotal;
    this.timesCount = 0

    this.drawShalou();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide');
    clearInterval(this.showLeft);
    clearInterval(this.interval);
    this.setData({
      leftTime: '00:00',
      timesNum: 100
    });
    this.timesCount = 0;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload');
    clearInterval(this.showLeft);
    clearInterval(this.interval);
    this.setData({
      leftTime: '00:00',
      timesNum: 100
    });
    this.timesCount = 0;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})