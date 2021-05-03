
var new_node, old_node;
var indexes = {};
var ids = {};
var active = {};
var infoUrl = {};
var pinned = {};
var tempId = null;
var heightLines = 12;
var scrollBy = 3;

// From https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
/**
* Variables.
*/
var contextMenuClassName = "context-menu";
var contextMenuItemClassName = "context-menu__item";
var contextMenuLinkClassName = "context-menu__link";
var contextMenuActive = "context-menu--active";

var taskItemClassName = "task";
var taskItemInContext;

var clickCoords;
var clickCoordsX;
var clickCoordsY;

var menu = document.querySelector("#context-menu");
var menuItems = menu.querySelectorAll(".context-menu__item");
var menuState = 0;
var menuWidth;
var menuHeight;
var menuPosition;
var menuPositionX;
var menuPositionY;

var windowWidth;
var windowHeight;


async function loadDisplayOptions() {
	let {display} = await browser.storage.local.get("display");

	if (typeof display === 'undefined') {
		let display = {
			tabindex: false,
			double_line: false,
			unloaded: true,
			bordercolor: "#FF0000",
			containercolor: false,
			containercolorall: false,
		}
		await browser.storage.local.set({display});
		loadDisplayOptions();
	} else {					
		if (typeof display["containercolorall"] === 'undefined') {
			display["containercolorall"] = false;
			await browser.storage.local.set({display});
			loadDisplayOptions();
		} else {
		}
	}
}

async function loadButtonsOptions() {
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
		loadButtonsOptions();
	} else {					
	}
}

async function loadScrollbarOptions() {
	let {scrollbar} = await browser.storage.local.get("scrollbar");
	if (typeof scrollbar === 'undefined') {
		let scrollbar = {
			mouse: false,
			keyboard: true,
			activetab: true
		};
		await browser.storage.local.set({scrollbar});
		loadScrollbarOptions();
	} else {		
		if (typeof scrollbar["activetab"] === 'undefined') {
			scrollbar["activetab"] = true;
			await browser.storage.local.set({scrollbar});
			loadScrollbarOptions();
		} else {
		}
	}
}


var misc = {
	updateIndexes: async function() {
		indexes = {};
		ids = {};
		active = {};
		pinned = {};

		let query = {
			currentWindow: true
		};
		let tabs = await browser.tabs.query(query);

		for (let tab of tabs) {
			indexes[tab.id] = tab.index;
			ids[tab.index] = tab.id;
			active[tab.id] = tab.active;
			pinned[tab.id] = tab.pinned;
		}
	},

	checkLoadingTab: function(id) {
		var p = new Promise(function (resolve, reject) {
			var v = window.setInterval(async function() {
				let query = {
					currentWindow: true
				};
				let tabs = await browser.tabs.query(query);

				for (let tab of tabs) {
					if(tab.id == id && tab.status == "complete") {
						window.clearInterval(v);
						resolve(tab);
					}
				}
			}, 500);
		})

		return p;
	},

	getTabInfo: function(id) {
		var p = new Promise(async function (resolve, reject) {
			let query = {
				currentWindow: true
			};
			let tabs = await browser.tabs.query(query);

			for (let tab of tabs) {
				if(tab.id == id) {
					resolve(tab);
				}
			}
		})

		return p;
	},

	nodeToggle: function() {
		old_node.classList.remove("hover");
		new_node.classList.add("hover");
		old_node = new_node;
	},

	setItemInfo: function(id, info) {
		var icon = document.getElementById("icon_"+id);
		var span = document.getElementById("span_"+id);

		icon.title = info;
		span.innerText = info;
		span.title = info;
	},

	setInfoToUrl: function(id) {
		infoUrl[id] = true;
	},

	setInfoToTitle: function(id) {
		infoUrl[id] = false;
	},

	isSupportedProtocol: function (urlString) {
		var supportedProtocols = ["https:", "http:", "ftp:"];
		var url = document.createElement('a');
		url.href = urlString;
		return supportedProtocols.indexOf(url.protocol) != -1;
	},

	setBookmark: async function(tab) {

		if(misc.isSupportedProtocol(tab.url)) {
			browser.bookmarks.search({url: tab.url})
			.then(async (bookmarks) => {

				if (bookmarks.length >= 1) {
					bookmark = bookmarks[bookmarks.length-1];
					await browser.bookmarks.remove(bookmark.id);
				} else {
					await browser.bookmarks.create({
					  title: tab.title,
					  url: tab.url
					});
				}

			});
		} else {
			browser.bookmarks.search({title: tab.title})
			.then(async (bookmarks) => {

				if (bookmarks.length >= 1) {
					bookmark = bookmarks[bookmarks.length-1];
					await browser.bookmarks.remove(bookmark.id);
				} else {
					await browser.bookmarks.create({
					  title: tab.title,
					  url: tab.url
					});
				}
			});
		}
	}
	
}

