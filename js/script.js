(initLog || (window.initLog = [])).push([new Date().getTime(), "Starting main JS loading and processing"]);

// Plugins, extends, globals, etc.
Number.prototype.abbr = function(min, precision) {
	var value = this,
		newValue = value,
		min = min || 1000,
		precision = precision || 3;

	if (value >= min) {
		var suffixes = ["", "K", "M", "B","T"],
			suffixNum = Math.floor(("" + parseInt(value)).length / 3),
			shortValue = "";

		for (var length = precision; length >= 1; length--) {
			shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(length));

			var dotLessShortValue = (shortValue + "").replace(/[^A-z0-9 ]+/g, "");

			if (dotLessShortValue.length <= precision) break;
		}

		if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);

		newValue = shortValue + suffixes[suffixNum];
	}
	else {
		newValue = newValue.toLocaleString();
	}

	return newValue;
};

Number.prototype.pad = function(width, char) {
	char = char || "0";
	num = this + "";
	width = width || 2;

	return ((num.length >= width) ? num : new Array(width - num.length + 1).join(char) + num);
};

$.animateNumber = function(from, to, speed, elm, prefix) {
	elm = $(elm)[0];

	precision = (to + "").split(".")[1].length;

	prefix = prefix || "";

	$({
		currNum: from
	}).animate({
		currNum: to
	}, {
		duration: speed,
		step: function() {
			elm.innerHTML = prefix + this.currNum.toFixed(precision);
		},
		complete: function() {
			elm.innerHTML = prefix + to.toFixed(precision);
		}
	});
};


// This $.extend alternative is 11.3 times faster than jQuery's native one, but it's buggy, rework it later
/*(function() {
	function localExtend(target, source) {
		var sourceMeta, tCurr, sCurr, key;

		for (key in source) {
			if (source.hasOwnProperty(key)) {
				tCurr = target[key];
				sCurr = source[key];
				sourceMeta = setMeta(sCurr);

				if (sCurr !== tCurr && sourceMeta && setMeta(tCurr) === sourceMeta) {
					target[key] = extend(tCurr, sCurr);
				}
				else if (0 !== sourceMeta) {
					target[key] = sCurr;
				}
			}
			else {
				break;
			}
		}

		return target;
	}

	var setMeta = function(value) {
		if (void 0 === value) {
			return 0;
		}

		if ("object" !== typeof value) {
			return false;
		}

		return true;
	};

	window.extend = function(target) {
		var args = arguments,
			l = args.length;

		for (var i = 1; i < l; i++){
			localExtend(target, args[i]);
		}

		return target;
	};
})();*/


$.unextend = function(obj1, obj2) {
	var newObj = {};

	for (var k in obj2) {
		var e = obj2[k],
			c = obj1[k];

		if (typeof e == "undefined") {
			continue;
		}
		else if (typeof c == "undefined") {
			newObj[k] = e;
		}
		else if (typeof e == "object" && typeof e.length == "number" && JSON.stringify(e) !== JSON.stringify(c)) {
			newObj[k] = e;
		}
		else if (typeof e == "object" && typeof e.length == "undefined" && JSON.stringify(e) !== JSON.stringify(c)) {
			newObj[k] = $.unextend(c, e);
		}
		else if (e.toString() !== c.toString()) {
			newObj[k] = e;
		}
	}

	return newObj;
};

String.prototype.parseUrl = function() {
	if (this.indexOf("://") == 0) {
		return "https" + this;
	}
	else if (this.indexOf("data:") == 0 || this.indexOf("filesystem:") == 0 || this.indexOf("blob:") == 0) {
		return this.toString();
	}
	else if (this.indexOf("://") == -1) {
		return "http://" + this;
	}
	else {
		return this.toString();
	}
};

window._gaq = window._gaq || [];


// Main iChrome init
var iChrome = function(refresh) {
	iChrome.Status.log("Starting page generation");

	iChrome.CSS();
	
	$(".toolbar").addClass(iChrome.Storage.settings.toolbar ? "hidden" : "").html(iChrome.render("toolbar", iChrome.Storage.settings));

	iChrome.Tabs();

	iChrome.Status.log("Tabs rendered");

	if (localStorage["help"] == "true" && new Date().getTime() >= 1395806400000) {
		iChrome.HelpUs();
	}
	
	if (localStorage["updated"] == "true") {
		iChrome.Updated();
	}
	else if (localStorage["installed"] == "true") {
		iChrome.Guide();
	}
	else if (localStorage["whatsNew"] == "true") {
		iChrome.WhatsNew();
	}

	localStorage.uses = parseInt(localStorage.uses || 0) + 1;

	iChrome.deferredTimeout = setTimeout(function() {
		$(document.body).removeClass("unloaded");

		iChrome.deferred(refresh);
	}, 200);

	iChrome.Status.log("Page generation done");
};

iChrome.deferredTimeout = "";

iChrome.deferred = function(refresh) {
	iChrome.Status.log("Starting deferred generation");

	iChrome.Search();

	iChrome.Status.log("Search done");

	iChrome.Tabs.draggable();

	iChrome.Tabs.Nav.last = iChrome.Tabs.parent.children(".tab").length;

	iChrome.Tabs.Nav.buttons();

	iChrome.Tabs.Nav(parseInt(iChrome.Storage.settings.def || 1));

	iChrome.Status.log("Tabs done");

	iChrome.initTooltips();

	iChrome.initResize();

	if (iChrome.Storage.settings.ok || iChrome.Storage.settings.voice) {
		iChrome.Search.Speech();

		iChrome.Status.log("Speech done");
	}

	iChrome.Themes();

	iChrome.Status.log("Themes modal done");

	iChrome.Settings();

	iChrome.Status.log("Settings done");

	iChrome.Widgets.refresh();

	iChrome.Status.log("Widgets refresh done");

	iChrome.Widgets.Settings();

	iChrome.Status.log("Widget settings done");

	iChrome.Tabs.Menu();

	iChrome.Status.log("Tabs menu done");

	iChrome.Store();

	iChrome.Status.log("Store done");

	iChrome.Donate();

	window.onbeforeunload = function() {
		if (iChrome.Storage.timeout !== null) {
			iChrome.Storage.sync(true);
		}

		chrome.extension.getBackgroundPage().setReload();
	};

	$("#donate").off().on("click", function(e) {
		e.preventDefault();

		iChrome.Donate.modal.show();
	});

	$(".toolbar .custom-link").on("click", function(e) {
		e.preventDefault();

		var href = this.getAttribute("href");

		chrome.tabs.getCurrent(function(d) {
			if (e.which == 2) {
				chrome.tabs.create({
					url: href,
					index: d.index + 1
				});
			}
			else {
				chrome.tabs.update(d.id, {
					url: href
				});
			}
		});
	});

	var appsLoaded = false;

	$(".apps").on("click", function() {
		var panel = $(this).find(".panel");

		if (!panel.hasClass("visible")) {
			if (!appsLoaded) {
				$(this).find("img[data-src]").each(function(e, i) {
					this.setAttribute("src", this.getAttribute("data-src"));

					this.setAttribute("data-src", null);
				});

				appsLoaded = true;
			}

			var elms = $(this).find("*");

			$(document.body).on("click.apps", function(e) {
				if (!elms.is(e.target)) {
					panel.removeClass("visible");

					$(document.body).off("click.apps");
				}
			});

			panel.addClass("visible");
		}
		else {
			$(document.body).off("click.apps");

			panel.removeClass("visible");
		}
	});

	$(".apps a.icon").on("click", function(e) {
		e.preventDefault();
	});

	$(document.body).on("click", ".nested-link[data-href]", function(e) {
		e.preventDefault();

		var a = document.createElement("a"),
			that = $(this);

		a.target = that.attr("target") || "_blank";
		a.href = that.attr("data-href") || "#";

		a.click();
	});

	iChrome.Status.log("Event handlers done");

	// Init Uservoice and analytics
	if (!refresh) {
		window._gaq.push(["_setAccount", "UA-41131844-2"]);
		window._gaq.push(["_trackPageview", "/v" + chrome.runtime.getManifest().version]);

		(function() {
			var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
			ga.src = "https://ssl.google-analytics.com/ga.js";
			var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);
		})();

		window.UserVoice = window.UserVoice || [];

		var uv = document.createElement("script");

		uv.async = true;
		uv.type = "text/javascript";
		uv.src = "https://widget.uservoice.com/YLT6rl3u3uU75IbSodIBw.js";

		var s = document.getElementsByTagName("script")[0];

		s.parentNode.insertBefore(uv, s);

		window.UserVoice.push(["set", {
			accent_color: "#448dd6",
			trigger_color: "white",
			screenshot_enabled: "false",
			trigger_background_color: "rgba(46, 49, 51, 0.6)"
		}]);

		UserVoice.push(["identify", {
			id: iChrome.uid
		}]);

		window.UserVoice.push(["addTrigger", "#support", { mode: "contact" }]);

		window.UserVoice.push(["addTrigger", "#feedback", { mode: "satisfaction" }]);

		window.UserVoice.push(["autoprompt", {
			position: "toast"
		}]);

		iChrome.Status.log("Uservoice done");
	}
};

iChrome.uid = localStorage.uid || (localStorage.uid = (new Date().getTime()).toString(16) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1));

iChrome.initTooltips = function() {
	if (!$(document.body).find(".tip-container").length) $(document.body).append('<div class="tip-container" />');

	var tip = $(".tip-container"),
		tipTime, maxHeight;

	$(document.body).on("mouseenter", "[data-tooltip]", function() {
		var elm = $(this),
			offset = elm.offset();

		clearTimeout(tipTime);

		tipTime = setTimeout(function() {
			var content = elm.attr("data-tooltip"),
				top = offset.top + elm.outerHeight() + 10

			maxHeight = false;

			if (content == "") {
				return;
			}

			tip.html(content.replace(/(<br(\s)?(\/)?>\s*)+$/, ""));

			if ((top + tip.outerHeight()) > (document.body.scrollTop + window.innerHeight)) {
				top = offset.top - tip.outerHeight() - 10;

				if (top < 0) {
					maxHeight = tip.outerHeight() + top;

					top = 0;
				}
			}

			tip.css({
				top: top,
				left: offset.left,
				maxHeight: maxHeight || ""
			});

			tip.addClass("visible");
		}, 500);
	}).on("mouseleave", "[data-tooltip]", function() {
		clearTimeout(tipTime);

		tip.removeClass("visible");

		tipTime = setTimeout(function() {
			tip.css({
				top: "",
				left: "",
				maxHeight: ""
			});
		}, 300);
	});

	tip.on("mouseenter", function() {
		clearTimeout(tipTime);

		tip.addClass("visible");
	}).on("mouseleave", function() {
		clearTimeout(tipTime);

		tip.removeClass("visible");

		tipTime = setTimeout(function() {
			tip.css({
				top: "",
				left: "",
				maxHeight: ""
			});
		}, 300);
	});
};

iChrome.initResize = function() {
	var db = $(document.body);

	db.on("mousedown.widgetResize", ".medley .widget .resize", function(e) {
		var startX = e.pageX,
			startY = e.pageY,
			widget = $(this.parentNode),
			startWidth = widget.width(),
			startHeight = widget.height(),

			grid = widget.parent(),
			tc = $("body > .tab-container"),
			gridMax = tc.outerHeight() - 50,
			tcOTop = $("body > .tab-container").offset().top,
			h;

		grid.find(".widget").each(function() {
			h = this.offsetTop + this.offsetHeight;

			if (h >= gridMax) { gridMax = h; }
		});

		db.addClass("resizing").on("mousemove.widgetResize", function(e) {
			e.preventDefault();

			widget.width((10 * Math.round((startWidth + (e.pageX - startX)) / 10)) - 1); // Minus 1 so it lines up with the insides of the grid squares
			widget.height((10 * Math.round((startHeight + (e.pageY - startY)) / 10)) - 1);


			var max = widget[0].offsetTop + widget[0].offsetHeight;

			if (gridMax > max) {
				max = gridMax;
			}

			grid[0].style.height = (max + 50) + "px";
		}).on("mouseup.widgetResize", function() {
			db.removeClass("resizing").off("mousemove.widgetResize mouseup.widgetResize");
		
			iChrome.Storage.tabs = iChrome.Tabs.serialize();

			iChrome.Tabs.save();
		});
	});
};

iChrome.refresh = function(all) {
	iChrome.Status.log("Refreshing...");

	clearTimeout(iChrome.deferredTimeout);

	$(".widgets-container .column").sortable("destroy");

	$(document.body).off().find(".remove, .toolbar, .widgets-container, .tab-container, .modal, .modal-overlay, .sp-container, .customcss").remove().end()
		.find("*:not(.footer *)").off().end()
		.prepend('<div class="remove">Remove</div>' +
			'<header class="toolbar"></header>' +
			'<div class="widgets-container"></div>' +
			'<div class="tab-container" tabindex="-1"><div class="tab-nav"><nav class="prev"></nav><nav class="next"></nav></div></div>');

	iChrome.Tabs.parent = $(".tab-container");
	iChrome.Widgets.active = [];
	iChrome.Tabs.Nav.current = parseInt(iChrome.Storage.settings.def || 1);

	if (all) {
		chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
			iChrome.Storage.tabs = d.tabs || iChrome.Storage.Defaults.tabs;
			iChrome.Storage.themes = d.themes || iChrome.Storage.Defaults.themes;
			iChrome.Storage.cached = d.cached || iChrome.Storage.Defaults.cached;
			iChrome.Storage.settings = d.settings || iChrome.Storage.Defaults.settings;

			if (typeof d.tabs == "string") {
				try {
					iChrome.Storage.tabs = JSON.parse(d.tabs);
				}
				catch(e) {
					alert("An error occurred while trying to load your homepage, please try again or reinstall iChrome.");
				}
			}

			iChrome.Storage.tabsSync = JSON.parse(iChrome.Storage.getJSON(iChrome.Storage.tabs));

			iChrome(true);
		});
	}
	else {
		iChrome.Storage.tabs = $.extend(true, {}, {tabs: iChrome.Storage.Originals.tabs || iChrome.Storage.Defaults.tabs}).tabs;

		iChrome(true);
	}

	iChrome.Status.log("Refresh done.");
};


