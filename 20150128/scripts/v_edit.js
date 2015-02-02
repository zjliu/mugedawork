/**
 * Created by msm on 2015-1-23.
 */
(function(){
  // VIEW：编辑页面的骨架
  APP.View.CustomLayout = Backbone.View.extend({
    initialize: function(opt){
      this.pageCollection = opt.collection;
      this.listenTo(this.pageCollection, "add", this.renderPreview);
    },
    el: 'body',
    views: {
      navigate: null,
      preview: []
    },
    template: _.template(APP.Utils.getTemplate('custom_layout')),
    render: function(){
      // 渲染框架
      this.ele = $(this.template());
      this.$el.append(this.ele);

      // 渲染标题栏
      this.views.navigate = new APP.View.Navigate({
        leftLabel: '返回',
        rightLabel: '下一步',
        title: '定制',
        el: this.$el.find('.navigate')
      });
      this.views.navigate.render();
      return this;
    },
    renderPreview: function (pageModel) {
      // 渲染单独的页面Preview
      var page = new APP.View.PreviewPage({
        el: this.$el.find('.preview'),
        model: pageModel
      });
      page.render();
      this.views.preview.push(page);
    }
  });

  // VIEW：单独的页面Preview
  APP.View.PreviewPage = Backbone.View.extend({
    initialize: function(opt){
      this.model = opt.model;
    },
    template: _.template(APP.Utils.getTemplate('preview_page_item')),
    render: function(){
      this.$el.append(this.template({thumb: this.model.get('thumb')}), null);
      return this;
    }
  });

  // MODEL：单个定制页面的数据
  APP.Model.Page = Backbone.Model.extend({});

  // COLLECTION：定制页面数据的集合
  APP.Collection.Page = Backbone.Collection.extend({
    model: APP.Model.Page
  });



})();