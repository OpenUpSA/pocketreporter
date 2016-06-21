/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
    'click button.delete': 'deleteStory',
  },

  initialize: function() {
    this.topic = StoryCheck.topics.get(this.model.get('topic'));

    this.render();
    $("#main-view").html(this.el);
  },

  deleteStory: function() {
    StoryCheck.stories.remove(this.model);
    router.navigate('', {trigger: true});
  },

  render: function() {
    this.$el.html(this.template({
      story: this.model.toJSON(),
      topic: this.topic.toJSON(),
    }));
  },
});
