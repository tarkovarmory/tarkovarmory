#!/usr/bin/python

import re
import json
import sys

from eft_util import eft_path, eft_version

print("Extracting json blobs from %s to %s" % (eft_path("resources.assets"), eft_version()))

resources = open(eft_path("resources.assets"), "rb").read()
blobs = []

def findall(p, s):
    i = s.find(p)
    while i != -1:
        yield i
        i = s.find(p, i+1)

opening_braces = [x for x in findall(b'{', resources)]

def find_matching_close_brace(start):
    #print(resources[start:start+1])
    assert(resources[start:start+1] == b'{')
    cur = start
    depth = 0
    while cur < len(resources):
        if resources[cur:cur+1] == b'{':
            depth += 1
        if resources[cur:cur+1] == b'}':
            depth -= 1
        if resources[cur:cur+1] == b'\xff':
            return -1
        if resources[cur:cur+1] == b'\x00':
            return -1
        if depth == 0:
            return cur
        cur += 1
    return -1


def blob_type(blob):
    if 'CenterX' in blob:
        return 'position'


    if 'data' in blob:
        if 'config' in blob['data']:
            return 'config'

        if type(blob['data']) is dict:
            # Look for i18n strings
            if 'interface' in blob['data']:
                # There are a few wandering english translation files, but the big one that seems to be most
                # complete has the ragfair keys in it, so I'm assuming those are the ones we care about.
                if "ragfair/PriceTo" in blob['data']['interface'] and 'Killed' in blob['data']['interface']:
                    if blob['data']['interface']['Killed'] == 'Killed':
                        return 'en'
                    if blob['data']['interface']['Killed'] == "\u0423\u0431\u0438\u0442":
                        return 'ru'
                    if blob['data']['interface']['Killed'] == "Get\u00f6tet":
                        return 'de'

            # Look for Item Database
            for k in blob['data']:
                if type(blob['data'][k]) is not dict:
                    break
                if '_type' in blob['data'][k] and blob['data'][k]['_type'] == 'Item' and '_props' in blob['data'][k]:
                    if 'Name' in blob['data'][k]['_props'] and 'armorClass' in blob['data'][k]['_props']:
                        if blob['data'][k]['_props']['Name'] == 'PACA':
                            print("")
                            print("####################################################")
                            print("############# FOUND ITEM DATABASE ##################")
                            print("####################################################")
                            print("")
                            return 'item-database'


    # Look for maps
    if 'Area' in blob and 'exit_time' in blob and 'MinPlayers' in blob:
        return 'map'


    return 'unknown'



start = 0
end_pos = -1
blob_number = 0

for opening in opening_braces:
    sys.stdout.write("\r  %d / %d" % (opening, opening_braces[-1]))
    sys.stdout.flush()
    if opening < start:
        continue
    start = opening
    end_pos = find_matching_close_brace(start) + 1
    if end_pos == -1:
        continue

    try:
        blob = json.loads(resources[start:end_pos])
        if end_pos - start <= 3:
            continue
    except UnicodeDecodeError as e:
        continue
    except json.decoder.JSONDecodeError as e:
        continue


    blobs.append(blob)

    t = blob_type(blob)

    if t not in ['position']:
        if t == 'unknown':
            name = "%s-%d.json" % (t, blob_number)
        elif t == 'map':
            name = 'map-%s-%d.json' % (blob['Name'], blob_number)
        elif t in ['en', 'ru', 'de']:
            #name = '%s-%d.json' % (t, blob_number)
            name = '%s.json' % t
        else:
            name = '%s.json' % t

        print(" Writing %s (%d bytes)" % (name, end_pos - start))
        with open('%s/%s' % (eft_version(), name), "w") as out:
            out.write(json.dumps(blob, indent=4))
    else:
        #print(" Ignoring %s json blob %d (%d bytes)" % (blob_type(blob), blob_number, end_pos - start))
        name = "blob-%d.json" % blob_number
        with open('%s/blobs/%s' % (eft_version(), name), "w") as out:
            out.write(json.dumps(blob, indent=4))
        pass

    start = end_pos
    blob_number += 1


print("-----------------------")
print("%d blobs found" % len(blobs))
