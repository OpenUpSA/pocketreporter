/*** SettingsView
 *
 * Right now, all this does is allow the user to select their language preference.
 *
 */
var SettingsView = Backbone.View.extend({
  className: "settings-view",
  template: Handlebars.compile($("#settings-view-template").html()),

  events: {
    'change .locale': 'changed',
  },

  initialize: function() {
    this.compileLocales();
    this.render();
    this.listenTo(PocketReporter.state, 'change:locale', this.render);
  },

  render: function() {
    var current = PocketReporter.state.get('locale');

    _.each(this.locales, function(locale) {
      locale.selected = locale.locale == current;
    });

    this.$el.html(this.template({
      locales: this.locales,
    }));

    return this;
  },

  compileLocales: function() {
    this.locales = [];

    for (var locale in L10N) {
      if (L10N.hasOwnProperty(locale)) {
        this.locales.push({
          locale: locale,
          name: L10N[locale].name,
          selected: false,
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

  changed: function() {
    PocketReporter.state.set('locale', this.$('.locale:checked').val());
  }
});
