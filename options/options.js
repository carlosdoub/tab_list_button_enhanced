const commandName = '_execute_browser_action';

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
  let commands = await browser.commands.getAll();
  for (command of commands) {
    if (command.name === commandName) {
      document.querySelector('#shortcut').value = command.shortcut;
    }
  }
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
  await browser.commands.update({
    name: commandName,
    shortcut: document.querySelector('#shortcut').value
  });
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
  await browser.commands.reset(commandName);
  updateUI();
}

/*
 * Toggle instructions
 * */
function toggleInstructions() {
	if (document.querySelector("#instructions").style.display == 'none') {
		document.querySelector("#instructions").style.display = "block";
		document.querySelector("#instructionsText").innerText = "Hide instructions";
	} else {
		document.querySelector("#instructions").style.display = "none";
		document.querySelector("#instructionsText").innerText = "Show instructions";
	}
}

function toggleActiveBorder() {
	if (document.querySelector("#active-border").checked) 
		document.querySelector("#active-border-options").style.display = "block";
	else
		document.querySelector("#active-border-options").style.display = "none";
}

async function setDisplayOption() {
	let panel;
	if (document.querySelector('#panel-width').value > 600)
		panel = 600;
	else if (document.querySelector('#panel-width').value < 200)
		panel = 200;
	else
		panel = document.querySelector('#panel-width').value;

	let display = {
		tabindex: document.querySelector('#tabindex').checked,
		double_line: document.querySelector('#double-line').checked,
		unloaded: document.querySelector('#unloaded').checked,
		bordercolor: document.querySelector('#bordercolor').value,
		containercolor: document.querySelector('#containercolor').checked,
		containercolorall: document.querySelector('#containercolorall').checked,
		onlypinned: document.querySelector('#onlypinned').checked,
		panelwidth: panel 
	};
	await browser.storage.local.set({display});
}

async function setButtonOption() {
	let buttons = {		
		pin: document.querySelector('#pin').checked,
		bookmark: document.querySelector('#bookmark').checked,
		viewurl: document.querySelector('#viewurl').checked,
		reload: document.querySelector('#reload').checked,
		remove: document.querySelector('#remove').checked
	};
	await browser.storage.local.set({buttons});
}

async function setColorOption() {
	let icon = {
		orange: document.querySelector('#orange').checked,
		green: document.querySelector('#green').checked,
		purple: document.querySelector('#purple').checked,
		grey: document.querySelector('#grey').checked,
		orange_tabs: document.querySelector('#orange_tabs').checked,
		green_tabs: document.querySelector('#green_tabs').checked,
		purple_tabs: document.querySelector('#purple_tabs').checked,
		grey_tabs: document.querySelector('#grey_tabs').checked		
	};
	await browser.storage.local.set({icon});

	if (icon["orange"])
		browser.browserAction.setIcon({path: "../icons/16-tabs.png"});
	if (icon["green"])
		browser.browserAction.setIcon({path: "../icons/16-tabs-g.png"});
	if (icon["purple"])
		browser.browserAction.setIcon({path: "../icons/16-tabs-p.png"});		
	if (icon["grey"])
		browser.browserAction.setIcon({path: "../icons/16-tabs-grey.png"});		
	if (icon["orange_tabs"])
		browser.browserAction.setIcon({path: "../icons/16-tabs(2).png"});
	if (icon["green_tabs"])
		browser.browserAction.setIcon({path: "../icons/16-tabs-g(2).png"});
	if (icon["purple_tabs"])
		browser.browserAction.setIcon({path: "../icons/16-tabs-p(2).png"});
	if (icon["grey_tabs"])
		browser.browserAction.setIcon({path: "../icons/16-tabs-grey(2).png"});
}

async function setBadgeOption() {
	let badge = {
		display: document.querySelector("#badge").checked,
		textColor: document.querySelector("#textcolor").value,
		backgroundColor: document.querySelector("#bgcolor").value
	}
	await browser.storage.local.set({badge});

	let background = await browser.runtime.getBackgroundPage();
	background.loadBadge();
}

async function setScrollbarOption() {
	let scrollbar = {
		mouse: document.querySelector('#mouse').checked,
		keyboard: document.querySelector('#keyboard').checked,
		activetab: document.querySelector('#active').checked
	};
	await browser.storage.local.set({scrollbar});
}

async function populateDisplay() {
	let {display} = await browser.storage.local.get("display");

	if (typeof display === 'undefined') {
		let display = {
			tabindex: false,
			double_line: false,
			unloaded: true,
			bordercolor: "#FF0000",
			containercolor: false,
			containercolorall: false,
			onlypinned: false,
			panelwidth: 250
		}
		await browser.storage.local.set({display});
		populateDisplay();
	} else {		
		document.querySelector('#tabindex').checked = display["tabindex"];
		document.querySelector('#double-line').checked = display["double_line"];		
		document.querySelector('#unloaded').checked = display["unloaded"];		
		document.querySelector('#bordercolor').value = display["bordercolor"];	
		document.querySelector('#containercolor').checked = display["containercolor"];			
		document.querySelector('#panel-width').value = display["panelwidth"];	

		if (display["containercolorall"]) {
			document.querySelector('#containercolorall').checked = true;
			document.querySelector("#active-border-options").style.display = "none";
		} else {
			document.querySelector("#active-border").checked = true;
			document.querySelector("#active-border-options").style.display = "block";
		}
	}
}

