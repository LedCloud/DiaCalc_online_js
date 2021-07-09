/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global settings, numeral, target */

"use strict";

var menuArr = []; //Глобальный массив с меню
var prodArr = {}; //Глобальный массив с продуктами ключ - id группы
var coefs;
var product;
//var settings;//Настройки, устанавливаются из php в шаблоне
//var numeral;//Функция иимпортируется из cloudfare
var coefsArr; //глобальный массив коэффициентов.

var gr_ids_from_options = [];
var menuArrNeedsLoad = true;
var menuViewNeedsRefresh = true;
var productsViewNeedsRefresh = false;

//colors
const COL_GREEN = '#55E7A4';
const COL_RED = '#DFA69C';
const COL_BLUE = '#6DD2E3';
const COL_WARN = '#E7B255';

$(document).on("pageshow","#page_menu",function(){
    if (menuArrNeedsLoad){//Нужно загрузить продукты в массив
        loadMenuArray(fillMenuHTML);
    }else{ //Эта ситуация возможна если первоначально была открыта страница с продуктами, 
        //а потом был переход на меню, то есть массив продуктов меню уже был загружен.
        if (menuViewNeedsRefresh){
            fillMenuHTML();
        }    
    }
});

$(document).on("pagecreate","#page_menu",function(){
    if (settings.calorlimit>0){
        if (getDateString(new Date())!==getDateString(settings.eatenDt)){
            settings.eaten = 0;
        }
    }
    
    $('#page_menu').on('swipeleft',function(){
        $.mobile.changePage( $('#page_prods'),
        { transition: "slide" } );
    });
    
    $('.coefs-input').on({
        focus: function() { 
            $(this).select(); 
        }
    });
    
    $('#popup-round-btn-up').on('click',function(){
        roundDoseUp();
    });
    
    $('#popup-round-btn-down').on('click',function(){
        if ($(this).hasClass('ui-state-disabled')) return;
        roundDoseDown();
    });
    
    $('#roundDose').on('click',function(){
        $( '#contextMenuMenu' ).popup( 'close' );
        if (menuArr.length===0) return;
        setTimeout(function(){
            var id = +$('#contextMenuMenu').jqmData('caller_id').substring(2);
            roundDose(id);
        },50);
    });
    
    $('.show-dose-info').on('tap',
    function(){
      window.setTimeout ( function() {
          $('#calor-plus').removeAttr('disabled');
          $('#calor-clear').removeAttr('disabled');
          $( '#popupDoses' ).popup ( 'open',{
                positionTo: "#results"
          }); 
      }, 50 );
    });
    
    $('#coefs-btn').on('tap',function(){
        showCoefsPupup();
    });
    
    $('#flushMenu').on( 'click', function() {
        flushMenu();
    });
    
    $('#store2diary').on('tap',function(){
        $( '#contextMenuMenu' ).popup( 'close' );
        //теперь запскаем таймер
        window.setTimeout ( function() {
            var popup = $( '#menu-save-to-diary' );
            var dt = new Date();
            $('#menu-save-remark').val('');
            $('#menu-save-date').val(getDateString(dt));
            $('#menu-save-time').val(getTimeString(dt));
    
            popup.popup( 'open' );
        },50);
    });
    
    $('#menu-save-ok').on('tap',function(){
        saveMenuToDiary();
    });
    
    $('#createNewProd').on('click',function(){
        $( '#contextMenuMenu' ).popup( 'close' );
        //теперь запускаем таймер
        window.setTimeout ( function() { 
            var popup = $('#menu-popupProduct');
            
            $("#menu-popup-group-choice").val($("#menu-popup-group-choice option").first().val());
            $("#menu-popup-group-choice").selectmenu("refresh");
            //Заполняем
            $('#menu-prodName').val("");
            $('#menu-prodWeight').val(numeral(product.weight).format('0'));
            $('#menu-prodProt').val(numeral(product.getProt()).format('0.0'));
            $('#menu-prodFat').val(numeral(product.getFat()).format('0.0'));
            $('#menu-prodCarb').val(numeral(product.getCarb()).format('0.0'));
            $('#menu-prodGi').val(numeral(product.gi).format('0'));
            
            popup.popup( 'open' );
            }, 50 );
    });
    
    $('#menu-popup-pr-ok').on('click',function(){
        saveProductFromMenu();
    });
    
    $('#popup-coef-ok').on('click',function(){
        var s = new Sugar(5.6);//Временная переменная
        coefs.k2 = replaceComma($('#coefK2').val());
        //Преобразуем из вида в СК
        s.setSugar(replaceComma($('#coefK3').val()),settings.whole, settings.mmol);
        coefs.k3 = s.sugar;
        s.setSugar(replaceComma($('#coefSH1').val()),settings.whole, settings.mmol);
        coefs.sh1 = s.sugar;
        s.setSugar(replaceComma($('#coefSH2').val()),settings.whole, settings.mmol);
        coefs.sh2 = s.sugar;
        coefs.be = replaceComma($('#coefBE').val());
        coefs.setK1(replaceComma($('#coefK1').val()));
        
        calcMenu();
        //теперь надо слить эти данные на сервер
        storeCoefs();
    });
    $('#coefs-popup-coefs-choice').on({
        'focus': function(){
            this.selectedIndex = -1;
        },
        'change':function(){
            var pos = +$(this).val();
            this.blur();
            setTimeout(function(){
                $('#coefK1').val( coefsArr[pos].k1 );
                $('#coefK2').val( coefsArr[pos].k2 );
                $('#coefK3').val( coefsArr[pos].k3 );
            },0);
        }
    });
    $('#menu-prodWeight').on({
        change: function(){
            $(this).val(numeral(calculateString($(this).val())).format('0') );
        }
    });
});

