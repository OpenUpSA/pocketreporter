/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
    'click #app-header h1': 'changeTitle',
    'click button.delete': 'deleteStory',
    'click .share': 'share',
  },

  bindings: {
    '[name=archived]': 'archived',
  },

  initialize: function() {
    this.topic = StoryCheck.topics.get(this.model.get('topic'));
    this.model.on('change:archived', this.archivedChanged, this);

    this.answers = new Answers(this.model.get('answers'));
    this.answers.on('change', _.debounce(_.bind(this.saveAnswers, this), 300, true));
    this.answers.on('change', this.updateProgress, this);

    this.render();
    $("#viewport").html(this.el);

    this.setupBindings();
  },

  setupBindings: function() {
    // bindings for the story model
    this.stickit();

    // bindings for the answers
    var bindings = {};

    // link form elements to answer attributes
    _.each(this.topic.get('questions'), function(q) {
      bindings['[name="q-' + q.key + '-a"]'] = q.key;
      bindings['[name="q-' + q.key + '-notes"]'] = q.key + "-notes";
    });

    this.stickit(this.answers, bindings);
    this.$el.find('.btn-group input[type=radio]:checked').closest('label').addClass('active');
  },

  updateProgress: function() {
    var p = this.model.percentComplete();
    this.$('#story-progress .progress-bar')
      .css({width: p * 100 + "%"})
      .text(Math.round(p * 100) + "% complete");
  },

  saveAnswers: function() {
    this.model.set('answers', this.answers.toJSON());
  },

  deleteStory: function() {
    if (confirm("Delete this story?")) {
      StoryCheck.stories.remove(this.model);
      router.navigate('', {trigger: true});
    }
  },

  changeTitle: function(e) {
    this.model.set('title', prompt('Rename this story', this.model.get('title')));
    this.$('#app-header h1').text(this.model.get('title'));
  },

  share: function(e) {
    // construct a completed mailto: url
    var mailto = 'mailto:you@example.com';

    mailto += '?subject=' + encodeURIComponent(this.model.title());
    mailto += '&body=' + encodeURIComponent(this.model.shareableBody());

    window.location = mailto;
  },

  archivedChanged: function() {
    this.$el.find('.save').text(this.model.get('archived') ? 'Archive' : 'Save for later');
  },

  render: function() {
    var answers = this.model.get('answers');

    // unanswered questions
    var pending = _.filter(this.topic.get('questions'), function (q) { 
      return !answers[q.key + '-done'];
    });
    // answered questions
    var completed = _.filter(this.topic.get('questions'), function (q) { 
      return !!answers[q.key + '-done'];
    });

    this.$el.html(this.template({
      story: this.model.toJSON(),
      topic: this.topic.toJSON(),
      pending: pending,
      completed: completed,
    }));

    this.archivedChanged();
    this.updateProgress();
  },
});
