import * as React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import * as Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

import { Grid } from '../Grid';
import CONFIG from '../../config';
import { IGridLocation } from '../Grid/Grid.interface';

const { useState } = React;

export const Map: React.FC = (): JSX.Element => {
	const [location, setLocation] = useState<IGridLocation>(CONFIG.LAT_LON);
	const [zoom, setZoom] = useState<number>(0);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (Platform.OS === 'android' && !Constants.default.isDevice)
			setErrorMessage('Try it on your device');
		else
			getLocation();
	}, []);

	const getLocation = async () => {
		const { status } = await Permissions.askAsync(Permissions.LOCATION);
		const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
		setLocation(location.coords);
	};

	const pressZoomPlus = () => {
		const curZoom = zoom < 18 ? zoom + 1 : 18;
		setZoom(curZoom);
	};

	const pressZoomMinus = () => {
		const curZoom = zoom > 2 ? zoom - 1 : 2;
		setZoom(curZoom);
	};

	let goToLocation = (location: IGridLocation) => { };

	const locationCallback = (callback: () => {}) => {
		goToLocation = callback;
	};

	const pressGoToLocation = async () => {
		await getLocation();
		goToLocation(location);
	};

	const getMapView = (): JSX.Element => (
		<View style={styles.map}>
			<Grid
				location={location}
				zoom={zoom}
				locationCallback={locationCallback}
			/>
		</View>
	)

	const getMessageView = (): JSX.Element => (
		<View style={styles.msg}>
			<Text style={styles.paragraph}>
				{errorMessage ? errorMessage : 'Waiting...'}
			</Text>
		</View>
	)

	return (
		<View style={styles.mapWrapper}>
			<View style={styles.mapContent}>
				{location ? getMapView() : getMessageView()}
			</View>

			<View style={styles.toolContent}>
				<TouchableOpacity style={styles.zoomButton} onPress={pressZoomPlus}>
					<Text style={styles.zoomButtonText}>+</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.zoomButton} onPress={pressZoomMinus}>
					<Text style={styles.zoomButtonText}>-</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.locationButton} onPress={pressGoToLocation}>
					<View style={styles.locationButtonCore} />
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	mapWrapper: {
		flex: 1,
		flexDirection: 'column',
	},
	mapContent: {
		flex: 1,
		backgroundColor: 'white',
		flexBasis: '90%',
	},
	toolContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'grey',
		flexBasis: 50,
	},
	map: {
		flex: 1,
	},
	msg: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	paragraph: {
		padding: 10,
		backgroundColor: 'white',
		borderRadius: 5,
	},
	zoomButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#ffffff',
		marginLeft: 10,
		marginRight: 10,
	},
	zoomButtonText: {
		fontSize: 36,
		lineHeight: 42,
	},
	locationButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'blue',
		marginLeft: 10,
		marginRight: 10,
		opacity: 0.5,
	},
	locationButtonCore: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: 'red',
	},
});
