import * as React from 'react';
import { Text, PanResponder, Animated, View, LayoutChangeEvent } from 'react-native';
import * as CONFIG from '../../config';

import { Tiles } from '../Tiles/Tiles';

import { gridHelper } from '../../util/grid';
import { osmHelper } from '../../util/osmHelper';

import { styles } from './Grid.styles';
import {
	IGridData,
	IGridProps,
	IGridCenter, 
	IGridLocation,
	IGridCoordinates,  
	IGridStateSize 
} from './Grid.interface';

const createArrayDeepClone = (data: IGridCoordinates[][]) => {
	return data.map(subarr => {
		return subarr.slice();
	}).slice();
}

const { useState } = React;

export const Grid: React.FC<IGridProps> = ({ zoom, location, locationCallback }): JSX.Element => {
	
	const [pan] = useState(new Animated.ValueXY());
	const [gridData, setGridData] = useState<IGridData | null>({ grid: [[]], size: { x: 0, y: 0 } });
	const [size, setSize] = useState<IGridStateSize>({ height: 0 , width: 0 });
	const [url, setUrl] = useState<string | null>(null);
	const [center, setCenter] = useState<IGridCenter | null>(null);
	const [displayInfo, setDisplayInfo] = useState(false);
	const [shiftPanX, setShiftPanX] = useState(false);
	const [shiftPanY, setShiftPanY] = useState(false);


	let gridCalculator = gridHelper(CONFIG.default.TILE_SIZE, size.width, size.height);

	React.useEffect(() => {
		locationCallback(prepareGrid);
		pan.addListener(handlePanChange);
	}, []);


	React.useEffect(() => {
		const { width, height } = size;
		gridCalculator = gridHelper(CONFIG.default.TILE_SIZE, width, height);
		prepareGrid(location);
	}, [size]);

	React.useEffect(() => {
		handleZoomChange(zoom);
	}, [zoom]);

	const handleZoomChange = (zoom: number) => {
		prepareGrid({
			latitude: (center as IGridCenter)?.latitude,
			longitude: (center as IGridCenter)?.longitude
		})
	}

	const handlePanChange = (value: IGridCoordinates) => {
		const { width, height } = size;
		
		setShiftPanX(value.x > 0);
		setShiftPanY(value.y > 0);

		const grid = gridData as IGridData;

		const outOfX = shiftPanX || grid.size!.x + value.x < width;
		const outOfY = shiftPanY || grid.size!.y + value.y < height;

		if (outOfX || outOfY) {
			const gridDeepCopy = createArrayDeepClone(grid.grid);
			const dataClone: IGridData = {
				grid: gridDeepCopy,
				size: { 
					...grid.size 
				}
			}

			const addData = gridCalculator.addNewTiles(dataClone, { ...value });
			setGridData({ ...addData.data });
			shiftPanWhileDragging(addData.offset);
		}
	}

	const shiftPanWhileDragging = (value: IGridCoordinates) => {
		if (shiftPanX || shiftPanY) {
			const xVal = value.x - (pan.x as unknown as number);
			const yVal = value.y - (pan.x as unknown as number);

			setShiftPanX(false);
			setShiftPanY(false);

			pan.setOffset({
				x: xVal,
				y: yVal
			})
		}
	}

	const prepareGrid = (location: IGridLocation) => {
		const locationXY = getLocationXY(location);
		createGrid({ ...locationXY, ...location });
	};

	const getLocationXY = (location: IGridLocation) => {
		const { latitude, longitude } = location;
		const { tileX, tileY } = osmHelper.latLonToXY(
			latitude,
			longitude,
			zoom
		);

		const locationPxOffset = osmHelper.getPixelOffset(
			latitude,
			longitude,
			zoom
		);

		return {
			x: tileX,
			y: tileY,
			...locationPxOffset
		};
	}

	const resetGrid = () => {
		const center = calculateCurrentCenter();
		createGrid(center);	
	}

	const calculateCurrentCenter = () => {
		const currentOffset = {
		    x: (pan.x as unknown as number),
		    y: (pan.y as unknown as number)
		};
    
		const locationXY = gridCalculator.calculateNewCenter((gridData as IGridData), currentOffset);
		const { lat, lon } = osmHelper.xyToLatLon (
		    locationXY.x + locationXY.frX,
		    locationXY.y + locationXY.frY,
		    zoom
		);
    
		return { 
			...locationXY, 
			latitude: lat, 
			longitude: lon 
		};
	};

	const createDraggableGridContent = (): JSX.Element => {
		const { grid } = gridData as IGridData;
		const contentStyle = {
			transform: [
				{ translateX: pan.x as unknown as number },
				{ translateY: pan.y as unknown as number }
			]
		};

		const height = grid.length * CONFIG.default.TILE_SIZE;
		const width = grid[0].length * CONFIG.default.TILE_SIZE;

		return (
			<Animated.View
				style={{
					width,
					height,
					...contentStyle
				}}
			>
				<Tiles gridData={(gridData as IGridData)} zoom={zoom} />
				{/* <Overlay
					gridData={gridData}
					location={location}
					zoom={zoom}
				/> */}
			</Animated.View>
		)
	}

	const createGrid = ({ x, y, pxX, pxY, latitude, longitude }
			: {
				x: number,
				y: number,
				pxX: number,
				pxY: number,
				latitude: number,
				longitude: number
			}) => {
		const initialData: IGridData = { grid: [[{ x, y }]], size: { x: 0, y: 0 } };
		const { data, offset } = gridCalculator.initialGrid(initialData, { pxX, pxY });
    
		setGridData({ ...data });
		setCenter({ x, y, pxX, pxY, latitude, longitude });
		pan.setOffset({ ...offset });
		pan.setValue({ x: 0, y: 0 });
		pan.flattenOffset();
	  }

	const panResponder = PanResponder.create({
		onMoveShouldSetPanResponderCapture: () => true,
		onPanResponderGrant: (e, gestureState) => {
			pan.setOffset({
				x: (pan.x as unknown as number),
				y: (pan.y as unknown as number)
			});

			pan.setValue({ x: 0, y: 0 });
		},
		onPanResponderMove: Animated.event([
			null,
			{
				dx: pan.x,
				dy: pan.y
			}
		]),
		onPanResponderRelease: e => {
			pan.flattenOffset();
			resetGrid();
		}
	});

	const onLayoutHandler = (e: LayoutChangeEvent) => {
		const { width, height } = e.nativeEvent.layout;
		setSize({
			width,
			height
		});
	}
 
	return(
		<View
			style={styles.gridWrapper}
			onLayout={onLayoutHandler}
			{...panResponder.panHandlers}
		>
			{gridData && createDraggableGridContent()}
			<View style={styles.centerVertical}>
				<View style={styles.centerHorizontal} />
			</View>
			{center &&
                    <Text style={styles.debug}>
                        {`lat: ${center.latitude}, lon: ${center.longitude}${'\n'}`}
                    </Text>
                }
		</View>
	);
}