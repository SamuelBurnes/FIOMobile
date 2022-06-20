var fnar_url = "https://rest.fnar.net";
var fio_url = "https://fio.fnar.net";
var apikey = null;

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
		apikey = localStorage.getItem("fioinfo");
		if(apikey == null || apikey == undefined)
		{
			// Wait for authenticate buffer
			const container = document.getElementById("container");
			try
			{
				const buffer = container.firstChild.firstChild.children[1].children[1].firstChild.firstChild;
				console.log(buffer.firstChild.firstChild.textContent.toUpperCase());
				if(buffer.firstChild.firstChild.textContent.toUpperCase().includes(" / XIT SETTINGS"))
				{
					console.log("Settings Screen");
					const tile = buffer.children[1].firstChild;
					tile.style.background = "#20314E";
					var apiinput;
					if(tile.children.length == 0)
					{
						apiinput = document.createElement("input");
						tile.appendChild(apiinput);
					}
					else
					{
						apiinput = tile.firstChild;
					}
				}
			} catch(error){console.error(error);}
			if(apikey == null || apikey == undefined){window.setTimeout(() => this.authenticate(), 1000);}
		}
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