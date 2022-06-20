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
		console.log(window.location.href);
		window.setTimeout(() => this.loadInitial(), 1000);
	}
}

try
{
	const runner = new MobileFIO();
	runner.loadInitial();
}
catch(error)
{
	console.error(error);
}