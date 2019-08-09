NODE_PATH:=node_modules:$(NODE_PATH)
PATH:=node_modules/.bin/:$(PATH)

tmux: node_modules
	tmux new-session -d -s tarkov 'exec make client'
	tmux rename-window 'Tarkov Armory'
	tmux split-window -v 'exec make server'
	tmux split-window -v 'exec make runserver'
	tmux -2 attach-session -t tarkov

precompute: src/precomputed.ts

src/precomputed.ts: src/precompute.ts data/generated.ts src/simulations.ts
	node dist/precompute.js

dist/precompute.js:
	mkdir -p dist
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) PRODUCTION=true webpack --devtool=source-map --config webpack-server.config.js

client: src/precomputed.ts
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) supervisor -w Gulpfile.js,webpack.config.js,tsconfig.json supervisor -w Gulpfile.js -x gulp --

server: src/precomputed.ts
	#NODE_PATH=$(NODE_PATH) PATH=$(PATH) supervisor -w Gulpfile.js,webpack.config.js,tsconfig.json supervisor -w Gulpfile.js -x gulp --
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) webpack --watch --progress --colors --config webpack-server.config.js

runserver:
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) webpack --colors --config webpack-server.config.js
	cd dist/; NODE_PATH=../$(NODE_PATH) PATH=../$(PATH) supervisor -w server.js -- --expose_gc server.js

node_modules:
	npm install

min: 
	make -j16 minjs mincss

mincss:
	mkdir -p dist
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) gulp min_styl
	@echo 'gzipped tarkovarmory.min.css: ' `gzip -9 dist/tarkovarmory.min.css -c | wc -c`

minjs: minclient minserver

minclient:
	mkdir -p dist
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) PRODUCTION=true webpack --optimize-minimize --devtool=source-map --display-modules
	@echo 'gzipped client.min.js: ' `gzip -9 dist/client.min.js -c | wc -c`

minserver:
	mkdir -p dist
	NODE_PATH=$(NODE_PATH) PATH=$(PATH) PRODUCTION=true webpack --devtool=source-map --config webpack-server.config.js


pack:
	rm -Rf tarkov-armory
	mkdir -p tarkov-armory/static
	make -j16 parallel-pack

parallel-pack: minjs mincss assets
	cp dist/client.min.js tarkov-armory/static/client.js
	cp dist/server.min.js tarkov-armory/server.js
	cp dist/tarkovarmory.min.css tarkov-armory/static/tarkovarmory.css
	rm -f tarkov-armory.tar.gz
	tar -zcf tarkov-armory.tar.gz tarkov-armory


live push publish: pack
	scp tarkov-armory.tar.gz tarkov:
	ssh tarkov -C "tar -zxf tarkov-armory.tar.gz"
	ssh root@tarkov -C "systemctl restart tarkovarmory"

assets:
	cp -Rp data/images tarkov-armory/static/

clean:
	rm -Rf tarkov-armory
	rm -Rf dist
	mkdir -p dist
	rm tarkov-armory.tar.gz

.PHONY: pack clean assets client server tmux
