//'use strict';

const commandName = '_execute_browser_action';

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
  let commands = await browser.commands.getAll();
  for (let command of commands) {
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

// Buttons icons set file names
const iconset = {
    monotone: {
        info: "information-line.png",
        bookmark: "bookmark-line.png",
        pinned: "pushpin-2-line.png",
        unpinned: "pushpin-line.png",
        discard: "icons8-snowflake-16.png",
        reload: "refresh-line.png",
        close: "close-line.png"
    },
    color: {
        info: "s_info.png",
        bookmark: "b_bookmark.png",
        pinned: "favicon-16x16-pinned.png",
        unpinned: "favicon-16x16.png",
        discard: "icons8-snowflake-16(1).png",
        reload: "s_reload.png",
        close: "b_drop.png"
    }
}

async function setButtonOption() {
	let buttons = {		
		pin: document.querySelector('#pin').checked,
		bookmark: document.querySelector('#bookmark').checked,
		viewurl: document.querySelector('#viewurl').checked,
		discard: document.querySelector('#discard').checked,
		reload: document.querySelector('#reload').checked,
		remove: document.querySelector('#remove').checked,
        icontype: document.querySelector('[name="iconset"]:checked').value
	};
	await browser.storage.local.set({buttons});

    // Run set icons function
    setButtonIcons(buttons['icontype']);
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

// Custom function for displaing icon set
function setButtonIcons(type) {
    document.querySelector("#viewurl").nextElementSibling.src = `img/${iconset[type].info}`;
    document.querySelector("#bookmark").nextElementSibling.src = `img/${iconset[type].bookmark}`;
    document.querySelector("#pin").nextElementSibling.src = `img/${iconset[type].unpinned}`;
    document.querySelector("#discard").nextElementSibling.src = `img/${iconset[type].discard}`;
    document.querySelector("#reload").nextElementSibling.src = `img/${iconset[type].reload}`;
    document.querySelector("#remove").nextElementSibling.src = `img/${iconset[type].close}`;
}

async function populateDisplay() {
	let {display} = await browser.storage.local.get("display");

	if (typeof display === 'undefined')
		display = {};

	if (!('tabindex' in display))
		display.tabindex = false;

	if (!('double_line' in display))
		display.double_line = false;

	if (!('unloaded' in display))
		display.unloaded = true;

	if (!('bordercolor' in display))
		display.bordercolor = "#FF0000";

	if (!('containercolor' in display))
		display.containercolor = false;
	
	if (!('containercolorall' in display))
		display.containercolorall = false;

	if (!('onlypinned' in display))
		display.onlypinned = false;

	if (!('panelwidth' in display))
		display.panelwidth = 250;

	await browser.storage.local.set({display});

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

async function populateButtons() {
	let {buttons} = await browser.storage.local.get("buttons");
	
	if (typeof buttons === 'undefined')
		buttons = {};
	if (!('pin' in buttons))
		buttons.pin = false;
	if (!('bookmark' in buttons))
		buttons.bookmark = false;
	if (!('viewurl' in buttons)) 
		buttons.viewurl = true;
	if (!('discard' in buttons))
		buttons.discard = true;
	if (!('reload' in buttons))
		buttons.reload = true;
	if (!('remove' in buttons)) 
		buttons.remove = true;
    if (!('icontype' in buttons)) 
        buttons.icontype = "monotone";

	await browser.storage.local.set({buttons});

	document.querySelector('#bookmark').checked = buttons["bookmark"];
	document.querySelector('#viewurl').checked = buttons["viewurl"];
	document.querySelector('#pin').checked = buttons["pin"];
	document.querySelector('#discard').checked = buttons["discard"];
	document.querySelector('#reload').checked = buttons["reload"];
	document.querySelector('#remove').checked = buttons["remove"];		
    if (buttons["icontype"] == "monotone")
	    document.querySelector('#mono-icons').checked = true;		
    else if (buttons["icontype"] == "color")
	    document.querySelector('#color-icons').checked = true;		
    
    // Run set icons function
    setButtonIcons(buttons["icontype"]);
}

async function populateColors() {
	let {icon} = await browser.storage.local.get("icon");

	if (typeof icon === 'undefined')
		icon = {};
	if (!('orange' in icon))
		icon.orange = true;
	if (!('green' in icon))
		icon.green = false;
	if (!('purple' in icon))
		icon.purple = false;
	if (!('grey' in icon))
		icon.grey = false;
	if (!('orange_tabs' in icon))
		icon.orange_tabs = false;
	if (!('green_tabs' in icon))
		icon.green_tabs = false;
	if (!('purple_tabs' in icon))
		icon.purple_tabs = false;
	if (!('grey_tabs' in icon))
		icon.grey_tabs = false;

	await browser.storage.local.set({icon});

	document.querySelector('#orange').checked = icon["orange"];
	document.querySelector('#green').checked = icon["green"];		
	document.querySelector('#purple').checked = icon["purple"];
	document.querySelector('#grey').checked = icon["grey"];
	document.querySelector('#orange_tabs').checked = icon["orange_tabs"];
	document.querySelector('#green_tabs').checked = icon["green_tabs"];		
	document.querySelector('#purple_tabs').checked = icon["purple_tabs"];
	document.querySelector('#grey_tabs').checked = icon["grey_tabs"];

}

async function populateBadge() {
	let {badge} = await browser.storage.local.get("badge");

	if (typeof badge === 'undefined')
		badge = {};

	if (!('display' in badge))
		badge.display = true;

	if (!('textColor' in badge))
		badge.textColor = "#FFFFFF";

	if (!('backgroundColor' in badge))
		badge.backgroundColor = "#FF7F27";

	await browser.storage.local.set({badge});

	document.querySelector('#badge').checked = badge["display"];
	document.querySelector('#textcolor').value = badge["textColor"];		
	document.querySelector('#bgcolor').value = badge["backgroundColor"];		

}

async function populateScrollbar() {
	let {scrollbar} = await browser.storage.local.get("scrollbar");

	if (typeof scrollbar === 'undefined')
		scrollbar = {};

	if (!('mouse' in scrollbar))
		scrollbar.mouse = false;

	if (!('keyboard' in scrollbar))
		scrollbar.keyboard = true;

	if (!('activetab' in scrollbar))
		scrollbar.activetab = true;

	await browser.storage.local.set({scrollbar});

	document.querySelector('#mouse').checked = scrollbar["mouse"];
	document.querySelector('#keyboard').checked = scrollbar["keyboard"];		
	document.querySelector('#active').checked = scrollbar["activetab"];		
	document.querySelector('#top').checked = !scrollbar["activetab"];		

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
document.querySelector('#discard').addEventListener('change', setButtonOption)
document.querySelector('#reload').addEventListener('change', setButtonOption)
document.querySelector('#remove').addEventListener('change', setButtonOption)
document.querySelector('#mono-icons').addEventListener('change', setButtonOption)
document.querySelector('#color-icons').addEventListener('change', setButtonOption)

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
