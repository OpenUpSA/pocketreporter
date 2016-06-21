/*** Models ***/
var Topic = Backbone.Model.extend({
  initialize: function() {
    // improve the questions
    this.set('length', this.get('questions').length);
    this.set('questions', _.map(this.get('questions'), function(q) {
      return {
        key: q.toLowerCase().trim().replace(/[^a-z ]/ig, '').replace(/ +/g, '-'),
        q: q,
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

var Story = Backbone.Model.extend({});
var Stories = Backbone.Collection.extend({
  model: Story,
});
