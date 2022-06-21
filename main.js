var fnar_url = "https://rest.fnar.net";
var fio_url = "https://fio.fnar.net";
var apikey = null;
var username = null;
var listenerCreated = false;
var fnar_is_admin = false;
var fnar_auth_token = "";
var port = null;

class MobileFIO
{
	loadInitial()
	{
		const url = window.location.href;
		if(url.slice(0, 35) == "https://apex.prosperousuniverse.com")
		{
			this.authenticate();
		}
		else
		{
			window.setTimeout(() => this.loadInitial(), 1000);
		}
	}
	
	authenticate()
	{
		var fiodata = JSON.parse(localStorage.getItem("fioinfo"));
		if(fiodata != null)
		{
			username = fiodata[0];
			apikey = fiodata[1];
			if(!listenerCreated)
			{
				this.connect();
				listenerCreated = true;
			}
		}
		else
		{
			username = null;
			apikey = null;
			fiodata = [null, null];
		}
		// Wait for authenticate buffer
		const container = document.getElementById("container");
		try
		{
			const buffer = container.firstChild.firstChild.children[1].children[1].firstChild.firstChild;
			if(buffer.firstChild.firstChild.textContent.toUpperCase().includes(" / XIT FIO"))
			{
				const tile = buffer.children[1].firstChild;
				tile.style.background = "#20314E";
				tile.style.position = "static";
				var namelabel;
				var nameinput;
				var apiinput;
				var apilabel;
				if(tile.children.length == 0)
				{
					namelabel = document.createElement("label");
					namelabel.textContent = "FIO Username";
					namelabel.style.fontSize = "14px";
					namelabel.style.color = "#ffffff";
					tile.appendChild(namelabel);
					nameinput = document.createElement("input");
					nameinput.style.backgroundColor = "#42361d";
					nameinput.style.borderBottom = "1px solid #8d6411";
					nameinput.style.padding = "2px";
					nameinput.style.marginBottom = "5px";
					nameinput.addEventListener("input", function(){
						fiodata[0] = nameinput.value || "";
						localStorage.setItem("fioinfo", JSON.stringify(fiodata));
					});
					if(username != null && username != undefined){nameinput.value = username;}
					tile.appendChild(nameinput);	
					apilabel = document.createElement("label");
					apilabel.style.color = "#ffffff";
					apilabel.textContent = "FIO API Key";
					apilabel.style.fontSize = "14px";
					tile.appendChild(apilabel);
					apiinput = document.createElement("input");
					apiinput.style.backgroundColor = "#42361d";
					apiinput.style.borderBottom = "1px solid #8d6411";
					apiinput.style.padding = "2px";
					apiinput.addEventListener("input", function(){
						fiodata[1] = apiinput.value || "";
						localStorage.setItem("fioinfo", JSON.stringify(fiodata));
					});
					if(apikey != null && apikey != undefined){apiinput.value = apikey;}
					tile.appendChild(apiinput);
				}
				else
				{
					namelabel = tile.children[0];
					nameinput = tile.children[1];
					apilabel = tile.children[2];
					apiinput = tile.children[3];
				}
			}
		} catch(error){console.error(error);}
		window.setTimeout(() => this.authenticate(), 1000);
	}

	connect()
	{
		var OrigWebSocket = window.WebSocket;
		var callWebSocket = OrigWebSocket.apply.bind(OrigWebSocket);
		var wsAddListener = OrigWebSocket.prototype.addEventListener;
		wsAddListener = wsAddListener.call.bind(wsAddListener);
		window.WebSocket = function WebSocket(url, protocols)
		{	
			var ws;
			if (!(this instanceof WebSocket))
			{
				// Called without 'new' (browsers will throw an error).
				ws = callWebSocket(this, arguments);
			}
			else if (arguments.length === 1)
			{
				ws = new OrigWebSocket(url);
			}
			else if (arguments.length >= 2)
			{
				ws = new OrigWebSocket(url, protocols);
			}
			else
			{
				ws = new OrigWebSocket();
			}

			wsAddListener(ws, 'message', function(event)
			{			
				try
				{
					ProcessMessage(event);
				}      
				catch(error)
				{
					console.error("FIO: Failed to process message");
				}
			});
			console.log("FIO: Message listener added");
			return ws;
		}.bind();
		
		window.WebSocket.prototype = OrigWebSocket.prototype;
		window.WebSocket.prototype.constructor = window.WebSocket;

		var wsSend = OrigWebSocket.prototype.send;
		wsSend = wsSend.apply.bind(wsSend);
		OrigWebSocket.prototype.send = function(data)
		{
			return wsSend(this, arguments);
		};

		port = chrome.runtime.connect(chrome.runtime.id);
		port.onDisconnect.addListener(function()
		{
			console.warn("FIO: " + chrome.runtime.lastError);
		})


	}
}

