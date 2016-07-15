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
  topics: new Topics([
  {
    "id": "accidents",
    "name": "Accidents",
    "questions": [
      "Do you have the identification of dead, injured?",
      "Do you have the time and location?",
      "Do you have the type(s) of vehicle(s) involved?",
      "Do you have the cause of accident (from official sources)?",
      "Do you have the identification of others involved?",
      "Do you have where dead and injured were taken?",
      "Do you have the extent of injuries?",
      "Do you have the condition of injured?",
      "Was there any heroism, rescues?",
      "Were there arrest(s) or other legal action?",
      "Do you have the funeral arrangements if available?",
      "Do you have the details of damage to vehicles?",
      "Do you have the speed, origin, destination of vehicles?",
      "Do you have details of unusual weather or road conditions?",
      "Do you have accounts by eyewitnesses, investigating officers?"
    ]
  },
  {
    "id": "biography",
    "name": "Biography",
    "questions": [
      "Do you have their name?",
      "Do you have their date of birth?",
      "Do you have their place of birth?",
      "Do you have their date of death?",
      "Do you have their place of death?",
      "Do you have their physical description?",
      "Do you have their character / personality?",
      "Do you have their education (include any degrees earned)?",
      "Do you have their personal relationships (family, friends, work colleagues)?",
      "Do you have their awards / honours / formal recognition?",
      "Do you have at least five important dates from the person's life and explain why these dates are significant?",
      "Do you have their major contributions to society and the world?",
      "Do you have at least three major political or social events which occurred during this person's life. for each event, explain how you think it may have affected your biographical subject?"
    ]
  },
  {
    "id": "political-rally",
    "name": "Political rally",
    "questions": [
      "Have you got copies or recordings of the main speakers\u2019 speeches?",
      "Have you confirmed the approximate crowd numbers with an independent source (police or venue management)?",
      "Were there incidents of violence and/ or injuries that can be confirmed with an independent source (police and emergency services)?",
      "Have you conducted a minimum of ten interviews with rally attendees from separate parts of the venue?",
      "Did you establish where they live and what the socio-economic and political issues that affect them in these towns/ areas/ wards/ streets were?",
      "Did you get the biographical details of those interviewed, including ages, education levels, employment status and number of dependents?",
      "\"Why did the interviewees attend the rally and what did they hope would come out of attending?",
      "\"",
      "Where any attendees given a free lunch and a T-shirt in exchange for their presence?",
      "Did you interview a wide spectrum of people living in different geographical areas and with different socio-economic backgrounds?",
      "Did you take down their contact details?",
      "Did you contact the interviewees for responses to the main speaker\u2019s speech afterwards?",
      "Did the interviewees believe the promises made by the speakers (and why)?",
      "What sort of reception did the main speaker, and others, receive from the crowd?",
      "What was the crowd\u2019s general mood and ambience?",
      "Did you ensure that your business card was circulated to as many people as possible, especially those interviewed?"
    ]
  },
  {
    "id": "election-meeting",
    "name": "Election meeting",
    "questions": [
      "Have you established whether it is a political party branch meeting, a town hall meeting, ward councillor feedback session, a debate between political parties, a meeting of disaffected community members et cetera?",
      "What is the main topic or theme?",
      "Did you get the organisers\u2019 contact details?",
      "Have you double-checked the correct spelling and address of the venue?",
      "Have you confirmed official attendance at the event with an independent source (police or venue management)?",
      "Have you confirmed any incidents of violence and/ or injuries with an independent source (police, emergency services or venue management)?",
      "Have you conducted a minimum of ten interviews with attendees from separate parts of the venue?",
      "Where do those interviewed live?",
      "What are the socio-economic and political issues that affect them in these towns/ areas/ wards/ streets?",
      "Haveyou confirmed the biographical details of those interviewed, including ages, education levels, employment status and number of dependents?",
      "Did the interviewees express any changes in their everyday condition since the previous election?",
      "Have you asked them how effective and accessible the current councillors are?",
      "Have you asked them how voting works?",
      "What were the reasons for people to attend the meeting?",
      "Do they believe the promises made by the speakers?",
      "The contact numbers of all interviewees noted?"
    ]
  },
  {
    "id": "protest-march",
    "name": "Protest march",
    "questions": [
      "Do you have a a large scarf and a bottle of vinegar (soak scarf in vinegar if police use teargas) in case there is teargas?",
      "Do you know who the main organisers of the march are and have you confirmed their contact details for the march and after-the-fact?",
      "If this is a \u201cspontaneous march\u201d, have you established who is co-ordinating and confirmed their contact details?",
      "Have you established what triggered the \u201cspontaneous march\u201d?",
      "Were any independent activists, social movement representatives or mainstream political party members involved in any events prior to the march starting? Why were they involved?",
      "Have you noted where the march started (at what time) and where it will end?",
      "Have you established the protesters\u2019 estimation of the size of their crowd?",
      "Were interviews with organisers conducted?",
      "Did you interview a minimum ten protesters?",
      "What were their individuals reasons for participating?.",
      "Have those interviewed participated in previous marches (how many and when) and was anything achieved?",
      "Do you know who organised previous marches and what was achieved after each of these?",
      "Have you asked the interviewees where they live and what their socio-economic conditions are?",
      "Do you know what the reasons are for their protest and what did they hope to achieve by the protest?",
      "Flesh out \u201clack of service delivery\u201d if this is a common response to their reasons for protesting. Have you asked people what they mean by this?",
      "Have you asked the protesters about the responses from these authorities in each instance?",
      "Do you know whether the police responded with violence towards them during this protest?",
      "Do you know if police use non-lethal force (teargas, rubber bullets and stun grenades), lethal force (live ammunition), or both, against protesters?",
      "Have you noted the following: were protesters warned before teargas etc was used? Does this match up with what the police are saying? Is there any physical evidence (wounds, bullet casings, et cetera) to support these claims of violence by police?"
    ]
  },
  {
    "id": "election-day",
    "name": "Election day",
    "questions": [
      "Have you established contact and obtained contact details with the electoral officer in charge of the voting station?",
      "Have you observed and noted the electoral officers\u2019 relationship and conduct with the different various political parties?",
      "Have you made notes about whether any of the behaviour pf the officers suggest favouritism or underline impartiality?",
      "What degree of freedom did political parties enjoy outside voting stations?",
      "Have you asked whether the party representatives were allowed to move around, organise and express their views outside the voting station?",
      "Have you asked whether any parties were allowed to electioneer on the voting station premises itself?",
      "Have you checked who the party agents are inside of the voting stations, and asked whether they had any concerns about the voting process?",
      "Have you taken note of the conduct of electoral officers during voting and counting?",
      "Have you noted whether there were impediments to free and fair voting and counting?",
      "Have you asked if there any inconsistencies during the counting process?",
      "Did you establish and keep in continuous contact with the various political party representatives in the polling station who are also observing and ensuring the process is free and fair?",
      "Did you check in with them on any alleged irregularities on a regular basis?"
    ]
  },
  {
    "id": "checking-what-health-services-are-available",
    "name": "Checking what health services are available",
    "questions": [
      "Have you found out the name of hospital/ clinic?",
      "Do you know where it is? Place (town/ district)",
      "Have you asked what services/s are not being offered when they should be?",
      "Do you know why are these services no longer being offered?",
      "Do you know who is affected?",
      "Have you got eyewitness quotes (from patient/ patient\u2019s relative/ health workers)?",
      "Do you have their names, ages and what they experienced?",
      "Have you asked patients long have people waited to be seen?",
      "Have you asked who is responsible for delivering the service?",
      "Do you know if there enough / the correct medication available?",
      "Have you asked for a response from officials supposed to deliver the service?",
      "Have you asked patients if ff they\u2019ve been there before and, if so, was their file available?",
      "Do you know how far have patients you have interviewed have travelled to get there?",
      "Do you know how they traveled? (Bus, taxi, train, walk)",
      "Do you know what the cost of their return fare is?"
    ]
  },
  {
    "id": "reporting-on-a-specific-illness",
    "name": "Reporting on a specific illness",
    "questions": [
      "Have you established the name of the sickness/ condition that the patient has?",
      "Have you established the name of the sickness/ condition that the patient has?",
      "Do you know what the main symptoms are?",
      "Have you established the treatment they have received?",
      "Do you know where they are being treated?",
      "Have you got comment from a health worker on the sickness?",
      "Do you know how far the patient has to travel to travel for treatment?",
      "Do you know how they traveled and what the cost of their return fare was?"
    ]
  }
]),
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
