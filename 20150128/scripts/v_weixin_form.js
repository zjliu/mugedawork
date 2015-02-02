/**
 * Created by msm on 2015-1-23.
 */
(function(){
  // VIEW：编辑页面的骨架
  APP.View.WeixinForm = Backbone.View.extend({
    el: 'body',
    views: {
      navigate: null
    },
    template: _.template(APP.Utils.getTemplate('weixin_form')),
    render: function() {
      // 渲染框架
      this.$el.append(this.template());

      // 渲染标题栏
      this.views.navigate = new APP.View.Navigate({
        leftLabel: '上一步',
        rightLabel: '下一步',
        title: '转发属性',
        el: this.$el.find('.navigate')
      });
      this.views.navigate.render();
    }
  });
})();
