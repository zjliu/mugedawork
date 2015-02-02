/**
 * Created by msm on 2015-1-23.
 */

$(function(){
  // 初始化定制页面数据
  APP.collection.page = new APP.Collection.Page([], {
    attachView: APP.view.customLayout
  });

  // 初始化编辑界面
  APP.view.customLayout = new APP.View.CustomLayout({
    collection: APP.collection.page
  });
  APP.view.customLayout.render();

  // 加入测试页面数据
  for(var i = 0; i < 10; i++){
    var page = new APP.Model.Page({
      thumb: 'http://mucard.mugeda.com/weixin/card/cards/54bdbd5aa3664e133500037a/54bce342a3664e5f3100100d.jpg',
      index: i
    });
    APP.collection.page.add(page);
  }

  // 初始化路由
  APP.router = new APP.Router();
  Backbone.history.start({pushState: false});
});