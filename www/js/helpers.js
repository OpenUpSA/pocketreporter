Handlebars.registerHelper('plural', function(number, singular, plural) {
  if (number === 1)
    return singular;
  else
    return (typeof plural === 'string' ? plural : singular + 's');
});

Handlebars.registerHelper('pluralCount', function(number, singular, plural) {
  return number + ' ' + Handlebars.helpers.plural.apply(this, arguments);
});

Handlebars.registerHelper('date', function(date) {
  var then = moment().subtract(2, 'days');

  if (date.isBefore(then))
    return date.format('D MM YYYY');
  return date.fromNow();
});
