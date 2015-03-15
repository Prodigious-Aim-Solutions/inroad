import csv
import json

jsonEvents = []
with open('NEW_NHSC_LHNC_TB.csv', 'rb') as csvfile:
  events = csv.reader(csvfile)
  for event in events:
    #print event[6]
    if event[6] == 'Nova Scotia':
      jsonEvent = {
        "title": unicode(event[1], 'utf-8', errors='replace'), 
        "qualifier": "LOCATION",
        "details": unicode(event[7], 'utf-8', errors='replace'),
        "geometry": {"type":"Point","coordinates":[event[10], event[9]]}
      }
      jsonEvents.append(jsonEvent)
  print json.dumps(jsonEvents)