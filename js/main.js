/*** Router ***/
var Router = Backbone.Router.extend({
  routes : {
    "" : "home",
    "stories/:id" : "story"
  },

  home: function() {
    this.loadView(new HomeView());
  },

  story: function(id) {
    var story = StoryCheck.stories.get(id);
    this.loadView(new StoryView({model: story}));
  },

  loadView: function(view) {
    if (this.view) {
      if (this.view.close) {
        this.view.close();
      } else {
        this.view.remove();
      }
    }

    this.view = view;
  }
});


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
    this.$el.html(this.template({
      topics: StoryCheck.topics.toJSON(),
      stories: StoryCheck.stories.toJSON(),
    }));
  },
});


/*** StoryView ***/
var StoryView = Backbone.View.extend({
  className: "story-view",
  template: Handlebars.compile($("#story-view-template").html()),

  events: {
  },

  initialize: function() {
    this.render();
    $("#main-view").html(this.el);
  },

  render: function() {
    this.$el.html(this.template({
      story: this.model.toJSON(),
    }));
  },
});


/*** Persistence ***/
var Persistence = Backbone.Model.extend({
  initialize: function() {
    this.storage = localStorage;

    this.load();

    StoryCheck.stories.on('change add remove', _.bind(this.save, this));
  },

  load: function() {
    var val = this.storage.getItem('stories');
    if (val) val = JSON.parse(val);
    StoryCheck.stories = new Stories(val || []);
  },

  save: function() {
    this.storage.setItem('stories', JSON.stringify(StoryCheck.stories.toJSON()));
  },
});


/*** Models ***/
var Topic = Backbone.Model.extend({});
var Topics = Backbone.Collection.extend({
  model: Topic,
});

var Story = Backbone.Model.extend({});
var Stories = Backbone.Collection.extend({
  model: Story,
});


/*** Globals ***/
var StoryCheck = {
  topics: new Topics([{
    id: 'accidents',
    name: 'Accidents',
    questions: [
      "Identification of dead, injured",
      "Time and location",
      "Type(s) of vehicle(s) involved",
    ],
  }, {
    id: 'biography',
    name: 'Biography',
    questions: [
      "Name",
      "Date of birth",
      "Place of birth",
    ],
  }]),

};


// do it
new Persistence();
var router = new Router();
Backbone.history.start();