// Internal log
iChrome.Status = function() {
	if (iChrome.Logs.error.length) {
		return "There are " + iChrome.Logs.error.length + " errors in the log.";
	}
	
	return "Everything looks good, there are no errors in the log.";
};

iChrome.Status.get = function(which) {
	iChrome.Logs[which || "status"].forEach(function(e, i) {
		console.log(moment(e[0]).toISOString().replace("T", " ").replace("Z", "") + "\t\t\t\t" + e[1]);
	});
};

iChrome.Status.getTime = function() {
	var first = 0,
		last = 0;

	iChrome.Logs.status.forEach(function(e, i) {
		if (e[1] == "Main JS loaded and processed, starting storage fetching") {
			first = e[0];
		}
		else if (e[1] == "Uservoice done") {
			last = e[0];
		}
	});

	return last - first;
};

iChrome.Status.log = function(msg) {
	iChrome.Logs.status.push([new Date().getTime(), msg]);
};

iChrome.Status.error = function(msg) {
	iChrome.Logs.error.push([new Date().getTime(), msg]);

	console.log("There are " + iChrome.Logs.error.length + " errors in the log.");
};

iChrome.Status.info = function(msg) {
	iChrome.Logs.info.push([new Date().getTime(), msg]);
};

iChrome.Logs = {
	error: [],
	status: (window.initLog || []),
	info: []
};


// CSS generation
iChrome.CSS = function() {
	$("style.customcss").remove();

	$(document.body).append(iChrome.render("css", {
		wcolor: iChrome.Storage.settings.wcolor || "#FFF",
		hcolor: iChrome.Storage.settings.hcolor || "#F1F1F1",
		custom: iChrome.Storage.settings["custom-css"] || ""
	}));

	iChrome.Status.log("CSS generated");
};


// Modals
iChrome.Modal = function(options, close) {
	var options = $.extend({}, {
			width: "",
			height: "",
			html: "This is some sample modal content!!"
		}, options || {}),
		css = {
			width: options.width,
			maxHeight: options.height
		};

	if (options.realHeight) {
		css.height = options.realHeight;
	}

	var modal = this.modal = $('<div class="modal"><div class="close"></div><div class="content"></div></div>').appendTo("body").css(css);

	if (options.classes) {
		this.modal.addClass(options.classes);
	}

	this.elm = this.modal.find(".content").html(options.html);

	var that = this,
		overlay = this.overlay = $('<div class="modal-overlay"></div>').appendTo("body").add(this.modal.children(".close")).on("click", function(e) {
			if (typeof close == "function") {
				close(e);
			}
			else {
				that.hide();
			}
		}).end();

	this.show = function() {
		modal.add(overlay).addClass("visible");

		return that;
	};

	this.hide = function() {
		modal.add(overlay).removeClass("visible");

		return that;
	};

	this.destroy = function() {
		modal.add(overlay).remove();

		delete that;
	};
};


// Settings
iChrome.Settings = function() {
	var settings = $.extend({}, iChrome.Storage.settings);

	settings.tabForms = [];
	settings.themename = (iChrome.Storage.cached[settings.theme] || iChrome.Storage.themes[settings.theme.replace("custom", "")] || {}).name;

	iChrome.Storage.tabs.forEach(function(tab, i) {
		settings.tabForms.push({
			name: tab.name || "Home",
			theme: tab.theme || iChrome.Storage.settings.theme || "default",
			themename: (iChrome.Storage.cached[tab.theme] || iChrome.Storage.themes[tab.theme.replace("custom", "")] || {}).name,
			id: tab.id,
			fixed: !!tab.fixed,
			alignment: tab.alignment || "center",
			columns: (tab.medley ? "medley" : (tab.columns.length || 3)),
			active: (i == 0 ? "active" : ""),
			wcolor: iChrome.Storage.settings.theme || "#FFF",
			hcolor: iChrome.Storage.settings.theme || "#F1F1F1"
		});
	});

	var modal = iChrome.Settings.modal = new iChrome.Modal({
		classes: "settings",
		html: iChrome.render("settings", settings)
	});

	$(".icon.settings").on("click", function(e) {
		modal.show();

		_gaq.push(["_trackPageview", "/settings"]);
	});

	iChrome.Settings.handlers(modal, settings);

	settings.tabForms.forEach(function(tab, i) {
		modal.elm.find("form[data-tab='" + tab.id + "']")
			.find("#columns" + tab.id).val(tab.columns == "medley" ? "medley" : tab.columns + (tab.fixed ? "-fixed" : "-fluid")).end()
			.find("#alignment" + tab.id).val(tab.alignment);
	});
};

iChrome.Settings.handlers = function(modal, settings) {
	modal.elm.on("click", ".nav > li", function(e) {
		var that = $(this),
			tabs = modal.elm.find(".tabs .tab");

		modal.elm.find(".nav > li").add(tabs).removeClass("active");

		that.add(tabs.filter("." + that.attr("data-tab"))).addClass("active");
	}).on("click", ".btn.theme", function(e) {
		e.preventDefault();

		iChrome.Settings.showThemes(this);

		_gaq.push(["_trackPageview", "/themes"]);
	}).on("change", ".links .options label:first-child input", function(e) {
		if ($(this).is(":checked")) {
			$(this).parents("div").first().addClass("visible");
		}
		else {
			$(this).parents("div").first().removeClass("visible").find("input").val("");
		}
	}).on("keydown", "input:not([type=radio], [type=checkbox]), textarea, select", function(e) {
		if (e.which == 13) {
			e.preventDefault();

			iChrome.Settings.save();

			modal.hide();
		}
	}).on("click", ".btns .btn.delete", function(e) {
		e.preventDefault();

		if (modal.elm.find(".specific form").length !== 1 && confirm("Are you really sure you want to delete this tab?\r\nThis action is not reversible and all data from all widgets in this tab will be lost.")) {
			var tab = modal.elm.find("form.active").attr("data-tab") - 1;

			modal.elm.find("form.active").remove();

			iChrome.Storage.tabs.splice(tab, 1);
			iChrome.Storage.tabsSync.splice(tab, 1);

			iChrome.Storage.tabs.forEach(function(e, i) {
				e.id = i + 1;
			});

			_gaq.push(["_trackEvent", "Tabs", "Remove", iChrome.Storage.tabs.length + ""]);

			modal.modal.add(modal.overlay).removeClass("visible");

			iChrome.Settings.save();
		}
		else if (modal.elm.find(".specific form").length == 1) {
			alert("You cannot delete the only remaining tab.");
		}
	}).on("click", ".btns .btn.default", function(e) {
		e.preventDefault();

		var tab;

		if (tab = modal.elm.find("form.active").attr("data-tab")) {
			iChrome.Storage.settings.def = parseInt(tab);

			_gaq.push(["_trackEvent", "Tabs", "Set as default", tab + ""]);
		}
	}).on("click", ".btns .guide", function(e) {
		e.preventDefault();

		iChrome.Guide();
	}).on("click", ".btn.save", function(e) {
		e.preventDefault();

		iChrome.Settings.save();

		modal.hide();
	}).on("click", ".nav li.specific li", function(e) {
		var that = $(this),
			forms = modal.elm.find(".specific form");

		if (that.parents("li").first().hasClass("active")) {
			e.stopPropagation();
		}

		that.siblings().add(forms).removeClass("active");

		that.add(forms.filter("[data-tab='" + that.attr("data-id") + "']")).addClass("active");
	}).on("click", ".btn.backup", function(e) {
		e.preventDefault();

		$("#backup").val(JSON.stringify({
			themes: iChrome.Storage.themes,
			settings: iChrome.Storage.settings,
			tabs: iChrome.Storage.tabsSync
		}));
	}).on("click", ".btn.restore", function(e) {
		e.preventDefault();

		if (!confirm("Are you really, really sure you want to do this?\r\nThis will overwrite all local" + 
					 " and synced data, there is no backup and no way to undo this.  You will lose your" +
					 " ENTIRE current configuration on all computers signed into this Google account.")) {
			return;
		}

		try {
			var settings = JSON.parse($("#backup").val());

			chrome.storage.local.set({
				tabs: settings.tabs || iChrome.Storage.tabs,
				themes: settings.themes || iChrome.Storage.themes,
				settings: settings.settings || iChrome.Storage.settings
			}, function() {
				chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
					iChrome.Storage.tabs = d.tabs || iChrome.Storage.Defaults.tabs;
					iChrome.Storage.themes = d.themes || iChrome.Storage.Defaults.themes;
					iChrome.Storage.cached = d.cached || iChrome.Storage.Defaults.cached;
					iChrome.Storage.settings = d.settings || iChrome.Storage.Defaults.settings;

					if (typeof d.tabs == "string") {
						try {
							iChrome.Storage.tabs = JSON.parse(d.tabs);
						}
						catch(e) {
							alert("An error occurred while trying to load your homepage, please try again or reinstall iChrome.");
						}
					}

					iChrome.Storage.tabsSync = JSON.parse(iChrome.Storage.getJSON(iChrome.Storage.tabs));

					iChrome.Storage.sync(true);

					iChrome.refresh(true); // For some reason, unless this is set to refetch data, it reverts back to the old settings.
				});
			});
		}
		catch(e) {
			alert("An error occurred while trying to parse the provided data, please make sure you entered the EXACT text you backed up.");
		}
	}).on("click", ".reset", function(e) {
		e.preventDefault();

		if (!confirm("Are you really sure you want to reset iChrome?\r\nThis will erase all local" + 
					 " and synced data, there is no backup and no way to undo this.  You will lose your" +
					 " ENTIRE current configuration on all computers signed into this Google account.")) {
			return;
		}

		chrome.storage.sync.clear(function() {
			chrome.storage.local.clear(function() {
				var next = function() {
					var uses = localStorage.uses,
						uid = localStorage.uid;

					localStorage.clear();

					if (uses) localStorage.uses = uses;
					if (uid) localStorage.uid = uid;

					chrome.storage.local.set(iChrome.Storage.Defaults, function() {
						chrome.storage.sync.set(iChrome.Storage.Defaults, function() {
							window.onbeforeunload = null;

							chrome.extension.getBackgroundPage().setReload();

							location.reload();
						});
					});
				};

				window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					var reader = fs.root.createReader(),
						length = 0, found;

					(function read() { // Recursive and self executing, necessary as per the specs
						reader.readEntries(function(results) {
							if (results.length) {
								results.forEach(function(e, i) {
									length++;

									if (e.isDirectory) {
										e.removeRecursively();
									}
									else {
										e.remove(function() {
											length--;

											if (!length) {
												next();
											}
										});
									}
								});

								read();
							}
							else if (!length) {
								next();
							}
						}, next);
					})();
				}, next);
			});
		});
	})
	.find("#alignment").val(settings.alignment).end()
	.find("#columns").val(settings.columns).end()
	.find("input.color").spectrum({
		showInput: true,
		showAlpha: true,
		showInitial: true,
		showButtons: false,
		preferredFormat: "rgb",
		clickoutFiresChange: true
	});
};

