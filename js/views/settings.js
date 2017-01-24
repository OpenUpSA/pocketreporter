/*** SettingsView
 *
 * Right now, all this does is allow the user to select their language preference.
 *
 */
var SettingsView = Backbone.View.extend({
  className: "settings-view",
  template: Handlebars.compile($("#settings-view-template").html()),

  events: {
    'click .save': 'save'
  },

  initialize: function() {
    this.languages = [];
    var sortedLocales = [];
    for (var locale in L10N) {
      if (L10N.hasOwnProperty(locale)) {
        this.languages.push({
          locale: locale,
          name: L10N[locale]['name']
        });
      }
    }

    this.render();
    console.log(PocketReporter.state.get('locale'));
  },

  render: function() {
    this.compileLocales();
    this.$el.html(this.template({
      locales: this.locales
    }));
    return this;
  },

  compileLocales: function() {
    var curLocale = PocketReporter.state.get('locale');
    this.locales = [];
    for (var locale in L10N) {
      if (L10N.hasOwnProperty(locale)) {
        this.locales.push({
          locale: locale,
          name: L10N[locale]['name'],
          selected: (locale == curLocale)
        });
      }
    }
    // sort locales by name
    this.locales.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  },

  save: function() {
    var desiredLocale = this.$el.find('#localeSelect').val();
    console.log("Switching to locale: "+desiredLocale);
    PocketReporter.state.set('locale', desiredLocale);
  }
});
