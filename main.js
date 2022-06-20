var fnar_url = "https://rest.fnar.net";
var fio_url = "https://fio.fnar.net";

class MobileFIO
{
	loadInitial()
	{
		const url = window.location.href;
		if(url.slice(0, 35) == "https://apex.prosperousuniverse.com")
		{
			console.log(localStorage.getItem('localTest'));
			//localStorage.setItem('localTest', Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
			console.log(localStorage.getItem('localTest'));
		}
		else
		{
			console.log(localStorage.getItem('localTest'));
			window.setTimeout(() => this.loadInitial(), 1000);
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