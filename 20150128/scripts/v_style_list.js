/**
 * Created by msm on 2015-1-23.
 */
(function(){
  // VIEW：编辑页面的骨架
  APP.View.StyleLayout = Backbone.View.extend({
    el: 'body',
    views: {
      navigate: null,
      catalog: [],
      styleItem: []
    },
    initialize: function(){
      APP.collection.catalog = new APP.Collection.Catalog();
      this.listenTo(APP.collection.catalog, 'add', this.renderCatalog);

      APP.collection.stylePage = new APP.Collection.StylePage();
      this.listenTo(APP.collection.stylePage, 'add', this.renderStylePage);
    },
    template: _.template(APP.Utils.getTemplate('style_layout')),
    render: function(){
      // 渲染框架
      this.$el.append(this.template());

      // 渲染标题栏
      this.views.navigate = new APP.View.Navigate({
        leftLabel: '返回',
        rightLabel: '确定',
        title: '选择样式',
        el: this.$el.find('.navigate')
      });
      this.views.navigate.render();

      // 隐藏样式分类列表
      this.$el.find('.style_catalog').hide();
    },
    renderCatalog: function(model){
      // 渲染分类列表
      var view = new APP.View.StyleCatalogItem({
        el: this.$el.find('.style_catalog'),
        model: model
      });
      view.render();
      this.views.catalog.push(view);
    },
    renderStylePage: function (model) {
      // 渲染模板标题
      var view = new APP.View.StyleItem({
        el: this.$el.find('.style_list'),
        model: model
      });
      view.render();
      this.views.styleItem.push(view);
    },
    events: {
      'click .toolbar': 'toggleCatalog'
    },
    toggleCatalog: function () {
        this.$el.find('.style_catalog').toggle();
        var $toolbar = this.$el.find('.toolbar'),
            hasActive = $toolbar.hasClass('active'),
            hasNoActive = $toolbar.hasClass('noactive');
        if (hasActive) {
            $toolbar.removeClass('active').addClass('noactive')
        }
        else {
            $toolbar.removeClass('noactive').addClass('active');
        }
    }
  });

  // VIEW：分类catalog的单项
  APP.View.StyleCatalogItem = Backbone.View.extend({
    initialize: function(opt){
      this.model = opt.model;
    },
    template: _.template(APP.Utils.getTemplate('style_catalog_item')),
    render: function(){
      var item = $(this.template(this.model.attributes));
      // todo: 修改item的宽度以适配外框
      // 其中：this.$el为放置item的容器
      this.$el.append(item);
    }
  });

  // MODEL：分类catalog
  APP.Model.CatalogItem = Backbone.Model.extend({});

  // COLLECTION：分类catalog集合
  APP.Collection.Catalog = Backbone.Collection.extend({
    model: APP.Model.CatalogItem
  });


  // VIEW：模板的单项
  APP.View.StyleItem = Backbone.View.extend({
    initialize: function(opt){
      this.model = opt.model;
    },
    template: _.template(APP.Utils.getTemplate('style_page_item')),
    render: function(){
      var item = this.template(this.model.attributes);
      // todo: 修改item的宽度以适配外框
      // 其中：this.$el为放置item的容器
      this.$el.append(item);
    }
  });

  // MODEL：模板的单项
  APP.Model.StylePage = Backbone.Model.extend({});

  // COLLECTION：模板的集合
  APP.Collection.StylePage = Backbone.Collection.extend({
    model: APP.Model.StylePage
  });

})();