/*** FooterView ***/
var FooterView = Backbone.View.extend({
  className: "footer-view",

  viewChanged: function(view) {
    this.$('.nav-items a').removeClass('active');

    if (view.navTab) this.$('.nav-items a.' + view.navTab).addClass('active');
  },
});
