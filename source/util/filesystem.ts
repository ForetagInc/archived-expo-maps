import * as FileSystem from 'expo-file-system';

export const createDirectory = async(dir: string) => {
	const metaInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + dir);
	const isDir = metaInfo.isDirectory;
	
	if (!isDir)
		try {
			await FileSystem.makeDirectoryAsync(
				FileSystem.documentDirectory + dir,
				{ intermediates: true }
			)
		} catch (e: unknown) {
			console.info('ERROR: ', e)
			return false;
		}

	return true;
}

export const downloadAndStore = async(source: string, file: string) => {
	let metaData = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file);
	const isFile = metaData.exists;

	if (!isFile)
		try {
			await FileSystem.downloadAsync(
				source,
				FileSystem.documentDirectory + file
			);
			metaData = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file);
		} catch (e: unknown) {
			console.info('ERROR: ', e);
			return false;
		}

	return metaData;
}

export const deleteAllData = async() => {
	let dirs: string[];

	try {
		dirs = await FileSystem.readDirectoryAsync((FileSystem.documentDirectory as string));
		
		dirs.forEach(dir => {
			FileSystem.deleteAsync(FileSystem.documentDirectory + dir);
		});
	} catch (e: unknown) {
		console.info('ERROR: ', e);
		return false;
	}

	return dirs;
}