iChrome.Settings.showThemes = function(elm) {
	iChrome.Themes.elm = elm;

	iChrome.Themes.show(function(theme, id) {
		this.prev("input").val(id || theme.id).end()
			.next(".current").text(theme.name || (typeof theme.id == "number" ? "Theme " + theme.id : ""));

		iChrome.Themes.hide();
	}.bind($(elm)), function(theme) {
		this.attr("data-style", this.attr("style")).attr("style", iChrome.Tabs.getCSS({theme:theme}));

		iChrome.Themes.overlay.addClass("visible").one("click", function() {
			$(".modal.previewHidden, .modal-overlay.previewHidden").removeClass("previewHidden").addClass("visible");

			this.attr("style", this.attr("data-style")).attr("data-style", "");
		}.bind(this));

		$(".modal.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
	}.bind($(document.body)));
};

iChrome.Settings.save = function() {
	var settings = {
			links: [],
			ok: false,
			tabs: false,
			apps: false,
			plus: false,
			voice: false,
			gmail: false,
			toolbar: false,
			def: parseInt(iChrome.Storage.settings.def || 1)
		},
		booleans = ["ok", "tabs", "apps", "plus", "voice", "gmail", "toolbar"],
		key;

	iChrome.Settings.modal.elm.find(".general form, .visual form, .advanced form").serializeArray().forEach(function(e, i) {
		if (booleans.indexOf(e.name) !== -1) settings[e.name] = true;
		else if (e.value !== "") settings[e.name] = e.value;
	});

	for (var i = 0; i < 3; i++) {
		if (settings["custom" + i] && settings["custom" + i + "-text"] || settings["custom" + i + "-url"]) {
			settings.links.push({
				text: settings["custom" + i + "-text"] || "",
				link: settings["custom" + i + "-url"] || ""
			});

			delete settings["custom" + i];
			delete settings["custom" + i + "-url"];
			delete settings["custom" + i + "-text"];
		}
	}

	iChrome.Settings.modal.elm.find(".specific form").each(function() {
		var tab = iChrome.Storage.tabs[$(this).attr("data-tab") - 1],
			propagating = ["alignment", "theme"],
			tabSettings = {},
			number, layout, columns, key;

		if (!tab) return;

		$(this).serializeArray().forEach(function(e, i) {
			if (e.value !== "") tabSettings[e.name] = e.value;
		});

		for (key in tabSettings) {
			if (key == "name") {
				tab[key] = tabSettings[key];
			}
			else if (propagating.indexOf(key) !== -1) {
				if (settings[key] && (tabSettings[key] == settings[key] || (iChrome.Storage.settings[key] && tabSettings[key] == iChrome.Storage.settings[key]))) {
					tab[key] = settings[key];
				}
				else {
					tab[key] = tabSettings[key];
				}
			}
			else if (key == "columns") {
				if (settings.columns && (tabSettings.columns == settings.columns || (iChrome.Storage.settings.columns && tabSettings.columns == iChrome.Storage.settings.columns))) {
					columns = settings.columns.split("-");
				}
				else {
					columns = tabSettings.columns.split("-");
				}

				if (columns[0] == "medley") {
					columns = ["1", "fixed"];

					if (!tab.medley && !confirm("Are you sure you want to change this to a grid-based tab?\r\nYou will lose all of your columns, everything will be moved to the top right corner.")) {
						continue;
					}

					tab.medley = true;
				}
				else {
					if (tab.medley && !confirm("Are you sure you want to change this to a column-based tab?\r\nYou will lose all of your widget positioning, everything will be moved to the first column of the new tab.")) {
						continue;
					}

					var wasMedley = true;

					tab.medley = false;
				}

				number = parseInt(columns[0] || "0");

				tab.fixed = (columns[1] && columns[1] == "fixed");

				if (tab.columns.length == number) {
					if (wasMedley) {
						tab.columns[0].forEach(function(w, i) {
							delete w.loc;

							tab.columns[0][i] = w;
						});
					}

					continue;
				}
				else if (tab.columns.length < number) {
					for (var i = number - tab.columns.length; i > 0; i--) {
						tab.columns.push([]);
					}
				}
				else if (tab.columns.length > number) {
					for (var i = tab.columns.length - 1; i >= number; i--) {
						tab.columns[0] = tab.columns[0].concat(tab.columns[i]);
					}

					tab.columns.splice(number);
				}

				if (wasMedley) {
					tab.columns.forEach(function(col, i1) {
						col.forEach(function(w, i) {
							delete w.loc;

							tab.columns[i1][i] = w;
						});
					});
				}
			}
		}
	});

	iChrome.Storage.settings = settings;

	iChrome.Tabs.save();

	iChrome.refresh();
};


// Themes
iChrome.Themes = function() {
	var modal = this.Themes.modal = new iChrome.Modal({
			classes: "themes",
			html: iChrome.render("themes")
		});

	this.Themes.Custom.modal = new iChrome.Modal({
		classes: "themes create",
		html: ""
	});

	this.Themes.Custom.handlers(this.Themes.Custom.modal);

	this.Themes.handlers(modal);

	this.Themes.hide = function() {
		modal.hide();
	};

	this.Themes.overlay = $(".preview-overlay").on("click", function() {
		$(this).removeClass("visible");
	});

	this.Themes.themes = false; // These are here to handle iChrome in-page refreshes.
	this.Themes.isLoaded = false;
};

iChrome.Themes.show = function(cb, prev) {
	this.use = cb;
	this.preview = prev;

	this.modal.show();

	if (!this.isLoaded) {
		this.load(this.refresh.bind(this));
	}
};

iChrome.Themes.cache = function(theme, cb) {
	if (iChrome.Storage.cached[theme.id]) { // If already cached
		return cb(iChrome.Storage.cached[theme.id]);
	}

	var that = this,
		err = function(e) {
			if (e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) { // The full 500MB probably won't be used, but the caching will fail if it does.
					that.fs = fs;

					that.cache(theme, cb);
				}, err);
			}

			iChrome.Status.error(e);

			alert("An error occurred while trying to cache the theme you selected, please try again later.");
		};

	if (!this.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			that.fs = fs;

			that.cache(theme, cb);
		}, err);
	}
	
	var fs = this.fs,
		xhr = new XMLHttpRequest();

	xhr.open("GET", "https://s3.amazonaws.com/iChrome/Themes/Images/" + theme.id + ".jpg");

	xhr.responseType = "blob";

	fs.root.getDirectory("Themes", { create: true }, function(dir) {
		dir.getFile(theme.id + ".jpg", { create: true }, function(fe) {
			xhr.onload = function(e) {
				if (xhr.status !== 200) {
					return err();
				}

				var blob = xhr.response;

				fe.createWriter(function(writer) {
					writer.onwrite = function(e) {
						theme.image = fe.toURL();

						theme.offline = true;

						delete theme.resolution;
						delete theme.categories;
						delete theme.filterCategories;

						iChrome.Storage.cached[theme.id] = theme;

						chrome.storage.local.set({
							cached: iChrome.Storage.cached
						});

						cb(theme);
					};

					writer.onerror = err;

					writer.write(blob);
				}, err);
			};

			xhr.send();
		}, err);
	}, err);
};

iChrome.Themes.use = function() {};
iChrome.Themes.preview = function() {};

iChrome.Themes.handlers = function(modal) {
	var that = this;

	modal.elm.on("click", ".btn.use", function(e) {
		e.preventDefault();

		var parent = $(this).parents(".theme").first(),
			id = parseInt(parent.attr("data-id") || 0);

		if (parent.hasClass("custom")) {
			that.use(iChrome.Storage.themes[id], "custom" + id);

			return _gaq.push(["_trackEvent", "Themes", "Use", "custom" + id]);
		}

		var id = that.themeIndex[id],
			theme = $.extend(true, {}, that.themes[id]);

		if (theme) {
			_gaq.push(["_trackEvent", "Themes", "Use", theme.id + ""]);

			that.cache(theme, that.use);
		}
	}).on("click", ".btn.preview", function(e) {
		e.preventDefault();

		var parent = $(this).parents(".theme").first(),
			id = parseInt(parent.attr("data-id") || 0);

		if (parent.hasClass("custom")) {
			that.preview(iChrome.Storage.themes[id], "custom" + id);

			return _gaq.push(["_trackEvent", "Themes", "Preview", "custom" + id]);
		}

		var id = that.themeIndex[id],
			theme = $.extend(true, {}, that.themes[id]);

		if (!theme) return;

		if (iChrome.Storage.cached[id]) { // If already cached don't load remote
			theme.image = iChrome.Storage.cached[id].image;
		}
		else {
			theme.image = "https://s3.amazonaws.com/iChrome/Themes/Images/" + theme.id + ".jpg";
		}

		that.preview(theme);

		_gaq.push(["_trackEvent", "Themes", "Preview", theme.id + ""]);
	}).on("click", ".btn.delete", function(e) {
		e.preventDefault();

		if (!confirm("Are you really sure you would like to delete this theme?\r\nThis action is not reversible, the entire theme will be permanently lost.")) {
			return false;
		}

		var id = $(this).parents(".theme").first().attr("data-id").replace("custom-", "");

		iChrome.Themes.Custom.deleteImg(id, function() {
			iChrome.Themes.Custom.reEnumerate(id, function() {
				iChrome.Storage.themes.splice(id, 1);

				iChrome.Storage.sync();

				iChrome.Themes.refresh();
			});
		});
	}).on("click", ".btn.edit", function(e) {
		e.preventDefault();

		var id = parseInt($(this).parents(".theme").first().attr("data-id"));
		
		that.Custom.edit(id);
	}).on("click", "li.create .btn", function() {
		that.Custom();
	}).on("click", ".nav li[data-id]", function() {
		var elm = $(this),
			id = elm.attr("data-id"),
			themes = [];

		if (id == "custom") {
			themes = that.custom;
		}
		else if ((id = parseInt(id)) || id === 0) {
			themes = that.themes.filter(function(e) {
				return e.filterCategories && e.filterCategories.indexOf(id) !== -1;
			});
		}
		else {
			themes = that.custom.concat(that.themes);
		}

		var container = that.modal.elm.find(".container").addClass("fadeout");

		setTimeout(function() {
			container.html(iChrome.render("themes.listing", {
				themes: themes
			})).removeClass("fadeout");

			that.images = modal.elm.find(".theme .push").toArray();

			container.triggerHandler("scroll", [true]);
		}, 250);

		elm.addClass("active").siblings().removeClass("active");
	});
};

iChrome.Themes.load = function(cb) {
	var that = this;

	$.get("https://s3.amazonaws.com/iChrome/Themes/manifest.json", function(d) {
		var themes = [],
			cached = [],
			themeIndex = {}, key;

		for (key in iChrome.Storage.cached) {
			cached.push(parseInt(key));
		}

		d.images.forEach(function(e, i) {
			var theme = e;

			theme.filterCategories = e.categories;
			theme.offline = cached.indexOf(e.id) !== -1;
			theme.image = "https://s3.amazonaws.com/iChrome/Themes/Thumbnails/" + e.id + ".png";
			theme.resolution = (e.resolution ? e.resolution[0] + "x" + e.resolution[1] : "Unknown");

			if (e.name) {
				theme.name = e.name;
			}

			var categories = [];

			e.categories.forEach(function(e, i) {
				if (d.categories[e]) {
					categories.push(d.categories[e]);
				}
			});

			theme.categories = categories.join(", ");

			themeIndex[e.id] = themes.length;

			themes.push(theme);
		});

		that.themes = themes;
		that.themeIndex = themeIndex;

		that.isLoaded = true;

		var key,
			categories = [];

		for (key in d.categories) {
			categories.push({
				id: parseInt(key),
				name: d.categories[key]
			});
		}

		that.modal.elm.html(iChrome.render("themes", {
			categories: categories.sort(function(a, b) { return a - b; })
		}));


		// Initialize lazy-loading, needs to be done after HTML is replaced
		that.images = [];

		var coords, timeout, img, length,
			poll = function() {
				length = that.images.length;

				for (var i = 0; i < length; i++) { // forEach doesn't play well with element removal, so for needs to be used here
					img = that.images[i];

					coords = img.getBoundingClientRect();

					if (((coords.top >= 0 && coords.left >= 0 && coords.top) <= window.innerHeight)) {
						img.className = "push";

						that.images.splice(i, 1);

						length = that.images.length;

						i--;
					}
				}
			};

		that.modal.elm.find(".container").on("scroll", function(now) {
			clearTimeout(timeout);

			if (now === true) {
				poll();
			}
			else {
				timeout = setTimeout(poll, 100);
			}
		});

		cb();
	});
};

iChrome.Themes.refresh = function() {
	var custom = $.extend(true, {}, {themes: iChrome.Storage.themes}).themes;

	custom.forEach(function(e, i) {
		custom[i] = $.extend({}, iChrome.Themes.defaults, e);

		custom[i].id = i;

		custom[i].custom = true;
	});

	this.custom = custom;

	var container = this.modal.elm.find(".container").html(iChrome.render("themes.listing", {
		themes: custom.concat(this.themes)
	}));

	this.images = this.modal.elm.find(".theme .push").toArray();

	container.triggerHandler("scroll", [true]);
};

iChrome.Themes.Custom = function() {
	this.Custom.spectrum(this.Custom.modal.elm
		.html(iChrome.render("themes.custom", iChrome.Themes.defaults))
		.find("#color"));

	this.editing = false;

	this.Custom.modal.show();
};

iChrome.Themes.Custom.handlers = function(modal) {
	var that = this;

	modal.elm.on("keydown", "input:not([type=radio], [type=checkbox]), textarea, select", function(e) {
		if (e.which == 13) {
			e.preventDefault();

			that.save();
		}
	}).on("click", ".btn.save", function(e) {
		e.preventDefault();

		that.save();
	}).on("click", ".btn.preview", function(e) {
		e.preventDefault();

		var image, upload,
			cb = function(url) {
				var body = $(document.body);

				body.attr("data-style", body.attr("style")).attr("style", "").css({
					backgroundColor: $("#color").val(),
					backgroundSize: $("#scaling").val(),
					backgroundRepeat: $("#repeat").val(),
					backgroundAttachment: $("#fixed").val(),
					backgroundPosition: $("#position").val(),
					backgroundImage: "url(\"" + (url || "") + "\")"
				});

				iChrome.Themes.overlay.addClass("visible").one("click", function() {
					$(".modal.previewHidden, .modal-overlay.previewHidden").removeClass("previewHidden").addClass("visible");

					body.attr("style", body.attr("data-style")).attr("data-style", "");
				}.bind(body));

				$(".modal.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
			};

		if (image = $("#image").val()) {
			cb(image);
		}
		else if ((upload = $("#upload")[0].files).length) {
			var fr = new FileReader();

			fr.onloadend = function() {
				if (fr.error) {
					cb();
				}
				else {
					cb(fr.result);
				}
			};

			fr.readAsDataURL(upload[0]);
		}
		else {
			cb();
		}
	}).on("change", "#color, #image, #upload, #position, #scaling, #repeat", function() {
		var image, upload,
			cb = function(url) {
				that.modal.elm.find(".preview").first().css({
					backgroundColor: $("#color").val(),
					backgroundSize: $("#scaling").val(),
					backgroundRepeat: $("#repeat").val(),
					backgroundAttachment: $("#fixed").val(),
					backgroundPosition: $("#position").val(),
					backgroundImage: "url(\"" + (url || "") + "\")"
				});
			};

		if (image = $("#image").val()) {
			cb(image);
		}
		else if ((upload = $("#upload")[0].files).length) {
			var fr = new FileReader();

			fr.onloadend = function() {
				if (fr.error) {
					cb();
				}
				else {
					cb(fr.result);
				}
			};

			fr.readAsDataURL(upload[0]);
		}
		else {
			cb();
		}
	});
};

iChrome.Themes.Custom.spectrum = function(jq) {
	var preview = this.modal.elm.find(".preview")[0];

	return jq.spectrum({
		showInput: true,
		showAlpha: true,
		showInitial: true,
		showButtons: false,
		preferredFormat: "rgb",
		clickoutFiresChange: true,
		move: function(color) {
			preview.style.backgroundColor = color;
		}
	});
};

iChrome.Themes.Custom.cache = function(theme, id, cb) {
	if (theme.image.indexOf("data:") == 0 || theme.image.indexOf("filesystem:") == 0 || theme.image.indexOf("/images") == 0) {
		theme.offline = true;

		return cb(theme);
	}

	var that = this,
		err = function(e) {
			if (e && e.name && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					iChrome.Themes.fs = fs;

					that.cache(theme, id, cb);
				}, err);
			}

			theme.image = false;

			cb(theme);
		},
		url = theme.image.parseUrl(),
		ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);

	if (ext && ext[1] && !ext[1].match(/^(jpg|png|gif|svg|webp|bmp)$/i)) {
		err();
	}

	if (!iChrome.Themes.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			iChrome.Themes.fs = fs;

			that.cache(theme, id, cb);
		}, err);
	}
	
	var fs = iChrome.Themes.fs,
		xhr = new XMLHttpRequest();

	xhr.open("GET", url);

	xhr.responseType = "blob";

	fs.root.getDirectory("Themes", { create: true }, function(tDir) {
		tDir.getDirectory("Custom", { create: true }, function(dir) {
			dir.getFile(id, { create: true }, function(fe) {
				xhr.onload = function(e) {
					if (xhr.status !== 200) {
						return err();
					}

					var blob = xhr.response;

					fe.createWriter(function(writer) {
						writer.onwrite = function(e) {
							theme.image = fe.toURL();

							theme.offline = true;

							cb(theme);
						};

						writer.onerror = err;

						writer.write(blob);
					}, err);
				};

				xhr.send();
			}, err);
		}, err);
	}, err);
};