var context_menu = {

	setBookmarkClick: async function(id) {
		let tabInfo = await misc.getTabInfo(id);
		
		misc.setBookmark(tabInfo);
	},

	getId: function(id) {
		let num = id.split("_")[1];
		let item = id.split("_")[0];
		if (item == "icon" || item == "span" || item == "url")
			return num;
		else
			return false;
	},

	clickEvent: function(e) {
		let elem = this.clickInsideElement(e, contextMenuLinkClassName);

		if (elem) {
			let action = elem.getAttribute("data-action");
			switch (action) {
				case "viewurl":	
					mouse.setInfoClick(tempId);
					break;
				case "bookmark":	
					context_menu.setBookmarkClick(tempId);
					break;
				case "pin":	
					mouse.pinTabClick(parseInt(tempId));
					break;
				case "reload":	
					mouse.setReloadClick(parseInt(tempId));
					break;
				case "remove":	
					mouse.setRemoveClick(parseInt(tempId));
					break;
				default: return; 
			}
			this.toggleMenuOff();
		} else {
			var button = e.which || e.button;
			if ( button === 1 ) {
			  this.toggleMenuOff();
			}
		}
	},

	right_click_menu: function(e) {
		let id = this.getId(e.target.id);
		tempId = null;
		e.preventDefault();
		
		if (id) {
			tempId = id;

			this.toggleMenuOn();
			this.positionMenu(e);
		} else {
			this.toggleMenuOff();
		}
	},


	// https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
	/**
	* Function to check if we clicked inside an element with a particular class
	* name.
	* 
	* @param {Object} e The event
	* @param {String} className The class name to check against
	* @return {Boolean}
	*/
	clickInsideElement: function ( e, className ) {
		var el = e.srcElement || e.target;

		if ( el.classList.contains(className) ) {
			return el;
		} else {
			while ( el = el.parentNode ) {
				if ( el.classList && el.classList.contains(className) ) {
					return el;
				}
			}
		}

		return false;
	},

  /**
   * Get's exact position of event.
   * 
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
	getPosition: function (e) {
		var posx = 0;
		var posy = 0;

		if (!e) var e = window.event;
		
		if (e.pageX || e.pageY) {
		  posx = e.pageX;
		  posy = e.pageY;
		} else if (e.clientX || e.clientY) {
		  posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		  posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		return {
		  x: posx,
		  y: posy
		}
	},

  /**
   * Turns the custom context menu on.
   */
	toggleMenuOn: function () {
		if ( menuState !== 1 ) {
			menuState = 1;
			menu.classList.add( contextMenuActive );
		}
	},

  /**
   * Turns the custom context menu off.
   */
	toggleMenuOff: function () {
		if ( menuState !== 0 ) {
		  menuState = 0;
		  menu.classList.remove( contextMenuActive );
		}
	},

  /**
   * Positions the menu properly.
   * 
   * @param {Object} e The event
   */
	positionMenu: function (e) {
		clickCoords = this.getPosition(e);
		clickCoordsX = clickCoords.x;
		clickCoordsY = clickCoords.y;

		menuWidth = menu.offsetWidth + 20;
		menuHeight = menu.offsetHeight + 4;

		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;

		let scrollMaxX = window.top.scrollMaxX;
		let scrollMaxY = window.top.scrollMaxY;

		if ( scrollMaxX + windowWidth < clickCoordsX + menuWidth ) {
		  menu.style.left = (scrollMaxX + windowWidth) - menuWidth + "px";
		} else {
		  menu.style.left = clickCoordsX + "px";
		}

		if ( scrollMaxY + windowHeight  < clickCoordsY + menuHeight ) {
		  menu.style.top = (scrollMaxY + windowHeight) - menuHeight + "px";
		} else {
		  menu.style.top = clickCoordsY + "px";
		}
	}

}

