/**
 * Created by msm on 2015-1-23.
 */
(function(){
  APP.View.Navigate = Backbone.View.extend({
    initialize: function(opt){
      this.label.leftLabel = opt.leftLabel;
      this.label.rightLabel = opt.rightLabel;
      this.label.title = opt.title;
    },
    template: _.template(APP.Utils.getTemplate('navigate')),
    render: function(){
      this.$el.html(this.template(this.label));
      return this;
    },
    label: {}
  });
})();