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

    ga('set', 'page', fragment);
    ga('send', 'pageview');
  },
});


/*** Globals ***/
var StoryCheck = Backbone.Model.extend({
  initialize: function() {
    this.topics = new Topics(STORYCHECK_TOPICS);
    // storage version
    // NB: changing this will clear all stories when a user next loads the app!
    this.version = 2;

    if ('localStorage' in window) {
      this.storage = localStorage;
    } else {
      this.storage = null;
    }

    this.load();

    var save = _.debounce(_.bind(this.save, this), 300);
    this.state.on('change', save);
    this.state.get('stories').on('change add remove', save);

    this.general();
  },

  load: function() {
    var val;

    if (this.storage) {
      val = this.storage.getItem('StoryCheck');

      if (val) {
        val = JSON.parse(val);
        // version check
        if (val.version != this.version) val = null;
      }
    }

    if (!val) val = {};

    this.state = new State(val);
    this.state.set('version', this.version);
    this.state.set('stories', new Stories(val.stories, {parse: true}));
    this.stories = this.state.get('stories');
  },

  save: function() {
    if (this.storage) {
      this.storage.setItem('StoryCheck', JSON.stringify(this.state.toJSON()));
    }
  },

  // unique story id for this user
  newStoryId: function() {
    var id = this.state.get('nextId');
    this.state.set('nextId', id + 1);
    return id;
  },

  general: function() {
    // collapsibles
    $('body').on('show.bs.collapse', '.collapsible-sections .collapse', function() {
      $(this).prev().removeClass('collapsed');
    });
    $('body').on('hide.bs.collapse', '.collapsible-sections .collapse', function() {
      $(this).prev().addClass('collapsed');
    });
  }
});


// do it
StoryCheck = new StoryCheck();
var router = new Router();
Backbone.history.start();
