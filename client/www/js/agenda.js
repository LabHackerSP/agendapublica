SERVER = "http://labhacker.org.br:5000/api/evento";
var dataSelecionada = new Date(); // data usada para mostrar eventos

var matrizEventos = new Object();
var eventos = new Object(); // cache de eventos organizados por data

//deprecated
var datept = {
  dayNames: [ "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" ],
  dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ],
  monthNames: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
  monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ]
};

moment().format();
moment.locale('pt-BR');

// inicialização handlebars
var eventoHandler;
var infoHandler;
Handlebars.registerHelper('formataDia', function(data) {
  return moment(data).format("ddd, D");
});

Handlebars.registerHelper('formataRelativo', function(data) {
  var data = moment(data);
  var today = moment().startOf('day');
  if(today.isSame(data)) return "hoje";
  else return data.from(today);
});

Handlebars.registerHelper('formataDescricao', function(text) {
  return new Handlebars.SafeString(descFormat(text));
});

Handlebars.registerHelper('formataData', function(data) {
  console.log(data);
  return data.format('dddd, LL');
});

Handlebars.registerHelper('formataHora', function(data) {
  return data.format('LT');
});

Handlebars.registerHelper('if_mesmoDia', function(a, b, block) {
  var data1 = moment(a).startOf('day');
  var data2 = moment(b).startOf('day');
  return data1.isSame(data2)
   ? block.fn(this)
   : block.inverse(this);
});

Handlebars.registerHelper('if_mesmaHora', function(a, b, block) {
  return a.isSame(b)
   ? block.fn(this)
   : block.inverse(this);
});

// inicialização da página
$(document).on("pageinit","#index",function(){ // When entering index
  // carrega eventos desse mês quando boot
  carregaAno(null, mostraEventos);
  
  // um swipe right no index abre menu
  $(document).on("swiperight", "#index", openMenu);
  
  $.datepicker.setDefaults(datept);
  
  // datepicker init
  $("#data").date({
    constrainInput: true,
    onChangeMonthYear: updateMonth,
    beforeShowDay: markDates
  });
  
  eventoHandler = Handlebars.compile($("#eventos-template").html());
  infoHandler = Handlebars.compile($("#info-template").html());
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
  
  navigator.splashscreen.hide();
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
      parseJSON(result);
      callback();
    },
    error: function (request,error) {
      alert('Não foi possível acessar o servidor!');
      return false;
    }
  });
  return true;
}

// enumerador de dias
var enumerateDaysBetweenDates = function(startDate, endDate) {
    var dates = [];

    var currDate = startDate.clone().startOf('day');
    var lastDate = endDate.clone().startOf('day');
    dates.push(currDate.clone().toDate()); // inicia com o primeiro (inclusivo)
    while(currDate.add(1, 'days').diff(lastDate) <= 0) { // <=, último dia inclusivo
        //console.log(currDate.toDate());
        dates.push(currDate.clone().toDate());
    }

    return dates;
};

// formata json em lista de dias
function parseJSON(result) {
  for(var v in result.objects) {
    var obj = result.objects[v];
    obj.data_inicio = moment(obj.data_inicio);
    obj.data_fim = moment(obj.data_fim);
    var dateRange = enumerateDaysBetweenDates(obj.data_inicio, obj.data_fim); // dá lista de dias entre datas
    
    for(var day in dateRange) {
      var date = moment(dateRange[day]).format('YYYYMMDD');
      if(!(date in eventos)) eventos[date] = []; // cria dia em lista de eventos se não existe
      eventos[date].push(obj); // insere no dia
    }
  }
  $("#data").date("refresh"); // atualiza marcações no calendário
}

// formatação da descrição
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function descFormat(text) {
  return text.replaceAll('\n','<br \>');
}

// chamado quando clica busca no mês
function carregaBusca() {
  $("[data-role=panel]").panel("close");
  $("[data-role=popup]").popup("close");
  //carregaEventos($('#data').date('getDate'));
  console.log(dataSelecionada);
  mostraEventos();
}

// chamado para atualizar eventos no index
function mostraEventos() {
  // result precisa conter apenas eventos a serem mostrados (filtrar mês selecionado)
  // eventos deve conter todos os eventos baixados (geralmente, todo o ano atual)
  var data = moment(dataSelecionada);
  
  var startDate = data.startOf('month').format('YYYYMMDD');
  var endDate = data.endOf('month').format('YYYYMMDD');
  
  var result = {
    mes: data.format('MMMM YYYY'),
    eventos: {}
  };
  for(var v in eventos) {
    if(v >= startDate && v <= endDate) result["eventos"][v] = eventos[v];
  }
  
  $("#eventos").html(eventoHandler(result));
  $("#eventos").trigger("create");
  
  var eventOverflow = $(".event-overflow");
  var eventTitle = $(".event-title");
  var eventDesc = $(".event-desc");
  if(eventTitle.length > 0) {
    // limita título pra 2 linhas
    eventTitle.css('max-height', parseFloat($(".event-title").css('line-height').replace('px',''))*2 + 'px');
    // conserta overlap com horário
    eventTitle.css('margin-right', '2.5em');
  }
  // limita descrição pra 4 linhas
  if(eventDesc.length > 0) eventDesc.css('max-height', parseFloat($(".event-desc").css('line-height').replace('px',''))*4 + 'px');
  if(eventOverflow.length > 0) {
    // trunca
    eventOverflow.css('white-space', 'normal');
    eventOverflow.dotdotdot();
  }
}

// chamado para abrir painel com informações do evento selecionado
function loadEvent(data, id) {
  var content = "";
  for(var v in eventos[data]) {
    var obj = eventos[data][v];
    if(obj.id == id) {
      console.log(infoHandler(obj));
      $("#info").html(infoHandler(obj));
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
  var formattedDate = moment(date).format('YYYYMMDD');
  if(formattedDate in eventos) {
    return [false, 'ui-state-highlight'];
  }
  return false;
}
