// console.log("script.js loaded.")

/* variables and helpers */ 

const footerDiv = document.getElementById('footer')
let scrollFactor = /* placeholder */ 1
// console.log(`scrollFactor (at start): ${scrollFactor}`)

const windowHeight = window.innerHeight

function documentHeight() { 
	return parseInt(document.documentElement.scrollHeight) 
}

function scrollableHeight() { 
	return parseInt(documentHeight() - windowHeight) 
}

console.log(`documentHeight: \t\t${documentHeight()}\nwindowHeight: \t\t\t ${windowHeight}\n∴ scrollableHeight: \t${scrollableHeight()}`)


// during a touchmove event, these record the y position of a touch 
let oldy = 0
let oldtime = 0
let newy = 0
let newtime = 0
let delta = newy - oldy

/* function to define custom scroll-behaviour on mouse/tap events */
function preventDefault(e) {

	// calculate where the person is currentlyAt
	let currentlyAt = document.documentElement.scrollTop

	// variables for calculating scroll factor
	const scrollFactorAtTop = 1
	const scrollFactorAtBottom = 0.1
	const rateOfScrollFactorChange = 2
	const showAboutProjectAt = .25
	const scrollFactorThatIsNoticeablyLow = .195

	// calculate scrollFactor
	scrollFactor =
		scrollFactorAtBottom
		+
		(
			(scrollFactorAtTop - scrollFactorAtBottom)
			*
			/* this is the basic calculation for scrollFactor */
			Math.pow(
				(scrollableHeight() - currentlyAt) / scrollableHeight(), rateOfScrollFactorChange
			)
		)

	// show #aboutProject
	const aboutdiv = document.getElementById('aboutProject')
	if (
		scrollFactor < showAboutProjectAt
		&&
		// we've reached the #footer
		scrollableHeight() - document.documentElement.scrollTop - Number((getComputedStyle(footerDiv).height).slice(0,-2)) > 0
	) {
		aboutdiv.style.bottom = `0rem`;
	} else {
		aboutdiv.style.bottom = `-100vh`;
	}
	if (scrollFactor < scrollFactorThatIsNoticeablyLow) {
		scrollFactor = scrollFactorThatIsNoticeablyLow * .95
	}

	// and: scroll slowly (reduced by the scrollFactor variable)
	console.log(`\n`)
	switch (e.type) {
		case ('keydown'):
			e.preventDefault(); // prevent default scroll/touchmove behaviour
			const keyPressed = e.keyCode
			switch (keyPressed) {
				case 32: // spacebar to move down
					scrollFactor *= 20
					break
				case 38:
					scrollFactor *= -2
					break
				case 40:
					scrollFactor *= 2
					break
			}
			window.scrollBy({ top: 10 * scrollFactor, behavior: 'smooth' })
			console.log(`${keyPressed} was pressed.`)
			break;
		case ('wheel'):
			e.preventDefault(); // prevent default scroll/touchmove behaviour
			window.scrollBy({ top: .25 * e.deltaY * scrollFactor/*, behavior: 'smooth'*/ });
			break;
		case ('touchmove'):
			newy = e.touches[0].clientY
			newtime = e.timeStamp
			delta = newy - oldy
			const deltalimit = 120
			if (Math.abs(delta) >= deltalimit) {
				delta = deltalimit * delta / Math.abs(delta)
			}
			e.preventDefault()
			if(newtime - oldtime > 100) {
				// then this is likely to be the moment the person just began scrolling,
				// and we're likely to see a jumpy behaviour due to an abnormal 'delta' value,
				// so , we ignore this delta value, and do nothing.
				console.log(`\n\n\n\nwon't execute scrollBy for this next value of delta\n(because it is likely to cause jumpy behaviour)`)
			} else {
				if(delta > 0 /* person is trying to scroll up */) scrollFactor = scrollFactorAtTop
				window.scrollTo({
					/* info: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo */
					top: currentlyAt + (-delta * scrollFactor),
					behavior: "instant",
				})
			}
			const d = new Date()
			console.log(`time ${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()} | delta = ${delta}`)
			oldy = newy
			oldtime = newtime
			break;
	}
	
	// round the value to make it readable in the console
	const decimalPlaces = 4
	scrollFactor = Math.round(Math.pow(10, decimalPlaces) * (scrollFactor)) / Math.pow(10, decimalPlaces)

	console.log(`${e.type} | at ${Math.round(currentlyAt)} of ${scrollableHeight()} px| scrollFactor: ${scrollFactor}`)

}


// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
// shift: 16
var keys = { 32: 1, 38: 1, 40: 1 };

// define custom scroll-behaviour (when keyboard keys are pressed)
function preventDefaultForScrollKeys(e) {
	if (keys[e.keyCode]) {
		preventDefault(e);
		return false;
	}
}

// (not sure, but we think this) checks if the current browser is a Chrome browser.
// ∵ modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
	window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
		get: function () { supportsPassive = true; }
	}));
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to undo disableScroll()'s handiwork
function enableScroll() {
	window.removeEventListener('DOMMouseScroll', preventDefault, false);
	window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
	window.removeEventListener('touchmove', preventDefault, wheelOpt);
	window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

// this function attached eventListeners to the window. whenever a scroll (or similar) event is detected, these eventListeners call the preventDefault() funtion.
function disableScroll() {
	console.log(`disableScroll() has worked its magic.`)
	window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
	window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
	window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
	window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// when the script loads, call the disableScroll() function
disableScroll();