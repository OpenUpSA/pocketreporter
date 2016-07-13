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

    if (story) {
      this.loadView(new StoryView({model: story}));
    } else {
      this.navigate('', {trigger: true});
    }
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
    StoryCheck.stories = new Stories(val || [], {parse: true});
  },

  save: function() {
    this.storage.setItem('stories', JSON.stringify(StoryCheck.stories.toJSON()));
  },
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


// collapsibles
$('body').on('show.bs.collapse', '.collapsible-sections .collapse', function() {
  $(this).prev().removeClass('collapsed');
});
$('body').on('hide.bs.collapse', '.collapsible-sections .collapse', function() {
  $(this).prev().addClass('collapsed');
});


// do it
new Persistence();
var router = new Router();
Backbone.history.start();
