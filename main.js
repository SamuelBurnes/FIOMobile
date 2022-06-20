var fnar_url = "https://rest.fnar.net";
var fio_url = "https://fio.fnar.net";

class MobileFIO
{
	var apikey;
	loadInitial()
	{
		const url = window.location.href;
		if(url.slice(0, 35) == "https://apex.prosperousuniverse.com")
		{
			authenticate();
		}
		else
		{
			window.setTimeout(() => this.loadInitial(), 1000);
		}
	}
	
	authenticate()
	{
		this.apikey = localStorage.getItem("fioinfo");
		if(apikey == null || apikey == undefined)
		{
			// Wait for authenticate buffer
			const container = document.getElementById("container");
			try
			{
				const buffer = container.firstChild.firstChild.children[1].children[1].firstChild.firstChild;
				if(buffer.firstChild.firstChild.textContent.toUpperCase().includes(" / XIT SETTINGS"))
				{
					console.log("Settings Screen");
				}
			} catch(error){}
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