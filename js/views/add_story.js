/*** AddStoryView ***/
var AddStoryView = Backbone.View.extend({
  className: "add-story-view",
  template: Handlebars.compile($("#add-story-view-template").html()),
  navTab: 'add',

  bindings: {
    '[name=title]': 'title',
  },

  events: {
    'click button.next': 'create',
  },

  initialize: function(options) {
    this.model = new Story({}, {parse: true});
    if (options.topic) this.model.set('topic', options.topic);

    this.render();
    this.listenTo(this.model, 'change', this.checkOk);
  },

  render: function() {
    var topic = this.model.get('topic');
    if (topic) topic = StoryCheck.topics.get(topic).attributes;

    this.$el.html(this.template({
      topics: StoryCheck.topics.toJSON(),
      topic: topic,
    }));

    if (topic) {
      this.$('.topic-section').hide();
      this.$('.name-section').show();
    }

    this.stickit();

    return this;
  },

  checkOk: function() {
    this.$('button.next').toggleClass('disabled', _.isEmpty(this.model.get('title')));
  },

  create: function(topic) {
    this.model.set('id', StoryCheck.newStoryId());
    StoryCheck.stories.add(this.model);

    router.navigate('stories/' + this.model.id, {trigger: true});
  },
});
