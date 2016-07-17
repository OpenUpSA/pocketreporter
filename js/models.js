/*** Models ***/

// StoryCheck state
var State = Backbone.Model.extend({
  defaults: {
    stories: [],
    nextId: 1,
  },
});


var Topic = Backbone.Model.extend({
  initialize: function() {
    // improve the questions
    this.set('length', this.get('questions').length);
    this.set('questions', _.map(this.get('questions'), function(q) {
      return {
        key: q.toLowerCase().trim().replace(/[^a-z ]/ig, '').replace(/ +/g, '-'),
        question: q,
      };
    }));

    _.each(this.get('questions'), function(q, i) {
      q.num = i+1;
    });
  },
});


var Topics = Backbone.Collection.extend({
  model: Topic,
});


var Story = Backbone.Model.extend({
  defaults: function() {
    return {
      answers: [],
      archived: false,
      created_at: moment(),
      updated_at: moment(),
    };
  },

  initialize: function() {
    this.on('change', this.updated, this);
    this.on('change:topic', this.setupTopic, this);
  },

  setupTopic: function() {
    // clear answers and ensure we have one for every question
    var topic = StoryCheck.topics.get(this.get('topic'));
    this.set('answers', _.map(topic.get('questions'), function(q) {
      return new Answer({key: q.key}).toJSON();
    }));
  },

  parse: function(json, options) {
    // reify moments from iso8601 string
    json.created_at = moment(json.created_at);
    json.updated_at = moment(json.updated_at);
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
    return _.filter(this.get('answers'), function(a) { return !a.done; });
  },

  completed: function() {
    return _.filter(this.get('answers'), function(a) { return a.done; });
  },

  shareableBody: function() {
    var topic = StoryCheck.topics.get(this.get('topic')),
        answers = _.indexBy(this.get('answers'), 'key'),
        questions;

    questions = _.map(topic.get('questions'), function(q) {
      var answer = answers[q.key] || {};
      var s = q.num + "/" + topic.get('length') + ": " + q.question + ': ' + (answer.answer || ""),
          notes = answer.notes;

      if (notes) {
        s += "\n\n" + notes;
      }

      return s;
    });

    return questions.join('\n---\n\n');
  },
});

var Stories = Backbone.Collection.extend({
  model: Story,
  comparator: 'updated_at',
});

/* answers are a simple model, with attributes for each question key, such as
 * q-name: answer for the name question
 * q-name-notes: notes for the "name" question
 */
var Answer = Backbone.Model.extend({
  idAttribute: 'key',
  defaults: {
    done: false,
  },
});
var AnswerList = Backbone.Collection.extend({
  model: Answer,
});
