
VERSION=$(shell ./eft_version.py)
RESOURCES=$(shell ./resources_path.py)

all: dirs generated.ts 
	
generated.ts: item-database.json latest/item-database.json latest/en.json latest/ru.json latest/de.json ./build_ts_files.py
	./build_ts_files.py

latest/item-database.json: $(RESOURCES) ./extract_from_resources.py
	@echo "Extracting databases"
	./extract_from_resources.py

item-database.json: latest/item-database.json
	cp latest/item-database.json item-database.json

dirs:
	@rm -f latest
	@ln -sf ./$(VERSION) ./latest
	@mkdir -p $(VERSION)/blobs

clean:
	rm -f items.ts
	rm -Rf $(VERSION)
	rm -f latest

.PHONY: dirs
