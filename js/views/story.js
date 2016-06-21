/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
    'click button.delete': 'deleteStory',
  },

  bindings: {
  },

  initialize: function() {
    this.topic = StoryCheck.topics.get(this.model.get('topic'));
    this.answers = new Answers(this.model.get('answers'));
    this.answers.on('change', _.debounce(_.bind(this.saveAnswers, this), 300, true));

    this.render();
    $("#main-view").html(this.el);

    this.setupBindings();
  },

  setupBindings: function() {
    var bindings = {};

    // link form elements to answer attributes
    _.each(this.topic.get('questions'), function(q) {
      bindings['[name="q-' + q.key + '-a"]'] = q.key;
      bindings['[name="q-' + q.key + '-notes"]'] = q.key + "-notes";
    });

    this.stickit(this.answers, bindings);
    this.$el.find('.btn-group input[type=radio]:checked').closest('label').addClass('active');
  },

  saveAnswers: function() {
    this.model.set('answers', this.answers.toJSON());
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
