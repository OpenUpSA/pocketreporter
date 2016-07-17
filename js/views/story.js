/*** QuestionView
 *
 * Single question/answer in a story
 */
var QuestionView = Backbone.View.extend({
  template: Handlebars.compile($("#story-question-template").html()),
  tagName: 'li',
  className: 'question clearfix',
  events: {
    'click .done': 'markDone',
  },
  bindings: {
    '[name=answer]': 'answer',
    '[name=notes]': 'notes',
  },

  initialize: function(options) {
    this.question = options.question;
    this.key = this.question.key;
    this.listenTo(this.model, 'change:answer', this.answerChanged);
  },
  
  markDone: function() {
    this.model.set('done', true);
  },

  answerChanged: function() {
    this.$('.btn.done').removeClass('disabled');
  },

  render: function() {
    this.$el
      .html(this.template({
        q: this.question,
        a: this.model.attributes,
      }))
      .data('key', this.key);

    // bind form elements to model
    this.stickit();
    this.$el.find('.btn-group input[type=radio]:checked').closest('label').addClass('active');

    return this;
  },
});


/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
    'click #app-header h1': 'rename',
    'click .delete': 'deleteStory',
    'click .archive': 'archiveStory',
    'click .share': 'share',
  },

  initialize: function() {
    this.topic = StoryCheck.topics.get(this.model.get('topic'));

    this.answers = this.model.get('answers');
    this.listenTo(this.answers, 'change', this.updateProgress);
    this.listenTo(this.answers, 'change:done', this.questionDone);

    // setup child views
    var self = this;
    this.children = _.map(this.topic.get('questions'), function(q) {
      var model = self.answers.get(q.key);

      if (!model) {
        model = new Answer({key: q.key});
        self.answers.add(model);
      }

      return new QuestionView({
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
  },

  deleteStory: function(e) {
    e.preventDefault();

    if (confirm("Delete this story?")) {
      StoryCheck.stories.remove(this.model);
      ga('send', 'event', 'story', 'delete');
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

    if (pending.length > 0) {
      if (!confirm('You still have ' + Handlebars.helpers.pluralCount(pending.length, 'item') + ' to complete. Share anyway?'))
        return;
    }

    // construct a completed mailto: url
    var mailto = 'mailto:you@example.com';

    mailto += '?subject=' + encodeURIComponent(this.model.get('title'));
    mailto += '&body=' + encodeURIComponent(this.model.shareableBody());

    ga('send', 'event', 'story', 'share');

    window.location = mailto;
  },

  questionDone: function(answer) {
    var view = _.find(this.children, function(c) { return c.key == answer.get('key'); });
    // TODO: animate this move
    view.$el.detach().appendTo(this.$completed);
    this.updateLists();
  },

  render: function() {
    var self = this;

    this.$el.html(this.template({
      story: this.model.toJSON(),
      topic: this.topic.toJSON(),
    }));

    this.$pending = this.$('#pending-question-list');
    this.$completed = this.$('#completed-question-list');

    _.each(this.children, function(view) {
      if (view.model.get('done')) {
        self.$completed.append(view.render().el);
      } else {
        self.$pending.append(view.render().el);
      }
    });

    this.updateLists();
    this.updateProgress();
  },

  updateLists: function() {
    this.$pending
      .closest('section')
      .toggleClass('empty', this.$pending.is(':empty'))
      .find('h2 .count')
      .text(Handlebars.helpers.pluralCount(this.$pending.children().length, 'item'));

    this.$completed
      .closest('section')
      .toggleClass('empty', this.$completed.is(':empty'))
      .find('h2 .count')
      .text(Handlebars.helpers.pluralCount(this.$completed.children().length, 'item'));

    // complete?
    if (this.$pending.is(":empty")) {
      this.$('.story-done').show();
    }
  },

  archiveStory: function(e) {
    e.preventDefault();

    var archived = !this.model.get('archived');
    this.model.set('archived', archived);

    ga('send', 'event', 'story', archived ? 'archive' : 'unarchive');
    router.navigate('', {trigger: true});
  },

  close: function() {
    this.remove();
    _.each(this.children, function(c) { c.remove(); });
  },
});
