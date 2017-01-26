/*** UserInfoView
 *
 * This isn't the best flow. This is shown when a user first creates
 * a story. That's added to the list, then we come here.
 *
 * ***/
var UserInfoView = Backbone.View.extend({
  className: "userinfo-view",
  template: Handlebars.compile($("#userinfo-view-template").html()),

  bindings: {
    '[name=email]': 'email'
  },

  initialize: function() {
    this.storyid = PocketReporter.stories.at(PocketReporter.stories.length-1).id;

    this.model = PocketReporter.user;
    this.listenTo(this.model, 'change', this.checkOk);

    this.render();
    this.stickit();
  },

  render: function() {
    this.$el.html(this.template({
      storyid: this.storyid
    }));
    return this;
  },

  checkOk: function() {
    this.$('.btn.success').toggleClass('disabled', _.isEmpty(this.model.get('email')));
  }
});