iChrome.Themes.Custom.upload = function(theme, file, id, cb) {
	var that = this,
		err = function(e) {
			if (e && e.name && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					iChrome.Themes.fs = fs;

					that.upload(theme, file, id, cb);
				}, err);
			}

			theme.image = false;

			cb(theme);
		};

	if (!iChrome.Themes.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			iChrome.Themes.fs = fs;

			that.upload(theme, file, id, cb);
		}, err);
	}
	
	var fs = iChrome.Themes.fs;

	fs.root.getDirectory("Themes", { create: true }, function(tDir) {
		tDir.getDirectory("Custom", { create: true }, function(dir) {
			dir.getFile(id, { create: true }, function(fe) {
				var fr = new FileReader();

				fr.onloadend = function() {
					if (fr.error) {
						return err();
					}

					fe.createWriter(function(writer) {
						writer.onwrite = function(e) {
							theme.image = fe.toURL();

							theme.offline = true;

							cb(theme);
						};

						writer.onerror = err;

						writer.write(new Blob([fr.result], { type: file.type }));
					}, err);
				}

				fr.readAsArrayBuffer(file);
			}, err);
		}, err);
	}, err);
};

iChrome.Themes.Custom.deleteImg = function(id, cb) {
	var that = this,
		err = function(e) {
			if (e && e.name && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					iChrome.Themes.fs = fs;

					that.deleteImg(id, cb);
				}, err);
			}

			cb();
		};

	if (!iChrome.Themes.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			iChrome.Themes.fs = fs;

			that.deleteImg(id, cb);
		}, err);
	}
	
	var fs = iChrome.Themes.fs;

	fs.root.getDirectory("Themes", { create: true }, function(tDir) {
		tDir.getDirectory("Custom", { create: true }, function(dir) {
			dir.getFile(id, { create: false }, function(fe) {
				fe.remove(function() {
					cb();
				}, err);
			}, err);
		}, err);
	}, err);
};

iChrome.Themes.Custom.reEnumerate = function(id, cb) {
	var that = this,
		err = function(e) {
			if (e && e.name && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					iChrome.Themes.fs = fs;

					that.reEnumerate(id, cb);
				}, err);
			}

			cb();
		};

	if (!iChrome.Themes.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			iChrome.Themes.fs = fs;

			that.reEnumerate(id, cb);
		}, err);
	}
	
	var fs = iChrome.Themes.fs;

	fs.root.getDirectory("Themes", { create: true }, function(tDir) {
		tDir.getDirectory("Custom", { create: true }, function(dir) {
			var entries = [],
				rename = function() {
					var length = entries.length,
						done = 0;

					entries.forEach(function(e, i) {
						var nName = parseInt(e.name);

						if (nName && e.name > id && iChrome.Storage.themes[nName] && (nName + "").length == e.name.length) { // Name is just a number
							e.moveTo(dir, nName - 1, function(fe) {
								iChrome.Storage.themes[nName].image = fe.toURL();

								done++;

								if (done == length) {
									cb();
								}
							});
						}
					});
				},
				reader = dir.createReader();
			
			(function read() { // Recursive and self executing, necessary as per the specs
				reader.readEntries(function(results) {
					if (!results.length) {
						entries.sort(function(a, b) {
							return a.name < b.name ? -1 : a.name > b.name; // 400x faster than localeCompare
						});

						rename();
					}
					else {
						entries = entries.concat(Array.prototype.slice.call(results, 0));

						read();
					}
				}, err);
			})();
		}, err);
	}, err);
};

iChrome.Themes.Custom.edit = function(id) {
	if (iChrome.Storage.themes[id]) {
		var theme = $.extend(true, {}, iChrome.Themes.defaults, iChrome.Storage.themes[id]);

		theme.edit = true;

		this.spectrum(this.modal.elm
			.html(iChrome.render("themes.custom", theme))
			.find("#position").val(theme.position).end()
			.find("#scaling").val(theme.scaling).end()
			.find("#repeat").val(theme.repeat).end()
			.find("#color")).trigger("change");

		this.editing = id;

		this.modal.show();
	}
};

iChrome.Themes.Custom.save = function() {
	var theme = {},
		that = this,
		editing = typeof this.editing == "number",
		editId = editing ? this.editing : false,
		key, upload;

	this.modal.elm.find("form").serializeArray().forEach(function(e, i) {
		if (e.value) theme[e.name] = e.value;
	});

	var id = (editing ? editId : iChrome.Storage.themes.length),
		cb = function(theme) {
			theme = $.unextend(iChrome.Themes.defaults, theme);

			if (editing && iChrome.Storage.themes[editId]) {
				iChrome.Storage.themes[editId] = theme;
			}
			else {
				iChrome.Storage.themes.push(theme);
			}

			iChrome.Storage.sync();

			that.modal.hide();

			iChrome.Themes.refresh();

			_gaq.push(["_trackEvent", "Themes", (editing ? "Edit" : "Create"), "custom" + id]);
		};

	if (theme.image && typeof theme.image == "string") {
		try { // This is a user-provided URL, anything could happen
			this.cache(theme, id, cb);
		}
		catch(e) {
			alert("An error occurred while trying to cache the image you provided, please double-check the URL.");
		}
	}
	else if ((upload = $("#upload")[0].files).length) {
		try { // Again, who knows what could go wrong
			this.upload(theme, upload[0], id, cb);
		}
		catch(e) {
			alert("An error occurred while trying to upload the file you provided, please make sure that it's a reasonable size and an image.");
		}
	}
	else {
		theme.image = false;

		if (editing) { // If editing there might be a previously cached image, delete it.
			this.deleteImg(id, cb);
		}
		else {
			cb();
		}
	}
};

iChrome.Themes.defaults = {
	name: "New Theme",
	images: false,
	offline: false,
	time: false,
	rotating: false,
	resolution: false,
	color: "#EEE",
	position: "top center",
	scaling: "cover",
	repeat: "no-repeat",
	fixed: "scroll"
};


// Store
iChrome.Store = function() {
	$(".icon.widgets").on("click", function(e) {
		if (this.modal) {
			this.modal.show();
		}
		else {
			this.render();
		}
	}.bind(this.Store));
};

iChrome.Store.render = function() {
	var widgets = [];

	for (var key in Widgets) {
		var widget = Widgets[key];

		widgets.push({
			id: widget.id,
			name: widget.name,
			nicename: widget.nicename,
			desc: widget.desc,
			order: widget.order
		});
	}

	widgets.sort(function(a, b) {
		return a.order - b.order;
	});

	var modal = this.modal = new iChrome.Modal({
		html: "",
		classes: "store"
	}, function() {
		if (modal.modal.hasClass("detail")) {
			modal.modal.removeClass("detail");
		}
		else {
			modal.hide();
		}
	});

	modal.modal.find(".content").remove().end().append(iChrome.render("store", {
		widgets: widgets
	}));

	iChrome.Store.handlers();

	// Wait till end of current stack (repaints, etc.) so the transition is smooth.  This causes a slight delay but it's preferable to popping-in.
	setTimeout(modal.show, 0);
};

iChrome.Store.handlers = function() {
	var modal = this.modal;

	modal.modal.find(".widget").on("click", function(e) {
		var that = $(this),
			sizes = [],
			key;

		var widget = iChrome.Store.widget = {};

		$.extend(true, widget, Widgets[that.attr("data-id")]);

		widget.utils = {};

		$.extend(true, widget.utils, iChrome.Widgets.Utils);

		widget.config = widget.config || {
			size: widget.sizes[0]
		};

		widget.utils.name = widget.nicename;
		widget.utils.settings = widget.settings;
		widget.utils.size = widget.config.size;
		widget.utils.id = widget.id;

		widget.sizes.forEach(function(e, i) {
			sizes.push([e.toLowerCase(), e.slice(0, 1).toUpperCase() + e.slice(1).toLowerCase()]);
		});

		widget.elm = widget.utils.elm = modal.modal.find(".detail").html(
			iChrome.render("store-detail", {
				sizes: sizes,
				name: that.find("h2").first().text(),
				desc: iChrome.render("widgets." + widget.nicename + ".desc"),
				widget: '<section class="widget ' + widget.nicename + " " + widget.config.size + '"></section>'
			})
		).find("section.widget").first();

		widget.render.call(widget, true);

		modal.modal.addClass("detail").find(".detail .desc-container").sortable({
			group: "columns",
			itemSelector: "div",
			drop: false
		});
	});
};


// Getting Started
iChrome.Guide = function() {
	var widgets = [],
		defaults = [1, 2, 4, 6, 12],
		id, widget;

	for (id in Widgets) {
		widget = Widgets[id];

		if (defaults.indexOf(parseInt(id)) !== -1) {
			widgets.push({
				id: id,
				name: widget.name,
				desc: widget.desc
			});
		}
		else {
			widgets.push([id, widget.name, widget.desc]);
		}
	}

	var modal = this.Guide.modal = new iChrome.Modal({
		html: iChrome.render("getting-started", {
			id: chrome.app.getDetails().id,
			widgets: widgets,
			second: localStorage["installed"] !== "true"
		}),
		classes: "getting-started"
	}, function() {
		if (confirm("Are you sure you want to exit this guide?\r\nYou can show it again anytime by hitting \"Installation guide\" from the settings menu.")) {
			localStorage["installed"] = "false";

			modal.hide();
		}
	});

	if (window.UserVoice && window.UserVoice.scan) window.UserVoice.scan();

	modal.elm.on("click", ".btn:not(.disabled)", function(e) {
		e.preventDefault();

		var elm = $(this),
			page = elm.parents(".tab").first().removeClass("active")[elm.hasClass("prev") ? "prev" : "next"]();

		if (page.length) {
			page.addClass("active");
		}
		else {
			modal.hide();

			if (localStorage["installed"] == "true") {
				iChrome.Storage.tabs[0].columns = iChrome.Guide.getPage();
			}

			localStorage["installed"] = "false";

			iChrome.Tabs.save();

			iChrome.refresh();
		}
	});

	modal.show();

	_gaq.push(["_trackPageview", "/guide"]);
};

iChrome.Guide.getPage = function() {
	var widgets = [],
		columns = [[], [], []],
		columnWeights = [0, 0, 0];

	this.modal.elm.find("form").serializeArray().forEach(function(e, i) {
		var id = parseInt(e.name.split("widget-")[1]),
			widget = (Widgets[id] || { size: 3, config: { size: "medium" } });

		if (!widget.config) {
			widget.config = {
				size: "medium"
			};
		}
		else if (!widget.config.size) {
			widget.config.size = (widget.sizes || ["medium"])[0];
		}

		widgets.push([id, widget.size, widget.config.size ]);
	});

	widgets.sort(function(a, b) {
		return b[1] - a[1];
	}).forEach(function(e, i) {
		if (Widgets[e[0]]) {
			var minWeight = Math.min.apply(Math, columnWeights),
				smallest = columnWeights.lastIndexOf(minWeight);

			columns[smallest].push({
				id: e[0],
				size: e[2]
			});

			columnWeights[smallest] += e[1];
		}
	});

	return columns;
};


// What's New
iChrome.WhatsNew = function() {
	var dialog = iChrome.WhatsNew.dialog = $(iChrome.render("whats-new")).appendTo(document.body);

	dialog.find(".close").on("click", function(e) {
		e.preventDefault();

		localStorage["whatsNew"] = "false";

		dialog.removeClass("visible");
	});

	dialog.find("a").on("click", function(e) {
		localStorage["whatsNew"] = "false";

		dialog.removeClass("visible");
	});

	dialog.addClass("visible");
};


// Donate
iChrome.Donate = function() {
	var modal = this.Donate.modal = new iChrome.Modal({
		html: iChrome.render("donate"),
		classes: "donate",
		width: 950,
		height: 530
	});

	modal.elm.find(".paypal").on("click", function() {
		var link = document.createElement("a");

		link.setAttribute("href", "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=L6P25ZLBKAGMG");
		link.setAttribute("target", "_blank");

		link.click();

		_gaq.push(["_trackEvent", "Donate", "PayPal", iChrome.uid]);
	});

	modal.elm.find(".bitcoin").on("click", function() {
		prompt("Please send Bitcoins to:", "1LoVCTBLBGbgFxchXtt7MhNov1VD1yrMYu");

		_gaq.push(["_trackEvent", "Donate", "Bitcoin", iChrome.uid]);
	});

	modal.elm.find(".litecoin").on("click", function() {
		prompt("Please send Litecoins to:", "LWUgLkXhbVromJzxkL82wPidBV8Fq9pC3p");

		_gaq.push(["_trackEvent", "Donate", "Litecoin", iChrome.uid]);
	});

	modal.elm.find(".dogecoin").on("click", function() {
		prompt("Please send much Doge to:", "DMiN376ndrx8gZivpNiREGnPMZHPc65aSq");

		_gaq.push(["_trackEvent", "Donate", "Dogecoin", iChrome.uid]);
	});
};


