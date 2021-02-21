import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	gridWrapper: {
		flex: 1,
		width: '100%'
	},
	info: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		backgroundColor: 'white',
		padding: 5,
		opacity: 0.5,
		borderRadius: 5
	},
	centerVertical: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		height: 40,
		width: 0,
		marginTop: -20,
		marginLeft: -1,
		borderLeftColor: 'black',
		borderLeftWidth: 2,
		overflow: 'visible',
	},
	centerHorizontal: {
		height: 0,
		width: 40,
		marginTop: 19,
		marginLeft: -21,
		borderTopColor: 'black',
		borderTopWidth: 2,
	},
	debug: {
		position: 'absolute',
		backgroundColor: 'white',
		padding: 5,
		opacity: 0.8,
		left: 0,
		bottom: 0,
		width: '100%',
	}
})