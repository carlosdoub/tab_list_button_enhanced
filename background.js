
async function loadIcon() {
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
		loadIcon();
	} else {
		if (icon["orange"])
			browser.browserAction.setIcon({path: "icons/16-tabs.png"});
		if (icon["green"])
			browser.browserAction.setIcon({path: "icons/16-tabs-g.png"});
		if (icon["purple"])
			browser.browserAction.setIcon({path: "icons/16-tabs-p.png"});
		if (icon["grey"])
			browser.browserAction.setIcon({path: "../icons/16-tabs-grey.png"});
		if (icon["orange_tabs"])
			browser.browserAction.setIcon({path: "icons/16-tabs(2).png"});
		if (icon["green_tabs"])
			browser.browserAction.setIcon({path: "icons/16-tabs-g(2).png"});
		if (icon["purple_tabs"])
			browser.browserAction.setIcon({path: "icons/16-tabs-p(2).png"});
		if (icon["grey_tabs"])
			browser.browserAction.setIcon({path: "../icons/16-tabs-grey(2).png"});
	}
}

async function showBadge() {
	let {badge} = await browser.storage.local.get("badge");
	setTimeout(async () => {
		let query = {
			currentWindow: true
		};
		let tabs = await browser.tabs.query(query);				
		browser.browserAction.setBadgeText({text: tabs.length.toString(), windowId: tabs[0].windowId});		
		browser.browserAction.setBadgeTextColor({color: badge["textColor"]});
		browser.browserAction.setBadgeBackgroundColor({color: badge["backgroundColor"]});		
	}, 500);
}

async function showBadge2() {
	let {badge} = await browser.storage.local.get("badge");
	
	setTimeout(async () => {
		let windows = await browser.windows.getAll();
		for (let window of windows) {		
			let query = {
				windowId: window.id
			};
			let tabs = await browser.tabs.query(query);				
			browser.browserAction.setBadgeText({text: tabs.length.toString(), windowId: window.id});		
			browser.browserAction.setBadgeTextColor({color: badge["textColor"]});
			browser.browserAction.setBadgeBackgroundColor({color: badge["backgroundColor"]});		
		}		
	}, 500);
}

async function initBadge() {
	let {badge} = await browser.storage.local.get("badge");
	
	let windows = await browser.windows.getAll();
	for (let window of windows) {		
		let query = {
			windowId: window.id
		};
		let tabs = await browser.tabs.query(query);				
		browser.browserAction.setBadgeText({text: tabs.length.toString(), windowId: window.id});		
		browser.browserAction.setBadgeTextColor({color: badge["textColor"]});
		browser.browserAction.setBadgeBackgroundColor({color: badge["backgroundColor"]});		
	}		
}

async function removeBadge() {
	let windows = await browser.windows.getAll();
	for (let window of windows) {		
		let query = {
			windowId: window.id
		};
		let tabs = await browser.tabs.query(query);				
		browser.browserAction.setBadgeText({text: "", windowId: window.id});				
	}		
}

async function loadBadge() {
	let {badge} = await browser.storage.local.get("badge");
	if (typeof badge === 'undefined') {
		let badge = {
			display: true,
			textColor: "#FFFFFF",
			backgroundColor: "#808080"
		};
		await browser.storage.local.set({badge});
		loadBadge();
	} else {
		if (badge["display"] === true) {			
			browser.tabs.onCreated.addListener(showBadge);
			browser.tabs.onRemoved.addListener(showBadge);
			browser.tabs.onAttached.addListener(showBadge2)
			//browser.tabs.onDetached.addListener(showBadge)
			initBadge();
		} else {
			browser.tabs.onCreated.removeListener(showBadge);
			browser.tabs.onRemoved.removeListener(showBadge);
			browser.tabs.onAttached.removeListener(showBadge2)
			//browser.tabs.onDetached.removeListener(showBadge)
			removeBadge();
		}
	}
}

loadIcon();
loadBadge();
