var fnar_url = "https://rest.fnar.net";
var fio_url = "https://fio.fnar.net";

var data = {
	"UserName": "PiBoy314",
	"Password": "prunpassword"
};


class MobileFIO
{
	loadInitial()
	{
		const url = window.location.href;
		if(url.slice(0, 35) == "https://apex.prosperousuniverse.com")
		{
			console.log("PrUN Detected");
		}
		else
		{
			console.log("No PrUN");
			window.setTimeout(() => this.loadInitial(), 1000);
		}
	}
}

try
{
	console.log("Start Mobile FIO");
	const runner = new MobileFIO();
	runner.loadInitial();
}
catch(error)
{
	console.error(error);
}