// Updated
iChrome.Updated = function() {
	var modal = this.Updated.modal = new iChrome.Modal({
		html: iChrome.render("updated"),
		classes: "updated"
	}, function() {
		localStorage["updated"] = "false";

		modal.hide();
	});

	modal.elm.on("click", ".btn.ok", function(e) {
		e.preventDefault();

		localStorage["updated"] = "false";

		modal.hide();
	});

	modal.show();
};


// Help needed
iChrome.HelpUs = function() {
	var close = function() {
			if (confirm("Please reconsider!\r\nEven if you can only give a few dollars, everything helps.")) {
				modal.elm.find(".btn.ok").click();
			}
			else {
				localStorage["help"] = "false";

				modal.hide();
			}
		},
		modal = this.HelpUs.modal = new iChrome.Modal({
			width: 950,
			height: 565,
			html: iChrome.render("help"),
			classes: "help"
		}, close);

	modal.elm.on("click", ".btn.ok", function(e) {
		e.preventDefault();

		modal.elm.find(".donate").addClass("visible");

		$(this).addClass("hidden");
	}).on("click", ".btn.no", function(e) {
		e.preventDefault();

		close();
	});

	modal.elm.find(".paypal").on("click", function() {
		var link = document.createElement("a");

		link.setAttribute("href", "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=L6P25ZLBKAGMG");
		link.setAttribute("target", "_blank");

		link.click();

		modal.hide();
		localStorage["help"] = "false";

		_gaq.push(["_trackEvent", "DonateHelp", "PayPal", iChrome.uid]);
	});

	modal.elm.find(".bitcoin").on("click", function() {
		prompt("Please send Bitcoins to:", "1LoVCTBLBGbgFxchXtt7MhNov1VD1yrMYu");

		modal.hide();
		localStorage["help"] = "false";

		_gaq.push(["_trackEvent", "DonateHelp", "Bitcoin", iChrome.uid]);
	});

	modal.elm.find(".litecoin").on("click", function() {
		prompt("Please send Litecoins to:", "LWUgLkXhbVromJzxkL82wPidBV8Fq9pC3p");

		modal.hide();
		localStorage["help"] = "false";

		_gaq.push(["_trackEvent", "DonateHelp", "Litecoin", iChrome.uid]);
	});

	modal.elm.find(".dogecoin").on("click", function() {
		prompt("Please send Dogecoins to:", "DMiN376ndrx8gZivpNiREGnPMZHPc65aSq");

		modal.hide();
		localStorage["help"] = "false";

		_gaq.push(["_trackEvent", "DonateHelp", "Dogecoin", iChrome.uid]);
	});

	modal.show();
};


// Templates
iChrome.render = function(template, data) {
	var compiled = iChrome.Templates.cache[template];

	if (!compiled) {
		if (iChrome.Templates.raw[template]) {
			try {
				compiled = iChrome.Templates.cache[template] = Hogan.compile(iChrome.Templates.raw[template]);
			}
			catch (e) {
				iChrome.Status.error("An error occurred while trying to render the " + template + " template!")
			}
		}

		if (!compiled) {
			return "Template not found!";
		}
	}
	
	return compiled.render(data || {});
};

iChrome.Templates = function(cb) {
	$("template").each(function() {
		iChrome.Templates.raw[this.id.substr(9)] = this.innerHTML;
	}).remove();
};

iChrome.Templates.cache = {};

iChrome.Templates.raw = {};


// Tabs
iChrome.Tabs = function() {
	var sizes = {
			1: "tiny",
			2: "small",
			3: "medium",
			4: "large",
			5: "variable",
			tiny: "tiny",
			small: "small",
			medium: "medium",
			large: "large",
			variable: "variable"
		},
		emptyTab = [];

	for (var i = iChrome.Storage.settings.columns.split("-")[0]; i > 0; i--) {
		emptyTab.push([]);
	}

	iChrome.Tabs.panel = $(".tabs-menu .panel ul").sortable({
		handle: ".move",
		itemSelector: "li",
		placeholder: "<li class=\"holder\"/>",
		onDragStart: function(item, container, _super) {
			item.css({
				height: item.outerHeight(),
				width: item.outerWidth()
			}).addClass("dragged").siblings("[data-id=new]").remove();

			//$(document.body).addClass("dragging");
		},
		onDrag: function(item, position, _super) {
			var ctx = $(item.context);

			position.top -= ctx.position().top + 10;
			position.left -= ctx.position().left + 10;

			item.css(position);
		},
		onDrop: function(item, container, _super) {
			_super(item, container);

			var newtabs = [],
				tab,
				set = false;

			$(".tabs-menu .panel ul").sortable("serialize").toArray().forEach(function(e, i) {
				if (tab = iChrome.Storage.tabs[e - 1]) {
					tab.id = i + 1;

					if (!set && iChrome.Storage.settings.def == e) {
						iChrome.Storage.settings.def = tab.id;

						set = true;
					}

					newtabs.push(tab);
				}
			});

			iChrome.Storage.tabs = newtabs;

			iChrome.Tabs.save();

			iChrome.refresh();

			var menu = $(".tabs-menu"),
				panel = menu.find(".panel"),
				elms = menu.find("*");

			$(document.body).on("click.tabs", function(e) {
				if (!elms.is(e.target)) {
					panel.removeClass("visible");

					$(document.body).off("click.tabs");
				}
			});

			panel.addClass("visible");
		},
		serialize: function(item, children, isContainer) {
			if (isContainer) {
				return children;
			}
			else {
				if (item.attr("data-id") !== "new") return parseInt(item.attr("data-id"));
			}
		},
	});

	iChrome.Storage.tabs.forEach(function(e, i) {
		var tab = $.extend(true, {}, iChrome.Tabs.defaults, {
			alignment: iChrome.Storage.settings.alignment,
			theme: iChrome.Storage.settings.theme,
			fixed: iChrome.Storage.settings.columns.split("-")[1] == "fixed"
		}, e);

		tab.columns = [];

		(e.columns || emptyTab).forEach(function(e, n) {
			var column = [];

			e.forEach(function(e, i) {
				var widget = {};

				$.extend(true, widget, Widgets[e.id], e);

				if (e.data) widget.data = e.data;
				if (e.syncData) widget.syncData = e.syncData;

				widget.config.size = sizes[widget.size];

				widget.utils = {};

				$.extend(true, widget.utils, iChrome.Widgets.Utils);

				widget.utils.name = widget.nicename;
				widget.utils.settings = widget.settings;
				widget.utils.size = sizes[widget.size];
				widget.utils.id = widget.id;

				widget.internalID = iChrome.Widgets.active.length;

				column.push(widget);

				iChrome.Widgets.active.push(widget);
			});

			tab.columns.push(column);
		});

		iChrome.Storage.tabs[i] = tab;
	});

	iChrome.Status.log("Tabs init done, rendering");

	iChrome.Tabs.render();
};

iChrome.Tabs.parent = $(".tab-container");

iChrome.Tabs.render = function() {
	var container = iChrome.Tabs.parent.html('<div class="tab-nav"><nav class="prev"></nav><nav class="next"></nav></div>'),
		panel = iChrome.Tabs.panel.html(""),
		sizes = {
			1: "tiny",
			2: "small",
			3: "medium",
			4: "large",
			5: "variable",
			tiny: "tiny",
			small: "small",
			medium: "medium",
			large: "large",
			variable: "variable"
		};

	iChrome.Storage.tabs.forEach(function(tab, i) {
		var tabElm = $(
				'<div class="tab' +
					(i == (parseInt(iChrome.Storage.settings.def || 1) - 1) ? " active" : "") +
					(tab.medley ? " medley" : "") +
				'"><main class="widgets-container' +
					(tab.fixed && !tab.medley ? " fixed" : "") +
					(tab.alignment == "left" ? " left" : tab.alignment == "right" ? " right" : "") +
				'"></main></div>'
			).appendTo(container),
			widgetContainer = tabElm.find(".widgets-container");

		$('<li></li>').attr("data-id", tab.id).text(tab.name).append('<span class="move">&#xE693;</span>').appendTo(panel);

		if (i == (parseInt(iChrome.Storage.settings.def || 1) - 1)) {
			tabElm.attr("data-id", tab.id).add(document.body).attr("style", iChrome.Tabs.getCSS(tab));
		}
		else {
			tabElm.attr("data-id", tab.id).attr("style", iChrome.Tabs.getCSS(tab));
		}

		tab.columns.forEach(function(e, i) {
			if (tab.medley) {
				var column = widgetContainer;
			}
			else {
				var column = $('<div class="column"></div>').appendTo(widgetContainer);
			}

			e.forEach(function(widget, i) {
				widget.elm = widget.utils.elm = $('<section class="widget"></section>')
					.addClass(widget.nicename).addClass(sizes[widget.size])
					.attr("data-name", widget.nicename).attr("data-size", sizes[widget.size]).attr("data-id", widget.internalID)
				.appendTo(column);

				if (tab.medley && widget.loc) {
					widget.elm.css({
						top: widget.loc[0] * 10,
						left: widget.loc[1] * 10,
						width: widget.loc[2] * 10 - 1,
						height: widget.loc[3] * 10 - 1
					});

					widget.utils.medley = true;
				}

				if (widget.config) {
					widget.config.size = sizes[widget.size];
				}

				if (widget.interval) {
					clearInterval(widget.rInterval);

					widget.rInterval = setInterval(widget.refresh.bind(widget), widget.interval);
				}

				try {
					widget.render.call(widget);
				}
				catch (e) {
					iChrome.Status.error("An error occurred while trying to render the " + widget.name + " widget!");
				}
			});
		});

		
		if (tab.medley) {
			var max = tabElm.height(),
				h;

			widgetContainer.find(".widget").each(function() {
				h = this.offsetTop + this.offsetHeight;

				if (h >= max) { max = h; }
			});

			widgetContainer.css("height", max);
		}
	});

	panel.append('<li data-id="new">New Tab...</li>');

	iChrome.Status.log("Tabs rendering done, initializing dragging");
};

