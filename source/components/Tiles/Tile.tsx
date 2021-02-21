import * as React from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import { FileInfo } from 'expo-file-system';

import CONFIG from '../../config';
import { createDirectory, downloadAndStore } from '../../util/filesystem';

interface ITile {
	tileX: number
	tileY: number
	zoom: number
}

export const Tile: React.FC<ITile> = ({ tileX, tileY, zoom }) => {
	let runner: ReturnType<typeof setTimeout>;
	let counter = 0;

	const [tileSource, setTileSource] = React.useState({ uri: 'https://via.placeholder.com/256x256' });

	React.useEffect(() => {
		getTile();
	}, []);

	const repeatProcedure = () => {
		clearTimeout(runner);
		if (counter < 10) {
			counter += 1;
			runner = setTimeout(() => { getTile() }, 200);
		}
	}

	const getTile = async () => {
		const tile = tileY + '.png';
		const path = zoom + '/' + tileX + '/' + tile;
		const tileUrl = CONFIG.TILE_URL + path + (CONFIG.API_KEY ? '?apikey=' + CONFIG.API_KEY : '');

		const localPath = CONFIG.TILE_DIR + '/' + zoom + '/' + tileX;
		const localFile = localPath + '/' + tile;

		switch (Platform.OS) {
			case 'web':
				console.log('Web working');
				break;
		
			default:
				const isDir = await createDirectory(localPath);
				if (isDir) {
					const fileData = await downloadAndStore(tileUrl, localFile);
					if ((fileData as FileInfo).exists)
						setTileSource({ uri: (fileData as FileInfo).uri });
					else
						repeatProcedure();
				}
				else 
					repeatProcedure();
				break;
		}
	}

	return (
		<View style={styles.imgTileWrapper}>
			<Image style={styles.imgTile} source={tileSource} />
			<Text style={styles.info}>{`TILE: ${tileX}  ${tileY}`}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	imgTileWrapper: {
		width: 256,
		height: 256
	},
	imgTile: {
		width: 256,
		height: 256
	},
	info: {
		position: 'absolute',
		left: 0,
		top: 0,
		backgroundColor: 'white',
		padding: 5,
		opacity: 0.8,
	}
});