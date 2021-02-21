import { Direction, Location } from './types';

export const osmHelper = {
	fract (num: number) {
		return num % 1;
	},

	getXFromLon (lon: number, zoom: number) {
		return (
			(lon + 180) / 360 * Math.pow(2, zoom)
		);
	},

	getYFromLat (lat: number, zoom: number) {
		return (
			(1 - Math.log(
				Math.tan(lat * Math.PI / 180) +
				1 / Math.cos(lat * Math.PI / 180)
			) / Math.PI) / 2 * Math.pow(2, zoom)
		);
	},

	getLonFromTileX(x: number, zoom: number) {
		return (x / Math.pow(2, zoom) * 360 - 180);
	},

	getLatFromTileY(y: number, zoom: number) {
		const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
		return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
	},

	xyToLatLon(x: number, y: number, zoom: number) {
		const latNW = this.getLatFromTileY(y, zoom);
		const lonNW = this.getLonFromTileX(x, zoom);
		const latSE = this.getLatFromTileY(y + 1, zoom);
		const lonSE = this.getLonFromTileX(x + 1, zoom);

		return {
			lat: (latNW + latSE) / 2,
			lon: (lonNW + lonSE) / 2
		};
	},

	getPixelOffset(lat: number, lon: number, zoom: number) {
		const xPos = this.getXFromLon(lon, zoom);
		const yPos = this.getYFromLat(lat, zoom);
		
		const pxX = this.fract(xPos) * 256;
		const pxY = this.fract(yPos) * 256;
		
		return {
			pxX,
			pxY
		};
	},

	latLonToXY(lat: number, lon: number, zoom: number) {
		const tileX = Math.floor(this.getXFromLon(lon, zoom));
		const tileY = Math.floor(this.getYFromLat(lat, zoom));
		
		return {
			tileX,
			tileY,
			zoom
		};
	},

	getBoundingBox(locations: Location[]): Direction | null {
		const max = locations.length - 1;
		
		if (max < 1)
			return null;

		const allLat: number[] = [];
		const allLon: number[] = [];
		
		locations.forEach(({ lat, lon })=> {
			allLat.push(lat);
			allLon.push(lon);
		});

		allLat.sort();
		allLon.sort();

		return {
			north: allLat[max],
			west: allLon[0],
			south: allLat[0],
			east: allLon[max]
		};
	},

	getCenterAndZoomForLocations(locations: Location[], wd: number, ht: number) {
		const bb = this.getBoundingBox(locations);

		const getWidthAndHeight = (bb: Direction, zoom: number) => {
			const northWest = this.latLonToXY(bb.north, bb.west, zoom);
			const southEast = this.latLonToXY(bb.south, bb.east, zoom);
			const width = Math.abs(northWest.tileX - southEast.tileX);
			const height = Math.abs(northWest.tileY - southEast.tileY);

			return {
				width,
				height
			};
		}

		let zoom = 18;
		let dimensions = getWidthAndHeight((bb as Direction), zoom);
		do {
			zoom -= 1;
			dimensions = getWidthAndHeight((bb as Direction), zoom);
		}

		while ((dimensions.width > wd || dimensions.height > ht) && zoom > 1);

		const lat = ((bb as Direction).north + (bb as Direction).south) / 2;
		const lon = ((bb as Direction).west + (bb as Direction).east) / 2;
		
		return {
			lat,
			lon,
			zoom
		};
	}
}