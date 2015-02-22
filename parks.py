import wikipedia
import urllib2
import urllib
import re

results = wikipedia.page('List of protected areas of Nova Scotia')
full_parks = results.content
parks = re.sub(r'[^a-zA-Z\s\\n]', ' ', full_parks).split('\n')
search_url = 'http://geogratis.gc.ca/services/geolocation/en/locate?q='

output = ""
for park in parks:
    if park:
        #print park
        search_url = 'http://geogratis.gc.ca/services/geolocation/en/locate?q=' + urllib.quote(park)  
        #output += urllib2.urlopen(search_url).read()
        output = urllib2.urlopen(search_url).read()
        #print len(output)
        if len(output) > 4:
            output = output[3:len(output) - 1]
            print output + ","
