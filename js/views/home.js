/*** HomeView ***/
var HomeView = Backbone.View.extend({
  className: "home-view",
  template: Handlebars.compile($("#home-view-template").html()),
  navTab: 'home',

  events: {
    'click #splash .button': 'add',
    'click .delete': 'deleteStory'
  },

  initialize: function() {
    this.render();

    this.listenTo(PocketReporter.stories, 'add remove', this.render);
    this.listenTo(PocketReporter.state, 'change:locale', this.render);
  },

  add: function() {
    router.navigate('add', {trigger: true});
  },

  deleteStory: function(e) {
    e.preventDefault();

    if (confirm("Delete this story?")) {
      var id = $(e.target).closest('.story-item').attr('data-id');
      var story = PocketReporter.stories.get(id);

      PocketReporter.stories.remove(story);
      window.ga.trackEvent('story','delete');
      router.navigate('', {trigger: true});
    }
  },

  render: function() {
    var topics = _.indexBy(PocketReporter.topics, 'id');

    function serialize(story) {
      var topic = PocketReporter.topics.get(story.get('topic'));
      var d = story.toJSON();

      d.percent_complete = story.percentComplete();
      d.topic_name = PocketReporter.polyglot.t(topic ? topic.get('name') : d.topic);

      return d;
    }

    this.$el.html(this.template({
      empty: PocketReporter.stories.length === 0,
      stories: PocketReporter.stories.map(serialize).reverse(),
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
          value: p == 1 ? '\uf005' : '',
          style: {
            color: '#4a4a4a',
          },
        },
      }).set(p);
    });
  },
});