$(document).on("pageshow","#page_prods",function(){
    if (productsViewNeedsRefresh){
        loadProds2List($("#group-choice").val());
    }
});

$(document).on("pagecreate","#page_prods",function(){
    if (menuArrNeedsLoad){//Сюда попадаем если пользователь решил перезагрузить страницу
        loadMenuArray(function (v){
            //Продолжаем тут
            loadProds2List(v);
        },$("#group-choice").val());
    }else{
        loadProds2List($("#group-choice").val());
    }
    
    $('#popup-pr-ok').on('click',function(){
        createNewProduct();
    });
    
    $( '#addProd' ).on( 'click', function() {
        showNewProductPopup();
    });
    
    $( '#editProd' ).on( 'click', function() {
        showEditProductPopup();
    });
    
    $( '#deleteProd' ).on( 'click', function() {
        showDeleteProductPopup();
    });
    
    $('#del-pr-ok').on( 'click', function() {
        //Удаляем продукт из БД 
        deleteProductFromDB( +$( '#popupDelProd' ).jqmData('id') );
    });
    /// autocomplete start
    $('#search-result').on( "filterablebeforefilter", function ( e, data ) {
        startAutoCompletion( $(this),data);
        
    });
    
    /*$('#searchPane').bind({//Останавливаем таймер после закрытия панели
        popupafterclose: function(event, ui) {
            //clearInterval( timer );
        }
    });*/
    $('#open-search-pane').on('click',function(){
        //Запускаем таймер и показываем панель
        $('#base-search').val("");
        setTimeout( function() { $( '#searchPane' ).popup ( 'open',
            {
                positionTo: "#product-header"
            }); 
            }, 50 );
    });
    //autocompple end
    
    $("#addProd").on("click",function(){
        $( '#contextProdMenu' ).popup( 'close' );    
        window.setTimeout( function() { $( '#popupAddProd' ).popup ( 'open' ); 
            }, 50 );
    });
    $("#editProd").on("click",function(){
        $( '#contextProdMenu' ).popup( 'close' );    
        window.setTimeout ( function() { $( '#popupEditProd' ).popup ( 'open' ); 
            }, 50 );
    });
    
    $("#group-choice").bind( "change", function() {
        var gr_id = $("#group-choice").val();
        //Надо очистить фильтр
        $("#filterProduct").val("");
        $("#prlist").empty();
        //Теперь загружаем продукты
        loadProds2List(gr_id);
    });
    
    //делаем список групп заранее, все равно он не меняется
    $("#group-choice option").each(function()
    {   // Add $(this).val() to your list
        gr_ids_from_options[gr_ids_from_options.length] = +$(this).val();
    });
    
    $("#page_prods").on("swipeleft",function(){
        swipeLeftProducts();
    });
    $("#page_prods").on("swiperight",function(){
        swipeRightProducts();
    });
});

