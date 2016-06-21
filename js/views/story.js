/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
  },

  initialize: function() {
    this.render();
    $("#main-view").html(this.el);
  },

  render: function() {
    this.$el.html(this.template({
      story: this.model.toJSON(),
    }));
  },
});
