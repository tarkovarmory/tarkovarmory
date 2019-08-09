# Server setup

Ubuntu 18.10

```
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Install Node.js and let it run on priviliged ports
apt install -y nodejs npm
npm install -g source-map-support
setcap 'cap_net_bind_service=+ep' /usr/bin/node


# Add our service file 
cp tarkovarmory.service /etc/systemd/system/
systemctl enable tarkovarmory.service
```

# Publishing updates
```
make live
```


# Extracting a new batch of images

1. With the Unity Asset Bundle Extractor: https://github.com/DerPopo/UABE open up the assets files in `C:\Battlestate Games\EFT\EscapefromTarkov_Data\`
2. Select all Texture2D elements and export as `.json` files to `data/uab_json_exports/`
3. Make sure `c:` is mounted at `/mnt/` or `/mnt/c`

```
cd data
./extract_images.py
```
