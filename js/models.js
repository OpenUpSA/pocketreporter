/*** Models ***/
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
      answers: {},
      archived: false,
      created_at: moment(),
      updated_at: moment(),
    };
  },

  initialize: function() {
    this.on('change', this.updated, this);
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

  title: function() {
    return 'Your ' + this.get('topic') + ' story ' + this.id;
  },

  shareableBody: function() {
    var topic = StoryCheck.topics.get(this.get('topic')),
        answers = this.get('answers'),
        questions;


    questions = _.map(topic.get('questions'), function(q) {
      var s = q.num + "/" + topic.get('length') + ": " + q.question + ': ' + (answers[q.key] || ""),
          notes = answers[q.key + '-notes'];
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

var Answers = Backbone.Model.extend({});