var keyboard = {

	/*
	 * Function for keyboard navigation
	 * to know when to start scrolling
	 * to keep the view in the selected element 
	 *
	 * */
	menuLinesStartScroll: function() {		
		// the panel with max height of 600px  
		// is 20 lines in one line display
		// and 12 lines with double line
		// 0.8 ratio to start scrolling
		return Math.floor(heightLines * 0.8);		
	},

	scrollMenuUp: function() {
		// checks when to start scrolling
		if (indexes[new_node.id] < Object.keys(indexes).length - this.menuLinesStartScroll())
			window.scrollByLines(-scrollBy);
	},

	scrollMenuDown: function() {
		// checks when to start scrolling
		if (indexes[new_node.id] > this.menuLinesStartScroll())
			window.scrollByLines(scrollBy);
	},

	scrollMenuBegin: function() {
		window.scrollTo(0, 0);
	},
	
	scrollMenuEnd: function() {
		window.scrollTo(0, window.scrollMaxY);
	},
	
	checkNewNode: function() {
		return (new_node != null && new_node.tagName == "DIV");
	},

	upKey: function() {
		new_node = old_node.previousSibling? old_node.previousSibling:old_node;
		if (this.checkNewNode()) {			
			misc.nodeToggle();				
			this.scrollMenuUp();
		}
	},

	downKey: function() {
		new_node = old_node.nextSibling? old_node.nextSibling:old_node;
		if (this.checkNewNode()) {			
			misc.nodeToggle();			
			this.scrollMenuDown();
		}
	},
	
	homeKey: function() {
		new_node = document.getElementById(ids[0]); 
		misc.nodeToggle();
		this.scrollMenuBegin();
	},

	endKey: function() {
		new_node = document.getElementById(ids[Object.keys(ids).length-1]); 
		misc.nodeToggle();
		this.scrollMenuEnd();
	},
	
	enterKey: async function() {
		await browser.tabs.update(parseInt(new_node.id), {
			active: true,
		});
		window.close();
	},

	deleteKey: async function() {
		new_node = old_node.nextSibling? old_node.nextSibling:old_node.previousSibling;
		let activeNode = active[old_node.id];
		let id = old_node.id;

		await browser.tabs.remove(parseInt(old_node.id));
		old_node.remove();

		misc.nodeToggle();
		misc.updateIndexes();
		delete infoUrl[id];

		if(activeNode)
			window.close();
	},

	/*
	 * Key assigned to reload 
	 *
	 * */
	insertKey: function() {
		let id = old_node.id;
		var icon = document.getElementById("icon_"+id);

		browser.tabs.reload(parseInt(id), {bypassCache: true})
		.then(() => { 
			icon.src = browser.runtime.getURL("popup/img/loading.svg");
		});

		misc.checkLoadingTab(id)
		.then((tabInfo) => {
			if (tabInfo.url != "about:addons")
				icon.src = tabInfo.favIconUrl?tabInfo.favIconUrl:"";
			else
				icon.src = "";
			misc.setItemInfo(id, tabInfo.title);
			misc.setInfoToTitle(id);
		});
	},

	rightKey: function() {
		let id = old_node.id;

		misc.getTabInfo(id)
		.then((tabInfo) => {
			misc.setItemInfo(id, tabInfo.url);
			misc.setInfoToUrl(id);
		});
	},

	leftKey: function() {
		let id = old_node.id;

		misc.getTabInfo(id)
		.then((tabInfo) => {
			misc.setItemInfo(id, tabInfo.title);
			misc.setInfoToTitle(id);
		});
	},

	bookmarkKey: function() {
		let id = old_node.id;

		misc.getTabInfo(id)
		.then((tabInfo) => {
			misc.setBookmark(tabInfo);
		});
	},

	pinKey: function() {
		let id = old_node.id;

		browser.tabs.update(parseInt(id), {pinned: !pinned[id]})
		.then(() => {
			pinned[id] = !pinned[id];
			window.close();
		});

	},

	keyboard_navigation: function(e) {
		keyboard.hideScrollBar();

		let key = e.keyCode || e.which;
		switch(key) {
			case 38: // up
				keyboard.upKey();
				break;

			case 40: // down
				keyboard.downKey();
				break;

			case 39: // right
				keyboard.rightKey();
				break;

			case 37: // left
				keyboard.leftKey();
				break;

			case 45: // insert 
				keyboard.insertKey();
				break;

			case 46: // delete
				keyboard.deleteKey();
				break;

			case 13: // enter
				keyboard.enterKey();
				break;

			case 36: // home
				keyboard.homeKey();
				break;

			case 35: // end
				keyboard.endKey();
				break;

			case 98: // b
			case 66: // B
				keyboard.bookmarkKey();
				break;

			case 112: // p
			case 80: // P
				keyboard.pinKey();
				break;

			default: return; // exit this handler for other keys
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	},

	hideScrollBar: function() {
		document.body.style.overflowY = "hidden";
	}
	
}


var mouse = {

	setMutedClick: async function(tab, double_line) {
		var voice = document.getElementById("voice_"+tab.id);
		await browser.tabs.update(tab.id, {
			muted: false
		});
		if (double_line)
			voice.src = browser.runtime.getURL("popup/img/icons8-voice-24.png");
		else
			voice.src = browser.runtime.getURL("popup/img/icons8-voice-16.png");
		voice.classList.add('audible');
		voice.addEventListener('click', function() {
			mouse.setAudibleClick(tab, double_line);
		});
	},

	setAudibleClick: async function(tab, double_line) {
		var voice = document.getElementById("voice_"+tab.id);
		await browser.tabs.update(tab.id, {
			muted: true
		});
		if (double_line)
			voice.src = browser.runtime.getURL("popup/img/icons8-mute-24.png");
		else
			voice.src = browser.runtime.getURL("popup/img/icons8-mute-16.png");
		voice.classList.add('audible');
		voice.addEventListener('click', function() {
			mouse.setMutedClick(tab, double_line);
		});
	},

	pinTabClick: async function(id) {
		await browser.tabs.update(id, {pinned: !pinned[id]});
		
		pinned[id] = !pinned[id];
		window.close();
	},

	setBookmarkClick: function(tab) {
		misc.setBookmark(tab);
	},

	setInfoClick: function(id) {

		misc.getTabInfo(id)
		.then((tabInfo) => {
			if (infoUrl[id] === true) {
				misc.setItemInfo(id, tabInfo.title);
				misc.setInfoToTitle(id);
			} else {
				misc.setItemInfo(id, tabInfo.url);
				misc.setInfoToUrl(id);
			}
		});
	},

	setReloadClick: function(id) {
		var icon = document.getElementById("icon_"+id);

		browser.tabs.reload(id, {bypassCache: true})
		.then(() => { 
			icon.src = browser.runtime.getURL("popup/img/loading.svg");
		});

		misc.checkLoadingTab(id)
		.then((tabInfo) => {			
			if (tabInfo.url != "about:addons")
				icon.src = tabInfo.favIconUrl?tabInfo.favIconUrl:"";
			else
				icon.src = "";						
			misc.setItemInfo(id, tabInfo.title);
			misc.setInfoToTitle(id);
		});
	},

	setRemoveClick: async function(id) {
		let activeItem = active[id];

		await browser.tabs.remove(id);
		let element = document.getElementById(id);
		element.remove();

		misc.updateIndexes();
		delete infoUrl[id];

		if(activeItem)
			window.close();
	},	

	setItemClick: async function(tab) {
		await browser.tabs.update(tab.id, {
			active: true,
		});
		window.close();
	},

	nodeLeave: function() {
		old_node.classList.remove("hover");
		old_node = new_node;
	},

	mouse_navigation_enter: function(e) {
		new_node = document.getElementById(e.target.id);
		misc.nodeToggle();
	},

	mouse_navigation_leave: function(e) {
		old_node = document.getElementById(e.target.id);
		mouse.nodeLeave();
	},

	showScrollBar: function() {
		document.body.style.overflowY = "scroll";
	}
}


var session = {

	first: null,
	activeTab: null, 	

	setIndexes: function(tab) {
		indexes[tab.id] = tab.index;
		ids[tab.index] = tab.id;
		active[tab.id] = tab.active;
		infoUrl[tab.id] = false;
		pinned[tab.id] = tab.pinned;
	},

	setFirstElement: function(div) {
		if (this.first) {
			old_node = div;
			new_node = div;
			this.first = false;
			div.classList.add('hover');
		}
	},

	scrollToTab: function() {
		let v = Math.floor(session.activeScrollTo / heightLines) * 600;
		window.scrollTo(0,v);	
	},

	getIndexNumber: function(tabs, index) {
		let zero = "";
		for(i=0; i< tabs.length - index.length; i++)
			zero += "0";
		return zero + index.toString();
	},
	
	testLoadedTab: function(tab, div) {
		div.classList.add("disabled");
		const executing = browser.tabs.executeScript(tab.id,
			{code: `;`}
		);
		executing.then(() => {               
		});
		executing.catch(() => {
			if (tab.url != "about:blank")                 
				div.classList.add("enabled");                    
		});
	},

	setBorderColorByContainer: function(cookieStoreId, defaultColor) {
		if (cookieStoreId != "firefox-default") {
			var getContext = browser.contextualIdentities.get(
				cookieStoreId
			);
			getContext.then((container) => {					
				document.querySelector(".active").style.borderLeft = `3px solid ${container.colorCode}`;
				document.querySelector(".active").style.marginLeft = '0px';
			});
		} else {
			document.querySelector(".active").style.borderLeft = `3px solid ${defaultColor}`;
			document.querySelector(".active").style.marginLeft = '0px';
		}
	},

	setBorderColorByContainerAllTabs: function(div, cookieStoreId) {
		if (cookieStoreId != "firefox-default") {
			var getContext = browser.contextualIdentities.get(
				cookieStoreId
			);
			getContext.then((container) => {					
				div.style.borderLeft = `3px solid ${container.colorCode}`;
				div.style.marginLeft = '0px';
			});
		} else {
		}
	},

	load_session: async function() {
		try {
			let {buttons, scrollbar, display} = 
				await browser.storage.local.get(["buttons", "scrollbar", "display"]);

			// load some options for keyboard scrolling
			heightLines = display["double_line"]? 12:20;
			scrollBy = display["double_line"]? 3:2;

			if (scrollbar["mouse"])
				mouse.showScrollBar();

			let query = {
				currentWindow: true
			};
			let tabs = await browser.tabs.query(query);
			let tabsMenu = document.getElementById('tabs');

			if (tabs.length == 1) {
				window.close();
			}
			
			session.first = true;
			for (let tab of tabs) {
				session.setIndexes(tab);

				let div = document.createElement('div');
				div.classList.add('button');
				div.setAttribute('id', tab.id);
				if (tab.active) {
					div.classList.add('active');
					session.activeTab = tab.cookieStoreId;					
					session.activeScrollTo = tab.index;					
				}				

				if (display["tabindex"]) {
					let index = document.createElement('span');
					let num = tab.index + 1;
					index.innerText = session.getIndexNumber(tabs.length.toString(), num.toString());
					index.classList.add('index');
					div.append(index);
				}

				let img = document.createElement('img');
				img.setAttribute('id', "icon_"+tab.id);
				if (tab.status == "loading") {
					img.src = browser.runtime.getURL("popup/img/loading.svg");

					misc.checkLoadingTab(tab.id)
					.then((tabInfo) => {
						if (tabInfo.url != "about:addons")
							img.src = tabInfo.favIconUrl?tabInfo.favIconUrl:"";
						else
							img.src = "";
						img.title = tabInfo.title;
						span.innerText = tabInfo.title;
						span.title = tabInfo.title;
					});
				}
				else {
					img.setAttribute('src', tab.favIconUrl);
				}
				img.setAttribute('width', display["double_line"]?'32':'16');
				img.setAttribute('height', display["double_line"]?'32':'16');
				img.setAttribute('title', tab.title);
				img.classList.add('favicon');
				img.addEventListener('click', function() {
					mouse.setItemClick(tab);
				});
				div.append(img);


				if(tab.audible && !tab.mutedInfo.muted) {
					let audible = document.createElement('img');
					audible.setAttribute('id', "voice_"+tab.id);
				
					if (display["double_line"])
						audible.src = browser.runtime.getURL("popup/img/icons8-voice-24.png");
					else
						audible.src = browser.runtime.getURL("popup/img/icons8-voice-16.png");
				
					audible.classList.add('audible');
					audible.addEventListener('click', function() {
						mouse.setAudibleClick(tab, display["double_line"]);
					});
					div.append(audible);
				} else if(tab.mutedInfo.muted) {
					let audible = document.createElement('img');
					audible.setAttribute('id', "voice_"+tab.id);
					
					if (display["double_line"])
						audible.src = browser.runtime.getURL("popup/img/icons8-mute-24.png");
					else
						audible.src = browser.runtime.getURL("popup/img/icons8-mute-16.png");

					audible.classList.add('audible');
					audible.addEventListener('click', function() {
						mouse.setMutedClick(tab, display["double_line"]);
					});
					div.append(audible);
				}

				if (display["double_line"]) {

					let span = document.createElement('div');
					span.setAttribute('id', "span_"+tab.id);
					span.innerText = tab.title;
					span.setAttribute('title', tab.title);					
	
					let url = document.createElement('div');
					url.setAttribute('id', "url_"+tab.id);
					url.innerText = tab.url;
					url.setAttribute('title', tab.url);
					url.classList.add('index');
	
					let item = document.createElement('div');					
					item.appendChild(span);					
					item.appendChild(url);
					item.classList.add('item');
					item.addEventListener('click', function() {
						mouse.setItemClick(tab);
					});
					div.appendChild(item);
				} else {
					let span = document.createElement('span');
					span.setAttribute('id', "span_"+tab.id);
					span.innerText = tab.title;
					span.setAttribute('title', tab.title);
					span.classList.add('item');
					span.addEventListener('click', function() {
						mouse.setItemClick(tab);
					});
					div.appendChild(span);
				}

				if (buttons["remove"]) {
					let remove = document.createElement('img');
					let src = browser.runtime.getURL("popup/img/b_drop.png");
					remove.setAttribute('src', src);
					remove.setAttribute('width', '16');
					remove.setAttribute('height', '16');
					remove.setAttribute('title', "Remove");
					remove.classList.add('ctrl');
					remove.addEventListener('click', function() {
						mouse.setRemoveClick(tab.id);
					});
					div.append(remove);
				}

				if (buttons["reload"]) {
					let reload = document.createElement('img');
					src = browser.runtime.getURL("popup/img/s_reload.png");
					reload.setAttribute('src', src);
					reload.setAttribute('width', '16');
					reload.setAttribute('height', '16');
					reload.setAttribute('title', "Reload");
					reload.classList.add('ctrl');
					reload.addEventListener('click', function() {
						mouse.setReloadClick(tab.id);
					});
					div.append(reload);
				}

				if (buttons["pin"]) {
					let pin = document.createElement('img');
					src = browser.runtime.getURL("popup/img/favicon-16x16.png");
					pin.setAttribute('src', src);
					pin.setAttribute('width', '16');
					pin.setAttribute('height', '16');
					pin.setAttribute('title', "Pin");
					pin.classList.add('ctrl');
					pin.addEventListener('click', function() {
						mouse.pinTabClick(tab.id);
					});
					div.append(pin);
				}

				if (buttons["bookmark"]) {
					let bookmark = document.createElement('img');
					src = browser.runtime.getURL("popup/img/b_bookmark.png");
					bookmark.setAttribute('src', src);
					bookmark.setAttribute('width', '16');
					bookmark.setAttribute('height', '16');
					bookmark.setAttribute('title', "Bookmark");
					bookmark.classList.add('ctrl');
					bookmark.addEventListener('click', function() {
						mouse.setBookmarkClick(tab);
					});
					div.append(bookmark);
				}

				if (buttons["viewurl"]) {
					let info = document.createElement('img');
					src = browser.runtime.getURL("popup/img/s_info.png");
					info.setAttribute('src', src);
					info.setAttribute('width', '16');
					info.setAttribute('height', '16');
					info.setAttribute('title', "View URL/Title");
					info.classList.add('ctrl');
					info.addEventListener('click', function() {
						mouse.setInfoClick(tab.id);
					});
					div.append(info);
				}
				
				if (display["containercolorall"])
					session.setBorderColorByContainerAllTabs(div, tab.cookieStoreId);

				if (display["unloaded"])
					session.testLoadedTab(tab, div);
				
				div.addEventListener('mouseenter', mouse.mouse_navigation_enter);
				div.addEventListener('mouseleave', mouse.mouse_navigation_leave);

				tabsMenu.appendChild(div);

				if (scrollbar["activetab"]) {
					if (tab.active) { 
						session.setFirstElement(div);
					}
				} else {
					session.setFirstElement(div);
				}
			}
			
			// some display option	
			if (!display["containercolorall"]) {
				if (display["containercolor"])		
					session.setBorderColorByContainer(session.activeTab, display["bordercolor"]);			
				else {
					document.querySelector(".active").style.borderLeft = `3px solid ${display["bordercolor"]}`;
					document.querySelector(".active").style.marginLeft = '0px';
				}
			}

			document.addEventListener('keydown', keyboard.keyboard_navigation);
			document.addEventListener('mouseover', mouse.showScrollBar);
			document.addEventListener('click', function(e) {context_menu.clickEvent(e);});
			document.addEventListener('contextmenu', function(e) {context_menu.right_click_menu(e);});
			
			if (scrollbar["activetab"]) 
				session.scrollToTab();

		} catch (error) {
			console.log(`Error: ${error}`);
		}
	}
}

document.addEventListener('DOMContentLoaded', session.load_session);

loadDisplayOptions();
loadButtonsOptions();
loadScrollbarOptions();
