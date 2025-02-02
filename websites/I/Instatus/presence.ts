const presence = new Presence({
	clientId: "977756675647897650"
});

let browsingTimestamp = Math.floor(Date.now() / 1000),
	prevUrl = document.location.href,
	currentPresenceData: PresenceData = {};

//Just a function to compare if two PresenceData instances are the same. Used at the end of code//
const deepEqual = function (
		oldPresenceData: PresenceData,
		newPresenceData: PresenceData
	): boolean {
		if (newPresenceData.details != oldPresenceData.details) return false;
		else if (
			newPresenceData.state?.valueOf() != oldPresenceData.state?.valueOf()
		)
			return false;
		else if (
			newPresenceData.startTimestamp?.valueOf() !=
			oldPresenceData.startTimestamp?.valueOf()
		)
			return false;
		else if (
			newPresenceData.smallImageKey?.valueOf() !=
			oldPresenceData.smallImageKey?.valueOf()
		)
			return false;
		else if (
			newPresenceData.smallImageText?.valueOf() !=
			oldPresenceData.smallImageText?.valueOf()
		)
			return false;
		else if (newPresenceData.largeImageKey != oldPresenceData.largeImageKey)
			return false;
		else if (newPresenceData.buttons?.length != oldPresenceData.buttons?.length)
			return false;
		else if (newPresenceData.buttons?.length) {
			for (const [index, button] of newPresenceData.buttons.entries()) {
				if (button.label != oldPresenceData.buttons[index].label) return false;
				else if (button.url != oldPresenceData.buttons[index].url) return false;
				else return true;
			}
		} else return true;
	},
	ensureLength = function (
		value: string,
		length: number,
		replace?: string
	): string {
		if (value.length < length) return value;
		else {
			if (!replace) return `${value.substring(0, length - 3)}...`;
			return replace;
		}
	},
	defaultStatus = function (
		presenceData: PresenceData,
		largeImageKey?: string,
		onlyShowStatus?: boolean
	): PresenceData {
		if (!largeImageKey) {
			try {
				presenceData.largeImageKey = document
					.querySelector("div.z-20.large-header__logo img")
					.getAttribute("src")
					.replace(".svg", ".png");
			} catch (error) {
				// pass
			}
		} else presenceData.largeImageKey = largeImageKey;
		let status: string, smallImageText: string, url: string
		let statusString: string = "Main page"
		const statuses: {[name: string]: any} = {
			UP: "status-ok",
			HASISSUES: "status-down",
			UNDERMAINTENANCE: "status-notice"
		}
		try {
			status = document.querySelector("#__NEXT_DATA__").textContent.match(/"status":"(?<status>UP|HASISSUES|UNDERMAINTENANCE)/).groups.status.valueOf()
			statusString = smallImageText = document.querySelector(".main-status__wrapper>div>div>h2").textContent
			url = document.location.href
		} catch(error) {
			if (onlyShowStatus){
				var statusElement: HTMLElement
				try {
					statusElement = document.querySelector("div.flex.flex-col.items-center.justify-between.mt-16.lg\\:mt-24.lg\\:flex-row>div:nth-child(1)>div>a") || document.querySelector("div.mb-8.lg\\:mb-0.lg\\:w-1\\/3>div>a")
				} catch(error) {
					return presenceData
				}
				if (!statusElement){
					return presenceData
				}
				statusString = smallImageText = statusElement.innerText
				url = statusElement.getAttribute("href")
				var cList: DOMTokenList = statusElement.firstElementChild.classList
				for (var [c, s] of Object.entries({"bg-green": "UP", "bg-green-brand": "UP", "bg-red": "HASISSUES", "bg-red-brand": "HASISSUES", "bg-grey": "UNDERMAINTENANCE", "bg-grey-brand": "UNDERMAINTENANCE"})) {
					if (cList.contains(c)) {
						status = s.toString()
						break;
					}
				}
			}
			else {
				return presenceData
			}
		}
		// using this way so we can add other subpages later easily //
		const statics: PresenceData = {
				details: (onlyShowStatus) ? 'Privat mode': `Viewing ${document.querySelector("head>title").textContent.replace("Instatus - ", "")}`,
				state: statusString,
				smallImageKey: statuses[status],
				smallImageText: smallImageText,
				buttons: [
					{
						label: "View status",
						url: url
					}
				]
			};
		if (onlyShowStatus){
			delete statics.buttons
		}
		console.log((onlyShowStatus) ? 'Privat mode': `Viewing ${document.querySelector("head>title").textContent.replace("Instatus - ", "")}`)
		presenceData = { ...presenceData, ...statics };
		return presenceData
	};

presence.success("Succesful loaded presence");

if (document.location.href !== prevUrl) {
	prevUrl = document.location.href;
	browsingTimestamp = Math.floor(Date.now() / 1000);
}
presence.on("UpdateData", async () => {
	const [onlyShowStatus, showTimestamp, showButtons, logo] = await Promise.all([
		presence.getSetting<boolean>("onlyshowstatus"),
		presence.getSetting<boolean>("timestamp"),
		presence.getSetting<boolean>("buttons"),
		presence.getSetting<number>("logo")
	]);
	let presenceData: PresenceData = {
		largeImageKey:
			[
				"instatus_logo_white_big",
				"instatus-logo-white",
				"instatus-logo-white-bg",
				"instatus_logo_green_big",
				"instatus-logo-green",
				"instatus-logo-green-bg",
				"instatus_logo_black_big",
				"instatus-logo-black",
				"instatus-logo-black-bg"
			][logo] || "instatus-logo-white-bg"
	};
	if (onlyShowStatus) {
		presenceData = defaultStatus(presenceData, presenceData.largeImageKey, true)
	}
	else {
		switch (document.location.hostname) {
			case "instat.us": {
				presenceData = defaultStatus(presenceData, presenceData.largeImageKey);
				break;
			}

			case "instatus.com": {
				const statics: {
					[name: string]: PresenceData;
				} = {
					"/": {
						details: "Viewing the main page"
					},
					"/home": {
						details: "Viewing the main page"
					},
					"/gallery/": {
						details: "Viewing the gallery",
						buttons: [
							{
								label: "View gallery",
								url: document.location.href
							}
						]
					},
					"/why": {
						details: 'Reading "Why do you need a status page?"',
						smallImageKey: "reading",
						smallImageText: 'Reading "Why do you need a status page?"'
					},
					"/pricing": {
						details: 'Reading about the "pricing"'
					},
					"/open": {
						details: "Viewing the statistics"
					},
					"/policies/": {
						details: "Reading the policies",
						state: document.querySelector("head>title").textContent,
						buttons: [
							{
								label: `Read "${ensureLength(
									document
										.querySelector("head>title")
										.textContent.replace(" - Instatus help", ""),
									25
								)}"`,
								url: location.href
							}
						]
					},
					"/changes": {
						details: "Reading the changelog"
					},
					"/blog": {
						details: "Reading the blog"
					},
					"/blog/": {
						details: "Reading a blog post",
						state: document.querySelector("head>title").textContent,
						buttons: [
							{
								label: "Open poste",
								url: location.href
							}
						]
					},
					"/statuspage-alternative": {
						details: "Compering Instatus with Statuspage"
					},
					"/help": {
						details: "Reading the documentation",
						state:
							`${location.href
								.replace(/https:\/\/instatus.com\/help\/?(api\/?)?/, "")
								.replace("/", " > ")
								.replace("-", " ")}` || "Main page",
						smallImageKey: "reading",
						smallImageText: "Reading the documentation",
						buttons: [
							{
								label: "Open documentation",
								url: location.href
							}
						]
					},
					"/help/api/": {
						details: "Reading the API documentation",
						smallImageText: "Reading the API documentation"
					},
					"/careers": {
						details: "Vieving jobs"
					}
				};
				for (const [k, v] of Object.entries(statics)) {
					if (
						location.href
							.replace(/\/?$/, "/")
							.replace(`https://${document.location.hostname}`, "")
							.replace("?", "/")
							.replace("=", "/")
							.match(k)
					)
						presenceData = { ...presenceData, ...v };
				}
				break;
			}

			case "dashboard.instatus.com": {
				const statics: {
					[name: string]: PresenceData;
				} = {
					"/": {
						details: "Viewing the dashboard",
						state: "In teams"
					},
					"/[^/]+/[^/]+/$": {
						details: `Viewing dashboard of ${document.querySelectorAll("span>button>div>span").item(1).textContent.replace(".instatus.com", "")}`,
						state: document
							.querySelector("head>title")
							.textContent.replace("Instatus - ", ""),
						smallImageKey: `https://dashboard.instatus.com/${document
							.querySelector(
								`#team-item-${document.querySelectorAll("span>button>div>span").item(1).textContent.replace(".instatus.com", "")}>div>div>span:nth-child(1)>img`
							)
							.getAttribute("src")}`,
						smallImageText: document.querySelectorAll("span>button>div>span").item(1).textContent.replace(".instatus.com", ""),
						buttons: [
							{
								label: "View status page",
								url: `https://${document.querySelectorAll("span>button>div>span").item(1).textContent
								}`
							}
						]
					},
					"/get$": {
						details: "Viewing the dashboard",
						state: "Creating a new statuspage"
					},
					"/profile$": {
						details: "Viewing the dashboard",
						state: "In profile settings"
					},
					"/notifications$": {
						details: "Viewing the dashboard",
						state: "In notification settings"
					},
					"/developer$": {
						details: "Viewing the dashboard",
						state: "In developer settings"
					},
					"/settings$": {
						details: "Viewing the dashboard",
						state: "In advanced settings"
					},
					"/login$": {
						details: "Viewing the dashboard",
						state: "Loging in"
					}
				};
				for (const [k, v] of Object.entries(statics)) {
					if (
						location.href
							.replace(/\/?$/, "/")
							.replace(`https://${document.location.hostname}`, "")
							.replace("?", "/")
							.replace("=", "/")
							.match(k)
					)
						presenceData = { ...presenceData, ...v };
				}
				break;
			}
			default: {
				presenceData = defaultStatus(presenceData);
				break;
			}
		}	
	}
	if (!presenceData.buttons?.length) {
		presenceData.buttons = [
			{
				label: "Open Instatus.com",
				url: "https://instatus.com"
			}
		];
	}

	if (
		presenceData.details?.toLowerCase().includes("reading") &&
		!presenceData.smallImageKey
	) {
		presenceData.smallImageKey = "reading";
		presenceData.smallImageText = presenceData.details;
	}

	if (!showButtons || !presenceData.buttons?.length)
		delete presenceData.buttons;
	if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;

	if (!deepEqual(currentPresenceData, presenceData)) {
		currentPresenceData = { endTimestamp: null, ...presenceData };
		try {
			if (presenceData.details) {	
					presence.setActivity(presenceData);
					presence.info("Updated presence");
				}
				else presence.setActivity();
		}
		catch (error) {
			presence.error(error);
		}
	}
});