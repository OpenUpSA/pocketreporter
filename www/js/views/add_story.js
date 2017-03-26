/*** AddStoryView ***/
var AddStoryView = Backbone.View.extend({
  className: "add-story-view",
  template: Handlebars.compile($("#add-story-view-template").html()),
  navTab: 'add',

  bindings: {
    '[name=title]': 'title'
  },

  events: {
    'click button.next': 'create'
  },

  initialize: function(options) {
    this.model = new Story({}, {parse: true});
    if (options.topic) this.model.set('topic', options.topic);

    this.render();
    this.listenTo(this.model, 'change', this.checkOk);
    this.listenTo(PocketReporter.state, 'change:locale', this.render);
  },

  render: function() {
    var topics = PocketReporter.topics.toJSON();
    var topic = this.model.get('topic');

    // translate
    _.each(topics, function(t) {
      t.name = PocketReporter.polyglot.t('topics.' + t.id + '.name');
    });

    if (topic) topic = _.find(topics, function(t) { return t.id == topic; });

    this.$el.html(this.template({
      topics: topics,
      topic: topic
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
    this.model.set('id', PocketReporter.newStoryId());
    PocketReporter.stories.add(this.model);

    router.navigate('stories/' + this.model.id, {trigger: true});
  }
});