iChrome.Tabs.draggable = function() {
	var timeout, grid, gridMax,
		onGrid = false,
		tcOTop = 0,
		tcHeight = 0,
		body = $(document.body),
		scroll = {
			getViewport: function() {
				return {
					top: document.body.scrollTop,
					left: document.body.scrollLeft,
					width: document.body.offsetWidth,
					height: window.innerHeight
				};
			},
			interval: "",
			init: function() {
				var viewport = this.getViewport(),
					scrolling = 

				body.mousemove(function(e) {
					var x = e.pageX,
						y = e.pageY;


					if (x > (viewport.top + viewport.height - 60)) {
						scrollVert();
					}
					else if (item.offsetTop < (viewport.top)) {
						this.interval = setInterval(function() {
							var viewport = this.getViewport();
							
							if (item.offsetTop < (viewport.top)) {
								document.body.scrollTop -= 5;
							}
							else clearInterval(this.interval);
						}.bind(this), 15);
					}
				});

				$(".next").on("mouseenter", rscroll);
				$(".prev").on("mouseenter", lscroll);
				$(".next,.prev").on("mouseleave", function() {
					$(document.body).stop();
				});
				
				function rscroll() {
					$(document.body).animate({
						scrollLeft: "+=25"
					}, 10, rscroll);
				}
				
				function lscroll() {
					$(document.body).animate({
						scrollLeft: "-=25"
					}, 10, lscroll);
				}
			},
			destroy: function() {
				clearInterval(this.interval);
			}
		};
	

	$("body > .remove, .widgets-container .column, .medley .widgets-container").sortable({
		group: "columns",
		handle: ".handle",
		itemSelector: "section",
		dynamicDimensions: true,
		placeholder: "<section class=\"placeholder\"/>",
		onDragStart: function(item, container, _super) {
			var css = {
				height: item[0].offsetHeight,
				width: item[0].offsetWidth,
				minWidth: item[0].offsetWidth,
				maxWidth: item[0].offsetWidth
			};

			if (item.hasClass("handle")) {
				var sizes = {
						tiny: 1,
						small: 2,
						medium: 3,
						large: 4,
						variable: 5
					},
					widget = iChrome.Store.widget;

				item.clone().insertAfter(item);


				widget.size = sizes[item.attr("data-size")];

				iChrome.Widgets.active.push(widget);

				widget.internalID = iChrome.Widgets.active.length - 1;

				iChrome.Store.modal.modal.find(".detail .desc-container").last().data("sortable").group.item = item =
					widget.elm
						.attr("class", "widget")
						.addClass("handle")
						.addClass(widget.nicename)
						.addClass(item.attr("data-size"))
						.attr("data-name", widget.nicename)
						.attr("data-size", item.attr("data-size"))
						.attr("data-id", widget.internalID);


				widget.utils.size = item.attr("data-size");

				if (widget.config) {
					widget.config.size = item.attr("data-size");
				}

				if (widget.interval) {
					widget.interval = setInterval(widget.refresh.bind(widget), widget.interval);
				}

				try {
					widget.render.call(widget);

					if (widget.refresh) {
						widget.refresh.call(widget);
					}
				}
				catch (e) {
					iChrome.Status.error("An error occurred while trying to render the " + widget.name + " widget!");
				}


				css = {
					height: widget.elm.outerHeight(),
					width: widget.elm.outerWidth(),
					minWidth: widget.elm.outerWidth(),
					maxWidth: widget.elm.outerWidth()
				};

				item.replaceWith(widget.elm);

				iChrome.Store.modal.hide().modal.removeClass("detail");

				_gaq.push(["_trackEvent", "Widgets", "Install", widget.nicename]);
			}

			item.before('<section id="originalLoc"></section>').css(css).addClass("dragged").appendTo("body > .widgets-container");

			var tc = $(document.body).addClass("dragging").children(".tab-container")[0];

			tcOTop = tc.offsetTop;
			tcHeight = tc.offsetHeight;

			// scroll.init();
		},
		onDrag: function(item, position, _super) {
			if (item.context) {
				position.top -= item.context.offsetTop;
				position.left -= item.context.offsetLeft;
			}

			if (onGrid) {
				position.left = 10 * Math.round(position.left / 10); // Rounded to nearest 10
				position.top = 10 * Math.round((position.top - tcOTop) / 10) + tcOTop;

				var max = position.top + item[0].offsetHeight - tcOTop;

				if (gridMax > max) {
					max = gridMax;
				}

				grid[0].style.height = (max + 50) + "px";
			}

			item[0].style.top = position.top + "px";
			item[0].style.left = position.left + "px";
		},
		onBeforeDrop: function(item, placeholder, group, _super) {
			if (placeholder.parent() && placeholder.parent().is(".remove")) {
				if (item.hasClass("handle") || confirm("Are you really sure you would like to delete this widget?\r\nThis action is not reversible and all data from this widget will be permanently lost.")) {
					item.remove();

					if (!item.hasClass("handle")) {
						_gaq.push(["_trackEvent", "Widgets", "Uninstall", item.attr("data-name")]);
					}
				}
				else {
					item.insertBefore("#originalLoc");

					var widget = iChrome.Widgets.active[item.attr("data-id")];

					if (widget && widget.loc) {
						item.css({
							top: widget.loc[0] * 10,
							left: widget.loc[1] * 10,
							width: widget.loc[2] * 10 - 1,
							height: widget.loc[3] * 10 - 1
						});

						item.isMoved = true;
					}
				}

				return false;
			}

			return true;
		},
		onDrop: function(item, container, _super) {
			// scroll.destroy();

			if (item.isMoved) {
				var css = {
					top: item.css("top"),
					left: item.css("left"),
					width: item.css("width"),
					height: item.css("height")
				};
			}
			else {
				var css = {
					top: item.position().top - tcOTop,
					left: item.position().left,
					width: Math.round(item.outerWidth() / 10) * 10 - 1,
					height: Math.round(item.outerHeight() / 10) * 10 - 1
				};
			}

			_super(item, container);

			if (item.parent().parent().hasClass("medley")) {
				item.css(css);

				(iChrome.Widgets.active[item.attr("data-id")] || {utils:{}}).utils.medley = true;

				if (!item.children(".resize").length) {
					item.append('<div class="resize"></div>');
				}
			}
			else {
				(iChrome.Widgets.active[item.attr("data-id")] || {utils:{}}).utils.medley = false;

				item.children(".resize").remove();
			}

			if (item.parent().length && item.hasClass("handle")) {
				try {
					iChrome.Widgets.active[item.attr("data-id")].render();
				}
				catch (e) {
					iChrome.Status.error("An error occurred while trying to render the " + iChrome.Widgets.active[item.attr("data-id")].name + " widget!");
				}

				item.removeClass("handle");
			}

			$("#originalLoc").remove();

			iChrome.Storage.tabs = iChrome.Tabs.serialize();

			iChrome.Tabs.save();
		},
		afterMove: function(placeholder, container) {
			if (container.el[0].className.indexOf("widgets-container") == -1) {
				onGrid = false;

				placeholder.width(container.group.item.outerWidth());
				placeholder.height(container.group.item.outerHeight());

				if (container.group.item.hasClass("tiny")) {
					placeholder.addClass("tiny");
				}
				else {
					placeholder.removeClass("tiny");
				}
			}
			else {
				onGrid = true;

				grid = container.el;

				gridMax = tcHeight - 50;

				var h;

				[].forEach.call(grid[0].querySelectorAll(".widget"), function(e) {
					h = e.offsetTop + e.offsetHeight;

					if (h >= gridMax) { gridMax = h; }
				});
			}
		}
	});

	$("body > .remove").sortable({
		drag: false
	});

	$(".tab-container").on("keydown", function(e) {
		if (e.which == 37) iChrome.Tabs.Nav("prev");
		else if (e.which == 39) iChrome.Tabs.Nav("next");
	}).on("keydown", ".widgets-container .widget", function(e) {
		if (!$(this).hasClass("dragged")) e.stopPropagation();
	});

	iChrome.Status.log("Dragging done");
};

iChrome.Tabs.getCSS = function(tab) {
	var css = "";

	if (tab.theme) {
		if (typeof tab.theme == "object") {
			var theme = tab.theme;
		}
		else if (tab.theme == "default") {
			var theme = {
				image: "/images/defaulttheme.jpg"
			};
		}
		else {
			var theme = (iChrome.Storage.cached[tab.theme] || iChrome.Storage.themes[tab.theme.replace("custom", "")] || {});
		}
		
		if (theme.color) {
			css += "background-color: " + theme.color + ";";
		}

		if (theme.image) {
			css += "background-image: url(\"" + theme.image + "\");";
		}

		if (theme.scaling) {
			css += "background-size: " + theme.scaling + ";";
		}

		if (theme.position) {
			css += "background-position: " + theme.position + ";";
		}

		if (theme.repeat) {
			css += "background-repeat: " + theme.repeat + ";";
		}

		if (theme.fixed) {
			css += "background-attachment: " + theme.fixed + ";";
		}

		if (theme["inline-css"]) {
			css += theme["inline-css"];
		}
	}
	
	return css;
};

iChrome.Tabs.serialize = function() {
	var tabs = [];

	$(".tab-container .tab").each(function() {
		var elm = $(this),
			tab = $.extend(true, {}, iChrome.Storage.tabs[elm.attr("data-id") - 1]);

		tab.columns = [];

		if (tab.medley) {
			tab.columns.push([]);

			elm.find(".widget").each(function() {
				var that = $(this);

				var widget = iChrome.Widgets.active[that.attr("data-id")];

				widget.loc = [Math.round(that.position().top / 10), Math.round(that.position().left / 10), Math.round(that.outerWidth() / 10), Math.round(that.outerHeight() / 10)];

				if (widget.loc[0] < 0) {
					widget.loc[0] = 0;
				}

				if (widget.loc[1] < 0) {
					widget.loc[1] = 0;
				}

				tab.columns[0].push(widget);
			});
		}
		else {
			elm.find(".widgets-container > .column").each(function() {
				var column = [];

				$(this).find(".widget").each(function() {
					column.push(iChrome.Widgets.active[$(this).attr("data-id")]);
				});

				tab.columns.push(column);
			});
		}

		tabs.push(tab);
	});

	return tabs;
};

iChrome.Tabs.save = function(noSync) {
	try {
		var local = [],
			sync = [];

		iChrome.Storage.tabs.forEach(function(t, i) {
			var tab = {},
				stab = {},
				allowed = ["id", "size", "syncData", "loc"],
				t = $.unextend({
					alignment: iChrome.Storage.settings.alignment,
					theme: iChrome.Storage.settings.theme,
					fixed: iChrome.Storage.settings.columns.split("-")[1] == "fixed"
				}, $.unextend(iChrome.Tabs.defaults, t));

			for (var key in t) {
				if (key !== "columns") {
					tab[key] = stab[key] = t[key];
				}
				else {
					tab.columns = [];
					stab.columns = [];

					t.columns.forEach(function(c, i) {
						var column = [],
							scolumn = [];

						c.forEach(function(w, i) {
							var widget = {},
								swidget = {};

							for (var wkey in w) {
								if (allowed.indexOf(wkey) !== -1) {
									widget[wkey] = swidget[wkey] = w[wkey];
								}
								else if (wkey == "data") {
									widget[wkey] = w[wkey];
								}
								else if (wkey == "config") {
									var config = {};

									for (var ckey in w.config) {
										if (ckey !== "size") config[ckey] = w.config[ckey];
									}

									config = $.unextend(Widgets[w.id].config, config);

									if (JSON.stringify(config) !== "{}") widget.config = swidget.config = config;
								}
							}

							column.push(widget);
							scolumn.push(swidget);
						});

						tab.columns.push(column);
						stab.columns.push(scolumn);
					});

					tab.columns.slice(0, t.columns.length);
				}
			}

			local.push(tab);
			sync.push(stab);
		});

		chrome.storage.local.set({
			tabs: local
		});

		iChrome.Storage.Originals.tabs = local;

		if (!noSync) {
			iChrome.Storage.tabsSync = sync;

			iChrome.Storage.sync();
		}
	}
	catch (e) {
		iChrome.Status.error(e);
	}
};

iChrome.Tabs.syncTimeout = "";
iChrome.Tabs.saveTimeout = "";

iChrome.Tabs.defaults = {
	name: "Home",
	fixed: true,
	theme: "default",
	alignment: "center"
};


iChrome.Tabs.Nav = function(which) {
	var last = iChrome.Tabs.Nav.last,
		current = iChrome.Tabs.Nav.current,
		newTab = 1;

	if (which == "next") {
		newTab = current + 1;

		if (newTab > last) newTab = 1;
	}
	else if (which == "prev") {
		newTab = current - 1;

		if (newTab < 1) newTab = last;
	}
	else if (typeof which == "number" && which <= last && which > 0) {
		newTab = which;
	}

	iChrome.Tabs.Nav.current = newTab;

	iChrome.Tabs.panel.find("li.active").removeClass("active").end().find("li[data-id='" + newTab + "']").addClass("active");

	var style = iChrome.Tabs.parent.find(".tab.active").removeClass("active").end().find(".tab[data-id='" + newTab + "']").addClass("active").attr("style");

	if (document.body.getAttribute("style") !== style) {
		document.body.setAttribute("style", style);
	}
};

iChrome.Tabs.Nav.current = 1;

iChrome.Tabs.Nav.buttons = function() {
	if (iChrome.Tabs.Nav.last == 1) {
		$(".tab-container").addClass("one-tab");
	}

	var timeout;

	$(".tab-container").on("click", ".tab-nav > nav", function() {
		iChrome.Tabs.Nav($(this).attr("class"));
	}).on("mouseover", ".tab-nav > nav", function() {
		if ($(document.body).hasClass("dragging")) {
			timeout = setTimeout(function() {
				iChrome.Tabs.Nav($(this).attr("class"));
			}.bind(this), 500);
		}
	}).on("mouseout", ".tab-nav > nav", function() {
		clearTimeout(timeout);
	});
};


iChrome.Tabs.Menu = function() {
	var createTab = function() {
			var modal = new iChrome.Modal({
					width: 400,
					height: 210,
					classes: "new-tab",
					html: iChrome.render("new-tab")
				}),
				create = function(e) {
					e.preventDefault();
						modal.hide();

					var id = iChrome.Storage.tabs[iChrome.Storage.tabs.length - 1].id + 1,
						tab = {
							id: id,
							name: modal.elm.find("input").val()
						};
					
					iChrome.Storage.tabs.push($.extend(true, {}, iChrome.Tabs.defaults, tab));
					
					$('<li></li>').attr("data-id", tab.id).text(tab.name).insertBefore(iChrome.Tabs.panel.find("li").last());

					_gaq.push(["_trackEvent", "Tabs", "Add", iChrome.Storage.tabs.length + ""]);
					
					iChrome.Tabs.save();
					
					iChrome.refresh();
				};

				modal.elm.on("click", ".create", create).on("keydown", "input", function(e) {
					if (e.which == 13) {
						create(e);
					}
				}).find("#tab-name").focus();

				modal.show();
		},
		timeout;

	$(".tabs-menu").on("click", function() {
		var panel = $(this).find(".panel");

		if (!panel.hasClass("visible")) {
			var elms = $(this).find("*");

			$(document.body).on("click.tabs", function(e) {
				if (!elms.is(e.target)) {
					panel.removeClass("visible");

					$(document.body).off("click.tabs");
				}
			});

			panel.addClass("visible");
		}
		else {
			$(document.body).off("click.tabs");

			panel.removeClass("visible");
		}
	}).on("click", ".panel li", function() {
		var id = $(this).attr("data-id");

		if (id !== "new") {
			iChrome.Tabs.Nav(parseInt(id));
		}
		else {
			createTab();
		}
	}).on("mouseover", ".panel li", function() {
		var id = $(this).attr("data-id");

		if ($(document.body).hasClass("dragging") && id !== "new") {
			timeout = setTimeout(function() {
				iChrome.Tabs.Nav(parseInt(id));
			}, 500);
		}
	}).on("mouseout", ".panel li", function() {
		clearTimeout(timeout);
	});
};


// Widgets
iChrome.Widgets = {};

iChrome.Widgets.active = [];

iChrome.Widgets.refresh = function() {
	iChrome.Widgets.active.forEach(function(widget, i) {
		if (widget.refresh) {
			widget.refresh.call(widget);
		}
	});
};


// Widget settings
iChrome.Widgets.Settings = function() {
	this.Settings.modal = new iChrome.Modal({
		width: 400,
		height: 500,
		html: iChrome.render("widget-settings"),
		classes: "widget-settings"
	});

	this.Settings.form = this.Settings.modal.elm.find("form");

	var save = function(e) {
		e.preventDefault();

		this.modal.hide();

		var settings = {},
			sizes = {
				tiny: 1,
				small: 2,
				medium: 3,
				large: 4,
				variable: 5
			};

		this.form.serializeArray().forEach(function(e, i) {
			settings[e.name.replace("widget-", "")] = e.value;
		});

		if (settings.size && this.widget.config.size && this.widget.config.size !== settings.size) {
			this.widget.elm.attr("class", "widget").addClass(this.widget.nicename).addClass(settings.size).attr("data-size", settings.size);

			this.widget.size = sizes[settings.size];
			this.widget.utils.size = settings.size;
		}

		this.widget.config = $.extend(this.widget.config, settings);
		
		if (this.widget.refresh) this.widget.refresh(true);
		else this.widget.render();

		this.widget.utils.saveConfig(settings);
	}.bind(this.Settings);

	this.Settings.modal.elm.on("click", ".btn.save", save).on("keydown", "input, textarea, select", function(e) {
		if (e.which == 13) save(e);
	});

	$(".tab-container").on("click", ".widget .settings", function(e) {
		iChrome.Widgets.Settings.show($(this).parent().first().attr("data-id"));
	});
};

