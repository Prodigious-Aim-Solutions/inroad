import json

dir = 'static/'
files = ['events.json', 'parks.json', 'persons.json', 'sites.json'];
index = 0
for file in files:
  out_recs = []
  with open(dir + file, 'rb') as jsonfile:
    records = json.loads(jsonfile.read())
    for rec in records:
      rec['locId'] = index
      out_recs.append(rec)
      index += 1
  out = open(dir + file + "_new.json", 'w')
  out.write(json.dumps(out_recs))
      
      