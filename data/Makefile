
VERSION=$(shell ./eft_version.py)
RESOURCES=$(shell ./resources_path.py)

all: dirs generated.ts 
	
generated.ts: latest/item-database.json latest/en.json latest/ru.json latest/de.json ./build_ts_files.py
	./build_ts_files.py

latest/item-database.json: $(RESOURCES) ./extract_from_resources.py
	@echo "Extracting databases"
	./extract_from_resources.py

dirs:
	@rm -f latest
	@ln -sf ./$(VERSION) ./latest
	@mkdir -p $(VERSION)/blobs

clean:
	rm -f items.ts
	rm -Rf $(VERSION)
	rm -f latest

.PHONY: dirs