iChrome.Widgets.Settings.show = function(widget) {
	if (typeof widget !== "undefined" && iChrome.Widgets.active[widget] && iChrome.Widgets.active[widget].settings) {
		widget = iChrome.Widgets.active[widget];

		this.widget = widget;

		this.getHTML(widget, this.form.html(""));

		this.modal.show();
	}
};

iChrome.Widgets.Settings.inputs = {
	text: function(input, elm) {
		var template = '<label for="widget-{{nicename}}">{{label}}{{{help}}}</label>' +
			'<input type="text" class="form-control" id="widget-{{nicename}}" name="widget-{{nicename}}" placeholder="{{placeholder}}" value="{{value}}" />';

		var html = template
			.replace(/{{label}}/g,		this.escape(input.label))
			.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
			.replace(/{{nicename}}/g,	this.escape(input.nicename))
			.replace(/{{value}}/g,		this.escape(input.value))
			.replace(/{{placeholder}}/g,this.escape(input.placeholder));

		elm.html(html);
	},
	select: function(input, elm, widget) {
		var template =
			'<label for="widget-{{nicename}}">{{label}}{{{help}}}</label>' +

			'<select class="form-control" id="widget-{{nicename}}" name="widget-{{nicename}}" {{multiple}}>' + 
				'{{options}}' + 
			'</select>',
			iterate = function(options, level) {
				var html = "",
					level = level || 0;

				for (var option in options) {
					if (option == "label") {
						continue;
					}
					else if (typeof options[option] == "object") {
						html += '<optgroup label="' + Array(level + 1).join("&nbsp;&nbsp;&nbsp;&nbsp;") + this.escape(options[option].label) + '"></optgroup>';

						html += iterate(options[option], level + 1);
					}
					else {
						html += '<option value="' + this.escape(option) + '"' + (option == input.value ? " selected" : "") + '>' + Array(level + 1).join("&nbsp;&nbsp;&nbsp;&nbsp;") + this.escape(options[option]) + '</option>';
					}
				}

				return html;
			}.bind(this);

		if (typeof input.options == "string") {
			if (typeof widget[input.options] == "function") {
				if (typeof input.chained == "string") {
					var that = this;

					elm.parent().on("change", "#widget-" + input.chained, function() {
						widget[input.options](function(options) {
							var val = elm.find("select").val();

							elm.html(template
								.replace(/{{label}}/g,		this.escape(input.label))
								.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
								.replace(/{{multiple}}/g,	(input.multiple ? "multiple" : ""))
								.replace(/{{nicename}}/g,	this.escape(input.nicename))
								.replace(/{{options}}/g,	iterate.call(this, options || {})));

							if ((typeof val == "string" && elm.find("option[value='" + val.replace("'", "") + "']").length) || val) {
								elm.find("select").val(val);
							}
						}.bind(that), $(this).val());
					}).find("#widget-" + input.chained).change();
				}
				else {
					widget[input.options].call(widget, function(options) {
						elm.html(template
							.replace(/{{label}}/g,		this.escape(input.label))
							.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
							.replace(/{{multiple}}/g,	(input.multiple ? "multiple" : ""))
							.replace(/{{nicename}}/g,	this.escape(input.nicename))
							.replace(/{{options}}/g,	iterate.call(this, options || {})));
					}.bind(this));
				}
			}
		}
		else {
			elm.html(template
				.replace(/{{label}}/g,		this.escape(input.label))
				.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
				.replace(/{{multiple}}/g,	(input.multiple ? "multiple" : ""))
				.replace(/{{nicename}}/g,	this.escape(input.nicename))
				.replace(/{{options}}/g,	iterate.call(this, input.options || {})));
		}

		elm.find("select").change();
	},/*
	multiple: function(input, elm, widget) {
		var template =
			'<label for="widget-{{nicename}}">{{label}}{{{help}}}</label>' +

			'<div class="multiple">' + 
				'{{checkboxes}}' + 
			'</div>',
			iterate = function(options) {
				var html = "";

				for (var option in options) {
					html += '<label><input type="checkbox" value="' + this.escape(option) + '"' + (option == input.value ? " checked" : "") + ' />&nbsp;' + this.escape(options[option]) + '</label>';
				}

				return html;
			}.bind(this);

		if (typeof input.options == "string") {
			if (typeof widget[input.options] == "function") {
				if (typeof input.chained == "string") {
					var that = this;

					elm.parent().on("change", "#widget-" + input.chained, function() {
						widget[input.options](function(options) {
							var val = elm.find("select").val();

							elm.html(template
								.replace(/{{label}}/g,		this.escape(input.label))
								.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
								.replace(/{{multiple}}/g,	(input.multiple ? "multiple" : ""))
								.replace(/{{nicename}}/g,	this.escape(input.nicename))
								.replace(/{{options}}/g,	iterate.call(this, options || {})));

							if (val && elm.find("option[value='" + val.replace("'", "") + "']").length) elm.find("select").val(val);
						}.bind(that), $(this).val());
					}).find("#widget-" + input.chained).change();
				}
				else {
					widget[input.options].call(widget, function(options) {
						elm.html(template
							.replace(/{{label}}/g,		this.escape(input.label))
							.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
							.replace(/{{multiple}}/g,	(input.multiple ? "multiple" : ""))
							.replace(/{{nicename}}/g,	this.escape(input.nicename))
							.replace(/{{options}}/g,	iterate.call(this, options || {})));
					}.bind(this));
				}
			}
		}
		else {
			elm.html(template
				.replace(/{{label}}/g,		this.escape(input.label))
				.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
				.replace(/{{multiple}}/g,	(input.multiple ? "multiple" : ""))
				.replace(/{{nicename}}/g,	this.escape(input.nicename))
				.replace(/{{options}}/g,	iterate.call(this, input.options || {})));
		}

		elm.find("select").change();
	},*/
	size: function(input, elm, widget) {
		var template =
			'<label for="widget-size">Widget Size</label>' +
			'<select class="form-control" id="widget-size" name="widget-size">{{options}}</select>',
			options = "";

		var sizes = widget.sizes;

		if (sizes.indexOf("all") !== -1) {
			sizes = ["tiny", "small", "medium", "large"];
		}

		sizes.forEach(function(size, i) {
			options += '<option value="' + this.escape(size.toLowerCase()) + '"' + (size.toLowerCase() == (widget.config.size || sizes[0]).toLowerCase() ? " selected" : "") + '>' + this.escape(size.slice(0, 1).toUpperCase() + size.slice(1).toLowerCase()) + '</option>';
		});

		elm.html(template.replace(/{{options}}/g,	options));
	},
	radio: function(input, elm) {
		var template =
			'<label>{{label}}{{{help}}}</label>' +
			'<div>{{radios}}</div>',
			radios = "",
			i = 0;

		for (var radio in input.options) {
			radios +=
				'<label class="checkbox-inline">' +
					'<input type="radio" name="widget-{{nicename}}" value="' + this.escape(radio) + '"' + (radio == input.value ? " checked" : "") + ' /> ' + this.escape(input.options[radio]) + 
				'</label>';

			i++;
		}

		elm.html(template
			.replace(/{{radios}}/g,		radios)
			.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
			.replace(/{{label}}/g,		this.escape(input.label))
			.replace(/{{nicename}}/g,	this.escape(input.nicename)));
	},
	number: function(input, elm) {
		var template =
			'<label for="widget-{{nicename}}">{{label}}{{{help}}}</label>' +
			'<input type="number" id="widget-{{nicename}}" name="widget-{{nicename}}" class="form-control" min="{{min}}" max="{{max}}" value="{{value}}" />';

		var input = elm.html(template
			.replace(/{{label}}/g,		this.escape(input.label))
			.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
			.replace(/{{nicename}}/g,	this.escape(input.nicename))
			.replace(/{{min}}/g,		this.escape(input.min))
			.replace(/{{max}}/g,		this.escape(input.max))
			.replace(/{{value}}/g,		this.escape(input.value)))
			.find("input")[0],
			ctrlDown = false;
			
		input.onkeydown = function(e) {
			if (e.keyCode == 17) {
				ctrlDown = true;
			}

			return	ctrlDown ||
					((e.keyCode > 47 && e.keyCode < 58) ||
					(e.keyCode > 36 && e.keyCode < 41) ||
					(e.keyCode > 95 && e.keyCode < 106) ||
					e.keyCode == 8 ||
					e.keyCode == 9 ||
					e.keyCode == 46 ||
					e.keyCode == 17 ||
					e.keyCode == 65);
		};

		input.onkeyup = function(e) {
			if (e.keyCode == 17) {
				ctrlDown = false;
			}
		};

		input.onblur = function(e) {
			if (input.valueAsNumber && input.valueAsNumber > input.max) {
				input.value = input.max;
			}
			else if (input.valueAsNumber && input.valueAsNumber < input.min) {
				input.value = input.min;
			}
			else if (!input.valueAsNumber && input.value != "") {
				input.value = input.min;
			}
		};
	},
	time: function(input, elm) {
		var template =
			'<label for="widget-{{nicename}}">{{label}}{{{help}}}</label>' +
			'<input type="time" class="form-control" name="widget-{{nicename}}" id="widget-{{nicename}}" value="{{value}}" />';

		elm.html(template
			.replace(/{{label}}/g,		this.escape(input.label))
			.replace(/{{{help}}}/g,		(input.help ? '<div class="help" data-tooltip="' + this.escape(input.help) + '"></div>' : ""))
			.replace(/{{nicename}}/g,	this.escape(input.nicename))
			.replace(/{{value}}/g,		this.escape(input.value)));
	},
	escape: function(str) {
		// Based off of Hogan.js' escape method

		var amp		= /&/g,
			lt		= /</g,
			gt		= />/g,
			apos	= /\'/g,
			quot	= /\"/g,
			brace	= /\{/g,
			all		= /[&<>\{\"\']/,
			str		= String(str || "");

		if (all.test(str)) {
			return str.replace(amp, "&amp;").replace(lt, "&lt;").replace(gt, "&gt;").replace(apos, "&#39;").replace(quot, "&quot;").replace(brace, "&#123;");
		}
		else {
			return str;
		}
	}
};

iChrome.Widgets.Settings.getHTML = function(widget, form) {
	widget.settings.forEach(function(input, i) {
		if (typeof iChrome.Widgets.Settings.inputs[input.type] == "function" && ((input.sizes || ["all"]).indexOf(widget.config.size) !== -1 || (input.sizes || ["all"]).indexOf("all") !== -1)) {
			var elm = $('<div class="form-group"></div>').appendTo(form);

			if (typeof widget.config[input.nicename] !== "undefined") {
				input.value = widget.config[input.nicename];
			}

			try {
				iChrome.Widgets.Settings.inputs[input.type](input, elm, widget);
			}
			catch (e) {
				iChrome.Status.error(e);
			}
		}
	});
};


// Utilities available to widgets
iChrome.Widgets.Utils = {};

iChrome.Widgets.Utils.error = function(msg) {
	iChrome.Status.error("An error occurred in the " + this.name + " widget: " + msg);
};

iChrome.Widgets.Utils.saveConfig = function(config) {
	clearTimeout(iChrome.Tabs.syncTimeout);

	iChrome.Tabs.syncTimeout = setTimeout(function() {
		iChrome.Tabs.syncTimeout = null;

		iChrome.Tabs.save();
	}, 200);
};

iChrome.Widgets.Utils.saveData = function(data) {
	clearTimeout(iChrome.Tabs.saveTimeout);

	iChrome.Tabs.saveTimeout = setTimeout(function() {
		iChrome.Tabs.saveTimeout = null;

		iChrome.Tabs.save(true);
	}, 200);
};

iChrome.Widgets.Utils.render = function(data) {
	data = $.extend({}, data || {});

	data[this.size] = true;

	this.elm.html('<div class="handle"></div>' + (this.settings ? '\r\n<div class="settings">&#xF0AD;</div>' : "") + iChrome.render("widgets." + this.name, data) + (this.medley ? '\r\n<div class="resize"></div>' : ""));
};


// Storage Manager
iChrome.Storage = function(cb) {
	chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
		iChrome.Storage.tabs = d.tabs || iChrome.Storage.Defaults.tabs;
		iChrome.Storage.themes = d.themes || iChrome.Storage.Defaults.themes;
		iChrome.Storage.cached = d.cached || iChrome.Storage.Defaults.cached;
		iChrome.Storage.settings = {};

		if (typeof d.tabs == "string") {
			try {
				iChrome.Storage.tabs = JSON.parse(d.tabs);
			}
			catch(e) {
				alert("An error occurred while trying to load your homepage, please try again or reinstall iChrome.");
			}
		}

		$.extend(true, iChrome.Storage.settings, iChrome.Storage.Defaults.settings, d.settings || iChrome.Storage.Defaults.settings);

		iChrome.Storage.tabsSync = JSON.parse(iChrome.Storage.getJSON(iChrome.Storage.tabs));

		iChrome.Storage.Originals.tabs = JSON.parse(JSON.stringify(iChrome.Storage.tabs));

		if (typeof cb == "function") {
			try {
				cb();
			}
			catch(e) {
				console.error(e.stack);
			}
		}
	});
};

iChrome.Storage.timeout = "";

iChrome.Storage.sync = function(now) {
	iChrome.Status.log("Starting sync save");

	clearTimeout(iChrome.Storage.timeout);

	var save = function() {
		iChrome.Storage.timeout = null;

		var sync = {},
			local = {};

		sync.themes = local.themes = iChrome.Storage.themes;
		sync.settings = local.settings = iChrome.Storage.settings;
		sync.tabs = iChrome.Storage.tabsSync;
		sync.lastChanged = new Date().getTime() + "-" + iChrome.uid;

		var arr = chunk(JSON.stringify(sync.tabs), 2000); // Less than half the max item size since it has to re-escape quotes, etc.

		arr.forEach(function(e, i) {
			sync["tabs" + (i ? i : "")] = e;
		});

		chrome.storage.sync.get(function(d) {
			var max = 0,
				key;

			for (key in d) {
				if (key.indexOf("tabs") == 0 && max < key.substr(4) || 0) {
					max = (key.substr(4) || 0);
				}
			}

			if (max >= arr.length) {
				var keys = [];

				for (var i = arr.length; i <= max; i++) {
					keys.push("tabs" + i);
				}

				chrome.storage.sync.remove(keys);
			}
		});

		chrome.storage.sync.set(sync);
		chrome.storage.local.set(local);

		chrome.storage.sync.getBytesInUse(function(bytes) {
			if ((bytes / chrome.storage.sync.QUOTA_BYTES) > 0.90) {
				alert(
					"You have used more than 90% of the total synchronized storage space available.\r\nIf" + 
					" you reach the limit, iChrome will stop syncing your data and may stop working.\r\n" + 
					"You can shrink the amount of space you use by deleting custom themes, notes and to-" + 
					"do lists you don't use."
				);
			}
		});
	},
	chunk = function(str, size) {
		str = str || "";
		size = size || 4;

		var slength = str.length,
			chunks = [];

		for (var i = size; i < slength; i += size) {
			chunks.push(str.slice(i - size, i));
		}

		chunks.push(str.slice(slength - (size - slength % size)));

		return chunks;
	};

	if (!now) iChrome.Storage.timeout = setTimeout(save, 2000);
	else save();
};

iChrome.Storage.getJSON = function(tabs) {
	var stabs = [];

	tabs.forEach(function(t, i) {
		var tab = {},
			allowed = ["id", "size", "syncData", "loc"],
			key;

		for (key in t) {
			if (key !== "columns") {
				tab[key] = t[key];
			}
			else {
				tab.columns = [];

				t[key].forEach(function(c, i) {
					var column = [];

					c.forEach(function(w, i) {
						var widget = {},
							wkey;

						for (wkey in w) {
							if (allowed.indexOf(wkey) !== -1) {
								widget[wkey] = w[wkey];
							}
							else if (wkey == "config") {
								var config = {};

								for (var ckey in w.config) {
									if (ckey !== "size") config[ckey] = w.config[ckey];
								}

								config = $.unextend(Widgets[w.id].config, config);

								if (JSON.stringify(config) !== "{}") widget.config = config;
							}
						}

						column.push(widget);
					});

					tab.columns.push(column);
				});
			}
		}

		tab = $.unextend({
			alignment: iChrome.Storage.settings.alignment,
			theme: iChrome.Storage.settings.theme,
			fixed: iChrome.Storage.settings.columns.split("-")[1] == "fixed"
		}, $.unextend(iChrome.Tabs.defaults, tab));

		stabs.push(tab);
	});

	return JSON.stringify(stabs);
};

iChrome.Storage.Originals = {};

iChrome.Storage.Defaults = {
	tabs: [
		{
			columns: [
				[
					{
						id: 9,
						size: 1
					}, {
						id: 14,
						size: 1
					}, {
						id: 1,
						size: 3
					}
				], [
					{
						id: 11,
						size: 5
					}, {
						id: 17,
						size: 5
					}
				], [
					{
						id: 4,
						size: 4
					}
				]
			],
			id: 1,
			name: "Home"
		}
	],
	settings: {
		links: [],
		ok: false,
		tabs: true,
		apps: true,
		plus: true,
		stab: false,
		voice: true,
		gmail: true,
		toolbar: false,
		wcolor: "#FFF",
		theme: "default",
		hcolor: "#F1F1F1",
		columns: "3-fixed",
		alignment: "center",
		"custom-css": "",
		"logo-url": "/images/logo.png",
		"search-url": "https://google.com/search?q=%s"
	},
	themes: [],
	cached: {}
};


// Search
iChrome.Search = function() {
	iChrome.Search.box = $(".search input");
	iChrome.Search.Suggestions.elm = $(".search .suggestions");

	$(".search .btn").click(function(e) {
		iChrome.Search.submit();
	});

	var box = iChrome.Search.box;

	box.keydown(function(e) {
		if (e.which == 13) iChrome.Search.submit();
	}).bind("input", function() {
		var val = this.value.trim();

		if (val !== "") iChrome.Search.Suggestions(val);
		else iChrome.Search.Suggestions.hide();
	}).focusin(function() {
		var val = this.value.trim();

		if (val !== "") iChrome.Search.Suggestions(val);
	}).focusout(iChrome.Search.Suggestions.hide);

	iChrome.Search.Suggestions.setHandlers();
	//iChrome.Search.Speech();
};

iChrome.Search.submit = function(val) {
	var searchURL = (iChrome.Storage.settings["search-url"] || "https://www.google.com/search?q=%s"),
		val = val || this.box.val().trim();

	var link = document.createElement("a");

	link.setAttribute("href", searchURL.replace("%s", encodeURIComponent(val)));

	if (iChrome.Storage.settings.stab) link.setAttribute("target", "_blank");

	link.click();
};

iChrome.Search.Speech = function() {
	var btn = $(".search .speech");

	btn.on("click", function(e) {
		this.restart();

		this.setText("Listening...");
		
		this.overbar.addClass("visible");

		this.inProgress = true;

		this.recognition.onstart = function() {
			this.recognition.onstart = null;

			this.setText("Listening...");
		}.bind(this);
	}.bind(this.Speech));

	this.Speech.recognition = new webkitSpeechRecognition();

	this.Speech.recognition.continuous = true;
	this.Speech.recognition.interimResults = true;

	this.Speech.recognition.onspeechstart = function() {
		if (this.inProgress) {
			this.startAnimation();

			this.listening = true;
		}
	}.bind(this.Speech);

	this.Speech.recognition.onspeechend = function() {
		if (this.inProgress) {
			this.stopAnimation();

			this.listening = false;

			this.setText(this.text);
		}
	}.bind(this.Speech);

	this.Speech.recognition.onresult = function(e) {
		if (iChrome.Storage.settings.ok && !this.inProgress) {
			for (var i = e.resultIndex; i < e.results.length; i++) {
				if (e.results[i][0].confidence > 0.2 && this.isOK(e.results[i][0].transcript)) {
					btn.click();
				}
			}
		}
		else if (this.inProgress) {
			for (var i = e.results.length; i >= 0; i--) {
				if (e.results[i] && e.results[i][0].confidence > 0.2) {
					this.text = e.results[i][0].transcript.trim();

					this.setText(this.text);

					if (e.results[i].isFinal) {
						this.stop();

						this.setText("Searching for: " + this.text);

						this.recognition.onend = function() {
							this.setText("Searching for: " + this.text);

							iChrome.Search.submit(this.text);
						}.bind(this);
					}
				}
			}
		}
	}.bind(this.Speech);

	if (iChrome.Storage.settings.ok) this.Speech.start();
};

iChrome.Search.Speech.text = "";
iChrome.Search.Speech.listening = false;
iChrome.Search.Speech.inProgress = false;

iChrome.Search.Speech.overbar = $("body > .voicebar, body > .speech-overlay").on("click", "button, .text a", function(e) {
	e.preventDefault();

	if (iChrome.Search.Speech.listening && !$(this).is("a")) {
		iChrome.Search.Speech.overlay.click();
	}
	else {
		iChrome.Search.Speech.restart();
	}
});

iChrome.Search.Speech.textElm = iChrome.Search.Speech.overbar.find(".text");
iChrome.Search.Speech.button = iChrome.Search.Speech.overbar.find("button");

iChrome.Search.Speech.overlay = $("body > .speech-overlay").add("body > .voicebar .close").on("click", function() {
	this.recognition.onspeechend();

	this.inProgress = false;

	this.overbar.removeClass("visible");

	if (iChrome.Storage.settings.ok) {
		this.restart();
	}
	else {
		this.stop();
	}
}.bind(iChrome.Search.Speech)).end();

iChrome.Search.Speech.setText = function(text) {
	if (text && text !== "") this.textElm.text(text);
	else this.textElm.html('Didn\'t get that. <a>Try Again</a>');
};

iChrome.Search.Speech.timeout = "";

iChrome.Search.Speech.animate = function() {
	var val = Math.round((0.1 + 0.7 * Math.random()) * 40),
		speed = Math.round(200 + 500 * Math.random()) / 4;

	iChrome.Search.Speech.button
		.css("box-shadow", "0 0 0 " + val + "px #E5E5E5, 0 0 1px " + (val + 1) + "px rgba(0, 0, 0, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.3)")
		.css("transition-duration", speed + "ms");

	this.timeout = setTimeout(this.animate, speed);
}.bind(iChrome.Search.Speech);

iChrome.Search.Speech.startAnimation = function() {
	this.timeout = setTimeout(this.animate, 0);
};

iChrome.Search.Speech.stopAnimation = function() {
	clearTimeout(this.timeout);

	iChrome.Search.Speech.button.css("box-shadow", "").css("transition-duration", "");
};

iChrome.Search.Speech.start = function() {
	this.recognition.start();
};


iChrome.Search.Speech.restart = function() {
	try {
		this.recognition.start();
	}
	catch (e) {
		this.recognition.onend = function() {
			this.recognition.onend = null;

			this.start();
		}.bind(this);

		this.recognition.abort();
	}
};

iChrome.Search.Speech.stop = function() {
	this.recognition.abort();
};

iChrome.Search.Speech.isOK = function(str) {
	arr = str.toLowerCase().split(" ");

	for (var i = arr.length - 1; i >= 0; i--) {
		var word = arr[i].replace(/[^A-z0-9]/ig, "");

		if (word.indexOf("google") !== -1 || word.indexOf("okay") !== -1 || word == "ok" || word == "computer") {
			return true;
		}
	};

	return false;
};

iChrome.Search.Suggestions = function() {
	$.getJSON("https://www.google.com/complete/search?callback=?", {
		hl: navigator.language,
		jsonp: "iChrome.Search.Suggestions.load",
		q: this.box.val(),
		client: "youtube"
	});
};

iChrome.Search.Suggestions.show = function() {
	iChrome.Search.Suggestions.elm.addClass("visible");

	iChrome.Search.Suggestions.visible = true;
};

iChrome.Search.Suggestions.hide = function() {
	iChrome.Search.Suggestions.elm.removeClass("visible");

	iChrome.Search.Suggestions.visible = false;
};

iChrome.Search.Suggestions.load = function(resp) {
	if (iChrome.Search.box.val().trim() == "") return;

	var html = "",
		entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
			"/": "&#x2F;"
		},
		num = 1;

	html += "<div class=\"active\">" + iChrome.Search.box.val().replace(/[&<>"'\/]/g, function(s) {
		return entityMap[s];
	}) + "</div>";

	resp[1].forEach(function(e, i) {
		if (num > 10) return;

		if (e[0] !== iChrome.Search.box.val()) {
			html += "<div>" + e[0].replace(/[&<>"'\/]/g, function(s) {
				return entityMap[s];
			}) + "</div>";

			num++;
		}
	});

	this.current = 0;

	this.elm.html(html);

	this.show();
};

