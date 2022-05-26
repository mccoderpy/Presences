const presence = new Presence({
	clientId: "977756675647897650",
	injectOnComplete: true
});

let browsingTimestamp = Math.floor(Date.now() / 1000),
	prevUrl = document.location.href,
	smallImageKeys: { [name: string]: string } = {
		UP: "status-ok",
		HASISSUES: "status-down",
		UNDERMAINTENANCE: "status-notice"
	};
let { endTimestamp, ...currentPresenceData }: PresenceData = {};

function defaultStatus(presenceData: PresenceData): PresenceData {
	try {
		presenceData.largeImageKey = document
			.querySelector("div.z-20.large-header__logo img")
			.getAttribute("src")
			.replace(".svg", ".png");
	} catch (error) {
		presenceData.largeImageKey = presenceData.largeImageKey;
	}
	// using this way so we can add other subpages later easily //
	const statics: {
		[name: string]: PresenceData;
	} = {
		"/": {
			details: `Viewing ${document.querySelector("head>title").textContent}`,
			state: "Main page",
			smallImageKey:
				smallImageKeys[
					document
						.querySelector("#__NEXT_DATA__")
						.textContent.match(
							/\"status\"\:\"(?<status>UP|HASISSUES|UNDERMAINTENANCE)/
						)
						.groups.status.valueOf()
				],
			smallImageText: document.querySelector(".main-status__wrapper>div>div>h2")
				.textContent,
			buttons: [
				{
					label: "View status",
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
		)
			presenceData = { ...presenceData, ...v };
	}
	return presenceData;
}

presence.success("Succesful loaded presence");
presence.error("You have not much sex");

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
	let hostname = document.location.hostname;
	switch (hostname) {
		case "instat.us": {
			presenceData = defaultStatus(presenceData);
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

	if (!presenceData.buttons?.length || !showButtons)
		delete presenceData.buttons;
	if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;

	if (presenceData.details) {
		if (JSON.stringify(presenceData) != JSON.stringify(currentPresenceData)) {
			currentPresenceData = { endTimestamp, ...presenceData };
			try {
				presence.setActivity(presenceData);
				presence.info("Updated presence");
			} catch (error) {
				presence.error(error);
			}
		}
	} else presence.setActivity();
});
