/*** QuestionView
 *
 * Single question/answer in a story
 */
var QuestionView = Backbone.View.extend({
  template: Handlebars.compile($("#story-question-template").html()),
  tagName: 'li',
  className: 'question clearfix',
  bindings: {
    '[name=answer]': 'answer',
    '[name=notes]': 'notes',
  },

  initialize: function(options) {
    this.question = options.question;
    this.key = this.question.key;
  },

  render: function() {
    this.$el
      .html(this.template(this.question))
      .data('key', this.key);

    this.stickit();
    this.$el.find('.btn-group input[type=radio]:checked').closest('label').addClass('active');

    return this;
  },
});


/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),
  children: [],

  events: {
    'click #app-header h1': 'changeTitle',
    'click button.delete': 'deleteStory',
    'click .share': 'share',
    'click .done': 'markDone',
  },

  initialize: function() {
    this.topic = StoryCheck.topics.get(this.model.get('topic'));

    this.answers = new AnswerList(this.model.get('answers'));
    this.answers.on('change', _.debounce(_.bind(this.saveAnswers, this), 300, true));
    this.answers.on('change', this.updateProgress, this);

    this.render();
    $("#viewport").html(this.el);
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

  markDone: function(e) {
    var key = $(e.target).closest('li').data('key');
    this.answers.set(key + "-done", true);
  },

  render: function() {
    var self = this;
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

    function renderQuestions(items, ul) {
      _.each(items, function(q) {
        var model = self.answers.get(q.key);
        if (!model) {
          model = new Answer({key: q.key});
          self.answers.add(model);
        }

        var view = new QuestionView({
          model: model,
          question: q,
        });

        self.children.unshift(view);
        ul.append(view.render().el);
      });
    }

    renderQuestions(pending, this.$('#pending-question-list'));
    renderQuestions(completed, this.$('#completed-question-list'));

    this.updateProgress();
  },

  close: function() {
    this.remove();
    _.each(this.children, function(c) { c.remove(); });
  },
});
