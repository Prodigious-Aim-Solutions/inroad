import csv
import json

jsonEvents = []
with open('NHSC_LNHC_TB.csv', 'rb') as csvfile:
  events = csv.reader(csvfile)
  for event in events:
    if event[5] == 'Nova Scotia':
      jsonEvent = {
        "title": unicode(event[0], 'utf-8', errors='replace'), 
        "qualifier": "LOCATION",
        "details": unicode(event[6], 'utf-8', errors='replace'),
        "geometry": {"type":"Point","coordinates":[event[9], event[8]]}
      }
      jsonEvents.append(jsonEvent)
  print json.dumps(jsonEvents)