/*** AddStoryView ***/
var AddStoryView = Backbone.View.extend({
  className: "add-story-view",
  template: Handlebars.compile($("#add-story-view-template").html()),
  navTab: 'add',

  bindings: {
    '[name=title]': 'title',
    '[name=topic]': 'topic',
  },

  events: {
    'click button.next': 'create',
  },

  initialize: function() {
    this.model = new Story();
    this.render();
    this.stickit();

    this.listenTo(this.model, 'change', this.checkOk);
  },

  render: function() {
    this.$el.html(this.template({
      topics: StoryCheck.topics.toJSON(),
    }));

    return this;
  },

  checkOk: function() {
    if (!_.isEmpty(this.model.get('title')) && this.model.get('topic')) {
      this.$('button.next').removeClass('disabled');
    }
  },

  create: function(topic) {
    this.model.set('id', new Date().valueOf());
    StoryCheck.stories.add(this.model);
    router.navigate('stories/' + this.model.id, {trigger: true});
  },
});
