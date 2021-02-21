export interface IGridProps {
	zoom: number
	location: IGridLocation
	locationCallback: (prepareGrid: (location: IGridLocation) => void) => void
}

export interface IGridOffset {
	pxX: number
	pxY: number
}

export interface IGridCoordinates {
	x: number
	y: number
}

export interface IGridLocation {
	latitude: number
	longitude: number
}

export interface IGridData {
	size: IGridCoordinates
	grid: IGridCoordinates[][]
}

export interface IGridCenter {
	x: number
	y: number
	pxX: number
	pxY: number
	latitude: number
	longitude: number
}

export interface IGridState {
	size: IGridStateSize
}

export interface IGridStateSize {
	height: number
	width: number
}