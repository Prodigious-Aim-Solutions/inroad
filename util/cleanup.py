import json
import re

dir = '../static/'

files = ['new_parks.json'];
index = 0
prog = re.compile(r"\(")
for file in files:
  out_recs = []
  with open(dir + file, 'rb') as jsonfile:
    records = json.loads(jsonfile.read())
    for rec in records:
      #print rec['title']
      print re.search(r'Conservation area', rec['title'])
      if re.search(r'Conservation area', rec['title']):
        out_recs.append(rec)
        index += 1
  out = open(dir + file + "_clean.json", 'w')
  out.write(json.dumps(out_recs))
      
      