iChrome.Search.Suggestions.current = false;

iChrome.Search.Suggestions.visible = false;

iChrome.Search.Suggestions.setFocus = function(which) {
	var elm = this.elm,
		current = this.current;

	if (which == "next") {
		this.clearFocus(true);

		var e = elm.find("div").eq((current || 0) + 1).addClass("active");

		if (!e.length) {
			elm.find("div:first").addClass("active");

			current = 0;
		}

		this.current = (current || 0) + 1;
	}
	else if (which == "prev") {
		this.clearFocus(true);

		elm.find("div").eq((current || 0) - 1).addClass("active");

		this.current = (current || 0) - 1;
	}
	else if (typeof which == "number") {
		this.clearFocus();

		elm.find("div").eq(which).addClass("active");

		this.current = which;
	}
};

iChrome.Search.Suggestions.clearFocus = function(skipVar) {
	this.elm.find("div.active").removeClass("active");

	if (!skipVar) this.current = false;
};

iChrome.Search.Suggestions.setHandlers = function() {
	iChrome.Search.box.keydown(function(e) {
		if (!iChrome.Search.Suggestions.visible) return;

		if (e.which == 38) {
			e.preventDefault();

			iChrome.Search.Suggestions.setFocus("prev");

			iChrome.Search.box.val(
				iChrome.Search.Suggestions.elm.find("div").eq(
					iChrome.Search.Suggestions.current || 0
				).text()
			);
		}
		else if (e.which == 40) {
			e.preventDefault();

			iChrome.Search.Suggestions.setFocus("next");

			iChrome.Search.box.val(
				iChrome.Search.Suggestions.elm.find("div").eq(
					iChrome.Search.Suggestions.current || 0
				).text()
			);
		}
	});

	this.elm.on("click", function(e) {
		var target = $(e.target);

		if (target.is("div")) {
			iChrome.Search.box.val(target.text());
			iChrome.Search.submit();
		}
	});
};

// Run everything

iChrome.Status.log("Main JS loaded and processed, starting storage fetching");

iChrome.Storage(function() {
	iChrome.Status.log("Storage fetching complete");

	iChrome.Templates();

	iChrome.Status.log("Templates done");

	iChrome();
});

window.onload = function() {
	iChrome.Status.log("Window load fired");
};