/*** Models ***/

// PocketReporter state
var State = Backbone.Model.extend({
  defaults: {
    stories: [],
    nextId: 1,
  }
});


var Topic = Backbone.Model.extend({
  initialize: function() {
    // improve the questions
    this.set('length', this.get('questions').length);
    _.each(this.get('questions'), function(q, i) {
      q.num = i+1;
    });
  }
});


var Topics = Backbone.Collection.extend({
  model: Topic,
  comparator: 'name'
});


var Story = Backbone.Model.extend({
  defaults: function() {
    return {
      answers: [],
      created_at: moment(),
      updated_at: moment()
    };
  },

  initialize: function() {
    this.on('change', this.updated, this);
    this.on('change:topic', this.setupTopic, this);
    // propagate events from the answer list
    this.get('answers').on('change add remove reset', this.answersChanged, this);
  },

  answersChanged: function(obj, options) {
    this.trigger('change', this, options);
  },

  setupTopic: function() {
    // clear answers and ensure we have one for every question
    var topic = PocketReporter.topics.get(this.get('topic'));
    var answers = _.map(topic.get('questions'), function(q) {
      return new Answer({key: q.key});
    });

    this.get('answers').reset(answers);
  },

  parse: function(json, options) {
    // reify moments from iso8601 string
    json.created_at = moment(json.created_at);
    json.updated_at = moment(json.updated_at);
    json.answers = new AnswerList(json.answers);
    return json;
  },

  updated: function() {
    this.set('updated_at', moment(), {silent: true});
  },

  percentComplete: function() {
    var total = this.get('answers').length;
    return (total === 0 ? 0 : this.completed().length / total);
  },

  pending: function() {
    return this.get('answers').filter(function(a) { return !a.get('done'); });
  },

  completed: function() {
    return this.get('answers').filter(function(a) { return a.get('done'); });
  },

  shareableBody: function() {
    var topic = PocketReporter.topics.get(this.get('topic')),
        answers = _.indexBy(this.get('answers').toJSON(), 'key'),
        questions;

    questions = _.map(topic.get('questions'), function(q) {
      var answer = answers[q.key] || {};
      var s = q.num + "/" + topic.get('length') + ": " + q.question + ':',
          notes = answer.notes;

      if (notes) {
        s += "\n\n" + notes;
      }

      return s;
    });

    return questions.join('\n---\n\n');
  },

  share: function() {
    var pending = this.pending();
    var cordova = window.cordova || null;

    if (pending.length > 0) {
      if (!confirm(PocketReporter.polyglot.t('story.share_incomplete')))
        return;
    }

    var mailto = 'mailto:';

    mailto += '?subject=' + encodeURIComponent(this.get('title'));
    mailto += '&body=' + encodeURIComponent(this.shareableBody());

    window.open(mailto, '_system');

    PocketReporter.trackEvent('story', 'share');
  }
});

var Stories = Backbone.Collection.extend({
  model: Story,
  comparator: 'updated_at',
  localStorage: new Backbone.LocalStorage('stories')
});

/* answers are a simple model, with attributes for each question key, such as
 * q-name-notes: notes for the "name" question
 */
var Answer = Backbone.Model.extend({
  idAttribute: 'key',
  defaults: {
    done: false
  }
});
var AnswerList = Backbone.Collection.extend({
  model: Answer
});
