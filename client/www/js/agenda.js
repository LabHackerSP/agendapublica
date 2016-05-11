SERVER = "http://labhacker.org.br:5000/api/evento";
var JSONcache = [];
var dataSelecionada;
// matriz[ano][mes][dia] = num eventos
var matrizEventos = new Object();

$(document).on("pageinit","#index",function(){ // When entering index
  // mostraEventos usa dataSelecionada
  // carrega eventos desse mês quando boot
  dataSelecionada = new Date();
  carregaAno(null, mostraEventos);
  
  // um swipe right no index abre menu
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
  // hook do cordova quando dispostivo inicializou
  document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
  // inicializa botões hardware do dispositivo
  document.addEventListener("backbutton", closeMenus, false);
  navigator.app.overrideButton("menubutton", true);
  document.addEventListener("menubutton", openMenu, false);
}

function closeMenus() {
  if($.mobile.activePage.jqmData("popup") == "open") { // primeiro fecha popups, TODO: não funciona
    $("[data-role=popup]").popup("close");
  } else if($.mobile.activePage.jqmData("panel") == "open") { // segundo fecha paineis
    $("[data-role=panel]").panel("close");
  } else {
    navigator.app.exitApp() // só depois fecha app
  }
}

function openMenu() {
  if($.mobile.activePage.jqmData("panel") !== "open") {
    $("#menu").panel("open");
  }
}

// carrega um ano inteiro do DB para o cache JSON
// date = ano, callback = função a rodar quando sucesso
function carregaAno(date, callback) {
  if(date == null) {
    date = new Date().getFullYear();
  }
  var startDate = date + '-01-01';
  var endDate = date + '-12-31';
  var query = { 
    "filters": [{
      "name":"data_inicio",
      "op":"gte",
      "val": startDate
    },{
      "name":"data_inicio",
      "op":"lte",
      "val": endDate
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
      setTimeout(function() {
        $.mobile.loading('show', {theme:"a", text:"Aguarde...", textonly:false, textVisible: true}); // This will show ajax spinner
      }, 1);
    },
    complete: function() {
      // This callback function will trigger on data sent/received complete
      setTimeout(function() {
        $.mobile.loading('hide'); // This will hide ajax spinner
      }, 1);
    },
    success: function (result) {
      //parseJSON(result);
      // matriz de dias carregados
      for(var v in result.objects) {
        var obj = result.objects[v];
        JSONcache.push(obj);
        var adate = new Date(obj.data_inicio);
        var eventYear = adate.getFullYear();
        var eventMonth = adate.getMonth()+1;
        if(matrizEventos[eventYear] == null) matrizEventos[eventYear] = new Object();
        if(matrizEventos[eventYear][eventMonth] == null) matrizEventos[eventYear][eventMonth] = new Array();
        matrizEventos[adate.getFullYear()][adate.getMonth()+1].push(adate.getDate());
        console.log(matrizEventos[eventYear]);
      }
      
      $("#data").date("refresh");
      
      callback();
    },
    error: function (request,error) {
      alert('Não foi possível acessar o servidor!');
      return false;
    }
  });
  return true;
}

// chamado quando clica busca no mês
function carregaBusca() {
  $("[data-role=panel]").panel("close");
  $("[data-role=popup]").popup("close");
  //carregaEventos($('#data').date('getDate'));
  console.log(dataSelecionada);
  mostraEventos();
}

// retorna data x dias no futuro
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function filtraEventos(startDate, endDate) {
  var out = [];
  for(v in JSONcache) {
    var obj = JSONcache[v];
    var eventDate = new Date(obj.data_inicio);
    console.log(eventDate);
    if(eventDate >= startDate && eventDate <= endDate) {
      out.push(obj);
    }
  }
  return out;
}

// chamado para atualizar eventos no index
function mostraEventos() {
  // result precisa conter apenas eventos a serem mostrados (filtrar mês selecionado)
  // JSONcache deve conter todos os eventos baixados (geralmente, todo o ano atual)
  
  var startDate = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1);
  var endDate = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth()+1, 0);
  
  console.log(startDate);
  console.log(endDate);
  
  console.log(JSONcache);
  
  var result = filtraEventos(startDate, endDate);
  
  console.log(result);

  var content = "";
  if(result.length < 1) {
    content += "<p>Não há eventos para a data escolhida!</p>";
  } else {
    content += '<ul data-role="listview">';
    var date = new Date(0);
    for(var v in result) {
      var obj = result[v];
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

// chamado para abrir painel com informações do evento selecionado
function loadEvent(id) {
  var content = "";
  for(var v in JSONcache.objects) {
    var obj = JSONcache.objects[v];
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

// chamado quando usuário muda mês no calendário
function updateMonth(year, month, inst) {
  // TODO: checa se ano está carregado
  dataSelecionada = new Date(year, month-1, 01);
}

// chamado a cada dia do calendário para marcar os que têm eventos
function markDates(date) {
  if(matrizEventos[date.getFullYear()] != null && matrizEventos[date.getFullYear()][date.getMonth()+1] != null) {
    if(matrizEventos[date.getFullYear()][date.getMonth()+1].indexOf(date.getDate()) > -1) { //se há evento no dia
      return [false, 'ui-state-highlight'];
    }
  }
  return false;
}
