# Pocket Reporter

**HELP WANTED: We don't have the capacity to maintain this app. We're looking for community volunteers to help us out and keep it going. Please email info@code4sa.org if you're interested.**

PocketReporter is an mobile app for Android devices that helps you be a better reporter by guiding you through the news gathering process.

* [pocketreporter.co.za](http://pocketreporter.co.za)
* [Google App Store](https://play.google.com/store/apps/details?id=com.phonegap.pocketreporter&hl=en)

PocketReporter is a simple client-only Javascript app based on [Backbone.js](http://backbonejs.org/) and built using Phonegap Build.

The ``app`` branch is the app itself, the ``gh-pages`` branch is the website. 

## Local development

Local development is simple because the app is client-side only and has no server component. You can use any local webserver that servers files from the filesystem. We use [Jekyll](http://jekyllrb.com/).

1. Clone the repo and `cd` into the repo directory
2. Switch to the **app** branch: `git checkout app`
3. Start any local webserver, such as Jekyll: ``jekyll server``
4. You can also use python: ``python -m SimpleHTTPServer 4000``
5. Visit the site in your browser: [http://localhost:4000](http://localhost:4000)

## Updating translations

1. Download the translations file [from CrowdIn.com](https://crowdin.com/project/pocketreporter/settings#translations)
2. Make a note of the language code (eg. ``en-za`` or ``xh``)
3. Import it into ``js/l10n.js`` by running:

    python strings.py --file download.csv --language LANGUAGE_CODE

4. Check the new strings in the app
5. Sanity check the changes using ``git diff``
6. Commit as usual

## Building and deploying

Phonegap is built on [Phonegap Build](https://build.phonegap.com/apps/2227365/builds) by pulling directly from the ``app`` branch of the repo.

# License and Copyright

Copyright 2016 Code for South Africa.

Licensed under the [MIT license](LICENSE).

The Pocket Report name and logo are Copyright 2016 Code for South Africa, and may not be used without permission.

# Attribution

Pocket Report is the brainchild of Raymond Joseph and is inspired by the [Virtual Reporter tool](http://nqabile.co.za/virtual) by [Kanthan Pillay](http://kanthanpillay.com/content/about).

You're welcome to re-use this code to build your own application, provided you give it a new name and logo, provide attribution to Pocket Reporter and Code for South Africa, and follow the requirements of the MIT License.
