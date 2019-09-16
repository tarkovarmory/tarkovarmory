#!/usr/bin/python3

import re
import json
import glob
from collections import defaultdict
from eft_util import eft_path, eft_version
from slugify import slugify


print("EFT: %s" % eft_version())
config = json.load(open('%s/config.json' % eft_version(), 'r'))['data']['config']
item_db = json.load(open('%s/item-database.json' % eft_version(), 'r'))['data']
languages = {
    'en': json.load(open('%s/en.json' % eft_version(), 'r'))['data']['templates'],
    'ru': json.load(open('%s/ru.json' % eft_version(), 'r'))['data']['templates'],
    'de': json.load(open('%s/de.json' % eft_version(), 'r'))['data']['templates'],
}
print("Items in database: %d" % len(item_db))


last_id = 0
hash_to_id = {}
nodes = {}
items = {}
tr = {
    'en': defaultdict(dict),
    'ru': defaultdict(dict),
    'de': defaultdict(dict),
}

def extract_interesting_fields(item):
    ret = {}
    for field in item['_props']:
        if field in (
            'armorClass',
            'speedPenaltyPercent',
            'mousePenalty',
            'weaponErgonomicPenalty',
            'Indestructibility',
            'Width',
            'Height',

            'Damage',
            'buckshotBullets',
            'PenetrationPower',
            'ProjectileCount',
            'Durability',
            'MaxDurability',
            "Tracer",
            "TracerDistance",
            "ArmorDamage",
            "InitialSpeed",
            "RecoilForceUp",
            "RecoilForceBack",
            "bEffDist",
            "bHearDist",
            "bFirerate",
        ):
            ret[field] = int(item['_props'][field])

        if field in (
            "BluntThroughput",
            "SpeedRetardation",
            "StaminaBurnPerDamage",
            "BallisticCoeficient",
            'MisfireChance',
            'RicochetChance',
            'FragmentationChance',
            'PenetrationPowerDiviation',

            'Weight',
            "Accuracy",
            "AimPlane",
            "CameraRecoil",
            "CameraSnap",
            "CenterOfImpact",
            "DeviationCurve",
            "DeviationMax",
            "EffectiveDistance",
            "Ergonomics",
            "HipInnaccuracyGain",
            "Loudness",
            "Recoil",
            "RecoilAngle",
            "Convergence",
            "shotgunDispersion",
            "SightingRange",
            "Velocity",
        ):
            ret[field] = float(item['_props'][field])

        if field in (
            'Rarity',
            'SpawnChance',
            'CreditsPrice',
            'DeafStrength',
            'ArmorMaterial',
            'armorZone',
            'headSegments',
            "TracerColor",
            "Caliber",
            "weapFireType",
            "ammoCaliber",

            "BoltAction",
        ):
            if field == 'headSegments' and len(item['_props'][field]) == 0:
                pass
            else:
                ret[field] = item['_props'][field]

        if field == 'Slots' and len(item['_props']['Slots']) > 0:
            ret['slots'] = {}
            for slot in item['_props']['Slots']:
                assert(len(slot['_props']['filters']) == 1)
                ret['slots'][slot['_name']] = {
                    'required': slot['_required'],
                    'filter': [hash_to_id[hash] for hash in slot['_props']['filters'][0]['Filter']],
                }

        if field == 'ConflictingItems' and len(item['_props']['ConflictingItems']) > 0:
            ret['conflicting_items'] = [hash_to_id[hash] for hash in item['_props']['ConflictingItems']]

    if 'TracerColor' in ret:
        if 'Tracer' not in ret or not ret['Tracer']:
            del ret['Tracer']
            del ret['TracerColor']

    return ret



well_known_ids = {}

for hash in item_db:
    last_id += 1
    hash_to_id[hash] = last_id

for hash in item_db:
    id = hash_to_id[hash]
    item = item_db[hash]
    assert(item['_type'] in ('Item', 'Node'))
    if item['_type'] == 'Node':
        if item['_name'] == 'Ammo':
            well_known_ids['ammo'] = id
        elif item['_name'] == 'Armor':
            well_known_ids['armor'] = id
        elif item['_name'] == 'Weapon':
            well_known_ids['weapon'] = id
        elif item['_name'] == 'Armor':
            well_known_ids['armor'] = id
        elif item['_name'] == 'Vest':
            well_known_ids['vest'] = id
        elif item['_name'] == 'Headwear':
            well_known_ids['headwear'] = id


    items[id] = extract_interesting_fields(item)
    items[id]['parent_id'] = hash_to_id[item['_parent']] if item['_parent'] else None
    items[id]['slug'] = slugify(item['_name'])

    for lang in languages:
        if hash in languages[lang]:
            tr[lang][id]['lname'] = languages[lang][hash]['Name']
            tr[lang][id]['name'] = languages[lang][hash]['ShortName']
        else:
            tr[lang][id]['name'] = item['_name']



NOARMOR=-1
NOHELMET=-2
NOVEST=-3
tr['en'][NOARMOR]['name'] = 'No armor'
tr['ru'][NOARMOR]['name'] = 'Нет брони'
tr['de'][NOARMOR]['name'] = 'Keine Rüstung'

tr['en'][NOHELMET]['name'] = 'No helmet'
tr['ru'][NOHELMET]['name'] = 'Нет шлема'
tr['de'][NOHELMET]['name'] = 'Kein helm'

tr['en'][NOVEST]['name'] = 'No vest'
tr['ru'][NOVEST]['name'] = 'Нет брони'
tr['de'][NOVEST]['name'] = 'Keine Weste'



# Images
image_map = {}
for fname in glob.glob("images/*.png"):
    hash = re.match("images/([^.]+).png", fname)[1]
    if hash in hash_to_id:
        image_map[hash_to_id[hash]] = hash
    else:
        print("No matching item for %s" % hash)



print("Categories: %d" % len(nodes))
print("Items: %d" % len(items))
print("Well known ids: %s" % json.dumps(well_known_ids, indent=4))

with open('generated.ts', 'w') as out:
    out.write('export const eft_version = \"%s\";\n' % eft_version())
    out.write('export const well_known_ids = %s;\n' % json.dumps(well_known_ids, indent=4))
    #out.write('export const nodes = %s;\n' % json.dumps(nodes, indent=4))
    out.write('export const genitems = %s;\n' % json.dumps(items, indent=4))
    out.write('export const config = %s;\n' % json.dumps({
        "armor_materials": config['ArmorMaterials'],
    }, indent=4))
    out.write('export const tr = %s;\n' % json.dumps(tr, indent=4))
    out.write('export const images = %s;\n' % json.dumps(image_map, indent=4))
