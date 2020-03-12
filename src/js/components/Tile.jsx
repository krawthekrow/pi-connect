export function SetTileImageStyle(style, image, isOverlay = false) {
	const backgroundModifier = isOverlay ?
		'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), ' : '';
	style.backgroundImage = backgroundModifier + 'url(' + image + ')';
	style.backgroundRepeat = 'no-repeat';
	style.backgroundPosition = 'center';
	style.backgroundSize = 'contain';
}
