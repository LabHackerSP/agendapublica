SERVER = "http://labhacker.org.br:5000/api/evento";
var cacheCalendario;
var cacheEventos;
var dataSelecionada;
var datasComEventos;

$(document).on("pageinit","#index",function(){ // When entering index
  carregaHoje();
  
  $(document).on("swiperight", "#index", openMenu);
  
  var datept = {
    dayNames: [ "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" ],
    dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ],
    monthNames: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ]
  };
  $.datepicker.setDefaults(datept);
  
  // datepicker init
  $("#data").date({
    constrainInput: true,
    onChangeMonthYear: updateMonth,
    beforeShowDay: markDates
  });
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
  if($.mobile.activePage.jqmData("popup") == "open") { // primeiro fecha popups, não funciona
    $("[data-role=popup]").popup("close");
  } else if($.mobile.activePage.jqmData("panel") == "open") { // segundo fecha paineis
    $("[data-role=panel]").panel("close");
  } else {
    navigator.app.exitApp() // só depois fecha app
  }
}

function openMenu() {
  if($.mobile.activePage.jqmData("panel") !== "open") {
    //if(e.type === "swipeleft") {
      $("#menu").panel("open");
    //}
  }
}

function carregaMes(date) {
  if(date == null) {
    date = new Date();
  }
  var startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  var endDate = new Date(date.getFullYear(), date.getMonth()+1, 0); //hack !!!!
  var formattedStartDate = $.datepicker.formatDate('yy-mm-dd', startDate);
  var formattedEndDate = $.datepicker.formatDate('yy-mm-dd', endDate);
  var query = { 
    "filters": [{
      "name":"data_inicio",
      "op":"gte",
      "val": formattedStartDate
    },{
      "name":"data_inicio",
      "op":"lte",
      "val": formattedEndDate
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
    async: false,
    beforeSend: function() {
      // This callback function will trigger before data is sent
      $.mobile.loading('show', {theme:"a", text:"Aguarde...", textonly:false, textVisible: true}); // This will show ajax spinner
    },
    complete: function() {
      // This callback function will trigger on data sent/received complete
      $.mobile.loading('hide'); // This will hide ajax spinner
    },
    success: function (result) {
      //parseJSON(result);
      cacheCalendario = result;
      // pega datas, põe num array para markDates
      datasComEventos = [];
      for(var v in result.objects) {
        var obj = result.objects[v];
        var adate = $.datepicker.formatDate('yy-mm-dd', new Date(obj.data_inicio));
        if($.inArray(adate, datasComEventos) == -1) { //se não está no array
          datasComEventos[datasComEventos.length] = adate;
        }
      }
    },
    error: function (request,error) {
      alert('Não foi possível acessar o servidor!');
      return false;
    }
  });
  return true;
}

function carregaBusca() {
  $("[data-role=panel]").panel("close");
  $("[data-role=popup]").popup("close");
  //carregaEventos($('#data').date('getDate'));
  mostraEventos();
}

function carregaHoje() {
  if(carregaMes()) {
    mostraEventos();
  }
  // se não der isso, deu erro!!
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function mostraEventos() {
  cacheEventos = cacheCalendario;
  var result = cacheEventos; // porco? talvez
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
      content += "<p>" + obj.local + "</p>";
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
  for(var v in cacheEventos.objects) {
    var obj = cacheEventos.objects[v];
    if(obj.id == id) {
      content += "<h2>" + obj.titulo + "</h2>";
      content += "<h4>" + obj.descricao + "</h4>";
      content += "<p>" + obj.local + "</p>";
      content += "<p>" + obj.endereco + "</p>";
      content += "<p>De: " + $.datepicker.formatDate("d 'de' MM 'de' yy", new Date(obj.data_inicio)); + "</p>";
      content += "<p>Até: " + $.datepicker.formatDate("d 'de' MM 'de' yy", new Date(obj.data_fim)); + "</p>";
      content += "<p>" + obj.horario + "</p>";
      content += "<p>Link: <a href=\"#\" onclick=\"window.open('" + obj.link + "', '_system');\">" + obj.link + "</a></p>";
      $("#info").html(content);
      $("#info-panel").trigger("create");
      $("#info-panel").panel("open");
      return;
    }
  }
  // if we got here we didn't find the event
  alert("Não foi possível encontrar o evento selecionado");
}

function updateMonth(year, month, inst) {
  dataSelecionada = new Date(year, month-1, 1); // ????? que há com o mês? não sei
  if(!carregaMes(dataSelecionada)) {
    //erro!!!
  }
}

function markDates(date) {
  var m = $.datepicker.formatDate('yy-mm-dd', date);
  if($.inArray(m, datasComEventos) > -1) { //se está no array
    return [false, 'ui-state-highlight'];
  }
  return false;
}
