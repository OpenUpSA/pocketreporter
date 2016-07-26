/*** HomeView ***/
var HomeView = Backbone.View.extend({
  className: "home-view",
  template: Handlebars.compile($("#home-view-template").html()),
  navTab: 'home',

  events: {
    'click #splash .button': 'add',
  },

  initialize: function() {
    this.render();

    StoryCheck.stories.on('add remove', _.bind(this.render, this));
  },

  add: function() {
    router.navigate('add', {trigger: true});
  },

  render: function() {
    var topics = _.indexBy(StoryCheck.topics, 'id');

    function serialize(story) {
      var topic = StoryCheck.topics.get(story.get('topic'));
      var d = story.toJSON();

      d.percent_complete = story.percentComplete();
      d.topic_name = topic ? topic.get('name') : d.topic;

      return d;
    }

    this.$el.html(this.template({
      empty: StoryCheck.stories.length === 0,
      stories: StoryCheck.stories.map(serialize).reverse(),
    }));

    // progress bars
    this.$('.story-list .percent').each(function() {
      var p = $(this).data('value');

      if (p == 1) $(this).addClass('complete');

      new ProgressBar.Circle(this, {
        color: '#73c619',
        trailColor: '#e6e6e6',
        strokeWidth: 15,
        text: {
          value: p == 1 ? '\uf005' : Math.trunc(p * 100) + '%',
          style: {
            color: '#4a4a4a',
          },
        },
      }).set(p);
    });
  },
});
