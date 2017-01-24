/*** Router ***/
var Router = Backbone.Router.extend({
  routes : {
    "" : "home",
    "stories/:id" : "story",
    "add" : "add",
    "add/:topic" : "add",
    "about" : "about",
    "settings": "settings"
  },

  initialize: function() {
    this.footer = new FooterView({el: $('#app-footer')});
  },

  home: function() {
    this.loadView(new HomeView());
  },

  story: function(id) {
    var story = PocketReporter.stories.get(id);

    if (story) {
      this.loadView(new StoryView({model: story}));
    } else {
      this.navigate('', {trigger: true});
    }
  },

  add: function(topic) {
    this.loadView(new AddStoryView({topic: topic}));
  },

  about: function() {
    this.loadView(new AboutView());
  },

  settings: function() {
    this.loadView(new SettingsView());
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
    $('body').scrollTop(0);
    this.view = view;
    this.view.trigger('view-inserted');
    this.footer.viewChanged(view);

    this.track();
  },

  track: function() {
    var fragment = Backbone.history.getFragment();
    if (!/^\//.test(fragment)) {
      fragment = '/' + fragment;
    }

    fragment = '/app' + fragment;

    window.ga.trackView(fragment);
  }
});


/*** Globals ***/
var PocketReporter = Backbone.Model.extend({
  initialize: function() {
    var self = this;

    this.topics = new Topics(STORYCHECK_TOPICS);
    // storage version
    // NB: changing this will clear all stories when a user next loads the app!
    this.version = 5;

    if ('localStorage' in window) {
      this.storage = localStorage;
    } else {
      this.storage = null;
    }

    // localisation
    this.polyglot = new Polyglot();
    Handlebars.registerHelper("_", function(text) {
      return new Handlebars.SafeString(self.polyglot.t(text));
    });

    this.load();

    var save = _.debounce(_.bind(this.save, this), 300);
    this.state.on('change', save);
    this.state.get('stories').on('change add remove', save);

    this.general();
  },

  load: function() {
    var val;

    if (this.storage) {
      val = this.storage.getItem('PocketReporter');

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
    this.state.set('user', new Backbone.Model(val.user, {parse: true}));

    this.stories = this.state.get('stories');
    this.user = this.state.get('user');

    this.state.on('change:locale', this.loadLocale, this);
    this.loadLocale();
  },

  save: function() {
    if (this.storage) {
      this.storage.setItem('PocketReporter', JSON.stringify(this.state.toJSON()));
    }
  },

  // unique story id for this user
  newStoryId: function() {
    var id = this.state.get('nextId');
    this.state.set('nextId', id + 1);
    return id;
  },

  loadLocale: function() {
    // load new localised phrases
    var locale = this.state.get('locale'),
        phrases = L10N[locale];

    this.polyglot.replace(phrases);
  },

  general: function() {
    // collapsibles
    $('body').on('show.bs.collapse', '.collapsible-sections .collapse', function() {
      $(this).prev().removeClass('collapsed');
    });
    $('body').on('hide.bs.collapse', '.collapsible-sections .collapse', function() {
      $(this).prev().addClass('collapsed');
    });
    var originalHeight = document.documentElement.clientHeight;
    var originalWidth = document.documentElement.clientWidth;
    $(window).resize(function() {
      // Control landscape/portrait mode switch
      if (document.documentElement.clientHeight == originalWidth &&
        document.documentElement.clientWidth == originalHeight) {
        originalHeight = document.documentElement.clientHeight;
        originalWidth = document.documentElement.clientWidth;
      }
      // Check if the available height is smaller (keyboard is shown) so we hide the footer.
     if (document.documentElement.clientHeight < originalHeight) {
       $('#footer-wrapper').hide();
     } else {
       $('#footer-wrapper').show();
     }
    });
  }
});

var router = null;

var app = {
  initialize: function() {
    this.bindEvents();
    // XXX HACK HACK HACK/
    // this means we can run the app using a local webserver
    // and this must be removed when compiling using phonegap
    this.onDeviceReady();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    app.eventReceived('deviceready');
  },
  eventReceived: function(id) {
    PocketReporter = new PocketReporter();
    router = new Router();
    Backbone.history.start();
    window.ga.startTrackerWithId('UA-48399585-42');
    console.log('Event received: ',id);
  }
};

app.initialize();
