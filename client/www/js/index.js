	SERVER = "http://labhacker.org.br:5000/api/evento";
	NOW = moment();
	Handlebars.registerHelper('datum', function(data, formato) {
	  var d = moment(data)
	  console.log(data);
	  return d.format(formato);
	});
		
	function carregaEventos() {
		var query = { 
			"filters": [{	"name":"data_inicio",
							"op":"gte",
							"val": NOW.format("YYYY-MM")
						}],
			"order_by": [{
					"field":"data_inicio",
					"direction":"asc"
					}]
				}
		var url = SERVER + "?q=" + JSON.stringify(query);
		console.log(url);
		$.getJSON(url, function (data) {
				var rendered = template(data);
	  			$('#content').html(rendered);
			});
	}

		function carregaMenu() {
		//Menu
		$(".current_month").text(NOW.format("MMMM"));
		
		var m = Number(NOW.format("M"));
		$(".months").html("");
		for (i=m;i<m+6;i++) {
			mm = NOW.add(1, 'month');
			$(".months").append("<a href='' data-month='"+mm.format("YYYY-MM")+"'>"+mm.format("MMMM/YY")+"</a>")
		}
		NOW.subtract(6, 'month');
		$(".current_month").click(function () {
			$(".dropdown .dropdown-content").show();
		});

		$(".months a").click(function (evt) {
			evt.preventDefault();
			var m = $(evt.currentTarget).data('month');
			NOW = moment(m);
			console.log(NOW);
			$(".current_month").text(NOW.format("MMMM"));
			$(".dropdown .dropdown-content").hide();
			carregaMenu();
		});

		$(".icon-calendar").click(function (evt) {
			NOW = moment();
			$(".dropdown .dropdown-content").hide();
			carregaMenu();
		});

		carregaEventos();
	}


	$(document).ready(function () {
		source = $('#template').html();
		template = Handlebars.compile(source);   // optional, speeds up future uses
		carregaMenu();
	});
