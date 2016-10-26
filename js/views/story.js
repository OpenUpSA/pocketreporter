/*** QuestionView
 *
 * Single question/answer in a story
 */
var QuestionView = Backbone.View.extend({
  template: Handlebars.compile($("#story-question-template").html()),
  tagName: 'li',
  className: 'question clearfix',
  events: {
  },
  bindings: {
    '[name=notes]': 'notes',
  },

  initialize: function(options) {
    this.question = options.question;
    this.key = this.question.key;
    this.num = options.num;
    this.listenTo(this.model, 'change:notes', this.answerChanged);
  },

  answerChanged: function() {
    var done = !_.isEmpty(this.model.get('notes'));
    this.model.set('done', done);
    this.$el.toggleClass('answered', done);
  },

  render: function() {
    this.$el
      .html(this.template({
        q: this.question,
        a: this.model.attributes,
        num: this.num,
      }))
      .data('key', this.key);

    // bind form elements to model
    this.stickit();
    this.$el.find('.btn-group input[type=radio]:checked').closest('label').addClass('active');
    // this.$el.find('textarea').autogrow();
    this.answerChanged();

    return this;
  },

  inserted: function() {
    this.$el.find('textarea').autogrow();
  },
});


/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
    'click #app-header h1': 'rename',
    'click .delete': 'deleteStory',
    'click .share': 'share',
  },

  initialize: function() {
    this.topic = PocketReporter.topics.get(this.model.get('topic'));

    this.answers = this.model.get('answers');
    this.listenTo(this.answers, 'change', this.updateProgress);
    this.listenTo(this.answers, 'change:done', this.questionDone);
    this.on('view-inserted', function() {
      self.$el.find('textarea').autogrow();
    });

    // setup child views
    var self = this;
    this.children = _.map(this.topic.get('questions'), function(q, i) {
      var model = self.answers.get(q.key);

      if (!model) {
        model = new Answer({key: q.key});
        self.answers.add(model);
      }

      return new QuestionView({
        num: i+1,
        model: model,
        question: q,
      });
    });

    this.render();
  },

  updateProgress: function() {
    var p = this.model.percentComplete();
    this.$('#story-progress .progress-bar')
      .css({width: p * 100 + "%"})
      .text(Math.round(p * 100) + "% complete");

    this.$('.story-done').toggle(this.model.percentComplete() == 1.0);
  },

  deleteStory: function(e) {
    e.preventDefault();

    if (confirm("Delete this story?")) {
      PocketReporter.stories.remove(this.model);
      window.ga.trackEvent('story','delete');
      router.navigate('', {trigger: true});
    }
  },

  rename: function(e) {
    var title = prompt('Rename this story', this.model.get('title'));

    if (!_.isEmpty(title)) {
      this.model.set('title', title);
      this.$('#app-header h1').text(title);
    }
  },

  share: function(e) {
    e.preventDefault();

    var pending = this.model.pending();
    var cordova = window.cordova || null;

    if (pending.length > 0) {
      if (!confirm('You still have ' + Handlebars.helpers.pluralCount(pending.length, 'item') + ' to complete. Share anyway?'))
        return;
    }

    var mailto = 'mailto:';

    mailto += '?subject=' + encodeURIComponent(this.model.get('title'));
    mailto += '&body=' + encodeURIComponent(this.model.shareableBody());

    window.open(mailto,'_system');

    window.ga.trackEvent('story','share');
  },

  render: function() {
    var self = this;

    this.$el.html(this.template({
      story: this.model.toJSON(),
      topic: this.topic.toJSON(),
    }));

    var $questions = this.$('#question-list');

    _.each(this.children, function(view) {
      $questions.append(view.render().el);
    });

    this.updateProgress();
  },

  close: function() {
    this.remove();
    _.each(this.children, function(c) { c.remove(); });
  },
});