function startAutoCompletion(el,data){
    var $ul = el,
            $input = $( data.input ),
            value = $input.val(),
            html = "";
        $ul.html( "" );
    if ( value && value.length > 2 ) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );
            $.post("online.php?"+getSID(),{
      action: "search",
      string: value
      },function(data, status){
        if (status === "success"){
            try{
                var obj = JSON.parse(data);
                $.each( obj, function ( i, val ) {
                    //val.label, val.id, val.gr_id
                        html += "<li id=\"srch"+val.id +
                        "\" grid=\""+val.id_gr +
                        "\" class=\"search-res-lines\""+
                        ">" + val.label + "</li>";
                    });
                    $ul.html( html );
                    $ul.listview( "refresh" );
                    //$ul.trigger( "updatelayout");
                $('.search-res-lines').on('click',function(){
                    //Тут закрываем попап, чистим его и переводим результат
                    $('#searchPane').popup('close');
                    $input.val("");
                    var pr_id = +$(this).attr("id").substring(4);
                    var gr_id = +$(this).attr("grid");
                    $ul.html( "" );
                    $ul.listview( "refresh" );
                        //Теперь переходим на новую, возможно старую группу
                    for(var j=0;j<gr_ids_from_options.length;j++){
                        if (gr_id===gr_ids_from_options[j]) break;
                    }
                    //Меняем группу в селекте и чистим prlist
                    //changeSelectedGroup(j);
                    //Теперь загружаем продукты
                    //Эта операция медленная
                    loadProds2List(gr_ids_from_options[j],pr_id,
                    function(id){
                        changeSelectedGroup(j);
                        setTimeout(function(){
                            $.mobile.silentScroll( $('#pr'+id).offset().top -
                                $('#prodHeader').height() );
                        },50);
                    });
                });
            }catch(error){
                showError(error+"\n"+data);
            }
        }else showErrorConnection();
      });
    }
}
function swipeLeftProducts(){
    //Открываем следующую группу
    $.mobile.changePage( "#page_prods", { 
        allowSamePageTransition: true,
        transition: "flip"
    } );
    var gr_id = +$("#group-choice").val();
    for(var i=0;i<gr_ids_from_options.length;i++){
        if (gr_id===gr_ids_from_options[i]) break;
    }

    //Получили индекс
    if (i===(gr_ids_from_options.length-1)){//Последняя
        //changeSelectedGroup(0);
        //Теперь загружаем продукты
        loadProds2List(gr_ids_from_options[0],0,
            changeSelectedGroup);
    }else{
        //changeSelectedGroup(i+1);
        //Теперь загружаем продукты
        loadProds2List(gr_ids_from_options[i+1],i+1,
            changeSelectedGroup);
    }
}
function swipeRightProducts(){
    //Открываем предыдущую группу
    $.mobile.changePage( "#page_prods", { 
        allowSamePageTransition: true,
        transition: "flip",
        reverse: "true"
    } );
    var gr_id = +$("#group-choice").val();

    for(var i=0;i<gr_ids_from_options.length;i++){
        if (gr_id===gr_ids_from_options[i]) break;
    }
    //Получили индекс
    if (i===0){//Первая
        //Теперь загружаем продукты
        loadProds2List(gr_ids_from_options[gr_ids_from_options.length-1],
            gr_ids_from_options.length-1,
            changeSelectedGroup);
    }else{
        //Теперь загружаем продукты
        loadProds2List(gr_ids_from_options[i-1],i-1,
            changeSelectedGroup);
    }
}
function deleteProductFromDB(pr_id){
    $.post("online.php?"+getSID(),
    {
        action: 'del prod', 
        prid: pr_id
    },
    function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)===1){//Удаление произошло, чистим список от продукта и массив prodArr
                    var gr_id = $("#group-choice").val();
                    for(var i=0;i<prodArr[gr_id].length;i++){
                        if (pr_id===prodArr[gr_id][i].id){
                            prodArr[gr_id].splice(i,1);
                            break;
                        }
                    }
                    //Теперь удаляем с экрана
                    var li = $("#prlist li a.ui-btn-active").parent('li');
                    li.remove();
                    //$('#prlist').remove($("#prlist li a.ui-btn-active").parent('li'));
                    $('#prlist').listview('refresh');

                }//Иначе ничего не делаем.
            }catch(error){
                showError(error+"\n"+data);
            }
        }else showErrorConnection();
    });
}
function showDeleteProductPopup(){
    $( '#contextProdMenu' ).popup( 'close' );    
    window.setTimeout ( function() { 
        //Заполняем имя продукта
        var a = $("#prlist li a.ui-btn-active");
        $("#pr-name").text(a.children("h6").text());
        var popup = $( '#popupDelProd' );
        if (typeof popup.jqmData('id')!==undefined) popup.jqmRemoveData('id');
        popup.jqmData('id',a.parent('li').attr("id").substring(2));
        popup.popup ( 'open' );
        }, 50 );
}
function showEditProductPopup(){
    $( '#contextProdMenu' ).popup( 'close' );    
    window.setTimeout ( function() { 
        var popup = $( '#popupProduct' );
        if (typeof popup.jqmData('action')!==undefined) popup.jqmRemoveData('action');
        popup.jqmData('action', 'edit');
        popup.find('h3').text("Изменить продукт");
        //Теперь нужно найти продукт
        var a = $("#prlist li a.ui-btn-active");
        var gr_id = $("#group-choice").val();
        $("#popup-group-choice").val(gr_id);
        $("#popup-group-choice").selectmenu("refresh");
        var pr_id = +a.parent('li').attr("id").substring(2);
        for(var i=0;i<prodArr[gr_id].length;i++){
            if (prodArr[gr_id][i].id===pr_id) break;
        }
        var prod = prodArr[gr_id][i];
        if (typeof popup.jqmData('pr_id')!==undefined) popup.jqmRemoveData('pr_id');
        popup.jqmData('pr_id',prod.id);
        //Заполняем имя продукта
        $('#prodName').val(prod.name);
        $('#prodProt').val(numeral(prod.prot).format('0.0'));
        $('#prodFat').val(numeral(prod.fat).format('0.0'));
        $('#prodCarb').val(numeral(prod.carb).format('0.0'));
        $('#prodGi').val(prod.gi);

        popup.popup( 'open' );
        }, 50 );
}

