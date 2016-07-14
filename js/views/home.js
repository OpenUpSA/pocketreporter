/*** HomeView ***/
var HomeView = Backbone.View.extend({
  className: "home-view",
  template: Handlebars.compile($("#home-view-template").html()),

  events: {
    'click .topic-list button': 'newStory',
  },

  initialize: function() {
    this.footer = new FooterView();
    this.render();
    $("#viewport").html(this.el);

    StoryCheck.stories.on('add remove', _.bind(this.render, this));
  },

  newStory: function(e) {
    var topic = $(e.target).data('topic'),
        story = new Story({topic: topic, id: new Date().valueOf()});

    StoryCheck.stories.add(story);
    router.navigate('stories/' + story.id, {trigger: true});
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
      new ProgressBar.Circle(this, {
        color: '#73c619',
        trailColor: '#e6e6e6',
        strokeWidth: 15,
        text: {
          value: Math.trunc(p * 100) + '%',
          style: {
            color: '#4a4a4a',
          },
        },
      }).set(p);
    });

    // footer
    this.$('#app-footer').html(this.footer.el);
  },

  close: function() {
    footer.remove();
    this.remove();
  },
});
