/*** AboutView ***/
var AboutView = Backbone.View.extend({
  className: "about-view",
  template: Handlebars.compile($("#about-view-template").html()),
  navTab: 'about',

  initialize: function() {
    this.render();
    this.listenTo(PocketReporter.state, 'change:locale', this.render);
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
