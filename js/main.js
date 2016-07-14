/*** Router ***/
var Router = Backbone.Router.extend({
  routes : {
    "" : "home",
    "stories/:id" : "story",
    "add" : "add",
    "about" : "about",
  },

  initialize: function() {
    this.footer = new FooterView({el: $('#app-footer')});
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

  add: function() {
    this.loadView(new AddStoryView());
  },

  about: function() {
    this.loadView(new AboutView());
  },

  loadView: function(view) {
    if (this.view) {
      if (this.view.close) {
        this.view.close();
      } else {
        this.view.remove();
      }
    }

    $("#viewport").empty().append(view.el);
    this.view = view;
    this.footer.viewChanged(view);

    this.track();
  },

  track: function() {
    var fragment = Backbone.history.getFragment();
    if (!/^\//.test(fragment)) {
      fragment = '/' + fragment;
    }

    if ('ga' in window) {
      ga('set', 'page', fragment);
      ga('send', 'pageview');
    }
  },
});


/*** Persistence ***/
var Persistence = Backbone.Model.extend({
  initialize: function() {
    if ('localStorage' in window) {
      this.storage = localStorage;
    } else {
      this.storage = null;
    }

    this.version = 1;

    this.load();
    StoryCheck.stories.on('change add remove', _.debounce(_.bind(this.save, this), 300));
  },

  load: function() {
    var val = {};

    if (this.storage) {
      val = this.storage.getItem('StoryCheck');
      val = val ? JSON.parse(val) : val;

      // version check
      if (val.version != this.version) val = {};
    }

    StoryCheck.stories = new Stories(val.stories || [], {parse: true});
  },

  save: function() {
    if (this.storage) {
      var val = {
        version: this.version,
        stories: StoryCheck.stories.toJSON(),
      };
      this.storage.setItem('StoryCheck', JSON.stringify(val));
    }
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
