import argparse
import codecs
import re

import json
import csv


def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.encode('utf-8')


def unicode_csv_reader(unicode_csv_data, dialect=csv.excel, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.reader(utf_8_encoder(unicode_csv_data),
                            dialect=dialect, **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8') for cell in row]


def dump(d, prefix=""):
    for key, val in d.iteritems():
        p = prefix + key

        if isinstance(val, dict):
            dump(val, p + ".")
        else:
            print '%s,"%s"' % (p, val.replace('"', '\\"'))


def load_csv(fname):
    output = {}

    with codecs.open(fname, "r", "utf-8") as f:
        for line in unicode_csv_reader(f, escapechar='\\'):
            key, string = line
            deep_set(output, key, string)

    return output


def deep_set(into, key, string):
    parts = key.split('.')
    for part in parts[:-1]:
        into = into.setdefault(part, {})

    into[parts[-1]] = string


def read_l10n():
    with codecs.open("www/js/l10n.js", "r", "utf-8") as f:
        data = f.read()
        data = re.sub(r'^var L10N = ', '', data)
        data = re.sub(r';$', '', data)
        return json.loads(data)


def write_l10n(strings):
    with codecs.open("www/js/l10n.js", "w", "utf-8") as f:
        data = json.dumps(strings, indent=2, sort_keys=True)
        data = u"var L10N = " + data + u";"
        f.write(data)


def load_and_save(csvfile, language):
    strings = load_csv(csvfile)

    # read in existing JSON
    existing = read_l10n()
    existing[language] = strings

    # fold it back in
    write_l10n(existing)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load translation strings from CSV into js/l10n.js.')
    parser.add_argument('--file', dest='filename', help='Filename of CSV file to import', required=True)
    parser.add_argument('--language', dest='language', help='Language code', required=True)

    args = parser.parse_args()

    # data = json.load(open('en.json'))
    # dump(data)

    load_and_save(args.filename, args.language)