function fnar_login_then(turl, tdata)
{
	fnar_auth_token = apikey;
    fnar_do_send_xhttp_request(turl, tdata);
}

function fnar_renew_or_reauth_then(url, data)
{
    fnar_login_then(url, data);
}

function send_fnar_xhttp_request(url, data)
{
	if(fnar_auth_token == "")
	{
		fnar_login_then(url, data);
	}
	else
	{
		fnar_do_send_xhttp_request(url, data);
	}

}

function fnar_do_send_xhttp_request(url, data)
{
	if ( fnar_auth_token === "")
		return;
	
    var fnarhttp = new XMLHttpRequest();
    fnarhttp.onreadystatechange = function()
    {
        if (this.readyState === XMLHttpRequest.DONE)
        {
            var status = this.status;
            if (status == 401)
            {
                fnar_renew_or_reauth_then(url, data);
            }
            if (status === 0 || (status >= 200 && status < 400))
            {
                console.info("send success");
            }
            else
            {
                console.error("FIO: send failed " + status);
            }
        }
    };
    fnarhttp.withCredentials = false;
    fnarhttp.open("POST", url, true);
    fnarhttp.setRequestHeader("Authorization", fnar_auth_token);
    fnarhttp.setRequestHeader("Content-type", "application/json");
	if (data != null)
	{
		fnarhttp.send(JSON.stringify(data));
	}
}


var transmitted_events = [
        'PLANET_DATA_DATA',
        'STATION_DATA',
        'INFRASTRUCTURE_DATA_DATA',
        'INFRASTRUCTURE_PROJECTS_DATA',
        'COMPANY_DATA_DATA',
        'LOCAL_MARKET_DATA_DATA',
        'COMPANY_DATA',
        'COMEX_BROKER_DATA',
		'COMEX_BROKER_PRICES',
        'SHIP_SHIPS',
        'SHIP_FLIGHT_FLIGHTS',
        'SITE_SITES',
        'SITE_PLATFORM_BUILT',
        'SITE_SECTION_DEMOLISH',
        'STORAGE_STORAGES',
        'STORAGE_CHANGE',
        'WAREHOUSE_STORAGES',
        'USER_DATA',
        'PRODUCTION_SITE_PRODUCTION_LINES',
        'PRODUCTION_PRODUCTION_LINE_UPDATED',
        'PRODUCTION_PRODUCTION_LINE_REMOVED',
        'PRODUCTION_ORDER_UPDATED',
        'PRODUCTION_ORDER_REMOVED',
        'WORKFORCE_WORKFORCES',
        'WORKFORCE_WORKFORCES_UPDATED',
        'PLANET_SITES',
        'STAR_DATA',
        'CHANNEL_DATA',
        'CHANNEL_MESSAGE_LIST',
        'CHANNEL_MESSAGE_ADDED',
        //'CHANNEL_MESSAGE_ADDED_OTHER', // Disabled for now as it was flooding the server
        'CHANNEL_MESSAGE_DELETED',
        'CONTRACTS_CONTRACTS',
        'CONTRACTS_CONTRACT',
        'PLANET_COGC_DATA',
        'COMEX_TRADER_ORDERS',
        'COMEX_TRADER_ORDER_ADDED',
        'COMEX_TRADER_ORDER_REMOVED',
        'COMEX_TRADER_ORDER_UPDATED',
		'FOREX_CURRENCY_PAIRS',
        // Everything below is "admin only"
        'SYSTEM_STARS_DATA',
        'WORLD_SECTORS',
        'COMEX_EXCHANGE_LIST',
        'COUNTRY_REGISTRY_COUNTRIES',
        'SIMULATION_DATA',
        'WORLD_MATERIAL_CATEGORIES',
        'WORLD_REACTOR_DATA'
    ];

