/*** AddStoryView ***/
var AddStoryView = Backbone.View.extend({
  className: "add-story-view",
  template: Handlebars.compile($("#add-story-view-template").html()),

  events: {
  },

  initialize: function() {
    this.footer = new FooterView();
    this.render();
    $("#viewport").html(this.el);
  },

  render: function() {
    this.$el.html(this.template());
    this.$('#app-footer').html(this.footer.el);
    return this;
  },
});
