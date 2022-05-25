const presence = new Presence({
	clientId: "977756675647897650"
});

let browsingTimestamp = Math.floor(Date.now() / 1000);
let prevUrl = document.location.href;

let smallImageKeys: { [name: string]: string } = {
	UP: "status-ok",
	HASISSUES: "status-down",
	UNDERMAINTENANCE: "status-notice"
};

presence.on("UpdateData", async () => {
	const [showTimestamp, showButtons, logo] = await Promise.all([
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

	if (document.location.href !== prevUrl) {
		prevUrl = document.location.href;
		browsingTimestamp = Math.floor(Date.now() / 1000);
	}
	switch (document.location.hostname) {
		case "instat.us": {
			let pageHeader = document.querySelector("head>title").textContent;
			let pageStatus = document.querySelector(
				".main-status__wrapper>div>div>h2"
			).textContent;
			const statics: {
				[name: string]: PresenceData;
			} = {
				"/": {
					details: `Viewing ${pageHeader}`,
					state: `${pageStatus}`,
					smallImageKey:
						smallImageKeys[
							document
								.querySelector("#__NEXT_DATA__")
								.textContent.match(
									`"status":"(?<status>UP|HASISSUES|UNDERMAINTENANCE)"`
								)
								.groups["status"].valueOf()
						],
					smallImageText: pageStatus,
					buttons: [
						{
							label: `View status`,
							url: `${prevUrl}`
						}
					]
				},
				"/history/": {
					details: "Viewing Instatus status history",
					state: `${pageHeader} ${pageStatus}`,
					smallImageKey:
						smallImageKeys[
							document
								.querySelector("#__NEXT_DATA__")
								.textContent.match(
									`"status":"(?<status>UP|HASISSUES|UNDERMAINTENANCE)"`
								)
								.groups["status"].valueOf()
						],
					smallImageText: pageStatus,
					buttons: [
						{
							label: `View status history`,
							url: `${prevUrl}`
						}
					]
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
				) {
					presenceData = { ...presenceData, ...v };
				}
			}
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
					details: "Viewing the gallery"
				},
				"/help": {
					details: "Reading the documentation",
					state: `${location.href
						.replace(/https:\/\/instatus.com\/help\/?(api\/?)?/, "")
						.replace("/", " > ")
						.replace("-", " ")}`,
					buttons: [
						{
							label: "Open documentation",
							url: location.href
						}
					]
				},
				"/help/api/": {
					details: "Reading the api documentation"
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
				) {
					presenceData = { ...presenceData, ...v };
				}
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
				"/get": {
					details: "Viewing the dashboard",
					state: "Creating a new statuspage"
				},
				"/profile": {
					details: "Viewing the dashboard",
					state: "In profile settings"
				},
				"/notifications": {
					details: "Viewing the dashboard",
					state: "In notification settings"
				},
				"/developer": {
					details: "Viewing the dashboard",
					state: "In developer settings"
				},
				"/settings": {
					details: "Viewing the dashboard",
					state: "In advanced settings"
				},
				"/login": {
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
				) {
					presenceData = { ...presenceData, ...v };
				}
			}
			break;
		}
		default: {
			try {
				presenceData.largeImageKey = document
					.querySelector("div.z-20.large-header__logo img")
					.getAttribute("src")
					.replace(".svg", ".png");
			} catch (error) {
				presenceData.largeImageKey = presenceData.largeImageKey;
			}
			let pageHeader = document.querySelector("head>title").textContent;
			let pageStatus = document.querySelector(
				".main-status__wrapper>div>div>h2"
			).textContent;
			const statics: {
				[name: string]: PresenceData;
			} = {
				"/": {
					details: `Viewing ${pageHeader}`,
					state: "Main page",
					smallImageKey:
						smallImageKeys[
							document
								.querySelector("#__NEXT_DATA__")
								.textContent.match(
									`"status":"(?<status>UP|HASISSUES|UNDERMAINTENANCE)"`
								)
								.groups["status"].valueOf()
						],
					smallImageText: pageStatus,
					buttons: [
						{
							label: `View status`,
							url: `${document.location.href}`
						}
					]
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
				) {
					presenceData = { ...presenceData, ...v };
				}
			}
			break;
		}
	}
	if (!presenceData.buttons?.length) delete presenceData.buttons;
	if (!showButtons) delete presenceData.buttons;
	if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
