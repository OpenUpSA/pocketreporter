/*** FooterView ***/
var FooterView = Backbone.View.extend({
  className: "footer-view",
  template: Handlebars.compile($("#footer-view-template").html()),

  initialize: function() {
    this.render();
    this.listenTo(PocketReporter.state, 'change:locale', this.render);
  },

  render: function() {
    this.$el.html(this.template());
  },

  viewChanged: function(view) {
    this.$('.nav-items a').removeClass('active');

    if (view.navTab) this.$('.nav-items a.' + view.navTab).addClass('active');
  }
});
