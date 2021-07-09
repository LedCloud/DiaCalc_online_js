/* global settings, numeral, target */

"use strict";

var menuArr = []; //Глобальный массив с меню
var prodArr = {}; //Глобальный массив с продуктами ключ - id группы
var coefs;//Именнованный массив коэф-ов
var product;//Используется при рассчете меню, содержит сумму продуктов меню.
var groups;//Глобальный список групп
var coefsArr; //глобальный массив коэффициентов.

var cntxMenu;
var cntxProd;

$( function() {
    $( "#base-search" ).autocomplete({
      source: function( request, response ) {
          $.post("online.php?"+getSID(),{
              action: "search",
              string: request.term
          },function(data, status){
            if (status === "success"){
                try{
                //В ответе должны быть имена продуктов и их id, id группы.
                /*[{label:'yes',id:'25',id_gr:'234'},
                  {label:'yep',value:'26',id_gr:'234'},
                  {label:'yeah',value:'27',id_gr:'234'}]*/
                    response( JSON.parse(data) );
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else response(["Connection error"]);
          });
      },
      minLength: 3,
      delay: 500,
      close: function(event,ui){
          $("#base-search").val("");
      },
      select: function( event, ui ) {
            var gr_id = +ui.item.id_gr;
            var pr_id = +ui.item.id;
            $('.group-item').removeClass('active');
            $('#gr'+gr_id).addClass('active');
            $('#groups-list').scrollTo('.group-item.active');
            
            loadProds(gr_id,pr_id,function(id){
                $(".prod-item").removeClass("active");
                $("#pr"+id).addClass("active");
                $('#prods-list').scrollTo("#pr"+id);
            });
      }
    });
});
$(window).resize(function(){
   changeMenuSize();
   changeGroupsProdsPaneSize();
});

$(document).ready(function(){
    loadMenu();
    if (settings.timedcoefs){
        //Тут надо выбрать подходящее значение в селекте
        $('#coefs-choice').val(getHour());
    }
    
    //создаем контекстное меню
    cntxMenu = new BootstrapMenu('.menu-item', {
        fetchElementData: function($rowElem) {
            return +$rowElem.attr('id').substring(2);
          },
        actionsGroups: [ ['removeProduct','flushMenu']
            ['roundDose' ],['store2diary'],
                ['createProduct']
            ],
        actions: {
            removeProduct: {
                name: 'Удалить продукт из меню',
                iconClass: 'fa-remove',
                onClick: function(id){
                    removeProdFromMenu(id);
                }
            },
            flushMenu: {
                name: 'Очистить меню',
                iconClass: 'fa-trash',
                onClick: function(){
                    flushMenu();
                }
            },
            roundDose:{
                name: 'Округлить дозу',
                iconClass: 'fa-check-circle-o',
                onClick: function(id){
                    roundDose(id);
                }
            },
            store2diary:{
                name: 'Сохранить меню в дневник',
                iconClass: 'fa-history',
                onClick: function(){
                    storeMenuToDiary();
                }
            },
            createProduct:{
                name: 'Создать продукт',
                iconClass: 'fa-plus',
                onClick: function(){
                    createProductFromMenu();
                } 
            }
        }
    });
    cntxProd = new BootstrapMenu('.prod-item', {
        fetchElementData: function($rowElem) {
            return +$rowElem.attr('id').substring(2);
          },
        actionsGroups: [
            ['product2menu'],
            ['createProduct','editProduct' ],
                ['deleteProduct']
            ],
        actions: {
            product2menu: {
                name: 'Добавить продукт в меню',
                iconClass: 'fa-hand-o-left',
                onClick: function(id){
                    addProd2Menu(id);
                }
            },
            createProduct: {
                name: 'Создать продукт',
                iconClass: 'fa-plus',
                onClick: function(){
                    createProduct();
                }
            },
            editProduct:{
                name: 'Изменить продукт',
                iconClass: 'fa-pencil',
                onClick: function(){
                    editProduct();
                }
            },
            deleteProduct:{
                name: 'Удалить продукт',
                iconClass: 'fa-remove',
                onClick: function(){
                    deleteProduct();
                } 
            }
        }
    });
    $('#store-menu-to-diary').click(function(){
        storeMenuToDiary();
    });
    $("#coefs-choice").on({
        focus: function(){
            if ($(this).hasClass('selector-not-in-use')){
                this.selectedIndex = -1;
            }
        },
        change:function(){
            var pos = +$(this).val();
            $('#k1').val( coefsArr[pos].k1 );
            $('#k2').val( coefsArr[pos].k2 );
            $('#k3').val( coefsArr[pos].k3 );
            $("#coefs-choice").removeClass('selector-not-in-use');
            storeCoefsAndCalcMenu();
        }
    });
    $('.show-hidden-results').click(function(){
        if ($('.results-hidden').is(':visible')){
           $('.results-hidden').hide();
        }
        else{
            $('.results-hidden').show();
        }
        changeMenuSize();
    });
    $('.results-hidden').click(function(){
        $('.results-hidden').hide();
        changeMenuSize();
    });
    
    $(".group-item").click(loadProdsOnClick);
    
    var el = $('#groups-list').children('.group-item:first-child');
    el.addClass('active');    
    if ($('.group-item').length!==0){
        loadProds(+el.attr('id').substring(2));
    }
    
    $(".infloat").on({
        focus: function() { 
            $(this).select(); 
        }
    });
    $(".infloat").change(function(){
        $("#coefs-choice").addClass('selector-not-in-use');
        storeCoefsAndCalcMenu();
    });
    $('#btn-flush-menu').click(function(){
        flushMenu();
    });
    //Создаем продукт
    $('#create-prod').click(function(){
        createProduct();
    });
    $('#edit-prod').click(function(){
        editProduct();
    });
    $('#delete-prod').click(function(){
        if (!$('#prods-list li').hasClass('active')){
            return;
        }
        var name = $(".prod-item.active").children('h5').text();
        $('#dlg-del-prod-name').text(name);
        $("#dlg-del-product").modal();
    });
    $('#dlg-prod-del-ok').click(function(){
        deleteProductFromDB();
    });
    $('#create-prod-from-menu').click(function(){
        createProductFromMenu();
    });
    $('#product-dialog-btn-ok').click(function(){
        createOrEditProduct();
    });
    $('#group-up').click(function(){
        moveGroupUp();
    });
    $('#group-down').click(function(){
        moveGroupDown();
    });
    $('#create-group').click(function (){
        //Заполняем диалог
        $('#dlg-grp-header').text('Создать новую группу');
        $('#grp-dlg-name').val("");
        $('#dlg-add-edit-group').data('type','A');//тип диалога
        $("#dlg-add-edit-group").modal();
    });
    $('#grp-add-edit-ok').click(function (){
        addOrEditGroup();
    });
    $('#edit-group').click(function (){
        if ($('.group-item').length===0) return;
        var li_active = $(".group-item.active");
        var gr_id = +li_active.attr('id').substring(2);
        if ( gr_id===0) return;
        //Заполняем диалог
        $('#dlg-add-edit-group').data('type','E');
        $('#dlg-grp-header').text('Переименовать группу');
        $('#grp-dlg-name').val( li_active.text()  );
        $("#dlg-add-edit-group").modal();
    });
    $('#delete-group').click(function (){
        var li_active = $(".group-item.active");
        var gr_id = +li_active.attr('id').substring(2);
        if (gr_id===0) return;
        
        $('#dlg-del-grp-name').text(li_active.text());
        $("#dlg-del-group").modal();
    });
    $('#grp-del-ok').click(function (){
        deleteGroup();
    });
    //загрузим группы
    $.post("online.php?"+getSID(),
        {
            action: 'get groups'
        },
        function(data, status){
            if (status==="success"){
                try{
                    groups = JSON.parse(data);
                }catch(error){
                    showError(error+'\n'+data);
                    groups = [];
                }
            }else{
                groups = [];
            }
        });
    $('#dlg-round-weight-add').click(function(){
        roundDoseUp();
    });
    $('#dlg-round-weight-substruct').click(function(){
        if ($(this).hasClass('disabled')) return;
        roundDoseDown();
    });
    
    $('#event-dlg-okay').click(function(){
        reallyStoreMenuToDiary();
    });
    $('.product-dlg-weight-input').on({
        change: function(){
            $(this).val(numeral(calculateString($(this).val())).format('0') );
        }
    });
    changeGroupsProdsPaneSize();
    if (settings.calorlimit>0){
        if (getDateString(new Date())!==getDateString(settings.eatenDt)){
            settings.eaten = 0;
        }
        $('#calor-progressbar').click(function(){
            $('#calor-info-dlg-eaten').text(numeral(settings.eaten).format('0'));
            $('#calor-info-dlg-menu').text(numeral(product.getCalor()).format('0'));
            $('#calor-info-dlg-sum').text(numeral(settings.eaten+product.getCalor()).format('0'));
            $('#calor-info-dialog').modal();
        });
    }
});// document ready
////////////////////////////////////////////////////////////////////////////
function deleteProductFromDB(){
    var gr_id = +$(".group-item.active").attr("id").substring(2);
    var pr_id = +$(".prod-item.active").attr("id").substring(2);
    $.post("online.php?"+getSID(),
    {
        action: 'del prod', 
        prid: pr_id
    },
    function(data, status){
        if (status==="success"){
            try{
                if (JSON.parse(data)===1){//Удаление произошло, чистим список от продукта и массив prodArr
                    for(var i=0;i<prodArr[gr_id].length;i++){
                        if (pr_id===prodArr[gr_id][i].id){
                            prodArr[gr_id].splice(i,1);
                            break;
                        }
                    }
                    //Теперь удаляем с экрана
                    loadProds( gr_id );
                }//Иначе ничего не делаем.
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function createOrEditProduct(){
    //Проверяем данные
    var name = $('#product-dialog-prod-name').val();
    var prot = replaceComma($('#product-dialog-prod-prot').val());
    var fat  = replaceComma($('#product-dialog-prod-fat').val());
    var carb = replaceComma($('#product-dialog-prod-carb').val());
    var gi   = +$('#product-dialog-prod-gi').val();
    var weight = calculateString($('#product-dialog-prod-weight').val());
    $('#product-dialog-prod-weight').val(numeral(weight).format('0'));
    var error = "";
    if (name.length===0)     error += "Имя не может быть пустым\n";
    if (prot>weight || prot<0)  error += "Белки введены не корректно\n";
    if (fat>weight || fat<0)    error += "Жиры введены не корректно\n";
    if (carb>weight || carb<0)  error += "Углеводы введены не корректно\n";
    if (gi>100 || gi<0)      error += "ГИ введен не корректно\n";
    if ((fat+prot+carb)>weight) error += "Сумма БЖУ не может превышать вес продукта\nБ:"+prot+" Ж:"+fat+" У:"+carb+ " Вес:"+weight;

    if (error){
        showError(error);
        return;
    }
    //Если сюда попали то ошибки нет - закрываем диалог
    $('#product-dialog').modal('hide');
    //Приводим к весу 100 гр.
    prot *= 100 / weight;
    fat  *= 100 / weight;
    carb *= 100 / weight;

    var gr_id = +$('#product-dialog-select-group').val();
    //тут нужно проверить что мы делали
    var type = $('#product-dialog').data('type');

    if (type==='AP'){
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
                try{
                    if (JSON.parse(data)===1){//Вернуться должна 1
                        if (gr_id in prodArr)       delete prodArr[gr_id];//Чистим группу в которую был добавлен продукт
                        //тут проверяем какая группа выделена, если та же, то перезагружаем её
                        var current_gr_id = +$(".group-item.active").attr("id").substring(2);
                        if (current_gr_id===gr_id){
                            loadProds( gr_id );
                        }else{
                            setTimeout(function(){
                                $('.group-item').removeClass('active');
                                $('#gr'+gr_id).addClass('active');
                                loadProds( gr_id );
                                $('#groups-list').scrollTo('.group-item.active');
                            }, 0);
                        }
                    }else showError("Продукт не был добавлен.");
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    }else if (type==='EP'){
        var pr_id = +$(".prod-item.active").attr("id").substring(2);
        var old_gr_id = +$(".group-item.active").attr("id").substring(2);
        //Удаляем из массива продукты из старой и новой группы
        //Переводим фокус на новую группу
        $.post("online.php?"+getSID(),
        {
            action: 'edit prod', 
            name: name,
            prot: prot,
            fat:  fat,
            carb: carb,
            gi:   gi,
            prid:   pr_id,
            gr_id:gr_id
        },
        function(data, status){
            if (status === "success"){
                try{
                    if (JSON.parse(data)===1){//Вернуться должна 1
                        if (gr_id in prodArr)       delete prodArr[gr_id];//Чистим группу в которую был добавлен продукт
                        if (old_gr_id in prodArr)   delete prodArr[old_gr_id];
                        //тут проверяем какая группа выделена, если та же, то перезагружаем её
                        if (old_gr_id===gr_id){
                            loadProds( gr_id );
                        }else{
                            setTimeout(function(){
                                $('.group-item').removeClass('active');
                                $('#gr'+gr_id).addClass('active');
                                loadProds( gr_id );
                                $('#groups-list').scrollTo('.group-item.active');
                            }, 0);
                        }
                        //Надо переставить фокус на новую группу
                    }else showError("Продукт не был добавлен.");
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    }
}
function moveGroupUp(){
    if ($('.group-item').hasClass('active')){
        //Проверяем не самый ли это верхний элемент и не равен ли id верхней группы 0
        var li_active = $(".group-item.active");
        var lower = +li_active.attr("id").substring(2);
        if (!$('li.group-item').first().hasClass('active')){
            //Теперь смотрим id сверху
            var upper = +li_active.prev().attr("id").substring(2);
            if (upper!==0){
                //Меняем местами
                $.post("online.php?"+getSID(),
                {
                    action: 'swap groups', 
                    lower: lower,
                    upper: upper
                },
                function(data, status){
                    if (status === "success"){
                        try{
                            if (JSON.parse(data)===1){
                                //Теперь двигаем группы
                                li_active.prev('li').before(li_active);
                            }
                        }catch(error){
                            showError(error+'\n'+data);
                        }
                    }else showErrorConnection();
                });
            }
        }
    }
}
function moveGroupDown(){
    if ($('.group-item').hasClass('active')){
        //Проверяем, что группа не последняя и что выделенная группа не с нулевым id
        var li_active = $(".group-item.active");
        var upper = li_active.attr('id').substring(2);
        if (!$('li.group-item').last().hasClass('active') && upper!==0){
            //теперь двигаем вниз
            var lower = +li_active.next().attr("id").substring(2);
            $.post("online.php?"+getSID(),
            {
                action: 'swap groups', 
                lower: lower,
                upper: upper
            },
            function(data, status){
                if (status === "success"){
                    try{
                        if (JSON.parse(data)===1){
                            //Теперь двигаем группы
                            li_active.next('li').after(li_active);
                        }
                    }catch(error){
                        showError(error+'\n'+data);
                    }
                }else showErrorConnection();
            });
        }
    }
}
function addOrEditGroup(){
    var gr_new_name = $('#grp-dlg-name').val();
    if ($('#dlg-add-edit-group').data('type')==='E'){//Значит было редактирование
        if (gr_new_name){
            //Проверяем изменилось ли что то
            var li_active = $(".group-item.active");
            var oldname = li_active.text();
            if (gr_new_name!==oldname){
                var gr_id = +li_active.attr("id").substring(2);
                //Меняем
                $.post("online.php?"+getSID(),
                {
                    action: 'edit group', 
                    grid  : gr_id,
                    grname: gr_new_name
                },
                function(data, status){
                    if (status === "success"){
                        try{
                            if (JSON.parse(data)===1){
                                li_active.text(gr_new_name);
                            }
                        }catch(error){
                            showError(error+'\n'+data);
                        }
                    }else showErrorConnection();
                });
                for (var i=0;i<groups.length;i++){
                    if (gr_id===groups[i]["id"]){
                        groups[i]["name"] = gr_new_name;
                        break;
                    }
                }
            }else{
                showError("Имя не изменилось");
            }
        }else{
            showError("Имя группы не может быть пустым");
        }
    }else{//Создавали новую группу
        $.post("online.php?"+getSID(),
        {
            action: 'add group', 
            grname: gr_new_name
        },
        function(data, status){
            if (status === "success"){
                try{
                    //Нужно получить id группы и добавить ее в список
                    var obj = JSON.parse(data);
                    $("#groups-list").append(
                            "<li id=\"gr"+obj+
                            "\" class=\"list-group-item group-item\">"+
                            gr_new_name+"</li>");
                    $(".group-item").click(loadProdsOnClick);
                    groups[groups.length] = {
                        id : obj,
                        name: gr_new_name,
                        sortind: -1
                    };
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    }
}
function deleteGroup(){
    //Удаляем 
    var li_active = $(".group-item.active");
    var gr_id = +li_active.attr('id').substring(2);
    $.post("online.php?"+getSID(),
    {
        action: 'del group', 
        grid: gr_id
    },
    function(data, status){
        if (status === "success"){
            //Успешно сделали запрос
            //Теперь получим кол-во удаленных групп, если 1, то все успешно
            try{
                if (JSON.parse(data)===1){
                    var new_gr_id = -1;
                    //Сначала переводим курсор вверх
                    //Проверяем: в списке более одного эл и активный не первый
                    if ($('.group-item').length>1 && !$('li.group-item').first().hasClass('active')){
                        li_active.removeClass('active');
                        var prev = li_active.prev();
                        prev.addClass('active');
                        new_gr_id = +prev.attr('id').substring(2);
                    }
                    li_active.remove();
                    //Удаляем из кэша
                    for (var i=0;i<groups.length;i++){
                        if (gr_id===groups[i]["id"]){
                            groups.splice(i,1);
                            break;
                        }
                    }
                    delete prodArr[gr_id];
                    loadProds( new_gr_id );
                }else{
                   showMessage("Удаление не получилось");
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function roundDoseUp(){
    var id = $('#round-weight-product').data('prodId');
    for(var i=0;i<menuArr.length;i++){
        if (id===menuArr[i].id) break;
    }
    var w = +$('button .dlg-round-add-text').text();
    var newW = numeral(menuArr[i].weight+w).format('0');
    $('#mn'+id).find('input').val( newW );
    updateMenuProdOnServer(id, +newW );
    menuArr[i].weight = +newW;
    calcMenu();
}
function roundDoseDown(){
    var id = $('#round-weight-product').data('prodId');
    for(var i=0;i<menuArr.length;i++){
        if (id===menuArr[i].id) break;
    }
    var w = +$('button .dlg-round-substruct-text').text();
    var newW = numeral(menuArr[i].weight-w).format('0');
    $('#mn'+id).find('input').val( newW );
    updateMenuProdOnServer(id,+newW);
    menuArr[i].weight = +newW;
    calcMenu();
}
//drag'n'drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dropMenu(ev) {
    ev.preventDefault();
    var pr_id = +ev.dataTransfer.getData("text").substring(2);
    addProd2Menu(pr_id);
}
function dropGroup(ev) {
    ev.preventDefault();
    var pr_id = +ev.dataTransfer.getData("text").substring(2);
    //проверяем, что нет в принимающей группе
    var gr_id = +ev.target.id.substring(2);
    var gr_id_sel = +$(".group-item.active").attr("id").substring(2);
    if (gr_id===gr_id_sel){//Пытаемся бросить в свою группу
        return;
    }
    $.post("online.php?"+getSID(),
    {
        action: 'product group',
        prid:   pr_id,
        grid:   gr_id
    },function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)===1){//Успешно
                    //Меняем группу
                    //if (gr_id_sel in prodArr)   
                    //Эта группа точно уже загружена, удаляем
                    delete prodArr[gr_id_sel];
                    if (gr_id in prodArr)       delete prodArr[gr_id];
                    $('.group-item').removeClass('active');
                    $('#gr'+gr_id).addClass('active');
                    loadProds(gr_id);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
//drag'n'drop

function fillProductDialogWithGroups(){
    var str = '';
    for(var i=0;i<groups.length;i++){
        if (groups[i]["id"]!==0){
            str += '<option value=\"'+groups[i]["id"]+'\">'+ groups[i]["name"] +'</option>';
        }
    }
    $('#product-dialog-select-group').html(str);
}

var loadProdsOnClick = function(){
        if ($(this).hasClass('active')){
            return;
        }
        $('.group-item').removeClass('active');
        $(this).addClass('active');
        var gr_id = +$(this).attr('id').substring(2);
        loadProds(gr_id );
    };

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
    //Удаляем все из массива меню, чистим меню на сервере, запускаем calcMenu();
    menuArr = [];
    $('#menu-list').empty();
    coefs.sh1=target.sugar;
    coefs.sh2=target.sugar;
    $('#sh1').val(numeral(target.getView(settings.whole,settings.mmol))
            .format(settings.mmol?'0.0':'0'));
    $('#sh2').val(numeral(target.getView(settings.whole,settings.mmol))
            .format(settings.mmol?'0.0':'0'));
    if (settings.timedcoefs){
        //выбираем из массива coefsArr коэф-ты и вставляем их, меняем селект
        var h = getHour();
        $('#coefs-choice').val(h);
        $('#coefs-choice').removeClass('selector-not-in-use');
        $('#k1').val( coefsArr[h].k1 );
        $('#k2').val( coefsArr[h].k2 );
        $('#k3').val( coefsArr[h].k3 );
        storeCoefsAndCalcMenu(false);//А тут sh1 и sh2 перечитывются из полей и записываются в coefs
    }
    calcMenu();
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
    changeMenuSize();
}

function loadProds(gr_id,arg,callback){
    //Проверяем есть ли группа в массиве prodArr
    if (!(gr_id in prodArr)) {
        $.post("online.php?"+getSID(),
        {
            action: 'get prods', 
            grid: gr_id
        },
        function(data, status){
            if (status === "success"){
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
                    //Теперь нужно вызвать callback
                    if (typeof callback==='function'){
                        callback(arg);
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    }else{
        //Здесь уже было, вызываем функцию заполнения
        fillProductList(prodArr[gr_id]);
        if (typeof callback==='function'){
            callback(arg);
        }
    }
}

function fillProductList(prods){
    var pr_list = $("#prods-list");
    //pr_list.empty();
    if (prods.length===0){
        pr_list.html('');
    }else{
        var str = "";
        for(var i=0;i<prods.length;i++){
            var prod = prods[i];
            str += "<li class=\"list-group-item prod-item\" ondragstart=\"drag(event)\" draggable=\"true\" id=\"pr"+
                    prod.id+"\"><h5 class=\"list-group-item-heading\">"+
                    prod.name +
                    "</h5><p class=\"list-group-item-text\">"+
                    '<strong>'+"Б:"+numeral(prod.prot).format('0.0')+
                    " Ж:"+numeral(prod.fat).format('0.0')+
                    " У:"+numeral(prod.carb).format('0.0')+
                    " ГИ:"+numeral(prod.gi).format('0')+'</strong>'+
                    "</p></li>";
        }
        //$("#prodHeader").header("refresh");
        pr_list.html( str );
        pr_list.scrollTop(0);
    }
    $(".prod-item").dblclick(function(){
        var pr_id = +$(this).attr('id').substring(2);
        addProd2Menu( pr_id );
        //loadProds(+gr_id );
    });
    $(".prod-item").click(function(){
        if ($(this).hasClass('active')){
            return;
        }
        $('.prod-item').removeClass('active');
        $(this).addClass('active');
    });
}
function addProd2Menu( pr_id ){
    //Сначала надо проверить нет ли этого продукта в меню.
    var sz=menuArr.length;
    for(var i=0;i<sz;i++){
        if (menuArr[i].idorig===pr_id){
            return;//Уже есть, уходим
        }
    }
    //делаем запись в БД
    $.post("online.php?"+getSID(),
    {
        action: 'add prod2menu',
        prodid: pr_id
    },function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)===1){//Успешно
                    //Перезагружаем меню
                    loadMenu();
                }else{
                    showError(data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function removeProdFromMenu(mn_id){
    $.post("online.php?"+getSID(),
    {
        action: 'remove from menu',
        id    : mn_id
    },
    function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)===1){
                    loadMenu();
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}

function loadMenu(){
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
                $("#k1").val(numeral(coefs.getK1()).format('0.00'));
                $("#k2").val(numeral(coefs.k2).format('0.00'));
                $("#k3").val(numeral(new Sugar(coefs.k3).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
                $("#sh1").val(numeral(new Sugar(coefs.sh1).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
                $("#sh2").val(numeral(new Sugar(coefs.sh2).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
                $("#be").val(numeral(coefs.be).format('0'));

                var sz=obj.menu.length;
                //var str = "";
                menuArr = [];//Пустой массив
                $("#menu-list").empty();
                for(var i=0;i<sz;i++){
                    var prod = new MenuProd(obj.menu[i].name, obj.menu[i].id, 
                    obj.menu[i].weight, 
                    obj.menu[i].prot, 
                    obj.menu[i].fat, 
                    obj.menu[i].carb, 
                    obj.menu[i].gi, 
                    obj.menu[i].idorig );
                    var str = "<li class=\"menu-item list-group-item\" id=\"mn"+
                            prod.id+
                            "\"><div class=\"row\"><div class=\"col-xs-9\">"+
                            "<h5 class=\"list-group-item-heading\"><strong>"+
                            prod.name+ "</strong></h5>"+
                            "<p class=\"list-group-item-text pull-right\" id=\"mn-descr-"+i+"\">"+ //(\d+(\.|,)?\d+)((\+|-){1}\d+(\.|,)?\d+)?
                            "</p></div><div class=\"col-xs-2 no-padding\"><input type=\"tel\" class=\"form-control weight-input\" value="+
                            numeral(prod.weight).format('0')+
                            "></div>"+
                            "<div class=\"col-xs-1 no-padding\"><a href=\"#\" class=\"btn btn-default btn-xs remove-item-from-menu\">"+
                            "<span class=\"glyphicon glyphicon-remove\"></span></a></div></div></li>";
                    menuArr[menuArr.length] = prod;
                    $("#menu-list").append(str);
                }
                $(".remove-item-from-menu").click(function(){
                    var mn_id = +$(this).parents('li').attr('id').substring(2);
                    removeProdFromMenu(mn_id);
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
                        if (menuArr[i].weight!==weight){//Вес действительно изменился
                            menuArr[i].weight = weight;
                            updateMenuProdOnServer(pr_id,weight);//Делаем в отдельной функции, т.к. она будет выполнена асинхронно.
                            calcMenu();
                        }
                    }
                });
                $('.remove-item-from-menu').on({
                    focus : function(){
                        var pr_id = +$(this).parents('li').attr('id').substring(2);
                        for(var i=0;i<menuArr.length;i++){
                            if (menuArr[i].id===pr_id) break;
                        }
                        if (i===(menuArr.length-1)){
                            $('#k1').focus();
                        }else{//Ищем элемент, которому можно передать
                            var f_id = menuArr[i+1].id;
                            $('#mn'+f_id).find('input').focus();
                        }
                    }
                });
                setTimeout(changeMenuSize, 0);
                //Теперь вычисляем
                calcMenu();
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function changeGroupsProdsPaneSize(){
    var viewH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var h_busy = $('#navbar').outerHeight() + $('#groups-buttons').outerHeight();
    $('#groups-list').height(  viewH - h_busy - 45 );
    $('#prods-list').height(  viewH - h_busy - $('#navBarSearchForm').outerHeight() - 45 );
    if (settings.calorlimit>0){
        //34 задано жестко, т.к. размер меняется во время загрузки
        $('#calor-progressbar').outerWidth( $('#top-menu').width() - 34*3 - 12 );
    }
}
function changeMenuSize(){
    var viewH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var h_busy = $('#navbar').outerHeight() + $('#top-menu').outerHeight() +   
            $('#results-view').outerHeight() + $('#ruler').outerHeight();
    var h_needed = 0;
    
    $('.menu-item').each(function(){
       h_needed += $(this).outerHeight();
    });
    
    if (h_needed<350){
        h_needed = 350;
    }
    
    if (h_needed>(viewH - h_busy - 65)){
        h_needed = viewH - h_busy - 65;
    }
    $('#menu-list').height( h_needed  );
    
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
function createDescription(acr,value,title){
    return '<sub>'+acr+'</sub><strong class="dose-res-bigger" title="'+title+'">'+value+'</strong>';
}
function calcMenu(){
   if ((typeof menuArr === 'undefined') || (typeof coefs === 'undefined')) return;
   product = new MenuProd("",0,0,0,0,0, 50);
   var l = menuArr.length;
   var coefs_no_sh = new Coef();
   coefs_no_sh.clone( coefs );
   coefs_no_sh.sh2 = coefs_no_sh.sh1;
    
   for(var i=0;i<l;i++){
        var tmp = menuArr[i];
        //Вот тут нужно заполнять информационную строку БЖУ и т.д.
        var st = '';
        if (settings.menuinfo & 1) st += createDescription('Б:',numeral(tmp.getProt()).format('0.0'),'Количество белка в гр.') +' ';
        if (settings.menuinfo & 2) st += createDescription('Ж:',numeral(tmp.getFat()).format('0.0'),'Количество жиров в гр.')+' ';
        if (settings.menuinfo & 4) st += createDescription('У',numeral(tmp.getCarb()).format('0.0'),'Количество углеводов в гр.')+' ';
        if (settings.menuinfo & 8) st += createDescription('ХЕ:',numeral( tmp.getCarb()/coefs.be ).format('0.0'),'Количество ХЕ') +' ';
        if (settings.menuinfo & 16) st += createDescription('Д',numeral(new Dose(tmp,coefs_no_sh).getWholeD()).format('0.0'),
                'Доза на данный продукт')+' ';
        if (settings.menuinfo & 32) st += createDescription('ГИ:',numeral(tmp.gi).format('0'),'Гликемический индекс продукта')+' ';
        if (settings.menuinfo & 64) st += createDescription('ГН:',numeral(tmp.getGLIndx()).format('0'),'Гликемическая нагрузка продукта')+' ';
        if (settings.menuinfo & 128) st += createDescription('ККАЛ',numeral(tmp.getCalor()).format('0'),'Калорийность продукта');
        $('#mn-descr-'+i).html(st);
        
        product.addProduct(tmp);
   }
   var dose = new Dose(product, coefs);
   //заполняем попап
    $('.dose-dps').text(numeral(dose.getDPS()).format('0.0'));
    $('#dose-carb-q').text(numeral(dose.getQCarbD()).format('0.0'));
    $('#dose-carb-sl').text(numeral(dose.getSlCarbD()).format('0.0'));
    $('.dose-protfat').text(numeral(dose.getProtFatD()).format('0.0'));
    
    $('#dose-quick').text(numeral(dose.getDPS()+dose.getQCarbD()).format('0.0'));
    $('#dose-slow').text(numeral(dose.getSlCarbD()+dose.getProtFatD()).format('0.0'));
    $('#dose-whole').text(numeral(dose.getWholeD()).format('0.0'));
    
    $('#dose-carb').text(numeral(dose.getCarbD()).format('0.0'));
    
    $('#info-prot').text(numeral(product.getProt()).format('0.0'));
    $('#info-fat').text(numeral(product.getFat()).format('0.0'));
    $('#info-carb').text(numeral(product.getCarb()).format('0.0'));
    $('#info-be-amount').text(numeral( product.getCarb()/coefs.be).format('0.0'));
    $('#info-gi').text(numeral(product.gi).format('0'));
    $('#info-gn').text(numeral(product.getGLIndx()).format('0'));
    $('#info-calor').text(numeral(product.getCalor()).format('0'));
    
    var c_prot = Math.round( 100*product.getCalorByProt()/product.getCalor() );
    var c_fat = Math.round( 100*product.getCalorByFat()/product.getCalor() );
    var c_carb = 100 - c_prot - c_fat;
    
    $('#ruler-prot').width(''+c_prot+'%');
    $('#ruler-prot').text('Б:'+c_prot+'%');
    $('#ruler-fat').width(''+c_fat+'%');
    $('#ruler-fat').text('Ж:'+c_fat+'%');
    $('#ruler-carb').width(''+c_carb+'%');
    $('#ruler-carb').text('У:'+c_carb+'%');
    
    if (settings.calorlimit>0){
        updateCalorProgressBar();
    }
}

function createProductFromMenu(){
        if (menuArr.length===0){
        return;
    }
    //Заполняем диалог
    $('#product-dialog').data('type','AP');
    $('#product-dialog-header').text('Новый продукт из меню');
    $('#product-dialog-btn-ok').text('Добавить');
    $('#product-dialog-prod-name').val("");
    $('#product-dialog-prod-weight').val(numeral(product.weight).format('0'));
    $('#product-dialog-prod-prot').val(numeral(product.getProt()).format('0.0'));
    $('#product-dialog-prod-fat').val(numeral(product.getFat()).format('0.0'));
    $('#product-dialog-prod-carb').val(numeral(product.getCarb()).format('0.0'));
    $('#product-dialog-prod-gi').val(numeral(product.gi).format('0'));
    fillProductDialogWithGroups();

    $("#product-dialog").modal();
}

function storeMenuToDiary(){
    if ((typeof menuArr === 'undefined') || (typeof coefs === 'undefined')) return;
    if (menuArr.length===0) return;
    var dt = new Date();
    $('#event-dlg-remark').val('');
    $('#event-dlg-date').val(getDateString(dt));
    $('#event-dlg-time').val(getTimeString(dt));
    
    $('#event-dialog').modal();
}

function reallyStoreMenuToDiary(){
    var rem = $('#event-dlg-remark').val();
    if (rem===null){
        rem = '';
    }
    var date = $('#event-dlg-date').val();
    var time = $('#event-dlg-time').val();
    
    if (date.length===0 || time.length===0){
        alert('Какое-то поле не заполнено!');
        return;
    }
    $('#event-dialog').modal('hide');
    
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
                    var message = 'Меню было успешно сохранено в дневник!';
                }else{
                    message = 'Сохранить меню не получилось';
                }
                $('#message-alert-text').text(message);
                $('#message-alert').show();
                $("#message-alert").delay(1000).addClass("in").fadeOut(1500);
            }catch (error){
                showError(error+'\n'+data);
            }
        }else{
            showErrorConnection();
        }
    });
}

function editProduct(){
    if (!$('#prods-list li').hasClass('active') || 
            !$('#groups-list li').hasClass('active')){
        return;
    }
    var gr_id = +$(".group-item.active").attr("id").substring(2);
    if (gr_id===0){//Частоиспользуемые
        return;
    }
    var pr_id = +$(".prod-item.active").attr("id").substring(2);
    //Достаем продукт из массива
    var prod;// = prodArr[gr_id];
    for(var i=0;i<prodArr[gr_id].length;i++){
        if (pr_id===prodArr[gr_id][i].id){
            prod = prodArr[gr_id][i];
            break;
        }
    }
    //Заполняем диалог
    $('#product-dialog').data('type','EP');
    $('#product-dialog-header').text('Изменить продукт');
    $('#product-dialog-btn-ok').text('Изменить');
    $('#product-dialog-prod-name').val(prod.name);
    $('#product-dialog-prod-weight').val(numeral(100).format('1'));
    $('#product-dialog-prod-prot').val(numeral(prod.prot).format('0.0'));
    $('#product-dialog-prod-fat').val(numeral(prod.fat).format('0.0'));
    $('#product-dialog-prod-carb').val(numeral(prod.carb).format('0.0'));
    $('#product-dialog-prod-gi').val(numeral(prod.gi).format('0'));
    fillProductDialogWithGroups();

    //Теперь меняем селектор на группу
    $('#product-dialog-select-group').val(gr_id);
    $("#product-dialog").modal();
}
function createProduct(){
    var gr_id = 0;
    if ($('#groups-list li').hasClass('active')){
        gr_id = +$(".group-item.active").attr("id").substring(2);
    }
    //Заполняем диалог
    $('#product-dialog').data('type','AP');
    $('#product-dialog-header').text('Новый продукт');
    $('#product-dialog-btn-ok').text('Добавить');
    $('#product-dialog-prod-name').val("Новый");
    $('#product-dialog-prod-weight').val(numeral(100).format('0.0'));
    $('#product-dialog-prod-prot').val(numeral(0).format('0.0'));
    $('#product-dialog-prod-fat').val(numeral(0).format('0.0'));
    $('#product-dialog-prod-carb').val(numeral(0).format('0.0'));
    $('#product-dialog-prod-gi').val(numeral(50).format('0'));
    fillProductDialogWithGroups();

    //Теперь меняем селектор на группу
    if (gr_id!==0) $('#product-dialog-select-group').val(gr_id);

    $("#product-dialog").modal();
}
function roundDose(id){
    var sz = menuArr.length;
    if (sz===0) return;
    for(var i=0;i<sz;i++){
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
        $('#dlg-round-weight-substruct').addClass('disabled');
    }else{
        $('#dlg-round-weight-substruct').removeClass('disabled');
    }
    
    $('#dlg-round-prod-name').html(prod.name);
    $('#dlg-round-weight-current').text(numeral(prod.weight).format('0.0'));
    $('.dlg-round-add-text').text(numeral(wUp).format('0.0'));
    $('.dlg-round-substruct-text').text(numeral(wDown).format('0.0'));
    
    $('#round-weight-product').data('prodId',id);
    $('#round-weight-product').modal();
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
function storeCoefsAndCalcMenu(shouldCalcMenu=true){
    //Нужно считать значение, сохранить на сервер, пересчитать меню
    var s = new Sugar(5.6);
    coefs.k2 = replaceComma($('#k2').val());
    //Преобразуем из вида в СК
    s.setSugar(replaceComma($('#k3').val()),settings.whole, settings.mmol);
    coefs.k3 = s.sugar;
    s.setSugar(replaceComma($('#sh1').val()),settings.whole, settings.mmol);
    coefs.sh1 = s.sugar;
    s.setSugar(replaceComma($('#sh2').val()),settings.whole, settings.mmol);
    coefs.sh2 = s.sugar;
    coefs.be = replaceComma($('#be').val());
    coefs.setK1(replaceComma($('#k1').val()));

    if(shouldCalcMenu){
        calcMenu();
    }
    //теперь надо слить эти данные на сервер
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
    $('#calor-eaten').text( numeral(settings.eaten).format('0')+'+'+
            numeral(product.getCalor()).format('0'));
    //Заполняем градусник
    var width;
    var res = $('#calor-progressbar');
    if ((settings.eaten+product.getCalor())>settings.calorlimit){
        width = 100;
        //Тут два варианта: уже превысили или собираемся превысить
        if (settings.eaten<settings.calorlimit){//Собираемся превышать
            var green_stop = 100 * settings.eaten / settings.calorlimit;
            res.css('background-image',
            'linear-gradient(to right, #55E7A4 0%, #55E7A4 '+ green_stop
                    +'%, #DFA69C '+green_stop+'%, #DFA69C 100%)');
        }else{ //Превысили
            res.css('background-image',
            'linear-gradient(to right, #DFA69C, #DFA69C');
        }
    }else{
        //Не превысили
        width = 100 * (settings.eaten+product.getCalor()) / settings.calorlimit;
        var green_stop = 100 * settings.eaten / (settings.eaten+product.getCalor());
        res.css('background-image',
            'linear-gradient(to right, #55E7A4 0%, #55E7A4 '+ green_stop
                    +'%, #6DD2E3 '+green_stop+'%, #6DD2E3 100%)');
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
                showError(error+'\n'+data);
            }
        }else{
            showErrorConnection();
        }
    });
}