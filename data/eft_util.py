import os
import json

cached_version = None

def eft_version():
    global cached_version
    if cached_version:
        return cached_version
    cached_version = json.load(open(eft_path('ConsistencyInfo'), 'r'))['Version']
    return cached_version

def eft_path(filename):
    paths = [
        './%s' % filename,
        '/mnt/Battlestate Games/EFT/%s' % filename,
        '/mnt/Battlestate Games/EFT/EscapeFromTarkov_Data/%s' % filename,
        '/mnt/c/Battlestate Games/EFT/%s' % filename,
        '/mnt/c/Battlestate Games/EFT/EscapeFromTarkov_Data/%s' % filename,
    ]

    for path in paths:
        if os.path.exists(path):
            return path

    raise Exception("Failed to locate %s" % filename)
