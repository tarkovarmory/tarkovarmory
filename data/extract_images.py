#!/usr/bin/python3

import json
import re
import glob
from PIL import Image

for texture_filename in glob.glob('uabe_json_exports/5*-resources.assets-*Texture2D.json'):
    hash = re.match('^[^/]+/([0-9a-fA-F]*)', texture_filename)[1]
    #sprite_filename = glob.glob('uabe_json_exports/%s*Sprite.json' % hash)[0]

    #sprite = json.loads(open(sprite_filename, "r").read())
    texture = json.loads(open(texture_filename, "r").read())

    #print(json.dumps(sprite, indent=4))
    #print(json.dumps(texture, indent=4))
    print('%s.png' % hash)
    width = texture["0 Texture2D Base"]["0 int m_Width"]
    height = texture["0 Texture2D Base"]["0 int m_Height"]
    offset = texture["0 Texture2D Base"]["0 StreamingInfo m_StreamData"]["0 unsigned int offset"]
    size = texture["0 Texture2D Base"]["0 StreamingInfo m_StreamData"]["0 unsigned int size"]
    path = texture["0 Texture2D Base"]["0 StreamingInfo m_StreamData"]["1 string path"]

    res = open('/mnt/Battlestate Games/EFT/EscapeFromTarkov_Data/%s' % path, 'rb')
    res.seek(offset)
    raw = res.read(size)

    img = Image.new("RGBA", (width, height), color = (0,0,0,255))
    pixels = img.load()
    idx = 0
    for y in range(height):
        for x in range(width):
            pixels[x,height-1-y] = (raw[idx], raw[idx+1], raw[idx+2], raw[idx+3])
            idx += 4
    img.save("images/%s.png" % hash)




