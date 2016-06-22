/*** HomeView ***/
var HomeView = Backbone.View.extend({
  className: "home-view",
  template: Handlebars.compile($("#home-view-template").html()),

  events: {
    'click .topic-list button': 'newStory',
  },

  initialize: function() {
    this.render();
    $("#main-view").html(this.el);

    StoryCheck.stories.on('add remove', _.bind(this.render, this));
  },

  newStory: function(e) {
    var topic = $(e.target).data('topic'),
        story = new Story({topic: topic});
    story.set('id', story.cid);

    StoryCheck.stories.add(story);
    router.navigate('stories/' + story.id, {trigger: true});
  },

  render: function() {
    var archived = StoryCheck.stories.where({archived: true}),
        current = StoryCheck.stories.where({archived: false});

    this.$el.html(this.template({
      topics: StoryCheck.topics.toJSON(),
      stories: _.map(current, function(s) { return s.toJSON(); }),
      archived: _.map(archived, function(s) { return s.toJSON(); }),
    }));
  },
});
