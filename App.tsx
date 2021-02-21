import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Constants from 'expo-constants';
import { Map } from './source/components/Map';

export default function App() {
	return (
		<View style={styles.appWrapper}>
			<StatusBar style='auto' />
			<Map />
		</View>
	);
}

const styles = StyleSheet.create({
	appWrapper: {
		flex: 1,
		paddingTop: Constants.default.statusBarHeight,
	},
});
