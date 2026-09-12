const PLUGIN_ID = "acode.icon.plugin.example";

const fs = acode.require("fs");
const Url = acode.require("Url");
const fileIcons = acode.require("fileIcons");
let registration;

function mapsFromPack(files, folders) {
	const fileNames = {};
	const fileExtensions = {};
	const folderNames = {};
	const folderNamesExpanded = {};

	for (const entry of files) {
		for (const name of entry.file_name || []) {
			fileNames[name] = entry.name;
		}
		for (const ext of entry.file_extensions || []) {
			if (ext.startsWith(".")) fileNames[ext] = entry.name;
			else fileExtensions[ext.toLowerCase()] = entry.name;
		}
	}

	for (const entry of folders) {
		for (const name of entry.folder_name || []) {
			folderNames[name] = entry.name;
			folderNamesExpanded[name] = `${entry.name}-open`;
		}
	}

	return { fileNames, fileExtensions, folderNames, folderNamesExpanded };
}

acode.setPluginInit(PLUGIN_ID, async (baseUrl) => {
	const root = Url.join(PLUGIN_DIR, PLUGIN_ID);
	const files = await fs(Url.join(root, "file_icons.json")).readFile("json");
	const folders = await fs(Url.join(root, "folder_icons.json")).readFile(
		"json",
	);

	registration = fileIcons.register({
		id: PLUGIN_ID,
		name: "Icon Pack Example",
		pluginId: PLUGIN_ID,
		icons: `${Url.join(baseUrl, "icons")}/`,
		...mapsFromPack(files, folders),
		folder: "folder",
		folderExpanded: "folder-open",
		rootFolder: "folder-root",
		rootFolderExpanded: "folder-root-open",
	});
});

acode.setPluginUnmount(PLUGIN_ID, () => {
	registration?.dispose();
});
