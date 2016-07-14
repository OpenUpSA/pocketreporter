/*** FooterView ***/
var FooterView = Backbone.View.extend({
  className: "footer-view",
  template: Handlebars.compile($("#footer-view-template").html()),

  events: {
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },
});
