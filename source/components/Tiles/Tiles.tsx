import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { IGridCoordinates, IGridData } from '../Grid/Grid.interface';
import { Tile } from './Tile';

interface ITilesProp {
	gridData: IGridData
	zoom: number
}

export const Tiles: React.FC<ITilesProp> = ({ gridData, zoom }) => {

	const createGridRow = (row: IGridCoordinates[]) => {
		return row.map((tile, index) => {
			return (
				<View key={`${tile.x}-${tile.y}`} style={styles.tileWrapper}>
					<Tile 
						tileX={tile.x}
						tileY={tile.y}
						zoom={zoom}
					/>
				</View>
			)
		});
	}

	const createGrid = () => {
		const { grid } = gridData;
		return grid.map(row => {
			const width = row.length * 256;
			const rowY = row[0]?.y;

			return(
				<View key={`row-${rowY}`} style={{ ...styles.tilesRow, width }}>
					{createGridRow(row)}
				</View>
			)
		})
	}

	return(
		<View style={styles.tileWrapper}>
			{gridData && createGrid()}
		</View>
	);
}

const styles = StyleSheet.create({
	tilesWrapper: {
  
	},
	tilesRow: {
	    height: 256,
	    flexDirection: 'row'
	},
	tileWrapper: {
	    flex: 1,
	    width: 256,
	    height: 256,
	}
  });