function ProcessMessage(event){
    var outmsg = '';
    // Do stuff with event.data (received data).
    var re_event = /^[0-9:\s]*(?<event>\[\s*"event".*\])[\s0-9:\.]*/m;
    var result = event.data.match(re_event);
    if (result && result.groups && result.groups.event)
    {
        var eventdata = JSON.parse(result.groups.event)[1];
		if ((eventdata.messageType == "ACTION_COMPLETED" && eventdata.payload.message) || (eventdata.messageType == "PRODUCTION_PRODUCTION_LINE_UPDATED" && eventdata.payload) || (eventdata.messageType == "PRODUCTION_PRODUCTION_LINE_REMOVED" && eventdata.payload) || (eventdata.messageType == "PRODUCTION_ORDER_UPDATED" && eventdata.payload) || (eventdata.messageType == "WORKFORCE_WORKFORCES_UPDATED" && eventdata.payload) || (eventdata.messageType == "SITE_PLATFORM_BUILT" && eventdata.payload) || (eventdata.messageType == "SITE_SECTION_DEMOLISH" && eventdata.payload) || (eventdata.messageType == "STORAGE_CHANGE" && eventdata.payload) || (eventdata.messageType == "CHANNEL_MESSAGE_ADDED") || (eventdata.messageType == "CHANNEL_MESSAGE_DELETED") || (eventdata.messageType == "CONTRACTS_CONTRACT" && eventdata.payload) || (eventdata.messageType == "COMEX_TRADER_ORDER_UPDATED" && eventdata.payload) || (eventdata.messageType == "COMEX_TRADER_ORDER_ADDED" && eventdata.payload))
		{
			if (eventdata.messageType == "CHANNEL_MESSAGE_ADDED")
			{
				eventdata.messageType = "CHANNEL_MESSAGE_ADDED_OTHER";
			}
			
			var msgType = (eventdata.messageType == "ACTION_COMPLETED") ? eventdata.payload.message.messageType : eventdata.messageType;
			if (msgType == "DATA_DATA")
			{
				if ( eventdata.payload.message.payload.body.planetId)
				{
					msgType = "PLANET_DATA_DATA";
				}
				else if (eventdata.payload.message.payload.path && eventdata.payload.message.payload.path.length == 2 && eventdata.payload.message.payload.path[0] == "stations")
				{
					msgType = "STATION_DATA";
				}
				else if (eventdata.payload.message.payload.body.projectIdentifier)
				{
					msgType = "INFRASTRUCTURE_PROJECTS_DATA";
				}
				else if (eventdata.payload.message.payload.body.company)
				{
					msgType = "COMPANY_DATA_DATA";
				}
				else if (eventdata.payload.message.payload.body.infrastructure)
				{
					msgType = "INFRASTRUCTURE_DATA_DATA";
				}
				else if (eventdata.payload.message.payload.path && eventdata.payload.message.payload.path.length == 3 && eventdata.payload.message.payload.path[2] == "ads")
				{
					msgType = "LOCAL_MARKET_DATA_DATA";
				}
				else if (eventdata.payload.message.payload.path && eventdata.payload.message.payload.path.length == 4 && eventdata.payload.message.payload.path[2] == "cogc")
				{
					msgType = "PLANET_COGC_DATA";
				}
				else if (eventdata.payload.message.payload.body && eventdata.payload.message.payload.path.length == 2 && eventdata.payload.message.payload.path[0] == "systems")
				{
					msgType = "STAR_DATA";
				}
			}

            if (transmitted_events.includes(msgType))
            {
                StartTransmission();
                switch(msgType)
				{
					case "WORLD_REACTOR_DATA":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/building", eventdata);
						}
						break;
					case "WORLD_MATERIAL_CATEGORIES":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/material", eventdata);
						}
						break;
					case "SHIP_SHIPS":
						send_fnar_xhttp_request(fnar_url + "/ship/ships", eventdata);
						break;
					case "SHIP_FLIGHT_FLIGHTS":
						send_fnar_xhttp_request(fnar_url + "/ship/flights", eventdata);
						break;
					case "SITE_SITES":
						send_fnar_xhttp_request(fnar_url + "/sites", eventdata);
						break;
					case "SITE_PLATFORM_BUILT":
						send_fnar_xhttp_request(fnar_url + "/sites/built", eventdata);
						break;
					case "SITE_SECTION_DEMOLISH":
						send_fnar_xhttp_request(fnar_url + "/sites/demolish", eventdata);
						break;
					case "STORAGE_STORAGES":
						send_fnar_xhttp_request(fnar_url + "/storage", eventdata);
						break;
					case "STORAGE_CHANGE":
						send_fnar_xhttp_request(fnar_url + "/storage/change", eventdata);
						break;
					case "WAREHOUSE_STORAGES":
						send_fnar_xhttp_request(fnar_url + "/sites/warehouses", eventdata);
						break;
					case "COMEX_BROKER_DATA":
						send_fnar_xhttp_request(fnar_url + "/exchange", eventdata);
						break;
					case "COMEX_BROKER_PRICES":
						send_fnar_xhttp_request(fnar_url + "/exchange/cxpc", eventdata);
						break;
					case "COMPANY_DATA":
						send_fnar_xhttp_request(fnar_url + "/company", eventdata);
						break;
					case "USER_DATA":
						send_fnar_xhttp_request(fnar_url + "/user", eventdata);
						break;
					case "PLANET_DATA_DATA":
						send_fnar_xhttp_request(fnar_url + "/planet", eventdata);
						break;
					case "STATION_DATA":
						send_fnar_xhttp_request(fnar_url + "/exchange/station", eventdata);
						break;
					case "PLANET_COGC_DATA":
						send_fnar_xhttp_request(fnar_url + "/planet/cogc", eventdata);
						break;
					case "COMPANY_DATA":
						send_fnar_xhttp_request(fnar_url + "/company", eventdata);
						break;
					case "COMPANY_DATA_DATA":
						send_fnar_xhttp_request(fnar_url + "/company/data", eventdata);
						break;
					case "INFRASTRUCTURE_DATA_DATA":
						send_fnar_xhttp_request(fnar_url + "/infrastructure", eventdata);
						break;
					case "INFRASTRUCTURE_PROJECTS_DATA":
						send_fnar_xhttp_request(fnar_url + "/infrastructure/project", eventdata);
						break;
					case "LOCAL_MARKET_DATA_DATA":
						send_fnar_xhttp_request(fnar_url + "/localmarket", eventdata);
						break;
					case "PRODUCTION_SITE_PRODUCTION_LINES":
						send_fnar_xhttp_request(fnar_url + "/production", eventdata);
						break;
					case "PRODUCTION_PRODUCTION_LINE_UPDATED":
						send_fnar_xhttp_request(fnar_url + "/production/lineupdated", eventdata);
						break;
					case "PRODUCTION_PRODUCTION_LINE_REMOVED":
						send_fnar_xhttp_request(fnar_url + "/production/lineremoved", eventdata);
						break;
					case "PRODUCTION_ORDER_UPDATED":
						send_fnar_xhttp_request(fnar_url + "/production/orderupdated", eventdata);
						break;
					case "PRODUCTION_ORDER_REMOVED":
						send_fnar_xhttp_request(fnar_url + "/production/orderremoved", eventdata);
						break;
					case "WORKFORCE_WORKFORCES":
						send_fnar_xhttp_request(fnar_url + "/workforce", eventdata);
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/global/workforceneeds", eventdata);
						}
						break;
					case "WORKFORCE_WORKFORCES_UPDATED":
						send_fnar_xhttp_request(fnar_url + "/workforce/updated", eventdata);
						break;
					case "PLANET_SITES":
						send_fnar_xhttp_request(fnar_url + "/planet/sites", eventdata);
						break;
					case "SYSTEM_STARS_DATA":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/systemstars", eventdata);
						}
						break;
					case "WORLD_SECTORS":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/systemstars/worldsectors", eventdata);
						}
						break;
					case "STAR_DATA":
						send_fnar_xhttp_request(fnar_url + "/systemstars/star", eventdata);
						break;
					case "CHANNEL_DATA":
						if ( eventdata.payload && eventdata.payload.message && eventdata.payload.message.payload)
						{
							var eventDataPayload = eventdata.payload.message.payload;
							if ((eventDataPayload.type == "GROUP" || eventDataPayload.type == "PUBLIC") && eventDataPayload.displayName &&
								(eventDataPayload.displayName == "APEX Global Chat" || eventDataPayload.displayName == "Official APEX Help Channel" || eventDataPayload.displayName.endsWith("Global Site Owners")))
							{
								if ( validChannelIds.indexOf(eventDataPayload.channelId) == -1 )
								{
									validChannelIds.push(eventDataPayload.channelId);
								}
								send_fnar_xhttp_request(fnar_url + "/chat/data", eventdata);
							}
						}
						break;
					case "CHANNEL_MESSAGE_LIST":
						if (validChannelIds.indexOf(eventdata.payload.message.payload.channelId) >= 0)
						{
							send_fnar_xhttp_request(fnar_url + "/chat/message_list", eventdata);
						}
						break;
					case "CHANNEL_MESSAGE_ADDED":
						if (validChannelIds.indexOf(eventdata.payload.message.payload.channelId) >= 0)
						{
							send_fnar_xhttp_request(fnar_url + "/chat/message_added_self", eventdata);
						}
						break;
					case "CHANNEL_MESSAGE_ADDED_OTHER":
						if (validChannelIds.indexOf(eventdata.payload.channelId) >= 0)
						{
							send_fnar_xhttp_request(fnar_url + "/chat/message_added", eventdata);
						}
						break;
					case "CHANNEL_MESSAGE_DELETED":
						if (validChannelIds.indexOf(eventdata.channelId) >= 0)
						{
							send_fnar_xhttp_request(fnar_url + "/chat/message_deleted", eventdata);
						}
						break;
					case "CONTRACTS_CONTRACTS":
						send_fnar_xhttp_request(fnar_url + "/contract", eventdata);
						break;
					case "CONTRACTS_CONTRACT":
						send_fnar_xhttp_request(fnar_url + "/contract/change", eventdata);
						break;
					case "COMEX_TRADER_ORDERS":
						send_fnar_xhttp_request(fnar_url + "/cxos/", eventdata);
						break;
					case "COMEX_TRADER_ORDER_ADDED":
						send_fnar_xhttp_request(fnar_url + "/cxos/added", eventdata);
						break;
					case "COMEX_TRADER_ORDER_UPDATED":
						send_fnar_xhttp_request(fnar_url + "/cxos/updated", eventdata);
						break;
					case "COMEX_TRADER_ORDER_REMOVED":
						send_fnar_xhttp_request(fnar_url + "/cxos/removed", eventdata);
						break;
					case "COMEX_EXCHANGE_LIST":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/global/comexexchanges", eventdata);
						}
						break;
					case "COUNTRY_REGISTRY_COUNTRIES":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/global/countries", eventdata);
						}
						break;
					case "SIMULATION_DATA":
						if (fnar_is_admin)
						{
							send_fnar_xhttp_request(fnar_url + "/global/simulationdata", eventdata);
						}
						break;
					case "FOREX_CURRENCY_PAIRS":
						send_fnar_xhttp_request(fnar_url + "/currency", eventdata);
						break;
				}
                EndTransmission();
            }
            else
            {
                //console.log("Uninterested in action message: " + eventdata.payload.message.messageType);
            }
        }
    }
}

function StartTransmission(){
    transmissionCounter++;
    if(transmissionCounter == 1){
        transmissionCanRemoveBadge = false;
        SendMessage("DisplayBadge");
        setTimeout(CheckRemovalofBade, 1000);
    }
}

function SendMessage(command){
    try {
        port.postMessage({command: command});
    } catch (error) {
        console.warn("FIO: " + error);
    }
}

try
{
	console.log("Mobile FIO Loaded");
	const runner = new MobileFIO();
	runner.loadInitial();
}
catch(error)
{
	console.error(error);
}