async function populateButtons() {
	let {buttons} = await browser.storage.local.get("buttons");
	if (typeof buttons === 'undefined') {
		let buttons = {			
			pin: false,
			bookmark: false,
			viewurl: true,
			reload: true,
			remove: true
		}
		await browser.storage.local.set({buttons});
		populateButtons();
	} else {
		document.querySelector('#bookmark').checked = buttons["bookmark"];
		document.querySelector('#viewurl').checked = buttons["viewurl"];
		document.querySelector('#pin').checked = buttons["pin"];
		document.querySelector('#reload').checked = buttons["reload"];
		document.querySelector('#remove').checked = buttons["remove"];		
	}
}

async function populateColors() {
	let {icon} = await browser.storage.local.get("icon");
	if (typeof icon === 'undefined') {
		let icon = {
			orange: true,
			green: false,
			purple: false,
			grey: false,
			orange_tabs: false,
			green_tabs: false,
			purple_tabs: false,
			grey_tabs: false
		};
		await browser.storage.local.set({icon});
		populateColors();
	} else {
		document.querySelector('#orange').checked = icon["orange"];
		document.querySelector('#green').checked = icon["green"];		
		document.querySelector('#purple').checked = icon["purple"];
		document.querySelector('#grey').checked = icon["grey"];
		document.querySelector('#orange_tabs').checked = icon["orange_tabs"];
		document.querySelector('#green_tabs').checked = icon["green_tabs"];		
		document.querySelector('#purple_tabs').checked = icon["purple_tabs"];
		document.querySelector('#grey_tabs').checked = icon["grey_tabs"];
	}
}

async function populateBadge() {
	let {badge} = await browser.storage.local.get("badge");
	if (typeof badge === 'undefined') {
		let badge = {
			display: true,
			textColor: "#FFFFFF",
			backgroundColor: "#FF7F27"
		};
		await browser.storage.local.set({badge});
		populateBadge();
	} else {
		document.querySelector('#badge').checked = badge["display"];
		document.querySelector('#textcolor').value = badge["textColor"];		
		document.querySelector('#bgcolor').value = badge["backgroundColor"];		
	}
}

async function populateScrollbar() {
	let {scrollbar} = await browser.storage.local.get("scrollbar");
	if (typeof scrollbar === 'undefined') {
		let scrollbar = {
			mouse: false,
			keyboard: true,
			activetab: true
		};
		await browser.storage.local.set({scrollbar});
		populateScrollbar();
	} else {
		if (typeof scrollbar["activetab"] === 'undefined') {
			scrollbar["activetab"] = true;
			await browser.storage.local.set({scrollbar});
			populateScrollbar();
		} else {
			document.querySelector('#mouse').checked = scrollbar["mouse"];
			document.querySelector('#keyboard').checked = scrollbar["keyboard"];		
			document.querySelector('#active').checked = scrollbar["activetab"];		
			document.querySelector('#top').checked = !scrollbar["activetab"];		
		}
	}
}


/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUI);

/**
 * Handle update and reset button clicks
 */
document.querySelector('#update').addEventListener('click', updateShortcut)
document.querySelector('#reset').addEventListener('click', resetShortcut)

document.querySelector('#instructionsText').addEventListener('click', toggleInstructions)

/**
 * Display options
 * */
document.querySelector('#tabindex').addEventListener('change', setDisplayOption)
document.querySelector('#double-line').addEventListener('change', setDisplayOption)
document.querySelector('#bordercolor').addEventListener('change', setDisplayOption)
document.querySelector('#unloaded').addEventListener('change', setDisplayOption)
document.querySelector('#containercolor').addEventListener('change', setDisplayOption)
document.querySelector('#containercolorall').addEventListener('change', function(){
	setDisplayOption();
	toggleActiveBorder();
})
document.querySelector('#active-border').addEventListener('change', function(){
	setDisplayOption();
	toggleActiveBorder();
})
document.querySelector('#onlypinned').addEventListener('change', setDisplayOption)
document.querySelector('#panel-width').addEventListener('change', setDisplayOption)

/**
 * Buttons options
 * */
document.querySelector('#bookmark').addEventListener('change', setButtonOption)
document.querySelector('#pin').addEventListener('change', setButtonOption)
document.querySelector('#viewurl').addEventListener('change', setButtonOption)
document.querySelector('#reload').addEventListener('change', setButtonOption)
document.querySelector('#remove').addEventListener('change', setButtonOption)

/**
 * Colors options
 * */
document.querySelector('#orange').addEventListener('change', setColorOption)
document.querySelector('#green').addEventListener('change', setColorOption)
document.querySelector('#purple').addEventListener('change', setColorOption)
document.querySelector('#grey').addEventListener('change', setColorOption)
document.querySelector('#orange_tabs').addEventListener('change', setColorOption)
document.querySelector('#green_tabs').addEventListener('change', setColorOption)
document.querySelector('#purple_tabs').addEventListener('change', setColorOption)
document.querySelector('#grey_tabs').addEventListener('change', setColorOption)

/**
 * Badge options
 * */
document.querySelector('#badge').addEventListener('change', setBadgeOption)
document.querySelector('#textcolor').addEventListener('change', setBadgeOption)
document.querySelector('#bgcolor').addEventListener('change', setBadgeOption)

/**
 * Scrollbar options
 * */
document.querySelector('#mouse').addEventListener('change', setScrollbarOption)
document.querySelector('#keyboard').addEventListener('change', setScrollbarOption)
document.querySelector('#active').addEventListener('change', setScrollbarOption)
document.querySelector('#top').addEventListener('change', setScrollbarOption)


populateDisplay();
populateButtons();
populateColors();
populateBadge();
populateScrollbar();