function prepareNewProdPopup(){
    var popup = $('#popupProduct');
    if (typeof popup.jqmData('action')!==undefined) popup.jqmRemoveData('action');
    popup.jqmData('action', 'add');
    popup.find('h3').text("Новый продукт");
    //Чистим
    $('#prodName').val("");
    $('#prodProt').val("");
    $('#prodFat').val("");
    $('#prodCarb').val("");
    $('#prodGi').val("");

    $("#popup-group-choice").val($("#group-choice").val());
    $("#popup-group-choice").selectmenu("refresh");
    
    return popup;
}
function showNewProductPopup(){
    $( '#contextProdMenu' ).popup( 'close' );    
    window.setTimeout ( function() { 
        prepareNewProdPopup().popup ( 'open' );
        }, 50 );
}
function createNewProduct(){
    //Нужно удалить данные?
    var popup = $( '#popupProduct' );
    var action = popup.jqmData('action');
    //Проверяем данные
    var name = $('#prodName').val();
    var prot = replaceComma($('#prodProt').val());
    var fat  = replaceComma($('#prodFat').val());
    var carb = replaceComma($('#prodCarb').val());
    var gi   = replaceComma($('#prodGi').val());
    var error = "";
    if (name.length===0)     error += "Имя не может быть пустым\n";
    if (prot>100 || prot<0)  error += "Белки введены не корректно\n";
    if (fat>100 || fat<0)    error += "Жиры введены не корректно\n";
    if (carb>100 || carb<0)  error += "Углеводы введены не корректно\n";
    if (gi>100 || gi<0)      error += "ГИ введен не корректно\n";
    if ((fat+prot+carb)>100) error += "Сумма БЖУ не может превышать 100\nБ:"+prot+" Ж:"+fat+" У:"+carb;

    if (error){
        showError(error);
        return;
    }
    //закрываем попап
    $('#popupProduct').popup('close');
    var gr_id = +$('#popup-group-choice').val();
    console.log("gr id="+gr_id);
    console.log(action);
    
    if (action==='add'){//Добавляем новый
        $.post("online.php?"+getSID(),
        {
            action: 'add prod', 
            name: name,
            prot: prot,
            fat:  fat,
            carb: carb,
            gi:   gi,
            gr_id:gr_id
        },
        function(data, status){
            if (status === "success"){
                console.log(data);
                try{//Вернуться должна 1
                    if (JSON.parse(data)===1){//
                        if (gr_id in prodArr)       delete prodArr[gr_id];//Чистим группу в которую был добавлен продукт
                        //Теперь переходим на новую, возможно старую группу
                        for(var i=0;i<gr_ids_from_options.length;i++){
                            if (gr_id===gr_ids_from_options[i]) break;
                        }
                        //changeSelectedGroup(i);
                        //Теперь загружаем продукты
                        loadProds2List(gr_ids_from_options[i],i,
                            changeSelectedGroup);
                    }else showError("Продукт не был добавлен.");
                }catch(error){
                    showError(error+"\n"+data);
                }
            }else showErrorConnection();
        });
    }else{//редактирование
        var pr_id = popup.jqmData('pr_id');
        //делаем запрос в БД:
        $.post("online.php?"+getSID(),
        {
            action: 'edit prod', 
            prid: pr_id,
            name: $('#prodName').val(),
            prot: replaceComma($('#prodProt').val()),
            fat:  replaceComma($('#prodFat').val()),
            carb: replaceComma($('#prodCarb').val()),
            gi:   +$('#prodGi').val(),
            gr_id:gr_id
        },
        function(data, status){
            if (status === "success"){
                try{//Вернуться должен 1
                    if (JSON.parse(data)===1){
                        //Мы должны удалить два массива. Один в котором был продукт, другой в котором он стал
                        //тогда эти группы заполнятся автоматом при переходе на эти группы
                        var old_gr_id = $('#group-choice').val();
                        if (old_gr_id in prodArr)   delete prodArr[old_gr_id];
                        if (gr_id in prodArr)       delete prodArr[gr_id];
                        //Теперь переходим на новую, возможно старую группу
                        for(var i=0;i<gr_ids_from_options.length;i++){
                            if (gr_id===gr_ids_from_options[i]) break;
                        }
                        //changeSelectedGroup(i);
                        //Теперь загружаем продукты
                        loadProds2List(gr_ids_from_options[i],i,
                                changeSelectedGroup);
                    }else showError("Редактирование не получилось.");
                }catch(error){
                    showError(error+"\n"+data);
                }
            }else showErrorConnection();
        });
    }
}
function changeSelectedGroup(indx){
    $("#group-choice").val(gr_ids_from_options[indx]);
    $("#group-choice").selectmenu("refresh");
    //Надо очистить фильтр
    $("#filterProduct").val("");
}

