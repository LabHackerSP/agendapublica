SERVER = "http://labhacker.org.br:5000/api/evento";
var JSONcache;

$(document).on("pageinit","#index",function(){ // When entering index
  carregaEventos();
  
  $(document).on("swiperight", "#index", openMenu);
  
  console.log($.datepicker.regional);
  var datept = {
    dayNames: [ "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" ],
    dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ],
    monthNames: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ]
  };
  $.datepicker.setDefaults(datept);
  
  // datepicker init
  $("#data").date();/*{
    dayNames: [ "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" ],
    dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ],
    monthNames: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ]
  });*/
});

function onLoad() {
  document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
  document.addEventListener("backbutton", closeMenus, false);
  navigator.app.overrideButton("menubutton", true);
  document.addEventListener("menubutton", openMenu, false);
}

function closeMenus() {
  if($.mobile.activePage.jqmData("popup") == "open") {
    $("[data-role=popup]").popup("close");
  } else if($.mobile.activePage.jqmData("panel") == "open") {
    $("[data-role=panel]").panel("close");
  } else {
    navigator.app.exitApp()
  }
}

function openMenu() {
  if($.mobile.activePage.jqmData("panel") !== "open") {
    //if(e.type === "swipeleft") {
      $("#menu").panel("open");
    //}
  }
}

function carregaData() {
  $("[data-role=panel]").panel("close");
  $("[data-role=popup]").popup("close");
  carregaEventos($('#data').date('getDate'));
}

function carregaEventos(date) {
  if(date == null) {
    date = new Date();
  }
  console.log(date);
  var formattedDate = $.datepicker.formatDate('yy-mm-dd', date);
  console.log(formattedDate);
  var query = { 
    "filters": [{
      "name":"data_inicio",
      "op":"gte",
      "val": formattedDate
    }],
    "order_by": [{
      "field":"data_inicio",
      "direction":"asc"
    }]
  }
  var url = SERVER + "?q=" + JSON.stringify(query);
  console.log(url);

  $.ajax({
    url: url,
    dataType: "json",
    async: true,
    beforeSend: function() {
      // This callback function will trigger before data is sent
      $.mobile.loading('show', {theme:"a", text:"Aguarde...", textonly:false, textVisible: true}); // This will show ajax spinner
    },
    complete: function() {
      // This callback function will trigger on data sent/received complete
      $.mobile.loading('hide'); // This will hide ajax spinner
    },                
    success: function (result) {
      parseJSON(result);
    },
    error: function (request,error) {
      alert('Não foi possível acessar o servidor!');
    }
  });
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function parseJSON(result) {
  JSONcache = result;
  var content = "";
  if(result.num_results < 1) {
    content += "<p>Não há eventos para a data escolhida!</p>";
  } else {
    content += '<ul data-role="listview">';
    var date = new Date(0);
    for(var v in result.objects) {
      var obj = result.objects[v];
      var newdate = new Date(obj.data_inicio);
      if(newdate > addDays(date, 1)) {
        date = newdate;
        var dateStr = $.datepicker.formatDate("d 'de' MM 'de' yy", date);
        content += "<li data-role='list-divider' class='ui-list-count'>" + dateStr + "</li>";
      }
      content += "<li><a href='#' onClick='loadEvent(" + obj.id + ");'>";
      content += "<h2>" + obj.titulo + "</h2>";
      content += "<p><strong>" + obj.descricao + "</strong></p>";
      content += "<p>" + obj.endereco + "</p>";
      content += "<p class='ui-li-aside'><strong>" + obj.horario + "</strong></p>";
      content += "</a></li>";
    }
    content += "</ul>";
  }
  $("#eventos").html(content);
  $("#eventos").trigger("create");
}

function loadEvent(id) {
  var content = "";
  for(var v in JSONcache.objects) {
    var obj = JSONcache.objects[v];
    if(obj.id == id) {
      content += "<h1>" + obj.titulo + "</h1>"
      $("#info").html(content)
      $("#info").trigger("create");
      $("#info").panel("open");
      return;
    }
  }
  // if we got here we didn't find the event
  alert("Não foi possível encontrar o evento selecionado");
}
