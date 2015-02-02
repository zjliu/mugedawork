(function(){
  APP.Router = Backbone.Router.extend({
    routes: {
      'style': 'styleList',
      'meta': 'metaData',
      '*path':  'defaultRoute'
    },

    defaultRoute: function(path){
      if(path != null){
        APP.view.customLayout.ele.hide();
      }
      else{
        APP.view.customLayout.ele.show();
      }
    },

    styleList: function(){
      this.defaultRoute('style');

      // 初始化列表界面
      APP.view.styleLayout = new APP.View.StyleLayout();
      APP.view.styleLayout.render();

      // 为分类加一些测试数据
      for(var i = 0; i < 20; i++) {
        APP.collection.catalog.add({
          thumb: 'http://www.iteye.com/upload/logo/user/915511/f78ac50a-f37c-3fa7-b28b-82051228009a.jpg?1385436462',
          title: '分类标题' + i,
          description: '分类表述'
        });
      }

      // 为分类加一些测试数据
      for(i = 0; i < 5; i++) {
        APP.collection.stylePage.add({
          thumb: 'http://www.iteye.com/upload/logo/user/915511/f78ac50a-f37c-3fa7-b28b-82051228009a.jpg?1385436462',
          title: '模板' + i
        });
      }
    },

    metaData: function(){
      this.defaultRoute('meta');

      // 初始化列表界面
      APP.view.weixinForm = new APP.View.WeixinForm();
      APP.view.weixinForm.render();
    }
  });
})();