function saveProductFromMenu(){
    var name = $('#menu-prodName').val();
    var weight = calculateString($('#menu-prodWeight').val());
    var prot = replaceComma($('#menu-prodProt').val());
    var fat  = replaceComma($('#menu-prodFat').val());
    var carb = replaceComma($('#menu-prodCarb').val());
    var gi   = +$('#menu-prodGi').val();
    var error = "";

    if (name.length===0)    error += "Имя не может быть пустым\n";
    if (prot>weight || prot<0) error += "Белки введены не корректно\n";
    if (fat>weight || fat<0)   error += "Жиры введены не корректно\n";
    if (carb>weight || carb<0) error += "Углеводы введены не корректно\n";
    if (gi>100 || gi<0)     error += "ГИ введен не корректно\n";
    if (weight<=0)          error += "Вес продукта введен не корректно\n";
    if ((fat+prot+carb)>weight) error += "Сумма БЖУ не может превышать вес продукта\nБ:"+prot+" Ж:"+fat+" У:"+carb+ " Вес:"+weight;

    if (error){
        showError(error);
        return;
    }
    //Теперь закрываем диалог
    $('#menu-popupProduct').popup('close');
    //Приводим к весу 100 гр.
    prot *= 100 / weight;
    fat  *= 100 / weight;
    carb *= 100 / weight;

    var gr_id = $('#menu-popup-group-choice').val();
    
    $.post("online.php?"+getSID(),
    {
        action: 'add prod', 
        name: name,
        prot: prot,
        fat:  fat,
        carb: carb,
        gi:   gi,
        gr_id:gr_id
    },
    function(data, status){
        if (status === "success"){
            try{//Вернуться должна 1
                if (JSON.parse(data)===1){//
                    if (gr_id in prodArr)       delete prodArr[gr_id];//Чистим группу в которую был добавлен продукт
                    //тут надо ставить флаги для перезагрузки продуктов
                    productsViewNeedsRefresh = true;
                }else showError("Продукт не был добавлен.");
            }catch(error){
                showError(error+"\n"+data);
            }
        }else showErrorConnection();
    });
}
function saveMenuToDiary(){
    var rem = $('#menu-save-remark').val();
    if (rem===null){
        rem = '';
    }
    var date = $('#menu-save-date').val();
    var time = $('#menu-save-time').val();

    if (date.length===0 || time.length===0){
        alert('Какое-то поле не заполнено!');
        return;
    }
    $('#menu-save-to-diary').popup('close');

    //Считаем, что меню рассчитано, теперь подготавливаем данные и сливаем в дневник.
    $.post("online.php?"+getSID(),
    {
        action   : 'store menu2diary',
        result   : JSON.stringify(product),
        datetime : date+' '+time,
        remark   : rem
    },
    function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)===1){
                    var message = 'Меню сохранено в дневник успешно!';
                }else{
                    message = "Не удалось сохранить меню";
                }
                $('#popup-alert-message').text(message);
                $( '#popup-alert' ).popup( 'open' );
                setTimeout(function(){
                    $( '#popup-alert' ).popup('close');
                },1500);
            }catch (error){
                showError(error+"\n"+data);
            }
        }else{
            showErrorConnection();
        }
    });
}
function flushMenu(){
    if (settings.calorlimit>0){
        //Перед очисткой надо заполнить градусник калорий
        if (getDateString(new Date())!==getDateString(settings.eatenDt)){
            settings.eaten = 0;
        }else{
            settings.eaten += product.getCalor();
        }
        storeEatenCalors();
        updateCalorProgressBar();
    }
    $( '#contextMenuMenu' ).popup( 'close' );
    menuArr = [];
    $('#menulist').empty();
    coefs.sh1=target.sugar;
    coefs.sh2=target.sugar;
    //Удаляем все из массива меню, чистим меню на сервере, запускаем calcMenu();
    if (settings.timedcoefs){
        //выбираем из массива coefsArr коэф-ты и вставляем их, меняем селект
        var h = getHour();
        var s = new Sugar(5.6);//tmp
        coefs.k2 = coefsArr[h].k2;
        //Преобразуем из вида в СК
        s.setSugar(coefsArr[h].k3,settings.whole, settings.mmol);
        coefs.k3 = s.sugar;
        coefs.setK1(coefsArr[h].k1);
        //теперь надо слить эти данные на сервер
        storeCoefs();//Тут ск1 и ск2 старые!
    }
    calcMenu();
    productsViewNeedsRefresh = true;
    //menuList.trigger('create');нужно ли?
    $.post("online.php?"+getSID(),
    {
        action: 'flush menu'
    },
    function(data, status){
        if (status !== "success"){
            showErrorConnection();
        }else{
            try{
                if (JSON.parse(data)!==1){
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }
    });
}
function showCoefsPupup(){
    //Заполняем
    $('#coefK1').val(numeral(coefs.getK1()).format('0.00'));
    $('#coefK2').val(numeral(coefs.k2).format('0.00'));
    $('#coefK3').val(numeral(new Sugar(coefs.k3).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.00':'0.0'));
    $('#coefSH1').val(numeral(new Sugar(coefs.sh1).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'00'));
    $('#coefSH2').val(numeral(new Sugar(coefs.sh2).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'00'));
    $('#coefBE').val(numeral(coefs.be).format('0'));
    //В селекте надо выбрать время, если коэф-ты по времени
    if (settings.timedcoefs){
        $('#coefs-popup-coefs-choice').val(getHour());
        $("#coefs-popup-coefs-choice").selectmenu("refresh");
    }
    setTimeout ( function() { 
        $('#popupCoefs').popup('open');
    },50);
}
function roundDoseUp(){
    var id = $('#popup-round').jqmData('prodId');
    for(var i=0;i<menuArr.length;i++){
        if (id===menuArr[i].id) break;
    }
    var w = +$('a .popup-round-add-text').text();
    var newW = numeral(menuArr[i].weight+w).format('0');
    $('#mn'+id).find('input').val( newW );
    updateMenuProdOnServer(id, +newW );
    menuArr[i].weight = +newW;
    calcMenu();
}
function roundDoseDown(){
    var id = $('#popup-round').jqmData('prodId');
    for(var i=0;i<menuArr.length;i++){
        if (id===menuArr[i].id) break;
    }
    var w = +$('a .popup-round-substruct-text').text();
    var newW = numeral(menuArr[i].weight-w).format('0');
    $('#mn'+id).find('input').val( newW );
    updateMenuProdOnServer(id, +newW );
    menuArr[i].weight = +newW;
    calcMenu();
}

function loadMenuArray(callback,arg){
    //Загружаем меню в массив
    $.post("online.php?"+getSID(),
    {
        action: 'get menu'
    },
    function(data, status){
        if (status === "success"){
            try{
                var obj = JSON.parse(data);
                coefs = new Coef(obj.k1,obj.k2,obj.k3,obj.sh1,obj.sh2,obj.be);
                var sz=obj.menu.length;
                menuArr = [];//Пустой массив
                for(var i=0;i<sz;i++){
                    var prod = new MenuProd(obj.menu[i].name,obj.menu[i].id, obj.menu[i].weight, 
                        obj.menu[i].prot, obj.menu[i].fat, obj.menu[i].carb, obj.menu[i].gi, obj.menu[i].idorig );
                    menuArr[menuArr.length] = prod;
                }
                menuArrNeedsLoad = false;
                if (typeof callback === 'function'){
                    callback(arg);
                }
            }catch(error){
                showError(error+"\n"+data);
            }
        }else showErrorConnection();
    });
}

function fillMenuHTML(){
    var menuList = $("#menulist");
    menuList.empty();//очистили меню
    for (var i=0;i<menuArr.length;i++){
        var li = $('<li/>', {
            'data-icon': "delete",
            'class'    : "menuitem ui-li-has-alt ui-last-child",
            'id'       : "mn"+menuArr[i].id
        });
        var a = $('<a/>', {
            'href': '#',
            'class': 'list2 ui-btn' 
        });
        a.append($('<h6/>', {
            'text': menuArr[i].name
        }));
        a.append($('<p/>', {
		id : "row-"+i
                })/*.append($('<strong/>',{'text': "Б:"+numeral(menuArr[i].getProt()).format('0.0')+
				" Ж:"+numeral(menuArr[i].getFat()).format('0.0')+
                            " У:"+numeral(menuArr[i].getCarb()).format('0.0')+" ГИ:"+numeral(menuArr[i].gi).format('0')
                    }))*/);
        //<input type="number" name="weight" id="weight1" data-wrapper-class="weightfield" placeholder="Вес">
        a.append($('<input/>', {
            'type' : 'tel',
            //'pattern': '(\d+(\.|,)?\d+)((\+|-){1}\d+(\.|,)?\d+)?',
            'class': 'weight-input',
            'name' : 'weight',
            'id'   : "prM"+menuArr[i].id,
            'data-wrapper-class' : "weightfield",
            'placeholder' : "Вес",
            'value' : menuArr[i].weight
        })); 
        
        li.append(a); 
        var a2 = $('<a/>', {
                'href': "#",
                'class' : "del-menu-prod ui-btn ui-btn-icon-notext ui-icon-delete",
                'text' : "Удалить"
        } );
        li.append(a2);
        menuList.append(li);
    }
    menuList.trigger("create");
    $('a.del-menu-prod').on("tap",function(){
            removeProductFromMenu($(this));
        });
    $('.list2').focus(function(){
        $(this).find('input').focus();
    });
    $('.del-menu-prod').focus(function(){//Это переводит фокус на десктопе
        $(this).parent('li').next('li').find('input').focus();
    });
    $('.weight-input').keyup(function (e) {//Это нужно для перевода фокуса на андроиде
        if (+e.keyCode===13){
            //Надо перевести фокус
            $(this).parents('li').next('li').find('input').focus();
        }
    });
    $('.weight-input').on({
        focus: function() { 
            $(this).select(); 
        },
        change: function(){
            //Сначала считываем вес, проверяем, что не изменился, записываем в массив меню, сохраняем на сервер, считаем меню
            var weight = calculateString($(this).val());
            $(this).val( numeral(weight).format('0'));
            //var weight = replaceComma($(this).val());
            var pr_id = +$(this).parents('li').attr('id').substring(2);
            for(var i=0;i<menuArr.length;i++){
                if (menuArr[i].id===pr_id) break;
            }
            if (menuArr[i].weight!==weight){
                menuArr[i].weight = weight;
                updateMenuProdOnServer(pr_id,weight);//Делаем в отдельной функции, т.к. она будет выполнена асинхронно.
		calcMenu();
            }
        }
    });
    $(".menuitem").on( "taphold", function(){
        var popup = $('#contextMenuMenu');
        if (typeof popup.jqmData('caller_id')!==undefined) popup.jqmRemoveData('caller_id');
        popup.jqmData('caller_id',$(this).attr('id'));
        popup.popup('open',{
                positionTo: "#"+$(this).attr("id")
            });
    });
    
    menuViewNeedsRefresh = false;
    calcMenu();
}

function updateMenuProdOnServer(pr_id,weight){
    $.post("online.php?"+getSID(),
    {
        action: 'update menu weight',
        id:     pr_id,
        weight: weight
    },
    function(data, status){
        if (status !== "success"){
            showErrorConnection();
        }else{
            try{
                if (JSON.parse(data)!==1){
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }
    });
}
function removeProductFromMenu(callee){
    var mn_id =+callee.parent('li').attr('id').substring(2);
    $.post("online.php?"+getSID(),
    {
        action: 'remove from menu',
        id    : mn_id
    },
    function(data, status){
        if (status==="success"){
            try{
                if (JSON.parse(data)===1){
                    for(var i=0;i<menuArr.length;i++){
                        if (menuArr[i].id===mn_id){
                            menuArr.splice(i,1);
                            break;
                        }
                    }
                    $("#mn"+mn_id).remove();
                    $('#menulist').listview("refresh");
                    productsViewNeedsRefresh = true;//Теперь надо обновить продукты, чтобы убрать галку.
                    calcMenu();
                }
            }catch(error){
                showError(error+"\n"+data);
            }
        }else showErrorConnection();
    });
}

function calcMenu(){
    if ((typeof menuArr === 'undefined') || (typeof coefs === 'undefined')) return;
    product = new MenuProd("",0,0,0,0,0, 50, -1);
    //var mn_body = $("#menubody");
    var coefs_no_sh = new Coef();
    coefs_no_sh.clone( coefs );
    coefs_no_sh.sh2 = coefs_no_sh.sh1;
    
    for(var i=0;i<menuArr.length;i++){
       var tmp = menuArr[i];
	//Вот тут нужно заполнять информационную строку БЖУ и т.д.
        var st = '';
        if (settings.menuinfo & 1) st += 'Б:'+numeral(tmp.getProt()).format('0.0')+' ';
        if (settings.menuinfo & 2) st += 'Ж:'+numeral(tmp.getFat()).format('0.0')+' ';
        if (settings.menuinfo & 4) st += 'У:'+numeral(tmp.getCarb()).format('0.0')+' ';
        if (settings.menuinfo & 8) st += 'ХЕ:'+numeral( tmp.getCarb()/coefs.be ).format('0.0') +' ';
        if (settings.menuinfo & 16) st += 'Д:'+numeral(new Dose(tmp,coefs_no_sh).getWholeD()).format('0.0')+' ';
        if (settings.menuinfo & 32) st += 'ГИ:'+numeral(tmp.gi).format('0')+' ';
        if (settings.menuinfo & 64) st += 'ГН:'+numeral(tmp.getGLIndx()).format('0')+' ';
        if (settings.menuinfo & 128) st += 'ккал:'+numeral(tmp.getCalor()).format('0');
        
        $('#row-'+i).html("<strong>"+st+"</strong>");
        product.addProduct(tmp);
    }
    var dose = new Dose(product,coefs);
    //заполняем попап
    $('.dose-dps').text(numeral(dose.getDPS()).format('0.0'));
    $('#dose-carb-q').text(numeral(dose.getQCarbD()).format('0.0'));
    $('#dose-carb-sl').text(numeral(dose.getSlCarbD()).format('0.0'));
    $('.dose-protfat').text(numeral(dose.getProtFatD()).format('0.0'));
    
    $('.dose-quick').text(numeral(dose.getDPS()+dose.getQCarbD()).format('0.0'));
    $('.dose-slow').text(numeral(dose.getSlCarbD()+dose.getProtFatD()).format('0.0'));
    $('.dose-whole').text(numeral(dose.getWholeD()).format('0.0'));
    
    $('#dose-carb').text(numeral(dose.getCarbD()).format('0.0'));
    
    $('#info-prot').text(numeral(product.getProt()).format('0.0'));
    $('#info-fat').text(numeral(product.getFat()).format('0.0'));
    $('#info-carb').text(numeral(product.getCarb()).format('0.0'));
    $('#info-be-amount').text(numeral( product.getCarb()/coefs.be).format('0.0'));
    $('#info-gi').text(numeral(product.gi).format('0'));
    $('#info-gn').text(numeral(product.getGLIndx()).format('0'));
    $('.info-calor').text(numeral(product.getCalor()).format('0'));
    
    $('#coef-info-k1').text(numeral(coefs.getK1()).format('0.00'));
    $('#coef-info-k2').text(numeral(coefs.k2).format('0.00'));
    $('#coef-info-k3').text(numeral(new Sugar(coefs.k3).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.00':'0.0'));
    $('#coef-info-sh1').text(numeral(new Sugar(coefs.sh1).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
    $('#coef-info-sh2').text(numeral(new Sugar(coefs.sh2).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
    $('#coef-info-be').text(numeral(coefs.be).format('0'));
    
    if (settings.calorlimit>0){
        updateCalorProgressBar();
        $('#calor-eaten').text(numeral(settings.eaten+product.getCalor()).format('0'));
    }
}

function loadProds2List(gr_id,arg,callback){
    //Проверяем есть ли группа в массиве prodArr
    if (!(gr_id in prodArr)) {
        $.post("online.php?"+getSID(),
        {
            action: 'get prods', 
            grid: gr_id
        },
        function(data, status){
            if (status==="success"){
                try{
                    var obj = JSON.parse(data);
                    var prodLoaded = [];//Ассоцированный массив пустой
                    if (obj!==null){
                        var sz=obj.length;
                        for(var i=0;i<sz;i++){
                            var prod = new Product( obj[i].id, obj[i].name, obj[i].prot, obj[i].fat, obj[i].carb, obj[i].gi);//, obj[i].weight, obj[i].usage );
                            prodLoaded[prodLoaded.length] = prod;
                        }
                        prodArr[gr_id] = prodLoaded;//Закэшировали в массив продукты
                        //Здесь уже есть, вызываем функцию заполнения
                    }else{//Пустая группа
                        prodArr[gr_id] = [];
                    }
                    fillProductList(prodArr[gr_id]);
                    if (typeof callback === 'function'){
                        callback(arg);
                    }
                }catch(error){
                    showError(error+"\n"+data);
                }
            }else showErrorConnection();
        });
    }else{
        //Здесь уже было, вызываем функцию заполнения
        fillProductList(prodArr[gr_id]);
        if (typeof callback === 'function'){
            callback(arg);
        }
    }
}

function fillProductList(prods){
    var pr_list = $("#prlist");
    pr_list.empty();
    if (prods.length<settings.filteroff){ 
        $("#navSearch").hide().trigger("updatelayout");
    }else{
        $("#navSearch").show().trigger("updatelayout");
    }
    if (prods.length===0){
        var a = $("<a/>",{
            'href': "#",
            'text': "Новый продукт"
        });
        pr_list.append($("<li/>").append(a));
        pr_list.listview("refresh");
        a.on( 'click', function() {
            //Открываем popup создания нового продукта
            //Сначала надо проверить если ли группы вообще
            if (gr_ids_from_options.length>1 || gr_ids_from_options[0]>0){
                prepareNewProdPopup().popup("open");
            }else{
                $('#popup-alert-message').text('Сначала необходимо создать группы!');
                $( '#popup-alert' ).popup( 'open' );
            }
        });
        
    }else{
        var flag;
        for(var i=0;i<prods.length;i++){
            var prod = prods[i];
            //Сначал проверяем нет ли продукта в меню
            flag = {icon: "none",
                    class : "ui-icon-none"};
            for(var j=0;j<menuArr.length;j++){
                if (prod.id===menuArr[j].idorig){
                    flag = {icon: "check",
                            class : "ui-icon-check"};
                    break;
                }
            }
            var li = $('<li/>', {
                'data-icon' : flag.icon,
                'class'     : "ui-li-has-alt ui-last-child",
                'id'        : "pr"+prod.id
            });
            var a = $('<a/>', {
                'href': '#',
                'class': 'prod-in-list ui-btn' 
            });
            a.append($('<h6/>', {
                'text': prod.name
            }));
            a.append($('<p/>', {
                }).append($('<strong/>',{'text': "Б:"+numeral(prod.prot).format('0.0')+" Ж:"+numeral(prod.fat).format('0.0')+
                            " У:"+numeral(prod.carb).format('0.0')+" ГИ:"+numeral(prod.gi).format('0')})));
            li.append(a); 
            var a2 = $('<a/>', {
                    'href': "#",
                    'class' : "add-2-menu-click ui-btn ui-btn-icon-notext "+flag.class,
                    'text' : "Изм."
            } );
            li.append(a2);
            pr_list.append(li);

        }
        pr_list.trigger("create");
        
        $(".prod-in-list").on( "taphold", function(){
            $(".prod-in-list").removeClass("ui-btn-active");
            $(this).addClass("ui-btn-active");

            var a_link = $("#addProd");
            var e_link = $("#editProd");
            if (+$("#group-choice").val()===0){
                a_link.addClass("ui-state-disabled");
                e_link.addClass("ui-state-disabled");
            }else if (a_link.hasClass("ui-state-disabled")){
                a_link.removeClass("ui-state-disabled");
                e_link.removeClass("ui-state-disabled");
            }
            $( "#contextProdMenu" ).popup("open", {
                positionTo: "#"+$(this).parent("li").attr("id")
            });
        });
        $(".add-2-menu-click").on("tap",function(){
            add2Menu($(this));
        });
    }
    productsViewNeedsRefresh = false;
}

function add2Menu(a){
    //Получаем id продукта и добавляем его в меню
    var pr_id = a.parent("li").attr('id').substring(2);
    if (a.hasClass("ui-icon-check")){//Убираем из меню
        $.post("online.php?"+getSID(),
        {
            action: 'remove prodFromMenu',
            prodid: pr_id
        },function(data, status){
            if (status === "success"){
                try{
                    if (JSON.parse(data)===1){//Успешно
                        menuArrNeedsLoad = true;
                        a.removeClass("ui-icon-check");
                        a.addClass("ui-icon-none");
                        a.parent("li").attr({icon:"none"});
                    }
                }catch(error){
                    showError(error+"\n"+data);
                }
            }else showErrorConnection();
        });
    }
    else if (a.hasClass("ui-icon-none")){
        //делаем запись в БД
        $.post("online.php?"+getSID(),
        {
            action: 'add prod2menu',
            prodid: pr_id
        },function(data, status){
            if (status==="success"){
                try{
                    if (JSON.parse(data)===1){//Успешно
                        menuArrNeedsLoad = true;
                        a.removeClass("ui-icon-none");
                        a.addClass("ui-icon-check");
                        a.parent("li").attr({icon:"check"});
                    }
                }catch(error){
                    showError(error+"\n"+data);
                }
            }else showErrorConnection();
        });
    }
}
function roundDose(id){
    for(var i=0;i<menuArr.length;i++){
        if (id===menuArr[i].id) break;
    }
    var prod = menuArr[i];
    
    var dose = new Dose(product, coefs);
    var prod100 = new MenuProd('',-1,prod.weight+100,prod.prot,
        prod.fat,prod.carb,prod.gi,0);
    var doseDiff = new Dose(prod100,coefs).getWholeD() - 
            new Dose(prod,coefs).getWholeD();
    var frac = dose.getWholeD() - Math.floor(dose.getWholeD());
    var step = 1;
    switch (settings.roundto){
        case 0: step = 1; break;
        case 1: step = 0.5; break;
        case 2: step = 0.25; break;
        default: step = 1;
    }
    var i = 0;
    while(i<frac){
        i += step;
    }
    var upDiff = Math.floor( dose.getWholeD() ) + i -
                 dose.getWholeD();
    var downDiff = dose.getWholeD() -
                 Math.floor( dose.getWholeD() ) - (i-step);
    var wUp = upDiff * 100 / doseDiff;
    var wDown = downDiff * 100 / doseDiff;
    if (prod.weight<wDown){//Надо отключить кнопку
        $('#popup-round-btn-down').addClass('ui-state-disabled');
    }else{
        $('#popup-round-btn-down').removeClass('ui-state-disabled');
    }
    
    $('#popup-round-prod-name').html(prod.name);
    $('#popup-round-weight-current').text(numeral(prod.weight).format('0.0'));
    $('.popup-round-add-text').text(numeral(wUp).format('0.0'));
    $('.popup-round-substruct-text').text(numeral(wDown).format('0.0'));
    
    $('#popup-round').jqmData('prodId',id);
    
    $('#popup-round').popup('open');
}
function getHour(){
    var dt = new Date();
    var hour = dt.getHours();
    var minutes = dt.getMinutes();
    if (minutes>29 && hour<23){
        hour++;
    }
    return hour;
}
function storeCoefs(){
    $.post("online.php?"+getSID(),
    {
        action: 'send coefs',
        k1 : coefs.k1,
        k2 : coefs.k2,
        k3 : coefs.k3,
        sh1: coefs.sh1,
        sh2: coefs.sh2,
        be : coefs.be
    },
    function(data, status){
        if (status !== "success"){
            showErrorConnection();
        }else{
            try{
                if (JSON.parse(data)!==1){
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }
    });
}

function updateCalorProgressBar(){
    //Заполняем градусник
    var width;
    var res = $('#results');
    if ((settings.eaten+product.getCalor())>settings.calorlimit){
        width = 100;
        //Тут два варианта: уже превысили или собираемся превысить
        if (settings.eaten<settings.calorlimit){//Собираемся превышать
            var green_stop = 100 * settings.eaten / settings.calorlimit;
            res.css('background-image',
            'linear-gradient(to right, '+COL_WARN+' 0%, '+COL_WARN+' '+ green_stop
                    +'%, #DFA69C '+green_stop+'%, '+COL_RED+' 100%)');
        }else{ //Превысили
            res.css('background-image',
            'linear-gradient(to right, '+COL_RED+', '+COL_RED);
        }
    }else{
        //Не превысили
        width = 100 * (settings.eaten+product.getCalor()) / settings.calorlimit;
        var green_stop = 100 * settings.eaten / (settings.eaten+product.getCalor());
        res.css('background-image',
            'linear-gradient(to right, '+COL_GREEN+' 0%, '+COL_GREEN+' '+ green_stop
                    +'%, '+COL_BLUE+' '+green_stop+'%, '+COL_BLUE+' 100%)');
    }
    res.css('background-size',width+'% 100%');
}
function storeEatenCalors(){
    settings.eatenDt = new Date();
    $.post("online.php?"+getSID(),
    {
        action: 'store eaten',
        dt    : getDateString(settings.eatenDt),
        eaten : settings.eaten
    },
    function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)!==1){
                    showError(data);
                }
            }catch(error){
                showError(error+"\n"+data);
            }
        }else{
            showErrorConnection();
        }
    });
}