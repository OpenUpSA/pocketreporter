/*** HomeView ***/
var HomeView = Backbone.View.extend({
  className: "home-view",
  template: Handlebars.compile($("#home-view-template").html()),
  navTab: 'home',

  initialize: function() {
    this.render();

    StoryCheck.stories.on('add remove', _.bind(this.render, this));
  },

  render: function() {
    var archived = StoryCheck.stories.where({archived: true}),
        current = StoryCheck.stories.where({archived: false});

    function serialize(story) {
      var d = story.toJSON();
      d.percent_complete = story.percentComplete();
      return d;
    }

    this.$el.html(this.template({
      topics: StoryCheck.topics.toJSON(),
      stories: _.map(current, serialize).reverse(),
      archived: _.map(archived, serialize).reverse(),
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
